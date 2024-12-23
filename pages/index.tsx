"use client";

import { useState, useEffect, useCallback } from "react";
import { FiSend, FiLink, FiClock, FiUser, FiMessageSquare, FiBook, FiFile, FiX } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import Quiz from '@/components/Quiz';
import { cs3319Questions } from '@/data/cs3319questions';

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  files?: string[];
  error?: boolean;
  processing?: boolean;
  timestamp?: number;
};

interface FileUpload {
  file: File;
  preview: string;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm InsightAI, your intelligent research assistant. I can help analyze URLs, documents, and answer questions. You can type a message or drag & drop files to get started!",
      timestamp: Date.now()
    },
  ]);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(true);

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10485760, // 10MB
  });

  // Cleanup file previews
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [uploadedFiles]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Rate limit timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (retryAfter) {
      timer = setTimeout(() => setRetryAfter(null), retryAfter * 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [retryAfter]);

  const handleSend = async () => {
    if (!message.trim() && uploadedFiles.length === 0) return;
    if (retryAfter) return;

    setIsLoading(true);
    const currentMessage = message;
    setMessage("");

    // Add user message
    setMessages(prev => [
      ...prev,
      { 
        role: "user", 
        content: currentMessage,
        files: uploadedFiles.map(f => f.file.name),
        timestamp: Date.now()
      }
    ]);

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('message', currentMessage);
      
      // Append files
      uploadedFiles.forEach((upload, index) => {
        formData.append(`file${index}`, upload.file);
      });

      // Add previous messages
      formData.append('previousMessages', JSON.stringify(messages.slice(-3)));

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      // Check for rate limiting
      const retryAfterHeader = response.headers.get('Retry-After');
      if (retryAfterHeader) {
        setRetryAfter(parseInt(retryAfterHeader));
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // If the response was chunked, add a processing message
      if (data.chunked) {
        setMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: "Processing large content in chunks...",
            processing: true,
            timestamp: Date.now()
          }
        ]);
      }

      // Add assistant message
      setMessages(prev => [
        ...prev.filter(m => !m.processing),
        { 
          role: "assistant", 
          content: data.content,
          sources: data.sources,
          timestamp: Date.now()
        },
      ]);

      // Clear uploaded files after successful send
      setUploadedFiles([]);

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: error instanceof Error 
            ? error.message.replace(/\b(status code|code|HTTP) \d{3}\b/gi, '')
            : "Sorry, I encountered an error processing your request.",
          error: true,
          timestamp: Date.now()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isQuizMode) {
    return (
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-black">
        <header className="fixed top-0 w-full bg-black/50 backdrop-blur-md z-50 border-b border-gray-800">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiBook className="text-blue-500 text-2xl" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                CS3319 Quiz Mode
              </h1>
            </div>
            <div className="text-gray-400">
              Good luck with your finals! - Alex Dang
            </div>
          </div>
        </header>

        <div className="flex-1 pt-24">
          <Quiz questions={cs3319Questions} onExit={() => setIsQuizMode(false)} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/50 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiMessageSquare className="text-blue-500 text-2xl" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              InsightAI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsQuizMode(true)}
              className="px-4 py-2 bg-purple-600/20 text-purple-200 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors flex items-center space-x-2"
            >
              <FiBook />
              <span>CS3319 Quiz</span>
            </button>
            <div className="text-gray-400">
              Good luck with your finals! - Alex Dang
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-32">
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start space-x-3 max-w-2xl ${
                msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" 
                    ? "bg-blue-600" 
                    : msg.error 
                    ? "bg-red-600"
                    : msg.processing
                    ? "bg-orange-600"
                    : "bg-purple-600"
                }`}>
                  {msg.role === "user" ? <FiUser /> : <FiMessageSquare />}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col space-y-1 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}>
                  {/* Name and Time */}
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{msg.role === "user" ? "You" : "InsightAI"}</span>
                    {msg.timestamp && (
                      <>
                        <span>•</span>
                        <span>{formatTime(msg.timestamp)}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : msg.error
                      ? "bg-red-600/10 text-red-200 border border-red-600/20"
                      : msg.processing
                      ? "bg-orange-600/10 text-orange-200 border border-orange-600/20"
                      : "bg-gray-800/50 text-gray-100 border border-gray-700"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Files */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700/50">
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <FiFile className="text-gray-500" />
                          <span>Files:</span>
                        </div>
                        <div className="mt-1">
                          {msg.files.map((file, i) => (
                            <div key={i} className="text-sm text-blue-400">
                              {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700/50">
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <FiLink className="text-gray-500" />
                          <span>Sources:</span>
                        </div>
                        <div className="mt-1 space-y-1">
                          {msg.sources.map((source, i) => (
                            <a
                              key={i}
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-400 hover:text-blue-300 truncate"
                            >
                              {source}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      

      {/* Input Area with Integrated File Upload */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col space-y-2">
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 bg-gray-800/50 rounded px-3 py-1"
                  >
                    <FiFile className="text-gray-400" />
                    <span className="text-sm text-gray-300">{file.file.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        URL.revokeObjectURL(file.preview);
                        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <div {...getRootProps()} className="relative bg-gray-800/50 rounded-lg border border-gray-700">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={retryAfter 
                      ? `Please wait ${retryAfter} seconds...`
                      : "Ask a question, paste URLs, or drag files here..."}
                    className="w-full p-3 pr-12 bg-transparent text-gray-100 placeholder-gray-500 resize-none focus:outline-none"
                    rows={3}
                    disabled={isLoading || retryAfter !== null}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                    <button 
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-700/50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.txt,.docx';
                        input.multiple = true;
                        input.onchange = (e) => {
                          const files = e.target?.files;
                          if (files) onDrop(Array.from(files));
                        };
                        input.click();
                      }}
                    >
                      <FiFile className="w-5 h-5" />
                    </button>
                  </div>
                  {isDragActive && (
                    <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center">
                      <p className="text-blue-400">Drop files here...</p>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleSend}
                disabled={isLoading || retryAfter !== null || (!message.trim() && uploadedFiles.length === 0)}
                className="flex items-center justify-center h-12 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <FiClock className="animate-spin" /> : <FiSend />}
                <span className="ml-2">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}