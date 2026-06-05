"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import YouTube from "react-youtube";

interface SyncedVideoPlayerProps {
  videoId: string;
  isHost: boolean;
  onPlay?: (currentTime: number) => void;
  onPause?: (currentTime: number) => void;
  onSeek?: (currentTime: number) => void;
}

export default function SyncedVideoPlayer({
  videoId,
  isHost,
  onPlay,
  onPause,
  onSeek,
}: SyncedVideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const isRemoteAction = useRef(false);
  const lastSeekTime = useRef(0);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = (event: any) => {
    playerRef.current = event.target;
  };

  const onStateChange = (event: any) => {
    if (isRemoteAction.current) {
      isRemoteAction.current = false;
      return;
    }

    if (!isHost) return; // Only host can control

    const player = event.target;
    const currentTime = player.getCurrentTime();
    const state = event.data;

    // YouTube player states: 1=playing, 2=paused
    if (state === 1) {
      onPlay?.(currentTime);
    } else if (state === 2) {
      onPause?.(currentTime);
      // Detect seek: if paused and time changed significantly
      const now = Date.now();
      if (now - lastSeekTime.current > 500) {
        onSeek?.(currentTime);
        lastSeekTime.current = now;
      }
    }
  };

  // Exposed methods for remote control
  const playAt = useCallback((time: number) => {
    if (!playerRef.current) return;
    isRemoteAction.current = true;
    playerRef.current.seekTo(time, true);
    playerRef.current.playVideo();
  }, []);

  const pauseAt = useCallback((time: number) => {
    if (!playerRef.current) return;
    isRemoteAction.current = true;
    playerRef.current.seekTo(time, true);
    playerRef.current.pauseVideo();
  }, []);

  const seekTo = useCallback((time: number) => {
    if (!playerRef.current) return;
    isRemoteAction.current = true;
    playerRef.current.seekTo(time, true);
  }, []);

  // Expose methods via ref on the component instance
  useEffect(() => {
    (window as any).__syncedPlayer = { playAt, pauseAt, seekTo };
    return () => {
      delete (window as any).__syncedPlayer;
    };
  }, [playAt, pauseAt, seekTo]);

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
            className="w-full h-full"
          />
        </div>
      </div>
      {!isHost && (
        <div className="mt-2 flex items-center gap-2 text-sm text-base-content/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Playback is controlled by the host</span>
        </div>
      )}
    </div>
  );
}
