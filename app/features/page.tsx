"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  BookOpen, 
  Brain, 
  Cpu, 
  Activity, 
  LineChart, 
  Calendar, 
  GraduationCap, 
  Lightbulb, 
  Zap, 
  CheckCircle,
  Clock,
  Compass
} from "lucide-react";

export default function FeaturesPage() {
  const [selectedEngine, setSelectedEngine] = useState(0);

  const engines = [
    {
      title: "Active-Recall Summarizer",
      description: "Auto-extracts formulas, core definitions, and exam warning tips. Instead of passive reading, it forces you to preview active questions first.",
      icon: BookOpen,
      metric: "Inference time: <1.8s",
      highlights: ["Automatic formula extraction", "Mistakes warning registry", "Syllabus mapping links"]
    },
    {
      title: "Interactive Doubt Solver",
      description: "Ask deep conceptual doubt questions. The AI tutor provides exact reference nodes from your parsed notes with highlight coordinates.",
      icon: Brain,
      metric: "RAG citation precision: 99.4%",
      highlights: ["Multi-document context search", "Definitions highlight triggers", "Voice speech output simulation"]
    },
    {
      title: "Calibration Quiz Engine",
      description: "Adapts quiz complexity dynamically based on prior scores. Features confidence checkboxes to analyze if you are guessing.",
      icon: Cpu,
      metric: "Average quiz generation: 2.2s",
      highlights: ["Immediate scoring and graphs", "Wrong answers remediation logging", "Confetti celebrations"]
    },
    {
      title: "Concept Memory Graph",
      description: "Visualizes chapters and notes in a unified interactive concepts network. Node sizes and colors update dynamically as your recall strengthens.",
      icon: Activity,
      metric: "Real-time canvas refresh",
      highlights: ["Green/Yellow/Red strength levels", "Interactive linking details", "Syllabus forecasting tracker"]
    },
    {
      title: "Learning DNA Profile",
      description: "Maps 8-dimensional cognitive parameters (conceptual, consistency, retention, discipline) to output your unique study archetype.",
      icon: LineChart,
      metric: "Updated after every session",
      highlights: ["Archetype mapping grids", "Custom focus recommendations", "Visual radar charts"]
    },
    {
      title: "Autopilot Study Planner",
      description: "Automatically designs calendars with active spacing recommendations. Recalibrates schedules instantly if tasks are missed.",
      icon: Calendar,
      metric: "Spaced-repetition scheduling",
      highlights: ["Gantt timeline tracking", "Streak preservation logs", "XP reward integrations"]
    },
    {
      title: "Reverse Teacher Mode (RTM)",
      description: "The AI acts as the student. You explain the concept in your own words, and the AI evaluates your conceptual coverage and gaps.",
      icon: GraduationCap,
      metric: "Active retrieval mode",
      highlights: ["Semantic gap calculations", "Socratic follow-ups", "Calibration score upgrades"]
    },
    {
      title: "Holographic Flashcards",
      description: "Auto-generates double-sided QA flashcards. Leverages active recall scores to sort deck priority automatically.",
      icon: Lightbulb,
      metric: "Auto-deck clustering",
      highlights: ["Double-tap flip mechanics", "Mastery ratings triggers", "Review decay alerts"]
    },
    {
      title: "Autopilot Syllabus Gantt",
      description: "Slices massive exam syllabus blueprints into daily bites. Tracks progress lines relative to actual test dates.",
      icon: Compass,
      metric: "Autopilot prioritization",
      highlights: ["Syllabus completion percentages", "Urgency flags", "Duration estimations"]
    },
    {
      title: "Active Weak Area Remediator",
      description: "Sweeps quiz answers and chat questions. Automatically queues failed topics into tomorrow's priority review stack.",
      icon: Zap,
      metric: "Zero-friction revision loop",
      highlights: ["Targeted review flashcards", "Confidence recalibrations", "Automatic study scheduling"]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            The 10 Cognitive Engines of AskMe CLOS
          </h1>
          <p className="text-lg text-muted-foreground">
            A cohesive neural architecture built to align learning methods with neuroscientific memory models.
          </p>
        </div>

        {/* Dynamic Split Screen layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Grid */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-4">Select Cognitive Engine</h2>
            <div className="grid grid-cols-1 gap-2.5 max-h-[600px] overflow-y-auto pr-2">
              {engines.map((engine, idx) => {
                const Icon = engine.icon;
                const isSelected = selectedEngine === idx;
                return (
                  <button
                    key={engine.title}
                    onClick={() => setSelectedEngine(idx)}
                    className={`flex items-center gap-4 text-left p-3.5 rounded-xl border transition-all ${
                      isSelected 
                        ? "border-primary bg-primary/5 text-primary shadow-sm" 
                        : "border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{engine.title}</h3>
                      <p className="text-xs opacity-80 line-clamp-1">{engine.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Presentation Panel */}
          <div className="lg:col-span-7 bg-card/40 border border-border p-6 md:p-8 rounded-2xl glass-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] radial-glow opacity-30 pointer-events-none" />

            {/* Displaying selected engine details */}
            {(() => {
              const activeEngine = engines[selectedEngine];
              const Icon = activeEngine.icon;
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{activeEngine.title}</h2>
                        <span className="text-xs font-semibold text-primary dark:text-purple-400">{activeEngine.metric}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed text-base">
                    {activeEngine.description}
                  </p>

                  <div className="space-y-4 pt-4">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Capabilities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeEngine.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulator Box */}
                  <div className="bg-muted/40 border border-border p-4 rounded-xl space-y-3 mt-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>CLOS Live Simulation Status</span>
                    </div>
                    <div className="text-xs text-foreground/80 leading-relaxed">
                      This engine is fully integrated with the client-side state store and updates your streak and XP stats automatically as you study.
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
