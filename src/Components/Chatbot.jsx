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
        console.log(GOOGLEAPI)
        const genAI = new GoogleGenerativeAI(GOOGLEAPI);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
                { text: `Video link: ${videoLink}, Video title: ${videoTitle}, Transcript: ${videoTranscript}` },
                { text: input },
              ],
            },
          ],
        });

        const result = await chatSession.sendMessage(input);
        const aiMessage = { sender: 'ai', text: result.response.text() };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        const errorMessage = { sender: 'ai', text: 'Failed to fetch AI response.' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }

      setInput('');
    }
  };

  return (
    <div className="chatbot p-4 bg-gray-100 w-1/3 h-full">
      <div className="messages mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
        className="w-full p-2 border border-gray-300 rounded"
      />
      <button onClick={handleSendMessage} className="w-full mt-2 p-2 bg-blue-500 text-white rounded">
        Send
      </button>
    </div>
  );
};

export default Chatbot;