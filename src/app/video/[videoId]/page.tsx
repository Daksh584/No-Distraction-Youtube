"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import VideoPlayer from "@/components/VideoPlayer";
import Chatbot from "@/components/Chatbot";
import type { TranscriptSegment } from "@/types";

export default function VideoPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const [videoTitle, setVideoTitle] = useState("");
  const [transcript, setTranscript] = useState("");

  // Fetch video title using API key
  useEffect(() => {
    const fetchVideoDetails = async () => {
      const apiKey = process.env.NEXT_PUBLIC_YT_KEY;

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
          setVideoTitle(titleData.items[0].snippet.title);
        }
      } catch (error) {
        console.error("Error fetching video details:", error);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  // Fetch transcript from Flask server
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/${videoId}`);
        if (response.data && !response.data.error) {
          const transcriptText = response.data
            .map((item: TranscriptSegment) => item.text)
            .join(" ");
          setTranscript(transcriptText);
        }
      } catch (error) {
        console.warn("Could not fetch transcript:", error);
      }
    };

    fetchTranscript();
  }, [videoId]);

  const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="container mx-auto mt-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="glass rounded-3xl p-4 sm:p-6 shadow-xl mb-6 hover-lift">
        <VideoPlayer videoId={videoId} />
      </div>
      <div className="w-full">
        <Chatbot
          videoLink={videoLink}
          videoTitle={videoTitle}
          videoTranscript={transcript}
        />
      </div>
    </div>
  );
}
