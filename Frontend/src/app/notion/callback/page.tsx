"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

import { Suspense } from "react";

function NotionCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Connecting your Notion account...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage("You declined the Notion connection request.");
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received from Notion.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setStatus("error");
          setMessage("You must be logged in to connect Notion.");
          return;
        }

        await axios.post(
          `${API_URL}/api/notion/callback`,
          { code },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus("success");
        setMessage("Notion connected successfully! Redirecting...");

        // Redirect back to the page the user was on
        const returnUrl = localStorage.getItem("notion_return_url");
        localStorage.removeItem("notion_return_url");

        setTimeout(() => {
          if (returnUrl) {
            window.location.href = returnUrl;
          } else {
            router.push("/");
          }
        }, 2000);
      } catch (err) {
        console.error("Notion callback error:", err);
        setStatus("error");
        setMessage("Failed to connect Notion. Please try again.");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center animate-fade-in">
      <div className="glass-strong rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="font-poppins font-bold text-2xl gradient-text mb-3">
              Connecting to Notion
            </h2>
            <p className="text-base-content/60">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="font-poppins font-bold text-2xl text-green-500 mb-3">
              Connected!
            </h2>
            <p className="text-base-content/60">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="font-poppins font-bold text-2xl text-red-500 mb-3">
              Connection Failed
            </h2>
            <p className="text-base-content/60 mb-6">{message}</p>
            <button
              onClick={() => {
                const returnUrl = localStorage.getItem("notion_return_url");
                localStorage.removeItem("notion_return_url");
                if (returnUrl) {
                  window.location.href = returnUrl;
                } else {
                  router.push("/");
                }
              }}
              className="btn gradient-primary text-white font-semibold px-6 border-0 hover-scale transition-all duration-300"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function NotionCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <NotionCallbackContent />
    </Suspense>
  );
}
