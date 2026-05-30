"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore } from "@/lib/store";
import { 
  AlertCircle, 
  ArrowRight, 
  BarChart, 
  Activity, 
  LineChart, 
  Sparkles, 
  TrendingUp, 
  Cpu 
} from "lucide-react";
import Link from "next/link";

// --- ANIMATED FOCUS WAVE SIMULATOR (HTML5 CANVAS SINE MATH) ---
function FocusWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : 500 * dpr;
      canvas.height = 120 * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      // Draw focus sine waves (2 overlapping waves for rich depth)
      offset += 0.03;

      ctx.shadowBlur = 0;
      
      // Wave 1 (Deep Purple Focus Wave)
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.015 + offset) * 20 + Math.cos(x * 0.005 + offset * 0.5) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Wave 2 (Indigo Phase shift)
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.cos(x * 0.02 - offset) * 15 + Math.sin(x * 0.007 - offset * 0.4) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(96, 165, 250, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-[120px] block" />;
}

// --- COGNITIVE VOXEL GRID ---
function CognitiveVoxelGrid() {
  // Renders a grid of 64 voxel channels pulsing with random intensities
  const [voxels] = useState(() => Array.from({ length: 64 }, () => Math.random()));

  return (
    <div className="grid grid-cols-8 gap-1.5 w-full max-w-[240px] mx-auto p-4 border border-white/5 bg-[#09090b]/80 rounded-2xl relative overflow-hidden">
      <div className="absolute inset-x-0 h-full w-full scanner-sweep pointer-events-none opacity-40" />
      {voxels.map((initialIntensity, idx) => {
        const delay = (idx % 8) * 150 + Math.floor(idx / 8) * 100;
        return (
          <div
            key={idx}
            className="aspect-square rounded-[3px] transition-colors duration-1000 animate-pulse border border-white/[0.02]"
            style={{
              animationDelay: `${delay}ms`,
              backgroundColor: initialIntensity > 0.5 
                ? `rgba(168, 85, 247, ${0.15 + (initialIntensity * 0.3)})` 
                : `rgba(96, 165, 250, ${0.1 + (initialIntensity * 0.25)})`
            }}
          />
        );
      })}
    </div>
  );
}

