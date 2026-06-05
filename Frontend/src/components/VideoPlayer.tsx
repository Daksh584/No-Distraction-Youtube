"use client";

import { useState, useEffect } from "react";
import YouTube from "react-youtube";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { YouTubePlaylistItem } from "@/types";

interface VideoPlayerProps {
  videoId: string;
  playlistId?: string;
  title?: string;
  channelTitle?: string;
  description?: string;
}

export default function VideoPlayer({ videoId, playlistId, title, channelTitle, description }: VideoPlayerProps) {
  const [playlistItems, setPlaylistItems] = useState<YouTubePlaylistItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
    },
  };

  useEffect(() => {
    const fetchPlaylistItems = async () => {
      const apiKey = process.env.NEXT_PUBLIC_YT_KEY;
      setIsLoading(true);

      try {
        const response = await axios.get(
          "https://youtube.googleapis.com/youtube/v3/playlistItems",
          {
            params: {
              part: "snippet",
              key: apiKey,
              playlistId: playlistId,
              maxResults: 50,
            },
          }
        );

        setPlaylistItems(response.data.items);
        setError("");
      } catch (err) {
        console.error("Error fetching YouTube playlist data:", err);
        setError("Error fetching playlist data from YouTube");
      } finally {
        setIsLoading(false);
      }
    };

    if (playlistId) {
      fetchPlaylistItems();
    }
  }, [playlistId]);

  const handlePlaylistItemClick = (itemVideoId: string) => {
    router.push(`/video/${itemVideoId}/${playlistId}`);
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Main Video Player */}
      <div className="flex-1 animate-scale-in min-w-0">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-black">
            <YouTube
              videoId={videoId}
              opts={opts}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Video Info */}
        {(title || description) && (
          <div className="mt-6 px-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-base-content mb-2 line-clamp-2">
              {title}
            </h1>
            <p className="text-base-content/70 font-semibold mb-4 text-lg">
              {channelTitle}
            </p>
            
            <div className="bg-base-200/50 hover:bg-base-200/70 transition-colors rounded-2xl p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
              <div className={`text-sm whitespace-pre-wrap text-base-content/80 ${!isExpanded ? "line-clamp-3" : ""}`}>
                {description || "No description available."}
              </div>
              <button className="text-primary-500 font-medium text-sm mt-2 hover:underline">
                {isExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Playlist Sidebar */}
      {playlistItems.length > 0 && (
        <div className="lg:w-96 w-full animate-slide-up">
          <div className="glass-strong rounded-3xl p-6 shadow-xl sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
            {/* Playlist Header */}
            <div className="mb-4">
              <h2 className="font-poppins font-bold text-xl gradient-text mb-1">
                Playlist
              </h2>
              <p className="text-sm text-base-content/60">
                {playlistItems.length}{" "}
                {playlistItems.length === 1 ? "video" : "videos"}
              </p>
            </div>

            {/* Playlist Items */}
            <div className="overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-base-200">
              {isLoading
                ? [...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="glass rounded-xl p-3 animate-pulse"
                    >
                      <div className="flex gap-3">
                        <div className="bg-base-300 w-32 h-20 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-base-300 rounded w-3/4"></div>
                          <div className="h-2 bg-base-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                : playlistItems.map((item) => (
                    <div
                      key={item.snippet.resourceId.videoId}
                      className={`glass rounded-xl p-3 cursor-pointer hover-lift transition-all duration-300 ${
                        item.snippet.resourceId.videoId === videoId
                          ? "ring-2 ring-primary-500 shadow-glow"
                          : ""
                      }`}
                      onClick={() =>
                        handlePlaylistItemClick(
                          item.snippet.resourceId.videoId
                        )
                      }
                    >
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={item.snippet.thumbnails.medium.url}
                            alt={item.snippet.title}
                            className="w-32 h-20 object-cover transition-transform duration-300 hover:scale-110"
                          />
                          {item.snippet.resourceId.videoId === videoId && (
                            <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-poppins font-medium text-sm line-clamp-2 mb-1 ${
                              item.snippet.resourceId.videoId === videoId
                                ? "text-primary-500"
                                : "text-base-content"
                            }`}
                          >
                            {item.snippet.title}
                          </p>
                          <p className="font-sans text-xs text-base-content/60 truncate">
                            {item.snippet.channelTitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
