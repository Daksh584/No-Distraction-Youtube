import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SearchBar from './SearchBar';

export function PlaylistPage() {
  const { playlistId } = useParams();
  const [playlistItems, setPlaylistItems] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  console.log(playlistId);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylistItems = async () => {
      const apiKey = import.meta.env.VITE_YT_KEY;
      setIsLoading(true);

      try {
        const response = await axios.get('https://youtube.googleapis.com/youtube/v3/playlistItems', {
          params: {
            part: 'snippet',
            key: apiKey,
            playlistId: playlistId,
            maxResults: 50
          },
        });
        console.log(response.data.items);
        setPlaylistItems(response.data.items);
        setError('');
      } catch (err) {
        console.error('Error fetching YouTube playlist data:', err);
        setError('Error fetching playlist data from YouTube');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistItems();
  }, [playlistId]);

  const handleSearch = (searchQuery, searchType) => {
    navigate(`/results?q=${searchQuery}&type=${searchType}`);
  };

  return (
    <div className="animate-fade-in min-h-screen pb-12">
      <SearchBar onSearch={handleSearch} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="font-poppins font-bold text-3xl sm:text-4xl gradient-text mb-2">
            Playlist Videos
          </h1>
          <p className="text-base-content/60">
            {playlistItems.length} {playlistItems.length === 1 ? 'video' : 'videos'} in this playlist
          </p>
        </div>

        {error && (
          <div className="alert alert-error shadow-lg mb-6 animate-slide-up">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="glass rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-base-300 h-48 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-base-300 rounded w-3/4"></div>
                  <div className="h-3 bg-base-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlistItems.map((item, index) => (
              <div
                key={item.snippet.resourceId.videoId}
                onClick={() => navigate(`/video/${item.snippet.resourceId.videoId}/${playlistId}`)}
                className={`glass rounded-2xl overflow-hidden cursor-pointer hover-lift transition-all duration-300 animate-slide-up stagger-${(index % 4) + 1}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.snippet.thumbnails.medium.url}
                    alt={item.snippet.title}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-poppins font-semibold text-base line-clamp-2 mb-2 text-base-content">
                    {item.snippet.title}
                  </h3>
                  <p className="font-sans text-sm text-base-content/60">
                    {item.snippet.channelTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaylistPage;