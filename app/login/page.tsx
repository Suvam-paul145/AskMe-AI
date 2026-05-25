"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Brain, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-background neural-grid relative select-none">
      <Navbar />

      <main className="flex-1 mx-auto max-w-md w-full px-4 py-16 flex flex-col justify-center">
        
        {/* Logo brand */}
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Brain className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Sign In to AskMe CLOS</h2>
          <p className="text-xs text-muted-foreground">Synchronize your cognitive models across all devices.</p>
        </div>

        {/* Credentials Form Card */}
        <div className="bg-card/40 border border-border p-6 md:p-8 rounded-2xl glass-card relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@askme-ai.com"
                className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition-all"
              />
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Password</span>
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border"
            >
              <span>{loading ? "Authenticating model..." : "Launch Dashboard"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>

          {/* Switch options */}
          <div className="border-t border-border pt-4 mt-6 text-center text-xs text-zinc-500 space-y-2">
            <p>Don't have an account? <span className="text-primary hover:underline cursor-pointer">Register profile</span></p>
            <p className="hover:underline cursor-pointer">Forgot cognitive password keys?</p>
          </div>
        </div>

        {/* Security badge banner */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-zinc-600">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Local storage cookies data is encrypted locally.</span>
        </div>

      </main>

      <Footer />
    </div>
  );
}
