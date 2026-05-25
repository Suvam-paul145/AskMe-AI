"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore, GraphNode } from "@/lib/store";
import { 
  Flame, 
  Zap, 
  Target, 
  Brain, 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Heart,
  Search,
  Activity,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

// --- CUSTOM 3D CANVASES FOR DASHBOARD CORE ---
function Custom3DCanvasDashboard({ onSelectNode }: { onSelectNode: (node: GraphNode) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { nodes, links } = useStore();

  const originalCoords = useRef<Record<string, { x: number; y: number }>>({});
  const projectedNodesRef = useRef<any[]>([]);

  // Initialize original coords once
  if (Object.keys(originalCoords.current).length === 0 && nodes.length > 0) {
    nodes.forEach(n => {
      originalCoords.current[n.id] = { x: n.x ?? 250, y: n.y ?? 200 };
    });
  }

  // Rotation states
  const rotY = useRef(0);
  const rotX = useRef(0);
  const mouse = useRef({ isDown: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const focalLength = 280;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : 450 * dpr;
      canvas.height = canvas.parentElement?.clientHeight ? canvas.parentElement.clientHeight * dpr : 320 * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      mouse.current.isDown = true;
      mouse.current.lastX = e.clientX;
      mouse.current.lastY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouse.current.isDown) {
        const dx = e.clientX - mouse.current.lastX;
        const dy = e.clientY - mouse.current.lastY;
        rotY.current += dx * 0.4;
        rotX.current -= dy * 0.4;
        mouse.current.lastX = e.clientX;
        mouse.current.lastY = e.clientY;
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mX = e.clientX - rect.left;
      const mY = e.clientY - rect.top;

      projectedNodesRef.current.forEach(n => {
        const dist = Math.sqrt((mX - n.px) * (mX - n.px) + (mY - n.py) * (mY - n.py));
        if (dist < 20 * n.scale) {
          const original = nodes.find(orig => orig.id === n.id);
          if (original) {
            onSelectNode(original);
          }
        }
      });
    };

    const onMouseUp = () => {
      mouse.current.isDown = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);
    window.addEventListener("mouseup", onMouseUp);

    const render = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      // Auto rotation
      if (!mouse.current.isDown) {
        rotY.current += 0.2;
      }

      const radY = rotY.current * Math.PI / 180;
      const radX = rotX.current * Math.PI / 180;

      // Project Nodes
      const projected = nodes.map(node => {
        const orig = originalCoords.current[node.id] || { x: 250, y: 200 };
        const nx = orig.x - 250; // offset coordinates centered around 0
        const ny = orig.y - 200;
        const nz = 0; // map 3D Z coordinates

        // Rotate Y
        let x1 = nx * Math.cos(radY) - nz * Math.sin(radY);
        let z1 = nx * Math.sin(radY) + nz * Math.cos(radY);

        // Rotate X
        let y1 = ny * Math.cos(radX) - z1 * Math.sin(radX);
        let z2 = ny * Math.sin(radX) + z1 * Math.cos(radX);

        // Clip if behind camera
        if (focalLength + z2 <= 20) {
          return null;
        }

        const scale = focalLength / (focalLength + z2);
        const px = (width / 2) + x1 * scale;
        const py = (height / 2) + y1 * scale;

        return {
          ...node,
          px,
          py,
          scale,
          z2
        };
      }).filter((n): n is Exclude<typeof n, null> => n !== null);

      // Save projected state in ref for click handler
      projectedNodesRef.current = projected;

      // Depth Sort
      projected.sort((a, b) => b.z2 - a.z2);

      // Draw Links
      ctx.shadowBlur = 0; // Disable shadow for line drawing
      links.forEach(link => {
        const s = projected.find(n => n.id === link.source);
        const t = projected.find(n => n.id === link.target);
        if (s && t) {
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(t.px, t.py);
          ctx.strokeStyle = "rgba(168, 85, 247, 0.45)";
          ctx.lineWidth = 1.25;
          ctx.stroke();
        }
      });

      // Draw Nodes
      projected.forEach(node => {
        const radius = Math.max(1, (node.status === "weak" ? 6 : 4.5) * node.scale);
        
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);

        let strokeColor = "rgb(192, 132, 252)"; // brighter purple
        let fillColor = "rgba(192, 132, 252, 0.25)";

        if (node.status === "mastered") {
          strokeColor = "rgb(96, 165, 250)"; // brighter blue
          fillColor = "rgba(96, 165, 250, 0.25)";
        } else if (node.status === "weak" || node.status === "forgotten") {
          strokeColor = "rgb(251, 113, 133)"; // brighter rose
          fillColor = "rgba(251, 113, 133, 0.3)";
        }

        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 1.8 * node.scale;

        // Apply premium neon glow shadow
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 12 * node.scale;

        ctx.fill();
        ctx.stroke();

        // Reset shadow blur
        ctx.shadowBlur = 0;

        // Label
        if (node.scale > 0.8) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
          ctx.font = `${Math.round(8 * node.scale)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.px, node.py + radius + 10);
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
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [nodes, links, onSelectNode]);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-pointer" />;
}

// --- CONSCIOUS STUDENT DASHBOARD ---
export default function DashboardPage() {
  const { streak, xp, dailyGoalProgress, weakTopics, attempts, nodes } = useStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Default selection
  useEffect(() => {
    if (nodes && nodes.length > 0 && !selectedNode) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes, selectedNode]);

  const getStatusColor = (status: GraphNode["status"]) => {
    switch (status) {
      case "mastered": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "learning": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "weak": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Core conscious 3-column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
          
          {/* COLUMN 1 — AI IDENTITY (col-span-3) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
            {/* AI Mentor Sync status */}
            <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-[100px] h-[100px] radial-glow opacity-20 pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400 animate-pulse border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                  <Brain className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">AskMe CLOS</h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Sync: Optimal</p>
                </div>
              </div>

              <div className="h-[1px] bg-border" />

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Focus State</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  "Flow State active. Spaced repetition decay maps indicate review priority is concentrated in Electromagnetics."
                </p>
              </div>

              <div className="h-[1px] bg-border" />

              {/* Streaks stats */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Active Mission</span>
                <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                  <Flame className="h-4 w-4 fill-current animate-pulse" />
                  <span>{streak}d Streak</span>
                </div>
              </div>
            </div>

            {/* Daily targets progress */}
            <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" />
                  Daily Sync Goal
                </span>
                <span className="text-xs text-primary dark:text-purple-400 font-extrabold">{dailyGoalProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${dailyGoalProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Ingest notes and solve doubts to reach 100% daily calibration.
              </p>
            </div>
          </div>

          {/* COLUMN 2 — COGNITIVE SPACE (col-span-6) */}
          <div className="lg:col-span-6 border border-border bg-card/20 rounded-3xl glass-card flex flex-col justify-between overflow-hidden relative min-h-[460px] p-6">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-primary" />
                Cognitive Topology Graph
              </h3>
              <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Drag to rotate • click node</span>
            </div>

            {/* Sticky 3D Graph Canvas */}
            <div className="flex-1 min-h-[260px] relative">
              <Custom3DCanvasDashboard onSelectNode={setSelectedNode} />
            </div>

            {/* Node metadata info footer inside canvas card */}
            {selectedNode && (
              <div className="border-t border-border pt-4 mt-2 flex items-center justify-between gap-4 animate-float">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">{selectedNode.label}</h4>
                  <span className={`inline-block text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(selectedNode.status)}`}>
                    {selectedNode.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-primary dark:text-purple-400 font-extrabold">{selectedNode.strength}% strength</span>
                  <p className="text-[9px] text-zinc-500 font-medium">Memory decay speed: low</p>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 3 — ADAPTIVE INTELLIGENCE (col-span-3) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
            {/* Weak topics predictions */}
            <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                Decay Predictions
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {weakTopics.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2">No critical memory decay predicted.</p>
                ) : (
                  weakTopics.slice(0, 3).map((topic) => (
                    <div key={topic} className="flex items-center justify-between bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-xs text-rose-500 font-semibold">
                      <span>{topic}</span>
                      <span className="text-[9px] bg-rose-500/10 px-2 py-0.5 rounded-full font-bold">Priority Review</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calibrations and focus analytics list */}
            <div className="border border-border bg-card/25 p-5 rounded-2xl glass-card space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-4.5 w-4.5 text-primary" />
                Focus Calibrations
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Confidence Accuracy</span>
                  <span className="text-foreground">84%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Exam Readiness</span>
                  <span className="text-primary dark:text-purple-400 font-bold">88% ready</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Spacing efficiency</span>
                  <span className="text-foreground">92%</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-2">
              <Link
                href="/workspace"
                className="w-full inline-flex items-center justify-between rounded-xl border border-border bg-card hover:bg-muted/60 p-3.5 text-xs font-bold text-foreground transition-all group"
              >
                <span>Study Active Workspace</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all" />
              </Link>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
