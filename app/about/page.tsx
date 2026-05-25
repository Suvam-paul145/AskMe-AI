"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Brain, Heart, GraduationCap, Calendar, Compass, Milestone } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Story Hero */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center mb-20">
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              We are building the <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Tesla of EdTech
              </span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              EdTech platforms are stuck in the 2010s: selling video libraries and static text files. AskMe AI was born to change this by designing a **Cognitive Operating System** that dynamically adapts to how your neural networks retrieve information.
            </p>
            <p className="text-sm text-zinc-500 leading-relaxed">
              We leverage modern high-dimensional vector embeddings, custom mathematical calibration indices, and socratic chat tutors to help you learn faster and preserve information.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="rounded-2xl border border-border bg-card/40 p-8 glass-card max-w-[440px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />
              <Heart className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To maximize human cognitive efficiency and reduce studying stress. We believe studying shouldn't feel like a chore; it should feel like an integrated sync between your brain and a high-performance system.
              </p>
            </div>
          </div>
        </div>

        {/* Methodology Core Values */}
        <div className="mb-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Our Cognitive Philosophy</h2>
            <p className="mt-3 text-muted-foreground">Every component in AskMe AI is grounded in clinical neuroscientific research.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-xl border border-border bg-card/20 p-6 glass-card shadow-sm space-y-4">
                  <div className={`p-2 bg-muted rounded-xl w-fit ${v.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline milestones */}
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Timeline Milestones</h2>
            <p className="mt-3 text-muted-foreground">Our journey towards cognitive intelligence models.</p>
          </div>

          <div className="relative border-l border-border pl-6 space-y-8 ml-4">
            {milestones.map((m) => (
              <div key={m.title} className="relative">
                <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                  <Milestone className="h-2 w-2 text-white" />
                </span>
                <span className="text-xs font-bold text-primary dark:text-purple-400">{m.date}</span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">{m.description}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
