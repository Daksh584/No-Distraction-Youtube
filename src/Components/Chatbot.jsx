import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbot = ({ videoLink, videoTitle, videoTranscript }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessage = { sender: 'user', text: input };
      setMessages([...messages, newMessage]);

      try {
        const GOOGLEAPI = import.meta.env.VITE_GOOGLEAPI;
        const genAI = new GoogleGenerativeAI(GOOGLEAPI);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const generationConfig = {
          temperature: 1,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        };

        const chatSession = model.startChat({
          generationConfig,
          history: [
            {
              role: "user",
              parts: [
                { text: `Video link: ${videoLink}, Video title: ${videoTitle}, Video transcript: ${videoTranscript}` },
                { text: input },
              ],
            },
          ],
        });

        const result = await chatSession.sendMessage(input);
        
        const responseText = result.response.text();
        const aiMessage = { sender: 'ai', text: responseText };

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        const errorMessage = { sender: 'ai', text: 'Failed to fetch AI response.' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
      
      setInput('');
    }
  };

  const renderMessageContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```|\*\*[\s\S]*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        return (
          <div className="mockup-code my-2" key={index}>
            <pre data-prefix="~"><code>{part.slice(3, -3)}</code></pre>
          </div>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="chatbot p-4 bg-base-200 rounded-lg w-full h-full">
      <div className="messages mb-4 space-y-2">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === 'user' ? 'text-right bg-primary text-primary-content' : 'text-left bg-blue-200 text-blue-900'} p-2 rounded-lg`}>
            {renderMessageContent(message.text)}
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="input input-bordered w-full"
        />
        <button onClick={handleSendMessage} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;