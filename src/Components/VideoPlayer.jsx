import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VideoPlayer = ({ videoId, playlistId }) => {
  const [playlistItems, setPlaylistItems] = useState([]);
  const [error, setError] = useState('');
const navigate = useNavigate();
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
    },
  };

  useEffect(() => {
    const fetchPlaylistItems = async () => {
      const apiKey = import.meta.env.VITEYTKEY; // Replace with your YouTube API key

      try {
        const response = await axios.get('https://youtube.googleapis.com/youtube/v3/playlistItems', {
          params: {
            part: 'snippet',
            key: apiKey,
            playlistId: playlistId,
            maxResults: 50 // Adjust as needed
          },
        });

        setPlaylistItems(response.data.items);
        setError('');
      } catch (err) {
        console.error('Error fetching YouTube playlist data:', err);
        setError('Error fetching playlist data from YouTube');
      }
    };

    if (playlistId) {
      fetchPlaylistItems();
    }
  }, [playlistId]);

  const handlePlaylistItemClick = (videoId) => {
    navigate (`/video/${videoId}/${playlistId}`);
    console.log('Clicked videoId:', videoId);
    // You can implement your logic here to set the new videoId for the YouTube player
  };

  return (
    <div className="flex justify-center my-4">
      <div className="mr-4">
        <YouTube videoId={videoId} opts={opts} />
      </div>
      
      {playlistItems.length > 0 && (
        <div className="mt-4 overflow-y-auto max-h-96">
          <h2 className="text-xl font-semibold mb-2">Playlist Items</h2>
          {playlistItems.map((item) => (
            <div key={item.snippet.resourceId.videoId} className="flex items-center mb-4 cursor-pointer">
              <img
                src={item.snippet.thumbnails.medium.url}
                alt={item.snippet.title}
                className="w-48 h-auto rounded-lg shadow-md hover:shadow-xl transition duration-300"
                onClick={() => handlePlaylistItemClick(item.snippet.resourceId.videoId)}
              />
              <div className="ml-4">
                <p className="text-sm font-medium">{item.snippet.title}</p>
                <p className="text-gray-600">{item.snippet.channelTitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default VideoPlayer;