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
  ArrowRight,
  Search,
  Bell,
  Sparkles,
  Calendar,
  Send,
  BarChart2,
  TrendingUp,
  Award,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart as RechartsBarChart, 
  Bar,
  Cell
} from "recharts";

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
  const originalCoords = useRef<Record<string, { x: number; y: number }>>({});
  const projectedNodesRef = useRef<ProjectedNode[]>([]);

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

  return <canvas ref={canvasRef} className="w-full h-full block touch-none cursor-pointer" />;
}

// --- CONSCIOUS STUDENT DASHBOARD ---
export default function DashboardPage() {
  const { 
    streak, 
    dailyGoalProgress, 
    weakTopics, 
    nodes, 
    setSelectedDocId, 
    documents,
    profile,
    planner
  } = useStore();
  
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<"analytical" | "cognitive">("analytical");
  const [tutorQuery, setTutorQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
        <Navbar />
        <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-breathe" />
        <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

        <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative z-10">
          <div className="flex flex-col items-center justify-center text-center gap-6 max-w-md p-8 bg-[#0d0d11]/80 border border-white/5 rounded-3xl glass-card relative overflow-hidden shadow-2xl matte-layer">
            <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none opacity-20" />
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400 border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.2)] animate-pulse">
              <Brain className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold text-white cinematic-title uppercase tracking-wide">Your Cognitive OS is Ready</h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Upload your first study document to activate your AI tutor, concept memory graph, and Learning DNA profile.
            </p>
            <div className="flex flex-col gap-3.5 w-full">
              <Link 
                href="/upload" 
                className="py-3.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/95 transition-all text-center glowing-border cursor-pointer shadow-md"
              >
                📄 Upload First Document
              </Link>
              <Link 
                href="/workspace" 
                className="py-3.5 bg-white/5 border border-white/10 text-zinc-350 hover:text-white hover:bg-white/10 rounded-xl font-bold text-xs transition-all text-center cursor-pointer"
              >
                🎮 Try Live Demo First
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleStudyNode = (nodeId: string) => {
    setSelectedDocId(nodeId);
    const matchedDoc = documents.find(d => d.id === nodeId);
    const docTitle = matchedDoc ? matchedDoc.title : "this topic";
    router.push(`/workspace?docId=${nodeId}&query=Let's discuss the concepts in ${encodeURIComponent(docTitle)}&autoSend=true`);
  };

  const handleStudyWeakTopic = (topic: string) => {
    const matchedNode = nodes.find(n => 
      n.label.toLowerCase().includes(topic.toLowerCase())
    );
    if (matchedNode) {
      setSelectedDocId(matchedNode.id);
      router.push(`/workspace?docId=${matchedNode.id}&query=Let's focus on revision for ${encodeURIComponent(topic)}&autoSend=true`);
    } else {
      const activeDocId = documents[0]?.id || "";
      router.push(`/workspace?docId=${activeDocId}&query=Let's focus on revision for ${encodeURIComponent(topic)}&autoSend=true`);
    }
  };

  const handleTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim()) return;
    const activeDocId = documents[0]?.id || "";
    router.push(`/workspace?docId=${activeDocId}&query=${encodeURIComponent(tutorQuery)}&autoSend=true`);
  };

  const handlePillClick = (topic: string) => {
    const activeDocId = documents[0]?.id || "";
    router.push(`/workspace?docId=${activeDocId}&query=${encodeURIComponent(topic)}&autoSend=true`);
  };

  const activeNode = selectedNode || nodes[0];

  const getStatusColor = (status: GraphNode["status"]) => {
    switch (status) {
      case "mastered": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "learning": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "weak": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  // --- ANALYTICAL DASHBOARD DATA ---
  
  // Weekly progress spline area chart (overlapping Knowledge Gained & Quizzes Completed)
  const weeklyProgressData = [
    { day: "Sun", knowledge: 12, quizzes: 8 },
    { day: "Mon", knowledge: 48, quizzes: 36 },
    { day: "Tue", knowledge: 38, quizzes: 32 },
    { day: "Wed", knowledge: 82, quizzes: 65 },
    { day: "Thu", knowledge: 58, quizzes: 55 },
    { day: "Fri", knowledge: 72, quizzes: 70 },
    { day: "Sat", knowledge: 88, quizzes: 78 }
  ];

  // Overall Focus Score sparkline
  const sparklineData = [
    { name: "1", val: 80 },
    { name: "2", val: 85 },
    { name: "3", val: 82 },
    { name: "4", val: 94 },
    { name: "5", val: 89 },
    { name: "6", val: 92 },
    { name: "7", val: 92 }
  ];

  // Double vertical comparative bar chart
  const studyMetricsData = [
    { name: "Time Studied", Target: 85, Actual: 36 },
    { name: "Points Earned", Target: 65, Actual: 32 },
    { name: "Accuracy", Target: 78, Actual: 18 }
  ];

  // SVG Streak Ring variables
  const streakDays = streak || 14;
  const streakPercent = dailyGoalProgress || 75;
  const radius = 24;
  const strokeWidth = 4.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (streakPercent / 100) * circumference;

  // Upcoming deadlines (integrated from planner or mock deadlines)
  const staticDeadlines = [
    { type: "Exam", topic: "Biology (Metabolism)", date: "Oct 28", tag: "Tags", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
    { type: "Assignment", topic: "History (Civil War)", date: "Oct 30", tag: "Tags", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
    { type: "Quiz", topic: "Physics (Gravity)", date: "Nov 2", tag: "Tags", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" }
  ];

  const displayDeadlines = planner.length > 0 
    ? planner.slice(0, 3).map(item => ({
        type: item.isUrgent ? "Exam" : "Assignment",
        topic: item.title,
        date: item.date || "Soon",
        tag: "Tags",
        color: item.isUrgent 
          ? "bg-purple-500/10 border-purple-500/20 text-purple-400" 
          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
      }))
    : staticDeadlines;

  const renderSparkline = () => {
    if (!mounted) return null;
    return (
      <ResponsiveContainer width="100%" height={32}>
        <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id="glowBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke="#3b82f6" 
            strokeWidth={1.5}
            fill="url(#glowBlue)" 
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = () => {
    if (!mounted) return null;
    return (
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={weeklyProgressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
          <XAxis 
            dataKey="day" 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={8}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            domain={[0, 100]}
            tickCount={5}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255, 255, 255, 0.08)", borderRadius: "12px" }}
            labelStyle={{ fontSize: "10px", color: "#a1a1aa", fontWeight: "bold", textTransform: "uppercase" }}
            itemStyle={{ fontSize: "12px", color: "#fff" }}
          />
          <Area 
            name="Knowledge Gained"
            type="monotone" 
            dataKey="knowledge" 
            stroke="#a855f7" 
            strokeWidth={2}
            fill="url(#purpleGlow)" 
            activeDot={{ r: 5, strokeWidth: 1, stroke: "#fff" }}
          />
          <Area 
            name="Quizzes Completed"
            type="monotone" 
            dataKey="quizzes" 
            stroke="#3b82f6" 
            strokeWidth={1.5}
            fill="url(#blueGlow)" 
            activeDot={{ r: 4, strokeWidth: 1, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    if (!mounted) return null;
    return (
      <ResponsiveContainer width="100%" height={160}>
        <RechartsBarChart data={studyMetricsData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.02)" />
          <XAxis 
            dataKey="name" 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={8}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            domain={[0, 100]}
            tickCount={5}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255, 255, 255, 0.08)", borderRadius: "12px" }}
            itemStyle={{ fontSize: "11px", color: "#fff" }}
          />
          <Bar 
            dataKey="Target" 
            fill="url(#blueBarGlow)" 
            radius={[4, 4, 0, 0]}
            maxBarSize={14}
          >
            {studyMetricsData.map((entry, index) => (
              <Cell key={`cell-target-${index}`} fill="url(#blueBarGlow)" />
            ))}
          </Bar>
          <Bar 
            dataKey="Actual" 
            fill="url(#purpleBarGlow)" 
            radius={[4, 4, 0, 0]}
            maxBarSize={14}
          >
            {studyMetricsData.map((entry, index) => (
              <Cell key={`cell-actual-${index}`} fill="url(#purpleBarGlow)" />
            ))}
          </Bar>
          <defs>
            <linearGradient id="purpleBarGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="blueBarGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#040406] text-white neural-overlay relative select-none">
      <Navbar />

      {/* Background ambient glows */}
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-primary/5 rounded-full filter blur-[100px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full filter blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 relative z-10 space-y-6">
        
        {/* PREMIUM METRIC HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400">
                Cognitive OS Platform
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white cinematic-title flex items-center gap-2">
              Study Dashboard
            </h1>
          </div>

          {/* User Profile display, alerts, search icons & View Mode Toggle */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            
            {/* Elegant View Toggle */}
            <div className="flex bg-[#0a0a0f] border border-white/5 rounded-xl p-1 text-[11px] font-bold">
              <button 
                onClick={() => setViewMode("analytical")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "analytical" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-zinc-400 hover:text-white"}`}
              >
                📊 Analytical
              </button>
              <button 
                onClick={() => setViewMode("cognitive")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "cognitive" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-zinc-400 hover:text-white"}`}
              >
                🧠 Cognitive Graph
              </button>
            </div>

            {/* Profile & Notifications mock */}
            <div className="flex items-center gap-3">
              <div className="p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/5 relative">
                <Bell className="h-4.5 w-4.5 text-zinc-400" />
                <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-rose-500 border-2 border-[#040406] text-[8px] flex items-center justify-center font-bold">2</span>
              </div>
              
              <div className="p-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/5">
                <Search className="h-4.5 w-4.5 text-zinc-400" />
              </div>

              <div className="flex items-center gap-2.5 border-l border-white/5 pl-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-xs uppercase text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]">
                  {profile.full_name?.substring(0, 2) || "AJ"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-none text-white">{profile.full_name || "Alex Johnson"}</p>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">Premium Student</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONDITION VIEW DISPATCH */}
        {viewMode === "analytical" ? (
          <div className="space-y-6">
            
            {/* ROW 1: Streaks, Focus Score & Next Session */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Streak */}
              <div className="border border-white/5 bg-[#0d0d12]/80 p-5 rounded-2xl glass-card relative overflow-hidden flex items-center justify-between group transition-all duration-300 hover:border-white/10 hover:shadow-xl shadow-black/40">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Current Study Streak</span>
                  <div className="text-3xl font-extrabold text-white cinematic-title tracking-wide leading-none py-1">
                    {streakDays} Days
                  </div>
                  <span className="text-[10px] text-zinc-400 font-light flex items-center gap-1">
                    Progress circle <span className="text-purple-400 font-bold font-mono">+2 daily</span>
                  </span>
                </div>

                {/* SVG Circular Streak Indicator */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="url(#streakPinkGlow)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="streakPinkGlow" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-[10px] font-bold text-purple-300 font-mono">+{streakDays}</span>
                </div>
              </div>

              {/* Card 2: Overall Focus Score */}
              <div className="border border-white/5 bg-[#0d0d12]/80 p-5 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:border-white/10 hover:shadow-xl shadow-black/40">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Overall Focus Score</span>
                    <div className="text-3xl font-extrabold text-white cinematic-title tracking-wide leading-none py-1">
                      {profile.efficiency || 92}%
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono biometric-glow shrink-0">
                    Excellent
                  </span>
                </div>
                
                {/* Mini-sparkline graph */}
                <div className="w-full mt-3 h-8">
                  {renderSparkline()}
                </div>
                <div className="text-[8px] text-zinc-500 font-medium font-mono uppercase tracking-wider pt-2 flex justify-between">
                  <span>Progress Store</span>
                  <span>Calibrated</span>
                </div>
              </div>

              {/* Card 3: Next Study Session */}
              <div 
                onClick={() => {
                  if (documents[0]) {
                    handleStudyNode(documents[0].id);
                  }
                }}
                className="border border-purple-500/30 bg-[#0e0a16]/65 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.18)] cursor-pointer"
              >
                {/* Glowing top-right badge */}
                <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-purple-500/10 rounded-full filter blur-xl pointer-events-none" />
                
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider block">Next Study Session</span>
                  <h3 className="text-xl font-black text-white leading-tight truncate py-0.5">
                    {documents[0]?.title || "Bio 101"}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium font-mono">
                    <span>2:00 PM</span>
                    <span className="text-zinc-600">•</span>
                    <span>1h 30m</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 font-mono uppercase">
                    <span>Focus Zone</span>
                    <span className="text-purple-300">85%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Learning Progress spline area chart & AI Insights side panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Spline Area Chart (col-span-8) */}
              <div className="lg:col-span-8 border border-white/5 bg-[#0d0d12]/80 p-6 rounded-3xl glass-card relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block">Learning Progress Overview</span>
                    <div className="text-3xl font-extrabold text-white cinematic-title leading-tight mt-1">
                      {profile.calibration || 78}%
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3 text-[9px] font-bold font-mono">
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" /> Knowledge Gained</span>
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" /> Quizzes Completed</span>
                    </div>
                    <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-zinc-350 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                      Weekly Progress
                    </button>
                  </div>
                </div>

                <div className="w-full flex-1 min-h-[220px]">
                  {renderAreaChart()}
                </div>
              </div>

              {/* AI Insights & Summary Panel (col-span-4) */}
              <div className="lg:col-span-4 border border-white/5 bg-[#0d0d12]/80 p-6 rounded-3xl glass-card relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/40">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                      AI Insights & Summary
                    </h3>
                    <span className="text-[8px] font-mono text-zinc-500">Live Calibration</span>
                  </div>

                  <div className="space-y-3.5 text-xs text-zinc-300 font-light leading-relaxed">
                    <p>
                      Based on recent sessions, focus on <strong className="text-white font-semibold">{weakTopics[0] || "Biology (Metabolism)"}</strong>.
                    </p>
                    <p>
                      Flashcards suggested for <strong className="text-white font-semibold">Chemistry</strong>.
                    </p>
                    
                    <div className="bg-purple-500/5 border border-purple-500/10 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-purple-300">Overall efficiency</span>
                      <span className="text-emerald-400 font-bold font-mono">+15%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-6 border-t border-white/5">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 font-mono uppercase">
                    <span>Focus Zone</span>
                    <span className="text-purple-300">85%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: Study Metrics bar chart, Deadlines, & AskMe AI Tutor panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* Card 1: Study Metrics dual-bar chart */}
              <div className="border border-white/5 bg-[#0d0d12]/80 p-5 rounded-3xl glass-card flex flex-col justify-between shadow-xl shadow-black/40 min-h-[240px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <BarChart2 className="h-4 w-4 text-purple-400" />
                    Study Metrics
                  </h3>
                  <div className="flex gap-2 text-[8px] font-mono">
                    <span className="text-cyan-400 font-bold">Target</span>
                    <span className="text-pink-400 font-bold">Actual</span>
                  </div>
                </div>

                <div className="w-full mt-4 flex-1">
                  {renderBarChart()}
                </div>
              </div>

              {/* Card 2: Upcoming Deadlines */}
              <div className="border border-white/5 bg-[#0d0d12]/80 p-5 rounded-3xl glass-card flex flex-col justify-between shadow-xl shadow-black/40 min-h-[240px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    Upcoming Deadlines
                  </h3>
                  <span className="text-[8px] font-mono text-zinc-500">Chronological</span>
                </div>

                <div className="space-y-3.5 my-auto py-2">
                  {displayDeadlines.map((dl, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-white/[0.02] last:border-0 pb-2.5 last:pb-0">
                      <div className="flex items-center gap-3 truncate">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${dl.color}`}>
                          {dl.type === "Exam" ? (
                            <Award className="h-4.5 w-4.5" />
                          ) : dl.type === "Assignment" ? (
                            <BookOpen className="h-4.5 w-4.5" />
                          ) : (
                            <Clock className="h-4.5 w-4.5" />
                          )}
                        </div>
                        <div className="truncate text-left">
                          <p className="text-[11px] font-bold text-white truncate leading-normal">{dl.topic}</p>
                          <span className="text-[9px] text-zinc-500 font-mono leading-none">{dl.type}</span>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0 pl-2">
                        <p className="text-[11px] font-bold text-white font-mono">{dl.date}</p>
                        <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400 font-semibold font-mono tracking-wider">{dl.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: AskMe AI Tutor query box */}
              <div className="border border-white/5 bg-[#0d0d12]/80 p-5 rounded-3xl glass-card flex flex-col justify-between shadow-xl shadow-black/40 min-h-[240px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Brain className="h-4 w-4 text-purple-400" />
                    AskMe AI Tutor
                  </h3>
                  <span className="text-[8px] font-mono text-zinc-500">Interactive Doubt Solver</span>
                </div>

                {/* Form to ask doubt */}
                <form onSubmit={handleTutorSubmit} className="space-y-3.5 my-3 relative">
                  <textarea 
                    value={tutorQuery}
                    onChange={(e) => setTutorQuery(e.target.value)}
                    placeholder="Type your query..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-purple-500/50 resize-none h-[64px] transition-all font-light leading-relaxed"
                  />
                  <button 
                    type="submit"
                    className="absolute bottom-2.5 right-2.5 p-2 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-md transition-all active:scale-95 duration-200 cursor-pointer flex items-center justify-center shadow-primary/25"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>

                {/* Recent topics lists */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block text-left">Recent topics</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Biology", "Exam", "Chemistry", "Physics", "Topics"].map((t) => (
                      <button 
                        key={t}
                        onClick={() => handlePillClick(t)}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-[9px] font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        {t === "Biology" ? "Biology (Metabolism)" : t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick launch primary workspace card */}
            <div className="border border-white/5 bg-[#0d0d12]/90 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:border-purple-500/20 shadow-xl shadow-black/40">
              <div className="flex items-center gap-3 text-left">
                <div className="h-10 w-10 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ready to Calibration Flow?</h4>
                  <p className="text-[10px] text-zinc-500 font-light mt-0.5 leading-normal">Solve active doubts, generate revision schedules, and practice real-time mock tests instantly.</p>
                </div>
              </div>
              <Link
                href={`/workspace?docId=${documents[0]?.id || ''}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold text-white transition-all shadow-md shadow-primary/25 cursor-pointer"
              >
                <span>Study Active Workspace</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>
            </div>

          </div>
        ) : (
          
          /* COGNITIVE MEMORY 3D GRAPH VIEW (Preserved from previous implementation) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[500px]">
            
            {/* COLUMN 1 — AI MENTOR SYNC STATUS (col-span-3) */}
            <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
              
              {/* Mentor Sync info */}
              <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card relative overflow-hidden space-y-4 matte-layer shadow-xl shadow-black/40 group">
                <div className="absolute inset-x-0 h-1/2 w-full scanner-sweep pointer-events-none" />
                <div className="absolute top-0 right-0 w-[100px] h-[100px] radial-glow opacity-20 pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary dark:text-purple-400 animate-pulse border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <Brain className="h-5.5 w-5.5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">AskMe CLOS</h3>
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest biometric-glow">Sync: Optimal</p>
                  </div>
                </div>

                <div className="h-[1px] bg-white/5" />

                <div className="space-y-2 text-left">
                  <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-[0.2em] block">Focus State</span>
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
                    <span className="biometric-glow">{streakDays}d Streak</span>
                  </div>
                </div>
              </div>

              {/* Daily targets progress */}
              <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card space-y-4 matte-layer shadow-xl shadow-black/40 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-primary" />
                    Daily Sync Goal
                  </span>
                  <span className="text-xs text-primary dark:text-purple-400 font-extrabold">{streakPercent}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${streakPercent}%` }}
                  />
                </div>
                <p className="text-[9px] text-zinc-500 leading-normal font-light">
                  Ingest notes and solve doubts to reach 100% daily calibration.
                </p>
              </div>
            </div>

            {/* COLUMN 2 — COGNITIVE SPACE GRAPH DISPLAY (col-span-6) */}
            <div className="lg:col-span-6 border border-white/5 bg-[#0d0d11]/50 rounded-3xl glass-card flex flex-col justify-between overflow-hidden relative min-h-[460px] p-6 matte-layer shadow-xl shadow-black/40">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
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
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-white">{activeNode.label}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block text-[8px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusColor(activeNode.status)}`}>
                        {activeNode.status}
                      </span>
                      <button
                        onClick={() => handleStudyNode(activeNode.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-primary hover:bg-primary/95 text-[9px] font-bold px-2.5 py-0.5 text-white transition-all shadow-md active:scale-95 duration-200 cursor-pointer shadow-primary/10"
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
              <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card space-y-5 matte-layer shadow-xl shadow-black/40 text-left">
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
              <div className="border border-white/5 bg-[#0d0d11]/80 p-5 rounded-2xl glass-card space-y-5 matte-layer shadow-xl shadow-black/40 text-left">
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

              {/* Quick action button */}
              <div className="space-y-2">
                <Link
                  href={`/workspace?docId=${documents[0]?.id || ''}`}
                  className="w-full inline-flex items-center justify-between rounded-xl border border-white/5 bg-[#0d0d11]/90 hover:bg-[#121217] p-3.5 text-xs font-bold text-white transition-all duration-300 group shadow-xl shadow-black/40 matte-layer"
                >
                  <span>Study Active Workspace</span>
                  <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
