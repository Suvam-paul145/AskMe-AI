"use client";

import React, { useState } from "react";
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
  Zap,
  Info
} from "lucide-react";

export default function ArchitecturePage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: "Document Ingestion",
      subtitle: "Parsing & Cleansing",
      description: "Ingests raw text and PDF payloads. Simulates local client OCR models to normalize layouts and clean header/footer noise.",
      icon: FileText,
      color: "from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30",
      details: "Outputs pure unicode string representations optimized for chunk parsing algorithms."
    },
    {
      id: 2,
      title: "Semantic Chunking",
      subtitle: "Overlapping Windows",
      description: "Splits raw document text into semantic windows of 500 characters with 100-character overlaps to maintain context boundaries.",
      icon: Layers,
      color: "from-cyan-500/20 to-cyan-600/20 text-cyan-400 border-cyan-500/30",
      details: "Preserves sentences, markdown lists, and math equations without cutting them in half."
    },
    {
      id: 3,
      title: "Vector Embeddings",
      subtitle: "High-Dim Vector Maps",
      description: "Converts text chunks into 768-dimensional vector math weights representing conceptual semantics using Google Gemini Embeddings API.",
      icon: Binary,
      color: "from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30",
      details: "Maps words with similar meanings to close coordinates in the embedding space."
    },
    {
      id: 4,
      title: "Vector Database Store",
      subtitle: "Indexing & Retrieval",
      description: "Saves high-dimensional arrays in a local vector index model (pgvector in production) to support rapid cosine similarity searches.",
      icon: Database,
      color: "from-indigo-500/20 to-indigo-600/20 text-indigo-400 border-indigo-500/30",
      details: "Allows O(1) query lookups for highly relevant documentation fragments."
    },
    {
      id: 5,
      title: "RAG Ingestion Query",
      subtitle: "Cosine Similarity Matching",
      description: "Takes student queries, creates a temporary embedding, and runs a cosine vector match against the vector db to fetch the top 3 chunks.",
      icon: MessageSquare,
      color: "from-pink-500/20 to-pink-600/20 text-pink-400 border-pink-500/30",
      details: "Filters out irrelevant sections, ensuring the LLM is only loaded with correct context."
    },
    {
      id: 6,
      title: "AI Response Synthesis",
      subtitle: "Contextual LLM Output",
      description: "Merges the original student question with retrieved knowledge chunks. Feeds it to Gemini 3.5 Flash for a precise doubt resolution.",
      icon: Bot,
      color: "from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30",
      details: "Provides factual answers, cites source text coordinates, and generates mock flashcards."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Cognitive RAG Pipeline Architecture
          </h1>
          <p className="text-lg text-muted-foreground">
            How AskMe AI converts raw notes and syllabus textbooks into real-time interactive active recall components.
          </p>
        </div>

        {/* Pipeline Diagram Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = activeStep === step.id;
            return (
              <div
                key={step.id}
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
                className={`relative rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 glass-card flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isHovered ? "border-primary shadow-lg scale-[1.02]" : "border-border"
                }`}
              >
                {/* Glow layer */}
                {isHovered && (
                  <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-30 pointer-events-none" />
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary dark:text-purple-400 bg-primary/10 px-2.5 py-1 rounded-full">
                      Step 0{step.id}
                    </span>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} border`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                    <p className="text-xs font-semibold text-muted-foreground">{step.subtitle}</p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Additional interactive specs drawer */}
                <div className={`mt-6 pt-4 border-t border-border transition-all duration-300 ${
                  isHovered ? "opacity-100 block" : "opacity-60"
                }`}>
                  <div className="flex items-start gap-2 text-xs text-foreground/80">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{step.details}</span>
                  </div>
                </div>

                {/* Flow connector line on desktops */}
                {idx < 5 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-border">
                    {idx % 3 !== 2 && <ArrowRight className="h-6 w-6 text-primary/40" />}
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* Footer Technical Note banner */}
        <div className="mt-16 bg-card/60 border border-border p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground max-w-4xl mx-auto">
          <Zap className="h-6 w-6 text-primary shrink-0 animate-pulse" />
          <div>
            <strong className="text-foreground">SaaS Scaling Note:</strong> For the hackathon MVP, step 3 (embeddings) and step 4 (index vector query) utilize our high-performance client-side simulation engine, maintaining zero-latency dashboard metrics and memory updates.
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
