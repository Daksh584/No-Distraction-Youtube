"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import Business from "@/components/Business";
import AiDashboard from "@/components/AiDashboard";
import ScrollReveal from "@/components/ScrollReveal";
import ExtensionModal from "@/components/ExtensionModal";

export default function HomePage() {
  const router = useRouter();
  const [showExtModal, setShowExtModal] = useState(false);

  const handleSearch = (searchQuery: string, searchType: string) => {
    router.push(`/results?q=${searchQuery}&type=${searchType}`);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-500/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col items-center justify-center pt-20 animate-fade-in">
        <AiDashboard />

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-6">
          <div className="inline-block animate-bounce-slow">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium text-primary-500 mb-4 border border-primary-500/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              EduTube 2.0 is here
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-base-content font-poppins drop-shadow-sm">
            Focus on learning,{" "}
            <span className="block mt-2 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-500 to-accent-400 animate-gradient-x drop-shadow-md">
              not algorithms.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-base-content/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Search for educational content without being dragged down the YouTube rabbit hole. AI-filtered, distraction-free studying.
          </p>
        </div>

        <div className="w-full max-w-4xl transform transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 z-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur-xl rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Extension Download Button */}
        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button 
            onClick={() => setShowExtModal(true)} 
            className="btn btn-ghost btn-sm rounded-full bg-base-200/50 hover:bg-primary-500/10 text-base-content/80 hover:text-primary-500 gap-2 font-medium border border-base-content/5 shadow-sm transition-all"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
             </svg>
             Get the Chrome Extension
          </button>
        </div>

        {/* Study Together CTA Banner */}
        <ScrollReveal animation="fade-up" delay={200} className="w-full max-w-4xl mt-12 group">
          <div
            onClick={() => router.push("/study-room")}
            className="relative overflow-hidden rounded-3xl p-1 cursor-pointer transition-all duration-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:-translate-y-1"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x" />
            
            {/* Inner Content */}
            <div className="relative bg-base-100/95 backdrop-blur-2xl rounded-[23px] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_8px_30px_rgba(139,92,246,0.5)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-poppins font-bold text-2xl text-base-content group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all duration-300">
                  Study Together with Friends
                </h3>
                <p className="text-base text-base-content/60 mt-1">
                  Create a virtual room, sync video playback, and chat with an AI assistant together!
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-base-200/50 flex items-center justify-center group-hover:bg-violet-500/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content/40 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-20">
        <ScrollReveal animation="fade-up">
          <Business />
        </ScrollReveal>
      </div>
      <ExtensionModal isOpen={showExtModal} onClose={() => setShowExtModal(false)} />
    </div>
  );
}
