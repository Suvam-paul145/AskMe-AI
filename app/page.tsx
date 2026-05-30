"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Sparkles, Upload, FileText, Brain, BarChart3, Star, Quote } from "lucide-react";

// --- CUSTOM 3D PROJECTION GRAPH COMPONENT ---
function Custom3DGraph({ scene }: { scene: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { theme } = useStore();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Defer graph initialization to keep first input paint extremely fast
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // 3D Nodes Definition
  const nodes = useRef([
    { id: "n-1", label: "Coulomb's Law", x: -120, y: -80, z: -50, status: "mastered", strength: 88, px: 0, py: 0, scale: 1 },
    { id: "n-2", label: "Electric Field", x: 100, y: -40, z: 90, status: "learning", strength: 75, px: 0, py: 0, scale: 1 },
    { id: "n-3", label: "Electric Potential", x: -60, y: 90, z: -80, status: "weak", strength: 40, px: 0, py: 0, scale: 1 },
    { id: "n-4", label: "Superposition", x: 140, y: 80, z: -60, status: "mastered", strength: 92, px: 0, py: 0, scale: 1 },
    { id: "n-5", label: "Gauss's Law", x: 40, y: -100, z: -120, status: "forgotten", strength: 25, px: 0, py: 0, scale: 1 },
    { id: "n-6", label: "DNA Replication", x: -90, y: 40, z: 120, status: "learning", strength: 80, px: 0, py: 0, scale: 1 },
    { id: "n-7", label: "Transcription", x: 110, y: -60, z: -90, status: "learning", strength: 70, px: 0, py: 0, scale: 1 },
    { id: "n-8", label: "Translation", x: -70, y: -120, z: 60, status: "weak", strength: 35, px: 0, py: 0, scale: 1 }
  ]);

  const links = useRef([
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 1, target: 4 },
    { source: 5, target: 6 },
    { source: 6, target: 7 }
  ]);

  // Rotations
  const rotY = useRef(0);
  const rotX = useRef(0);
  const mouse = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const focalLength = 300;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : 500 * dpr;
      canvas.height = canvas.parentElement?.clientHeight ? canvas.parentElement.clientHeight * dpr : 400 * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    // Mouse/Drag handlers for 3D rotation
    const onMouseDown = (e: MouseEvent) => {
      mouse.current.isDown = true;
      mouse.current.lastX = e.clientX;
      mouse.current.lastY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Track hover detection relative to scale
      const mX = e.clientX - rect.left;
      const mY = e.clientY - rect.top;
      
      let matchedNode: string | null = null;
      nodes.current.forEach(n => {
        const dx = mX - n.px;
        const dy = mY - n.py;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 15 * n.scale) {
          matchedNode = n.label;
        }
      });
      setHoveredNode(matchedNode);

      if (!mouse.current.isDown) return;
      const dx = e.clientX - mouse.current.lastX;
      const dy = e.clientY - mouse.current.lastY;
      rotY.current += dx * 0.4;
      rotX.current -= dy * 0.4;
      mouse.current.lastX = e.clientX;
      mouse.current.lastY = e.clientY;
    };

    const onMouseUp = () => {
      mouse.current.isDown = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Main Draw loop
    const render = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      // Auto rotation drift if not drag dragging
      if (!mouse.current.isDown) {
        rotY.current += 0.15;
        rotX.current = Math.sin(Date.now() * 0.0005) * 5;
      }

      const radY = rotY.current * Math.PI / 180;
      const radX = rotX.current * Math.PI / 180;

      // Project Nodes
      const projected = nodes.current.map(node => {
        let x = node.x;
        let y = node.y;
        let z = node.z;

        // Apply Scene variations
        if (scene === 1) {
          // Chaos: drift particles randomly
          const t = Date.now() * 0.001;
          x += Math.sin(t + node.x) * 20;
          y += Math.cos(t + node.y) * 20;
        } else if (scene === 2) {
          // Awakening: snap particles towards center cluster
          x *= 0.6;
          y *= 0.6;
          z *= 0.6;
        }

        // Rotate Y
        const x1 = x * Math.cos(radY) - z * Math.sin(radY);
        const z1 = x * Math.sin(radY) + z * Math.cos(radY);

        // Rotate X
        const y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

        // 3D Perspective Scale
        const scale = focalLength / (focalLength + z2);
        const px = (width / 2) + x1 * scale;
        const py = (height / 2) + y1 * scale;

        // Store screen coordinates for hover math
        node.px = px;
        node.py = py;
        node.scale = scale;

        return {
          ...node,
          px,
          py,
          scale,
          z2
        };
      });

      // Depth Sort (draw background nodes first)
      projected.sort((a, b) => b.z2 - a.z2);

      // Draw Links (only in scene >= 2)
      if (scene >= 2) {
        ctx.shadowBlur = 0; // Disable shadow for line drawing
        links.current.forEach(link => {
          const s = projected.find(n => n.id === nodes.current[link.source].id);
          const t = projected.find(n => n.id === nodes.current[link.target].id);

          if (s && t) {
            ctx.beginPath();
            ctx.moveTo(s.px, s.py);
            ctx.lineTo(t.px, t.py);
            
            // Fade line opacity based on 3D depth
            const alpha = Math.min(1, Math.max(0.05, (s.scale + t.scale) / 2 - 0.2));
            ctx.strokeStyle = scene === 2 
              ? `rgba(168, 85, 247, ${alpha * 0.5})` 
              : `rgba(168, 85, 247, ${alpha * 0.75})`;
            ctx.lineWidth = scene === 2 ? 1.25 : 1.75;
            ctx.stroke();
          }
        });
      }

      // Draw Nodes
      projected.forEach(node => {
        const radius = (node.status === "weak" ? 7 : 5) * node.scale;
        
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);

        // Color maps
        let strokeColor = theme === "light" ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.95)";
        let fillStyle = theme === "light" ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.3)";
        
        if (scene === 2) {
          strokeColor = "rgba(168, 85, 247, 0.95)";
          fillStyle = "rgba(168, 85, 247, 0.35)";
        } else if (scene >= 3) {
          if (node.status === "mastered") {
            strokeColor = "rgb(96, 165, 250)"; // Blue stable
            fillStyle = "rgba(96, 165, 250, 0.25)";
          } else if (node.status === "weak" || node.status === "forgotten") {
            strokeColor = "rgb(251, 113, 133)"; // Red pulsing
            fillStyle = `rgba(251, 113, 133, ${0.25 + Math.sin(Date.now() * 0.005) * 0.15})`;
          } else {
            strokeColor = "rgb(192, 132, 252)"; // Purple learning
            fillStyle = "rgba(192, 132, 252, 0.2)";
          }
        }

        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillStyle;
        ctx.lineWidth = 1.8 * node.scale;

        // Apply premium neon glow shadow
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 12 * node.scale;

        ctx.fill();
        ctx.stroke();

        // Reset shadow blur
        ctx.shadowBlur = 0;

        // Pulsing decay rings for weak concepts
        if (scene >= 3 && (node.status === "weak" || node.status === "forgotten")) {
          const ringRad = radius + (Date.now() * 0.015) % 15;
          const ringAlpha = 1 - (ringRad - radius) / 15;
          ctx.beginPath();
          ctx.arc(node.px, node.py, ringRad, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 63, 94, ${ringAlpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Node Label (only if closer or hovered)
        if (scene >= 3 && node.scale > 0.75) {
          ctx.fillStyle = theme === "light" ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.85)";
          ctx.font = `${Math.round(9 * node.scale)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.px, node.py + radius + 12);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
    };
  }, [scene, theme]);

  if (!shouldRender) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-600 dark:text-zinc-500 font-mono text-[9px] uppercase tracking-wider select-none animate-pulse">
        Initializing 3D Neural Nodes...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative select-none">
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
      {/* Interactive HUD HUD */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-zinc-950/80 border border-border/80 px-3.5 py-2 rounded-xl text-[10px] uppercase font-bold tracking-wider text-primary dark:text-purple-400 backdrop-blur-md animate-pulse">
          Active: {hoveredNode}
        </div>
      )}
    </div>
  );
}

// --- ANIMATED COUNTER COMPONENT FOR SCROLL-IN-VIEW INCREMENTS ---
function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const numericPart = value.replace(/[^\d.]/g, "");
    const target = parseFloat(numericPart) || 0;
    const isDecimal = numericPart.includes(".");
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;
          const duration = 2000; // 2 seconds

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Easing function: easeOutQuad
            const easeProgress = progress * (2 - progress);
            
            setCount(easeProgress * target);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  const formatCount = () => {
    const numericPart = value.replace(/[^\d.]/g, "");
    const isDecimal = numericPart.includes(".");
    const decimalPlaces = isDecimal ? numericPart.split(".")[1].length : 0;
    const hasCommas = value.includes(",");
    const suffix = value.replace(/[\d,.]/g, "");

    let formatted = count.toFixed(decimalPlaces);
    if (hasCommas) {
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      formatted = parts.join(".");
    }
    return `${formatted}${suffix}`;
  };

  return (
    <span ref={elementRef} className="tabular-nums">
      {formatCount()}
    </span>
  );
}

// --- CONVERSATIONAL CONVERSION PREVIEW SANDBOX ---
interface SandboxMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

function ConversionChatSandbox() {
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ephemeral_chats");
      if (stored) {
        setTimeout(() => {
          setMessages(JSON.parse(stored));
        }, 0);
      } else {
        const welcome: SandboxMessage = {
          sender: "ai",
          text: "Welcome to the Cognitive Sandbox! I am your socratic study tutor. Ask me any question, or paste text here to see how my reasoning models break down concepts.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setTimeout(() => {
          setMessages([welcome]);
        }, 0);
        localStorage.setItem("ephemeral_chats", JSON.stringify([welcome]));
      }
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiReplying) return;

    const userText = inputText;
    setInputText("");
    
    const userMsg: SandboxMessage = {
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    localStorage.setItem("ephemeral_chats", JSON.stringify(newMsgs));
    setIsAiReplying(true);

    // Dynamic Socratic Answers
    let answer = "";
    const lower = userText.toLowerCase();
    if (lower.includes("coulomb")) {
      answer = "Coulomb's Law quantifies the electrostatic force between two stationary, electrically charged particles. Let's think: what happens to the force if we double the distance between the charges? Since force is inversely proportional to the square of the distance (F ∝ 1/r²), the force drops to a quarter. Fascinating, isn't it?";
    } else if (lower.includes("dna") || lower.includes("replication")) {
      answer = "DNA replication is the biological process of producing two identical replicas of DNA from one original molecule. Why is it semi-conservative? Because each new double helix contains one original strand and one newly synthesized strand. How does this maintain extreme fidelity during cell division?";
    } else {
      answer = `You asked: "${userText}". In socratic guidance, we look at core semantic nodes. In the full AskMe AI workspace, your document text is converted into 768-dimensional dense vector embeddings using pgvector. We then match your question using cosine distance algorithms. To get the full experience and generate interactive quizzes on this topic, upload your syllabus file now!`;
    }

    // Simulate real-time streaming
    setTimeout(() => {
      setIsAiReplying(false);
      const aiMsg: SandboxMessage = {
        sender: "ai",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      localStorage.setItem("ephemeral_chats", JSON.stringify(finalMsgs));
    }, 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiReplying]);

  return (
    <div className="border border-white/5 bg-[#0d0d11]/70 backdrop-blur-md rounded-2xl p-4 w-full max-w-md mx-auto flex flex-col h-[280px] shadow-2xl relative select-none">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <span className="text-[9px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="h-3 w-3 animate-pulse" /> Sandbox Console (Offline-Safe)
        </span>
        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold font-mono">
          Local Storage
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-0.5 max-w-[85%] ${m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
            <div className={`p-2.5 rounded-xl text-[10px] leading-relaxed ${
              m.sender === "user" ? "bg-primary text-white" : "bg-white/5 border border-white/5 text-zinc-300"
            }`}>
              {m.text}
            </div>
            <span className="text-[7px] text-zinc-500 px-1 font-mono">{m.timestamp}</span>
          </div>
        ))}
        {isAiReplying && (
          <div className="mr-auto items-start max-w-[70%] w-full animate-pulse">
            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 w-full flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[8px] text-primary dark:text-purple-400 font-bold uppercase font-mono">Formulating socratic prompt...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-1.5 mt-3 pt-2 border-t border-white/5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Sandbox (e.g. DNA, Coulomb)..."
          className="flex-1 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-primary/50"
        />
        <button
          type="submit"
          disabled={isAiReplying}
          className="bg-primary hover:bg-primary/95 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold shadow-md flex items-center justify-center shrink-0 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// --- MAIN CINEMATIC LANDING SCREEN ---
export default function Home() {
  const [activeScene, setActiveScene] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track scroll position to trigger scenes transitions
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const height = window.innerHeight;

      // Determine active scene based on viewport scroll sections
      if (scrollPos < height * 0.8) {
        setActiveScene(1); // Chaos
      } else if (scrollPos >= height * 0.8 && scrollPos < height * 1.8) {
        setActiveScene(2); // AI Awakening
      } else if (scrollPos >= height * 1.8 && scrollPos < height * 2.8) {
        setActiveScene(3); // Memory Visualization
      } else if (scrollPos >= height * 2.8 && scrollPos < height * 3.8) {
        setActiveScene(4); // Morphing Dashboard
      } else {
        setActiveScene(5); // Mastery
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="bg-[#040406] text-white neural-overlay relative min-h-screen">
      <Navbar />

      {/* Floating 3D Graph center viewer (sticky across scroll scenes) */}
      <div className="fixed inset-0 z-0 pointer-events-none lg:pointer-events-auto flex items-center justify-center lg:justify-end lg:pr-24">
        <div className="w-full max-w-[500px] h-[500px] opacity-40 lg:opacity-100 transition-opacity duration-700">
          <Custom3DGraph scene={activeScene} />
        </div>
      </div>

      {/* SCENE 1: CHAOS */}
      <section className="relative z-10 min-h-screen flex items-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-xl space-y-6 animate-drift">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary dark:text-purple-400">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Scene 01: Cognitive Noise</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none cinematic-title text-foreground">
            Your Mind. <br />
            <span className="text-zinc-400">Fragmented.</span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Syllabus files scattered. Core definitions decaying. Traditional reading creates an illusion of competence while memory retention fades.
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest pt-4">
            <span>Scroll to awaken</span>
            <div className="h-5 w-[1px] bg-zinc-800" />
            <span className="animate-pulse">↓</span>
          </div>
        </div>
      </section>

      {/* SCENE 2: AWAKENING */}
      <section className="relative z-10 min-h-screen flex items-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary dark:text-purple-400">
              <Sparkles className="h-3 w-3" />
              <span>Scene 02: Ingestion</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-none cinematic-title">
              The Spark of <br />
              <span className="text-primary dark:text-purple-400">Organization.</span>
            </h2>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              AskMe AI ingests raw textbooks, notes, and diagrams, converting chaotic information streams into a clean semantic vector space. Try the cognitive sandbox on the right to see socratic retrieval in action!
            </p>
          </div>

          <div className="lg:col-span-5 w-full">
            <ConversionChatSandbox />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3-Step Section */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight cinematic-title">
            How It Works
          </h2>
          <p className="text-sm text-muted-foreground font-light">
            Three simple steps to transform your study experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: FileText,
              title: "Upload Your Notes",
              description: "Drop any PDF or text file. Our AI extracts text, formulas, and key concepts automatically."
            },
            {
              step: "02",
              icon: Brain,
              title: "AI Processes & Indexes",
              description: "Documents are chunked, embedded into vectors, and indexed for instant semantic search and quiz generation."
            },
            {
              step: "03",
              icon: BarChart3,
              title: "Study Smarter",
              description: "Chat with your notes, take adaptive quizzes, track weak spots, and follow AI-generated revision plans."
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="rounded-3xl border border-white/5 bg-[#0d0d11]/50 p-8 space-y-4 hover:border-primary/20 transition-all duration-500 group">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary font-mono bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                    {item.step}
                  </span>
                  <div className="p-2 rounded-xl border border-white/5 bg-white/5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-300 dark:text-zinc-300 leading-relaxed font-light">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SCENE 3: MEMORY VISUALIZATION */}
      <section className="relative z-10 min-h-screen flex items-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary dark:text-purple-400">
            <Sparkles className="h-3 w-3" />
            <span>Scene 03: The Map</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-none cinematic-title">
            Mapped in <br />
            <span className="bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              Real Time.
            </span>
          </h2>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            A three-dimensional topological map of your memory. Drag the canvas to rotate nodes. Weak concepts pulse red; mastered structures stabilize.
          </p>
        </div>
      </section>

      {/* SCENE 4: ADAPTIVE INTELLIGENCE */}
      <section className="relative z-10 min-h-screen flex items-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary dark:text-purple-400">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Scene 04: The Morphing Interface</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-none cinematic-title">
            Evolves with <br />
            <span className="text-primary dark:text-purple-400">Your Brain.</span>
          </h2>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            The workspace restructures itself. Quiz vectors alter difficulty paths dynamically, generating automated spacing tasks.
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF SECTION */}
      <section className="relative z-10 py-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-16 relative z-20">
          {[
            { value: "500+", label: "Documents Processed" },
            { value: "1,200+", label: "Quizzes Generated" },
            { value: "4.9★", label: "Average Rating" },
            { value: "98%", label: "Recall Improvement" }
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-1 bg-zinc-950/20 backdrop-blur-sm p-4 rounded-2xl border border-white/5 md:border-transparent">
              <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-300 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Priya Sharma",
              role: "B.Tech CSE, 3rd Year",
              context: "Class 12 · Physics aspirant",
              quote: "AskMe AI turned my chaotic PDF notes into organized quizzes. My exam scores jumped 25% in just two weeks!",
              gradient: "bg-gradient-to-br from-violet-500 to-purple-700"
            },
            {
              name: "Arjun Mehta",
              role: "NEET Aspirant",
              context: "MBBS aspirant · Biology focus",
              quote: "The Memory Graph helped me visualize exactly which biology concepts I was weak on. It's like having a personal tutor 24/7.",
              gradient: "bg-gradient-to-br from-blue-500 to-cyan-600"
            },
            {
              name: "Sarah Chen",
              role: "MSc Physics, Research Scholar",
              context: "Academic Researcher · Theory analysis",
              quote: "The RAG chat is incredibly accurate — it finds exactly the right paragraph from 200-page textbooks in seconds.",
              gradient: "bg-gradient-to-br from-emerald-500 to-teal-600"
            }
          ].map((t) => (
            <div key={t.name} className="rounded-3xl border border-white/5 bg-[#0d0d11]/50 p-6 space-y-4 hover:border-white/10 transition-all flex flex-col justify-between">
              <div>
                <Quote className="h-5 w-5 text-zinc-400 mb-2" />
                <p className="text-xs text-zinc-300 leading-relaxed font-light italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className={`h-9 w-9 rounded-full ${t.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <div className="flex text-amber-400 text-[10px] mt-0.5">★★★★★</div>
                  <p className="text-[9px] text-zinc-500 mt-0.5">{t.role} · {t.context}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT PREVIEW SHOWCASE */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight cinematic-title">
            See It In Action
          </h2>
          <p className="text-sm text-muted-foreground font-light">
            An immersive interface designed to optimize and adapt to your unique memory pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              src: "/screenshots/dashboard.png",
              alt: "Dashboard view",
              title: "Cognitive Dashboard",
              desc: "Track daily sync progress, streak counters, focus calibrations, and decay predictions in one unified control panel."
            },
            {
              src: "/screenshots/quiz.png",
              alt: "Adaptive quiz",
              title: "Calibration Quiz Engine",
              desc: "Test active recall with dynamic complexity shifts, confidence tracking, remedial logging, and detailed explanations."
            },
            {
              src: "/screenshots/memory-graph.png",
              alt: "3D Memory Graph",
              title: "3D Topological Memory Map",
              desc: "Rotate and navigate an interactive network of knowledge nodes to visualize study strength, forgotten spots, and connection paths."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/5 bg-[#0d0d11]/50 overflow-hidden hover:border-primary/20 transition-all duration-500 group flex flex-col justify-between">
              <div className="aspect-[16/10] w-full overflow-hidden border-b border-white/5 bg-zinc-950/60 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{item.title}</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-350 leading-relaxed font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SCENE 5: MASTERY */}
      <section className="relative z-10 min-h-screen flex items-center px-6 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary dark:text-purple-400">
            <Sparkles className="h-3 w-3" />
            <span>Scene 05: Clarity</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none cinematic-title">
            Calm. Focus. <br />
            <span className="text-zinc-400">Solidified.</span>
          </h2>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Clarity attained. Knowledge compiled. Transition into an environment constructed for human cognitive evolution.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-start gap-4 flex-wrap">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-primary/95 transition-all glowing-border"
            >
              <Upload className="h-4.5 w-4.5" />
              Start Free — Upload Your Notes
            </Link>
            <Link
              href="/workspace/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-6 py-3.5 text-sm font-semibold text-primary hover:bg-primary/15 transition-all"
            >
              🎮 Try Live Demo (No Login)
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-zinc-300 hover:text-white hover:border-white/20 transition-all"
            >
              Explore Features →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
