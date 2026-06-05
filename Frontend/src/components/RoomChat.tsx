"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  type: "user" | "ai" | "system";
}

interface RoomChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUserId: string;
}

export default function RoomChat({
  messages,
  onSendMessage,
  currentUserId,
}: RoomChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin scrollbar-thumb-primary-500/30 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="text-center py-8 text-base-content/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto mb-2 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1 text-base-content/30">
              Type <span className="font-mono text-primary-500">@ai</span> to ask the AI assistant
            </p>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.type === "system") {
            return (
              <div key={msg.id} className="text-center">
                <span className="text-xs text-base-content/40 bg-base-200/50 rounded-full px-3 py-1">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.userId === currentUserId;
          const isAI = msg.type === "ai";

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-slide-up`}
            >
              <div className={`max-w-[85%] ${isMe ? "order-2" : "order-1"}`}>
                {/* User name */}
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {isAI ? (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">
                          {msg.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className={`text-xs font-medium ${isAI ? "text-violet-400" : "text-base-content/50"}`}>
                      {msg.userName}
                    </span>
                    <span className="text-[10px] text-base-content/30">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isAI
                      ? "bg-violet-500/10 border border-violet-500/20 rounded-tl-md text-base-content"
                      : isMe
                      ? "gradient-primary text-white rounded-br-md"
                      : "glass border border-base-content/10 rounded-bl-md text-base-content"
                  }`}
                >
                  {isAI ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Time for own messages */}
                {isMe && (
                  <div className="flex justify-end px-1 mt-0.5">
                    <span className="text-[10px] text-base-content/30">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-base-content/10">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message... (@ai to ask AI)"
              className="input input-bordered w-full pr-10 bg-base-200/50 border-base-content/10 focus:border-primary-500 text-sm rounded-xl"
            />
            {input.toLowerCase().startsWith("@ai") && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="btn btn-circle btn-sm gradient-primary text-white border-0 hover:opacity-90 disabled:opacity-30"
          >
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
