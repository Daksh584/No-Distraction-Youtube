import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import Chatbot from './Chatbot';

const VideoPlayerPage = () => {
  const { videoId, playlistId } = useParams();
  const [videoTitle, setVideoTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [user, setUser] = useState(null);
  const [isUserReady, setIsUserReady] = useState(false);

useEffect(() => {
  const stored = localStorage.getItem("user");
  if (stored) setUser(JSON.parse(stored));
  setIsUserReady(true);
}, []);

  console.log(user);
  // Fetch video title and captions (transcript)
  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!user?.access_token) {
        console.warn("Access token not available. Skipping fetch.");
        return;
      }
      try {
        // Fetch video title
        const titleResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet',
            id: videoId,
          },
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        });
        const titleData = titleResponse.data;
        if (titleData.items && titleData.items.length > 0) {
          setVideoTitle(titleData.items[0].snippet.title);
        }
        // Fetch caption list
        const captionListResponse = await axios.get('https://www.googleapis.com/youtube/v3/captions', {
          params: {
            part: 'snippet',
            videoId: videoId,
          },
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        });

        const captionListData = captionListResponse.data;
        if (captionListData.items && captionListData.items.length > 0) {
          const captionId = captionListData.items[0].id;

          const captionDownloadResponse = await axios.get(`https://www.googleapis.com/youtube/v3/captions/${captionId}`, {
            headers: {
              Authorization: `Bearer ${user?.access_token}`,
            },
          });

          setTranscript(captionDownloadResponse.data);
        } else {
          console.warn("No captions found for this video.");
        }
      } catch (error) {
        console.error('Error fetching video details or transcript:', error);
      }
    };

    if (isUserReady) {
      fetchVideoDetails();
    }
  }, [videoId, user, isUserReady]);
  console.log('Transcript:', transcript);
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