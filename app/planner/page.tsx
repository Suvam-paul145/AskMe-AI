"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Calendar, Plus, Clock, Target, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function PlannerPage() {
  const { planner, togglePlannerItem, addPlannerItem } = useStore();
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("20");
  const [newUrgency, setNewUrgency] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addPlannerItem({
      date: new Date().toISOString().split("T")[0],
      title: newTitle,
      duration: parseInt(newDuration, 10),
      isUrgent: newUrgency
    });

    setNewTitle("");
    setNewDuration("20");
    setNewUrgency(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative select-none">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Autopilot Study Planner</h1>
            <p className="text-sm text-muted-foreground mt-1">Spaced-repetition scheduling logs optimized by conceptual recall strengths.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Task checklist lists (col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              Schedules for today & upcoming
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {planner.map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePlannerItem(item.id)}
                  className={`border rounded-2xl p-4.5 flex items-center justify-between transition-all cursor-pointer select-none ${
                    item.completed 
                      ? "border-border/60 bg-muted/30 opacity-70" 
                      : item.isUrgent 
                        ? "border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500" 
                        : "border-border bg-card/40 hover:bg-card/60 text-foreground"
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <h3 className={`text-sm font-bold ${item.completed ? "line-through text-zinc-500" : ""}`}>
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.duration} minutes
                      </span>
                      <span>•</span>
                      <span>Scheduled: {item.date}</span>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {item.completed ? (
                      <CheckCircle2 className="h-5.5 w-5.5 text-emerald-500" />
                    ) : item.isUrgent ? (
                      <AlertTriangle className="h-5.5 w-5.5 text-rose-500 animate-pulse" />
                    ) : (
                      <div className="h-5.5 w-5.5 rounded-full border border-zinc-400 dark:border-zinc-700" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Add new items form (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Queue recall study</h2>
            
            <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="task-title" className="text-xs font-semibold text-muted-foreground uppercase">Task Description</label>
                  <input
                    type="text"
                    id="task-title"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. DNA Transcription flashcards"
                    className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="task-duration" className="text-xs font-semibold text-muted-foreground uppercase">Minutes</label>
                    <select
                      id="task-duration"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="10">10 Min</option>
                      <option value="15">15 Min</option>
                      <option value="20">20 Min</option>
                      <option value="30">30 Min</option>
                      <option value="45">45 Min</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border border-border bg-zinc-950/20 px-3.5 py-2.5 rounded-xl mt-[22px]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Urgent</span>
                    <input
                      type="checkbox"
                      id="task-urgency"
                      checked={newUrgency}
                      onChange={(e) => setNewUrgency(e.target.checked)}
                      className="h-4.5 w-4.5 text-primary accent-primary rounded cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Queue Spaced Review (+15 XP)</span>
                </button>
              </form>
            </div>

            {/* Daily stats banner */}
            <div className="bg-card/60 border border-border p-4.5 rounded-2xl flex items-center gap-3.5 text-xs text-muted-foreground">
              <Target className="h-5 w-5 text-primary shrink-0" />
              <span>Completing planner reviews awards 15 XP cognitive reward points directly to your profile.</span>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
