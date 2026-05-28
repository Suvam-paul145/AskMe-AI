"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Briefcase, MapPin, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
  const jobs = [
    {
      title: "Senior Cognitive Systems Engineer",
      team: "Core RAG Engine",
      location: "San Francisco, CA / Remote",
      type: "Full-Time",
      description: "Optimize high-dimensional vector coordinate retrievals and build contextual reference extraction architectures."
    },
    {
      title: "Neural Parser Architect",
      team: "Ingestion Core",
      location: "Remote",
      type: "Full-Time",
      description: "Build premium visual scanning engines, OCR math compilers, and client-side RAG vector pipelines."
    },
    {
      title: "Active Recall UX Designer",
      team: "Cognitive Science",
      location: "Hybrid (New York, NY)",
      type: "Part-Time / Intern",
      description: "Design cognitive stress evaluations, spaced-repetition spacing rates, and test student retention architectures."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Intelligence Evolution Careers</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white cinematic-title leading-tight">
            Join the Intelligence Evolution
          </h1>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto font-light leading-relaxed">
            We are hiring engineers, cognitive scientists, and interaction designers passionate about unlocking human mental bandwidth.
          </p>
        </div>

        {/* Core Perks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="border border-white/5 bg-[#0d0d11]/40 p-6 rounded-3xl glass-card space-y-3.5 matte-layer spatial-shadow-lg transition-all hover:border-primary/20 duration-300">
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">Cognitive Autonomy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              We operate asynchronously with pure goal-based structures. Work where you think best, whenever your focus peak is.
            </p>
          </div>
          <div className="border border-white/5 bg-[#0d0d11]/40 p-6 rounded-3xl glass-card space-y-3.5 matte-layer spatial-shadow-lg transition-all hover:border-primary/20 duration-300">
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">Premium Equipment</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Get an Apple hardware bundle, premium software licensing (Copilot, Cursor, linear, etc.), and $1,500 annual cognitive research credits.
            </p>
          </div>
          <div className="border border-white/5 bg-[#0d0d11]/40 p-6 rounded-3xl glass-card space-y-3.5 matte-layer spatial-shadow-lg transition-all hover:border-primary/20 duration-300">
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">Continuous Learning</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              We cover textbook purchases, medical mental wellness apps, research papers access, and global cognitive conference tickets.
            </p>
          </div>
        </div>

        {/* Jobs List Grid */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 flex items-center gap-2 mb-6">
            <Briefcase className="h-4 w-4 text-primary" />
            Current Operations Openings ({jobs.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div
                key={job.title}
                className="rounded-3xl border border-white/5 bg-[#0d0d11]/80 hover:bg-[#0f0f14] p-6 shadow-2xl transition-all duration-300 group flex flex-col md:flex-row justify-between items-start md:items-center gap-4 matte-layer spatial-shadow-lg"
              >
                <div className="space-y-2.5">
                  <span className="text-[8px] uppercase font-bold tracking-widest text-primary dark:text-purple-400 bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full inline-block biometric-glow">
                    {job.team}
                  </span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">{job.title}</h3>
                  <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed font-light">{job.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-500 pt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {job.type}
                    </span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="rounded-xl bg-primary px-5 py-3 text-xs font-bold text-white hover:bg-primary/95 transition-all w-full md:w-auto text-center glowing-border duration-300"
                >
                  Apply Now
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
