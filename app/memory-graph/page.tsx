"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStore, GraphNode } from "@/lib/store";
import { Activity, Compass, Info, ShieldAlert, Sparkles, Zap } from "lucide-react";

export default function MemoryGraphPage() {
  const { nodes, links, updateNodeStrength } = useStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("n-1");
  const [forecastMode, setForecastMode] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const getStatusColor = (status: GraphNode["status"]) => {
    switch (status) {
      case "mastered": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "learning": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "weak": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "forgotten": return "text-red-600 bg-red-600/10 border-red-600/20";
      default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const getNodeFill = (status: GraphNode["status"]) => {
    switch (status) {
      case "mastered": return "rgba(16, 185, 129, 0.2)";
      case "learning": return "rgba(59, 130, 246, 0.2)";
      case "weak": return "rgba(244, 63, 94, 0.2)";
      case "forgotten": return "rgba(239, 68, 68, 0.2)";
      default: return "rgba(113, 113, 122, 0.2)";
    }
  };

  const getNodeStroke = (status: GraphNode["status"]) => {
    switch (status) {
      case "mastered": return "rgb(16, 185, 129)";
      case "learning": return "rgb(59, 130, 246)";
      case "weak": return "rgb(244, 63, 94)";
      case "forgotten": return "rgb(239, 68, 68)";
      default: return "rgb(113, 113, 122)";
    }
  };

  // Handle graph connection lookups
  const findNodeCoordinates = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return { x: node?.x || 200, y: node?.y || 150 };
  };

  return (
    <div className="flex flex-col min-h-screen bg-background neural-grid relative select-none">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Concept Memory Network Graph</h1>
            <p className="text-sm text-muted-foreground mt-1">Interactive topological mapping of all study nodes and cognitive connections.</p>
          </div>

          {/* Mode toggler */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setForecastMode(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                !forecastMode
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active Strength
            </button>
            <button
              onClick={() => setForecastMode(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1 ${
                forecastMode
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Decay Forecast (14 Days)
            </button>
          </div>
        </div>

        {/* Graph Canvas Split Screen layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SVG Graph Canvas (col-span-8) */}
          <div className="lg:col-span-8 border border-border bg-card/40 rounded-2xl glass-card relative overflow-hidden p-4">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] radial-glow opacity-25 pointer-events-none" />

            <div className="w-full aspect-[4/3] min-h-[360px] max-h-[480px] bg-zinc-950/20 rounded-xl relative overflow-hidden border border-border/80">
              <svg className="w-full h-full" viewBox="0 0 850 480">
                {/* Render links */}
                {links.map((link, idx) => {
                  const srcCoords = findNodeCoordinates(link.source);
                  const tgtCoords = findNodeCoordinates(link.target);
                  
                  return (
                    <line
                      key={idx}
                      x1={srcCoords.x}
                      y1={srcCoords.y}
                      x2={tgtCoords.x}
                      y2={tgtCoords.y}
                      stroke="rgba(139, 92, 246, 0.25)"
                      strokeWidth={1.5}
                      strokeDasharray={forecastMode ? "4 4" : "0"}
                      className="transition-all"
                    />
                  );
                })}

                {/* Render nodes */}
                {nodes.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  const nodeX = node.x || 200;
                  const nodeY = node.y || 150;
                  const strokeColor = getNodeStroke(node.status);
                  const fillColor = getNodeFill(node.status);
                  const r = isSelected ? 18 : 14;

                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer group"
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      {/* Active highlight shadow circle */}
                      {isSelected && (
                        <circle
                          cx={nodeX}
                          cy={nodeY}
                          r={r + 8}
                          className="fill-primary/10 stroke-primary/30 stroke-[1.5] animate-ping"
                        />
                      )}

                      {/* Main node circle */}
                      <circle
                        cx={nodeX}
                        cy={nodeY}
                        r={r}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={2}
                        className="transition-all duration-300 group-hover:scale-110"
                      />

                      {/* Label Text */}
                      <text
                        x={nodeX}
                        y={nodeY + r + 15}
                        textAnchor="middle"
                        fill="currentColor"
                        className={`text-[10px] font-bold select-none ${
                          isSelected ? "text-primary dark:text-purple-400 font-extrabold" : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Forecast Mode HUD indicator overlay */}
              {forecastMode && (
                <div className="absolute top-4 left-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Memory Decay Forecast active</span>
                </div>
              )}
            </div>
          </div>

          {/* Node details panel (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Node Calibration specs</h2>
            
            {selectedNode ? (
              <div className="border border-border bg-card/40 p-6 rounded-2xl glass-card space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] radial-glow opacity-20 pointer-events-none" />

                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-base font-bold text-foreground">{selectedNode.label}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${getStatusColor(selectedNode.status)}`}>
                    {selectedNode.status}
                  </span>
                </div>

                {/* Calibration progress bar info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Recall Strength:</span>
                    <span className="text-primary dark:text-purple-400 font-bold">{selectedNode.strength}%</span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${selectedNode.strength}%` }}
                    />
                  </div>
                </div>

                {/* simulated calibration sliders */}
                <div className="space-y-3 pt-3 border-t border-border/80">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Simulate Active recall</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNodeStrength(selectedNode.id, -10)}
                      className="w-full rounded-xl border border-border bg-card hover:bg-muted py-2 text-xs font-bold text-foreground transition-all"
                    >
                      Decay (-10)
                    </button>
                    <button
                      onClick={() => updateNodeStrength(selectedNode.id, 15)}
                      className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-md"
                    >
                      Recall (+15)
                    </button>
                  </div>
                </div>

                {/* description / metadata info */}
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-normal bg-muted/40 p-4 rounded-xl">
                  <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Node connections are constructed automatically based on document semantic links and overlap variables. Click other nodes to check references.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 text-center py-10">Select a graph coordinate node to inspect parameters.</p>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
