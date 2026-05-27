"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore, GraphNode } from "@/lib/store";
import { 
  Activity, 
  Compass, 
  Info, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  Sliders, 
  Cpu, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";

// --- FULLSCREEN 3D PROJECTION CANVAS GRAPH ---
function Custom3DCanvasFullscreen({ 
  selectedNodeId, 
  onSelectNode 
}: { 
  selectedNodeId: string | null; 
  onSelectNode: (node: GraphNode) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { nodes, links, theme } = useStore();

  const originalCoords = useRef<Record<string, { x: number; y: number }>>({});
  const projectedNodesRef = useRef<any[]>([]);

  // Cache original node coords on mount
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
    const focalLength = 350;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : 600 * dpr;
      canvas.height = canvas.parentElement?.clientHeight ? canvas.parentElement.clientHeight * dpr : 450 * dpr;
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
        rotX.current -= dy * 0.3;
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
        if (dist < 22 * n.scale) {
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

      // Ambient rotation if not dragging
      if (!mouse.current.isDown) {
        rotY.current += 0.15;
      }

      const radY = rotY.current * Math.PI / 180;
      const radX = rotX.current * Math.PI / 180;

      // Project Nodes
      const projected = nodes.map(node => {
        const orig = originalCoords.current[node.id] || { x: 300, y: 220 };
        // Center around (425, 240) in full screen size
        const nx = orig.x - 425; 
        const ny = orig.y - 240;
        const nz = 0;

        // Rotate Y
        let x1 = nx * Math.cos(radY) - nz * Math.sin(radY);
        let z1 = nx * Math.sin(radY) + nz * Math.cos(radY);

        // Rotate X
        let y1 = ny * Math.cos(radX) - z1 * Math.sin(radX);
        let z2 = ny * Math.sin(radX) + z1 * Math.cos(radX);

        // Clip behind camera
        if (focalLength + z2 <= 30) {
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

      projectedNodesRef.current = projected;

      // Depth Sort
      projected.sort((a, b) => b.z2 - a.z2);

      // Draw Links
      ctx.shadowBlur = 0; 
      links.forEach(link => {
        const s = projected.find(n => n.id === link.source);
        const t = projected.find(n => n.id === link.target);
        if (s && t) {
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(t.px, t.py);
          ctx.strokeStyle = "rgba(168, 85, 247, 0.35)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Draw Nodes
      projected.forEach(node => {
        const isSelected = node.id === selectedNodeId;
        const radius = Math.max(1.5, (isSelected ? 9 : 5.5) * node.scale);
        
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);

        let strokeColor = "rgb(192, 132, 252)"; // Purple learning
        let fillColor = "rgba(192, 132, 252, 0.2)";

        if (node.status === "mastered") {
          strokeColor = "rgb(96, 165, 250)"; // Blue mastered
          fillColor = "rgba(96, 165, 250, 0.25)";
        } else if (node.status === "weak" || node.status === "forgotten") {
          strokeColor = "rgb(251, 113, 133)"; // Rose decaying
          fillColor = "rgba(251, 113, 133, 0.35)";
        }

        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = (isSelected ? 2.5 : 1.8) * node.scale;

        // Apply premium glow shadow
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = (isSelected ? 20 : 10) * node.scale;

        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset shadow

        // Visual pulsing ring for selected node
        if (isSelected) {
          const pulseRadius = radius + (Date.now() * 0.01) % 12;
          const alpha = 1 - (pulseRadius - radius) / 12;
          ctx.beginPath();
          ctx.arc(node.px, node.py, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${node.status === "mastered" ? "96, 165, 250" : "251, 113, 133"}, ${alpha * 0.4})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        // Label
        if (node.scale > 0.75) {
          ctx.fillStyle = isSelected 
            ? (theme === "light" ? "#000000" : "#ffffff") 
            : (theme === "light" ? "rgba(0, 0, 0, 0.55)" : "rgba(255, 255, 255, 0.55)");
          ctx.font = `${isSelected ? "bold" : "normal"} ${Math.round((isSelected ? 10 : 8) * node.scale)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.px, node.py + radius + (isSelected ? 14 : 11));
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
  }, [nodes, links, selectedNodeId, onSelectNode]);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-pointer" />;
}

export default function MemoryGraphPage() {
  const { nodes, links, updateNodeStrength } = useStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("n-1");
  const [forecastMode, setForecastMode] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const getStatusColor = (status: GraphNode["status"]) => {
    switch (status) {
      case "mastered": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "learning": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "weak": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "forgotten": return "text-red-400 bg-red-600/10 border-red-600/20";
      default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const handleSelectNode = (node: GraphNode) => {
    setSelectedNodeId(node.id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric ambient backdrop glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-wider mb-2">
              <Compass className="h-3 w-3 animate-spin [animation-duration:8s]" />
              <span>Cognitive Space Control</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white cinematic-title">Concept Memory Network Graph</h1>
            <p className="text-xs text-zinc-400 mt-1 font-light">Interactive three-dimensional topological mapping of your memory nodes and decay parameters.</p>
          </div>

          {/* Mode toggler */}
          <div className="inline-flex items-center gap-1 rounded-full border border-white/5 bg-[#09090b]/80 p-1.5 matte-layer">
            <button
              onClick={() => setForecastMode(false)}
              className={`rounded-full px-4.5 py-1.5 text-xs font-bold transition-all duration-300 ${
                !forecastMode
                  ? "bg-primary text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Active Strength
            </button>
            <button
              onClick={() => setForecastMode(true)}
              className={`rounded-full px-4.5 py-1.5 text-xs font-bold transition-all duration-300 flex items-center gap-1 ${
                forecastMode
                  ? "bg-primary text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Decay Forecast (14 Days)
            </button>
          </div>
        </div>

        {/* Graph Canvas Split Screen layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* 3D Graph Canvas (col-span-8) */}
          <div className="lg:col-span-8 border border-white/5 bg-[#0d0d11]/40 rounded-3xl glass-card relative overflow-hidden p-6 flex flex-col min-h-[460px] justify-between matte-layer spatial-shadow-lg">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />

            <div className="flex-1 min-h-[360px] relative">
              <Custom3DCanvasFullscreen 
                selectedNodeId={selectedNodeId} 
                onSelectNode={handleSelectNode} 
              />

              {/* Forecast Mode HUD indicator overlay */}
              {forecastMode && (
                <div className="absolute top-4 left-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse biometric-glow">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Memory Decay Forecast active</span>
                </div>
              )}
            </div>
          </div>

          {/* Node details panel (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">Node Calibration specs</h2>
            
            {selectedNode ? (
              <div className="border border-white/5 bg-[#0d0d11]/80 p-6 rounded-3xl glass-card space-y-6 matte-layer spatial-shadow-lg">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-20 pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white leading-snug">{selectedNode.label}</h3>
                    <span className="text-[9px] text-zinc-500 font-mono">ID: {selectedNode.id}</span>
                  </div>
                  <span className={`text-[9px] uppercase font-bold px-2.5 py-1 rounded-full border biometric-glow ${getStatusColor(selectedNode.status)}`}>
                    {selectedNode.status}
                  </span>
                </div>

                {/* Calibration progress bar info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-400 font-light">Memory Retrievability:</span>
                    <span className="text-primary dark:text-purple-400 font-bold biometric-glow">{selectedNode.strength}%</span>
                  </div>

                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${selectedNode.strength}%` }}
                    />
                  </div>
                </div>

                {/* simulated calibration sliders */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <h4 className="text-[9px] uppercase font-bold tracking-[0.2em] text-zinc-500 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-primary" />
                    Simulate Active Recall
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNodeStrength(selectedNode.id, -10)}
                      className="w-full rounded-xl border border-white/5 bg-[#0d0d11]/80 hover:bg-[#15151c] py-2.5 text-xs font-bold text-zinc-300 transition-all duration-300"
                    >
                      Decay (-10)
                    </button>
                    <button
                      onClick={() => updateNodeStrength(selectedNode.id, 15)}
                      className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-md duration-300"
                    >
                      Recall (+15)
                    </button>
                  </div>
                </div>

                {/* description / metadata info */}
                <div className="flex items-start gap-2.5 text-xs text-zinc-400 leading-normal bg-white/5 p-4 rounded-xl font-light">
                  <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Node connections are constructed automatically based on document semantic links and overlap variables. Click other nodes to check references.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 text-center py-10">Select a graph coordinate node to inspect parameters.</p>
            )}

            {/* Quick recommendation module */}
            <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-3xl glass-card space-y-4 matte-layer spatial-shadow-lg">
              <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-primary" />
                Autopilot Dispatcher
              </h3>
              <div className="space-y-3">
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 flex items-start gap-2 text-rose-400 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold">Critical review required</span>
                    <p className="text-[10px] text-zinc-500 font-light">Translations has decayed beneath the 40% memory retention boundary.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
