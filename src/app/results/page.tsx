"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import SearchBar from "@/components/SearchBar";
import type { YouTubeSearchItem } from "@/types";

export default function ResultsPage() {
  const [videos, setVideos] = useState<YouTubeSearchItem[]>([]);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const searchType = searchParams.get("type") || "video";

  useEffect(() => {
    const fetchVideos = async () => {
      const apiKey = process.env.NEXT_PUBLIC_YT_KEY;

      try {
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              q: query,
              part: "snippet",
              type: searchType,
              maxResults: 20,
              key: apiKey,
            },
          }
        );
        setVideos(response.data.items);
        setError("");
      } catch (err) {
        console.error("Error fetching YouTube data:", err);
        setError("Error fetching data from YouTube");
      }
    };

    if (query) {
      fetchVideos();
    }
  }, [query, searchType]);

  const handleSearch = (searchQuery: string, searchType: string) => {
    router.push(`/results?q=${searchQuery}&type=${searchType}`);
  };

  const handleItemClick = (item: YouTubeSearchItem) => {
    if (item.id.kind === "youtube#video" && item.id.videoId) {
      router.push(`/video/${item.id.videoId}`);
    } else if (item.id.kind === "youtube#playlist" && item.id.playlistId) {
      router.push(`/playlist/${item.id.playlistId}`);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen pb-12">
      <SearchBar onSearch={handleSearch} />
      {error && (
        <p className="text-red-500 text-center mt-4 font-semibold">{error}</p>
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {videos.map((video, index) => (
            <div
              key={video.id.videoId || video.id.playlistId}
              className={`glass rounded-2xl overflow-hidden cursor-pointer hover-lift transition-all duration-300 animate-slide-up stagger-${
                (index % 4) + 1
              }`}
              onClick={() => handleItemClick(video)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="font-poppins font-semibold text-base line-clamp-2 mb-2 text-base-content">
                  {video.snippet.title}
                </h3>
                <p className="font-sans text-sm text-base-content/60">
                  {video.snippet.channelTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
