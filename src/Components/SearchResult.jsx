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
    <div>
      <SearchBar onSearch={handleSearch} />
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {videos.map((video) => (
            <div className='avatar'>
                <div className='w-100 rounded'>
          <div key={video.id.videoId || video.id.playlistId} className="mb-4 cursor-pointer" onClick={() => handleItemClick(video)}>
            <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full h-auto" />
            <h3 className="text-lg font-semibold mt-2">{video.snippet.title}</h3>
            <p className="text-gray-600">{video.snippet.channelTitle}</p>
          </div>
          </div></div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults;