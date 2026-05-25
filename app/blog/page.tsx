"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { BookOpen, Calendar, Clock, ArrowRight, Brain, Sparkles } from "lucide-react";
import Link from "next/link";

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
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary dark:text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AskMe Science Dispatch</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Active Recall & Spaced Repetition Science
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore neuroscientific papers, technical retrospectives, and cognitive study tricks verified by data.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.map((post) => {
            const Icon = post.icon;
            return (
              <article
                key={post.title}
                className="rounded-2xl border border-border bg-card/40 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 glass-card glowing-border group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {post.category}
                    </span>
                    <span className="text-xs text-zinc-500">{post.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-border/80 mt-6 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">{post.readTime}</span>
                  <a
                    href="#"
                    className="text-primary dark:text-purple-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Read Article
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
