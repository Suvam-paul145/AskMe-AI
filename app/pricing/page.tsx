"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Check, Brain, Shield, Rocket } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Cognitive Starter",
      icon: Rocket,
      price: billingCycle === "monthly" ? 0 : 0,
      description: "Experience the basic tools of the cognitive learning system.",
      features: [
        "Up to 3 active notes documents",
        "Interactive mock doubt solver",
        "Static concepts memory list",
        "Weekly learning metrics summary",
        "Light & Dark theme switches"
      ],
      cta: "Start Free Preview",
      ctaLink: "/upload",
      accent: false
    },
    {
      name: "Cognitive Pro",
      icon: Brain,
      price: billingCycle === "monthly" ? 12 : 9,
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
      cta: "Upgrade to Pro",
      ctaLink: "/upload",
      accent: true
    },
    {
      name: "Institutional / Lab",
      icon: Shield,
      price: billingCycle === "monthly" ? 49 : 39,
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
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            SaaS Plan Pricing built for Brains
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a plan to accelerate your active recall speeds. Cancel or adjust anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 mt-6">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                billingCycle === "yearly"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly billing (Save 25%)
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
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  plan.accent
                    ? "border-primary bg-card/60 ring-2 ring-primary/20 shadow-xl scale-[1.02]"
                    : "border-border bg-card/40 hover:bg-card/60"
                }`}
              >
                {/* Popular Badge */}
                {plan.accent && (
                  <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider text-white bg-primary px-3 py-1 rounded-full">
                    Recommended
                  </span>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Icon */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${plan.accent ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-baseline text-foreground">
                      <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">/month</span>
                    </div>
                    {billingCycle === "yearly" && plan.price > 0 && (
                      <span className="text-xs text-green-500 font-medium">Billed annually (${plan.price * 12}/yr)</span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="h-[1px] bg-border" />

                  {/* Features list */}
                  <ul className="space-y-3.5">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <Check className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href={plan.ctaLink}
                    className={`block text-center rounded-xl py-3 text-sm font-semibold shadow-md transition-all ${
                      plan.accent
                        ? "bg-primary text-white hover:bg-primary/95 glowing-border"
                        : "border border-border bg-card text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
