import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
export function  PlaylistPage(){
  const { playlistId } = useParams();
  const [playlistItems, setPlaylistItems] = useState([]);
  const [error, setError] = useState('');
  console.log(playlistId)

  const navigate = useNavigate();
  useEffect(() => {
    const fetchPlaylistItems = async () => {
      const apiKey = import.meta.env.VITE_YT_KEY; // Replace with your YouTube API key

      try {const response = await axios.get('https://youtube.googleapis.com/youtube/v3/playlistItems', {
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
      }
    };

    fetchPlaylistItems();
  }, [playlistId]);
  
  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {playlistItems.map((item) => (
          <div key={item.snippet.resourceId.videoId} onClick={() => navigate(`/video/${item.snippet.resourceId.videoId}/${playlistId}`)} className="mb-4 cursor-pointer">
            <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} className="w-full h-auto" />
            <h3 className="text-lg font-semibold mt-2">{item.snippet.title}</h3>
            <p className="text-gray-600">{item.snippet.channelTitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;