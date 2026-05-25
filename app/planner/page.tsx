"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { 
  Calendar, 
  Plus, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  SlidersHorizontal,
  Zap
} from "lucide-react";

export default function PlannerPage() {
  const { planner, togglePlannerItem, addPlannerItem } = useStore();
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("20");
  const [newUrgency, setNewUrgency] = useState(false);
  const [cognitiveIntensity, setCognitiveIntensity] = useState(3); // 1 to 4 slider

  const intensityLabels = [
    { level: 1, name: "Stealth Spacing", desc: "Minimal review intervals; light pacing." },
    { level: 2, name: "Calibrated Spacing", desc: "Automated standard decay interval review." },
    { level: 3, name: "Deep Socratic Immersion", desc: "Rigorous active recall and detail querying." },
    { level: 4, name: "Accelerated Exam Sprint", desc: "Maximum review rate targeting weak spots." }
  ];

  const currentIntensity = intensityLabels.find(i => i.level === cognitiveIntensity) || intensityLabels[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addPlannerItem({
      date: new Date().toISOString().split("T")[0],
      title: newTitle,
      duration: parseInt(newDuration, 10),
      isUrgent: newUrgency
    });

    setNewTitle("");
    setNewDuration("20");
    setNewUrgency(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2">
            <Zap className="h-3.5 w-3.5 animate-pulse" />
            <span>AI Roadmap Scheduling</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white cinematic-title">AI Cognitive Roadmap</h1>
          <p className="text-xs text-zinc-400 mt-1 font-light">Spaced-repetition scheduling logs optimized by memory decay thresholds and cognitive intensity speeds.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Task checklist lists (col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.20em] text-zinc-500 flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              Active Memory Alignment Pathway
            </h2>

            <div className="relative pl-6 border-l border-white/5 space-y-6">
              {planner.map((item, idx) => {
                const stepNum = idx + 1;
                return (
                  <div key={item.id} className="relative group">
                    {/* Visual node on timeline line */}
                    <div className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                      item.completed 
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                        : item.isUrgent 
                          ? "border-rose-500 bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]" 
                          : "border-zinc-700 bg-zinc-950 text-zinc-500"
                    }`}>
                      <span className="text-[7px] font-bold">{stepNum}</span>
                    </div>

                    <div
                      onClick={() => togglePlannerItem(item.id)}
                      className={`border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 cursor-pointer select-none matte-layer spatial-shadow-lg ${
                        item.completed 
                          ? "border-white/5 bg-[#0d0d11]/40 opacity-50" 
                          : item.isUrgent 
                            ? "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.02)]" 
                            : "border-white/5 bg-[#0d0d11]/80 hover:bg-[#121217]"
                      }`}
                    >
                      <div className="space-y-1.5 pr-4">
                        <h3 className={`text-xs font-bold leading-normal ${item.completed ? "line-through text-zinc-500 font-normal" : "text-white"}`}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[9px] text-zinc-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.duration} Min
                          </span>
                          <span>•</span>
                          <span>Calibrated: {item.date}</span>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {item.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 biometric-glow" />
                        ) : item.isUrgent ? (
                          <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse biometric-glow" />
                        ) : (
                          <div className="h-4.5 w-4.5 rounded-full border border-zinc-700 group-hover:border-primary transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Add new items form & sliders (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Cognitive Intensity Slider */}
            <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-3xl glass-card space-y-4 matte-layer spatial-shadow-lg">
              <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-primary animate-pulse" />
                Cognitive Intensity Mode
              </h3>
              
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={cognitiveIntensity}
                  onChange={(e) => setCognitiveIntensity(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />

                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow">
                    Level {currentIntensity.level}: {currentIntensity.name}
                  </span>
                  <p className="text-[10px] text-zinc-400 leading-normal font-light">{currentIntensity.desc}</p>
                </div>
              </div>
            </div>

            {/* Queue recall study */}
            <div className="border border-white/5 bg-[#0d0d11]/80 p-6 rounded-3xl glass-card relative overflow-hidden matte-layer spatial-shadow-lg">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />
              <h3 className="text-[10px] uppercase font-bold tracking-[0.20em] text-zinc-400 flex items-center gap-1.5 mb-4 border-b border-white/5 pb-3">
                <Plus className="h-4 w-4 text-primary" />
                Queue Recall Study
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="task-title" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Task Description</label>
                  <input
                    type="text"
                    id="task-title"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. DNA Transcription flashcards"
                    className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-700 font-light"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="task-duration" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Minutes</label>
                    <select
                      id="task-duration"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full rounded-xl border border-white/5 bg-[#09090b]/80 px-4 py-3 text-xs text-zinc-300 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="10">10 Min</option>
                      <option value="15">15 Min</option>
                      <option value="20">20 Min</option>
                      <option value="30">30 Min</option>
                      <option value="45">45 Min</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border border-white/5 bg-[#09090b]/40 px-4 py-3 rounded-xl mt-[28px] h-[40px]">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Urgent</span>
                    <input
                      type="checkbox"
                      id="task-urgency"
                      checked={newUrgency}
                      onChange={(e) => setNewUrgency(e.target.checked)}
                      className="h-4 w-4 text-primary accent-primary rounded cursor-pointer border-white/5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border duration-300"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Queue Spaced Review (+15 XP)</span>
                </button>
              </form>
            </div>

            {/* Daily stats banner */}
            <div className="bg-[#0b0b0e]/90 border border-white/5 p-4.5 rounded-2xl flex items-center gap-3.5 text-xs text-zinc-400 matte-layer spatial-shadow-lg font-light leading-relaxed">
              <Target className="h-5 w-5 text-primary shrink-0 animate-pulse" />
              <span>Completing planner reviews awards 15 XP cognitive reward points directly to your profile.</span>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
