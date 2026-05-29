"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  Sparkles, 
  PenTool, 
  Share2, 
  Mail, 
  FileText, 
  Lightbulb, 
  Briefcase, 
  ArrowRight, 
  X, 
  Flame, 
  Cpu
} from "lucide-react";

// --- TEMPLATES DEFINITION ---
interface PromptTemplate {
  id: string;
  category: "creative" | "social" | "email" | "summarize" | "brainstorm" | "outreach";
  title: string;
  description: string;
  icon: any;
  fields: { name: string; label: string; placeholder: string; type: "text" | "textarea" }[];
  templateString: (vars: Record<string, string>) => string;
}

const TEMPLATES: PromptTemplate[] = [
  {
    id: "creative-1",
    category: "creative",
    title: "Socratic Narrative Builder",
    description: "Build engaging academic analogies and creative stories to explain dry technical concepts.",
    icon: PenTool,
    fields: [
      { name: "concept", label: "Core Concept to Explain", placeholder: "e.g., Quantum Entanglement, Recursion", type: "text" },
      { name: "setting", label: "Creative Setting / Theme", placeholder: "e.g., Space pirate crew, Medieval bakery", type: "text" },
      { name: "tone", label: "Storytelling Tone", placeholder: "e.g., Humorous, Dramatic, Mysterious", type: "text" }
    ],
    templateString: (v) => `You are a master storyteller and academic guide. Write an engaging creative story to explain the concept of "${v.concept}". Use the setting of "${v.setting}" and maintain a "${v.tone}" tone. Make sure to embed socratic questions within the story to check understanding.`
  },
  {
    id: "social-1",
    category: "social",
    title: "Viral Academic Thread Maker",
    description: "Convert high-density syllabus concepts into highly viral Twitter/LinkedIn learning threads.",
    icon: Share2,
    fields: [
      { name: "topic", label: "Syllabus Topic", placeholder: "e.g., Time Complexity, Krebs Cycle", type: "text" },
      { name: "hook", label: "Core Angle / Hook", placeholder: "e.g., Why most students fail this exam", type: "text" },
      { name: "length", label: "Target Thread Length (Posts)", placeholder: "e.g., 5 posts, 7 posts", type: "text" }
    ],
    templateString: (v) => `Generate a viral, highly structured social media thread about "${v.topic}" starting with the hook "${v.hook}". It should be exactly "${v.length}" long, use bullet points, clear spacing, and modern educational framing to drive shares.`
  },
  {
    id: "email-1",
    category: "email",
    title: "Professor Doubt Resolution Draft",
    description: "Draft a perfectly polite, professional email to your professor asking for academic support.",
    icon: Mail,
    fields: [
      { name: "profName", label: "Professor's Name", placeholder: "e.g., Dr. Elizabeth Smith", type: "text" },
      { name: "doubt", label: "Specific Syllabus Doubt", placeholder: "e.g., Why standard error decreases as sample size grows", type: "textarea" },
      { name: "officeHours", label: "Suggested Meeting Window", placeholder: "e.g., Monday afternoon", type: "text" }
    ],
    templateString: (v) => `Dear ${v.profName},\n\nI hope you are having a productive week. I am currently reviewing my notes on "${v.doubt}" and ran into a core question. Specifically, I am trying to resolve how this concept interacts with our active coursework. Could we perhaps discuss this briefly during your office hours on ${v.officeHours}? Thank you so much for your time and guidance.\n\nWarm regards,\n[Your Name]`
  },
  {
    id: "summarize-1",
    category: "summarize",
    title: "Cheat Sheet Summarizer",
    description: "Condense long paragraphs into highly structured exam-day cheat sheets with formulas highlighted.",
    icon: FileText,
    fields: [
      { name: "sourceText", label: "Source Text to Condense", placeholder: "Paste paragraphs from textbook...", type: "textarea" },
      { name: "focus", label: "Key Focus Area", placeholder: "e.g., Mathematical formulas, Historical dates", type: "text" }
    ],
    templateString: (v) => `Analyze the following study material and generate a dense exam cheat-sheet focusing heavily on "${v.focus}". Highlight all key formulas, define every variable precisely, and map out 3 high-impact active recall questions:\n\nTEXT:\n${v.sourceText}`
  },
  {
    id: "brainstorm-1",
    category: "brainstorm",
    title: "Adaptive Analogy Sandbox",
    description: "Brainstorm multiple real-world analogies to make complex molecular or mechanical theories memorable.",
    icon: Lightbulb,
    fields: [
      { name: "theory", label: "Theory or Mechanism", placeholder: "e.g., TCP Handshake, Photosynthesis", type: "text" },
      { name: "style", label: "Analogy Category", placeholder: "e.g., Sports, Kitchen cooking, Traffic flow", type: "text" }
    ],
    templateString: (v) => `Brainstorm three highly detailed, memorable real-world analogies for "${v.theory}" using the theme of "${v.style}". Contrast how the variables in the theory map directly to the elements of the analogy, highlighting common conceptual pitfalls.`
  },
  {
    id: "outreach-1",
    category: "outreach",
    title: "Technical Project Pitcher",
    description: "Draft a compelling outreach pitch to showcase your personal AI/coding projects to recruiters.",
    icon: Briefcase,
    fields: [
      { name: "company", label: "Target Company", placeholder: "e.g., Vercel, Supabase", type: "text" },
      { name: "project", label: "Your Project Name & Pitch", placeholder: "e.g., AskMe AI, vector document search console", type: "textarea" },
      { name: "recipient", label: "Recruiter / Lead Name", placeholder: "e.g., Hiring Manager", type: "text" }
    ],
    templateString: (v) => `Draft a professional, extremely compelling technical outreach message to ${v.recipient} at ${v.company}. Showcase the engineering complexity of "${v.project}", specifically highlighting vector search ingestion optimization, and politely inquire about summer engineering internships.`
  }
];

