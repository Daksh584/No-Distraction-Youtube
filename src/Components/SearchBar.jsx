import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('video');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query, searchType);
  };

  return (
    <div className="flex justify-center mt-8">
      <form onSubmit={handleSearch} className="w-full max-w-md">
        <div className="flex items-center border-b border-b-2 border-blue-500 py-2">
          <input
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none focus:border-blue-500"
            type="text"
            style = {{color: 'inherit'}}
            placeholder="Search YouTube"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="select select-bordered max-w-xs"
          >
            <option value="video">Video</option>
            <option value="playlist">Playlist</option>
          </select>
          <button
            className="btn btn-primary ml-2"
            type="submit"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;