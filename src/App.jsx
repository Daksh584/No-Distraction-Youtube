import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {Navbar} from './Components/Navbar';
import {SearchPage} from './Components/SearchPage';
import {SearchResults} from './Components/SearchResult';
import VideoPlayerPage from './Components/VideoPlayerPage';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mx-auto mt-10">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path ="/video/:videoId" element={<VideoPlayerPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;