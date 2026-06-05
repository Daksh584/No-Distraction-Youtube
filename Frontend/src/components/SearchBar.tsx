"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string, searchType: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("video");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, searchType);
  };

  return (
    <div className="flex justify-center mt-12 px-4 animate-slide-up">
      <form onSubmit={handleSearch} className="w-full max-w-2xl">
        <div className="glass-strong rounded-2xl p-6 shadow-lg hover-lift">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              className="flex-1 appearance-none bg-base-200 rounded-xl border-2 border-transparent text-base-content px-4 py-3 leading-tight focus:outline-none focus:border-primary-500 focus:shadow-glow transition-all duration-300"
              type="text"
              placeholder="Search YouTube for learning..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="select select-bordered bg-base-200 border-2 border-transparent focus:border-primary-500 focus:shadow-glow transition-all duration-300"
            >
              <option value="video">Video</option>
              <option value="playlist">Playlist</option>
            </select>
            <button
              className="btn gradient-primary text-white font-semibold px-8 border-0 hover-scale hover-glow shadow-md transition-all duration-300"
              type="submit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
