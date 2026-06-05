"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface ChatbotProps {
  videoLink: string;
  videoTitle: string;
  videoTranscript: string;
  onAddToNotes?: (text: string) => void;
}

export default function Chatbot({
  videoLink,
  videoTitle,
  videoTranscript,
  onAddToNotes,
}: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedToNotes, setAddedToNotes] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleAddToNotes = useCallback(
    (text: string, index: number) => {
      if (onAddToNotes) {
        onAddToNotes(text);
        setAddedToNotes((prev) => new Set(prev).add(index));
        setTimeout(() => {
          setAddedToNotes((prev) => {
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
        }, 2000);
      }
    },
    [onAddToNotes]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessage: ChatMessage = { sender: "user", text: input };
      setMessages([...messages, newMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const GOOGLEAPI = process.env.NEXT_PUBLIC_GOOGLEAPI;
        if (!GOOGLEAPI) throw new Error("Google API key not configured");

        const genAI = new GoogleGenerativeAI(GOOGLEAPI);
        const model = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
          systemInstruction: `You are an AI learning assistant for EduTube. You help the user understand a YouTube video. Video title: ${videoTitle}. Video link: ${videoLink}. Here is the video transcript:\n${videoTranscript}`,
        });

        const generationConfig = {
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
        };

        const chatSession = model.startChat({
          generationConfig,
          history: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          })),
        });

        const result = await chatSession.sendMessage(input);

        const responseText = result.response.text();
        const aiMessage: ChatMessage = { sender: "ai", text: responseText };

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        const errorMessage: ChatMessage = {
          sender: "ai",
          text: "❌ Failed to fetch AI response. Please try again.",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (text: string) => {
    return (
      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            pre: ({ node, ...props }) => (
              <div className="mockup-code my-3 bg-base-300 shadow-lg">
                <pre data-prefix="$" className="text-success" {...props} />
              </div>
            ),
            code: ({ node, ...props }) => (
              <code className="text-sm bg-base-300 rounded px-1" {...props} />
            ),
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold text-primary-500" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="chatbot glass-strong rounded-3xl p-6 w-full shadow-xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-poppins font-bold text-2xl gradient-text mb-2">
          AI Learning Assistant
        </h3>
        <p className="text-sm text-base-content/60">
          Ask questions about the video content
        </p>
      </div>

      {/* Messages Container */}
      <div className="messages mb-6 space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-base-200">
        {messages.length === 0 && (
          <div className="text-center py-12 text-base-content/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="font-medium">Start a conversation!</p>
            <p className="text-sm mt-1">Ask anything about the video</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } animate-slide-up`}
          >
            <div
              className={`max-w-[80%] ${
                message.sender === "user"
                  ? "gradient-primary text-white rounded-3xl rounded-br-md"
                  : "glass rounded-3xl rounded-bl-md border border-base-content/10"
              } p-4 shadow-md hover-lift transition-all duration-300`}
            >
              <div
                className={`text-sm leading-relaxed ${
                  message.sender === "user"
                    ? "text-white"
                    : "text-base-content"
                }`}
              >
                {renderMessageContent(message.text)}
              </div>
              {message.sender === "ai" && onAddToNotes && (
                <div className="flex justify-end mt-2 pt-2 border-t border-base-content/5">
                  <button
                    onClick={() => handleAddToNotes(message.text, index)}
                    className={`btn btn-xs gap-1 transition-all duration-300 ${
                      addedToNotes.has(index)
                        ? "btn-success text-white"
                        : "btn-ghost text-base-content/50 hover:text-primary-500"
                    }`}
                    disabled={addedToNotes.has(index)}
                  >
                    {addedToNotes.has(index) ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add to Notes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message flex justify-start animate-slide-up">
            <div className="glass rounded-3xl rounded-bl-md p-4 shadow-md border border-base-content/10">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about the video..."
            className="textarea textarea-bordered w-full bg-base-200 border-2 border-transparent focus:border-primary-500 focus:shadow-glow transition-all duration-300 resize-none"
            rows={2}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="btn gradient-primary text-white font-semibold px-6 border-0 hover-scale hover-glow shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-auto min-h-[3rem]"
        >
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}
