"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { AlertCircle, ArrowRight, BarChart, CheckCircle2, Flame, LineChart, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { weakTopics, nodes } = useStore();

  const analyticsTopics = [
    { name: "Coulomb's Law", score: 88, status: "mastered", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-500" },
    { name: "DNA Replication", score: 80, status: "learning", color: "border-blue-500/30 bg-blue-500/5 text-blue-500" },
    { name: "Transcription", score: 70, status: "learning", color: "border-blue-500/30 bg-blue-500/5 text-blue-500" },
    { name: "Electric Potential", score: 40, status: "weak", color: "border-rose-500/30 bg-rose-500/5 text-rose-500" },
    { name: "Translation", score: 35, status: "weak", color: "border-rose-500/30 bg-rose-500/5 text-rose-500" },
    { name: "Gauss's Law", score: 25, status: "forgotten", color: "border-rose-500/30 bg-rose-500/5 text-rose-500" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative select-none">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Cognitive Weak Area Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Detailed analysis of topic decay speeds, recall percentages, and revision priority queues.</p>
        </div>

        {/* Top summary banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Analysis Card */}
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <LineChart className="h-4.5 w-4.5 text-primary" />
                Active recall Calibration
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your conceptual retention is calibrated at **74% average**. Spaced repetition schedules have queued **3 topics** for immediate active review to prevent memory decay.
              </p>
            </div>
          </div>

          {/* Warning Card */}
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-rose-500 flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 animate-bounce" />
                Decay Alerts (Priority Review)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We detected conceptual retrieval failure on **Translation** and **Electric Potential** in your recent assessments. We suggest starting a Reverse Teacher active recall session to restore mastery.
              </p>
            </div>
          </div>
        </div>

        {/* Heatmap Grid of Topics */}
        <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart className="h-4.5 w-4.5 text-primary" />
              Syllabus Concept Calibration Grid
            </h3>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Calibrated by quiz scores</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsTopics.map((topic) => (
              <div
                key={topic.name}
                className={`rounded-2xl border p-5 glass-card flex flex-col justify-between gap-4 ${topic.color}`}
              >
                <div>
                  <h4 className="text-sm font-bold text-foreground">{topic.name}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 mt-1 block">
                    {topic.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-t border-current/10 pt-3 text-xs">
                  <span className="opacity-80">Recall Calibration:</span>
                  <span className="font-bold">{topic.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Automated Revision Planner output */}
        <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
              Automated Revision Autopilot Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {weakTopics.map((topic, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-border bg-card/50 p-4 text-xs font-semibold text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    Revision Priority {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-foreground mt-1">Review: {topic}</h4>
                  <p className="text-zinc-500 font-medium leading-normal">Identified weakness in quiz answers. Complete a 15-minute doubt solver session.</p>
                </div>
                <Link
                  href="/workspace"
                  className="inline-flex items-center gap-1 text-primary dark:text-purple-400 font-semibold hover:underline shrink-0"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
