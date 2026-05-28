"use client";

import React, { useEffect, useRef } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { Activity, Target, ShieldCheck, Cpu } from "lucide-react";

// --- FUTURISTIC 8D RADAR CHART CANVAS COMPONENT ---
function CognitiveRadarChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { profile, theme } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : 380 * dpr;
      canvas.height = canvas.parentElement?.clientHeight ? canvas.parentElement.clientHeight * dpr : 380 * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    // The 8 traits to project
    const traits = [
      { key: "conceptual", label: "Conceptual Depth" },
      { key: "retention", label: "Memory Retention" },
      { key: "analytical", label: "Analytical Speed" },
      { key: "consistency", label: "Consistency" },
      { key: "discipline", label: "Discipline" },
      { key: "adaptability", label: "Adaptability" },
      { key: "calibration", label: "Calibration" },
      { key: "efficiency", label: "Efficiency" }
    ];

    const render = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.4;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Concentric Grid Rings
      ctx.shadowBlur = 0;
      const gridCount = 5;
      for (let i = 1; i <= gridCount; i++) {
        const r = (maxRadius / gridCount) * i;
        ctx.beginPath();
        
        // Draw Octagon Grid
        for (let j = 0; j < 8; j++) {
          const angle = (j * Math.PI) / 4 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = i === gridCount ? "rgba(139, 92, 246, 0.25)" : (theme === "light" ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.04)");
        ctx.lineWidth = 1;
        ctx.stroke();

        // Print Grid Percentage values
        ctx.fillStyle = theme === "light" ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.15)";
        ctx.font = "8px monospace";
        ctx.fillText(`${i * 20}%`, cx - 10, cy - r + 3);
      }

      // 2. Draw Axes lines
      for (let j = 0; j < 8; j++) {
        const angle = (j * Math.PI) / 4 - Math.PI / 2;
        const x = cx + maxRadius * Math.cos(angle);
        const y = cy + maxRadius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = theme === "light" ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)";
        ctx.stroke();
      }

      // 3. Draw Sweeping Scanner Line
      sweepAngle += 0.015;
      const scanX = cx + maxRadius * Math.cos(sweepAngle);
      const scanY = cy + maxRadius * Math.sin(sweepAngle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(scanX, scanY);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw faint scan glow sweep wedge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, sweepAngle - 0.2, sweepAngle, false);
      ctx.closePath();
      ctx.fillStyle = "rgba(139, 92, 246, 0.03)";
      ctx.fill();

      // 4. Map & Draw Cognitive Profile Shape
      const coords = traits.map((t, idx) => {
        const angle = (idx * Math.PI) / 4 - Math.PI / 2;
        const value = (profile as unknown as Record<string, number>)[t.key] || 50;
        const r = (value / 100) * maxRadius;
        return {
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle)
        };
      });

      // Fill Area
      ctx.beginPath();
      coords.forEach((coord, idx) => {
        if (idx === 0) ctx.moveTo(coord.x, coord.y);
        else ctx.lineTo(coord.x, coord.y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(139, 92, 246, 0.25)";
      ctx.fill();

      ctx.strokeStyle = "rgb(168, 85, 247)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgb(168, 85, 247)";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset

      // Draw Glowing Trait Nodes
      coords.forEach((coord) => {
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "rgb(168, 85, 247)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgb(168, 85, 247)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 5. Draw Labels around chart
      traits.forEach((t, idx) => {
        const angle = (idx * Math.PI) / 4 - Math.PI / 2;
        const labelRadius = maxRadius + 18;
        const x = cx + labelRadius * Math.cos(angle);
        const y = cy + labelRadius * Math.sin(angle);
        const val = (profile as unknown as Record<string, number>)[t.key] || 50;

        ctx.fillStyle = theme === "light" ? "rgba(0, 0, 0, 0.65)" : "rgba(255, 255, 255, 0.65)";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${t.label} (${val}%)`, x, y);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [profile, theme]);

  return <canvas ref={canvasRef} className="w-full h-full block touch-none" />;
}

export default function DnaPage() {
  const { profile } = useStore();

  const dnaMetrics = [
    { name: "Conceptual Depth", val: profile.conceptual, desc: "Abstract logic and theory mapping speeds." },
    { name: "Memory Retention", val: profile.retention, desc: "Resistance to cognitive forgetting curves." },
    { name: "Analytical Speed", val: profile.analytical, desc: "Quantitative and mathematical calculation precision." },
    { name: "Study Consistency", val: profile.consistency, desc: "Streak preservation and regular revision spacing." },
    { name: "Autopilot Discipline", val: profile.discipline, desc: "Adherence to spacing calendar notifications." },
    { name: "Calibration Accuracy", val: profile.calibration, desc: "Awareness of actual mastery vs confidence guesses." },
    { name: "Adaptability Index", val: profile.adaptability, desc: "Adjustment to difficult assessments." },
    { name: "Cognitive Efficiency", val: profile.efficiency, desc: "Ratio of correct answers relative to time spent." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Atmospheric ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Biometric Signature Scan</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white cinematic-title">
            Your Personal Learning DNA
          </h1>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto font-light leading-relaxed">
            CLOS neural engine maps 8 dimensions of study performance, dynamically adjusting your cognitive profile indices on every interaction.
          </p>
        </div>

        {/* Radar & Archetype Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Holographic Radar Chart Panel (col-span-7) */}
          <div className="lg:col-span-7 border border-white/5 bg-[#0d0d11]/40 rounded-3xl p-6 glass-card flex flex-col justify-between items-center relative overflow-hidden matte-layer spatial-shadow-lg min-h-[420px]">
            {/* Scanner line overlay effect */}
            <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none" />
            <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              <Cpu className="h-4 w-4 text-primary animate-pulse" />
              <span>Biometric Sweep Radar</span>
            </div>

            <div className="w-full h-full max-w-[380px] max-h-[380px] flex items-center justify-center relative mt-6">
              <CognitiveRadarChart />
            </div>
          </div>

          {/* Archetype Profile Card & Info (col-span-5) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="border border-white/5 bg-[#0d0d11]/80 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col justify-between relative overflow-hidden matte-layer spatial-shadow-lg flex-1">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />
              
              <div className="space-y-4">
                <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary dark:text-purple-400 bg-primary/10 px-3 py-1 rounded-full inline-block biometric-glow">
                  Cognitive Archetype
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">{profile.archetype}</h2>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  {profile.description}
                </p>
              </div>

              <div className="border-t border-white/5 pt-6 mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500 font-light">Engine Calibration State:</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider biometric-glow">Optimal</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-500 font-light">XP Calibrated:</span>
                  <span className="text-white font-mono font-bold">395 XP</span>
                </div>
              </div>
            </div>

            {/* Technical Calibration banner */}
            <div className="bg-[#0b0b0e]/90 border border-white/5 p-5 rounded-2xl flex items-center gap-3.5 text-xs text-zinc-400 matte-layer spatial-shadow-lg font-light leading-relaxed">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <span>
                This cognitive blueprint is stored locally and calibrated dynamically when you solve doubts, flip active flashcards, and submit quiz answers.
              </span>
            </div>
          </div>

        </div>

        {/* 8D Metrics Progress Grid */}
        <div className="border border-white/5 bg-[#0d0d11]/40 p-6 rounded-3xl glass-card space-y-6 matte-layer spatial-shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Target className="h-4.5 w-4.5 text-primary" />
              Cognitive Trait Coordinates
            </h3>
            <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Calibrations updated live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dnaMetrics.map((metric) => (
              <div key={metric.name} className="space-y-3.5 border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card transition-all hover:border-primary/20 duration-300">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-300 font-light">{metric.name}</span>
                  <span className="text-primary dark:text-purple-400 font-bold biometric-glow">{metric.val}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${metric.val}%` }}
                  />
                </div>

                <p className="text-[10px] text-zinc-500 leading-normal font-light">{metric.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
