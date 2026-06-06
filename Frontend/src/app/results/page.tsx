"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import SearchBar from "@/components/SearchBar";
import type { YouTubeSearchItem } from "@/types";
import { calculateEducationalScore, parseISODurationToMinutes, getScoreColor, SCORE_THRESHOLD } from "@/utils/scoring";
import { getYouTubeApiKey } from "@/utils/apiKey";

import { Suspense } from "react";

function ResultsContent() {
  const [videos, setVideos] = useState<YouTubeSearchItem[]>([]);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const searchType = searchParams.get("type") || "video";

  useEffect(() => {
    const fetchVideos = async () => {
      const apiKey = getYouTubeApiKey();

      try {
        // 1. Initial Search
        const searchResponse = await axios.get(
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
        
        const searchItems: YouTubeSearchItem[] = searchResponse.data.items;

        // 2. If we're searching for videos, fetch their durations and categories
        if (searchType === "video" && searchItems.length > 0) {
          const videoIds = searchItems
            .map((item) => item.id.videoId)
            .filter(Boolean)
            .join(",");

          if (videoIds) {
            const detailsResponse = await axios.get(
              "https://www.googleapis.com/youtube/v3/videos",
              {
                params: {
                  id: videoIds,
                  part: "contentDetails,snippet,statistics",
                  key: apiKey,
                },
              }
            );

            // Create a map of video details for quick lookup
            const detailsMap: Record<string, any> = {};
            detailsResponse.data.items.forEach((item: any) => {
              detailsMap[item.id] = {
                duration: item.contentDetails.duration,
                categoryId: item.snippet.categoryId,
                likeCount: parseInt(item.statistics?.likeCount || "0", 10),
                viewCount: parseInt(item.statistics?.viewCount || "0", 10),
              };
            });

            // 3. Apply the details and calculate scores
            searchItems.forEach((item) => {
              if (item.id.videoId && detailsMap[item.id.videoId]) {
                const details = detailsMap[item.id.videoId];
                item.durationMinutes = parseISODurationToMinutes(details.duration);
                item.categoryId = details.categoryId;
                item.likeCount = details.likeCount;
                item.viewCount = details.viewCount;
              }
              item.educationalScore = calculateEducationalScore(item);
            });

            // 4. Sort by score descending
            searchItems.sort(
              (a, b) => (b.educationalScore || 0) - (a.educationalScore || 0)
            );
          }
        }

        // 5. Filter out videos below the score threshold
        const filtered = searchItems.filter(
          (item) => item.educationalScore === undefined || item.educationalScore > SCORE_THRESHOLD
        );

        setVideos(filtered);
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
                {video.educationalScore !== undefined && (
                  <div className={`absolute top-2 right-2 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md border shadow-sm ${getScoreColor(video.educationalScore)}`}>
                    Score: {video.educationalScore}
                  </div>
                )}
                {video.durationMinutes !== undefined && video.durationMinutes > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                    {Math.floor(video.durationMinutes)}m
                  </div>
                )}
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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <SearchBar onSearch={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
