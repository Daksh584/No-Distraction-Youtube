"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import VideoPlayer from "@/components/VideoPlayer";
import Chatbot from "@/components/Chatbot";
import NotionNotes from "@/components/NotionNotes";
import SidePanel from "@/components/SidePanel";
import type { TranscriptSegment } from "@/types";

export default function VideoWithPlaylistPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const playlistId = params.playlistId as string;
  const [videoTitle, setVideoTitle] = useState("");
  const [channelTitle, setChannelTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transcript, setTranscript] = useState("");
  const [openPanel, setOpenPanel] = useState<"chat" | "notes" | null>(null);
  const [pendingNote, setPendingNote] = useState<string | null>(null);

  const handleAddToNotes = useCallback((text: string) => {
    setPendingNote(text);
    setOpenPanel("notes");
  }, []);

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
          const snippet = titleData.items[0].snippet;
          setVideoTitle(snippet.title);
          setChannelTitle(snippet.channelTitle);
          setDescription(snippet.description);
          
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
        const FLASK_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5002";
        const response = await axios.get(`${FLASK_URL}/${videoId}`);
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

  const chatIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );

  const notesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  return (
    <>
      <div className="container mx-auto mt-8 px-4 sm:px-6 lg:px-8 animate-fade-in pb-8">
        <div className="glass rounded-3xl p-4 sm:p-6 shadow-xl mb-6 hover-lift">
          <VideoPlayer
            videoId={videoId}
            playlistId={playlistId}
            title={videoTitle}
            channelTitle={channelTitle}
            description={description}
          />
        </div>
      </div>

      {/* Floating Side Buttons */}
      <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-30">
        <button
          onClick={() => setOpenPanel(openPanel === "notes" ? null : "notes")}
          className={`group relative btn btn-circle btn-lg shadow-xl transition-all duration-300 ${
            openPanel === "notes"
              ? "gradient-primary text-white scale-110 shadow-glow"
              : "glass-strong text-base-content hover:scale-110 hover:shadow-2xl"
          }`}
          title="Notion Notes"
        >
          {notesIcon}
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-base-300 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            Notion Notes
          </span>
        </button>
        <button
          onClick={() => setOpenPanel(openPanel === "chat" ? null : "chat")}
          className={`group relative btn btn-circle btn-lg shadow-xl transition-all duration-300 ${
            openPanel === "chat"
              ? "gradient-primary text-white scale-110 shadow-glow"
              : "glass-strong text-base-content hover:scale-110 hover:shadow-2xl"
          }`}
          title="AI Chatbot"
        >
          {chatIcon}
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-base-300 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            AI Chatbot
          </span>
        </button>
      </div>

      {/* Side Panels */}
      <SidePanel
        title="AI Chatbot"
        icon={chatIcon}
        isOpen={openPanel === "chat"}
        onClose={() => setOpenPanel(null)}
      >
        <Chatbot
          videoLink={videoLink}
          videoTitle={videoTitle}
          videoTranscript={transcript}
          onAddToNotes={handleAddToNotes}
        />
      </SidePanel>

      <SidePanel
        title="Notion Notes"
        icon={notesIcon}
        isOpen={openPanel === "notes"}
        onClose={() => setOpenPanel(null)}
      >
        <NotionNotes
          videoId={videoId}
          videoTitle={videoTitle}
          channelTitle={channelTitle}
          pendingNoteContent={pendingNote}
          onPendingConsumed={() => setPendingNote(null)}
        />
      </SidePanel>
    </>
  );
}
