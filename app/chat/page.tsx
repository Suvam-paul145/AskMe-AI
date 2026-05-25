"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import { useStore } from "@/lib/store";
import { 
  Send, 
  Bot, 
  Cpu, 
  HelpCircle, 
  Layers, 
  Activity, 
  Calendar, 
  Sparkles, 
  Info,
  Mic,
  MicOff,
  Brain
} from "lucide-react";

export default function ChatPage() {
  const { documents, selectedDocId, chatThreads, addMessage } = useStore();
  const [inputText, setInputText] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  // Active doc references
  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const activeThread = activeDoc ? (chatThreads[activeDoc.id] || []) : [];

  // Dynamic context metrics matching user query
  const [prereqGaps, setPrereqGaps] = useState<string[]>(["Permittivity constants", "Vector geometry integration"]);
  const [relatedConcepts, setRelatedConcepts] = useState<string[]>(["Superposition Principle", "Electric Field mappings"]);
  const [memoryStrength, setMemoryStrength] = useState<number>(75);
  const [revisionUrgency, setRevisionUrgency] = useState<string>("Low (Calibrated)");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeDoc) return;

    const userText = inputText;
    setInputText("");
    addMessage(activeDoc.id, userText, "user");
    setIsAiReplying(true);

    // Dynamic shift of context side panels based on input keywords
    const lower = userText.toLowerCase();
    setTimeout(() => {
      if (lower.includes("formula") || lower.includes("law")) {
        setPrereqGaps(["Shell theorem limitations", "Vector cross products"]);
        setRelatedConcepts(["Gauss's law index", "Coulomb mechanical limits"]);
        setMemoryStrength(62);
        setRevisionUrgency("High (Decaying)");
      } else {
        setPrereqGaps(["Permittivity constants", "Vector geometry integration"]);
        setRelatedConcepts(["Superposition Principle", "Electric Field mappings"]);
        setMemoryStrength(80);
        setRevisionUrgency("Low (Calibrated)");
      }

      let aiResponse = `Cognitive RAG context match processed for '${activeDoc.title}': The documentation details structural coordinates and equations. Let me know if you would like to run a Reverse Teacher aktive recall session to test coverage!`;
      addMessage(activeDoc.id, aiResponse, "ai");
      setIsAiReplying(false);
    }, 2000); // 2 second response simulation for the thinking animation to breathe
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* LEFT COLUMN — AI DOUBT CHAT PANEL (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full bg-card/15 border border-border/80 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-20 pointer-events-none" />

          {/* Active doc HUD header */}
          {activeDoc && (
            <div className="flex items-center justify-between border-b border-border/80 pb-4 text-xs font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
                Active Context: <strong className="text-foreground truncate max-w-[180px]">{activeDoc.title}</strong>
              </span>
              <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary dark:text-purple-400 px-2.5 py-0.5 rounded-full font-bold">RAG Active</span>
            </div>
          )}

          {/* Chat message list area */}
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2 max-h-[380px]">
            {activeThread.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 py-20">
                <Brain className="h-12 w-12 text-primary/40 animate-drift" />
                <h3 className="text-base font-bold text-foreground">Launch Cognitive Conversation</h3>
                <p className="text-xs text-muted-foreground max-w-xs">Upload study notes on the Ingestion screen to align the AI tutor context.</p>
              </div>
            ) : (
              activeThread.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col gap-1 max-w-[80%] ${
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-primary text-white font-medium" 
                      : "bg-card/90 border border-border text-foreground glass-card shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-zinc-500 px-1">{msg.timestamp}</span>
                </div>
              ))
            )}

            {/* Simulated AI wave thinking loader */}
            {isAiReplying && (
              <div className="mr-auto items-start max-w-[70%] w-full animate-float">
                <div className="bg-card/90 border border-border rounded-2xl p-4 w-full glass-card space-y-2">
                  <div className="h-1.5 w-full rounded bg-muted/40 overflow-hidden relative border border-border">
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse wave-thinking" />
                  </div>
                  <span className="text-[10px] text-primary dark:text-purple-400 font-bold uppercase tracking-wider block animate-pulse">Stitching memory vectors...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form and Quick suggestions */}
          <div className="space-y-4 pt-4 border-t border-border/80">
            <form onSubmit={handleSend} className="flex gap-2">
              <button
                type="button"
                onClick={() => setVoiceActive(!voiceActive)}
                className={`rounded-xl border p-3.5 transition-all ${
                  voiceActive 
                    ? "border-primary bg-primary/10 text-primary animate-pulse" 
                    : "border-border bg-card hover:bg-muted text-muted-foreground"
                }`}
                title="Toggle Mic Input"
              >
                <Mic className="h-5 w-5" />
              </button>

              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={voiceActive ? "Listening..." : "Query the model context..."}
                className="w-full rounded-xl border border-border bg-card/60 px-4 py-3.5 text-xs text-foreground focus:border-primary focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isAiReplying}
                className="rounded-xl bg-primary px-6 text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN — COGNITIVE CONTEXT PANEL (col-span-4) */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 max-h-[500px]">
          <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-4.5 w-4.5 text-primary" />
            Active Cognition HUD
          </h2>

          {/* Prerequisite Gaps */}
          <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Prerequisite Gaps
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {prereqGaps.map((gap, idx) => (
                <div key={idx} className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-2.5 text-[10px] text-rose-500 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Concepts */}
          <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              Related Concepts
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {relatedConcepts.map((concept, idx) => (
                <div key={idx} className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-[10px] text-primary dark:text-purple-400 font-semibold">
                  {concept}
                </div>
              ))}
            </div>
          </div>

          {/* Memory Strength & Spacing status */}
          <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Memory Strength:</span>
                <span className="text-primary dark:text-purple-400 font-extrabold">{memoryStrength}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500" 
                  style={{ width: `${memoryStrength}%` }}
                />
              </div>
            </div>

            <div className="h-[1px] bg-border/80" />

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                Revision Urgency:
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                revisionUrgency.includes("High") 
                  ? "border-rose-500/20 bg-rose-500/5 text-rose-500" 
                  : "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
              }`}>
                {revisionUrgency}
              </span>
            </div>
          </div>

          <div className="bg-card/60 border border-border p-4 rounded-xl flex items-start gap-2.5 text-[10px] text-muted-foreground leading-normal">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>The AI dynamically parses context chunks matching your input keywords to calibrate the related concepts panel coordinates.</span>
          </div>

        </div>

      </main>
    </div>
  );
}
