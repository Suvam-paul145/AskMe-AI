"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "@/components/navbar";
import { useStore } from "@/lib/store";
import { 
  Send, 
  Bot, 
  Cpu, 
  Layers, 
  Calendar, 
  Sparkles, 
  Info,
  Mic,
  Brain
} from "lucide-react";

export default function ChatPage() {
  const { documents, selectedDocId, chatThreads, sendMessage, loadChatHistory, profile } = useStore();
  const [inputText, setInputText] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mode Selection States: auto (Auto-Detect), ask, learning, agent
  const [activeMode, setActiveMode] = useState<"auto" | "ask" | "learning" | "agent">("auto");

  // Conversational Voice Mode Interface States
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [voiceState, setVoiceState] = useState<"connecting" | "ready" | "listening" | "speaking" | "ended">("connecting");
  const [speechTranscript, setSpeechTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);

  // Cleanup speech resources on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
    };
  }, []);

  // Initialize Speech Recognition
  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Cancel synthesis to prevent feedback loop
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setVoiceState("listening");
    };

    rec.onresult = async (event: any) => {
      const resultText = event.results[0][0].transcript;
      setSpeechTranscript(resultText);
      setVoiceState("speaking");
      
      if (activeDoc) {
        setIsAiReplying(true);
        // Force the prompt to return an extremely short, simple story-based answer for voice mode
        const voicePrompt = `${resultText} (IMPORTANT voice instruction: Reply with a highly concise, simple story-like answer under 3 sentences for direct voice speaking).`;
        
        try {
          const aiResponse = await sendMessage(activeDoc.id, voicePrompt, activeMode === "auto" ? detectIntent(resultText) : activeMode);
          
          // Read AI response back aloud!
          speakText(aiResponse);
        } catch (e) {
          console.error("Speech send error:", e);
          setVoiceState("ready");
          setIsAiReplying(false);
        }
      }
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setVoiceState("ready");
    };

    rec.onend = () => {
      // Allow speech synthesis transition or fallback
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Read AI Text Aloud using Web Speech Synthesis
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Remove markdown code fences and symbols for clean reading
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[#*`_]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 320));
    utterance.lang = "en-US";
    
    utterance.onstart = () => {
      setVoiceState("speaking");
      setIsAiReplying(false);
    };

    utterance.onend = () => {
      setVoiceState("ready");
      // Auto restart listening for a true hands-free talking loop!
      setTimeout(() => {
        if (showVoiceOverlay) {
          startSpeechRecognition();
        }
      }, 400);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setVoiceState("ready");
    };

    window.speechSynthesis.speak(utterance);
  };

  const endVoiceMode = () => {
    if (typeof window !== "undefined") {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    setShowVoiceOverlay(false);
    setVoiceState("connecting");
    setSpeechTranscript("");
  };

  const launchVoiceMode = () => {
    setShowVoiceOverlay(true);
    setVoiceState("connecting");
    
    setTimeout(() => {
      setVoiceState("ready");
      startSpeechRecognition();
    }, 1500);
  };

  // Client-side text intent analyzer for auto-switching
  const detectIntent = (text: string): "ask" | "learning" | "agent" => {
    const t = text.toLowerCase().trim();
    if (!t) return "ask"; // Default
    
    // Agent mode: diagnostics, guide requests, weak topics, performance analysis
    if (t.match(/guide|perform|progress|score|diagnos|how am i|my level|weak|strength|improve|help me study/)) {
      return "agent";
    }
    
    // Learning mode: socratic teaching, socratic, explaining, diagrams, quizzes, math definitions
    if (t.match(/explain|teach|learn|what is|why does|how does|define|concept|formula|quiz|diagram|flowchart/)) {
      return "learning";
    }
    
    // Ask mode: general random questions
    return "ask";
  };

  // Active doc references
  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const activeThread = useMemo(() => {
    return activeDoc ? (chatThreads[activeDoc.id] || []) : [];
  }, [activeDoc, chatThreads]);

  // Load chat history when active doc changes
  useEffect(() => {
    if (activeDoc?.id) {
      loadChatHistory(activeDoc.id);
    }
  }, [activeDoc?.id, loadChatHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread]);

  // Dynamic context panel state
  const [memoryStrength, setMemoryStrength] = useState<number>(75);
  const [revisionUrgency, setRevisionUrgency] = useState<string>("Low (Calibrated)");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeDoc || isAiReplying) return;

    const userText = inputText;
    setInputText("");
    setIsAiReplying(true);

    // Resolve mode based on user lock or intent auto-detection
    const resolvedMode = activeMode === "auto" ? detectIntent(userText) : activeMode;

    try {
      await sendMessage(activeDoc.id, userText, resolvedMode);
      // Update context panel based on interaction
      setMemoryStrength(prev => Math.min(100, prev + 3));
      setRevisionUrgency("Low (Calibrated)");
    } catch (err) {
      console.error("Chat send error:", err);
    } finally {
      setIsAiReplying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* LEFT COLUMN — AI DOUBT CHAT PANEL (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full bg-card/15 border border-border/80 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-20 pointer-events-none" />

          {/* ChatGPT-Style Immersive Voice Mode Overlay */}
          {showVoiceOverlay && (
            <div className="absolute inset-0 bg-[#040406]/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fade-in select-none">
              
              {/* Voice Mode Indicator */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary dark:text-purple-400">
                <Bot className="h-3.5 w-3.5 animate-pulse" />
                <span>AskMe AI Interactive Voice</span>
              </div>

              {/* Pulsing Audio Circles Visualizer */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer ring */}
                <div className={`absolute inset-0 rounded-full bg-primary/5 border border-primary/10 transition-all duration-1000 ${
                  voiceState === "listening" ? "scale-110 animate-ping opacity-60" : voiceState === "speaking" ? "scale-125 animate-ping opacity-45" : "scale-100 opacity-20"
                }`} />
                
                {/* Middle ring */}
                <div className={`absolute w-36 h-36 rounded-full bg-primary/10 border border-primary/20 transition-all duration-500 ${
                  voiceState === "listening" ? "scale-105 animate-pulse" : voiceState === "speaking" ? "scale-110 animate-pulse" : "scale-100 opacity-40"
                }`} />

                {/* Core */}
                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-xl border border-white/10 z-10">
                  <Brain className={`h-10 w-10 text-white ${
                    voiceState === "connecting" ? "animate-spin" : voiceState === "listening" ? "animate-pulse" : voiceState === "speaking" ? "animate-bounce" : ""
                  }`} />
                </div>
              </div>

              {/* Viewport Status Header */}
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight uppercase">
                  {voiceState === "connecting" ? "Connecting to Voice" : 
                   voiceState === "listening" ? "Listening..." : 
                   voiceState === "speaking" ? "AI is Explaining" : "Start Talking"}
                </h3>
                <p className="text-xs text-zinc-400 font-light max-w-xs leading-normal">
                  {voiceState === "connecting" ? "Establishing secure cognitive audio channels..." :
                   voiceState === "listening" ? "Speak now! Ask anything about your revision material." :
                   voiceState === "speaking" ? "Tuning response for optimal socratic audio retention..." :
                   "Ready when you are. Press speak to resume conversation."}
                </p>
              </div>

              {/* Dynamic Speech Text HUD */}
              {(speechTranscript || isAiReplying) && (
                <div className="bg-[#0d0d11]/80 border border-white/5 p-4 rounded-2xl max-w-md w-full backdrop-blur-md space-y-2 text-left">
                  {speechTranscript && (
                    <div className="text-[10px] text-zinc-300 font-mono leading-relaxed">
                      <span className="text-primary font-bold mr-1">YOU:</span> &ldquo;{speechTranscript}&rdquo;
                    </div>
                  )}
                  {isAiReplying && (
                    <div className="text-[10px] text-primary font-mono animate-pulse flex items-center gap-1.5 pt-1.5 border-t border-white/5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                      <span>COMPILING CONCISE RESPONSE STORY...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Viewport Actions */}
              <div className="flex items-center gap-4 z-40">
                {voiceState !== "connecting" && (
                  <button
                    key="action-voice"
                    type="button"
                    onClick={() => {
                      if (voiceState === "listening") {
                        recognitionRef.current?.abort();
                        setVoiceState("ready");
                      } else {
                        startSpeechRecognition();
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      voiceState === "listening" 
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                        : "bg-primary text-white border-primary/20 shadow-lg hover:bg-primary/95"
                    }`}
                  >
                    {voiceState === "listening" ? "🔇 Mute Input" : "🎙️ Talk Now"}
                  </button>
                )}
                
                <button
                  key="cancel-voice"
                  type="button"
                  onClick={endVoiceMode}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-card hover:bg-muted text-xs font-semibold text-zinc-300 hover:text-white transition-all"
                >
                  Cancel Voice Mode
                </button>
              </div>

            </div>
          )}

          {/* Active doc HUD header */}
          {activeDoc && (
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/80 pb-4 gap-4 z-10">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-300">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
                Active Context: <strong className="text-foreground truncate max-w-[150px]">{activeDoc.title}</strong>
              </span>
              
              {/* Premium segmented mode selector */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#09090b]/80 border border-white/5 p-1 rounded-2xl">
                {[
                  { id: "auto", label: "Auto-Detect", desc: "AI switches modes based on query keywords" },
                  { id: "ask", label: "Ask", desc: "Fast random questions & doubt solver" },
                  { id: "learning", label: "Learning", desc: "Socratic concept breakdowns & visual maps" },
                  { id: "agent", label: "Agent", desc: "Guides revision based on study performance" }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMode(m.id as typeof activeMode)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all relative ${
                      activeMode === m.id
                        ? "bg-primary text-white shadow-md border border-primary/20"
                        : "text-zinc-400 dark:text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                    title={m.desc}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat message list area */}
          <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
            {activeThread.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 py-20">
                <Brain className="h-12 w-12 text-primary/40 animate-drift" />
                <h3 className="text-base font-bold text-foreground">Launch Cognitive Conversation</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {documents.length === 0 
                    ? "Upload study notes on the Ingestion screen to align the AI tutor context."
                    : "Ask any question about your uploaded material. The AI will find the most relevant sections to answer."}
                </p>
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
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-300 px-1">{msg.timestamp}</span>
                    {msg.sources && msg.sources.length > 0 && (
                      <span className="text-[8px] text-primary/60 font-bold uppercase">📎 {msg.sources.length} sources</span>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* AI thinking loader */}
            {isAiReplying && (
              <div className="mr-auto items-start max-w-[70%] w-full animate-float">
                <div className="bg-card/90 border border-border rounded-2xl p-4 w-full glass-card space-y-2">
                  <div className="h-1.5 w-full rounded bg-muted/40 overflow-hidden relative border border-border">
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse wave-thinking" />
                  </div>
                  <span className="text-[10px] text-primary dark:text-purple-400 font-bold uppercase tracking-wider block animate-pulse">Searching vector embeddings...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form and Quick suggestions */}
          <div className="space-y-4 pt-4 border-t border-border/80">
            
            {/* Dynamic Auto-Selected Mode Badge */}
            {activeMode === "auto" && inputText.trim() && (
              <div className="flex items-center justify-between text-[9px] bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl text-primary animate-pulse">
                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Auto-Intent Analyzer Active
                </span>
                <span className="font-light">
                  Auto-selected: <strong className="uppercase font-extrabold">{detectIntent(inputText)} Mode</strong>
                </span>
              </div>
            )}

            {/* Mode-Specific Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 text-[9px] select-none">
              {(
                activeMode === "ask" || (activeMode === "auto" && detectIntent(inputText) === "ask") ? [
                  "Explain Coulomb's Law directly",
                  "Quick summary of this document",
                  "What is pgvector similarity score?"
                ] : activeMode === "learning" || (activeMode === "auto" && detectIntent(inputText) === "learning") ? [
                  "Draw a Mermaid concept map of database indexes",
                  "Teach me ACID compliance step-by-step",
                  "Compare RDBMS vs Document Stores"
                ] : [
                  "Guide me on my weak topics based on document performance",
                  "What should I study next to improve my score?",
                  "Generate a personalized cognitive revision plan"
                ]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInputText(s)}
                  className="px-2.5 py-1 rounded-lg border border-white/5 bg-[#0d0d11]/40 hover:bg-[#0d0d11]/90 text-zinc-400 hover:text-zinc-200 transition-all font-light"
                >
                  💡 &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <button
                type="button"
                onClick={launchVoiceMode}
                className="rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground p-3.5 transition-all"
                title="Launch Conversational Voice Mode"
              >
                <Mic className="h-5 w-5" />
              </button>

              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={voiceActive ? "Listening..." : "Ask a question about your study material..."}
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

        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 max-h-[500px] z-10">
          <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-4.5 w-4.5 text-primary" />
            Active Cognition HUD
          </h2>

          {/* Dynamic Mode HUD Card */}
          <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-primary animate-pulse" />
                {activeMode === "auto" ? "Intelligent Auto-Mode" : activeMode === "ask" ? "Ask Mode" : activeMode === "learning" ? "Learning Mode" : "Agent Guidance Mode"}
              </h3>
              <span className="text-[8px] uppercase tracking-wider bg-primary/10 text-primary dark:text-purple-400 font-bold px-2 py-0.5 rounded-full border border-primary/20">
                {activeMode === "auto" ? `Auto: ${detectIntent(inputText)}` : "Manual Lock"}
              </span>
            </div>
            
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {activeMode === "ask" || (activeMode === "auto" && detectIntent(inputText) === "ask") 
                ? "Calibrated to answer random questions, direct concept queries, and offer fast comprehensive doubt solving using RAG vector similarity."
                : activeMode === "learning" || (activeMode === "auto" && detectIntent(inputText) === "learning")
                ? "Calibrated for socratic tutoring. Instructed to build highly structured explanations, outline math variables, and output visual concept diagrams using Mermaid flowcharts."
                : `Adaptive revision guide active. Monitoring user archetype "${profile.archetype || 'Student'}", analytics constraints, and weak topics to custom-guide cognitive revision pathways.`}
            </p>
            
            <div className="grid grid-cols-2 gap-2 pt-2 text-[9px] font-mono text-zinc-400">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>RAG Similarity</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Gemini 3.5 Active</span>
              </div>
            </div>
          </div>

          {/* Document Summary */}
          {activeDoc?.summary && (
            <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Document Summary
              </h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {activeDoc.summary.overview}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {(activeDoc.summary.keyPoints || []).slice(0, 3).map((point, idx) => (
                  <div key={idx} className="bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-[10px] text-primary dark:text-purple-400 font-semibold">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confused Topics */}
          {activeDoc?.summary?.confusedTopics && activeDoc.summary.confusedTopics.length > 0 && (
            <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Common Confusion Points
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {activeDoc.summary.confusedTopics.map((topic, idx) => (
                  <div key={idx} className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-2.5 text-[10px] text-rose-500 font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <span>The AI searches your uploaded document chunks using vector similarity to find the most relevant context for each question.</span>
          </div>

        </div>

      </main>
    </div>
  );
}
