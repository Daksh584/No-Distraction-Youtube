const jwt = require('jsonwebtoken');
const Room = require('../models/Room');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Track which socket is in which room
const socketRooms = new Map(); // socketId -> { roomCode, userId, userName }

// Track active sockets per user to handle refresh vs real leave
const userSockets = new Map(); // `${roomCode}:${userId}` -> Set<socketId>

function registerRoomHandlers(io, socket) {

  // --- JOIN ROOM ---
  socket.on('room:join', async ({ roomCode, token }) => {
    try {
      // Verify auth
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
      if (!room) {
        socket.emit('room:error', { message: 'Room not found' });
        return;
      }

      // Always look up the user's real name from the DB
      const user = await User.findById(userId);
      const userName = user ? user.name : 'Anonymous';

      // Re-add to participants if they were removed (e.g. after refresh)
      const alreadyIn = room.participants.some(
        (p) => p.userId.toString() === userId
      );
      if (!alreadyIn) {
        const isHost = room.host.toString() === userId;
        room.participants.push({
          userId,
          name: userName,
          isHost,
        });
        await room.save();
      }

      // Track this socket for this user in this room
      const userKey = `${roomCode}:${userId}`;
      if (!userSockets.has(userKey)) {
        userSockets.set(userKey, new Set());
      }
      userSockets.get(userKey).add(socket.id);

      // Join Socket.IO room
      socket.join(roomCode);
      socketRooms.set(socket.id, { roomCode, userId, userName });

      // Re-fetch room to get updated participants
      const updatedRoom = await Room.findOne({ roomCode: roomCode.toUpperCase() });

      // Send current state to the joining user
      socket.emit('room:state', {
        videoId: updatedRoom.videoId,
        videoTitle: updatedRoom.videoTitle,
        videoState: updatedRoom.videoState,
        participants: updatedRoom.participants,
      });

      // Notify others (only if this is their first socket, not a refresh)
      if (userSockets.get(userKey).size === 1) {
        socket.to(roomCode).emit('room:user-joined', {
          userId,
          name: userName,
          timestamp: new Date().toISOString(),
        });
      }

      console.log(`👥 ${userName} joined room ${roomCode}`);
    } catch (error) {
      console.error('room:join error:', error.message);
      socket.emit('room:error', { message: 'Failed to join room' });
    }
  });

  // --- LEAVE ROOM (explicit) ---
  socket.on('room:leave', async () => {
    await handleLeave(io, socket, true);
  });

  // --- VIDEO PLAY ---
  socket.on('video:play', async ({ currentTime }) => {
    const info = socketRooms.get(socket.id);
    if (!info) return;

    // Update DB
    await Room.updateOne(
      { roomCode: info.roomCode },
      {
        'videoState.isPlaying': true,
        'videoState.currentTime': currentTime,
        'videoState.lastUpdated': new Date(),
      }
    );

    // Broadcast to others
    socket.to(info.roomCode).emit('video:play', {
      currentTime,
      userId: info.userId,
      userName: info.userName,
    });
  });

  // --- VIDEO PAUSE ---
  socket.on('video:pause', async ({ currentTime }) => {
    const info = socketRooms.get(socket.id);
    if (!info) return;

    await Room.updateOne(
      { roomCode: info.roomCode },
      {
        'videoState.isPlaying': false,
        'videoState.currentTime': currentTime,
        'videoState.lastUpdated': new Date(),
      }
    );

    socket.to(info.roomCode).emit('video:pause', {
      currentTime,
      userId: info.userId,
      userName: info.userName,
    });
  });

  // --- VIDEO SEEK ---
  socket.on('video:seek', async ({ currentTime }) => {
    const info = socketRooms.get(socket.id);
    if (!info) return;

    await Room.updateOne(
      { roomCode: info.roomCode },
      {
        'videoState.currentTime': currentTime,
        'videoState.lastUpdated': new Date(),
      }
    );

    socket.to(info.roomCode).emit('video:seek', {
      currentTime,
      userId: info.userId,
      userName: info.userName,
    });
  });

  // --- VIDEO CHANGE (host only) ---
  socket.on('video:change', async ({ videoId, videoTitle }) => {
    const info = socketRooms.get(socket.id);
    if (!info) return;

    const room = await Room.findOne({ roomCode: info.roomCode });
    if (!room || room.host.toString() !== info.userId) {
      socket.emit('room:error', { message: 'Only the host can change the video' });
      return;
    }

    room.videoId = videoId;
    room.videoTitle = videoTitle || '';
    room.videoState = { isPlaying: false, currentTime: 0, lastUpdated: new Date() };
    await room.save();

    // Broadcast to everyone including sender
    io.to(info.roomCode).emit('video:changed', {
      videoId,
      videoTitle,
      userName: info.userName,
    });
  });

  // --- CHAT MESSAGE ---
  socket.on('chat:message', ({ text }) => {
    const info = socketRooms.get(socket.id);
    if (!info) return;

    const message = {
      id: Date.now().toString(),
      userId: info.userId,
      userName: info.userName,
      text,
      timestamp: new Date().toISOString(),
      type: 'user',
    };

    // Broadcast to everyone in the room
    io.to(info.roomCode).emit('chat:message', message);
  });

  // --- AI CHAT REQUEST ---
  socket.on('chat:ai-request', async ({ text, videoTranscript, videoTitle }) => {
    const info = socketRooms.get(socket.id);
    if (!info) return;

    // Show the user's @ai message first
    const userMessage = {
      id: Date.now().toString(),
      userId: info.userId,
      userName: info.userName,
      text,
      timestamp: new Date().toISOString(),
      type: 'user',
    };
    io.to(info.roomCode).emit('chat:message', userMessage);

    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_API_KEY not set in backend .env');
      }

      console.log('🤖 AI request from', info.userName, '- question:', text.substring(0, 50));

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Strip the @ai prefix
      const question = text.replace(/^@ai\s*/i, '').trim();
      const prompt = `You are an AI study assistant. Students are watching a YouTube video together and need help. Be concise and helpful.\n\nVideo title: ${videoTitle || 'Unknown'}\nTranscript: ${videoTranscript ? videoTranscript.substring(0, 3000) : 'No transcript available.'}\n\nStudent question: ${question}`;

      // Try primary model, fallback on error
      let responseText;
      const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-flash-latest', 'gemini-pro'];
      for (let i = 0; i < models.length; i++) {
        const modelName = models[i];
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
          break; // success
        } catch (modelErr) {
          console.log(`⚠️ Model ${modelName} failed:`, modelErr.message);
          if (i === models.length - 1) {
            throw modelErr; // rethrow if all models failed
          }
        }
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        userId: 'ai-bot',
        userName: 'AI Assistant',
        text: responseText,
        timestamp: new Date().toISOString(),
        type: 'ai',
      };

      io.to(info.roomCode).emit('chat:message', aiMessage);
      console.log('🤖 AI response sent to room', info.roomCode);
    } catch (error) {
      console.error('AI request error:', error.message);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        userId: 'ai-bot',
        userName: 'AI Assistant',
        text: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date().toISOString(),
        type: 'ai',
      };
      io.to(info.roomCode).emit('chat:message', errorMessage);
    }
  });

  // --- DISCONNECT (browser close, refresh, etc.) ---
  socket.on('disconnect', async () => {
    await handleLeave(io, socket, false);
  });
}

async function handleLeave(io, socket, isExplicit) {
  const info = socketRooms.get(socket.id);
  if (!info) return;

  socket.leave(info.roomCode);
  socketRooms.delete(socket.id);

  // Remove this socket from the user's socket set
  const userKey = `${info.roomCode}:${info.userId}`;
  const sockets = userSockets.get(userKey);
  if (sockets) {
    sockets.delete(socket.id);

    // Only remove from DB and notify if user has NO more active sockets
    // (i.e., they truly left, not just refreshed)
    if (sockets.size === 0 || isExplicit) {
      userSockets.delete(userKey);

      if (isExplicit) {
        // Only remove from participants on explicit leave (clicking "Leave")
        try {
          await Room.updateOne(
            { roomCode: info.roomCode },
            { $pull: { participants: { userId: info.userId } } }
          );
        } catch (e) {
          // ignore cleanup errors
        }
      }

      // Notify others
      io.to(info.roomCode).emit('room:user-left', {
        userId: info.userId,
        name: info.userName,
        timestamp: new Date().toISOString(),
      });

      console.log(`👋 ${info.userName} left room ${info.roomCode} (explicit: ${isExplicit})`);
    }
  }
}

module.exports = { registerRoomHandlers };
