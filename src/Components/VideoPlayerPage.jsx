import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import Chatbot from './Chatbot';

const VideoPlayerPage = () => {
  const { videoId, playlistId } = useParams();
  const [videoTitle, setVideoTitle] = useState('');
  const [transcript, setTranscript] = useState('');
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

        // Fetch video transcript
        const transcriptResponse = await fetch(`http://localhost:5000/${videoId}`);
        const transcriptData = await transcriptResponse.json();
        if (!transcriptData.error) {
          const transcriptText = transcriptData.map(item => item.text).join(' ');
          setTranscript(transcriptText);
        } else {
          console.error('Error fetching transcript:', transcriptData.error);
        }
      } catch (error) {
        console.error('Error fetching video details or transcript:', error);
      }
    };

    fetchVideoDetails();
  }, [videoId, apiKey]);
  // console.log('Transcript:', transcript);
  const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="container mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <div className="relative pb-16/9">
        {/* Aspect ratio container for VideoPlayer */}
        <VideoPlayer videoId={videoId} playlistId={playlistId} />
      </div>
      <div className="w-full mt-4">
        {/* Full-width Chatbot below VideoPlayer */}
        <Chatbot videoLink={videoLink} videoTitle={videoTitle} videoTranscript={transcript} />
      </div>
    </div>
  );
};

export default VideoPlayerPage;