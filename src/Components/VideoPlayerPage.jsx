
import React from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';

const VideoPlayerPage = () => {
  const { videoId } = useParams();

  return (
    <div className="container mx-auto mt-10">
      <VideoPlayer videoId={videoId} />
    </div>
  );
};

export default VideoPlayerPage;