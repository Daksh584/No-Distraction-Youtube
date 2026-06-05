"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useSocket } from "@/hooks/useSocket";
import SyncedVideoPlayer from "@/components/SyncedVideoPlayer";
import RoomChat from "@/components/RoomChat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface Participant {
  userId: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  type: "user" | "ai" | "system";
}

export default function StudyRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params.roomCode as string).toUpperCase();
  const { socket, isConnected, emit, on, off } = useSocket();

  const [roomName, setRoomName] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoTranscript, setVideoTranscript] = useState("");

  // Fetch room details
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/study-room");
          return;
        }

        const res = await axios.get(`${API_URL}/api/rooms/${roomCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRoomName(res.data.name);
        setVideoId(res.data.videoId);
        setVideoTitle(res.data.videoTitle);
        setParticipants(res.data.participants);

        // Get current user ID from token
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id);
        setIsHost(res.data.host.toString() === payload.id);
      } catch (err: any) {
        setError(err.response?.data?.message || "Room not found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomCode, router]);

  // Fetch transcript and title when video changes
  useEffect(() => {
    if (!videoId) return;

    // Fetch Title if empty
    const fetchVideoDetails = async () => {
      const apiKey = process.env.NEXT_PUBLIC_YT_KEY;
      if (!apiKey || videoTitle) return;

      try {
        const titleResponse = await axios.get(
          "https://www.googleapis.com/youtube/v3/videos",
          {
            params: {
              part: "snippet",
              id: videoId,
              key: apiKey,
            },
          }
        );
        const titleData = titleResponse.data;
        if (titleData.items && titleData.items.length > 0) {
          const snippet = titleData.items[0].snippet;
          setVideoTitle(snippet.title);
          
          // Save to history
          const token = localStorage.getItem("token");
          if (token) {
            try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
              await axios.post(
                `${API_URL}/api/history`,
                { videoId, title: snippet.title, channelTitle: snippet.channelTitle },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (err) {
              console.error("Failed to save history", err);
            }
          }

          // Also update the backend so others get the title when joining
          if (isHost) {
            emit("video:change", { videoId, videoTitle: snippet.title });
          }
        }
      } catch (error) {
        console.error("Error fetching video details:", error);
      }
    };

    const fetchTranscript = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/${videoId}`);
        if (response.data && !response.data.error) {
          const transcriptText = response.data
            .map((item: any) => item.text)
            .join(" ");
          setVideoTranscript(transcriptText);
        }
      } catch (error) {
        console.warn("Could not fetch transcript:", error);
        setVideoTranscript("");
      }
    };

    if (!videoTitle) fetchVideoDetails();
    fetchTranscript();
  }, [videoId, videoTitle, isHost, emit]);

  // Socket.IO connection
  useEffect(() => {
    if (!socket || !isConnected) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    emit("room:join", { roomCode, token });

    // Room state (on join)
    const handleState = (data: any) => {
      if (data.videoId) setVideoId(data.videoId);
      if (data.videoTitle) setVideoTitle(data.videoTitle);
      if (data.participants) setParticipants(data.participants);

      // Sync video position
      if (data.videoState && data.videoId) {
        setTimeout(() => {
          const player = (window as any).__syncedPlayer;
          if (player) {
            if (data.videoState.isPlaying) {
              player.playAt(data.videoState.currentTime);
            } else {
              player.seekTo(data.videoState.currentTime);
            }
          }
        }, 1000);
      }
    };

    const handleUserJoined = (data: any) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, name: data.name, isHost: false, joinedAt: data.timestamp }];
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          userId: "system",
          userName: "System",
          text: `${data.name} joined the room`,
          timestamp: data.timestamp,
          type: "system",
        },
      ]);
    };

    const handleUserLeft = (data: any) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          userId: "system",
          userName: "System",
          text: `${data.name} left the room`,
          timestamp: data.timestamp,
          type: "system",
        },
      ]);
    };

    const handleVideoPlay = (data: any) => {
      const player = (window as any).__syncedPlayer;
      if (player) player.playAt(data.currentTime);
    };

    const handleVideoPause = (data: any) => {
      const player = (window as any).__syncedPlayer;
      if (player) player.pauseAt(data.currentTime);
    };

    const handleVideoSeek = (data: any) => {
      const player = (window as any).__syncedPlayer;
      if (player) player.seekTo(data.currentTime);
    };

    const handleVideoChanged = (data: any) => {
      setVideoId(data.videoId);
      setVideoTitle(data.videoTitle);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          userId: "system",
          userName: "System",
          text: `${data.userName} changed the video`,
          timestamp: new Date().toISOString(),
          type: "system",
        },
      ]);
    };

    const handleChatMessage = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleError = (data: any) => {
      console.error("Room error:", data.message);
    };

    on("room:state", handleState);
    on("room:user-joined", handleUserJoined);
    on("room:user-left", handleUserLeft);
    on("video:play", handleVideoPlay);
    on("video:pause", handleVideoPause);
    on("video:seek", handleVideoSeek);
    on("video:changed", handleVideoChanged);
    on("chat:message", handleChatMessage);
    on("room:error", handleError);

    return () => {
      emit("room:leave");
      off("room:state");
      off("room:user-joined");
      off("room:user-left");
      off("video:play");
      off("video:pause");
      off("video:seek");
      off("video:changed");
      off("chat:message");
      off("room:error");
    };
  }, [socket, isConnected, roomCode, emit, on, off]);

  // Handlers
  const handleVideoPlay = useCallback(
    (currentTime: number) => emit("video:play", { currentTime }),
    [emit]
  );
  const handleVideoPause = useCallback(
    (currentTime: number) => emit("video:pause", { currentTime }),
    [emit]
  );
  const handleVideoSeek = useCallback(
    (currentTime: number) => emit("video:seek", { currentTime }),
    [emit]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      if (text.toLowerCase().startsWith("@ai")) {
        emit("chat:ai-request", { text, videoTranscript, videoTitle });
      } else {
        emit("chat:message", { text });
      }
    },
    [emit, videoTranscript, videoTitle]
  );

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/study-room?join=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
      /(?:youtu\.be\/)([^?\s]+)/,
      /(?:youtube\.com\/embed\/)([^?\s]+)/,
      /(?:youtube\.com\/shorts\/)([^?\s]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  };

  const handleChangeVideo = () => {
    const newVideoId = extractVideoId(videoUrlInput);
    if (!newVideoId) return;
    emit("video:change", { videoId: newVideoId, videoTitle: "" });
    setVideoUrlInput("");
  };

  const handleLeaveRoom = () => {
    emit("room:leave");
    router.push("/study-room");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary-500"></span>
          <p className="mt-4 text-base-content/60">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="font-poppins font-bold text-2xl text-base-content mb-2">{error}</h2>
          <button onClick={() => router.push("/study-room")} className="btn gradient-primary text-white border-0 rounded-xl mt-4">
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 animate-fade-in">
      {/* Room Header */}
      <div className="glass-strong rounded-2xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="font-poppins font-bold text-lg gradient-text">{roomName}</h1>
            <div className="flex items-center gap-2 text-xs text-base-content/50">
              <span className="font-mono bg-base-200/80 px-2 py-0.5 rounded">{roomCode}</span>
              <span>•</span>
              <span>{participants.length} participant{participants.length !== 1 ? "s" : ""}</span>
              {!isConnected && (
                <>
                  <span>•</span>
                  <span className="text-warning flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
                    Reconnecting...
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyInvite}
            className={`btn btn-sm gap-1 rounded-xl transition-all ${
              copied ? "btn-success text-white" : "btn-ghost"
            }`}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Invite
              </>
            )}
          </button>
          <button
            onClick={handleLeaveRoom}
            className="btn btn-sm btn-error btn-outline rounded-xl gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ height: "calc(100vh - 120px)" }}>
        {/* Left: Video */}
        <div className="flex-1 flex flex-col min-w-0">
          {videoId ? (
            <SyncedVideoPlayer
              videoId={videoId}
              isHost={isHost}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onSeek={handleVideoSeek}
            />
          ) : (
            <div className="glass-strong rounded-2xl flex-1 flex items-center justify-center min-h-[300px]">
              <div className="text-center p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-base-content/50 font-medium mb-1">No video loaded</p>
                <p className="text-sm text-base-content/30">
                  {isHost ? "Paste a YouTube link below to get started" : "Waiting for the host to load a video..."}
                </p>
              </div>
            </div>
          )}

          {/* Host: Change video */}
          {isHost && (
            <div className="mt-3 glass rounded-xl p-3 flex gap-2">
              <input
                type="text"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="Paste YouTube link to change video..."
                className="input input-sm input-bordered flex-1 bg-base-200/50 border-base-content/10 focus:border-primary-500 rounded-lg text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleChangeVideo()}
              />
              <button
                onClick={handleChangeVideo}
                disabled={!videoUrlInput || !extractVideoId(videoUrlInput)}
                className="btn btn-sm gradient-primary text-white border-0 rounded-lg disabled:opacity-50"
              >
                Load
              </button>
            </div>
          )}
        </div>

        {/* Right: Participants + Chat */}
        <div className="lg:w-96 w-full flex flex-col glass-strong rounded-2xl overflow-hidden" style={{ minHeight: "400px" }}>
          {/* Participants */}
          <div className="p-3 border-b border-base-content/10">
            <h3 className="font-poppins font-bold text-sm text-base-content/70 mb-2">
              Participants ({participants.length}/10)
            </h3>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center gap-1.5 bg-base-200/50 rounded-full px-2.5 py-1"
                >
                  <div className="relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      p.isHost
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                        : "bg-gradient-to-br from-primary-500 to-accent-500"
                    }`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-base-100"></div>
                  </div>
                  <span className="text-xs font-medium text-base-content/80 max-w-[80px] truncate">
                    {p.name}
                  </span>
                  {p.isHost && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full font-medium">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <RoomChat
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
