"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import { useStore } from "@/lib/store";
import { MessageSquare, Send, Cpu, Bot, Mic, MicOff, Info } from "lucide-react";

export default function ChatPage() {
  const { documents, selectedDocId, chatThreads, addMessage } = useStore();
  const [inputText, setInputText] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [isAiReplying, setIsAiReplying] = useState(false);

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const activeThread = activeDoc ? (chatThreads[activeDoc.id] || []) : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeDoc) return;

    const userText = inputText;
    setInputText("");
    addMessage(activeDoc.id, userText, "user");
    setIsAiReplying(true);

    setTimeout(() => {
      let aiResponse = `Calculated response for your query on '${activeDoc.title}': The documentation suggests checking basic formulas and active concepts coordinates. Let me know if you would like me to generate a custom test question for this section!`;
      addMessage(activeDoc.id, aiResponse, "ai");
      setIsAiReplying(false);
    }, 1200);
  };

  const handleVoiceToggle = () => {
    setVoiceActive(!voiceActive);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative select-none">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col justify-between h-[calc(100vh-64px)]">
        
        {/* Top Info Banner */}
        {activeDoc && (
          <div className="bg-card border border-border p-3.5 rounded-xl glass-card text-xs flex items-center justify-between shadow-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-primary shrink-0" />
              Connected Model Context: <strong className="text-foreground truncate max-w-[200px]">{activeDoc.title}</strong>
            </span>
            <span className="text-[10px] text-zinc-500">{activeDoc.size} cached vectors</span>
          </div>
        )}

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto my-6 space-y-4 pr-2">
          {activeThread.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <MessageSquare className="h-12 w-12 text-primary dark:text-purple-400" />
              <h2 className="text-lg font-bold text-foreground">Launch conversation tutor</h2>
              <p className="text-xs text-muted-foreground max-w-xs">Select study notes from the sidebar library in the study workspace to feed context vectors here.</p>
            </div>
          ) : (
            activeThread.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col gap-1 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-primary text-white" 
                    : "bg-card border border-border text-foreground glass-card shadow-sm"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-zinc-500 px-1">{msg.timestamp}</span>
              </div>
            ))
          )}

          {/* AI Loader */}
          {isAiReplying && (
            <div className="mr-auto items-start max-w-[80%] flex items-center gap-2">
              <div className="bg-card border border-border rounded-2xl px-4 py-3 text-sm text-muted-foreground glass-card flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="space-y-3.5">
          {/* Quick-start options */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["Explain formulas", "Summarize keypoints", "Warnings tips"].map((query) => (
              <button
                key={query}
                onClick={() => setInputText(query)}
                className="rounded-full border border-border bg-card/60 hover:bg-muted text-[10px] font-semibold text-muted-foreground hover:text-foreground px-3.5 py-1.5 transition-all"
              >
                {query}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            {/* Voice speech simulator button */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`rounded-xl border p-3.5 transition-all ${
                voiceActive 
                  ? "border-primary bg-primary/10 text-primary dark:text-purple-400" 
                  : "border-border bg-card hover:bg-muted text-muted-foreground"
              }`}
              title="Toggle Simulated Speech Mic"
            >
              {voiceActive ? <Mic className="h-5 w-5 animate-pulse" /> : <MicOff className="h-5 w-5" />}
            </button>

            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={voiceActive ? "Listening for speech doubt input..." : "Type deep conceptual doubt question..."}
              className="w-full rounded-xl border border-border bg-card/60 px-4 py-3.5 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isAiReplying}
              className="rounded-xl bg-primary px-6 text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center shrink-0"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

          {voiceActive && (
            <p className="text-center text-[10px] text-primary dark:text-purple-400 animate-pulse font-semibold">
              Simulating Speech Recognition: Speak clearly into your microphone device.
            </p>
          )}
        </div>

      </main>
    </div>
  );
}
