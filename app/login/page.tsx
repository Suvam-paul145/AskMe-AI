"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Brain, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        if (!fullName) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, fullName);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        // After signup, try to sign in
        const signInResult = await signIn(email, password);
        if (signInResult.error) {
          setError("Account created! Please check your email to verify, then log in.");
          setLoading(false);
          return;
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
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
            {isRegister ? "Create Cognitive\nProfile" : "Authenticate\nCognitive Signature"}
          </h2>
          <p className="text-xs text-zinc-500 font-light">
            {isRegister
              ? "Initialize your learning DNA and cognitive model."
              : "Synchronize your cognitive models across all devices."}
          </p>
        </div>

        {/* Credentials Form Card */}
        <div className="bg-[#0b0b0e]/95 border border-white/5 p-6 md:p-8 rounded-3xl glass-card relative overflow-hidden shadow-2xl matte-layer spatial-shadow-lg">
          <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-20" />
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name input (register only) */}
            {isRegister && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-700 font-light"
                />
              </div>
            )}

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-750 font-light"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-[10px] font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border duration-300 disabled:opacity-50"
            >
              <span>
                {loading
                  ? "Authenticating model..."
                  : isRegister
                    ? "Initialize Profile"
                    : "Launch Dashboard"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>

          {/* Switch options */}
          <div className="border-t border-white/5 pt-4 mt-6 text-center text-xs text-zinc-500 space-y-2 font-light">
            <p>
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <span
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-primary hover:underline cursor-pointer font-medium"
              >
                {isRegister ? "Sign In" : "Register Profile"}
              </span>
            </p>
          </div>
        </div>

        {/* Security badge banner */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-zinc-500 font-light">
          <ShieldCheck className="h-4 w-4 text-emerald-400 biometric-glow" />
          <span>Secured with Supabase Auth — data encrypted end-to-end.</span>
        </div>

      </main>

      <Footer />
    </div>
  );
}
