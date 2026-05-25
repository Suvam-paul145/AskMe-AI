"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Send, CheckCircle, HelpCircle, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "general",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: "", email: "", topic: "general", message: "" });
      setTimeout(() => setSubmitted(false), 6000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start max-w-5xl mx-auto">
          
          {/* Left info content */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Get in Touch with our team
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have doubts about the vector search embedding logic? Want to report an active recall scheduling bug? Contact support directly.
            </p>

            <div className="space-y-4 pt-4 border-t border-border/80">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>support@askme-ai.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                <span>Documentation center active 24/7</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                <span>Response average speed: &lt; 2 hours</span>
              </div>
            </div>
          </div>

          {/* Right form card */}
          <div className="lg:col-span-7 bg-card/40 border border-border p-6 md:p-8 rounded-2xl glass-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@askme-ai.com"
                    className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="topic" className="text-xs font-semibold text-muted-foreground uppercase">Reason for Contact</label>
                <select
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Pro / Institutional Licensing</option>
                  <option value="job">Careers application</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-muted-foreground uppercase">Your Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Explain your request..."
                  className="w-full rounded-xl border border-border bg-zinc-950/40 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border"
              >
                <Send className="h-4.5 w-4.5" />
                Submit Request
              </button>

              {submitted && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl p-4 flex items-center gap-2 animate-pulse text-sm">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>Success! Your request has been transmitted. Our cognitive support loop will follow up shortly.</span>
                </div>
              )}
            </form>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
