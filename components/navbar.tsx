"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Sun, Moon, Menu, X, Flame, Zap, Settings } from "lucide-react";
import AvatarDisplay from "@/components/avatar-display";

export default function Navbar() {
  const { theme, toggleTheme, streak, xp, profile } = useStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { name: "Workspace", path: "/workspace" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Memory Graph", path: "/memory-graph" },
    { name: "Planner", path: "/planner" },
    { name: "DNA Profile", path: "/dna" },
  ];

  const marketingItems = [
    { name: "Features", path: "/features" },
    { name: "Architecture", path: "/architecture" },
    { name: "Pricing", path: "/pricing" },
  ];

  const isWorkspacePath = pathname.startsWith("/workspace") || 
                          pathname.startsWith("/dashboard") || 
                          pathname.startsWith("/memory-graph") || 
                          pathname.startsWith("/planner") || 
                          pathname.startsWith("/dna") ||
                          pathname.startsWith("/chat") ||
                          pathname.startsWith("/quiz") ||
                          pathname.startsWith("/analytics") ||
                          pathname.startsWith("/upload");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-transform group-hover:scale-105 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.png" alt="AskMe AI Logo" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 transition-colors">
                AskMe <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {(isWorkspacePath ? navItems : marketingItems).map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted/50 ${
                      isActive 
                        ? "text-primary dark:text-purple-400" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary dark:bg-purple-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Action buttons & Stats */}
          <div className="hidden md:flex items-center gap-4">
            {/* User Stats Widget */}
            <div className="flex items-center gap-3 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0d0d11] px-4 py-1.5 text-xs font-semibold shadow-sm">
              <div className="flex items-center gap-1 text-orange-500" title="Daily Study Streak">
                <Flame className="h-4 w-4 fill-current animate-pulse" />
                <span>{!mounted ? "0" : streak}d</span>
              </div>
              <div className="h-3 w-[1px] bg-zinc-200 dark:bg-white/10" />
              <div className="flex items-center gap-1 text-primary dark:text-purple-400" title="Cognitive XP Accumulated">
                <Zap className="h-4 w-4 fill-current" />
                <span>{!mounted ? "0" : xp} XP</span>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0d0d11] p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {!mounted || theme === "dark" ? (
                <Sun className="h-4.5 w-4.5 text-amber-500 dark:text-yellow-400 fill-amber-500/20" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10" />
              )}
            </button>

            {/* Quick Settings Icon */}
            <Link
              href="/settings"
              className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0d0d11] p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
              aria-label="Settings"
            >
              <Settings className="h-4.5 w-4.5" />
            </Link>

            {/* Dynamic Profile Avatar */}
            {mounted && (
              <Link href="/settings" title="Profile Settings" className="flex items-center shrink-0">
                <AvatarDisplay 
                  avatarUrl={profile.avatar_url} 
                  name={profile.full_name} 
                  className="h-8.5 w-8.5 text-[10px] border border-zinc-200 dark:border-white/10 hover:border-primary/50 transition-colors" 
                />
              </Link>
            )}

            {/* CTA */}
            {!isWorkspacePath && (
              <Link
                href="/upload"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary/90 transition-all dark:bg-purple-600 dark:hover:bg-purple-500"
              >
                Start Studying
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0d0d11] p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {!mounted || theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-500 dark:text-yellow-400 fill-amber-500/20" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0d0d11] p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
              aria-label="Open main menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-[#040406] px-4 py-3 space-y-2 animate-float">
          {/* Stats Bar */}
          <div className="flex items-center justify-around rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0d0d11] p-2.5 text-xs font-semibold shadow-sm mb-3">
            <div className="flex items-center gap-1.5 text-orange-500">
              <Flame className="h-4.5 w-4.5 fill-current" />
              <span>Streak: {!mounted ? "0" : streak} days</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary dark:text-purple-400">
              <Zap className="h-4.5 w-4.5 fill-current" />
              <span>XP: {!mounted ? "0" : xp} points</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {(isWorkspacePath ? navItems : marketingItems).map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-base font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-purple-900/20 dark:text-purple-400"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-zinc-200 dark:border-white/10 pt-3 mt-3 space-y-2">
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <AvatarDisplay 
                avatarUrl={profile.avatar_url} 
                name={profile.full_name} 
                className="h-6 w-6 text-[8px]" 
              />
              <span>Settings</span>
            </Link>
            {!isWorkspacePath && (
              <Link
                href="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center rounded-lg bg-primary py-2.5 text-base font-semibold text-white shadow-md hover:bg-primary/90 dark:bg-purple-600 dark:hover:bg-purple-500"
              >
                Start Studying
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
