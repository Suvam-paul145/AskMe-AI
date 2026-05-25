"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { BookOpen, Calendar, Clock, ArrowRight, Brain, Sparkles } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      title: "Why Re-reading Your Notes is a Cognitive Illusion",
      excerpt: "Multiple studies confirm that reviewing text creates familiarity rather than actual recall paths. Discover the active retrieval methodology behind RAG systems.",
      category: "Learning Science",
      readTime: "5 min read",
      date: "May 24, 2026",
      icon: Brain,
      color: "text-purple-400 bg-purple-500/10"
    },
    {
      title: "The Math Behind Spaced-Repetition Schedules",
      excerpt: "Ingest notes at optimal mathematical points. Learn how we utilize customizable exponential decay models to forecast memory failure scores.",
      category: "Mathematical Models",
      readTime: "7 min read",
      date: "May 20, 2026",
      icon: Clock,
      color: "text-blue-400 bg-blue-500/10"
    },
    {
      title: "Building the Next-Gen Cognitive OS: A Technical Retrospective",
      excerpt: "Behind the scenes: orchestrating client-side RAG simulations, local vector indexes, and force-directed SVG nodes graphs in Next.js 16.",
      category: "Engineering Tech",
      readTime: "9 min read",
      date: "May 15, 2026",
      icon: BookOpen,
      color: "text-emerald-400 bg-emerald-500/10"
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
            <span>Scientific Recall Journal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white cinematic-title">
            Scientific Recall Journal
          </h1>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto font-light leading-relaxed">
            Explore neuroscientific publications, spacing calibrations, and vector indexing strategies.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.map((post) => {
            const Icon = post.icon;
            return (
              <article
                key={post.title}
                className="rounded-3xl border border-white/5 bg-[#0d0d11]/45 p-6 flex flex-col justify-between shadow-2xl transition-all duration-500 hover:border-primary/20 hover:scale-[1.02] group matte-layer spatial-shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="uppercase font-bold tracking-wider text-zinc-500">
                      {post.category}
                    </span>
                    <span className="text-zinc-500 font-light">{post.date}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug uppercase tracking-wide">
                    {post.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-5 border-t border-white/5 mt-6 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono font-light text-[10px]">{post.readTime}</span>
                  <a
                    href="#"
                    className="text-primary dark:text-purple-400 font-bold flex items-center gap-1.5 hover:underline"
                  >
                    <span>Inspect Abstract</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
