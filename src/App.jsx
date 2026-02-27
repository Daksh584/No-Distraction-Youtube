import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {Navbar} from './Components/Navbar';
import {SearchPage} from './Components/SearchPage';
import {SearchResults} from './Components/SearchResult';
import VideoPlayerPage from './Components/VideoPlayerPage';
import {PlaylistPage} from './Components/Playlist';
import Login from './Components/Login';

const App = () => {
  const [user, setUser] = useState(null);

  // Check for a logged-in user in localStorage when the app loads
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      try {
        const foundUser = JSON.parse(loggedInUser);
        // Optional: Check if the token is expired
        if (foundUser.exp * 1000 < Date.now()) {
          console.log("Token expired, logging out.");
          setUser(null);
        } else {
          setUser(foundUser);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        setUser(null);
      }
    }
  }, []);

  // Save/remove user to/from localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <div className="App">
        <header className="flex justify-between items-center p-4 border-b">
          <Navbar />
          <Login user={user} setUser={setUser} />
        </header>
        <div className="container mx-auto mt-10">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/results" element={<SearchResults user={user} />} />
            <Route path="/playlist/:playlistId" element={<PlaylistPage user={user} />} />
            <Route path="/video/:videoId/:playlistId" element={<VideoPlayerPage />} />
            <Route path="/video/:videoId"  element={<VideoPlayerPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;