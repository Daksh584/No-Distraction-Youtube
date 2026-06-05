"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import Business from "@/components/Business";

export default function HomePage() {
  const router = useRouter();

  const handleSearch = (searchQuery: string, searchType: string) => {
    router.push(`/results?q=${searchQuery}&type=${searchType}`);
  };

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Study Together CTA */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div
          onClick={() => router.push("/study-room")}
          className="glass-strong rounded-3xl p-6 cursor-pointer hover-lift transition-all duration-300 group max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-poppins font-bold text-xl text-base-content group-hover:text-primary-500 transition-colors">
                Study Together
              </h3>
              <p className="text-sm text-base-content/50 mt-0.5">
                Watch videos in sync with friends • Chat • AI assistant
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content/30 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <Business />
      </div>
    </div>
  );
}
