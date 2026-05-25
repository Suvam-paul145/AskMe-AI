"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Briefcase, MapPin, Clock, Search, Sparkles } from "lucide-react";
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
      title: "Full-Stack Next.js Developer",
      team: "Product & Layout",
      location: "Remote",
      type: "Full-Time",
      description: "Build premium glassmorphic UI workspaces, graphs, dashboards, and client state synchronizations in React 19."
    },
    {
      title: "Active Recall UX Researcher",
      team: "Cognitive Science",
      location: "Hybrid (New York, NY)",
      type: "Part-Time / Intern",
      description: "Design cognitive stress evaluations, spaced-repetition spacing rates, and test student retention architectures."
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
            <span>Join our Cognitive Team</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Build the Future of Active Learning
          </h1>
          <p className="text-lg text-muted-foreground">
            We are hiring engineers, cognitive scientists, and designers passionate about unlocking human mental bandwidth.
          </p>
        </div>

        {/* Core Perks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-3">
            <h3 className="text-base font-bold text-foreground">Cognitive Autonomy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We operate asynchronously with pure goal-based structures. Work where you think best, whenever your focus peak is.
            </p>
          </div>
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-3">
            <h3 className="text-base font-bold text-foreground">Premium Equipments</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get an Apple hardware bundle, premium software licensing (Copilot, Cursor, linear, etc.), and $1,500 annual cognitive research credits.
            </p>
          </div>
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-3">
            <h3 className="text-base font-bold text-foreground">Continuous Learning</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We cover textbook purchases, medical mental wellness apps, research papers access, and global cognitive conference tickets.
            </p>
          </div>
        </div>

        {/* Jobs List Grid */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
            <Briefcase className="h-4.5 w-4.5 text-primary" />
            Current Job Openings ({jobs.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div
                key={job.title}
                className="rounded-2xl border border-border bg-card/40 hover:bg-card/60 p-6 shadow-sm transition-all duration-200 glass-card glowing-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary dark:text-purple-400 bg-primary/10 px-2 py-0.5 rounded-full">
                    {job.team}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{job.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {job.type}
                    </span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/95 transition-all w-full md:w-auto text-center"
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