export default function ToolsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Filter with dynamic categories
  const categories = [
    { id: "all", label: "All Templates" },
    { id: "creative", label: "Creative Writing" },
    { id: "social", label: "Social Media" },
    { id: "email", label: "Email Drafts" },
    { id: "summarize", label: "Text Summarization" },
    { id: "brainstorm", label: "Brainstorming" },
    { id: "outreach", label: "Business Outreach" }
  ];

  const handleCardClick = (template: PromptTemplate) => {
    setActiveTemplate(template);
    const initialVals: Record<string, string> = {};
    template.fields.forEach(f => {
      initialVals[f.name] = "";
    });
    setFormValues(initialVals);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    const compiledPrompt = activeTemplate.templateString(formValues);
    if (typeof window !== "undefined") {
      localStorage.setItem("preloaded_prompt", compiledPrompt);
      router.push("/chat");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric glows */}
      <div className="absolute top-1/4 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2">
            <Cpu className="h-3.5 w-3.5 animate-pulse" />
            <span>AI Prompt Templates Sandbox</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white cinematic-title">
            Specialized Cognitive Templates
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Instantly format preconfigured prompt engines using dynamic variables to supercharge study comprehension.
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 pb-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === c.id
                  ? "bg-primary text-white border border-primary/20 shadow-lg"
                  : "text-zinc-400 dark:text-zinc-300 hover:text-white bg-white/5 border border-transparent"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Hardware-Accelerated Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[400px]">
          {TEMPLATES.map((item) => {
            const Icon = item.icon;
            const isMatch = selectedCategory === "all" || item.category === selectedCategory;

            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="rounded-3xl border border-white/5 bg-[#0d0d11]/80 p-6 space-y-4 hover:border-primary/30 hover:scale-[1.01] cursor-pointer transition-all duration-500 glass-card relative group shadow-md"
                style={{
                  transform: isMatch ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 20px, 0) scale(0.95)",
                  opacity: isMatch ? 1 : 0.1,
                  pointerEvents: isMatch ? "auto" : "none",
                  display: isMatch ? "block" : "none",
                  transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease"
                }}
              >
                <div className="absolute inset-x-0 h-full w-full scanner-sweep pointer-events-none opacity-0 group-hover:opacity-40" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/5 group-hover:bg-primary/15 group-hover:text-primary transition-colors text-zinc-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[8px] bg-primary/10 text-primary dark:text-purple-400 px-2 py-0.5 rounded-full border border-primary/20 uppercase font-mono font-bold">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wide pt-1">{item.title}</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-300 font-light leading-normal">{item.description}</p>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-bold text-primary dark:text-purple-400">
                  <span>Activate Variables</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Variable Input Form Modal Drawer */}
        {activeTemplate && (
          <div className="fixed inset-0 z-50 bg-[#040406]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
            <div className="border border-white/10 bg-[#0d0d11]/95 p-6 rounded-3xl w-full max-w-lg shadow-2xl relative animate-float">
              
              <button
                onClick={() => setActiveTemplate(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-2"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-primary animate-pulse" />
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Configure Template Variables</h2>
              </div>

              <p className="text-xs text-zinc-400 font-light mb-6 border-b border-white/5 pb-4">
                Assemble parameters for: <strong className="text-white">{activeTemplate.title}</strong>
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {activeTemplate.fields.map((f) => (
                  <div key={f.name} className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block">{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea
                        required
                        rows={4}
                        placeholder={f.placeholder}
                        value={formValues[f.name] || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [f.name]: e.target.value }))}
                        className="w-full rounded-xl border border-white/5 bg-[#09090b]/80 px-4 py-3.5 text-xs text-zinc-300 focus:outline-none focus:border-primary/50 transition-all font-light"
                      />
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder={f.placeholder}
                        value={formValues[f.name] || ""}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [f.name]: e.target.value }))}
                        className="w-full rounded-xl border border-white/5 bg-[#09090b]/80 px-4 py-3.5 text-xs text-zinc-300 focus:outline-none focus:border-primary/50 transition-all font-light"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md hover:bg-primary/95 transition-all glowing-border mt-4"
                >
                  <Sparkles className="h-4 w-4" />
                  Launch in Chat Workspace
                </button>
              </form>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
