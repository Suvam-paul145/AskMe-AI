"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import { useStore, DocumentNode, ChatMessage } from "@/lib/store";
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
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function WorkspacePage() {
  const { 
    documents, 
    selectedDocId, 
    setSelectedDocId, 
    chatThreads, 
    addMessage,
    quizzes,
    updateNodeStrength,
    updateProfile,
    profile
  } = useStore();

  const [activeTab, setActiveTab] = useState<"chat" | "flashcards" | "rtm">("chat");
  const [chatInput, setChatInput] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // RTM state
  const [rtmAnswer, setRtmAnswer] = useState("");
  const [rtmEvaluation, setRtmEvaluation] = useState("");
  const [rtmLoading, setRtmLoading] = useState(false);

  // Get active document details
  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const activeThread = activeDoc ? (chatThreads[activeDoc.id] || []) : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeDoc) return;

    const userText = chatInput;
    setChatInput("");
    addMessage(activeDoc.id, userText, "user");
    setIsAiReplying(true);

    // Simulate RAG reply logic
    setTimeout(() => {
      let aiResponse = "";
      const lower = userText.toLowerCase();

      if (lower.includes("formula") || lower.includes("equation")) {
        aiResponse = `Regarding formulas in '${activeDoc.title}': The primary equation is: ${activeDoc.summary.formulas[0] || "F = k * q1 * q2 / r^2"}. Let me know if you want a sample problem calculation solved step-by-step!`;
      } else if (lower.includes("exam") || lower.includes("tip")) {
        aiResponse = `For exams, pay close attention to: "${activeDoc.summary.examTips[0]}". Teachers frequently test this concept directly in MCQs.`;
      } else if (lower.includes("mistake") || lower.includes("confus")) {
        aiResponse = `A major confusion point is: "${activeDoc.summary.confusedTopics[0]}". Students often mix these vectors up.`;
      } else {
        aiResponse = `Ingesting contextual query. Based on vector chunks in '${activeDoc.title}': ${activeDoc.extractedText.slice(0, 180)}... Let me know if you would like me to generate a custom quiz question or expand on this topic!`;
      }

      addMessage(activeDoc.id, aiResponse, "ai", [activeDoc.title]);
      setIsAiReplying(false);
    }, 1200);
  };

  // Mock Flashcards
  const flashcards = [
    { q: "What is Coulomb's Law formula?", a: "F = k * (q1 * q2) / r^2" },
    { q: "Is electric potential scalar or vector?", a: "Scalar (only magnitude)" },
    { q: "Where does translation happen in a cell?", a: "In the ribosome/cytoplasm" },
    { q: "What is transcription?", a: "Synthesizing RNA from a DNA template" }
  ];

  const handleFlashcardRating = (mastered: boolean) => {
    setIsFlipped(false);
    // Adjust nodes strength slightly
    updateNodeStrength(mastered ? "n-1" : "n-3", mastered ? 10 : -8);
    // Go to next card
    setTimeout(() => {
      setCurrentCardIndex((currentCardIndex + 1) % flashcards.length);
    }, 200);
  };

  // Socratic RTM Question
  const rtmQuestion = activeDoc?.id === "doc-1" 
    ? "Explain in your own words what Coulomb's Law is and why it is an inverse-square law."
    : "Explain the Central Dogma of Molecular Biology and how RNA polymerase participates in it.";

  const handleRtmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtmAnswer.trim()) return;

    setRtmLoading(true);
    setRtmEvaluation("");

    setTimeout(() => {
      const score = Math.floor(Math.random() * 20) + 75; // 75 to 95
      setRtmEvaluation(`### Cognitive Evaluation Output
* **Conceptual Accuracy:** ${score}%
* **Semantic Gaps Detected:** You correctly identified the inverse mathematical proportional components, but omitted mentioning the electrostatic permittivity constants (Epsilon_0).
* **Cognitive archetypes update:** Retention rates increased by +5%. XP Granted: +25 XP.`);

      // Update actual DNA profile
      updateProfile({
        retention: Math.min(100, profile.retention + 4),
        conceptual: Math.min(100, profile.conceptual + 3)
      });
      setRtmLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative select-none">
      <Navbar />

      {activeDoc ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-64px)]">
          
          {/* Left panel: Documents list & summaries (col-span-5) */}
          <div className="lg:col-span-5 border-r border-border bg-card/20 flex flex-col overflow-y-auto p-4 md:p-6 space-y-6">
            
            {/* Document list row */}
            <div className="space-y-2">
              <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Active Study Library
              </h2>
              <div className="grid grid-cols-1 gap-2">
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
                      className={`flex items-center justify-between text-left p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/5 text-primary shadow-sm" 
                          : "border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs font-semibold truncate max-w-[240px]">{doc.title}</span>
                      <span className="text-[10px] text-zinc-500">{doc.size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Summary display */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Auto-Synthesis Summaries
              </h2>

              <div className="bg-card/40 border border-border rounded-xl p-5 space-y-5 glass-card">
                {/* Overview */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">Synthesis Overview</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{activeDoc.summary.overview}</p>
                </div>

                {/* Keypoints */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground">Active Memory Points</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                    {activeDoc.summary.keyPoints.map((kp, idx) => (
                      <li key={idx}>{kp}</li>
                    ))}
                  </ul>
                </div>

                {/* Formulas */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground">Key Mathematical Models</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {activeDoc.summary.formulas.map((frm, idx) => (
                      <code key={idx} className="bg-primary/5 border border-primary/20 text-primary dark:text-purple-400 p-2.5 rounded-lg text-[10px] block font-mono">
                        {frm}
                      </code>
                    ))}
                  </div>
                </div>

                {/* Warnings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Confusions */}
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5 space-y-1">
                    <h5 className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Confusion Warning
                    </h5>
                    <p className="text-[10px] text-zinc-400 leading-normal">{activeDoc.summary.confusedTopics[0]}</p>
                  </div>
                  {/* Tips */}
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 space-y-1">
                    <h5 className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Exam Warnings
                    </h5>
                    <p className="text-[10px] text-zinc-400 leading-normal">{activeDoc.summary.examTips[0]}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right panel: Chat chatbot / flashcards / RTM (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden h-full bg-card/10">
            {/* Header Tabs Navigation */}
            <div className="border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-4">
              <div className="flex">
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
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold border-b-2 transition-all ${
                        isActive 
                          ? "border-primary text-primary dark:text-purple-400" 
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Launcher for Quiz */}
              {quizzes[activeDoc.id] && (
                <Link
                  href={`/quiz?docId=${activeDoc.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-purple-400 px-3.5 py-1.5 text-xs font-bold hover:bg-primary/20 transition-all"
                >
                  <Cpu className="h-3.5 w-3.5 animate-pulse" />
                  <span>Calibrate Quiz</span>
                </Link>
              )}
            </div>

            {/* Dynamic Tab Body Panel */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              
              {/* Tab 1: AI Chat Doubt Solver */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full justify-between gap-4">
                  {/* Messages list */}
                  <div className="flex-1 space-y-4 max-h-[460px] overflow-y-auto pr-2">
                    {activeThread.map((msg) => (
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
                    ))}

                    {/* AI Loading state */}
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

                  {/* Message Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-border/80">
                    <input
                      type="text"
                      required
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask AI Doubt (e.g. 'explain formula', 'give exam tip'...)"
                      className="w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isAiReplying}
                      className="rounded-xl bg-primary px-5 text-white hover:bg-primary/95 transition-all shadow-md flex items-center justify-center shrink-0"
                    >
                      <Send className="h-4.5 w-4.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Holographic Flashcards */}
              {activeTab === "flashcards" && (
                <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto space-y-8">
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase">Holographic Deck Review</h3>
                    <p className="text-xs text-zinc-500 mt-1">Review active concepts coordinates. Double click to flip card.</p>
                  </div>

                  {/* Card Flip Container */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="relative w-full aspect-[1.6/1] cursor-pointer group"
                    style={{ perspective: "1000px" }}
                  >
                    <div 
                      className="w-full h-full rounded-2xl border border-border transition-transform duration-500 shadow-lg relative"
                      style={{ 
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)"
                      }}
                    >
                      {/* Front Side */}
                      <div 
                        className="absolute inset-0 bg-card/85 glass-card rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <HelpCircle className="h-6 w-6 text-primary mb-3" />
                        <h4 className="text-base font-bold text-foreground">{flashcards[currentCardIndex].q}</h4>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold absolute bottom-4">Tap to reveal answer</span>
                      </div>

                      {/* Back Side */}
                      <div 
                        className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                        style={{ 
                          backfaceVisibility: "hidden", 
                          transform: "rotateY(180deg)" 
                        }}
                      >
                        <CheckCircle className="h-6 w-6 text-primary dark:text-purple-400 mb-3" />
                        <h4 className="text-base font-mono font-semibold text-foreground leading-relaxed">{flashcards[currentCardIndex].a}</h4>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold absolute bottom-4">Tap to hide</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Actions */}
                  {isFlipped && (
                    <div className="flex gap-4 w-full justify-center">
                      <button
                        onClick={() => handleFlashcardRating(false)}
                        className="rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 px-5 py-2.5 text-xs font-bold text-rose-500 transition-all"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => handleFlashcardRating(true)}
                        className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 px-5 py-2.5 text-xs font-bold text-emerald-500 transition-all"
                      >
                        Mark Mastered (+10 XP)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Reverse Teacher Mode (RTM) */}
              {activeTab === "rtm" && (
                <div className="flex flex-col h-full justify-between gap-6 max-w-2xl mx-auto">
                  <div className="space-y-4">
                    {/* Prompt Box */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-[100px] h-[100px] radial-glow opacity-25 pointer-events-none" />
                      <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-purple-400 uppercase">
                        <GraduationCap className="h-4.5 w-4.5" />
                        <span>Reverse Teacher Prompt</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground leading-snug">{rtmQuestion}</h3>
                    </div>

                    {/* Answer area */}
                    {!rtmEvaluation && (
                      <form onSubmit={handleRtmSubmit} className="space-y-4">
                        <textarea
                          required
                          rows={6}
                          value={rtmAnswer}
                          onChange={(e) => setRtmAnswer(e.target.value)}
                          placeholder="Type your detailed explanation here. Include formulas, definitions, and mechanisms to maximize coverage score..."
                          className="w-full rounded-xl border border-border bg-card/60 p-4 text-sm text-foreground focus:border-primary focus:outline-none transition-all resize-none"
                        />
                        <button
                          type="submit"
                          disabled={rtmLoading}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border"
                        >
                          {rtmLoading ? (
                            <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                          ) : (
                            <Play className="h-4.5 w-4.5" />
                          )}
                          <span>Analyze Conceptual Coverage</span>
                        </button>
                      </form>
                    )}

                    {/* Evaluation Output */}
                    {rtmEvaluation && (
                      <div className="space-y-4">
                        <div className="bg-card border border-border rounded-xl p-5 text-sm text-muted-foreground leading-relaxed glass-card">
                          {rtmEvaluation.split("\n").map((line, idx) => (
                            <p key={idx} className="mb-2">{line}</p>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setRtmEvaluation("");
                            setRtmAnswer("");
                          }}
                          className="w-full rounded-xl border border-border bg-card hover:bg-muted py-2.5 text-xs font-bold text-foreground transition-all"
                        >
                          Try Another active recall session
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
          <h2 className="text-xl font-bold text-foreground">No documents vectorized yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm">Please upload a lecture notes file on the Ingestion screen first to build RAG contexts.</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/95"
          >
            Launch Ingestor
          </Link>
        </div>
      )}
    </div>
  );
}
