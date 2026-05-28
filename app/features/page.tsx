"use client";

import React, { useState, useEffect } from "react";
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
  Compass,
  Sparkles,
  Terminal,
  Activity as PulseIcon
} from "lucide-react";

const engines = [
  {
    title: "Active-Recall Summarizer",
    description: "Auto-extracts formulas, core definitions, and exam warning tips. Instead of passive reading, it forces you to preview active questions first.",
    icon: BookOpen,
    metric: "Inference latency: <1.8s",
    efficiency: "96.4%",
    entropy: "-42%",
    highlights: ["Automatic formula extraction", "Mistakes warning registry", "Syllabus mapping links"]
  },
  {
    title: "Interactive Doubt Solver",
    description: "Ask deep conceptual doubt questions. The AI tutor provides exact reference nodes from your parsed notes with highlight coordinates.",
    icon: Brain,
    metric: "RAG citation precision: 99.4%",
    efficiency: "99.1%",
    entropy: "-68%",
    highlights: ["Multi-document context search", "Definitions highlight triggers", "Voice speech output simulation"]
  },
  {
    title: "Calibration Quiz Engine",
    description: "Adapts quiz complexity dynamically based on prior scores. Features confidence checkboxes to analyze if you are guessing.",
    icon: Cpu,
    metric: "Average quiz generation: 2.2s",
    efficiency: "94.2%",
    entropy: "-35%",
    highlights: ["Immediate scoring and graphs", "Wrong answers remediation logging", "Confetti celebrations"]
  },
  {
    title: "Concept Memory Graph",
    description: "Visualizes chapters and notes in a unified interactive concepts network. Node sizes and colors update dynamically as your recall strengthens.",
    icon: Activity,
    metric: "Real-time canvas refresh",
    efficiency: "98.7%",
    entropy: "-85%",
    highlights: ["Green/Yellow/Red strength levels", "Interactive linking details", "Syllabus forecasting tracker"]
  },
  {
    title: "Learning DNA Profile",
    description: "Maps 8-dimensional cognitive parameters (conceptual, consistency, retention, discipline) to output your unique study archetype.",
    icon: LineChart,
    metric: "Updated after every session",
    efficiency: "95.0%",
    entropy: "-50%",
    highlights: ["Archetype mapping grids", "Custom focus recommendations", "Visual radar charts"]
  },
  {
    title: "Autopilot Study Planner",
    description: "Automatically designs calendars with active spacing recommendations. Recalibrates schedules instantly if tasks are missed.",
    icon: Calendar,
    metric: "Spaced-repetition scheduling",
    efficiency: "92.8%",
    entropy: "-72%",
    highlights: ["Gantt timeline tracking", "Streak preservation logs", "XP reward integrations"]
  },
  {
    title: "Reverse Teacher Mode (RTM)",
    description: "The AI acts as the student. You explain the concept in your own words, and the AI evaluates your conceptual coverage and gaps.",
    icon: GraduationCap,
    metric: "Active retrieval mode",
    efficiency: "97.9%",
    entropy: "-90%",
    highlights: ["Semantic gap calculations", "Socratic follow-ups", "Calibration score upgrades"]
  },
  {
    title: "Holographic Flashcards",
    description: "Auto-generates double-sided QA flashcards. Leverages active recall scores to sort deck priority automatically.",
    icon: Lightbulb,
    metric: "Auto-deck clustering",
    efficiency: "93.6%",
    entropy: "-55%",
    highlights: ["Double-tap flip mechanics", "Mastery ratings triggers", "Review decay alerts"]
  },
  {
    title: "Autopilot Syllabus Gantt",
    description: "Slices massive exam syllabus blueprints into daily bites. Tracks progress lines relative to actual test dates.",
    icon: Compass,
    metric: "Autopilot prioritization",
    efficiency: "91.5%",
    entropy: "-40%",
    highlights: ["Syllabus completion percentages", "Urgency flags", "Duration estimations"]
  },
  {
    title: "Active Weak Area Remediator",
    description: "Sweeps quiz answers and chat questions. Automatically queues failed topics into tomorrow's priority review stack.",
    icon: Zap,
    metric: "Zero-friction revision loop",
    efficiency: "98.2%",
    entropy: "-88%",
    highlights: ["Targeted review flashcards", "Confidence recalibrations", "Automatic study scheduling"]
  }
];

