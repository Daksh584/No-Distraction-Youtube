const express = require('express');
const authMiddleware = require('../middleware/auth');
const Room = require('../models/Room');
const User = require('../models/User');

const router = express.Router();

// POST /api/rooms/create — Create a new study room
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, videoId, videoTitle } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const roomCode = await Room.generateCode();

    const room = await Room.create({
      roomCode,
      name: name.trim(),
      host: user._id,
      videoId: videoId || null,
      videoTitle: videoTitle || '',
      participants: [{
        userId: user._id,
        name: user.name,
        isHost: true,
      }],
    });

    res.status(201).json({
      roomCode: room.roomCode,
      name: room.name,
      videoId: room.videoId,
      videoTitle: room.videoTitle,
      host: { id: user._id, name: user.name },
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
});

// GET /api/rooms/:code — Get room details
router.get('/:code', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      roomCode: room.roomCode,
      name: room.name,
      videoId: room.videoId,
      videoTitle: room.videoTitle,
      host: room.host,
      participants: room.participants,
      videoState: room.videoState,
      maxParticipants: room.maxParticipants,
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Failed to get room', error: error.message });
  }
});

// POST /api/rooms/:code/join — Join a room
router.post('/:code/join', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({ message: 'Room is full' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in the room
    const alreadyIn = room.participants.some(
      (p) => p.userId.toString() === user._id.toString()
    );

    if (!alreadyIn) {
      room.participants.push({
        userId: user._id,
        name: user.name,
        isHost: false,
      });
      await room.save();
    }

    res.json({
      roomCode: room.roomCode,
      name: room.name,
      videoId: room.videoId,
      videoTitle: room.videoTitle,
      host: room.host,
      participants: room.participants,
      videoState: room.videoState,
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Failed to join room', error: error.message });
  }
});

// DELETE /api/rooms/:code — Delete room (host only)
router.delete('/:code', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the host can delete the room' });
    }

    await Room.deleteOne({ _id: room._id });
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Failed to delete room', error: error.message });
  }
});

module.exports = router;
