"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface NotionNotesProps {
  videoId: string;
  videoTitle: string;
  channelTitle?: string;
  pendingNoteContent?: string | null;
  onPendingConsumed?: () => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function NotionNotes({
  videoId,
  videoTitle,
  channelTitle,
  pendingNoteContent,
  onPendingConsumed,
}: NotionNotesProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [content, setContent] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getToken = () => localStorage.getItem("token");

  // Check if user is logged in and Notion is connected
  useEffect(() => {
    const checkStatus = async () => {
      const token = getToken();
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const response = await axios.get(`${API_URL}/api/notion/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsConnected(response.data.connected);
      } catch {
        setIsConnected(false);
      }

      setIsLoading(false);
    };

    checkStatus();
  }, []);

  // Fetch existing note for this video
  useEffect(() => {
    const fetchNote = async () => {
      if (!isConnected) return;

      const token = getToken();
      try {
        const response = await axios.get(
          `${API_URL}/api/notion/note/${videoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.exists) {
          setContent(response.data.content || "");
          setPageId(response.data.pageId);
          setPageUrl(response.data.pageUrl);
        }
      } catch (error: unknown) {
        console.error("Error fetching note:", error);
        // If Notion returns 400 (not connected properly), reset connection
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          setIsConnected(false);
        }
      }
    };

    fetchNote();
  }, [isConnected, videoId]);

  // Handle content appended from Chatbot
  useEffect(() => {
    if (pendingNoteContent && pageId) {
      const separator = content.trim() ? "\n\n---\n\n" : "";
      const newContent = content + separator + pendingNoteContent;
      setContent(newContent);
      // Trigger save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(newContent);
      }, 500);
      onPendingConsumed?.();
    }
  }, [pendingNoteContent]);

  // Auto-save with debounce
  const saveNote = useCallback(
    async (newContent: string) => {
      if (!pageId) return;

      const token = getToken();
      setSaveStatus("saving");

      try {
        await axios.put(
          `${API_URL}/api/notion/note/${pageId}`,
          { content: newContent },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Error saving note:", error);
        setSaveStatus("error");
      }
    },
    [pageId]
  );

  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Debounce auto-save (2 seconds after user stops typing)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (pageId) {
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(newContent);
      }, 2000);
    }
  };

  // Create a new note
  const handleCreateNote = async () => {
    const token = getToken();
    setIsCreating(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/notion/note`,
        {
          videoId,
          videoTitle,
          channelTitle,
          content: `# ${videoTitle}\n\n## Notes\n\n`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPageId(response.data.pageId);
      setPageUrl(response.data.pageUrl);
      setContent(`# ${videoTitle}\n\n## Notes\n\n`);
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Connect to Notion
  const handleConnectNotion = async () => {
    const token = getToken();
    try {
      // Save current page so callback can redirect back here
      localStorage.setItem("notion_return_url", window.location.href);
      const response = await axios.get(`${API_URL}/api/notion/auth-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Error getting Notion auth URL:", error);
    }
  };

  // Insert markdown formatting
  const insertFormatting = (prefix: string, suffix?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const suf = suffix || prefix;

    const newContent =
      content.substring(0, start) +
      prefix +
      selectedText +
      suf +
      content.substring(end);

    handleContentChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = end + prefix.length;
    }, 0);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          insertFormatting("**");
          break;
        case "i":
          e.preventDefault();
          insertFormatting("*");
          break;
        case "s":
          e.preventDefault();
          if (pageId) saveNote(content);
          break;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="glass-strong rounded-3xl p-6 w-full shadow-xl animate-fade-in">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="glass-strong rounded-3xl p-6 w-full shadow-xl animate-fade-in">
        <div className="mb-4">
          <h3 className="font-poppins font-bold text-2xl gradient-text mb-2 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Notion Notes
          </h3>
          <p className="text-sm text-base-content/60">
            Sign in to take notes synced with Notion
          </p>
        </div>
        <div className="text-center py-8 text-base-content/50">
          <p className="font-medium">Please sign in first to use Notion Notes</p>
        </div>
      </div>
    );
  }

  // Notion not connected
  if (!isConnected) {
    return (
      <div className="glass-strong rounded-3xl p-6 w-full shadow-xl animate-fade-in">
        <div className="mb-4">
          <h3 className="font-poppins font-bold text-2xl gradient-text mb-2 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Notion Notes
          </h3>
          <p className="text-sm text-base-content/60">
            Connect your Notion workspace to take notes
          </p>
        </div>
        <div className="text-center py-8">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 opacity-40 text-base-content"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <p className="text-base-content/60 mb-1">
              Take notes while watching and sync them to Notion
            </p>
            <p className="text-base-content/40 text-sm">
              Your notes will be saved as pages in a dedicated EduTube database
            </p>
          </div>
          <button
            onClick={handleConnectNotion}
            className="btn bg-black text-white hover:bg-gray-800 font-semibold px-8 border-0 hover-scale transition-all duration-300 gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.573 2.24c-.42-.326-.98-.7-2.055-.607L3.01 2.867c-.467.047-.56.28-.374.466l1.823 1.875zm.793 3.313v13.7c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.886c-.56.047-.747.327-.747.887zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.493-.933l-4.577-7.186v6.952l1.46.327s0 .84-1.168.84l-3.222.187c-.093-.187 0-.653.327-.747l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933l3.222-.187z" />
            </svg>
            Connect to Notion
          </button>
        </div>
      </div>
    );
  }

  // Connected but no note for this video
  if (!pageId) {
    return (
      <div className="glass-strong rounded-3xl p-6 w-full shadow-xl animate-fade-in">
        <div className="mb-4">
          <h3 className="font-poppins font-bold text-2xl gradient-text mb-2 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Notion Notes
          </h3>
          <p className="text-sm text-base-content/60">
            Create a note for this video
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-base-content/60 mb-6">
            No notes yet for this video. Start taking notes!
          </p>
          <button
            onClick={handleCreateNote}
            disabled={isCreating}
            className="btn gradient-primary text-white font-semibold px-8 border-0 hover-scale hover-glow transition-all duration-300 gap-2 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Note
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Editor view
  return (
    <div className="glass-strong rounded-3xl p-6 w-full shadow-xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-poppins font-bold text-2xl gradient-text mb-1 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Notion Notes
          </h3>
          <p className="text-sm text-base-content/60">
            Auto-saves to your Notion workspace
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-1.5 text-sm">
            {saveStatus === "saving" && (
              <span className="text-yellow-500 flex items-center gap-1">
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-green-500 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-500">Save failed</span>
            )}
          </div>

          {/* Open in Notion */}
          {pageUrl && (
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm glass border-base-content/20 hover-scale transition-all duration-300 gap-1"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.573 2.24c-.42-.326-.98-.7-2.055-.607L3.01 2.867c-.467.047-.56.28-.374.466l1.823 1.875zm.793 3.313v13.7c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.886c-.56.047-.747.327-.747.887zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.493-.933l-4.577-7.186v6.952l1.46.327s0 .84-1.168.84l-3.222.187c-.093-.187 0-.653.327-.747l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933l3.222-.187z" />
              </svg>
              Open in Notion
            </a>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-3 p-2 bg-base-200/50 rounded-xl">
        <button
          onClick={() => insertFormatting("**")}
          className="btn btn-xs btn-ghost font-bold hover:bg-base-300 transition-colors"
          title="Bold (⌘B)"
        >
          B
        </button>
        <button
          onClick={() => insertFormatting("*")}
          className="btn btn-xs btn-ghost italic hover:bg-base-300 transition-colors"
          title="Italic (⌘I)"
        >
          I
        </button>
        <button
          onClick={() => insertFormatting("`")}
          className="btn btn-xs btn-ghost font-mono hover:bg-base-300 transition-colors"
          title="Code"
        >
          {"</>"}
        </button>
        <div className="divider divider-horizontal mx-0.5 h-5"></div>
        <button
          onClick={() => insertFormatting("# ", "\n")}
          className="btn btn-xs btn-ghost hover:bg-base-300 transition-colors"
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => insertFormatting("## ", "\n")}
          className="btn btn-xs btn-ghost hover:bg-base-300 transition-colors"
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => insertFormatting("### ", "\n")}
          className="btn btn-xs btn-ghost hover:bg-base-300 transition-colors"
          title="Heading 3"
        >
          H3
        </button>
        <div className="divider divider-horizontal mx-0.5 h-5"></div>
        <button
          onClick={() => insertFormatting("- ", "\n")}
          className="btn btn-xs btn-ghost hover:bg-base-300 transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => insertFormatting("- [ ] ", "\n")}
          className="btn btn-xs btn-ghost hover:bg-base-300 transition-colors"
          title="Checklist"
        >
          ☐ Todo
        </button>
        <button
          onClick={() => insertFormatting("> ", "\n")}
          className="btn btn-xs btn-ghost hover:bg-base-300 transition-colors"
          title="Quote"
        >
          &ldquo; Quote
        </button>

        <div className="flex-1"></div>

        {/* Manual save */}
        <button
          onClick={() => saveNote(content)}
          className="btn btn-xs btn-ghost hover:bg-base-300 transition-colors gap-1"
          title="Save (⌘S)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Save
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start taking notes... (Markdown supported)"
        className="w-full min-h-[400px] bg-base-200/30 border-2 border-transparent focus:border-primary-500 focus:shadow-glow rounded-2xl p-4 text-sm font-mono leading-relaxed resize-y transition-all duration-300 outline-none"
        spellCheck={false}
      />

      {/* Footer hint */}
      <div className="flex items-center justify-between mt-3 text-xs text-base-content/40">
        <span>Markdown supported • Auto-saves after 2s of inactivity</span>
        <span>⌘B Bold • ⌘I Italic • ⌘S Save</span>
      </div>
    </div>
  );
}
