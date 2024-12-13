"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  error?: boolean;
  processing?: boolean;
};

type UrlContext = {
  url: string;
  addedAt: number;
  failed?: boolean;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [urlContext, setUrlContext] = useState<UrlContext[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! How can I help you today? You can paste URLs for me to analyze, or ask a question directly." },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() && urls.length === 0) return;

    setIsLoading(true);
    const currentMessage = message;
    setMessage("");

    // Add user message
    setMessages(prev => [
      ...prev,
      { role: "user", content: currentMessage }
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: currentMessage,
          urls,
          previousMessages: messages
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        throw new Error(data.error || "Failed to get response");
      }

      // Update URL context with any failed URLs
      if (urls.length > 0) {
        setUrlContext(prev => [
          ...prev,
          ...urls.map(url => ({
            url,
            addedAt: Date.now(),
            failed: data.failedUrls?.includes(url)
          }))
        ]);

        // If there were failed URLs, add a warning message
        if (data.failedUrls?.length > 0) {
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: `⚠️ Failed to access: ${data.failedUrls.join(", ")}`,
              error: true
            }
          ]);
        }
      }

      // If the response was chunked, add a processing message
      if (data.chunked) {
        setMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: "Processing large content in chunks...",
            processing: true
          }
        ]);
      }

      // Add assistant message
      setMessages(prev => [
        ...prev.filter(m => !m.processing), // Remove any processing messages
        { 
          role: "assistant", 
          content: data.content,
          sources: data.sources
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: error instanceof Error 
            ? `Error: ${error.message}` 
            : "Sorry, I encountered an error processing your request.",
          error: true
        },
      ]);
    } finally {
      setIsLoading(false);
      setUrls([]); // Clear URLs after sending
    }
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputUrls = e.target.value.split(/[\n,]/).map(url => url.trim()).filter(url => {
      try {
        new URL(url); // This will throw if URL is invalid
        return true;
      } catch {
        return false;
      }
    });
    setUrls(inputUrls);
  };

  // Display all active URLs in the context
  const activeUrls = Array.from(new Set([...urlContext.map(ctx => ctx.url), ...urls]));

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {activeUrls.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h2 className="text-white font-semibold mb-2">Active Context URLs:</h2>
              <ul className="list-disc pl-4 space-y-1">
                {activeUrls.map((url, index) => {
                  const contextUrl = urlContext.find(ctx => ctx.url === url);
                  return (
                    <li key={index} className={`${contextUrl?.failed ? 'text-red-400' : 'text-blue-400'}`}>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`hover:text-blue-300 break-all ${contextUrl?.failed ? 'line-through' : ''}`}
                      >
                        {url}
                      </a>
                      {contextUrl?.failed && (
                        <span className="ml-2 text-red-400">(failed to access)</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto max-w-md"
                  : msg.error
                  ? "bg-red-900 mr-auto max-w-2xl"
                  : msg.processing
                  ? "bg-orange-900 mr-auto max-w-2xl"
                  : "bg-gray-800 mr-auto max-w-2xl"
              }`}
            >
              <p className="text-white">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 text-sm text-gray-300">
                  <p className="font-semibold">Sources:</p>
                  <ul className="list-disc pl-4">
                    {msg.sources.map((source, index) => {
                      const contextUrl = urlContext.find(ctx => ctx.url === source);
                      return (
                        <li key={index}>
                          <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-blue-400 hover:text-blue-300 break-all ${
                              contextUrl?.failed ? 'line-through text-red-400' : ''
                            }`}
                          >
                            {source}
                          </a>
                          {contextUrl?.failed && (
                            <span className="ml-2 text-red-400">(failed to access)</span>
                          )}
                        </li>
                      );
                    })}
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
              disabled={isLoading || (!message.trim() && urls.length === 0)}
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
