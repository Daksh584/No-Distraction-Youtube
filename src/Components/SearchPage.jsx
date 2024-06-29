import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    navigate(`/results?q=${searchQuery}`);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
    </div>
  );
};

