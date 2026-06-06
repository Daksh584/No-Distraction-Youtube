"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface DashboardData {
  welcomeMessage: string;
  recommendations: string[];
  lastWatched: {
    videoId: string;
    title: string;
    channelTitle: string;
    watchedAt: string;
  } | null;
}

export default function AiDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/ai/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
        // Slide in after a short delay for a smooth entrance
        setTimeout(() => setVisible(true), 300);
      } catch (err) {
        console.warn("AI Dashboard not available:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 400);
  };

  const handleRecommendation = (query: string) => {
    router.push(`/results?q=${encodeURIComponent(query)}&type=video`);
  };

  const handleResume = () => {
    if (data?.lastWatched) {
      router.push(`/video/${data.lastWatched.videoId}`);
    }
  };

  if (loading || error || !data || dismissed) return null;

  return (
    <div
      className={`fixed top-24 left-6 z-40 max-w-sm w-[calc(100%-3rem)] sm:w-auto transition-all duration-500 ease-out ${
        visible
          ? "translate-x-0 opacity-100"
          : "-translate-x-[120%] opacity-0"
      }`}
    >
      <div className="bg-base-100/90 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-base-content/8">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-base-content/30 hover:text-base-content/70 hover:bg-base-content/5 transition-all duration-200 text-xs"
        >
          ✕
        </button>

        {/* Welcome message */}
        <p className="text-sm font-medium text-base-content leading-relaxed pr-6">
          {data.welcomeMessage}
        </p>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {data.lastWatched && (
            <button
              onClick={handleResume}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold hover:scale-[1.04] transition-all duration-200 shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
              Resume
            </button>
          )}

          {data.recommendations.map((rec, i) => (
            <button
              key={i}
              onClick={() => handleRecommendation(rec)}
              className="px-3 py-1.5 rounded-xl bg-base-content/5 text-xs font-medium text-base-content/60 hover:text-base-content hover:bg-base-content/10 transition-all duration-200 border border-base-content/5"
            >
              {rec}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
