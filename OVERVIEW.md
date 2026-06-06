# EduTube (No-Distraction YouTube)

EduTube is a modern, full-stack educational platform designed to eliminate distractions from the YouTube viewing experience while supercharging learning through AI and collaborative tools.

## 🚀 Core Features

1. **Distraction-Free Environment**
   Search and watch YouTube videos without the algorithm dictating your attention. No recommended feeds, no endless scrolling shorts, and no distracting comment sections.

2. **AI-Powered Learning Assistant**
   Every video comes equipped with a context-aware AI Chatbot powered by Google's Gemini. The AI automatically reads the video's transcript, allowing you to ask questions, request summaries, and get clarifications in real-time while watching.

3. **Notion Integration for Note-Taking**
   Seamlessly authenticate your Notion workspace. As you learn, you can jot down notes or export AI-generated explanations directly into your Notion database with a single click.

4. **Synchronized Study Rooms**
   Create collaborative "Study Rooms" to watch videos with friends. The video playback (play, pause, seek) is synchronized perfectly across all users in the room via WebSockets. It also includes a live group chat for discussion.

5. **Watch History Tracking**
   Automatically saves the videos you've interacted with to your account, so you can easily pick up where you left off.

---

## 🏗️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, DaisyUI
- **Primary Backend**: Node.js, Express, Socket.io (for real-time WebSockets), MongoDB (for users, history, and rooms)
- **Secondary Backend**: Python, Flask, `youtube-transcript-api` (for scraping and processing video transcripts)
- **APIs**: YouTube Data API v3, Notion API, Google Gemini AI API

---

## 📱 Pages & User Interface

The application features a sleek, premium design utilizing modern web aesthetics like glassmorphism, subtle micro-animations, and a cohesive vibrant color palette.

### 1. Landing Page (`/`)
The entry point of the application. It features a prominent, centralized search bar inviting users to search for a topic. The navigation bar includes the login/signup mechanism and links to core features.

### 2. Search Results (`/results`)
Displays a responsive grid of video and playlist thumbnails returned by the YouTube API. The UI is clean, showing only the thumbnail, title, and channel name.

### 3. Solo Video Player (`/video/[videoId]`)
The core learning environment. 
- **Main View**: A large, centered YouTube player with the video title and description below it.
- **Study with Friends**: A prominent button below the video to instantly convert the solo session into a multiplayer study room.
- **Floating Action Buttons**: Two floating buttons on the bottom right open slide-out panels:
  - **AI Chatbot**: A chat interface to talk with the Gemini AI about the video.
  - **Notion Notes**: A rich-text editor to write notes and push them to Notion.

### 4. Playlist Viewer (`/playlist/[playlistId]`)
An extended version of the solo player. The video player sits on the left, while a scrollable, glassmorphic sidebar on the right displays all the videos in the current playlist, highlighting the currently active video.

### 5. Study Room Lobby (`/study-room`)
A dual-card interface allowing users to either:
- **Create a Room**: Name the room and optionally paste a YouTube URL.
- **Join a Room**: Enter a 6-character unique join code.

### 6. Live Study Room (`/study-room/[roomCode]`)
The collaborative hub. 
- The left side of the screen is dominated by the synchronized video player. 
- The right side features a real-time chat panel where users can talk.
- System messages announce when users join, leave, or change the video state (e.g., "Daksh paused the video").

### 7. History (`/history`)
A personalized dashboard displaying a grid of recently watched videos, making it easy to revisit educational content.
