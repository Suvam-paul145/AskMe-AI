"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationMsg, setShowVerificationMsg] = useState(false);

  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const contextMessage = searchParams.get("message");

  // Google OAuth handler
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  };

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
        // Show email verification message
        setShowVerificationMsg(true);
        setLoading(false);
        return;
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      }
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  };

  // If verification message is shown, try signing in after a delay
  useEffect(() => {
    if (showVerificationMsg) {
      const timer = setTimeout(() => setShowVerificationMsg(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showVerificationMsg]);

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
            <span>Welcome</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white cinematic-title leading-snug">
            {isRegister ? "Create Your\nAccount" : "Welcome\nBack"}
          </h2>
          <p className="text-xs text-zinc-500 font-light">
            {isRegister
              ? "Sign up to start your personalized learning journey."
              : "Sign in to continue your study sessions."}
          </p>
        </div>

        {/* Context message from redirect */}
        {contextMessage && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-3 text-[11px] font-semibold mb-4 text-center">
            {contextMessage}
          </div>
        )}

        {/* Email Verification Banner */}
        {showVerificationMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 mb-4 text-center space-y-3">
            <div>
              <p className="text-sm font-semibold">📧 Check your inbox!</p>
              <p className="text-[11px] font-light">
                We sent a verification link to <strong>{email}</strong>. Click it to activate your account, then sign in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const domain = email.split("@")[1]?.toLowerCase();
                if (domain === "gmail.com") {
                  window.open("https://mail.google.com", "_blank");
                } else if (domain === "outlook.com" || domain === "hotmail.com" || domain === "live.com") {
                  window.open("https://outlook.live.com", "_blank");
                } else if (domain === "yahoo.com") {
                  window.open("https://mail.yahoo.com", "_blank");
                } else {
                  window.open("mailto:", "_self");
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 text-xs font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              Open Email App
            </button>
          </div>
        )}

        {/* Credentials Form Card */}
        <div className="bg-[#0b0b0e]/95 border border-white/5 p-6 md:p-8 rounded-3xl glass-card relative overflow-hidden shadow-2xl matte-layer spatial-shadow-lg">
          <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-20" />
          <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-25 pointer-events-none" />

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3.5 text-xs font-semibold text-white hover:bg-white/10 transition-all duration-200 mb-5"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-[1px] bg-white/5" />
            <span className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest">or sign in with email</span>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

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
                placeholder="student@example.com"
                className="w-full rounded-xl border border-white/5 bg-[#09090b]/60 px-4 py-3.5 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder-zinc-700 font-light"
              />
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>Password</span>
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
              {/* Forgot Password Link */}
              {!isRegister && (
                <div className="text-right">
                  <Link
                    href="/reset-password"
                    className="text-[10px] text-primary dark:text-purple-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
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
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
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
                  setShowVerificationMsg(false);
                }}
                className="text-primary hover:underline cursor-pointer font-medium"
              >
                {isRegister ? "Sign In" : "Create Account"}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#040406] text-white items-center justify-center">
        <div className="animate-pulse text-sm text-zinc-500">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