export default function FeaturesPage() {
  const [selectedEngine, setSelectedEngine] = useState(0);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  // Simulating telemetry updates on select
  useEffect(() => {
    const engine = engines[selectedEngine];
    const logPrefixes = [
      "Initializing cognitive sync...",
      "Connecting semantic vector coordinates...",
      "Mapping local recall parameters...",
      "Syncing with Neural Parser...",
      "Calibration complete."
    ];
    
    let active = true;
    let timer: NodeJS.Timeout;
    let idx = 0;
    
    const runLogs = () => {
      if (!active) return;
      if (idx === 0) {
        setTelemetryLogs([`[${new Date().toLocaleTimeString()}] ${engine.title}: ${logPrefixes[0]}`]);
        idx++;
        timer = setTimeout(runLogs, 400);
      } else if (idx < logPrefixes.length) {
        setTelemetryLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${engine.title}: ${logPrefixes[idx]}`]);
        idx++;
        timer = setTimeout(runLogs, 400);
      }
    };
    
    timer = setTimeout(runLogs, 0);
    
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedEngine]);

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[140px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#6366f1]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Cognitive Capability Grid</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] cinematic-title text-foreground">
            Cognitive Engines. <br />
            <span className="bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              Engineered for Recall.
            </span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto font-light leading-relaxed">
            A cohesive neural architecture built to map study workflows to clinical neuroscientific memory retention algorithms.
          </p>
        </div>

        {/* Dynamic Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Navigation List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">Cognitive Modules</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary dark:text-purple-400 font-mono">Active (10)</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[550px] overflow-y-auto pr-2">
              {engines.map((engine, idx) => {
                const Icon = engine.icon;
                const isSelected = selectedEngine === idx;
                return (
                  <button
                    key={engine.title}
                    onClick={() => setSelectedEngine(idx)}
                    className={`flex items-center gap-4 text-left p-4 rounded-2xl border transition-all duration-300 tactile-card ${
                      isSelected 
                        ? "border-primary/40 bg-primary/5 text-white shadow-xl shadow-primary/5" 
                        : "border-white/5 bg-[#0d0d11]/40 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border ${
                      isSelected 
                        ? "bg-primary text-white border-primary/20 shadow-md shadow-primary/20" 
                        : "bg-white/5 text-zinc-400 border-white/5"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold tracking-wide uppercase">{engine.title}</h3>
                      <p className="text-xs text-zinc-500 truncate font-light mt-0.5">{engine.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Presentation Panel */}
          <div className="lg:col-span-7 bg-[#0d0d11]/80 border border-white/5 p-8 rounded-3xl glass-card relative overflow-hidden matte-layer spatial-shadow-lg">
            {/* Glowing effect inside panel */}
            <div className="absolute top-0 right-0 w-[250px] h-[250px] radial-glow opacity-20 pointer-events-none" />
            <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-5" />

            {(() => {
              const activeEngine = engines[selectedEngine];
              const Icon = activeEngine.icon;
              return (
                <div className="space-y-8">
                  {/* Title Bar */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-5">
                      <div className="p-3.5 bg-primary text-white rounded-2xl shadow-xl shadow-primary/10 border border-primary/20">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight uppercase text-white">{activeEngine.title}</h2>
                        <span className="text-[10px] font-bold text-primary dark:text-purple-400 font-mono tracking-widest uppercase mt-0.5 block">{activeEngine.metric}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-zinc-400 leading-relaxed font-light text-sm">
                    {activeEngine.description}
                  </p>

                  {/* Diagnostics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-[#040406]/60 p-4 font-mono">
                      <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Calibration Index</div>
                      <div className="text-lg font-bold text-white mt-1">{activeEngine.efficiency}</div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-[#040406]/60 p-4 font-mono">
                      <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Cognitive Load Delta</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">{activeEngine.entropy}</div>
                    </div>
                  </div>

                  {/* Capabilities Checklist */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono">System Capabilities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeEngine.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300 font-light">
                          <CheckCircle className="h-4 w-4 text-primary dark:text-purple-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Telemetry Simulator Box */}
                  <div className="bg-[#040406] border border-white/5 p-4 rounded-2xl space-y-3 font-mono">
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-primary" />
                        <span>TELEMETRY SYNC INTERFACE</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <PulseIcon className="h-3 w-3 animate-pulse" />
                        <span>ONLINE</span>
                      </div>
                    </div>
                    <div className="text-[10px] leading-relaxed space-y-1 text-zinc-400 max-h-[100px] overflow-y-auto">
                      {telemetryLogs.map((log, i) => (
                        <div key={i} className="whitespace-pre-wrap">{log}</div>
                      ))}
                      {telemetryLogs.length === 0 && (
                        <div className="text-zinc-600 italic">No telemetry data.</div>
                      )}
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
