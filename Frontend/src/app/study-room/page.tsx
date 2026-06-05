"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function StudyRoomLobby() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [roomName, setRoomName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Auto-fill join code from invite link
    const code = searchParams.get("join");
    if (code) {
      setJoinCode(code.toUpperCase());
    }
  }, [searchParams]);

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    // Handle various YouTube URL formats
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
    // Maybe it's already just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  };

  const handleCreate = async () => {
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    const videoId = extractVideoId(videoUrl);

    setIsCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/rooms/create`,
        {
          name: roomName.trim(),
          videoId,
          videoTitle: "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push(`/study-room/${res.data.roomCode}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || joinCode.trim().length !== 6) {
      setError("Please enter a valid 6-character room code");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const code = joinCode.trim().toUpperCase();

      // Validate room exists
      await axios.get(`${API_URL}/api/rooms/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Join the room
      await axios.post(
        `${API_URL}/api/rooms/${code}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push(`/study-room/${code}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Room not found");
    } finally {
      setIsJoining(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="font-poppins font-bold text-2xl gradient-text mb-2">Login Required</h2>
          <p className="text-base-content/60 mb-6">You need to be logged in to create or join study rooms.</p>
          <button
            onClick={() => router.push("/")}
            className="btn gradient-primary text-white border-0 rounded-xl"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-poppins font-bold text-4xl sm:text-5xl gradient-text mb-3">
            Study Together
          </h1>
          <p className="text-base-content/60 text-lg max-w-lg mx-auto">
            Create or join a room to watch YouTube videos in sync with friends
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="alert alert-error shadow-lg rounded-xl text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <div className="glass-strong rounded-3xl p-8 shadow-xl hover-lift transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h2 className="font-poppins font-bold text-xl text-base-content">Create Room</h2>
                <p className="text-sm text-base-content/50">Start a new study session</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-base-content/70 mb-1 block">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., DSA Grind Session"
                  className="input input-bordered w-full bg-base-200/50 border-base-content/10 focus:border-primary-500 rounded-xl"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/70 mb-1 block">
                  YouTube Video URL <span className="text-base-content/30">(optional)</span>
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste a YouTube link..."
                  className="input input-bordered w-full bg-base-200/50 border-base-content/10 focus:border-primary-500 rounded-xl"
                />
                {videoUrl && extractVideoId(videoUrl) && (
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Valid YouTube link detected
                  </p>
                )}
                {videoUrl && !extractVideoId(videoUrl) && (
                  <p className="text-xs text-error mt-1">Invalid YouTube URL</p>
                )}
              </div>

              <button
                onClick={handleCreate}
                disabled={isCreating || !roomName.trim()}
                className="btn w-full gradient-primary text-white border-0 rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                {isCreating ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Room
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="glass-strong rounded-3xl p-8 shadow-xl hover-lift transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-green-500 flex items-center justify-center shadow-glow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-poppins font-bold text-xl text-base-content">Join Room</h2>
                <p className="text-sm text-base-content/50">Enter a room code</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-base-content/70 mb-1 block">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="e.g., X7K2M9"
                  className="input input-bordered w-full bg-base-200/50 border-base-content/10 focus:border-primary-500 rounded-xl text-center font-mono text-2xl tracking-[0.3em] uppercase"
                  maxLength={6}
                />
              </div>

              {/* Visual spacer to align with create card */}
              <div className="h-[72px] flex items-center justify-center text-base-content/30">
                <div className="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ask your friend for the 6-character code
                </div>
              </div>

              <button
                onClick={handleJoin}
                disabled={isJoining || joinCode.length !== 6}
                className="btn w-full bg-gradient-to-r from-accent-500 to-green-500 text-white border-0 rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                {isJoining ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Join Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/")}
            className="btn btn-ghost text-base-content/50 rounded-xl gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
