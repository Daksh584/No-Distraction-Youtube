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
    <div className="flex justify-center mt-8 px-4 animate-slide-up w-full">
      <form onSubmit={handleSearch} className="w-full">
        <div className="bg-base-100/80 backdrop-blur-3xl rounded-[2rem] p-3 sm:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-base-content/10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:hover:shadow-[0_8px_40px_rgb(0,0,0,0.5)]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative">
            
            {/* Search Icon inside input */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              className="flex-1 appearance-none bg-base-200/50 hover:bg-base-200/80 rounded-[1.5rem] border-0 text-base-content sm:pl-14 px-6 py-4 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300 text-lg placeholder-base-content/40"
              type="text"
              placeholder="What do you want to learn today?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            
            <div className="flex gap-3">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="select select-bordered bg-base-200/50 hover:bg-base-200/80 border-0 focus:ring-2 focus:ring-primary-500/50 rounded-[1.5rem] px-6 py-4 h-auto text-base font-medium transition-all duration-300"
              >
                <option value="video">Video</option>
                <option value="playlist">Playlist</option>
              </select>
              
              <button
                className="btn bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold px-8 h-auto py-4 rounded-[1.5rem] border-0 shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 group"
                type="submit"
              >
                Search
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
