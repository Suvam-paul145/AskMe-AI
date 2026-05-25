"use client";

import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { 
  Flame, 
  Zap, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  AlertTriangle,
  Sparkles,
  Upload
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { streak, xp, dailyGoalProgress, weakTopics, attempts, documents } = useStore();

  // Mock Recharts chart progress data
  const chartData = [
    { name: "Mon", points: 120 },
    { name: "Tue", points: 280 },
    { name: "Wed", points: 190 },
    { name: "Thu", points: 410 },
    { name: "Fri", points: 300 },
    { name: "Sat", points: 450 },
    { name: "Sun", points: xp },
  ];

  const recommendations = [
    { text: "Revise Coulomb's Law (Mastery decay alert)", url: "/workspace?docId=doc-1" },
    { text: "Take genetics MCQ assessment", url: "/workspace?docId=doc-2" },
    { text: "Complete spaced repetition deck for Translation", url: "/workspace?docId=doc-2" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative select-none">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Student Cognitive Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time learning stats, active recommendations, and calibrations.</p>
          </div>

          <Link
            href="/upload"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/95 glowing-border"
          >
            <Upload className="h-4.5 w-4.5" />
            Ingest New Syllabus
          </Link>
        </div>

        {/* Stats Summary Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak widget */}
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] radial-glow opacity-25 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Study Streak</span>
              <Flame className="h-5 w-5 text-orange-500 animate-pulse fill-current" />
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-foreground">{streak} days</span>
              <p className="text-[10px] text-green-500 font-semibold mt-1">Streaks active. Keep up active retrieval!</p>
            </div>
          </div>

          {/* XP Widget */}
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] radial-glow opacity-25 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Cognitive XP</span>
              <Zap className="h-5 w-5 text-primary fill-current" />
            </div>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-foreground">{xp} XP</span>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Next level calibration unlocks at {xp + 160} XP</p>
            </div>
          </div>

          {/* Daily Goal progress widget */}
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] radial-glow opacity-25 pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Daily Cognitive Goal</span>
              <Target className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-4 space-y-2">
              <span className="text-4xl font-extrabold text-foreground">{dailyGoalProgress}%</span>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${dailyGoalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Area Chart block (col-span-8) */}
          <div className="lg:col-span-8 border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
                Cognitive Points Calibration (Weekly)
              </h3>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Real-Time Refresh</span>
            </div>

            {/* Recharts chart */}
            <div className="h-[260px] w-full text-xs font-semibold">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: "10px", color: "#fff" }} />
                  <Area type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorPoints)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations block (col-span-4) */}
          <div className="lg:col-span-4 border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                Autopilot Autopilot Feeds
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {recommendations.map((rec, idx) => (
                <Link
                  key={idx}
                  href={rec.url}
                  className="rounded-xl border border-border bg-card/50 hover:bg-muted p-4 text-xs font-semibold text-foreground flex items-center justify-between group transition-all"
                >
                  <span className="max-w-[200px] leading-snug">{rec.text}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Weak Topics and Recent attempts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weak Topics */}
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-bounce" />
                Active Weak Topics Registry
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {weakTopics.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No weak topics logged! Excellent calibration.</p>
              ) : (
                weakTopics.map((topic) => (
                  <div key={topic} className="flex items-center justify-between bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5 text-xs text-rose-500">
                    <span className="font-bold">{topic}</span>
                    <span className="text-[10px] bg-rose-500/10 px-2.5 py-0.5 rounded-full font-bold">Needs Revision</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Quiz attempts */}
          <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Activity className="h-4.5 w-4.5 text-primary" />
                Recent Calibrations
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {attempts.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No assessments taken yet.</p>
              ) : (
                attempts.slice(0, 3).map((att) => (
                  <div key={att.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-3.5 text-xs font-semibold text-foreground">
                    <div>
                      <h4 className="truncate max-w-[180px] font-bold">{att.documentTitle}</h4>
                      <span className="text-[10px] text-zinc-500 mt-1 block">{att.date}</span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                      att.score >= 80 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                      {att.score}% Score
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
