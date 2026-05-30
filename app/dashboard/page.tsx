"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore, GraphNode } from "@/lib/store";
import { 
  Flame, 
  Target, 
  Brain, 
  AlertTriangle, 
  Clock, 
  Activity,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectedNode extends GraphNode {
  px: number;
  py: number;
  scale: number;
  z2: number;
}

// --- CUSTOM 3D CANVASES FOR DASHBOARD CORE ---
function Custom3DCanvasDashboard({ 
  onSelectNode,
  onDoubleClickNode
}: { 
  onSelectNode: (node: GraphNode) => void;
  onDoubleClickNode?: (node: GraphNode) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { nodes, links, theme } = useStore();

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

    // Initialize original coords once
    if (Object.keys(originalCoords.current).length === 0 && nodes.length > 0) {
      nodes.forEach(n => {
        originalCoords.current[n.id] = { x: n.x ?? 250, y: n.y ?? 200 };
      });
    }

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

    const onDblClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mX = e.clientX - rect.left;
      const mY = e.clientY - rect.top;

      projectedNodesRef.current.forEach(n => {
        const dist = Math.sqrt((mX - n.px) * (mX - n.px) + (mY - n.py) * (mY - n.py));
        if (dist < 20 * n.scale) {
          const original = nodes.find(orig => orig.id === n.id);
          if (original) {
            onDoubleClickNode?.(original);
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
    canvas.addEventListener("dblclick", onDblClick);
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
        const x1 = nx * Math.cos(radY) - nz * Math.sin(radY);
        const z1 = nx * Math.sin(radY) + nz * Math.cos(radY);

        // Rotate X
        const y1 = ny * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = ny * Math.sin(radX) + z1 * Math.cos(radX);

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
          ctx.fillStyle = theme === "light" ? "rgba(0, 0, 0, 0.55)" : "rgba(255, 255, 255, 0.45)";
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
      canvas.removeEventListener("dblclick", onDblClick);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [nodes, links, onSelectNode, onDoubleClickNode, theme]);

  const originalCoords = useRef<Record<string, { x: number; y: number }>>({});
  const projectedNodesRef = useRef<ProjectedNode[]>([]);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-pointer" />;
}

// --- CONSCIOUS STUDENT DASHBOARD ---
export default function DashboardPage() {
  const { streak, dailyGoalProgress, weakTopics, nodes, setSelectedDocId } = useStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const activeNode = selectedNode || nodes[0];
  const router = useRouter();

  const handleStudyNode = (nodeId: string) => {
    setSelectedDocId(nodeId);
    router.push("/workspace");
  };

  const handleStudyWeakTopic = (topic: string) => {
    const matchedNode = nodes.find(n => 
      n.label.toLowerCase().includes(topic.toLowerCase())
    );
    if (matchedNode) {
      setSelectedDocId(matchedNode.id);
    }
    router.push("/workspace");
  };

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

      {/* Background ambient glows */}
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        
        {/* Core conscious 3-column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
          
          {/* COLUMN 1 — AI IDENTITY (col-span-3) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
            {/* AI Mentor Sync status */}
            <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card relative overflow-hidden space-y-4 matte-layer spatial-shadow-lg group">
              {/* Scan sweep line */}
              <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none" />
              <div className="absolute top-0 right-0 w-[100px] h-[100px] radial-glow opacity-20 pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400 animate-pulse border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                  <Brain className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">AskMe CLOS</h3>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest biometric-glow">Sync: Optimal</p>
                </div>
              </div>

              <div className="h-[1px] bg-white/5" />

              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.2em]">Focus State</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  &quot;Flow State active. Spaced repetition decay maps indicate review priority is concentrated in Electromagnetics.&quot;
                </p>
              </div>

              <div className="h-[1px] bg-white/5" />

              {/* Streaks stats */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.2em]">Active Mission</span>
                <div className="flex items-center gap-1.5 text-orange-400 font-bold text-xs">
                  <Flame className="h-4 w-4 fill-current animate-pulse" />
                  <span className="biometric-glow">{streak}d Streak</span>
                </div>
              </div>
            </div>

            {/* Daily targets progress */}
            <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card space-y-4 matte-layer spatial-shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" />
                  Daily Sync Goal
                </span>
                <span className="text-xs text-primary dark:text-purple-400 font-extrabold">{dailyGoalProgress}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${dailyGoalProgress}%` }}
                />
              </div>
              <p className="text-[9px] text-zinc-500 leading-normal font-light">
                Ingest notes and solve doubts to reach 100% daily calibration.
              </p>
            </div>
          </div>

          {/* COLUMN 2 — COGNITIVE SPACE (col-span-6) */}
          <div className="lg:col-span-6 border border-white/5 bg-[#0d0d11]/50 rounded-3xl glass-card flex flex-col justify-between overflow-hidden relative min-h-[460px] p-6 matte-layer spatial-shadow-lg">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                <Activity className="h-4.5 w-4.5 text-primary" />
                Cognitive Topology Graph
              </h3>
              <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Drag to rotate • click node</span>
            </div>

            {/* Sticky 3D Graph Canvas */}
            <div className="flex-1 min-h-[260px] relative">
              <Custom3DCanvasDashboard onSelectNode={setSelectedNode} onDoubleClickNode={(node) => handleStudyNode(node.id)} />
            </div>

            {/* Node metadata info footer inside canvas card */}
            {activeNode && (
              <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between gap-4 animate-drift">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{activeNode.label}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block text-[8px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusColor(activeNode.status)}`}>
                      {activeNode.status}
                    </span>
                    <button
                      onClick={() => handleStudyNode(activeNode.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-primary hover:bg-primary/95 text-[9px] font-bold px-2.5 py-0.5 text-white transition-all shadow-md active:scale-95 duration-200 cursor-pointer"
                      title="Study this note's doubt solver chat session"
                    >
                      <span>Study Chat</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-primary dark:text-purple-400 font-extrabold">{activeNode.strength}% strength</span>
                  <p className="text-[9px] text-zinc-500 font-medium font-light">Memory decay speed: low</p>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 3 — ADAPTIVE INTELLIGENCE (col-span-3) */}
          <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
            {/* Weak topics predictions */}
            <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card space-y-5 matte-layer spatial-shadow-lg">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
                Decay Predictions
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {weakTopics.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-2">No critical memory decay predicted.</p>
                ) : (
                  weakTopics.slice(0, 3).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleStudyWeakTopic(topic)}
                      className="w-full flex items-center justify-between bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/25 rounded-xl p-3 text-xs text-rose-400 font-semibold shadow-[0_0_15px_rgba(244,63,94,0.03)] text-left transition-all cursor-pointer group active:scale-95 duration-200"
                      title={`Study ${topic} in Workspace`}
                    >
                      <span className="group-hover:text-rose-350 transition-colors">{topic}</span>
                      <span className="text-[9px] bg-rose-500/10 px-2 py-0.5 rounded-full font-bold biometric-glow group-hover:bg-rose-500/20 transition-all flex items-center gap-1 shrink-0">
                        <span>Priority</span>
                        <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Calibrations and focus analytics list */}
            <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card space-y-5 matte-layer spatial-shadow-lg">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Focus Calibrations
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400 font-light">Confidence Accuracy</span>
                  <span className="text-white font-mono font-bold">84%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400 font-light">Exam Readiness</span>
                  <span className="text-primary dark:text-purple-400 font-bold biometric-glow">88%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400 font-light">Spacing efficiency</span>
                  <span className="text-white font-mono font-bold">92%</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-2">
              <Link
                href="/workspace"
                className="w-full inline-flex items-center justify-between rounded-xl border border-white/5 bg-[#0d0d11]/90 hover:bg-[#121217] p-3.5 text-xs font-bold text-white transition-all duration-300 group spatial-shadow-lg matte-layer"
              >
                <span>Study Active Workspace</span>
                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-all group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
