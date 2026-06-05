export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  content: string;
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

// YouTube API types
export interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId?: string;
    playlistId?: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

export interface YouTubePlaylistItem {
  snippet: {
    title: string;
    channelTitle: string;
    resourceId: {
      videoId: string;
    };
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

export interface YouTubeVideoItem {
  snippet: {
    title: string;
  };
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}
