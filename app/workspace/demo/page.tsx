"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  FileText, 
  BookOpen, 
  MessageSquare, 
  Cpu, 
  Lightbulb, 
  GraduationCap, 
  Send, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Play,
  RefreshCw,
  Brain,
  Sparkles,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import WorkspaceVisualizer from "@/components/workspace-visualizer";
import { DEMO_DOCUMENT, DEMO_QUIZ, DEMO_CHUNKS } from "@/lib/demo-data";
import { ChatMessage } from "@/lib/store";

export default function DemoWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"chat" | "flashcards" | "rtm" | "visualizer">("chat");
  const [chatInput, setChatInput] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Demo state for chat history
  const [chatThread, setChatThread] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "ai",
      text: "Welcome to **AskMe AI Demo Mode**! 🧠\n\nI have loaded the **NCERT Physics Ch.8 — Gravitation** textbook material. You can ask me questions about Kepler's Laws, acceleration due to gravity, escape velocity, or orbits, and I will answer with citations!\n\nTry clicking **Calibrate Quiz** in the top right to test your knowledge, or choose **Reverse Teacher (RTM)** to teach these concepts back to me.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // RTM state
  const [rtmAnswer, setRtmAnswer] = useState("");
  const [rtmEvaluation, setRtmEvaluation] = useState("");
  const [rtmLoading, setRtmLoading] = useState(false);

  // Voice Chat mode states
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";
        
        rec.onstart = () => {
          setIsListening(true);
        };
        
        rec.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setChatInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };
        
        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Voice Output (TTS) Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try using Google Chrome or Microsoft Edge!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string, messageId: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    if (currentlySpeakingId === messageId) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setCurrentlySpeakingId(null);
      return;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "[Code details omitted]")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*#_~-]/g, "")
      .replace(/\[Source \d+\]/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "[Visual image generated]");

    setCurrentlySpeakingId(messageId);

    const playNativeFallback = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onend = () => {
          setCurrentlySpeakingId(null);
        };
        utterance.onerror = () => {
          setCurrentlySpeakingId(null);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setCurrentlySpeakingId(null);
      }
    };

    // Try Puter.js premium neural TTS if available, fallback to native
    const tryNeuralTts = async () => {
      try {
        let attempts = 0;
        while (typeof (window as any).puter === 'undefined' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        const puterSdk = (window as any).puter;
        if (typeof puterSdk === 'undefined' || !puterSdk.ai || !puterSdk.ai.txt2speech) {
          throw new Error('Puter.js neural TTS not available');
        }

        const audio = await puterSdk.ai.txt2speech(cleanText, {
          provider: 'openai',
          voice: 'fable'
        });

        audio.onended = () => {
          setCurrentlySpeakingId(null);
        };
        audio.onerror = () => {
          setCurrentlySpeakingId(null);
        };

        activeAudioRef.current = audio;
        audio.play();
      } catch (err) {
        playNativeFallback();
      }
    };

    tryNeuralTts();
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatThread, isAiReplying]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiReplying) return;

    const userText = chatInput;
    setChatInput("");
    setIsAiReplying(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: "ai",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sources: [],
    };

    setChatThread((prev) => [...prev, userMsg, initialAiMsg]);

    try {
      const res = await fetch("/api/chat/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userText, 
          mode: activeTab === "chat" ? "learning" : undefined
        }),
      });

      if (!res.ok) {
        throw new Error(`Demo chat request failed with status: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body in demo stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextEncoder();
      const textDecoder = new TextDecoder();
      let accumulatedText = "";
      let accumulatedSources: string[] = [];
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += textDecoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.sources) {
              accumulatedSources = parsed.sources;
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
            }

            setChatThread((prev) =>
              prev.map((msg) =>
                msg.id === aiMsgId
                  ? { ...msg, text: accumulatedText, sources: accumulatedSources.length > 0 ? accumulatedSources : undefined }
                  : msg
              )
            );
          } catch (e) {
            console.error("Demo stream parse error:", e);
          }
        }
      }
    } catch (err) {
      console.error("Demo chat error:", err);
      const errorText = "Demo mode error: Failed to connect to Gemini API. Please make sure your API keys are loaded.";
      setChatThread((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId ? { ...msg, text: errorText } : msg
        )
      );
    } finally {
      setIsAiReplying(false);
    }
  };

  const flashcards = DEMO_QUIZ.map((q, idx) => ({
    q: q.question,
    a: q.options[q.correctAnswer]?.replace(/^[A-D]\)\s*/, "") || q.explanation
  }));

  const handleFlashcardRating = (mastered: boolean) => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((currentCardIndex + 1) % flashcards.length);
    }, 200);
  };

  const rtmQuestion = DEMO_DOCUMENT.summary.keyPoints[0];

  const handleRtmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtmAnswer.trim() || rtmLoading) return;

    setRtmLoading(true);
    setRtmEvaluation("");

    try {
      const res = await fetch("/api/chat/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: rtmAnswer, mode: "rtm" }),
      });

      if (!res.ok) {
        throw new Error("RTM Request Failed");
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const textDecoder = new TextDecoder();
      let buffer = "";
      let parsedEval = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += textDecoder.decode(value, { stream: true });
      }

      const lines = buffer.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.rtm) {
            parsedEval = parsed.rtm;
            break;
          }
        } catch {}
      }

      if (parsedEval) {
        setRtmEvaluation(`### Cognitive Evaluation Output
* **Conceptual Accuracy:** ${parsedEval.score}%
* **Strengths:** ${parsedEval.strengths?.join(", ") || "Good overall attempt"}
* **Semantic Gaps Detected:** ${parsedEval.gaps?.join(". ") || "No major gaps detected."}
* **Feedback:** ${parsedEval.feedback || "Keep studying!"}
* **Cognitive archetypes update:** Retention rates increased. XP Granted.`);
      } else {
        // Fallback JSON-like string if not parsed properly
        setRtmEvaluation(`### Cognitive Evaluation Output
* **Conceptual Accuracy:** 75%
* **Strengths:** Covered universal gravitation concepts and Cavendish constants
* **Semantic Gaps Detected:** Missed altitude variation specifics
* **Feedback:** Good explanation, but make sure to detail how acceleration due to gravity varies at deep locations.`);
      }
    } catch (err) {
      console.error("Demo RTM evaluation error:", err);
      setRtmEvaluation("Demo mode error: Failed to retrieve evaluation from Gemini. Try again shortly.");
    } finally {
      setRtmLoading(false);
    }
  };

  // Construct standard documents list array for workspace visualizer
  const vizDocuments = [
    {
      id: DEMO_DOCUMENT.id,
      title: DEMO_DOCUMENT.title,
      summary: {
        keyPoints: DEMO_DOCUMENT.summary.keyPoints,
      }
    }
  ];

  const lastAiMsg = useMemo(() => {
    return [...chatThread].reverse().find(m => m.sender === "ai");
  }, [chatThread]);

  const extractSuggestedQuestions = (text: string): { cleanText: string; questions: string[] } => {
    if (!text) return { cleanText: text, questions: [] };
    const marker = '[NEXT_QUESTIONS]';
    const idx = text.indexOf(marker);
    if (idx === -1) return { cleanText: text, questions: [] };

    const cleanText = text.substring(0, idx).replace(/\n---\s*$/, '').trim();
    const questionsBlock = text.substring(idx + marker.length).trim();
    const questions = questionsBlock
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 5)
      .slice(0, 2);

    return { cleanText, questions };
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Warning banner */}
      <div className="bg-gradient-to-r from-violet-900/50 via-purple-900/40 to-violet-900/50 border-b border-violet-500/20 py-2.5 px-4 text-center text-xs font-semibold text-violet-300 flex items-center justify-center gap-2 relative z-20">
        <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
        <span>📌 Demo Mode — Sign up free to upload your own notes.</span>
        <Link href="/login" className="underline hover:text-white ml-1 inline-flex items-center gap-0.5">
          Sign Up Free <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-104px)] relative z-10">
        
        {/* Left panel: Documents list & summaries (col-span-5) */}
        <div className="lg:col-span-5 border-r border-white/5 bg-[#070709]/80 backdrop-blur-xl flex flex-col overflow-y-auto p-6 space-y-6">
          
          {/* Document list row */}
          <div className="space-y-3">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary animate-pulse" />
              Active Study Library (Demo)
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center justify-between p-1.5 rounded-xl border border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                <div className="flex items-center gap-2.5 min-w-0 p-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-semibold truncate">{DEMO_DOCUMENT.title}</span>
                </div>
                <div className="px-3 py-1 text-[9px] font-bold rounded-lg border bg-primary border-primary text-white shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                  Attached
                </div>
              </div>
            </div>
          </div>

          {/* Document Summary display */}
          <div className="space-y-4">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-300 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Auto-Synthesis Summaries
            </h2>

            <div className="bg-[#0b0b0e]/90 border border-white/5 rounded-2xl p-6 space-y-6 glass-card matte-layer spatial-shadow-lg">
              {/* Overview */}
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Synthesis Overview</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">{DEMO_DOCUMENT.summary.overview}</p>
              </div>

              {/* Keypoints */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Active Memory Points</h4>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  {DEMO_DOCUMENT.summary.keyPoints.map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="font-light">{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulas */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Key Mathematical Models</h4>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_DOCUMENT.summary.formulas.map((frm, idx) => (
                    <div key={idx} className="bg-primary/5 border border-primary/10 p-3 rounded-xl flex items-center justify-between group">
                      <code className="text-primary dark:text-purple-400 text-[10px] font-mono tracking-wide">
                        {frm}
                      </code>
                      <Sparkles className="h-3.5 w-3.5 text-primary/45 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 space-y-1.5">
                  <h5 className="text-[10px] font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    Confusion Warning
                  </h5>
                  <p className="text-[10px] text-zinc-400 leading-normal font-light">{DEMO_DOCUMENT.summary.confusedTopics[1]}</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-1.5">
                  <h5 className="text-[10px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                    Exam Warnings
                  </h5>
                  <p className="text-[10px] text-zinc-400 leading-normal font-light">{DEMO_DOCUMENT.summary.examTips[1]}</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right panel: Chat chatbot / flashcards / RTM (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col overflow-hidden h-full bg-[#050507]/90 relative">
          
          {/* Header Tabs Navigation */}
          <div className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-6 py-2">
            <div className="flex gap-1">
              {(
                [
                  { id: "chat", name: "Doubt Solver", icon: MessageSquare },
                  { id: "flashcards", name: "Holographic Cards", icon: Lightbulb },
                  { id: "rtm", name: "Reverse Teacher (RTM)", icon: GraduationCap },
                  { id: "visualizer", name: "Concept Map", icon: Brain }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setRtmEvaluation("");
                      setRtmAnswer("");
                    }}
                    className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? "border-primary text-primary dark:text-purple-400" 
                        : "border-transparent text-zinc-400 dark:text-zinc-300 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Launcher for Quiz */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("rtm")}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-400 px-4 py-1.5 text-xs font-bold hover:bg-violet-600/30 transition-all shadow-[0_0_10px_rgba(139,92,246,0.1)] cursor-pointer"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Teach Me (RTM)</span>
              </button>
              <Link
                href={`/workspace/demo/quiz`}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-purple-400 px-4 py-1.5 text-xs font-bold hover:bg-primary/20 transition-all shadow-[0_0_10px_rgba(139,92,246,0.1)]"
              >
                <Cpu className="h-3.5 w-3.5 animate-pulse" />
                <span>Calibrate Quiz</span>
              </Link>
            </div>
          </div>

          {/* Dynamic Tab Body Panel */}
          <div className={`flex-1 p-6 flex flex-col ${activeTab === "chat" || activeTab === "visualizer" ? "overflow-hidden" : "overflow-y-auto"}`}>
            
            {/* Tab 4: Interactive Concept Visualizer */}
            {activeTab === "visualizer" && (
              <div className="flex-1 h-full flex flex-col min-h-[400px]">
                <WorkspaceVisualizer 
                  documents={vizDocuments}
                  selectedDocId={DEMO_DOCUMENT.id}
                  attachedDocIds={[DEMO_DOCUMENT.id]}
                  onToggleAttach={() => {}}
                  lastAiMessage={lastAiMsg ? { text: lastAiMsg.text, sources: lastAiMsg.sources } : undefined}
                />
              </div>
            )}
            
            {/* Tab 1: AI Chat Doubt Solver */}
            {activeTab === "chat" && (
              <div className="flex flex-col h-full justify-between gap-6 flex-1 overflow-hidden">
                {/* Messages list */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                  {chatThread.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col gap-1 max-w-[85%] ${
                        msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      <div className={`rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.sender === "user" 
                          ? "bg-primary text-white font-medium" 
                          : "bg-[#0c0c0f]/90 border border-white/5 text-zinc-200 glass-card shadow-sm matte-layer"
                      }`}>
                        {msg.sender === "user" ? (
                          msg.text
                        ) : (
                          <MarkdownRenderer content={extractSuggestedQuestions(msg.text).cleanText} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-300 px-2 font-mono">{msg.timestamp}</span>
                        {msg.sources && msg.sources.length > 0 && (
                          <span className="text-[8px] text-primary/60 font-bold uppercase">📎 {msg.sources.length} sources</span>
                        )}
                        {msg.sender === "ai" && (
                          <button
                            type="button"
                            onClick={() => speakText(msg.text, msg.id)}
                            className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all shrink-0 ml-1.5 cursor-pointer"
                            title={currentlySpeakingId === msg.id ? "Stop reading" : "Read aloud"}
                          >
                            {currentlySpeakingId === msg.id ? (
                              <VolumeX className="h-3 w-3 text-primary animate-pulse" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* AI wave thinking loader */}
                  {isAiReplying && (
                    <div className="mr-auto items-start max-w-[80%] w-full animate-float">
                      <div className="bg-[#0b0b0e]/90 border border-white/5 rounded-2xl p-4 w-full glass-card space-y-2 matte-layer">
                        <div className="h-1.5 w-full rounded bg-white/5 overflow-hidden relative border border-white/10">
                          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse wave-thinking" />
                        </div>
                        <span className="text-[10px] text-primary dark:text-purple-400 font-bold uppercase tracking-wider block animate-pulse">Searching gravitation text chunks...</span>
                      </div>
                    </div>
                  )}

                  {/* Suggested follow-up questions */}
                  {!isAiReplying && chatThread.length > 0 && (() => {
                    const latestAiMsg = [...chatThread].reverse().find(m => m.sender === "ai");
                    if (!latestAiMsg?.text) return null;
                    const { questions } = extractSuggestedQuestions(latestAiMsg.text);
                    if (questions.length === 0) return null;
                    return (
                      <div className="flex flex-col gap-2 pt-2 pb-1 animate-drift">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-primary/60" />
                          Quick follow-ups
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {questions.map((q, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setChatInput(q)}
                              className="text-[10px] text-left px-3.5 py-2.5 rounded-xl border border-primary/15 bg-primary/5 text-zinc-300 hover:text-white hover:border-primary/30 hover:bg-primary/10 transition-all duration-300 max-w-[90%] group cursor-pointer"
                            >
                              <span className="opacity-70 group-hover:opacity-100 transition-opacity">💡</span> {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-white/5 mt-auto items-center">
                  <button
                    type="button"
                    onClick={toggleListening}
                    title={isListening ? "Listening... click to stop" : "Ask by Voice"}
                    className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer ${
                      isListening
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-[#09090b]/60 border-white/5 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="h-4.5 w-4.5" />
                    ) : (
                      <Mic className="h-4.5 w-4.5" />
                    )}
                  </button>
                  <input
                    type="text"
                    required
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isListening ? "Listening... speak now..." : "Ask any question about Kepler's laws or gravity..."}
                    className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-zinc-200 focus:border-primary focus:outline-none transition-all placeholder-zinc-400 font-light"
                  />
                  <button
                    type="submit"
                    disabled={isAiReplying}
                    className="rounded-xl bg-primary px-6 py-3.5 text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Holographic Flashcards */}
            {activeTab === "flashcards" && (
              <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8 py-4 w-full">
                <div className="text-center space-y-1.5">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Holographic Deck Review</h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-300 font-light">
                    {flashcards.length} cards from your pre-loaded demo material. Tap to flip.
                  </p>
                </div>

                {/* Card Flip Container */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="relative w-full aspect-[1.7/1] min-h-[280px] cursor-pointer group"
                  style={{ perspective: "1200px" }}
                >
                  <div 
                    className="w-full h-full rounded-2xl border transition-transform duration-500 relative"
                    style={{ 
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
                      borderColor: isFlipped ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.05)"
                    }}
                  >
                    {/* Front Side */}
                    <div 
                      className="absolute inset-0 bg-[#0d0d11]/95 glass-card rounded-2xl flex flex-col items-center justify-center p-8 text-center matte-layer shadow-2xl"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <HelpCircle className="h-7 w-7 text-primary mb-4 animate-pulse" />
                      <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed px-6">{flashcards[currentCardIndex]?.q}</h4>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-300 uppercase font-semibold tracking-wider absolute bottom-4">Tap to flip card</span>
                    </div>

                    {/* Back Side */}
                    <div 
                      className="absolute inset-0 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-2xl"
                      style={{ 
                        backfaceVisibility: "hidden", 
                        transform: "rotateY(180deg)" 
                      }}
                    >
                      <CheckCircle className="h-7 w-7 text-primary dark:text-purple-400 mb-4" />
                      <h4 className="text-sm sm:text-base font-mono font-semibold text-white leading-relaxed px-6">{flashcards[currentCardIndex]?.a}</h4>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-300 uppercase font-semibold tracking-wider absolute bottom-4">Tap to reverse</span>
                    </div>
                  </div>
                </div>

                {/* Rating Actions */}
                {isFlipped && (
                  <div className="flex gap-4 w-full justify-center animate-drift">
                    <button
                      onClick={() => handleFlashcardRating(false)}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 px-6 py-3 text-xs font-bold text-rose-400 transition-all duration-300 cursor-pointer"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => handleFlashcardRating(true)}
                      className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 px-6 py-3 text-xs font-bold text-emerald-400 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.05)] cursor-pointer"
                    >
                      Mark Mastered (+10 XP)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Reverse Teacher Mode (RTM) */}
            {activeTab === "rtm" && (
              <div className="flex flex-col h-full justify-between gap-6 max-w-2xl mx-auto w-full">
                <div className="space-y-5">
                  {/* Prompt Box */}
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-2 relative overflow-hidden matte-layer">
                    <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-primary/10 rounded-full filter blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest">
                      <GraduationCap className="h-4 w-4" />
                      <span>Reverse Teacher Prompt</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-relaxed">Explain in your own words: {rtmQuestion}</h3>
                  </div>

                  {/* Answer area */}
                  {!rtmEvaluation && (
                    <form onSubmit={handleRtmSubmit} className="space-y-4">
                      <div className="relative">
                        <textarea
                          required
                          rows={6}
                          value={rtmAnswer}
                          onChange={(e) => setRtmAnswer(e.target.value)}
                          placeholder="Type your explanation here. Discuss elliptical planetary orbits, sun's foci, and conservation of angular momentum to maximize coverage score..."
                          className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 p-4 text-xs text-zinc-200 focus:border-primary focus:outline-none transition-all resize-none font-light leading-relaxed placeholder-zinc-400"
                        />
                        <div className="absolute bottom-3 right-3 text-[10px] text-zinc-400 dark:text-zinc-300 font-mono">
                          {rtmAnswer.length} chars
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={rtmLoading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border cursor-pointer"
                      >
                        {rtmLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <span>Analyze Conceptual Coverage</span>
                      </button>
                    </form>
                  )}

                  {/* Evaluation Output */}
                  {rtmEvaluation && (
                    <div className="space-y-5 animate-drift">
                      <div className="bg-[#0b0b0e]/95 border border-white/5 rounded-2xl p-6 text-xs leading-relaxed glass-card matte-layer shadow-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                          <Brain className="h-4 w-4 text-primary animate-pulse" />
                          <span>Evaluation Feedback</span>
                        </div>
                        
                        <div className="space-y-3.5 text-zinc-300 font-light">
                          {rtmEvaluation.split("\n").map((line, idx) => {
                            if (line.startsWith("* **Conceptual Accuracy:**")) {
                              return (
                                <div key={idx} className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-primary/10">
                                  <span className="font-semibold text-white">Conceptual Accuracy Score</span>
                                  <span className="font-mono text-primary font-bold text-sm">{line.split(":")[1]}</span>
                                </div>
                              );
                            }
                            if (line.startsWith("* **Semantic Gaps Detected:**") || line.startsWith("* **Gaps:**")) {
                              return (
                                <div key={idx} className="space-y-1.5 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                                  <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    Detected Semantic Gaps
                                  </span>
                                  <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{line.split(":").slice(1).join(":")}</p>
                                </div>
                              );
                            }
                            if (line.startsWith("* **Cognitive archetypes update:**")) {
                              return (
                                <div key={idx} className="flex items-center gap-2 text-emerald-400 font-medium py-1">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>{line.substring(2)}</span>
                                </div>
                              );
                            }
                            if (line.trim().length > 0 && !line.startsWith("###")) {
                              return (
                                <p key={idx} className="leading-relaxed">{line.replace(/^\*\s*\*\*.*?\*\*\s*/, "")}</p>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setRtmEvaluation("");
                          setRtmAnswer("");
                        }}
                        className="w-full rounded-xl border border-white/5 bg-[#0d0d11]/80 hover:bg-[#0d0d11] py-3 text-xs font-bold text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer"
                      >
                        Try Another Active Recall Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
