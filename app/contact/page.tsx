"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Send, CheckCircle, HelpCircle, Mail, MessageSquare, Sparkles, RefreshCw } from "lucide-react";

function ContactFormContent() {
  const searchParams = useSearchParams();
  const reasonParam = searchParams.get("reason");
  const roleParam = searchParams.get("role");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "general",
    message: ""
  });
  
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (reasonParam === "job") {
      setFormData(prev => ({
        ...prev,
        topic: "job",
        message: roleParam ? `Applying for the role of: ${roleParam}.\n\n` : ""
      }));
    }
  }, [reasonParam, roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSending(true);
      try {
        const topicLabel = 
          formData.topic === "job" ? "Careers application" : 
          formData.topic === "support" ? "Technical Support" : 
          formData.topic === "sales" ? "Pro / Institutional Licensing" : 
          "General Inquiry";

        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            reason: topicLabel,
            message: formData.message
          })
        });

        if (res.ok) {
          setSubmitted(true);
          setFormData({ name: "", email: "", topic: "general", message: "" });
          setTimeout(() => setSubmitted(false), 6000);
        }
      } catch (err) {
        console.error("Submission failed:", err);
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Your Name</label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
            className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-700 font-light"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="student@askme-ai.com"
            className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-700 font-light"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="topic" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Reason for Sync</label>
        <select
          id="topic"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          className="w-full rounded-xl border border-white/5 bg-[#09090b]/80 px-4 py-3 text-xs text-zinc-355 focus:border-primary focus:outline-none transition-all"
        >
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="sales">Pro / Institutional Licensing</option>
          <option value="job">Careers application</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Your Transmission</label>
        <textarea
          id="message"
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Explain your request..."
          className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all resize-none placeholder-zinc-750 font-light leading-relaxed"
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 disabled:opacity-50 transition-all glowing-border duration-300 cursor-pointer"
      >
        {sending ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span>{sending ? "Sending..." : "Submit Transmission"}</span>
      </button>

      {submitted && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl p-4 flex items-center gap-2.5 animate-pulse text-xs font-semibold biometric-glow mt-4">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>Success! Transmission secure. Spacing loop dispatch scheduled shortly.</span>
        </div>
      )}
    </form>
  );
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start max-w-5xl mx-auto">
          
          {/* Left info content */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2 animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Transmitter Channel Open</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white cinematic-title leading-tight">
              Sync with <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Cognitive Control.
              </span>
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Have questions about the vector embeddings logic? Want to report a spaced-repetition spacing bug? Sync with the transmitter directly.
            </p>

            <div className="space-y-4 pt-6 border-t border-white/5 font-light">
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <Mail className="h-4.5 w-4.5 text-primary shrink-0" />
                <a href="mailto:suvampaul982@gmail.com" className="hover:text-primary transition-colors text-zinc-300">
                  suvampaul982@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>Documentation center active 24/7</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <MessageSquare className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>Response speed: &lt; 2 hours</span>
              </div>
            </div>
          </div>

          {/* Right form card */}
          <div className="lg:col-span-7 bg-[#0b0b0e]/95 border border-white/5 p-6 md:p-8 rounded-3xl glass-card relative overflow-hidden matte-layer spatial-shadow-lg">
            <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-20" />
            <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />

            <Suspense fallback={
              <div className="text-center py-20">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-xs text-zinc-450 mt-2 font-light">Loading channel...</p>
              </div>
            }>
              <ContactFormContent />
            </Suspense>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
