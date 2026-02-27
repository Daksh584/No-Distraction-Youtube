import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
export function  PlaylistPage(){
 const { playlistId } = useParams();
 const [playlistItems, setPlaylistItems] = useState([]);
 const [error, setError] = useState('');
 const [user, setUser] = useState(null); // Assuming user state is managed here or passed as prop
 console.log(playlistId);

 const navigate = useNavigate();

 useEffect(() => {
  // Retrieve user from localStorage
  const loggedInUser = localStorage.getItem('user');
  if (loggedInUser) {
  setUser(JSON.parse(loggedInUser));
  }
 }, []);

 console.log(user);
 useEffect(() => {
  const fetchPlaylistItems = async () => {
  if (!user?.access_token) {
  console.log("Not logged in, cannot fetch user-specific playlist data.");
  // You could fall back to the API key here if you want
  return;
  }

  try {
  const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
  params: {
  part: 'snippet',
  playlistId: playlistId,
  maxResults: 50,
  access_token: user.access_token,
  },
  headers: {
  Authorization: `Bearer ${user.access_token}`,
  },
  });
  setPlaylistItems(response.data.items); // Access items here
  } catch (error) {
  setError(error.message);
  }
  };
  if (user) {
  fetchPlaylistItems();
  }
}, [playlistId, user]);


  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {playlistItems.map((item) => (
          <div key={item.snippet.resourceId.videoId} onClick={() => navigate(`/video/${item.snippet.resourceId.videoId}/${playlistId}`)} className="mb-4 cursor-pointer" >
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