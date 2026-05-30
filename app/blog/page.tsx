"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { BookOpen, Clock, ArrowRight, Brain, Sparkles, Send } from "lucide-react";

export default function BlogPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const posts = [
    {
      id: "reread-illusion",
      title: "Why Re-reading Your Notes is a Cognitive Illusion",
      excerpt: "Multiple studies confirm that reviewing text creates familiarity rather than actual recall paths. Discover the active retrieval methodology behind RAG systems.",
      category: "Learning Science",
      readTime: "5 min read",
      date: "May 24, 2026",
      icon: Brain,
      color: "text-purple-400 bg-purple-500/10",
      abstract: "Multiple peer-reviewed studies (Roediger & Karpicke, 2006; Karpicke & Roediger, 2008) confirm that passive re-reading creates familiarity — not actual recall pathways. AskMe AI's RAG pipeline forces active extraction: the AI generates questions from your exact text, making your brain retrieve information under low-pressure conditions, building genuine memory traces."
    },
    {
      id: "spaced-repetition",
      title: "The Math Behind Spaced-Repetition Schedules",
      excerpt: "Ingest notes at optimal mathematical points. Learn how we utilize customizable exponential decay models to forecast memory failure scores.",
      category: "Mathematical Models",
      readTime: "7 min read",
      date: "May 20, 2026",
      icon: Clock,
      color: "text-blue-400 bg-blue-500/10",
      abstract: "The forgetting curve formula R = e^(-t/S) models memory retention as an exponential decay. AskMe AI personalizes the stability constant S per student per concept — meaning review intervals are calibrated to your specific retention speed, not a generic average. This reduces total review time while maintaining 85%+ retention at exam day."
    },
    {
      id: "cognitive-os",
      title: "Building the Next-Gen Cognitive OS: A Technical Retrospective",
      excerpt: "Behind the scenes: orchestrating client-side RAG simulations, local vector indexes, and force-directed SVG nodes graphs in Next.js 16.",
      category: "Engineering Tech",
      readTime: "9 min read",
      date: "May 15, 2026",
      icon: BookOpen,
      color: "text-emerald-400 bg-emerald-500/10",
      abstract: "Building AskMe AI required solving three hard engineering problems simultaneously: (1) RAG grounding to prevent LLM hallucination, (2) force-directed graph rendering for the 3D memory map in Next.js without a canvas library, and (3) real-time streaming of AI responses with citation injection using Vercel AI SDK."
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

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
            const isExpanded = expanded === post.id;
            return (
              <article
                key={post.title}
                className="rounded-3xl border border-white/5 bg-[#0d0d11]/45 p-6 flex flex-col justify-between shadow-2xl transition-all duration-550 hover:border-primary/20 hover:scale-[1.02] group matte-layer spatial-shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
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
                  
                  {isExpanded && (
                    <div className="mt-4 text-xs text-zinc-300 border-t border-white/5 pt-4 leading-relaxed font-light animate-drift">
                      <p className="font-mono text-[9px] uppercase font-bold text-primary dark:text-purple-400 mb-1.5 tracking-wider">Research Abstract Preview</p>
                      {post.abstract}
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-white/5 mt-6 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono font-light text-[10px]">{post.readTime}</span>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : post.id)}
                    className="text-primary dark:text-purple-400 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? "Collapse ↑" : "Inspect Abstract"}</span>
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? "rotate-90 text-primary" : ""}`} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Newsletter Section */}
        <section className="mt-20 p-8 bg-gradient-to-br from-violet-900/10 to-blue-900/5 border border-violet-500/15 rounded-3xl text-center max-w-xl mx-auto shadow-2xl relative overflow-hidden matte-layer">
          <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-20" />
          <p className="text-[10px] text-primary dark:text-purple-400 font-bold tracking-widest uppercase mb-2">Cognitive Dispatch</p>
          <h3 className="text-xl font-bold mb-2 uppercase text-white">Get New Research Every Week</h3>
          <p className="text-zinc-450 text-xs mb-6 font-light max-w-sm mx-auto">Spaced repetition science, RAG engineering, and study psychology. No noise.</p>
          
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="flex items-center justify-center rounded-xl bg-primary px-4 text-white hover:bg-primary/95 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-green-500 animate-pulse mt-3 font-medium">
              Successfully subscribed! Ingesting cognitive updates.
            </p>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
