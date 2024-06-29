// src/components/VideoPlayer.js
import React from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ videoId }) => {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className="flex justify-center my-4">
      <YouTube videoId={videoId} opts={opts} />
    </div>
  );
};

export default VideoPlayer;