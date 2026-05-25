"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Brain, Send } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-black text-zinc-400 py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Brain className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                AskMe <span className="text-primary dark:text-purple-400">AI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-500">
              The Tesla of EdTech: a next-generation Cognitive Learning Operating System that aligns with your brain's unique wiring.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="rounded-lg p-1.5 hover:bg-zinc-900 hover:text-white transition-all" aria-label="GitHub">
                <svg className="h-4.5 w-4.5 animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="#" className="rounded-lg p-1.5 hover:bg-zinc-900 hover:text-white transition-all" aria-label="Twitter">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="rounded-lg p-1.5 hover:bg-zinc-900 hover:text-white transition-all" aria-label="LinkedIn">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Column 1: Ecosystem */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Ecosystem</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/workspace" className="hover:text-white transition-colors">Study Workspace</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <Link href="/memory-graph" className="hover:text-white transition-colors">Memory Nodes Graph</Link>
              </li>
              <li>
                <Link href="/dna" className="hover:text-white transition-colors">Learning DNA</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">Core Features</Link>
              </li>
              <li>
                <Link href="/architecture" className="hover:text-white transition-colors">AI Architecture</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">SaaS Pricing</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Story</Link>
              </li>
            </ul>
          </div>

          {/* Subscription Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Cognitive Dispatch</h3>
            <p className="text-sm text-zinc-500">
              Subscribe to get the latest research updates in active recall methodology and neural study integrations.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-primary focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-xl bg-primary px-3 text-white hover:bg-primary/95 transition-all"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-green-500 animate-pulse">
                Successfully subscribed! Ingesting cognitive updates.
              </p>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-zinc-900 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© {currentYear} AskMe AI Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/careers" className="hover:text-zinc-400">Careers</Link>
            <Link href="/contact" className="hover:text-zinc-400">Contact Support</Link>
            <Link href="/blog" className="hover:text-zinc-400">Science Blog</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