// --- SYSTEM TELEMETRY ROLL GRAPH CANVAS ---
function TelemetryChartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dataPoints = useRef<{ sessions: number; tokens: number }[]>([]);

  useEffect(() => {
    // Generate initial history points
    const points = Array.from({ length: 40 }, (_, idx) => ({
      sessions: 30 + Math.floor(Math.sin(idx * 0.4) * 8) + Math.floor(Math.random() * 3),
      tokens: 2000 + Math.floor(Math.cos(idx * 0.3) * 600) + Math.floor(Math.random() * 200)
    }));
    dataPoints.current = points;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.parentElement?.clientWidth ? canvas.parentElement.clientWidth * dpr : 600 * dpr;
      canvas.height = 160 * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      tick++;
      if (tick % 60 === 0) {
        // Roll data points leftward
        dataPoints.current.shift();
        const last = dataPoints.current[dataPoints.current.length - 1];
        dataPoints.current.push({
          sessions: Math.max(10, Math.min(60, last.sessions + (Math.random() > 0.5 ? 2 : -2))),
          tokens: Math.max(800, Math.min(5000, last.tokens + (Math.random() > 0.5 ? 150 : -150)))
        });
      }

      // Draw Grid Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 0.5;
      const gridRows = 4;
      for (let i = 0; i <= gridRows; i++) {
        const y = (height / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const gridCols = 8;
      for (let i = 0; i <= gridCols; i++) {
        const x = (width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const pointsCount = dataPoints.current.length;
      const stepX = width / (pointsCount - 1);

      // Plot Token Rate Line (Blue)
      ctx.beginPath();
      dataPoints.current.forEach((pt, idx) => {
        const y = height - (pt.tokens / 6000) * (height - 20) - 10;
        const x = idx * stepX;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(96, 165, 250, 0.75)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Plot Active Sessions Line (Purple)
      ctx.beginPath();
      dataPoints.current.forEach((pt, idx) => {
        const y = height - (pt.sessions / 80) * (height - 20) - 10;
        const x = idx * stepX;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "rgba(168, 85, 247, 0.75)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-[160px] block" />;
}

// --- SYSTEM TELEMETRY CONTROL PANEL ---
function SystemTelemetryPanel() {
  const [activeSessions, setActiveSessions] = useState(38);
  const [tokenRate, setTokenRate] = useState(2850);
  const [latency, setLatency] = useState(142);
  const [blockedThreats] = useState(3);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Generate initial live telemetry logs
    setTimeout(() => {
      setLogs([
        `[INFO] [${new Date().toLocaleTimeString()}] Telemetry autopilot warm container initialized.`,
        `[INFO] [${new Date().toLocaleTimeString()}] Secure Edge RAG streaming tunnels operational.`,
        `[SEC] [${new Date().toLocaleTimeString()}] Parameters injection scanners verified 100% immune.`
      ]);
    }, 0);

    const interval = setInterval(() => {
      setActiveSessions(prev => Math.max(10, Math.min(80, prev + (Math.random() > 0.5 ? 1 : -1))));
      setTokenRate(prev => Math.max(500, Math.min(5000, prev + (Math.random() > 0.5 ? 80 : -80))));
      setLatency(prev => Math.max(80, Math.min(300, prev + (Math.random() > 0.5 ? 5 : -5))));

      const events = [
        "Edge response Warm Container DNS resolved in 44ms.",
        "Checked rate-limiter credits: Client IP remains under quota restrictions.",
        "EMBEDDINGS NORMALIZATION: Outbound vector aligned to 768 dimensions.",
        "Supabase PostgREST audit passed: zero parameterized vulnerabilities found.",
        "Active session heartbeat packet broadcast successfully.",
        "Clickjacking prevention check: Frame options headers block DENY active."
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [
        `[INFO] [${new Date().toLocaleTimeString()}] ${randomEvent}`,
        ...prev.slice(0, 7)
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Real-time counters row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Active Session Volume", value: `${activeSessions} active`, sub: "Unique client connections" },
          { label: "Token Consumption", value: `${tokenRate.toLocaleString()} tokens/min`, sub: "Outbound prompt stream" },
          { label: "Avg Edge Latency", value: `${latency} ms`, sub: "DNS & API warm gateways" },
          { label: "Threat Mitigations", value: `${blockedThreats} events`, sub: "DoS & SQL Injection blocked" }
        ].map((item, idx) => (
          <div key={idx} className="border border-white/5 bg-[#0d0d11]/80 rounded-2xl p-5 glass-card space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">{item.label}</span>
            <div className="text-lg font-extrabold text-white font-mono biometric-glow">{item.value}</div>
            <span className="text-[8px] text-zinc-500 block leading-none pt-0.5">{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Real-time chart panel */}
      <div className="border border-white/5 bg-[#0d0d11]/80 rounded-3xl p-6 glass-card relative overflow-hidden flex flex-col justify-between matte-layer spatial-shadow-lg min-h-[260px]">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <LineChart className="h-4.5 w-4.5 text-primary" />
            Live Rolling System Load Telemetry
          </h3>
          <div className="flex items-center gap-4 text-[8px] font-bold font-mono">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Token consumption rate</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Active user sessions</span>
          </div>
        </div>

        <div className="py-4">
          <TelemetryChartCanvas />
        </div>
      </div>

      {/* Security Health Log Console */}
      <div className="border border-white/5 bg-[#070709]/90 rounded-2xl p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-primary animate-pulse" /> Real-time active security health log
          </span>
          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">
            Live Stream
          </span>
        </div>

        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin text-[9px] text-zinc-400 font-light select-text selection:bg-primary/25">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2 hover:bg-white/[0.02] p-1 rounded transition-colors">
              <span className="text-primary select-none shrink-0">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { weakTopics } = useStore();
  const [activeTab, setActiveTab] = useState<"cognitive" | "system">("cognitive");

  const analyticsTopics = [
    { name: "Coulomb's Law", score: 88, status: "mastered", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
    { name: "DNA Replication", score: 80, status: "learning", color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
    { name: "Transcription", score: 70, status: "learning", color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
    { name: "Electric Potential", score: 40, status: "weak", color: "border-rose-500/20 bg-rose-500/5 text-rose-400" },
    { name: "Translation", score: 35, status: "weak", color: "border-rose-500/20 bg-rose-500/5 text-rose-400" },
    { name: "Gauss's Law", score: 25, status: "forgotten", color: "border-rose-500/20 bg-rose-500/5 text-rose-400" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-purple-400 uppercase tracking-widest biometric-glow mb-2">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Cognitive Observatory Data</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white cinematic-title">Cognitive Intelligence Observatory</h1>
          <p className="text-xs text-zinc-400 mt-1 font-light">Real-time tracking of memory decay curves, alpha focus calibrations, and syllabus masteries.</p>
        </div>

        {/* Premium segmented tab navigation */}
        <div className="flex border-b border-white/5 pb-3">
          <div className="flex gap-2 p-1 bg-[#0d0d11]/80 border border-white/5 rounded-2xl select-none">
            <button
              type="button"
              onClick={() => setActiveTab("cognitive")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "cognitive"
                  ? "bg-primary text-white border border-primary/20 shadow-md"
                  : "text-zinc-400 hover:text-white bg-transparent border border-transparent"
              }`}
            >
              🧠 Cognitive Observatory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("system")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "system"
                  ? "bg-primary text-white border border-primary/20 shadow-md"
                  : "text-zinc-400 hover:text-white bg-transparent border border-transparent"
              }`}
            >
              🛡️ System Telemetry & Security
            </button>
          </div>
        </div>

        {activeTab === "cognitive" ? (
          <div className="space-y-8 animate-fade-in">
            {/* Dynamic Focus Wave and Voxel grid (observatory centerpiece) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Wave simulator (col-span-8) */}
              <div className="lg:col-span-8 border border-white/5 bg-[#0d0d11]/80 rounded-3xl p-6 glass-card relative overflow-hidden flex flex-col justify-between matte-layer spatial-shadow-lg min-h-[220px]">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <LineChart className="h-4.5 w-4.5 text-primary" />
                    Alpha Rhythm Focus Wave
                  </h3>
                  <span className="text-[9px] text-emerald-400 font-mono biometric-glow uppercase tracking-wider font-bold">Calibration: Active</span>
                </div>

                <div className="py-4">
                  <FocusWaveCanvas />
                </div>

                <div className="text-[10px] text-zinc-500 font-light leading-normal">
                  Active amplitude represents conceptual retention calibrations over spacing iterations. Wave sync matches peak study efficiency cycles.
                </div>
              </div>

              {/* Voxel grid (col-span-4) */}
              <div className="lg:col-span-4 border border-white/5 bg-[#0d0d11]/80 rounded-3xl p-6 glass-card relative overflow-hidden flex flex-col justify-between items-center matte-layer spatial-shadow-lg min-h-[220px]">
                <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  <Cpu className="h-4 w-4 text-primary animate-pulse" />
                  <span>Cognitive Voxel Pulse</span>
                </div>
                
                <div className="w-full flex items-center justify-center py-2 mt-4">
                  <CognitiveVoxelGrid />
                </div>
              </div>
            </div>

            {/* Top summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Analysis Card */}
              <div className="border border-white/5 bg-[#0d0d11]/80 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between matte-layer spatial-shadow-lg">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-20 pointer-events-none" />
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-primary" />
                    Active Recall Calibration Log
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    Your conceptual retention is calibrated at <strong className="text-white font-mono biometric-glow">74% average</strong>. Spaced repetition schedules have queued <strong className="text-white font-mono font-semibold">3 topics</strong> for immediate active review to prevent memory decay.
                  </p>
                </div>
              </div>

              {/* Warning Card */}
              <div className="border border-white/5 bg-[#0d0d11]/80 p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between matte-layer spatial-shadow-lg">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-20 pointer-events-none" />
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-500 animate-bounce" />
                    Decay Alerts (Priority Review)
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    We detected conceptual retrieval failure on <strong className="text-white font-semibold">Translation</strong> and <strong className="text-white font-semibold">Electric Potential</strong> in your recent assessments. We suggest starting a Reverse Teacher active recall session to restore mastery.
                  </p>
                </div>
              </div>
            </div>

            {/* Heatmap Grid of Topics */}
            <div className="border border-white/5 bg-[#0d0d11]/40 p-6 rounded-3xl glass-card space-y-6 matte-layer spatial-shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <BarChart className="h-4.5 w-4.5 text-primary" />
                  Syllabus Concept Calibration Grid
                </h3>
                <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Calibrated by quiz scores</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsTopics.map((topic) => (
                  <div
                    key={topic.name}
                    className={`rounded-2xl border p-5 glass-card flex flex-col justify-between gap-4 transition-all duration-300 hover:scale-[1.02] ${topic.color} matte-layer`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide">{topic.name}</h4>
                      <span className="text-[8px] uppercase font-bold tracking-wider opacity-85 mt-1 block biometric-glow">
                        {topic.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-current/10 pt-3 text-xs">
                      <span className="opacity-80 font-light">Recall Calibration:</span>
                      <span className="font-bold font-mono">{topic.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated Revision Planner output */}
            <div className="border border-white/5 bg-[#0d0d11]/40 p-6 rounded-3xl glass-card space-y-6 matte-layer spatial-shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                  Automated Revision Autopilot Actions
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {weakTopics.map((topic, idx) => (
                  <div 
                    key={idx}
                    className="rounded-2xl border border-white/5 bg-[#0d0d11]/80 p-5 text-xs font-semibold text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 hover:border-primary/20"
                  >
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full inline-block biometric-glow">
                        Revision Priority {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">Review: {topic}</h4>
                      <p className="text-zinc-500 font-medium font-light leading-normal">Identified weakness in quiz answers. Complete a 15-minute doubt solver session.</p>
                    </div>
                    <Link
                      href="/workspace"
                      className="inline-flex items-center gap-1.5 text-primary dark:text-purple-400 font-bold hover:underline shrink-0 text-xs bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-xl transition-all hover:bg-primary/20"
                    >
                      <span>Launch Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <SystemTelemetryPanel />
        )}

      </main>

      <Footer />
    </div>
  );
}
