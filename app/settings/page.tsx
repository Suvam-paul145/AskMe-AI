"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Settings, ShieldAlert, Sparkles, User, RefreshCw, Sun, Moon, Cpu, Sliders } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme, updateProfile, profile } = useStore();

  // Settings states
  const [name, setName] = useState("Suvam Paul");
  const [pace, setPace] = useState("calibrated");
  const [resetting, setResetting] = useState(false);
  const [personality, setPersonality] = useState("socratic"); // socratic | direct | holographic

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
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric ambient background glows */}
      <div className="absolute top-1/4 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2">
            <Sliders className="h-3.5 w-3.5 animate-pulse" />
            <span>Control Room Enabled</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white cinematic-title">
            AI Personality & Control Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-light">Configure profile parameters, AI personality bounds, and spacing pacing rates.</p>
        </div>

        {/* Profile and Preferences Card */}
        <div className="border border-white/5 bg-[#0d0d11]/80 p-6 rounded-3xl glass-card relative overflow-hidden matte-layer spatial-shadow-lg">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          <form onSubmit={handleSave} className="space-y-6">
            {/* Nickname */}
            <div className="space-y-2">
              <label htmlFor="user-name" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Student Nickname</span>
              </label>
              <input
                type="text"
                id="user-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-700 font-light"
              />
            </div>

            {/* Personality Adaptation */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span>AI Tutor Personality Mode</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "socratic", name: "Socratic Guide", desc: "Asks doubts instead of listing direct answers." },
                  { id: "direct", name: "Direct Analyst", desc: "Gives mathematical precision results instantly." },
                  { id: "holographic", name: "Autopilot", desc: "Balances recall gaps automatically." }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPersonality(mode.id)}
                    className={`rounded-xl border p-3 text-left transition-all duration-300 ${
                      personality === mode.id
                        ? "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                        : "border-white/5 bg-[#09090b]/40 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <span className="text-[10px] font-bold block">{mode.name}</span>
                    <span className="text-[8px] opacity-80 mt-1 block leading-normal font-light">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Study Pace */}
            <div className="space-y-2">
              <label htmlFor="study-pace" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Study Pacing Intensity</label>
              <select
                id="study-pace"
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-[#09090b]/80 px-4 py-3.5 text-xs text-zinc-300 focus:border-primary focus:outline-none transition-all"
              >
                <option value="slow">Slow & Steady (30% recall delta)</option>
                <option value="calibrated">Calibrated Spaced Repetition (recommended)</option>
                <option value="intense">Intense Cram Mode (90% recall pressure)</option>
              </select>
              <span className="text-[9px] text-zinc-500 block leading-normal mt-1.5 font-light">
                Pacing adjustments calibrate memory decay triggers on your study scheduler autopilot.
              </span>
            </div>

            {/* Theme section */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Appearance Theme</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-full rounded-xl border p-3 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                      : "border-white/5 bg-[#09090b]/60 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Sun className="h-4.5 w-4.5 text-yellow-500" />
                  <span>Light mode</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-full rounded-xl border p-3 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-white shadow-[0_0_10px_rgba(139,92,246,0.1)] animate-pulse"
                      : "border-white/5 bg-[#09090b]/60 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Moon className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Dark mode</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border duration-300"
            >
              <Sparkles className="h-4 w-4" />
              Save Study Preferences
            </button>
          </form>
        </div>

        {/* Danger zone reset */}
        <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-3xl space-y-4 matte-layer">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="h-5.5 w-5.5 animate-pulse biometric-glow" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone Controls</h3>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-light">
            Deletes your full active session cookies, streak counters, document vector weights, quiz records, and learning DNA. Re-initializes study loops from onboarding stages.
          </p>
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 py-3 text-xs font-bold text-red-400 transition-all duration-300"
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
