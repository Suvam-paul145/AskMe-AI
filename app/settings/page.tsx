"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Settings, ShieldAlert, Sparkles, User, RefreshCw, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, toggleTheme, updateProfile, profile } = useStore();
  const router = useRouter();

  // Settings states
  const [name, setName] = useState("Suvam Paul");
  const [pace, setPace] = useState("calibrated");
  const [resetting, setResetting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      archetype: pace === "intense" ? "The Cram Strategist" : "The Intuitive Analyst"
    });
    alert("Study preferences successfully saved!");
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to delete all cached vectors, documents, attempts, and streaks? This will reset the CLOS simulator state.")) {
      setResetting(true);
      setTimeout(() => {
        localStorage.clear();
        setResetting(false);
        alert("State database cleared! Redirecting to setup...");
        window.location.href = "/upload";
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative select-none">
      <Navbar />

      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            CLOS Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure profile parameters, pacing curves, and theme displays.</p>
        </div>

        {/* Profile and Preferences Card */}
        <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="user-name" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>Student Nickname</span>
              </label>
              <input
                type="text"
                id="user-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition-all"
              />
            </div>

            {/* Study Pace */}
            <div className="space-y-1.5">
              <label htmlFor="study-pace" className="text-xs font-semibold text-muted-foreground uppercase">Study Pacing Intensity</label>
              <select
                id="study-pace"
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition-all"
              >
                <option value="slow">Slow & Steady (30% recall delta)</option>
                <option value="calibrated">Calibrated Spaced Repetition (recommended)</option>
                <option value="intense">Intense Cram Mode (90% recall pressure)</option>
              </select>
              <span className="text-[10px] text-zinc-500 block leading-normal mt-1">
                Pacing adjustments calibrate memory decay triggers on your study scheduler autopilot.
              </span>
            </div>

            {/* Theme section */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase block">Appearance Theme</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-full rounded-xl border p-3 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="h-4.5 w-4.5 text-yellow-500" />
                  <span>Light mode</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-full rounded-xl border p-3 text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Dark mode</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border"
            >
              <Sparkles className="h-4 w-4" />
              Save Study Preferences
            </button>
          </form>
        </div>

        {/* Danger zone reset */}
        <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="h-5.5 w-5.5 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Danger Zone</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deletes your full active session cookies, streak counters, document vector weights, quiz records, and learning DNA. Re-initializes study loops from onboarding stages.
          </p>
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 py-3 text-xs font-bold text-red-500 transition-all"
          >
            {resetting ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            <span>Reset local database storage</span>
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
