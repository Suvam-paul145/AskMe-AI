"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Check, X as XIcon, Brain, Shield, Rocket, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";

const faqItems = [
  {
    q: "Is the free tier really free forever?",
    a: "Yes! The Cognitive Starter plan is free forever. During our beta period, all Pro features are also unlocked for free so you can experience the full platform."
  },
  {
    q: "Can I cancel my Pro subscription anytime?",
    a: "Absolutely. You can downgrade or cancel at any time from your Settings page. Your data will be preserved even if you switch back to the free tier."
  },
  {
    q: "What happens to my documents if I downgrade?",
    a: "Your documents, chat history, and quiz results are never deleted. On the free tier, you'll have read-only access to documents beyond the 3-document limit."
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes! Students with a valid .edu email automatically receive an additional 15% discount on the yearly Pro plan. Contact us for institutional bulk licensing."
  },
  {
    q: "What payment methods do you accept?",
    a: "We'll support all major credit cards, UPI, and PayPal when payments launch. During the beta period, all features are free — no payment required."
  }
];

const comparisonFeatures = [
  { name: "Active Documents", free: "3", pro: "Unlimited", institution: "Unlimited" },
  { name: "RAG Doubt Chat", free: false, pro: true, institution: true },
  { name: "Quiz Generation", free: "5/month", pro: "Unlimited", institution: "Unlimited" },
  { name: "Memory Graph", free: "Static list", pro: "Interactive 3D", institution: "Interactive 3D" },
  { name: "Learning DNA Profile", free: false, pro: true, institution: true },
  { name: "Reverse Teacher Mode", free: false, pro: true, institution: true },
  { name: "Spaced Repetition Planner", free: false, pro: true, institution: true },
  { name: "Classroom Sharing", free: false, pro: false, institution: true },
  { name: "Teacher Analytics", free: false, pro: false, institution: true },
  { name: "API Access", free: false, pro: false, institution: true },
  { name: "Priority Support", free: false, pro: "Email", institution: "Dedicated Manager" },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Cognitive Starter",
      icon: Rocket,
      price: 0,
      originalPrice: 0,
      description: "Experience the basic tools of the cognitive learning system.",
      features: [
        "Up to 3 active notes documents",
        "Interactive mock doubt solver",
        "Static concepts memory list",
        "Weekly learning metrics summary",
        "Light & Dark theme switches"
      ],
      cta: "Start Free",
      ctaLink: "/upload",
      accent: false
    },
    {
      name: "Cognitive Pro",
      icon: Brain,
      price: billingCycle === "monthly" ? 12 : 9,
      originalPrice: billingCycle === "yearly" ? 12 : null,
      description: "Unlock full adaptive learning power and live neural diagrams.",
      features: [
        "Unlimited document vector uploads",
        "Active Gemini RAG Doubt Chatbot",
        "Adaptive Quiz calibration generator",
        "Interactive SVG Concept Memory Graph",
        "Detailed 8D Learning DNA stats",
        "Reverse Teacher Mode (RTM)",
        "Spaced repetition autopilot scheduler"
      ],
      cta: "Start Free Beta",
      ctaLink: "/upload",
      accent: true
    },
    {
      name: "Institutional / Lab",
      icon: Shield,
      price: billingCycle === "monthly" ? 49 : 39,
      originalPrice: billingCycle === "yearly" ? 49 : null,
      description: "For departments and research groups needing custom parameters.",
      features: [
        "Everything in Pro plan",
        "Custom classroom notes sharing",
        "Teacher cohort analytics dashboard",
        "API access to RAG coordinates output",
        "Priority Gemini pipeline instances",
        "Dedicated account support manager"
      ],
      cta: "Contact Sales",
      ctaLink: "/contact",
      accent: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Pricing Plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white cinematic-title">
            Choose Your Learning Plan
          </h1>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto font-light leading-relaxed">
            Select a plan that fits your study needs. Upgrade anytime as your learning evolves.
          </p>

          {/* Beta Banner */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2">
            🎉 Beta: All Pro features are free — no payment required
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-[#09090b]/80 p-1.5 mt-8 hover:border-white/10 transition-colors matte-layer">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-5 py-1.5 text-xs font-bold transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-primary text-white shadow-md"
                  : "text-zinc-400 dark:text-zinc-300 hover:text-zinc-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-full px-5 py-1.5 text-xs font-bold transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "bg-primary text-white shadow-md"
                  : "text-zinc-400 dark:text-zinc-300 hover:text-zinc-200"
              }`}
            >
              Yearly (Save 25%)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-500 relative overflow-hidden matte-layer spatial-shadow-lg ${
                  plan.accent
                    ? "border-primary/45 bg-[#0d0d11]/85 ring-2 ring-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] scale-[1.03]"
                    : "border-white/5 bg-[#0d0d11]/40 hover:bg-[#0d0d11]/80 hover:border-white/10"
                } group`}
              >
                {/* Scanner line sweep overlay */}
                <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-20" />

                {/* Popular Badge */}
                {plan.accent && (
                  <span className="absolute top-3.5 right-3.5 text-[8px] uppercase font-bold tracking-widest text-primary dark:text-purple-400 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full biometric-glow animate-pulse">
                    MOST POPULAR
                  </span>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Icon */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border transition-colors ${
                      plan.accent 
                        ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(139,92,246,0.15)]" 
                        : "bg-white/5 text-zinc-400 border-white/5 group-hover:text-white"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="pt-2">
                    <div className="flex items-baseline text-white gap-2">
                      <span className="text-4xl font-extrabold tracking-tight font-mono">${plan.price}</span>
                      <span className="text-xs font-light text-zinc-400">/ {billingCycle === "yearly" ? "month" : "month"}</span>
                      {plan.originalPrice && plan.originalPrice > plan.price && (
                        <span className="text-sm text-zinc-400 line-through font-mono">${plan.originalPrice}</span>
                      )}
                    </div>
                    {billingCycle === "yearly" && plan.price > 0 && (
                      <span className="text-[10px] text-emerald-400 font-medium font-mono block mt-1 biometric-glow">
                        Save 25% — Billed ${plan.price * 12}/year
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {plan.description}
                  </p>

                  <div className="h-[1px] bg-white/5" />

                  {/* Features list */}
                  <ul className="space-y-4">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs text-zinc-300 font-light">
                        <Check className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href={plan.ctaLink}
                    className={`block text-center rounded-xl py-3.5 text-xs font-bold shadow-md transition-all duration-300 ${
                      plan.accent
                        ? "bg-primary text-white hover:bg-primary/90 glowing-border"
                        : "border border-white/5 bg-[#0d0d11]/80 text-zinc-300 hover:text-white hover:bg-[#121217]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  {plan.accent && (
                    <p className="text-[9px] text-center text-zinc-400 dark:text-zinc-300 mt-2 font-light">
                      🎉 Free during beta — no credit card required
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto mt-24">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white cinematic-title">
              Compare Plans
            </h2>
            <p className="text-xs text-zinc-400 font-light">See exactly what&apos;s included in each tier.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0d0d11]/60 overflow-hidden">
            <div className="grid grid-cols-4 gap-0 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-300 border-b border-white/5">
              <div className="p-4">Feature</div>
              <div className="p-4 text-center">Free</div>
              <div className="p-4 text-center text-primary">Pro</div>
              <div className="p-4 text-center">Institution</div>
            </div>
            {comparisonFeatures.map((feat, i) => (
              <div key={feat.name} className={`grid grid-cols-4 gap-0 text-xs ${i < comparisonFeatures.length - 1 ? "border-b border-white/5" : ""}`}>
                <div className="p-4 text-zinc-300 font-medium">{feat.name}</div>
                {[feat.free, feat.pro, feat.institution].map((val, j) => (
                  <div key={j} className="p-4 text-center">
                    {val === true ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : val === false ? (
                      <XIcon className="h-4 w-4 text-zinc-400 mx-auto" />
                    ) : (
                      <span className="text-zinc-400 dark:text-zinc-300 font-light">{val}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24 mb-8">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white cinematic-title">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-400 font-light">Everything you need to know about our plans.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/5 bg-[#0d0d11]/50 overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-semibold text-white">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-zinc-400 dark:text-zinc-300 transition-transform duration-300 shrink-0 ml-4 ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
