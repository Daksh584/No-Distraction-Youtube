import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from './SearchBar';

export function SearchResults() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q');
  const searchType = new URLSearchParams(location.search).get('type') || 'video';

  useEffect(() => {
    const fetchVideos = async () => {
      const apiKey = import.meta.env.VITE_YT_KEY; // Replace with your YouTube API key

      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            q: query,
            part: 'snippet',
            key: apiKey,
            type: searchType,
            maxResults: 20,
          },
        });
        console.log(response.data.items);
        setVideos(response.data.items);
        setError('');
      } catch (err) {
        console.error('Error fetching YouTube data:', err);
        setError('Error fetching data from YouTube');
      }
    };

    if (query) {
      fetchVideos();
    }
  }, [query, searchType]);

  const handleSearch = (searchQuery, searchType) => {
    navigate(`/results?q=${searchQuery}&type=${searchType}`);
  };

  const handleItemClick = (item) => {
    if (item.id.kind === 'youtube#video') {
      navigate(`/video/${item.id.videoId}`);
    } else if (item.id.kind === 'youtube#playlist') {
      navigate(`/playlist/${item.id.playlistId}`);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen pb-12">
      <SearchBar onSearch={handleSearch} />
      {error && <p className="text-red-500 text-center mt-4 font-semibold">{error}</p>}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {videos.map((video, index) => (
            <div
              key={video.id.videoId || video.id.playlistId}
              className={`glass rounded-2xl overflow-hidden cursor-pointer hover-lift transition-all duration-300 animate-slide-up stagger-${(index % 4) + 1}`}
              onClick={() => handleItemClick(video)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="font-poppins font-semibold text-base line-clamp-2 mb-2 text-base-content">
                  {video.snippet.title}
                </h3>
                <p className="font-sans text-sm text-base-content/60">
                  {video.snippet.channelTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchResults;