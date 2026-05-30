"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  FileText, 
  Binary, 
  Layers, 
  Database, 
  ArrowRight, 
  MessageSquare, 
  Bot,
  Info,
  Sparkles,
  Terminal,
  Activity as PulseIcon
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Document Ingestion",
    subtitle: "Parsing & Cleansing",
    description: "Ingests raw text and PDF payloads. Uses pdf-parse to extract structured layout data and strip header/footer noise.",
    icon: FileText,
    color: "from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30",
    details: "Outputs pure unicode string representations optimized for chunk parsing algorithms.",
    logLines: [
      "PDF buffer received: 2.3MB payload",
      "pdf-parse text extraction: 47 pages detected",
      "Header/footer noise stripped: 312 tokens removed",
      "Unicode normalization complete: 18,422 clean tokens"
    ]
  },
  {
    id: 2,
    title: "Semantic Chunking",
    subtitle: "Overlapping Windows",
    description: "Splits raw document text into semantic windows of 500 characters with 100-character overlaps to maintain context boundaries.",
    icon: Layers,
    color: "from-cyan-500/20 to-cyan-600/20 text-cyan-400 border-cyan-500/30",
    details: "Preserves sentences, markdown lists, and math equations without cutting them in half.",
    logLines: [
      "18,422 tokens → chunk segmentation initiated",
      "Sentence boundary detection: active",
      "94 chunks generated (avg 195 chars each)",
      "Overlap windows applied: context continuity ensured"
    ]
  },
  {
    id: 3,
    title: "Vector Embeddings",
    subtitle: "High-Dim Vector Maps",
    description: "Converts text chunks into 768-dimensional vector math weights representing conceptual semantics using Google Gemini Embeddings API.",
    icon: Binary,
    color: "from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30",
    details: "Maps words with similar meanings to close coordinates in the embedding space.",
    logLines: [
      "Gemini embedding API: 94 chunk payloads queued",
      "API call dispatched: batch size 94",
      "768-dim vectors generated for all chunks",
      "Avg embedding latency: 847ms for 94 chunks"
    ]
  },
  {
    id: 4,
    title: "Vector Database Store",
    subtitle: "Indexing & Retrieval",
    description: "Saves high-dimensional arrays in a local vector index model (pgvector in production) to support rapid cosine similarity searches.",
    icon: Database,
    color: "from-indigo-500/20 to-indigo-600/20 text-indigo-400 border-indigo-500/30",
    details: "Allows O(1) query lookups for highly relevant documentation fragments.",
    logLines: [
      "Supabase pgvector connection established",
      "IVFFlat index verified: active",
      "94 vectors inserted to document_chunks",
      "Index rebuilt: ready for similarity queries"
    ]
  },
  {
    id: 5,
    title: "RAG Ingestion Query",
    subtitle: "Cosine Similarity Matching",
    description: "Takes student queries, creates a temporary embedding, and runs a cosine vector match against the vector db to fetch the top 3 chunks.",
    icon: MessageSquare,
    color: "from-pink-500/20 to-pink-600/20 text-pink-400 border-pink-500/30",
    details: "Filters out irrelevant sections, ensuring the LLM is only loaded with correct context.",
    logLines: [
      "Student query received: 23 tokens",
      "Query embedding generated: 768-dim vector",
      "pgvector cosine scan: 94 vectors compared",
      "Top-5 retrieved (scores: 0.91, 0.88, 0.85, 0.82, 0.79)"
    ]
  },
  {
    id: 6,
    title: "AI Response Synthesis",
    subtitle: "Contextual LLM Output",
    description: "Merges the original student question with retrieved knowledge chunks. Feeds it to Gemini 3.5 Flash for a precise doubt resolution.",
    icon: Bot,
    color: "from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30",
    details: "Provides factual answers, cites source text coordinates, and generates mock flashcards.",
    logLines: [
      "Context assembled: 5 chunks → 1,847 tokens",
      "RAG grounding prompt injected",
      "Gemini 2.0 Flash API dispatched",
      "Grounded response generated: 312 tokens. Latency: 1.8s"
    ]
  }
];

export default function ArchitecturePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update logs when activeStep changes
  useEffect(() => {
    if (!mounted) return;
    const step = steps[activeStep];
    const base = new Date();
    const fmt = (offsetMs: number) => {
      const d = new Date(base.getTime() + offsetMs);
      return d.toLocaleTimeString([], { hour12: false });
    };

    setSimulationLogs(
      step.logLines.map((line, i) => `[${fmt(i * 1200)}] ${line}`)
    );
  }, [activeStep, mounted]);

  // Scroll logs window to bottom
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [simulationLogs]);

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Architecture Specification</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] cinematic-title text-foreground">
            RAG Pipeline. <br />
            <span className="bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              Mapped in Dimensions.
            </span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
            This diagram visualizes the server-side RAG pipeline that powers AskMe AI.
            Documents are parsed with pdf-parse, chunked server-side, and embedded via
            Gemini text-embedding-004 (768-dim vectors). All vectors are stored in
            Supabase pgvector with IVFFlat indexing for sub-100ms cosine similarity queries.
            Student queries follow the same embedding path before retrieval and LLM synthesis.
          </p>
        </div>

        {/* Visual Pipeline Flow Diagram */}
        <div className="bg-[#0d0d11]/50 border border-white/5 p-6 rounded-3xl mb-10 relative overflow-hidden matte-layer spatial-shadow-lg">
          <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono mb-4">Pipeline Flow Map</div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const Icon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setActiveStep(idx)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300 w-full md:w-36 text-center cursor-pointer ${
                      isActive 
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] scale-[1.02]" 
                        : "border-white/5 bg-[#0d0d11]/80 text-zinc-400 hover:text-white hover:border-white/10"
                    }`}
                  >
                    <div className={`p-2 rounded-xl border ${isActive ? "bg-primary text-white border-primary/20" : "bg-white/5 text-zinc-500 border-white/5"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary dark:text-purple-400">0{step.id}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider truncate w-full">{step.title}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className="text-zinc-650 hidden md:block animate-pulse font-mono select-none">→</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Pipeline Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left: Step navigation lists */}
          <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono block mb-2">Select Pipeline Node</span>
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full flex items-center gap-4 text-left p-4 rounded-2xl border transition-all duration-300 tactile-card ${
                      isActive 
                        ? "border-primary/40 bg-primary/5 text-white" 
                        : "border-white/5 bg-[#0d0d11]/40 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-primary dark:text-purple-400 bg-primary/10 px-2 py-0.5 rounded-md">
                      0{step.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold uppercase tracking-wider">{step.title}</div>
                      <div className="text-[10px] text-zinc-500 font-light truncate mt-0.5">{step.subtitle}</div>
                    </div>
                    <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isActive ? "translate-x-1 text-primary" : "text-zinc-600"}`} />
                  </button>
                );
              })}
            </div>

            {/* Note box */}
            <div className="bg-[#0d0d11]/40 border border-white/5 p-4 rounded-2xl flex items-start gap-3 mt-6">
              <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div className="text-[10px] text-zinc-400 leading-relaxed font-light">
                The architecture overview is rendered client-side for visualization. In production, vector synthesis and retrieval run on Supabase pgvector with Gemini text-embedding-004.
              </div>
            </div>
          </div>

          {/* Right: Immersive node display & simulated visualization */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Displaying detailed specs of selected step */}
            {(() => {
              const currentStep = steps[activeStep];
              const Icon = currentStep.icon;
              return (
                <div className="bg-[#0d0d11]/80 border border-white/5 p-8 rounded-3xl glass-card relative overflow-hidden matte-layer spatial-shadow-lg flex-1 flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-15 pointer-events-none" />
                  <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-5" />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${currentStep.color} border shadow-lg`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold tracking-widest text-primary dark:text-purple-400 font-mono">Pipeline Node 0{currentStep.id}</div>
                          <h3 className="text-xl font-extrabold uppercase text-white mt-0.5">{currentStep.title}</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{currentStep.subtitle}</span>
                    </div>

                    <p className="text-sm text-zinc-400 leading-relaxed font-light">
                      {currentStep.description}
                    </p>

                    <div className="bg-[#040406]/60 border border-white/5 rounded-2xl p-5 space-y-2">
                      <div className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-widest">Internal Logic Specifications</div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                        {currentStep.details}
                      </p>
                    </div>
                  </div>

                  {/* Flow progress diagram indicator */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-500">
                    <span>STATUS: CALIBRATED</span>
                    <div className="flex items-center gap-1.5">
                      {steps.map((s, idx) => (
                        <div 
                          key={s.id}
                          className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                            idx <= activeStep 
                              ? "bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
                              : "bg-white/5"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Live Terminal logs simulator */}
            <div className="bg-[#040406] border border-white/5 p-5 rounded-3xl font-mono text-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span>ARCHITECTURE TELEMETRY READOUT</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <PulseIcon className="h-3 w-3 animate-pulse" />
                  <span>RECEIVING LIVE STREAM</span>
                </div>
              </div>
              
              <div 
                ref={logsContainerRef}
                className="max-h-[110px] overflow-y-auto text-[10px] text-zinc-400 space-y-1.5 scroll-smooth"
              >
                {simulationLogs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap font-mono text-zinc-400 border-l-2 border-primary/20 pl-2">
                    {log}
                  </div>
                ))}
                {simulationLogs.length === 0 && (
                  <div className="text-zinc-650 italic">Logs system initialized. Click a step to simulate telemetry.</div>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
