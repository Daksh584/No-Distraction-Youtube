"use client";

import { useState, useEffect, useRef } from "react";
import { getUserApiKey, setUserApiKey, isUsingCustomKey } from "@/utils/apiKey";

export default function ApiKeyModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [usingCustom, setUsingCustom] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getUserApiKey());
      setUsingCustom(isUsingCustomKey());
      setSaved(false);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    setUserApiKey(apiKey);
    setUsingCustom(isUsingCustomKey());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = () => {
    setUserApiKey("");
    setApiKey("");
    setUsingCustom(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="glass rounded-2xl p-6 w-full max-w-md mx-4 shadow-lg border border-white/10 animate-scale-in"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-poppins font-bold text-lg text-base-content">
            ⚙️ API Key Settings
          </h2>
          <button
            onClick={onClose}
            className="text-base-content/40 hover:text-base-content transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-base-content/60 mb-4">
          Bring your own YouTube API key to extend your daily quota. Your key is
          stored <strong>only in your browser</strong> and never sent to our
          servers.
        </p>

        {usingCustom && (
          <div className="flex items-center gap-2 mb-3 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Using your API key
          </div>
        )}

        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your YouTube Data API v3 key"
          className="w-full px-4 py-2.5 rounded-xl bg-base-content/5 border border-base-content/10 text-base-content text-sm focus:outline-none focus:border-primary-500/50 transition-colors placeholder:text-base-content/30"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl bg-gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {saved ? "✓ Saved!" : "Save Key"}
          </button>
          {usingCustom && (
            <button
              onClick={handleRemove}
              className="px-4 py-2 rounded-xl border border-red-400/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        <p className="text-xs text-base-content/40 mt-3">
          Get your free key from the{" "}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary-400 transition-colors"
          >
            Google Cloud Console
          </a>
          . Enable the YouTube Data API v3.
        </p>
      </div>
    </div>
  );
}
