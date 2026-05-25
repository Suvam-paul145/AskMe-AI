"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Brain, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setTimeout(() => {
      // Simulate authenticating and save auth token mock
      localStorage.setItem("askme-auth", "true");
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-md w-full px-4 py-16 flex flex-col justify-center relative z-10">
        
        {/* Logo brand */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Secure Port Gateway</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white cinematic-title leading-snug">
            Authenticate <br />
            Cognitive Signature
          </h2>
          <p className="text-xs text-zinc-500 font-light">Synchronize your cognitive models across all devices.</p>
        </div>

        {/* Credentials Form Card */}
        <div className="bg-[#0b0b0e]/95 border border-white/5 p-6 md:p-8 rounded-3xl glass-card relative overflow-hidden shadow-2xl matte-layer spatial-shadow-lg">
          <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-20" />
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@askme-ai.com"
                className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-700 font-light"
              />
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>Password Key</span>
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-750 font-light"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border duration-300"
            >
              <span>{loading ? "Authenticating model..." : "Launch Dashboard"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>

          {/* Switch options */}
          <div className="border-t border-white/5 pt-4 mt-6 text-center text-xs text-zinc-500 space-y-2 font-light">
            <p>Don't have an account? <span className="text-primary hover:underline cursor-pointer font-medium">Register Profile</span></p>
            <p className="hover:underline cursor-pointer">Forgot cognitive signature key?</p>
          </div>
        </div>

        {/* Security badge banner */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-zinc-500 font-light">
          <ShieldCheck className="h-4 w-4 text-emerald-400 biometric-glow" />
          <span>Local storage cookies data is encrypted locally.</span>
        </div>

      </main>

      <Footer />
    </div>
  );
}
