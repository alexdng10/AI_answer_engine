"use client";

import { useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
  sources?: string[];
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! How can I help you today? You can paste URLs for me to analyze, or ask a question directly." },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() && !urls.length) return;

    // Add user message to the conversation
    const userMessage = { role: "user" as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, urls }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [
          ...prev,
          { 
            role: "ai", 
            content: data.content,
            sources: data.sources 
          },
        ]);
        // Clear URLs after successful response
        setUrls([]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "Sorry, I encountered an error processing your request." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputUrls = e.target.value.split(/[\n,]/).map(url => url.trim()).filter(url => url);
    setUrls(inputUrls);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto max-w-md"
                  : "bg-gray-800 mr-auto max-w-2xl"
              }`}
            >
              <p className="text-white">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 text-sm text-gray-300">
                  <p className="font-semibold">Sources:</p>
                  <ul className="list-disc pl-4">
                    {msg.sources.map((source, index) => (
                      <li key={index}>
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 break-all"
                        >
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </main>

      <div className="border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <textarea
            className="w-full p-2 bg-gray-800 text-white rounded-lg resize-none"
            rows={3}
            placeholder="Paste URLs here (one per line or comma-separated)"
            value={urls.join("\n")}
            onChange={handleUrlInput}
          />
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 p-2 bg-gray-800 text-white rounded-lg"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!message.trim() && !urls.length)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
