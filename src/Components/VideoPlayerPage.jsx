import React from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';

const VideoPlayerPage = () => {
  const { videoId, playlistId } = useParams();

  return (
    <div className="container mx-auto mt-10">
      <VideoPlayer videoId={videoId} playlistId={playlistId} />
    </div>
  );
};

export default VideoPlayerPage;