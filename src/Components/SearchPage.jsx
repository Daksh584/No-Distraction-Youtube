import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import Business from './Business';

export function SearchPage() {
  const navigate = useNavigate();

  const handleSearch = (searchQuery, searchType) => {
    navigate(`/results?q=${searchQuery}&type=${searchType}`);
  };

  return (
    <div className="animate-fade-in min-h-screen">
      <SearchBar onSearch={handleSearch} />
      <Business />
    </div>
  );
}

export default SearchPage;