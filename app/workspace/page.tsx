"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "@/components/navbar";
import { useStore } from "@/lib/store";
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
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import WorkspaceVisualizer from "@/components/workspace-visualizer";

// --- Helper: Extract suggested follow-up questions from AI response ---
function extractSuggestedQuestions(text: string): { cleanText: string; questions: string[] } {
  if (!text) return { cleanText: text, questions: [] };
  const marker = '[NEXT_QUESTIONS]';
  const idx = text.indexOf(marker);
  if (idx === -1) return { cleanText: text, questions: [] };

  // Strip the questions block and any trailing --- separator from the visible answer
  const cleanText = text.substring(0, idx).replace(/\n---\s*$/, '').trim();
  const questionsBlock = text.substring(idx + marker.length).trim();
  const questions = questionsBlock
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(q => q.length > 5)
    .slice(0, 2);

  return { cleanText, questions };
}

export default function WorkspacePage() {
  const { 
    documents, 
    selectedDocId, 
    setSelectedDocId, 
    chatThreads, 
    sendMessage,
    loadChatHistory,
    quizzes,
    loadQuiz,
    updateNodeStrength,
    updateProfile,
    profile,
    deleteDocument,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"chat" | "flashcards" | "rtm" | "visualizer">("chat");
  const [chatInput, setChatInput] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Attached documents state
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>([]);

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

  // Voice Input (STT) SpeechRecognition Setup
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

    // Strip markdown formatting, code snippets, sources, images for a very clean, simple voice reading
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

    // Try Puter.js premium neural TTS
    const tryNeuralTts = async () => {
      try {
        let attempts = 0;
        // Wait up to 2 seconds for puter to load
        while (typeof (window as any).puter === 'undefined' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
        }

        const puterSdk = (window as any).puter;
        if (typeof puterSdk === 'undefined' || !puterSdk.ai || !puterSdk.ai.txt2speech) {
          throw new Error('Puter.js neural TTS not available');
        }

        // Request OpenAI 'fable' storytelling voice via Puter.js
        const audio = await puterSdk.ai.txt2speech(cleanText, {
          provider: 'openai',
          voice: 'fable'
        });

        // Ensure we only play if the user is still speaking this message
        audio.onended = () => {
          setCurrentlySpeakingId(null);
        };
        audio.onerror = (e: any) => {
          console.warn("Neural TTS playback error:", e);
          setCurrentlySpeakingId(null);
        };

        activeAudioRef.current = audio;
        audio.play();

      } catch (err) {
        console.warn("Puter.js Neural TTS failed, falling back to native TTS:", err);
        playNativeFallback();
      }
    };

    tryNeuralTts();
  };

  // Initialize attachedDocIds with the selectedDocId on load
  useEffect(() => {
    if (selectedDocId && attachedDocIds.length === 0) {
      const timer = setTimeout(() => {
        setAttachedDocIds([selectedDocId]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedDocId, attachedDocIds]);

  const handleToggleAttach = (docId: string) => {
    setAttachedDocIds((prev) => {
      if (prev.includes(docId)) {
        if (prev.length === 1 && prev[0] === docId) {
          alert("At least one document must remain attached to query RAG context.");
          return prev;
        }
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  // Get active document details
  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const activeThread = useMemo(() => {
    return activeDoc ? (chatThreads[activeDoc.id] || []) : [];
  }, [activeDoc, chatThreads]);

  // Load chat history and quiz when document changes
  useEffect(() => {
    if (activeDoc?.id) {
      loadChatHistory(activeDoc.id);
      loadQuiz(activeDoc.id);
      
      // Auto-attach active document if it's not already in the list
      const timer = setTimeout(() => {
        setAttachedDocIds((prev) => {
          if (!prev.includes(activeDoc.id)) {
            return [...prev, activeDoc.id];
          }
          return prev;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeDoc?.id, loadChatHistory, loadQuiz]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeDoc || isAiReplying) return;

    const userText = chatInput;
    setChatInput("");
    setIsAiReplying(true);

    try {
      await sendMessage(activeDoc.id, userText, undefined, attachedDocIds);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsAiReplying(false);
    }
  };

  // Build flashcards from quiz questions
  const docQuizQuestions = activeDoc ? (quizzes[activeDoc.id] || []) : [];
  const flashcards = docQuizQuestions.length > 0 
    ? docQuizQuestions.map(q => ({
        q: q.question,
        a: q.options[q.correctAnswer]?.replace(/^[A-D]\)\s*/, "") || q.explanation
      }))
    : [
        { q: "Upload study material to generate flashcards", a: "Your AI-generated flashcards will appear here after uploading notes." }
      ];

  const handleFlashcardRating = (mastered: boolean) => {
    setIsFlipped(false);
    // Adjust nodes strength slightly based on document
    if (activeDoc) {
      updateNodeStrength(activeDoc.id, mastered ? 10 : -8);
    }
    setTimeout(() => {
      setCurrentCardIndex((currentCardIndex + 1) % flashcards.length);
    }, 200);
  };

  // Socratic RTM Question
  const rtmQuestion = activeDoc?.summary?.keyPoints?.[0]
    ? `Explain in your own words: ${activeDoc.summary.keyPoints[0]}. Include related concepts, formulas, and practical applications.`
    : "Explain the main concept from your study material in your own words.";

  const handleRtmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtmAnswer.trim() || !activeDoc) return;

    setRtmLoading(true);
    setRtmEvaluation("");

    try {
      const response = await sendMessage(activeDoc.id, rtmAnswer, "rtm");
      
      // Parse RTM evaluation from AI response
      try {
        const evaluation = JSON.parse(response);
        setRtmEvaluation(`### Cognitive Evaluation Output
* **Conceptual Accuracy:** ${evaluation.score}%
* **Strengths:** ${evaluation.strengths?.join(", ") || "Good overall attempt"}
* **Semantic Gaps Detected:** ${evaluation.gaps?.join(". ") || "No major gaps detected."}
* **Feedback:** ${evaluation.feedback || "Keep studying!"}
* **Cognitive archetypes update:** Retention rates increased. XP Granted.`);

        updateProfile({
          retention: Math.min(100, profile.retention + 4),
          conceptual: Math.min(100, profile.conceptual + 3)
        });
      } catch {
        setRtmEvaluation(`### Cognitive Evaluation Output\n${response}`);
      }
    } catch {
      setRtmEvaluation("Failed to evaluate. Please try again.");
    } finally {
      setRtmLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      {activeDoc ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-64px)] relative z-10">
          
          {/* Left panel: Documents list & summaries (col-span-5) */}
          <div className="lg:col-span-5 border-r border-white/5 bg-[#070709]/80 backdrop-blur-xl flex flex-col overflow-y-auto p-6 space-y-6">
            
            {/* Document list row */}
            <div className="space-y-3">
              <h2 className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-400 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary animate-pulse" />
                Active Study Library
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                {documents.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  const isAttached = attachedDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      className={`group flex items-center justify-between p-1 rounded-xl border transition-all duration-300 tactile-card ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                          : "border-white/5 bg-[#0d0d11]/40 hover:bg-[#0d0d11]/85 text-zinc-300 hover:text-white"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setRtmEvaluation("");
                          setRtmAnswer("");
                        }}
                        className="flex-1 flex items-center justify-between text-left p-2.5 min-w-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary animate-ping" : "bg-zinc-600"}`} />
                          <span className="text-xs font-semibold truncate max-w-[160px] md:max-w-[200px]">{doc.title}</span>
                        </div>
                      </button>
                      <div className="flex items-center gap-1.5 mr-2 shrink-0">
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${doc.title}"? This will delete all its chat history, quizzes, and chunks.`)) {
                              await deleteDocument(doc.id);
                            }
                          }}
                          title="Delete document"
                          className="p-1 rounded-lg border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 bg-white/5 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAttach(doc.id);
                          }}
                          title={isAttached ? "Attached to chat context" : "Attach to chat context"}
                          className={`px-3 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                            isAttached
                              ? "bg-primary border-primary text-white shadow-[0_0_8px_rgba(139,92,246,0.3)] animate-pulse"
                              : "border-white/10 hover:border-white/30 text-zinc-500 hover:text-zinc-300 bg-white/5"
                          }`}
                        >
                          {isAttached ? "Attached" : "Attach"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Summary display */}
            {activeDoc.summary && (
              <div className="space-y-4">
                <h2 className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-400 dark:text-zinc-300 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Auto-Synthesis Summaries
                </h2>

                <div className="bg-[#0b0b0e]/90 border border-white/5 rounded-2xl p-6 space-y-6 glass-card matte-layer spatial-shadow-lg">
                  {/* Overview */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Synthesis Overview</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed font-light">{activeDoc.summary.overview}</p>
                  </div>

                  {/* Keypoints */}
                  {activeDoc.summary.keyPoints?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Active Memory Points</h4>
                      <ul className="space-y-2.5 text-xs text-zinc-300">
                        {activeDoc.summary.keyPoints.map((kp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="font-light">{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formulas */}
                  {activeDoc.summary.formulas?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Key Mathematical Models</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {activeDoc.summary.formulas.map((frm, idx) => (
                          <div key={idx} className="bg-primary/5 border border-primary/10 p-3 rounded-xl flex items-center justify-between group">
                            <code className="text-primary dark:text-purple-400 text-[10px] font-mono tracking-wide">
                              {frm}
                            </code>
                            <Sparkles className="h-3.5 w-3.5 text-primary/45 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {activeDoc.summary.confusedTopics?.[0] && (
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 space-y-1.5">
                        <h5 className="text-[10px] font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                          Confusion Warning
                        </h5>
                        <p className="text-[10px] text-zinc-400 leading-normal font-light">{activeDoc.summary.confusedTopics[0]}</p>
                      </div>
                    )}
                    {activeDoc.summary.examTips?.[0] && (
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-1.5">
                        <h5 className="text-[10px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                          <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                          Exam Warnings
                        </h5>
                        <p className="text-[10px] text-zinc-400 leading-normal font-light">{activeDoc.summary.examTips[0]}</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

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
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all duration-300 ${
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("rtm")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-400 px-4 py-1.5 text-xs font-bold hover:bg-violet-600/30 transition-all shadow-[0_0_10px_rgba(139,92,246,0.1)] cursor-pointer"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Teach Me (RTM)</span>
                </button>
                {docQuizQuestions.length > 0 && (
                  <Link
                    href={`/quiz?docId=${activeDoc.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-purple-400 px-4 py-1.5 text-xs font-bold hover:bg-primary/20 transition-all shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                  >
                    <Cpu className="h-3.5 w-3.5 animate-pulse" />
                    <span>Calibrate Quiz</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Dynamic Tab Body Panel */}
            <div className={`flex-1 p-6 flex flex-col ${activeTab === "chat" || activeTab === "visualizer" ? "overflow-hidden" : "overflow-y-auto"}`}>
              
              {/* Tab 4: Interactive Concept Visualizer */}
              {activeTab === "visualizer" && (
                <div className="flex-1 h-full flex flex-col min-h-[400px]">
                  <WorkspaceVisualizer 
                    documents={documents}
                    selectedDocId={selectedDocId}
                    attachedDocIds={attachedDocIds}
                    onToggleAttach={handleToggleAttach}
                    lastAiMessage={activeThread.filter(m => m.sender === "ai").pop()}
                  />
                </div>
              )}
              
              {/* Tab 1: AI Chat Doubt Solver */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full justify-between gap-6 flex-1 overflow-hidden">
                  {/* Messages list */}
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    {activeThread.map((msg) => (
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
                              className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all shrink-0 ml-1.5"
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
                          <span className="text-[10px] text-primary dark:text-purple-400 font-bold uppercase tracking-wider block animate-pulse">Searching vector embeddings...</span>
                        </div>
                      </div>
                    )}
                    {/* Suggested follow-up questions */}
                    {!isAiReplying && activeThread.length > 0 && (() => {
                      const lastAiMsg = [...activeThread].reverse().find(m => m.sender === "ai");
                      if (!lastAiMsg?.text) return null;
                      const { questions } = extractSuggestedQuestions(lastAiMsg.text);
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
                                className="text-[10px] text-left px-3.5 py-2.5 rounded-xl border border-primary/15 bg-primary/5 text-zinc-300 hover:text-white hover:border-primary/30 hover:bg-primary/10 transition-all duration-300 max-w-[90%] group"
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
                      className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-center shrink-0 ${
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
                      placeholder={isListening ? "Listening... speak now..." : "Ask any question about your study material..."}
                      className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-zinc-200 focus:border-primary focus:outline-none transition-all placeholder-zinc-400 font-light"
                    />
                    <button
                      type="submit"
                      disabled={isAiReplying}
                      className="rounded-xl bg-primary px-6 py-3.5 text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center shrink-0"
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
                      {docQuizQuestions.length > 0 
                        ? `${flashcards.length} cards from your AI-generated quiz. Tap to flip.` 
                        : "Upload study material to generate AI flashcards."}
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
                        className="rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 px-6 py-3 text-xs font-bold text-rose-400 transition-all duration-300"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => handleFlashcardRating(true)}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 px-6 py-3 text-xs font-bold text-emerald-400 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
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
                      <h3 className="text-sm font-semibold text-white leading-relaxed">{rtmQuestion}</h3>
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
                            placeholder="Type your detailed explanation here. Include formulas, definitions, and mechanisms to maximize coverage score..."
                            className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 p-4 text-xs text-zinc-200 focus:border-primary focus:outline-none transition-all resize-none font-light leading-relaxed placeholder-zinc-400"
                          />
                          <div className="absolute bottom-3 right-3 text-[10px] text-zinc-400 dark:text-zinc-300 font-mono">
                            {rtmAnswer.length} chars
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={rtmLoading}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border"
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
                          className="w-full rounded-xl border border-white/5 bg-[#0d0d11]/80 hover:bg-[#0d0d11] py-3 text-xs font-bold text-zinc-300 hover:text-white transition-all duration-300"
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
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
          <HelpCircle className="h-16 w-16 text-primary dark:text-purple-400" />
          <h2 className="text-xl font-bold text-foreground">No study material uploaded yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm">Upload a PDF or TXT notes file first. AskMe AI will build the summary, quiz, flashcards, and grounded chat context from that material.</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/95"
          >
            Upload Notes
          </Link>
        </div>
      )}
    </div>
  );
}
