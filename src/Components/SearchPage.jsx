import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

export function SearchPage() {
  const navigate = useNavigate();

  const handleSearch = (searchQuery, searchType) => {
    navigate(`/results?q=${searchQuery}&type=${searchType}`);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
    </div>
  );
}

export default SearchPage;