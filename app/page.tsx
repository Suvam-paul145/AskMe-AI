"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  Upload, 
  Brain, 
  Cpu, 
  LineChart, 
  Calendar, 
  Sparkles, 
  GraduationCap, 
  ArrowRight, 
  Flame, 
  Zap, 
  BookOpen, 
  Activity 
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("summarizer");

  const bentoFeatures = [
    {
      id: "summarizer",
      title: "Active-Recall Summarizer",
      description: "Auto-extracts formulas, core concepts, exam warnings, and common student mistakes instantly from raw documents.",
      icon: BookOpen,
      color: "from-purple-500/20 to-indigo-500/20 text-purple-400",
      accent: "bg-purple-500",
      badge: "OCR & Synthesis"
    },
    {
      id: "chat",
      title: "Interactive Doubt Solver",
      description: "Ask your personalized AI tutor deep conceptual doubts with reference nodes linked directly to your uploaded text.",
      icon: Brain,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400",
      accent: "bg-blue-500",
      badge: "RAG Model"
    },
    {
      id: "quiz",
      title: "Calibration Quiz Engine",
      description: "Adapts question difficulty in real-time. Highlights incorrect topics and logs them directly to your weak topics registry.",
      icon: Cpu,
      color: "from-pink-500/20 to-rose-500/20 text-pink-400",
      accent: "bg-pink-500",
      badge: "Adaptive Testing"
    },
    {
      id: "graph",
      title: "Interactive Memory Graph",
      description: "Visualizes your study chapters as an interconnected neural network. Concept nodes change color based on recall strength.",
      icon: Activity,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400",
      accent: "bg-emerald-500",
      badge: "Visual Nodes"
    },
    {
      id: "dna",
      title: "Learning DNA Profile",
      description: "Calculates an 8-dimensional cognitive chart detailing consistency, retention levels, and your learning archetype.",
      icon: LineChart,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400",
      accent: "bg-amber-500",
      badge: "Analytics"
    },
    {
      id: "planner",
      title: "Autopilot Study Planner",
      description: "Generates custom calendars with spaced-repetition triggers and urgent flags. Auto-recalibrates if you miss a goal.",
      icon: Calendar,
      color: "from-red-500/20 to-violet-500/20 text-red-400",
      accent: "bg-red-500",
      badge: "Autopilot"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] radial-glow opacity-60 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Content */}
            <div className="space-y-8 lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary dark:text-purple-400 animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Introducing Cognitive Learning OS (CLOS)</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
                AI That Learns <br />
                <span className="bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  How You Learn
                </span>
              </h1>

              <p className="max-w-2xl mx-auto lg:mx-0 text-lg md:text-xl text-muted-foreground leading-relaxed">
                Stop studying linearly. Ingest your textbooks and lecture notes, and let AskMe AI build an interactive neural knowledge graph, adapt quizzes to your memory gaps, and calibrate your personalized syllabus.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/upload"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg hover:bg-primary/95 transition-all glowing-border"
                >
                  <Upload className="h-5 w-5" />
                  Upload Notes & Files
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-bold text-foreground hover:bg-muted/50 transition-all"
                >
                  <span>Explore Demo Dashboard</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </div>

              {/* Simple metrics */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border/80">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">98.4%</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Retention Rate</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">10x</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Syllabus Ingestion</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">12,000+</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Minds</p>
                </div>
              </div>
            </div>

            {/* Right Visual Mesh simulator */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[420px] aspect-square rounded-2xl border border-border bg-card/40 backdrop-blur-md p-6 glass-card shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
                
                {/* SVG Visualizer Simulation */}
                <div className="h-[250px] w-full relative flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 400 300">
                    {/* Connection lines */}
                    <line x1="200" y1="150" x2="100" y2="80" stroke="rgba(139,92,246,0.3)" strokeWidth="2" strokeDasharray="3 3" />
                    <line x1="200" y1="150" x2="300" y2="90" stroke="rgba(139,92,246,0.3)" strokeWidth="2" />
                    <line x1="200" y1="150" x2="140" y2="230" stroke="rgba(244,63,94,0.4)" strokeWidth="2.5" />
                    <line x1="200" y1="150" x2="270" y2="220" stroke="rgba(16,185,129,0.3)" strokeWidth="2" />
                    
                    {/* Core Hub */}
                    <circle cx="200" cy="150" r="18" className="fill-primary/20 stroke-primary stroke-[2] animate-pulse" />
                    <text x="200" y="154" textAnchor="middle" fill="currentColor" className="text-[10px] font-bold text-primary dark:text-purple-400">Hub</text>

                    {/* Nodes */}
                    <circle cx="100" cy="80" r="12" className="fill-blue-500/20 stroke-blue-500 stroke-[2]" />
                    <text x="100" y="112" textAnchor="middle" fill="currentColor" className="text-[10px] text-muted-foreground">Physics</text>

                    <circle cx="300" cy="90" r="14" className="fill-indigo-500/20 stroke-indigo-500 stroke-[2]" />
                    <text x="300" y="122" textAnchor="middle" fill="currentColor" className="text-[10px] text-muted-foreground">Biology</text>

                    <circle cx="140" cy="230" r="10" className="fill-rose-500/20 stroke-rose-500 stroke-[2] animate-bounce" />
                    <text x="140" y="258" textAnchor="middle" fill="currentColor" className="text-[10px] text-rose-500 font-semibold">Weak Area</text>

                    <circle cx="270" cy="220" r="13" className="fill-emerald-500/20 stroke-emerald-500 stroke-[2]" />
                    <text x="270" y="250" textAnchor="middle" fill="currentColor" className="text-[10px] text-emerald-500 font-semibold">Mastered</text>
                  </svg>
                </div>

                {/* Simulated Activity Feed */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                      Cognitive Alignment Status
                    </span>
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Optimal</span>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-2.5 text-xs text-foreground/80 flex items-center justify-between">
                    <span>Active Topic: <strong>Coulomb's Law</strong></span>
                    <span className="text-primary font-bold">88% strength</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-20 border-t border-border bg-card/20 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Ten Engines. One Unified Cognitive OS.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We replaced disjointed flashcard widgets and standalone chatbots with a singular neural loop that updates your learning profile on every interaction.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bentoFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 glass-card glowing-border group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 bg-muted/60 px-2.5 py-1 rounded-full">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-6">
                    <Link
                      href="/workspace"
                      className="text-xs font-semibold text-primary dark:text-purple-400 flex items-center gap-1 hover:underline"
                    >
                      Launch Module
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visual Demo Showcase */}
      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent rounded-3xl border border-primary/20 p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Ready to calibrate your learning path?
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Take our mock workspace for a spin. Instantly upload notes, simulate deep doubt questions, score custom MCQ attempts, and watch your DNA graph realign.
              </p>
            </div>
            <div>
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg hover:bg-primary/95 transition-all glowing-border"
              >
                Ingest Your Syllabus Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
