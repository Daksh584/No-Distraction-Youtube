import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import Chatbot from './Chatbot';

const VideoPlayerPage = () => {
  const { videoId, playlistId } = useParams();
  const [videoTitle, setVideoTitle] = useState('');
  const [captions, setCaptions] = useState('');
  const apiKey = import.meta.env.VITE_YT_KEY;

  // Fetch video title and captions (transcript)
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        // Fetch video title
        const titleResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
        const titleData = await titleResponse.json();
        if (titleData.items && titleData.items.length > 0) {
          setVideoTitle(titleData.items[0].snippet.title);
        }

        // Fetch captions (transcript)
        const captionsResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`);
        const captionsData = await captionsResponse.json();
        if (captionsData.items && captionsData.items.length > 0) {
          const captionId = captionsData.items[0].id;
          const transcriptResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`);
          const transcriptData = await transcriptResponse.text();
          setCaptions(transcriptData);
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="container mx-auto mt-10">
      <div className="relative" style={{ paddingBottom: '40%', height: 0 }}>
        {/* Aspect ratio container for VideoPlayer */}
        <VideoPlayer videoId={videoId} playlistId={playlistId} />
      </div>
      <div className="w-full mt-4">
        {/* Full-width Chatbot below VideoPlayer */}
        <Chatbot videoLink={videoLink} videoTitle={videoTitle} videoTranscript={captions} />
      </div>
    </div>
  );
};

export default VideoPlayerPage;