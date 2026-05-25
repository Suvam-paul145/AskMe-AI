"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Brain, Heart, GraduationCap, Calendar, Compass, Milestone, Sparkles } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      title: "Active Retrieval Over Passive Reading",
      description: "Re-reading notes creates an illusion of competence. We force active extraction and recall through adaptive question generation.",
      icon: GraduationCap,
      color: "text-purple-400"
    },
    {
      title: "Memory Decay Compensation",
      description: "Syllabi are calculated using mathematical exponential decay models. Reviews are triggered right before you are forecasted to forget.",
      icon: Calendar,
      color: "text-blue-400"
    },
    {
      title: "Meta-Cognitive Tracking",
      description: "We don't just score tests. We map calibration—monitoring if you are overconfident, underconfident, or correctly balanced.",
      icon: Brain,
      color: "text-emerald-400"
    }
  ];

  const milestones = [
    {
      date: "Q3 2025",
      title: "Core OCR & Parser R&D",
      description: "Engineered high-fidelity math formula scanners and text cleaning pipelines."
    },
    {
      date: "Q4 2025",
      title: "Beta Simulation Alpha testing",
      description: "Deployed local client memory graph tracking models to 500 test students."
    },
    {
      date: "Q1 2026",
      title: "AskMe CLOS Launch",
      description: "Released the unified Cognitive Learning Operating System supporting full dark/light theme dynamics."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        {/* Story Hero */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center mb-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>CLOS Manifesto</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white cinematic-title leading-[1.05]">
              A Manifesto for <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Human Intelligence.
              </span>
            </h1>
            <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-light">
              EdTech software is stuck in static video lists and flat text feeds. AskMe AI was created to design a **Cognitive Operating System** that dynamically adapts to how your neural networks retrieve information.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed font-light font-mono">
              We leverage high-dimensional vector embeddings, custom mathematical calibration indices, and socratic chat interfaces to accelerate cognitive speeds and reduce memory decay.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="rounded-3xl border border-white/5 bg-[#0d0d11]/80 p-8 glass-card max-w-[440px] shadow-2xl relative overflow-hidden matte-layer spatial-shadow-lg group">
              <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-20" />
              <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />
              <Heart className="h-10 w-10 text-primary mb-4 animate-pulse biometric-glow" />
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Our Mission</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                To maximize human cognitive efficiency and reduce studying stress. We believe studying shouldn't feel like a chore; it should feel like an integrated sync between your brain and a high-performance system.
              </p>
            </div>
          </div>
        </div>

        {/* Methodology Core Values */}
        <div className="mb-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white cinematic-title">Our Cognitive Philosophy</h2>
            <p className="text-xs text-zinc-400 font-light">Every component in AskMe AI is grounded in clinical neuroscientific research.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-3xl border border-white/5 bg-[#0d0d11]/40 p-6 glass-card shadow-lg space-y-4 matte-layer hover:border-primary/20 transition-all duration-300">
                  <div className={`p-2.5 rounded-xl border border-white/5 bg-white/5 w-fit ${v.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">{v.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline milestones */}
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white cinematic-title">Timeline Milestones</h2>
            <p className="text-xs text-zinc-400 font-light font-mono">Our journey towards cognitive intelligence models.</p>
          </div>

          <div className="relative border-l border-white/5 pl-8 space-y-8 ml-4">
            {milestones.map((m) => (
              <div key={m.title} className="relative group">
                <span className="absolute -left-[39px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary ring-4 ring-[#040406] shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  <Milestone className="h-2.5 w-2.5 text-white" />
                </span>
                <span className="text-[10px] font-bold text-primary dark:text-purple-400 font-mono tracking-widest uppercase">{m.date}</span>
                <h3 className="text-sm font-bold text-white mt-0.5 uppercase tracking-wide">{m.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1 font-light">{m.description}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
