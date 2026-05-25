"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Award, Brain, Activity, Target, ShieldCheck, RefreshCw } from "lucide-react";

export default function DnaPage() {
  const { profile } = useStore();

  const dnaMetrics = [
    { name: "Conceptual Depth", val: profile.conceptual, desc: "Abstract logic and theory mapping speeds." },
    { name: "Memory Retention", val: profile.retention, desc: "Resistance to cognitive forgetting curves." },
    { name: "Analytical Speed", val: profile.analytical, desc: "Quantitative and mathematical calculation precision." },
    { name: "Study Consistency", val: profile.consistency, desc: "Streak preservation and regular revision spacing." },
    { name: "Autopilot Discipline", val: profile.discipline, desc: "Adherence to spacing calendar notifications." },
    { name: "Calibration Accuracy", val: profile.calibration, desc: "Awareness of actual mastery vs confidence guesses." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative select-none">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary dark:text-purple-400">
            <Activity className="h-3.5 w-3.5" />
            <span>Calibrated Cognitive Profile</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Your Personal Learning DNA
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Our neural engine maps 8 dimensions of study performance, dynamically adjusting your cognitive profile indices on every interaction.
          </p>
        </div>

        {/* Archetype Profile Card */}
        <div className="border border-border bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />

          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/15 border border-primary/30 animate-pulse pointer-events-none" />
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400 shadow-md">
              <Brain className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary dark:text-purple-400 bg-primary/10 px-2.5 py-1 rounded-full">
              Archetype Class
            </span>
            <h2 className="text-xl font-bold text-foreground">{profile.archetype}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              {profile.description}
            </p>
          </div>
        </div>

        {/* 8D Metrics Progress Grid */}
        <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Target className="h-4.5 w-4.5 text-primary" />
              Cognitive Trait Coordinates
            </h3>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Calibrations updated live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dnaMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2 border border-border/60 bg-card/30 p-4 rounded-xl glass-card">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">{metric.name}</span>
                  <span className="text-primary dark:text-purple-400 font-bold">{metric.val}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${metric.val}%` }}
                  />
                </div>

                <p className="text-[10px] text-zinc-500 leading-normal">{metric.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Calibration banner */}
        <div className="bg-card/60 border border-border p-5 rounded-2xl flex items-center gap-3.5 text-xs text-muted-foreground max-w-2xl mx-auto">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <span>
            This cognitive blueprint is stored locally and calibrated dynamically when you solve doubts, flips active flashcards, and submit quiz answers.
          </span>
        </div>

      </main>

      <Footer />
    </div>
  );
}
