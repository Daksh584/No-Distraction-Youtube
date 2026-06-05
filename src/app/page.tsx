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
      <SearchBar onSearch={handleSearch} />
      <Business />
    </div>
  );
}
