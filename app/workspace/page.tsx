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
} from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/markdown-renderer";

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
    profile
  } = useStore();

  const [activeTab, setActiveTab] = useState<"chat" | "flashcards" | "rtm">("chat");
  const [chatInput, setChatInput] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // RTM state
  const [rtmAnswer, setRtmAnswer] = useState("");
  const [rtmEvaluation, setRtmEvaluation] = useState("");
  const [rtmLoading, setRtmLoading] = useState(false);

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
      await sendMessage(activeDoc.id, userText);
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
              <h2 className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-500 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary animate-pulse" />
                Active Study Library
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                {documents.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setRtmEvaluation("");
                        setRtmAnswer("");
                      }}
                      className={`flex items-center justify-between text-left p-3.5 rounded-xl border transition-all duration-300 tactile-card ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]" 
                          : "border-white/5 bg-[#0d0d11]/40 hover:bg-[#0d0d11]/85 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary animate-ping" : "bg-zinc-600"}`} />
                        <span className="text-xs font-semibold truncate max-w-[280px]">{doc.title}</span>
                      </div>
                      <span className="text-[9px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-md font-mono">{doc.size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Summary display */}
            {activeDoc.summary && (
              <div className="space-y-4">
                <h2 className="text-[10px] uppercase font-bold tracking-[0.25em] text-zinc-500 flex items-center gap-2">
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
                {[
                  { id: "chat", name: "Doubt Solver", icon: MessageSquare },
                  { id: "flashcards", name: "Holographic Cards", icon: Lightbulb },
                  { id: "rtm", name: "Reverse Teacher (RTM)", icon: GraduationCap }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as "chat" | "flashcards" | "rtm")}
                      className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all duration-300 ${
                        isActive 
                          ? "border-primary text-primary dark:text-purple-400" 
                          : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Launcher for Quiz */}
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

            {/* Dynamic Tab Body Panel */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col">
              
              {/* Tab 1: AI Chat Doubt Solver */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full justify-between gap-6 flex-1">
                  {/* Messages list */}
                  <div className="flex-1 space-y-4 max-h-[440px] overflow-y-auto pr-2">
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
                            <MarkdownRenderer content={msg.text} />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500 px-2 font-mono">{msg.timestamp}</span>
                          {msg.sources && msg.sources.length > 0 && (
                            <span className="text-[8px] text-primary/60 font-bold uppercase">📎 {msg.sources.length} sources</span>
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
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-white/5 mt-auto">
                    <input
                      type="text"
                      required
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask any question about your study material..."
                      className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-zinc-200 focus:border-primary focus:outline-none transition-all placeholder-zinc-600 font-light"
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
              )}

              {/* Tab 2: Holographic Flashcards */}
              {activeTab === "flashcards" && (
                <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto space-y-8 py-4">
                  <div className="text-center space-y-1.5">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Holographic Deck Review</h3>
                    <p className="text-[10px] text-zinc-500 font-light">
                      {docQuizQuestions.length > 0 
                        ? `${flashcards.length} cards from your AI-generated quiz. Tap to flip.` 
                        : "Upload study material to generate AI flashcards."}
                    </p>
                  </div>

                  {/* Card Flip Container */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="relative w-full aspect-[1.6/1] cursor-pointer group"
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
                        className="absolute inset-0 bg-[#0d0d11]/95 glass-card rounded-2xl flex flex-col items-center justify-center p-6 text-center matte-layer shadow-2xl"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <HelpCircle className="h-6 w-6 text-primary mb-3.5 animate-pulse" />
                        <h4 className="text-sm font-bold text-white leading-relaxed px-4">{flashcards[currentCardIndex]?.q}</h4>
                        <span className="text-[9px] text-zinc-600 uppercase font-semibold tracking-wider absolute bottom-4">Tap to flip card</span>
                      </div>

                      {/* Back Side */}
                      <div 
                        className="absolute inset-0 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-2xl"
                        style={{ 
                          backfaceVisibility: "hidden", 
                          transform: "rotateY(180deg)" 
                        }}
                      >
                        <CheckCircle className="h-6 w-6 text-primary dark:text-purple-400 mb-3.5" />
                        <h4 className="text-sm font-mono font-semibold text-white leading-relaxed px-4">{flashcards[currentCardIndex]?.a}</h4>
                        <span className="text-[9px] text-zinc-500 uppercase font-semibold tracking-wider absolute bottom-4">Tap to reverse</span>
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
                            className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 p-4 text-xs text-zinc-200 focus:border-primary focus:outline-none transition-all resize-none font-light leading-relaxed placeholder-zinc-600"
                          />
                          <div className="absolute bottom-3 right-3 text-[10px] text-zinc-500 font-mono">
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
