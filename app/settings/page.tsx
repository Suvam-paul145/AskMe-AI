"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import AvatarDisplay, { AVATAR_PRESETS } from "@/components/avatar-display";
import { ShieldAlert, Sparkles, User, RefreshCw, Sun, Moon, Cpu, Sliders, Mail, Upload, Eye, EyeOff, Bell, Clock, Send, FileText, CheckCircle, XCircle, Loader2, X } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme, profile, updateProfile, signOut } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Settings states
  const [name, setName] = useState("Student");
  const [pace, setPace] = useState("calibrated");
  const [resetting, setResetting] = useState(false);
  const [personality, setPersonality] = useState("socratic"); // socratic | direct | holographic
  const [uploading, setUploading] = useState(false);

  // Email & Notification states
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState("daily");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<"idle" | "success" | "error">("idle");
  const [reminderMsg, setReminderMsg] = useState("");

  const [reportEmail, setReportEmail] = useState("");
  const [reportSending, setReportSending] = useState(false);
  const [reportStatus, setReportStatus] = useState<"idle" | "success" | "error">("idle");
  const [reportMsg, setReportMsg] = useState("");

  // Email preview modal states
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Custom credentials and sliders
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [temp, setTemp] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(16384);

  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        setGeminiKey(localStorage.getItem("settings_gemini_key") || "");
        setGroqKey(localStorage.getItem("settings_groq_key") || "");
        setOpenrouterKey(localStorage.getItem("settings_openrouter_key") || "");
        setOpenaiKey(localStorage.getItem("settings_openai_key") || "");
        setTemp(parseFloat(localStorage.getItem("settings_temperature") || "0.7"));
        setMaxTokens(parseInt(localStorage.getItem("settings_max_tokens") || "16384", 10));
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      const timer = setTimeout(() => {
        if (profile.full_name) {
          setName(profile.full_name);
        }
        if (profile.study_pace) {
          setPace(profile.study_pace);
        }
        if (profile.ai_personality) {
          setPersonality(profile.ai_personality);
        }
        if (profile.email) {
          setReminderEmail(profile.email);
          setReportEmail(profile.email);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: name,
      study_pace: pace,
      ai_personality: personality,
      archetype: pace === "intense" ? "The Cram Strategist" : "The Intuitive Analyst"
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("settings_gemini_key", geminiKey);
      localStorage.setItem("settings_groq_key", groqKey);
      localStorage.setItem("settings_openrouter_key", openrouterKey);
      localStorage.setItem("settings_openai_key", openaiKey);
      localStorage.setItem("settings_temperature", temp.toString());
      localStorage.setItem("settings_max_tokens", maxTokens.toString());
    }

    alert("Study preferences successfully saved!");
  };

  const handleSelectPreset = (key: string) => {
    updateProfile({ avatar_url: `preset:${key}` });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      if (data.avatar_url) {
        updateProfile({ avatar_url: data.avatar_url });
        alert("Profile picture uploaded successfully!");
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "An error occurred during file upload.";
      alert(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to sign out? Your session will be cleared.")) {
      setResetting(true);
      setTimeout(async () => {
        await signOut();
        setResetting(false);
        window.location.href = "/login";
      }, 1000);
    }
  };

  // Send study reminder handler
  const handleSendReminder = async () => {
    if (!reminderEmail) {
      setReminderStatus("error");
      setReminderMsg("Please enter your email address.");
      return;
    }
    setReminderSending(true);
    setReminderStatus("idle");
    setReminderMsg("");
    try {
      const timeFormatted = new Date(`2000-01-01T${reminderTime}`).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const res = await fetch("/api/reminder/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: reminderEmail,
          frequency: reminderFrequency,
          time: timeFormatted,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReminderStatus("success");
        setReminderMsg(`Reminder scheduled for ${reminderEmail} (${reminderFrequency} at ${timeFormatted})`);
        // Save schedule to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("reminder_schedule", JSON.stringify({
            email: reminderEmail,
            frequency: reminderFrequency,
            time: reminderTime,
            active: true,
          }));
        }
        // Show preview
        if (data.html) {
          setPreviewHtml(data.html);
          setPreviewSubject(data.subject || "Study Reminder");
          setShowPreview(true);
        }
      } else {
        setReminderStatus("error");
        setReminderMsg(data.error || "Failed to schedule reminder.");
      }
    } catch (err) {
      setReminderStatus("error");
      setReminderMsg("Network error. Please try again.");
    } finally {
      setReminderSending(false);
    }
  };

  // Send weekly report handler
  const handleSendReport = async () => {
    if (!reportEmail) {
      setReportStatus("error");
      setReportMsg("Please enter your email address.");
      return;
    }
    setReportSending(true);
    setReportStatus("idle");
    setReportMsg("");
    try {
      const res = await fetch("/api/report/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: reportEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReportStatus("success");
        setReportMsg(`Weekly report compiled and sent to ${reportEmail}`);
        // Show preview
        if (data.html) {
          setPreviewHtml(data.html);
          setPreviewSubject(data.subject || "Weekly Progress Report");
          setShowPreview(true);
        }
      } else {
        setReportStatus("error");
        setReportMsg(data.error || "Failed to generate report.");
      }
    } catch (err) {
      setReportStatus("error");
      setReportMsg("Network error. Please try again.");
    } finally {
      setReportSending(false);
    }
  };

  // Load saved reminder schedule from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const saved = localStorage.getItem("reminder_schedule");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.email) setReminderEmail(parsed.email);
            if (parsed.frequency) setReminderFrequency(parsed.frequency);
            if (parsed.time) setReminderTime(parsed.time);
          } catch { /* ignore */ }
        }
      }, 0);
    }
  }, []);

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

          <div className="space-y-6">
            {/* Account Credentials displaying user email */}
            <div className="space-y-2 border-b border-white/5 pb-6">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>Account Credentials</span>
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-white/5 bg-[#09090b]/40 px-4 py-3 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-300 block leading-none font-light">Signed in as</span>
                  <span className="text-xs font-semibold text-zinc-200">{mounted ? (profile.email || "Loading...") : "Loading..."}</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 text-[10px] font-bold text-red-400 transition-all shrink-0 self-start sm:self-center"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Avatar customization */}
            <div className="space-y-3 border-b border-white/5 pb-6">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Profile Avatar & Customization</span>
              </span>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <AvatarDisplay 
                    avatarUrl={profile.avatar_url} 
                    name={name} 
                    className="h-16 w-16 text-xl border border-white/10" 
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/75 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-400 block mb-2">Select a premium theme:</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(AVATAR_PRESETS).map(([key, preset]) => {
                        const isSelected = profile.avatar_url === `preset:${key}` || (!profile.avatar_url && key === "purple");
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleSelectPreset(key)}
                            title={preset.name}
                            className={`h-8 w-8 rounded-full bg-gradient-to-tr ${preset.gradient} border ${preset.border} flex items-center justify-center transition-all ${
                              isSelected 
                                ? "ring-2 ring-primary ring-offset-2 ring-offset-[#0d0d11] scale-110 shadow-lg" 
                                : "opacity-50 hover:opacity-100 hover:scale-105"
                            }`}
                          >
                            <span className="text-[9px] font-bold text-white uppercase">
                              {name.trim().charAt(0).toUpperCase() || "S"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-[#09090b]/60 hover:bg-[#09090b]/90 px-3.5 py-2 text-xs text-zinc-300 transition-all font-light">
                      <Upload className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Upload Custom Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                    {uploading && <span className="text-[9px] text-zinc-400 dark:text-zinc-300 animate-pulse">Uploading file...</span>}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Nickname */}
              <div className="space-y-2">
                <label htmlFor="user-name" className="text-[9px] font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
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
                  className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-400 font-light"
                />
              </div>

              {/* Personality Adaptation */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
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
                          : "border-white/5 bg-[#09090b]/40 text-zinc-400 dark:text-zinc-300 hover:text-zinc-200"
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
                <label htmlFor="study-pace" className="text-[9px] font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider">Study Pacing Intensity</label>
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
                <span className="text-[9px] text-zinc-400 dark:text-zinc-300 block leading-normal mt-1.5 font-light">
                  Pacing adjustments calibrate memory decay triggers on your study scheduler autopilot.
                </span>
              </div>

              {/* Theme section */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider block">Appearance Theme</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`w-full rounded-xl border p-3 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                      mounted && theme === "light"
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                        : "border-white/5 bg-[#09090b]/60 text-zinc-400 dark:text-zinc-300 hover:text-zinc-200"
                    }`}
                  >
                    <Sun className="h-4.5 w-4.5 text-yellow-500" />
                    <span>Light mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`w-full rounded-xl border p-3 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                      !mounted || theme === "dark"
                        ? "border-primary bg-primary/10 text-white shadow-[0_0_10px_rgba(139,92,246,0.1)] animate-pulse"
                        : "border-white/5 bg-[#09090b]/60 text-zinc-400 dark:text-zinc-300 hover:text-zinc-200"
                    }`}
                  >
                    <Moon className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Dark mode</span>
                  </button>
                </div>
              </div>

              {/* Custom API Credentials & LLM Settings */}
              <div className="border-t border-white/5 pt-6 space-y-6">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider block">API Credentials & Parameter Calibration</span>

                {/* Gemini Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Gemini API Key Override</label>
                    <button
                      type="button"
                      onClick={() => setShowGemini(!showGemini)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      {showGemini ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <input
                    type={showGemini ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter custom Gemini Key..."
                    className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3 text-xs text-white focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                {/* Groq Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Groq API Key Override</label>
                    <button
                      type="button"
                      onClick={() => setShowGroq(!showGroq)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      {showGroq ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <input
                    type={showGroq ? "text" : "password"}
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="Enter custom Groq Key..."
                    className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3 text-xs text-white focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                {/* OpenRouter Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">OpenRouter API Key Override</label>
                    <button
                      type="button"
                      onClick={() => setShowOpenRouter(!showOpenRouter)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      {showOpenRouter ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <input
                    type={showOpenRouter ? "text" : "password"}
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    placeholder="Enter custom OpenRouter Key..."
                    className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3 text-xs text-white focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                {/* OpenAI Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">OpenAI API Key Override</label>
                    <button
                      type="button"
                      onClick={() => setShowOpenAI(!showOpenAI)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      {showOpenAI ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <input
                    type={showOpenAI ? "text" : "password"}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="Enter custom OpenAI Key..."
                    className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3 text-xs text-white focus:border-primary focus:outline-none font-mono"
                  />
                </div>

                {/* Temperature slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="text-zinc-400 uppercase text-[10px]">Temperature Calibration (τ)</label>
                    <span className="font-mono text-primary font-bold">{temp.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.05"
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value))}
                    className="w-full accent-primary bg-zinc-800"
                  />
                  {temp >= 1.5 && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[10px] text-amber-500 leading-normal animate-pulse">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>At temperatures of 1.5 or above, socratic answers can become highly creative, unpredictable, or erratic. Perfect for brainstorming, but less reliable for technical definitions.</span>
                    </div>
                  )}
                </div>

                {/* Max Tokens slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="text-zinc-400 uppercase text-[10px]">Max Response Tokens (t)</label>
                    <span className="font-mono text-primary font-bold">{maxTokens} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="30000"
                    step="128"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                    className="w-full accent-primary bg-zinc-800"
                  />
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
        </div>

        {/* Email & Notifications Section */}
        <div className="border border-white/5 bg-[#0d0d11]/80 p-6 rounded-3xl glass-card relative overflow-hidden matte-layer spatial-shadow-lg space-y-6">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
              <Bell className="h-3.5 w-3.5 text-emerald-400" />
              <span>Email & Notification Center</span>
            </span>
            <p className="text-[10px] text-zinc-500 font-light leading-relaxed">
              Schedule study reminders and generate weekly progress reports delivered to your inbox.
            </p>
          </div>

          {/* Study Reminders */}
          <div className="space-y-4 border-b border-white/5 pb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Scheduled Study Reminders</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-light leading-relaxed">
              Get personalized active-recall prompts based on your weakest topics. Reminders target concepts with the highest memory decay risk.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Frequency selector */}
              <div className="space-y-1.5">
                <label htmlFor="reminder-frequency" className="text-[9px] text-zinc-400 font-semibold uppercase block">Frequency</label>
                <select
                  id="reminder-frequency"
                  value={reminderFrequency}
                  onChange={(e) => setReminderFrequency(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-[#09090b]/80 px-3 py-2.5 text-xs text-zinc-300 focus:border-primary focus:outline-none transition-all"
                >
                  <option value="daily">Daily</option>
                  <option value="every_2_days">Every 2 Days</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                </select>
              </div>

              {/* Time picker */}
              <div className="space-y-1.5">
                <label htmlFor="reminder-time" className="text-[9px] text-zinc-400 font-semibold uppercase block">Preferred Time</label>
                <input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-[#09090b]/80 px-3 py-2.5 text-xs text-zinc-300 focus:border-primary focus:outline-none transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-1.5">
              <label htmlFor="reminder-email" className="text-[9px] text-zinc-400 font-semibold uppercase block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  id="reminder-email"
                  type="email"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 pl-9 pr-4 py-3 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-500 font-light"
                />
              </div>
            </div>

            {/* Status messages */}
            {reminderStatus === "success" && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-[10px] text-emerald-400 leading-normal">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{reminderMsg}</span>
              </div>
            )}
            {reminderStatus === "error" && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-[10px] text-red-400 leading-normal">
                <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{reminderMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendReminder}
              disabled={reminderSending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-bold text-white shadow-md hover:from-amber-500/90 hover:to-orange-500/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reminderSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              <span>{reminderSending ? "Scheduling..." : "Schedule Study Reminders"}</span>
            </button>
          </div>

          {/* Weekly Progress Report */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Weekly Progress Report</span>
            </div>
            <p className="text-[10px] text-zinc-500 font-light leading-relaxed">
              Generate a beautifully formatted cognitive progress report with XP, streaks, mastery levels, and personalized recommendations — and send it to your email.
            </p>

            {/* Email input */}
            <div className="space-y-1.5">
              <label htmlFor="report-email" className="text-[9px] text-zinc-400 font-semibold uppercase block">Send Report To</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  id="report-email"
                  type="email"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 pl-9 pr-4 py-3 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-500 font-light"
                />
              </div>
            </div>

            {/* Status messages */}
            {reportStatus === "success" && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-[10px] text-emerald-400 leading-normal">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{reportMsg}</span>
              </div>
            )}
            {reportStatus === "error" && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-[10px] text-red-400 leading-normal">
                <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{reportMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendReport}
              disabled={reportSending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 py-3 text-xs font-bold text-white shadow-md hover:from-blue-500/90 hover:to-indigo-500/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{reportSending ? "Generating Report..." : "Generate & Send Weekly Report"}</span>
            </button>
          </div>
        </div>

        {/* Danger zone reset */}
        <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-3xl space-y-4 matte-layer">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="h-5.5 w-5.5 animate-pulse biometric-glow" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone Controls</h3>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-300 leading-relaxed font-light">
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

      {/* Email Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b0b0e] border border-white/10 rounded-2xl max-w-[650px] w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Email Preview</span>
                <span className="text-xs font-semibold text-zinc-200 block truncate max-w-[450px]">{previewSubject}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 p-1.5 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Modal body — rendered HTML */}
            <div className="flex-1 overflow-y-auto p-1">
              <iframe
                srcDoc={previewHtml}
                title="Email Preview"
                className="w-full h-full min-h-[500px] border-0 rounded-xl"
                sandbox="allow-same-origin"
              />
            </div>
            {/* Modal footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
              <span className="text-[9px] text-zinc-500 font-light">This is a preview of the email that would be sent.</span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 px-4 py-2 text-xs font-semibold text-primary transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

