import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, Info, HelpCircle, Activity } from "lucide-react";

// --- FLOWCHART TYPES & PARSER ---
interface FlowNode {
  id: string;
  label: string;
  shape: "rect" | "circle";
  level?: number;
  x?: number;
  y?: number;
}

interface FlowLink {
  source: string;
  target: string;
  label?: string;
}

function extractNodeIdAndLabel(part: string): { id: string; label?: string } {
  const match = part.trim().match(/^([a-zA-Z0-9_-]+)(?:\s*(?:\["(.*?)"\]|\[(.*?)\]|\("(.*?)"\)|\((.*?)\)))?/);
  if (match) {
    const id = match[1];
    const label = match[2] || match[3] || match[4] || match[5];
    return { id, label };
  }
  return { id: part.trim() };
}

function parseMermaid(code: string): { nodes: FlowNode[]; links: FlowLink[]; direction: "TD" | "LR" } {
  const nodes: FlowNode[] = [];
  const links: FlowLink[] = [];
  let direction: "TD" | "LR" = "TD";

  const lines = code.split("\n");
  
  // Helper to get or create node
  const getOrCreateNode = (id: string, label?: string): FlowNode => {
    let node = nodes.find(n => n.id === id);
    if (!node) {
      node = { id, label: label || id, shape: "rect" };
      nodes.push(node);
    } else if (label) {
      node.label = label;
    }
    return node;
  };

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("%%")) return;

    // Direction check
    if (trimmed.startsWith("graph ")) {
      const dirMatch = trimmed.match(/graph\s+(TD|TB|LR|RL)/i);
      if (dirMatch) {
        direction = (dirMatch[1].toUpperCase() === "LR" || dirMatch[1].toUpperCase() === "RL") ? "LR" : "TD";
      }
      return;
    }

    const isLink = trimmed.includes("-->") || trimmed.includes("---");
    const extracted = extractNodeIdAndLabel(trimmed);

    if (!isLink && extracted.label) {
      const shape = trimmed.includes("[") ? "rect" : "circle";
      const node = getOrCreateNode(extracted.id, extracted.label);
      node.shape = shape as "rect" | "circle";
    } else if (isLink) {
      let sourceIdRaw = "";
      let targetIdRaw = "";
      let edgeLabel = "";

      if (trimmed.includes("-->|")) {
        const parts = trimmed.split("-->|");
        sourceIdRaw = parts[0].trim();
        const subparts = parts[1].split("|");
        edgeLabel = subparts[0].trim();
        targetIdRaw = subparts[1].trim();
      } else {
        const arrowMatch = trimmed.match(/^(.+?)\s*-->\s*(.+)$/);
        if (arrowMatch) {
          sourceIdRaw = arrowMatch[1].trim();
          targetIdRaw = arrowMatch[2].trim();
        }
      }

      if (sourceIdRaw && targetIdRaw) {
        const src = extractNodeIdAndLabel(sourceIdRaw);
        const tgt = extractNodeIdAndLabel(targetIdRaw);

        // Determine shape based on raw string
        const srcShape = sourceIdRaw.includes("[") ? "rect" : (sourceIdRaw.includes("(") ? "circle" : undefined);
        const tgtShape = targetIdRaw.includes("[") ? "rect" : (targetIdRaw.includes("(") ? "circle" : undefined);

        const srcNode = getOrCreateNode(src.id, src.label);
        if (srcShape) srcNode.shape = srcShape as "rect" | "circle";
        
        const tgtNode = getOrCreateNode(tgt.id, tgt.label);
        if (tgtShape) tgtNode.shape = tgtShape as "rect" | "circle";

        links.push({ source: src.id, target: tgt.id, label: edgeLabel });
      }
    } else {
      // Single node definition line (no labels/shapes)
      const singleNodeMatch = trimmed.match(/^([a-zA-Z0-9_-]+)$/);
      if (singleNodeMatch) {
        getOrCreateNode(singleNodeMatch[1]);
      }
    }
  });

  // Calculate hierarchical layout level
  // Find roots (no incoming connections)
  const incomingCount: Record<string, number> = {};
  nodes.forEach(n => incomingCount[n.id] = 0);
  links.forEach(l => incomingCount[l.target] = (incomingCount[l.target] || 0) + 1);

  // Set levels
  let queue = nodes.filter(n => incomingCount[n.id] === 0).map(n => ({ id: n.id, level: 0 }));
  
  // Fallback if there is a cycle (no root)
  if (queue.length === 0 && nodes.length > 0) {
    queue = [{ id: nodes[0].id, level: 0 }];
  }

  const visited = new Set<string>();
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr.id)) continue;
    visited.add(curr.id);

    const node = nodes.find(n => n.id === curr.id);
    if (node) {
      node.level = Math.max(node.level || 0, curr.level);
    }

    // Queue outgoing connections
    const outgoing = links.filter(l => l.source === curr.id);
    outgoing.forEach(link => {
      queue.push({ id: link.target, level: curr.level + 1 });
    });
  }

  // Handle isolated nodes that might have skipped hierarchy
  nodes.forEach(n => {
    if (n.level === undefined) n.level = 0;
  });

  // Calculate grid coordinates based on levels
  const levelGroups: Record<number, FlowNode[]> = {};
  nodes.forEach(n => {
    const lvl = n.level || 0;
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(n);
  });

  const width = 500;
  const height = 280;

  if (direction === "TD") {
    const minX = 65;
    const maxX = 435;
    const availableWidth = maxX - minX;
    
    const minY = 35;
    const maxY = 245;
    const availableHeight = maxY - minY;

    const levels = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);
    const ySpacing = levels.length > 1 ? availableHeight / (levels.length - 1) : 0;
    
    levels.forEach((lvl, lvlIdx) => {
      const group = levelGroups[lvl];
      const xSpacing = group.length > 1 ? availableWidth / (group.length - 1) : 0;
      const yVal = levels.length > 1 ? minY + ySpacing * lvlIdx : 140;

      group.forEach((node, nodeIdx) => {
        node.x = group.length > 1 ? minX + xSpacing * nodeIdx : 250;
        node.y = yVal;
      });
    });
  } else {
    // Left-Right layout
    const minX = 65;
    const maxX = 435;
    const availableWidth = maxX - minX;
    
    const minY = 35;
    const maxY = 245;
    const availableHeight = maxY - minY;

    const levels = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);
    const xSpacing = levels.length > 1 ? availableWidth / (levels.length - 1) : 0;
    
    levels.forEach((lvl, lvlIdx) => {
      const group = levelGroups[lvl];
      const ySpacing = group.length > 1 ? availableHeight / (group.length - 1) : 0;
      const xVal = levels.length > 1 ? minX + xSpacing * lvlIdx : 250;

      group.forEach((node, nodeIdx) => {
        node.x = xVal;
        node.y = group.length > 1 ? minY + ySpacing * nodeIdx : 140;
      });
    });
  }

  return { nodes, links, direction };
}

// --- EDUCATIONAL CONCEPT EXPLANATION DICTIONARY ---
const CONCEPT_EXPLANATIONS: Record<string, { category: string; desc: string; stage: string }> = {
  "database management": {
    category: "System Core",
    stage: "Database Architecture",
    desc: "The overarching software system used to store, manage, query, and administrative data records securely."
  },
  "classical databases": {
    category: "Ingestion Stage",
    stage: "Historical Models",
    desc: "Early navigational storage schemas including hierarchical trees and networked graphs popular before the SQL revolution."
  },
  "traditional database": {
    category: "Storage Stage",
    stage: "Relational Models",
    desc: "Structured relational databases utilizing schemas, tabular layouts, foreign keys, and SQL engines for operational consistency."
  },
  "modern databases": {
    category: "AI & Vector Stage",
    stage: "Contemporary Models",
    desc: "Modern scalable systems, NoSQL key-value stores, graph engines, and high-dimensional vector search frameworks."
  },
  "hierarchical model": {
    category: "Ingestion Stage",
    stage: "Historical Models",
    desc: "Data organized strictly as parent-child tree pathways where each child record has exactly one parent."
  },
  "network model": {
    category: "Ingestion Stage",
    stage: "Historical Models",
    desc: "An evolution of the hierarchical model that allows many-to-many child-parent links, forming dynamic graph networks."
  },
  "rdbms": {
    category: "Storage Stage",
    stage: "Relational Core",
    desc: "Relational Database Management System. Organizes data rows into rigid columns and tables with strict primary/foreign key connections."
  },
  "sql": {
    category: "Storage Stage",
    stage: "Query Interface",
    desc: "Structured Query Language. The standardized declarative language used to read, update, and manage relational database schemas."
  },
  "acid compliant": {
    category: "Storage Stage",
    stage: "Reliability Guarantee",
    desc: "Ensures transaction integrity through Atomicity (all or nothing), Consistency, Isolation, and Durability."
  },
  "nosql": {
    category: "AI & Vector Stage",
    stage: "Contemporary Models",
    desc: "Non-relational schemas offering horizontal scaling, flexible document formats (JSON), and fast unstructured read/write pipelines."
  },
  "document stores": {
    category: "AI & Vector Stage",
    stage: "Contemporary Models",
    desc: "NoSQL engines (like MongoDB) designed to store and query records as self-contained nested documents (JSON/BSON)."
  },
  "vector databases": {
    category: "AI & Vector Stage",
    stage: "Cognitive Storage",
    desc: "Specialized databases designed to index high-dimensional numeric arrays (vector embeddings) for high-speed semantic similarity searches."
  }
};

function getConceptDetails(label: string) {
  const cleanLabel = label.toLowerCase().trim().replace(/[^\w\s-]/g, "");
  
  // Try exact match
  if (CONCEPT_EXPLANATIONS[cleanLabel]) {
    return CONCEPT_EXPLANATIONS[cleanLabel];
  }
  
  // Try partial match
  for (const key in CONCEPT_EXPLANATIONS) {
    if (cleanLabel.includes(key) || key.includes(cleanLabel)) {
      return CONCEPT_EXPLANATIONS[key];
    }
  }

  // Fallback dynamic generator based on color-coded stages
  const isIngestion = cleanLabel.match(/doc|raw|file|text|chunk|pdf|txt|csv|data|ingest|source|input/);
  const isStorage = cleanLabel.match(/embed|vector|db|store|index|database|retriev|rdbms|sql/);
  const isQuery = cleanLabel.match(/query|user|prompt|question|search/);
  const isAI = cleanLabel.match(/ai|llm|synth|model|generat|answer|result|final|response/);

  if (isIngestion) {
    return {
      category: "Ingestion Stage",
      stage: "Source Data",
      desc: `Ingestion module representing '${label}'. Validates and parses raw text variables into clean cognitive structures.`
    };
  }
  if (isStorage) {
    return {
      category: "Storage Stage",
      stage: "Semantic Cache",
      desc: `Semantic storage index representing '${label}'. Encodes knowledge dimensions for quick context extraction.`
    };
  }
  if (isQuery) {
    return {
      category: "Query Stage",
      stage: "User Interface",
      desc: `Query control block representing '${label}'. Intercepts and aligns queries against indexed memory blocks.`
    };
  }
  if (isAI) {
    return {
      category: "AI Stage",
      stage: "Cognitive Model",
      desc: `LLM generator block representing '${label}'. Compiles matching document chunks into premium, cited user guides.`
    };
  }

  return {
    category: "Revision Concept",
    stage: "Active Core",
    desc: `Educational study unit for '${label}'. Drag to align connections or study adjacent nodes to master this topic.`
  };
}

// --- DIAGRAM RENDERER COMPONENT ---
export function FlowchartRenderer({ code }: { code: string }) {
  const parsed = React.useMemo(() => parseMermaid(code), [code]);
  const [nodes, setNodes] = React.useState<FlowNode[]>([]);
  const [links, setLinks] = React.useState<FlowLink[]>([]);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  
  // Track hovered node for details display
  const [hoveredNode, setHoveredNode] = React.useState<FlowNode | null>(null);
  
  // Viewport states for zoom & pan
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });

  // Tab State: flow = Diagram, simulation = Sandbox Physics Simulator
  const [activeTab, setActiveTab] = React.useState<'flow' | 'simulation'>('flow');

  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setNodes(parsed.nodes);
      setLinks(parsed.links);
    }, 0);
    return () => clearTimeout(timer);
  }, [parsed]);

  // Hook trackpad/mouse scroll wheel for zooming
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.05;
      let newZoom = zoom;
      if (e.deltaY < 0) {
        newZoom = Math.min(zoom * zoomFactor, 5); // Max 5x zoom
      } else {
        newZoom = Math.max(zoom / zoomFactor, 0.4); // Min 0.4x zoom
      }
      setZoom(newZoom);
    };

    container.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, [zoom]);

  // Auto-detect simulation topic from flowchart code
  const detectedMode = React.useMemo(() => {
    const text = code.toLowerCase();
    if (text.includes("first law") || text.includes("inertia") || text.includes("friction") || text.includes("aristotle")) {
      return "inertia";
    }
    if (text.includes("second law") || text.includes("f = ma") || text.includes("f=ma") || text.includes("force")) {
      return "second";
    }
    if (text.includes("third law") || text.includes("action") || text.includes("reaction") || text.includes("opposite")) {
      return "third";
    }
    if (text.includes("orbit") || text.includes("gravit") || text.includes("kepler") || text.includes("mass")) {
      return "orbit";
    }
    return "second"; // default preset
  }, [code]);

  if (nodes.length === 0) {
    return (
      <div className="w-full max-w-full bg-[#0d0d11]/80 border border-white/5 rounded-3xl p-4 my-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary/60">Building Interactive Flow...</span>
        </div>
        <div className="aspect-[16/9] rounded-2xl bg-zinc-950/40 border border-white/5 flex items-center justify-center min-h-[160px]">
          <div className="text-center space-y-2">
            <div className="h-7 w-7 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block">Rendering diagram...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingId(nodeId);
  };

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    if (target.closest(".node-group")) {
      return;
    }
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggingId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      
      const svgUnitsPerPixelX = 500 / rect.width;
      const svgUnitsPerPixelY = 280 / rect.height;
      
      // Delta-based movement adjusted for current zoom
      const dx = e.movementX * svgUnitsPerPixelX / zoom;
      const dy = e.movementY * svgUnitsPerPixelY / zoom;

      setNodes(prev => prev.map(n => {
        if (n.id === draggingId) {
          const boundedX = Math.max(50, Math.min(450, (n.x ?? 0) + dx));
          const boundedY = Math.max(17, Math.min(263, (n.y ?? 0) + dy));
          return { ...n, x: boundedX, y: boundedY };
        }
        return n;
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setIsPanning(false);
  };

  const handleResetLayout = () => {
    setNodes(parsed.nodes);
    setLinks(parsed.links);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHoveredNode(null);
  };

  // Helper to resolve node colors dynamically based on labels
  const getNodeStyle = (label: string) => {
    const text = label.toLowerCase();
    
    if (text.match(/doc|raw|file|text|chunk|pdf|txt|csv|data|ingest|source|input/)) {
      return {
        fill: "url(#grad-green)",
        stroke: "#34d399",
        glow: "rgba(52, 211, 153, 0.45)",
        textColor: "#a7f3d0",
        arrowId: "arrow-green"
      };
    }
    if (text.match(/embed|vector|db|store|index|database|retriev/)) {
      return {
        fill: "url(#grad-blue)",
        stroke: "#60a5fa",
        glow: "rgba(96, 165, 250, 0.45)",
        textColor: "#bfdbfe",
        arrowId: "arrow-blue"
      };
    }
    if (text.match(/query|user|prompt|question|search/)) {
      return {
        fill: "url(#grad-orange)",
        stroke: "#fb923c",
        glow: "rgba(251, 146, 60, 0.45)",
        textColor: "#ffedd5",
        arrowId: "arrow-orange"
      };
    }
    if (text.match(/ai|llm|synth|model|generat|answer|result|final|response/)) {
      return {
        fill: "url(#grad-pink)",
        stroke: "#f472b6",
        glow: "rgba(244, 114, 182, 0.45)",
        textColor: "#fce7f3",
        arrowId: "arrow-pink"
      };
    }
    
    // Default fallback
    return {
      fill: "url(#grad-slate)",
      stroke: "#94a3b8",
      glow: "rgba(148, 163, 184, 0.25)",
      textColor: "#f1f5f9",
      arrowId: "arrow-slate"
    };
  };

  return (
    <div className="w-full max-w-full bg-[#0d0d11]/80 border border-white/5 rounded-3xl p-4 my-4 flex flex-col glass-card relative overflow-hidden shadow-2xl matte-layer spatial-shadow-lg select-none">
      
      {/* Decorative glows inside container */}
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#6366f1]/5 rounded-full filter blur-2xl pointer-events-none" />

      {/* Header HUD with active tab selection and non-blocking toolbar */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 z-10 border-b border-white/5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary dark:text-purple-400 flex items-center gap-2 biometric-glow">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            Interactive Learning Flow
          </span>

          {/* Elegant tab controllers */}
          <div className="flex bg-zinc-900/60 p-0.5 rounded-lg border border-white/5 self-start">
            <button
              type="button"
              onClick={() => setActiveTab('flow')}
              className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${
                activeTab === 'flow'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🗺️ Concept Flowchart
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulation')}
              className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                activeTab === 'simulation'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              ⚡ Live Physics Sandbox
            </button>
          </div>
        </div>

        {/* Viewport controls (Only rendered when in flowchart diagram mode) */}
        {activeTab === 'flow' && (
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#09090b]/60 border border-zinc-200 dark:border-white/5 px-2 py-1 rounded-lg">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(z / 1.15, 0.4))}
                className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 rounded transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[9px] font-mono text-zinc-600 dark:text-zinc-400 font-bold px-1.5 min-w-[32px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(z * 1.15, 5))}
                className="p-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 rounded transition-all"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetLayout}
              className="rounded-lg border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#09090b]/60 hover:bg-zinc-200 dark:hover:bg-[#09090b]/90 px-2.5 py-1 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all uppercase tracking-wider flex items-center gap-1"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Reset Viewport
            </button>
          </div>
        )}
      </div>

      {/* Main Container rendering Flowchart SVG OR Physics Simulator based on activeTab */}
      {activeTab === 'flow' ? (
        <div className="w-full flex flex-col lg:flex-row gap-4 items-stretch z-10 min-h-0">
          <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden select-none rounded-2xl bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-white/5 cursor-grab active:cursor-grabbing min-h-[200px] max-h-[360px]"
            style={{ aspectRatio: '16/9' }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 500 280"
              className="w-full h-full"
              onMouseDown={handleSvgMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Defs for arrow markers & gradients */}
              <defs>
                {/* Animated signal styling */}
                <style>{`
                  @keyframes dashflow {
                    to {
                      stroke-dashoffset: -20;
                    }
                  }
                  .flow-line {
                    stroke-dasharray: 6, 6;
                    animation: dashflow 1.2s linear infinite;
                  }
                `}</style>

                {/* Glowing filter for nodes */}
                <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Arrow markers for each workflow stage */}
                <marker id="arrow-green" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#34d399" />
                </marker>
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#60a5fa" />
                </marker>
                <marker id="arrow-orange" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fb923c" />
                </marker>
                <marker id="arrow-pink" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f472b6" />
                </marker>
                <marker id="arrow-slate" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
                </marker>

                {/* Vibrant gradients */}
                <linearGradient id="grad-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#064e3b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#022c22" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c2d12" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#431407" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#701a75" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4a044e" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="grad-slate" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Centered pan-and-zoom transformation group */}
              <g transform={`translate(${pan.x}, ${pan.y}) translate(250, 140) scale(${zoom}) translate(-250, -140)`}>
                {/* Render Links */}
                <g>
                  {links.map((link, idx) => {
                    const srcNode = nodes.find(n => n.id === link.source);
                    const tgtNode = nodes.find(n => n.id === link.target);
                    if (!srcNode || !tgtNode) return null;

                    const x1 = srcNode.x ?? 0;
                    const y1 = srcNode.y ?? 0;
                    const x2 = tgtNode.x ?? 0;
                    const y2 = tgtNode.y ?? 0;

                    // Draw curved Bezier path
                    const cx1 = x1 + (x2 - x1) * 0.25;
                    const cy1 = y1 + (y2 - y1) * 0.05;
                    const cx2 = x1 + (x2 - x1) * 0.75;
                    const cy2 = y1 + (y2 - y1) * 0.95;

                    const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
                    const style = getNodeStyle(tgtNode.label);

                    return (
                      <g key={idx}>
                        {/* Thick background glow path */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.03)"
                          strokeWidth="3.5"
                        />
                        {/* Animated dashflow path */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={style.stroke}
                          strokeWidth="1.2"
                          className="flow-line"
                          markerEnd={`url(#${style.arrowId})`}
                          style={{ strokeOpacity: 0.75 }}
                        />
                        {link.label && (
                          <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2 - 5}
                            fill="rgba(255,255,255,0.4)"
                            fontSize="7"
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="pointer-events-none"
                          >
                            {link.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Render Nodes */}
                <g>
                  {nodes.map(node => {
                    const x = node.x ?? 0;
                    const y = node.y ?? 0;
                    const isCircle = node.shape === "circle";
                    const nodeWidth = 100;
                    const nodeHeight = 34;

                    const style = getNodeStyle(node.label);

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${x}, ${y})`}
                        className="cursor-pointer group node-group"
                        onMouseDown={(e) => handleMouseDown(e, node.id)}
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {/* Glowing halo */}
                        {isCircle ? (
                          <circle
                            r="22"
                            fill="none"
                            stroke={style.stroke}
                            strokeWidth="2"
                            style={{ opacity: 0.15, filter: "url(#node-glow)" }}
                          />
                        ) : (
                          <rect
                            x={-nodeWidth / 2 - 2}
                            y={-nodeHeight / 2 - 2}
                            width={nodeWidth + 4}
                            height={nodeHeight + 4}
                            rx="10"
                            fill="none"
                            stroke={style.stroke}
                            strokeWidth="2"
                            style={{ opacity: 0.15, filter: "url(#node-glow)" }}
                          />
                        )}

                        {/* Base shape */}
                        {isCircle ? (
                          <circle
                            r="20"
                            fill={style.fill}
                            stroke={style.stroke}
                            strokeWidth="1.5"
                            className="transition-colors group-hover:stroke-white duration-300"
                          />
                        ) : (
                          <rect
                            x={-nodeWidth / 2}
                            y={-nodeHeight / 2}
                            width={nodeWidth}
                            height={nodeHeight}
                            rx="8"
                            fill={style.fill}
                            stroke={style.stroke}
                            strokeWidth="1.5"
                            className="transition-all group-hover:stroke-white duration-300"
                          />
                        )}

                        {/* Label */}
                        <text
                          y={3}
                          fill={style.textColor}
                          fontSize="7.5"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                          textAnchor="middle"
                          className="pointer-events-none group-hover:fill-white transition-colors"
                        >
                          {node.label.length > 22 ? `${node.label.substring(0, 20)}...` : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            </svg>
          </div>

          {/* Interactive Side details HUD Panel */}
          <div className="w-full lg:w-[200px] shrink-0 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/5 rounded-2xl p-3 flex flex-col justify-between backdrop-blur-md relative overflow-hidden overflow-y-auto transition-all duration-300 max-h-[200px] lg:max-h-none">
            {hoveredNode ? (
              (() => {
                const details = getConceptDetails(hoveredNode.label);
                const style = getNodeStyle(hoveredNode.label);
                return (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-widest font-mono text-zinc-500 dark:text-zinc-300 font-bold">
                          {details.stage}
                        </span>
                        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: style.stroke }} />
                      </div>
                      
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-white leading-tight">
                        {hoveredNode.label}
                      </h4>

                      <div className="inline-flex rounded-md border text-[8px] font-mono font-bold px-1.5 py-0.5" style={{ color: style.textColor, borderColor: `${style.stroke}20`, backgroundColor: `${style.stroke}10` }}>
                        {details.category}
                      </div>

                      <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-light mt-2 transition-all duration-300">
                        {details.desc}
                      </p>
                    </div>
                    
                    <div className="text-[8px] text-zinc-500 dark:text-zinc-400 font-light pt-3 border-t border-zinc-200 dark:border-white/5">
                      💡 Try dragging this node to customize the layout.
                    </div>
                  </>
                );
              })()
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-widest font-mono text-zinc-500 dark:text-zinc-400 font-bold">
                      Interactive HUD
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-ping" />
                  </div>
                  
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-white/80 leading-tight">
                    Study Assistant
                  </h4>

                  <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-light mt-2">
                    Hover over any node in the interactive learning flowchart to reveal key concepts, relationships, and study explanations in real-time.
                  </p>
                </div>

                <div className="text-[8px] text-zinc-500 dark:text-zinc-400 font-light pt-3 border-t border-zinc-200 dark:border-white/5">
                  💡 Drag nodes or use scroll to zoom/pan the diagram.
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <PhysicsSimulator defaultMode={detectedMode} flowNodes={nodes} flowLinks={links} />
      )}

      {/* Helpful Hint banner */}
      <span className="mt-3.5 text-[9px] text-zinc-500 dark:text-zinc-400 font-light z-10">
        💡 Drag nodes above to organize overlays. Stages are color-coded: Ingestion/Docs (Green), Vector Data (Blue), Inputs/Query (Orange), and Model Answers (Pink).
      </span>
    </div>
  );
}

interface Particle {
  id: string;
  sourceId: string;
  targetId: string;
  progress: number;
  speed: number;
}

type SimMode = 'inertia' | 'second' | 'third' | 'orbit' | 'dynamic';

// --- INTERACTIVE PHYSICS & DYNAMIC FLOW SIMULATION SANDBOX ---
function PhysicsSimulator({
  defaultMode,
  flowNodes,
  flowLinks
}: {
  defaultMode: SimMode;
  flowNodes: FlowNode[];
  flowLinks: FlowLink[];
}) {
  const [mode, setMode] = React.useState<SimMode>(defaultMode);
  const [isRunning, setIsRunning] = React.useState(true);
  const [tickerMsg, setTickerMsg] = React.useState('');

  // Inertia simulation states
  const [friction, setFriction] = React.useState(0.06); // μ
  const [puckX, setPuckX] = React.useState(250);
  const [puckVx, setPuckVx] = React.useState(6.5);

  // F = ma simulation states
  const [appliedForce, setAppliedForce] = React.useState(25); // Newtons
  const [cartMass, setCartMass] = React.useState(4); // kg
  const [cartX, setCartX] = React.useState(80);
  const [cartV, setCartV] = React.useState(0);

  // Action & Reaction simulation states
  const [massA, setMassA] = React.useState(3); // kg
  const [massB, setMassB] = React.useState(6); // kg
  const [astA_X, setAstA_X] = React.useState(225);
  const [astB_X, setAstB_X] = React.useState(275);
  const [astA_V, setAstA_V] = React.useState(0);
  const [astB_V, setAstB_V] = React.useState(0);
  const [flashReactionTime, setFlashReactionTime] = React.useState(0);

  // Orbit simulation states
  const orbitR = 80;
  const [orbitAngle, setOrbitAngle] = React.useState(0);
  const [orbitSpeed, setOrbitSpeed] = React.useState(0.03);
  const [eccentricity, setEccentricity] = React.useState(0.2); // elliptical

  // Dynamic Concept Flow Sandbox states
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const [pulseSpeed, setPulseSpeed] = React.useState(1.5);
  const [activeNodeId, setActiveNodeId] = React.useState<string | null>(null);
  const [nodeFlashTime, setNodeFlashTime] = React.useState(0);

  // Timer reference for the requestAnimationFrame loop
  const requestRef = React.useRef<number | null>(null);
  const previousTimeRef = React.useRef<number | null>(null);

  // Trigger push impulse for Inertia Mode
  const handlePushPuck = (direction: 'left' | 'right') => {
    setPuckVx(direction === 'right' ? 8.5 : -8.5);
    setIsRunning(true);
  };

  // Launch Astronaut push off for Third Law Mode
  const handleAstronautPush = () => {
    setAstA_X(225);
    setAstB_X(275);
    const impulse = 35 * 0.25; // force * delta_t
    setAstA_V(-impulse / massA);
    setAstB_V(impulse / massB);
    setFlashReactionTime(0.85); // flash force arrows for 0.85 seconds
    setIsRunning(true);
  };

  // Reset F=ma Cart
  const handleResetCart = () => {
    setCartX(80);
    setCartV(0);
    setIsRunning(true);
  };

  // Manual Trigger a Signal Pulse in Dynamic Flow Mode
  const handleTriggerPulse = () => {
    if (flowLinks.length === 0) return;
    // Find a root link (a link whose source is not a target of any other link)
    const rootLinks = flowLinks.filter(l => !flowLinks.some(prevL => prevL.target === l.source));
    const chosenLink = rootLinks[Math.floor(Math.random() * rootLinks.length)] || flowLinks[0];
    if (chosenLink) {
      setParticles(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          sourceId: chosenLink.source,
          targetId: chosenLink.target,
          progress: 0,
          speed: 1.0 + Math.random() * 0.4
        }
      ]);
      setIsRunning(true);
    }
  };

  // Reset Signal Flow Sandbox
  const handleResetSignalFlow = () => {
    setParticles([]);
    setActiveNodeId(null);
    setNodeFlashTime(0);
    setIsRunning(true);
  };

  // Physics animation tick loop
  React.useEffect(() => {
    if (!isRunning) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const updatePhysics = (timeMs: number) => {
      if (previousTimeRef.current !== null) {
        const dt = Math.min((timeMs - previousTimeRef.current) / 1000, 0.1); // cap to 100ms jumps

        if (mode === 'inertia') {
          // puck calculations
          setPuckX(x => {
            let nextVx = puckVx;
            if (puckVx !== 0) {
              const frictionAcc = -Math.sign(puckVx) * friction * 9.8;
              nextVx = puckVx + frictionAcc * dt;
              // Stop completely if speed drops low or sign flips
              if (Math.abs(nextVx) < 0.05 || Math.sign(nextVx) !== Math.sign(puckVx)) {
                nextVx = 0;
              }
              setPuckVx(nextVx);
            }

            let nextX = x + puckVx * 35 * dt;

            // boundary bounce
            if (nextX > 430) {
              nextX = 430;
              setPuckVx(-Math.abs(puckVx) * 0.55); // inelastic bounce
            } else if (nextX < 70) {
              nextX = 70;
              setPuckVx(Math.abs(puckVx) * 0.55);
            }
            return nextX;
          });
        } else if (mode === 'second') {
          const acceleration = appliedForce / cartMass;
          setCartX(x => {
            const nextV = cartV + acceleration * 4 * dt;
            setCartV(nextV);

            const nextX = x + cartV * 18 * dt;
            if (nextX > 420) {
              setIsRunning(false); // Stop cart at edge of sandbox track
              return 420;
            }
            return nextX;
          });
        } else if (mode === 'third') {
          setAstA_X(x => {
            const nextX = x + astA_V * 15 * dt;
            if (nextX < 40) {
              setAstA_V(0);
              return 40;
            }
            return nextX;
          });
          setAstB_X(x => {
            const nextX = x + astB_V * 15 * dt;
            if (nextX > 460) {
              setAstB_V(0);
              return 460;
            }
            return nextX;
          });
          setFlashReactionTime(t => Math.max(0, t - dt));
        } else if (mode === 'orbit') {
          setOrbitAngle(a => (a + orbitSpeed) % (Math.PI * 2));
        } else if (mode === 'dynamic' && flowLinks.length > 0) {
          // Dynamic Concept Flow Sandbox Particle Calculations
          setParticles(prev => {
            const nextParticles: Particle[] = [];
            
            prev.forEach(p => {
              const nextProgress = p.progress + p.speed * pulseSpeed * dt;
              if (nextProgress >= 1) {
                // Pulse reached target! Trigger flash on node
                setActiveNodeId(p.targetId);
                setNodeFlashTime(0.4);

                // Find next branching links originating from the target node
                const childLinks = flowLinks.filter(l => l.source === p.targetId);
                if (childLinks.length > 0) {
                  childLinks.forEach(link => {
                    nextParticles.push({
                      id: `${Date.now()}-${Math.random()}`,
                      sourceId: link.source,
                      targetId: link.target,
                      progress: 0,
                      speed: 0.85 + Math.random() * 0.4
                    });
                  });
                } else {
                  // End node reached! Auto-respawn from a root link to keep flow alive
                  const rootLinks = flowLinks.filter(l => !flowLinks.some(prevL => prevL.target === l.source));
                  const chosenLink = rootLinks[Math.floor(Math.random() * rootLinks.length)] || flowLinks[0];
                  if (chosenLink) {
                    nextParticles.push({
                      id: `${Date.now()}-${Math.random()}`,
                      sourceId: chosenLink.source,
                      targetId: chosenLink.target,
                      progress: 0,
                      speed: 0.95 + Math.random() * 0.3
                    });
                  }
                }
              } else {
                nextParticles.push({
                  ...p,
                  progress: nextProgress
                });
              }
            });

            // Automatically feed fresh root pulses if sandbox runs dry
            if (nextParticles.length === 0) {
              const rootLinks = flowLinks.filter(l => !flowLinks.some(prevL => prevL.target === l.source));
              const chosenLink = rootLinks[Math.floor(Math.random() * rootLinks.length)] || flowLinks[0];
              if (chosenLink) {
                nextParticles.push({
                  id: `${Date.now()}-${Math.random()}`,
                  sourceId: chosenLink.source,
                  targetId: chosenLink.target,
                  progress: 0,
                  speed: 1.1
                });
              }
            }

            return nextParticles;
          });

          setNodeFlashTime(t => Math.max(0, t - dt));
        }
      }

      previousTimeRef.current = timeMs;
      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, mode, friction, puckVx, appliedForce, cartMass, cartV, astA_V, astB_V, orbitSpeed, flowLinks, flowNodes, pulseSpeed]);

  // Handle previous time reset when resuming/toggling
  React.useEffect(() => {
    previousTimeRef.current = null;
  }, [isRunning, mode]);

  // Ticker updates reflecting physical laws in real-time
  React.useEffect(() => {
    if (mode === 'inertia') {
      const speed = Math.abs(puckVx).toFixed(2);
      if (friction === 0) {
        setTickerMsg(`⚡ Friction coefficient μ = 0 (Ideal Frictionless Surface). Pod slides infinitely at ${speed} m/s. This is Newton's First Law!`);
      } else if (puckVx !== 0) {
        setTickerMsg(`⚡ Friction opposes movement with kinetic force f_k = μ * m * g. Decelerating pod: current speed ${speed} m/s.`);
      } else {
        setTickerMsg(`⚡ Pod is at rest. Inertia holds this state. Apply an external force push to see it slide!`);
      }
    } else if (mode === 'second') {
      const accel = (appliedForce / cartMass).toFixed(2);
      const speed = (cartV * 0.5).toFixed(2);
      if (cartX >= 420) {
        setTickerMsg(`🏁 Cart reached track end. Reset cart to run another trial! Mass: ${cartMass}kg, Force: ${appliedForce}N.`);
      } else {
        setTickerMsg(`⚡ Acceleration a = F / m = ${appliedForce}N / ${cartMass}kg = ${accel} m/s². Speed: ${speed} m/s. Double force to double acceleration!`);
      }
    } else if (mode === 'third') {
      const forceA = 35;
      const accelA = (forceA / massA).toFixed(2);
      const accelB = (forceA / massB).toFixed(2);
      if (flashReactionTime > 0) {
        setTickerMsg(`💥 ACTION-REACTION ACTIVES! Pod A pushes B: F_AB = ${forceA}N. Pod B pushes A: F_BA = -${forceA}N. Opposite and equal!`);
      } else if (astA_V !== 0 || astB_V !== 0) {
        setTickerMsg(`⚡ Drifting: Astronaut A (lighter, ${massA}kg) accelerates away at -${accelA} m/s². Astronaut B (${massB}kg) drifts at ${accelB} m/s².`);
      } else {
        setTickerMsg(`⚡ Click "Push Off Astronauts" to fire their thrusters and generate opposite force vectors!`);
      }
    } else if (mode === 'orbit') {
      const dist = orbitR * (1 + eccentricity * Math.cos(orbitAngle));
      const f_gravity = (5000 / (dist * dist)).toFixed(2);
      setTickerMsg(`🪐 Keplerian Orbit. Central Gravity pulls planet inward (F_g = ${f_gravity}N). Velocity is perpendicular, creating stable orbit.`);
    } else if (mode === 'dynamic') {
      if (particles.length > 0) {
        const activeNode = flowNodes.find(n => n.id === activeNodeId);
        const activeLabel = activeNode ? `'${activeNode.label}'` : 'node modules';
        setTickerMsg(`⚡ Concept Flow Lab. Tracing logic signals in real-time. Active node processing: ${activeLabel}.`);
      } else {
        setTickerMsg(`⚡ Concept Flow Lab. Click "Trigger Signal Pulse" to start the dynamic signal tracing animation!`);
      }
    }
  }, [mode, puckVx, friction, appliedForce, cartMass, cartV, cartX, massA, massB, astA_V, astB_V, flashReactionTime, orbitAngle, eccentricity, particles, activeNodeId, flowNodes]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 items-stretch z-10 min-h-0 select-none">
      
      {/* Simulation Viewport Area */}
      <div className="flex-1 relative rounded-2xl bg-zinc-950/65 border border-white/5 cursor-default min-h-[220px] max-h-[360px] overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <svg viewBox="0 0 500 240" className="w-full h-full select-none">
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="sim-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sim-grid)" />

          {/* RENDER INERTIA SIMULATION */}
          {mode === 'inertia' && (
            <>
              {/* Friction floor indicator */}
              <rect x="50" y="148" width="400" height="4" fill={friction > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.25)"} />
              <line x1="50" y1="150" x2="450" y2="150" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
              
              {/* Pod Body */}
              <g transform={`translate(${puckX}, 130)`} className="transition-all duration-75">
                {/* Pod Hover glow ring */}
                <ellipse cx="0" cy="8" rx="20" ry="6" fill="none" stroke={puckVx !== 0 ? "#6366f1" : "#3b82f6"} strokeWidth="1" strokeOpacity="0.4" />
                <ellipse cx="0" cy="8" rx="22" ry="7" fill="none" stroke={puckVx !== 0 ? "#6366f1" : "#3b82f6"} strokeWidth="0.5" strokeOpacity="0.2" />
                
                {/* Puck Metallic Shell */}
                <rect x="-18" y="-12" width="36" height="16" rx="4" fill="url(#grad-blue)" stroke="#60a5fa" strokeWidth="1.5" style={{ filter: "drop-shadow(0px 2px 5px rgba(96,165,250,0.15))" }} />
                
                {/* Status core dot */}
                <circle cx="0" cy="-4" r="3.5" fill={puckVx !== 0 ? "#34d399" : "#a8a29e"} className={puckVx !== 0 ? "animate-pulse" : ""} />

                {/* Velocity Vector Arrow (Green) */}
                {puckVx !== 0 && (
                  <g transform={`translate(0, -4)`}>
                    <line x1="0" y1="0" x2={puckVx * 8} y2="0" stroke="#10b981" strokeWidth="2.5" />
                    <polygon points={`${puckVx * 8}, -3.5 ${puckVx * 8 + Math.sign(puckVx) * 5.5}, 0 ${puckVx * 8}, 3.5`} fill="#10b981" />
                    <text x={puckVx * 4} y="-8" fill="#a7f3d0" fontSize="7.5" fontWeight="bold" textAnchor="middle">v</text>
                  </g>
                )}

                {/* Friction Force Arrow (Red) */}
                {puckVx !== 0 && friction > 0 && (
                  <g transform={`translate(0, 10)`}>
                    <line x1="0" y1="0" x2={-Math.sign(puckVx) * friction * 180} y2="0" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,2" />
                    <polygon points={`${-Math.sign(puckVx) * friction * 180}, -2.5 ${-Math.sign(puckVx) * friction * 180 - Math.sign(puckVx) * 4}, 0 ${-Math.sign(puckVx) * friction * 180}, 2.5`} fill="#f43f5e" />
                    <text x={-Math.sign(puckVx) * friction * 90} y="8" fill="#fda4af" fontSize="7" fontWeight="bold" textAnchor="middle">f_k</text>
                  </g>
                )}
              </g>
            </>
          )}

          {/* RENDER F = MA SIMULATION */}
          {mode === 'second' && (
            <>
              {/* Sliding Track and metrics */}
              <line x1="50" y1="165" x2="450" y2="165" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="3" />
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tick => (
                <g key={tick} transform={`translate(${50 + tick * 37}, 175)`}>
                  <line x1="0" y1="-8" x2="0" y2="-4" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                  <text x="0" y="4" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="monospace" textAnchor="middle">{tick}m</text>
                </g>
              ))}

              {/* Cargo Cart Body */}
              <g transform={`translate(${cartX}, 137)`} className="transition-all duration-75">
                {/* Wooden/Metal Cargo Block */}
                <rect x="-24" y="-20" width="48" height="24" rx="4" fill="url(#grad-orange)" stroke="#fb923c" strokeWidth="1.5" style={{ filter: "drop-shadow(0px 2px 6px rgba(251,146,60,0.2))" }} />
                
                {/* Display Mass Label */}
                <text x="0" y="-7" fill="#ffedd5" fontSize="7.5" fontWeight="bold" textAnchor="middle">{cartMass} kg</text>
                
                {/* Speed Trail Rings */}
                {cartV > 0.1 && (
                  <path d="M -30 -10 Q -40 -10 -45 -8" fill="none" stroke="#f472b6" strokeWidth="1" strokeOpacity="0.4" />
                )}

                {/* Applied Pull Force Vector (Orange) */}
                <g transform={`translate(24, -10)`}>
                  <line x1="0" y1="0" x2={appliedForce * 1.3} y2="0" stroke="#f97316" strokeWidth="2.5" />
                  <polygon points={`${appliedForce * 1.3}, -3.5 ${appliedForce * 1.3 + 5}, 0 ${appliedForce * 1.3}, 3.5`} fill="#f97316" />
                  <text x={appliedForce * 0.65} y="-6" fill="#ffedd5" fontSize="7" fontWeight="bold" textAnchor="middle">F = {appliedForce}N</text>
                </g>

                {/* Acceleration indicator arrow (Purple) */}
                {cartV > 0 && (
                  <g transform={`translate(0, 10)`}>
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#c084fc" strokeWidth="1.5" />
                    <polygon points="12, -2.5 16, 0 12, 2.5" fill="#c084fc" />
                    <text x="0" y="8" fill="#e9d5ff" fontSize="6.5" fontWeight="bold" textAnchor="middle">a = {(appliedForce/cartMass).toFixed(1)} m/s²</text>
                  </g>
                )}
              </g>
            </>
          )}

          {/* RENDER ACTION & REACTION */}
          {mode === 'third' && (
            <>
              {/* Stars decorative details */}
              <circle cx="90" cy="50" r="1" fill="#fff" opacity="0.3" />
              <circle cx="340" cy="40" r="0.75" fill="#fff" opacity="0.5" />
              <circle cx="180" cy="90" r="1.25" fill="#fff" opacity="0.2" />

              {/* Space Station central docking hatch */}
              <line x1="250" y1="50" x2="250" y2="190" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" strokeDasharray="4,4" />

              {/* Astronaut Pod A (Blue) */}
              <g transform={`translate(${astA_X}, 120)`} className="transition-all duration-75">
                <circle r="16" fill="url(#grad-blue)" stroke="#3b82f6" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 10px rgba(59,130,246,0.3))" }} />
                <text x="0" y="3" fill="#bfdbfe" fontSize="7.5" fontWeight="bold" textAnchor="middle">{massA}kg</text>
                <text x="0" y="-20" fill="#93c5fd" fontSize="7" textAnchor="middle" fontWeight="bold">A</text>

                {/* Velocity Vector A */}
                {astA_V !== 0 && (
                  <g transform={`translate(-16, 0)`}>
                    <line x1="0" y1="0" x2={astA_V * 18} y2="0" stroke="#34d399" strokeWidth="2" />
                    <polygon points={`${astA_V * 18}, -2.5 ${astA_V * 18 - 4}, 0 ${astA_V * 18}, 2.5`} fill="#34d399" />
                  </g>
                )}
              </g>

              {/* Astronaut Pod B (Pink) */}
              <g transform={`translate(${astB_X}, 120)`} className="transition-all duration-75">
                <circle r="18" fill="url(#grad-pink)" stroke="#ec4899" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 10px rgba(236,72,153,0.3))" }} />
                <text x="0" y="3" fill="#fce7f3" fontSize="7.5" fontWeight="bold" textAnchor="middle">{massB}kg</text>
                <text x="0" y="-22" fill="#f472b6" fontSize="7" textAnchor="middle" fontWeight="bold">B</text>

                {/* Velocity Vector B */}
                {astB_V !== 0 && (
                  <g transform={`translate(18, 0)`}>
                    <line x1="0" y1="0" x2={astB_V * 18} y2="0" stroke="#34d399" strokeWidth="2" />
                    <polygon points={`${astB_V * 18}, -2.5 ${astB_V * 18 + 4}, 0 ${astB_V * 18}, 2.5`} fill="#34d399" />
                  </g>
                )}
              </g>

              {/* Action/Reaction Impulse Force Vectors (Flashed during launch) */}
              {flashReactionTime > 0 && (
                <g transform="translate(250, 120)">
                  {/* Force on A (Left red vector) */}
                  <line x1="-15" y1="0" x2="-65" y2="0" stroke="#f43f5e" strokeWidth="3" />
                  <polygon points="-65, -4 -72, 0 -65, 4" fill="#f43f5e" />
                  <text x="-45" y="-8" fill="#fda4af" fontSize="8" fontWeight="bold" textAnchor="middle">F_BA = -35N</text>

                  {/* Force on B (Right blue vector) */}
                  <line x1="15" y1="0" x2="65" y2="0" stroke="#fb923c" strokeWidth="3" />
                  <polygon points="65, -4 72, 0 65, 4" fill="#fb923c" />
                  <text x="45" y="-8" fill="#ffedd5" fontSize="8" fontWeight="bold" textAnchor="middle">F_AB = 35N</text>

                  {/* Collision Spark flash */}
                  <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.95)" style={{ filter: "drop-shadow(0 0 15px #f59e0b)" }} />
                  <circle cx="0" cy="0" r="4" fill="#fff" />
                </g>
              )}
            </>
          )}

          {/* RENDER ORBIT AND GRAVITATION */}
          {mode === 'orbit' && (
            (() => {
              // Orbit Math: compute current planet coordinate
              const radiusX = orbitR;
              const radiusY = orbitR * (1 - eccentricity);
              
              const x = 250 + radiusX * Math.cos(orbitAngle);
              const y = 110 + radiusY * Math.sin(orbitAngle);

              // Gravitational force vector angle
              const dx = 250 - x;
              const dy = 110 - y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const ux = dx / dist;
              const uy = dy / dist;

              // Tangential velocity vector angle
              const tx = -Math.sin(orbitAngle);
              const ty = Math.cos(orbitAngle) * (1 - eccentricity);
              const tLen = Math.sqrt(tx*tx + ty*ty);
              const vx = tx / tLen;
              const vy = ty / tLen;

              return (
                <>
                  {/* Orbit Track Outline */}
                  <ellipse cx="250" cy="110" rx={radiusX} ry={radiusY} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Central Shining Star / Sun */}
                  <g transform="translate(250, 110)">
                    {/* Glowing outer aura */}
                    <circle r="22" fill="#eab308" opacity="0.12" style={{ filter: "blur(6px)" }} />
                    <circle r="18" fill="#eab308" opacity="0.22" style={{ filter: "blur(3px)" }} />
                    <circle r="13" fill="url(#grad-orange)" stroke="#f59e0b" strokeWidth="1.5" />
                    {/* Light emission sparks */}
                    <path d="M -15 0 L 15 0 M 0 -15 L 0 15" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" />
                  </g>

                  {/* Satellite / Planet */}
                  <g transform={`translate(${x}, ${y})`}>
                    <circle r="7.5" fill="url(#grad-blue)" stroke="#60a5fa" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 6px rgba(96,165,250,0.3))" }} />
                    
                    {/* Gravitational force arrow pointing inward (Red) */}
                    <line x1="0" y1="0" x2={ux * 30} y2={uy * 30} stroke="#f43f5e" strokeWidth="2" />
                    <polygon points={`${ux * 30}, ${uy * 30} ${ux*26 - uy*3.5}, ${uy*26 + ux*3.5} ${ux*26 + uy*3.5}, ${uy*26 - ux*3.5}`} fill="#f43f5e" />
                    <text x={ux * 38} y={uy * 38 + 2.5} fill="#fda4af" fontSize="6.5" fontWeight="bold" textAnchor="middle">F_g</text>

                    {/* Tangential Velocity Vector Arrow (Green) */}
                    <line x1="0" y1="0" x2={vx * 30} y2={vy * 30} stroke="#10b981" strokeWidth="2" />
                    <polygon points={`${vx * 30}, ${vy * 30} ${vx*26 - vy*3} ${vy*26 + vx*3} ${vx*26 + vy*3} ${vy*26 - vx*3}`} fill="#10b981" />
                    <text x={vx * 38} y={vy * 38 + 2.5} fill="#a7f3d0" fontSize="6.5" fontWeight="bold" textAnchor="middle">v</text>
                  </g>
                </>
              );
            })()
          )}

          {/* RENDER DYNAMIC CONCEPT FLOW SIMULATION */}
          {mode === 'dynamic' && (
            <g transform="translate(0, -10)">
              {/* Render dynamic links */}
              {flowLinks.map((link, idx) => {
                const srcNode = flowNodes.find(n => n.id === link.source);
                const tgtNode = flowNodes.find(n => n.id === link.target);
                if (!srcNode || !tgtNode) return null;

                const x1 = srcNode.x ?? 0;
                const y1 = srcNode.y ?? 0;
                const x2 = tgtNode.x ?? 0;
                const y2 = tgtNode.y ?? 0;

                const cx1 = x1 + (x2 - x1) * 0.25;
                const cy1 = y1 + (y2 - y1) * 0.05;
                const cx2 = x1 + (x2 - x1) * 0.75;
                const cy2 = y1 + (y2 - y1) * 0.95;

                const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

                return (
                  <path
                    key={idx}
                    d={pathD}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1.2"
                    strokeDasharray="2,3"
                  />
                );
              })}

              {/* Render dynamic nodes */}
              {flowNodes.map(node => {
                const x = node.x ?? 0;
                const y = node.y ?? 0;
                const isCircle = node.shape === "circle";
                const r = 13;
                const w = 55;
                const h = 20;

                const isFlash = activeNodeId === node.id && nodeFlashTime > 0;

                return (
                  <g key={node.id} transform={`translate(${x}, ${y})`}>
                    {/* Glowing highlight aura if active/flashing */}
                    {isFlash && (
                      isCircle ? (
                        <circle r={r + 4} fill="none" stroke="#6366f1" strokeWidth="2.5" className="animate-ping" style={{ opacity: 0.75 }} />
                      ) : (
                        <rect x={-w/2 - 2} y={-h/2 - 2} width={w + 4} height={h + 4} rx="4" fill="none" stroke="#6366f1" strokeWidth="2.5" className="animate-ping" style={{ opacity: 0.75 }} />
                      )
                    )}

                    {/* Standard base module block */}
                    {isCircle ? (
                      <circle r={r} fill="#161622" stroke={isFlash ? "#818cf8" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
                    ) : (
                      <rect x={-w/2} y={-h/2} width={w} height={h} rx="4" fill="#161622" stroke={isFlash ? "#818cf8" : "rgba(255,255,255,0.1)"} strokeWidth="1" />
                    )}

                    {/* Faint inside label text */}
                    <text
                      y="2.5"
                      fill={isFlash ? "#fff" : "rgba(255,255,255,0.4)"}
                      fontSize="5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      {node.label.length > 12 ? `${node.label.substring(0, 10)}..` : node.label}
                    </text>
                  </g>
                );
              })}

              {/* Render dynamic traveling particles (Glowing neon spheres) */}
              {particles.map(p => {
                const srcNode = flowNodes.find(n => n.id === p.sourceId);
                const tgtNode = flowNodes.find(n => n.id === p.targetId);
                if (!srcNode || !tgtNode) return null;

                const x1 = srcNode.x ?? 0;
                const y1 = srcNode.y ?? 0;
                const x2 = tgtNode.x ?? 0;
                const y2 = tgtNode.y ?? 0;

                const cx1 = x1 + (x2 - x1) * 0.25;
                const cy1 = y1 + (y2 - y1) * 0.05;
                const cx2 = x1 + (x2 - x1) * 0.75;
                const cy2 = y1 + (y2 - y1) * 0.95;

                // Cubic Bezier interpolation math
                const t = p.progress;
                const mt = 1 - t;
                const px = mt*mt*mt * x1 + 3 * mt*mt * t * cx1 + 3 * mt * t*t * cx2 + t*t*t * x2;
                const py = mt*mt*mt * y1 + 3 * mt*mt * t * cy1 + 3 * mt * t*t * cy2 + t*t*t * y2;

                return (
                  <g key={p.id}>
                    {/* Glowing particle aura */}
                    <circle cx={px} cy={py} r="5" fill="#818cf8" opacity="0.35" style={{ filter: "blur(2px)" }} />
                    {/* Core hot particle */}
                    <circle cx={px} cy={py} r="2.2" fill="#fff" style={{ filter: "drop-shadow(0 0 4px #6366f1)" }} />
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Live Vector Legend overlay */}
        <div className="absolute top-2 left-2 flex gap-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/5 text-[7px] font-mono text-zinc-400">
          {mode === 'dynamic' ? (
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-[#818cf8] inline-block rounded-full animate-ping" /> Logic Signal Pulse
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-3 bg-[#10b981] inline-block rounded-sm" /> Velocity (v⃗)
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-3 bg-[#f43f5e] inline-block rounded-sm" /> Resistance / Forces (F⃗)
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-3 bg-[#fb923c] inline-block rounded-sm" /> Applied Pull
              </div>
            </>
          )}
        </div>

        {/* Live dynamic Ticker Explanatory Banner */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0c0c11]/85 border-t border-white/5 px-3 py-1.5 backdrop-blur-sm z-10 flex items-center gap-2">
          <Activity className="h-3 w-3 text-primary animate-pulse shrink-0" />
          <span className="text-[9px] text-zinc-300 font-light font-sans tracking-wide leading-relaxed truncate">
            {tickerMsg}
          </span>
        </div>
      </div>

      {/* Interactive HUD and Control Sidebar Panel */}
      <div className="w-full lg:w-[200px] shrink-0 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-white/5 rounded-2xl p-3 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300">
        
        {/* Preset Selectors */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-[8px] uppercase tracking-widest font-mono text-zinc-500 dark:text-zinc-400 font-bold">
              Simulator HUD
            </span>
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className="p-1 rounded bg-[#161622] hover:bg-[#1a1a2e] text-zinc-400 hover:text-white transition-all"
              title={isRunning ? "Pause Sandbox" : "Resume Sandbox"}
            >
              {isRunning ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[7.5px] uppercase tracking-widest font-mono text-zinc-500 font-bold">Select Preset</label>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
              <button
                type="button"
                onClick={() => { setMode('inertia'); handlePushPuck('right'); }}
                className={`px-2 py-1 text-[8.5px] font-bold text-left rounded transition-all border ${
                  mode === 'inertia'
                    ? 'bg-primary/10 border-primary/20 text-white'
                    : 'bg-transparent border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                1st Law: Inertia
              </button>
              <button
                type="button"
                onClick={() => { setMode('second'); handleResetCart(); }}
                className={`px-2 py-1 text-[8.5px] font-bold text-left rounded transition-all border ${
                  mode === 'second'
                    ? 'bg-primary/10 border-primary/20 text-white'
                    : 'bg-transparent border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                2nd Law: F = ma
              </button>
              <button
                type="button"
                onClick={() => { setMode('third'); handleAstronautPush(); }}
                className={`px-2 py-1 text-[8.5px] font-bold text-left rounded transition-all border ${
                  mode === 'third'
                    ? 'bg-primary/10 border-primary/20 text-white'
                    : 'bg-transparent border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                3rd Law: Action
              </button>
              <button
                type="button"
                onClick={() => setMode('orbit')}
                className={`px-2 py-1 text-[8.5px] font-bold text-left rounded transition-all border ${
                  mode === 'orbit'
                    ? 'bg-primary/10 border-primary/20 text-white'
                    : 'bg-transparent border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Orbit & Gravity
              </button>
              <button
                type="button"
                onClick={() => { setMode('dynamic'); handleResetSignalFlow(); }}
                className={`px-2 py-1 text-[8.5px] font-bold text-left rounded transition-all border ${
                  mode === 'dynamic'
                    ? 'bg-primary/10 border-primary/20 text-white'
                    : 'bg-transparent border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Concept Flow Lab
              </button>
            </div>
          </div>

          {/* DYNAMIC PARAMETER SLIDERS BASED ON SELECTED MODE */}
          <div className="space-y-3.5 border-t border-white/5 pt-3">
            {mode === 'inertia' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[7.5px] uppercase tracking-wider text-zinc-500 font-bold">Friction (μ)</label>
                  <span className="text-[7.5px] font-mono font-bold text-zinc-300">{friction.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.25"
                  step="0.01"
                  value={friction}
                  onChange={(e) => setFriction(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex gap-1 pt-1.5">
                  <button
                    type="button"
                    onClick={() => handlePushPuck('left')}
                    className="flex-1 py-1 rounded bg-[#161622] hover:bg-white/5 border border-white/5 text-[8px] font-bold text-zinc-300 text-center transition-all"
                  >
                    ◀ Push Left
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePushPuck('right')}
                    className="flex-1 py-1 rounded bg-[#161622] hover:bg-white/5 border border-white/5 text-[8px] font-bold text-zinc-300 text-center transition-all"
                  >
                    Push Right ▶
                  </button>
                </div>
              </div>
            )}

            {mode === 'second' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[7.5px] uppercase tracking-wider text-zinc-500 font-bold">Applied Force (F)</label>
                  <span className="text-[7.5px] font-mono font-bold text-zinc-300">{appliedForce} N</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={appliedForce}
                  onChange={(e) => setAppliedForce(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="text-[7.5px] uppercase tracking-wider text-zinc-500 font-bold">Cart Mass (m)</label>
                  <span className="text-[7.5px] font-mono font-bold text-zinc-300">{cartMass} kg</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={cartMass}
                  onChange={(e) => setCartMass(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <button
                  type="button"
                  onClick={handleResetCart}
                  className="w-full mt-1.5 py-1 rounded bg-[#161622] hover:bg-white/5 border border-white/5 text-[8.5px] font-bold text-zinc-300 text-center transition-all"
                >
                  🚀 Reset / Run Cart
                </button>
              </div>
            )}

            {mode === 'third' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[7.5px] uppercase tracking-wider text-zinc-500 font-bold">Mass A (Blue)</label>
                  <span className="text-[7.5px] font-mono font-bold text-zinc-300">{massA} kg</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={massA}
                  onChange={(e) => setMassA(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="text-[7.5px] uppercase tracking-wider text-zinc-500 font-bold">Mass B (Pink)</label>
                  <span className="text-[7.5px] font-mono font-bold text-zinc-300">{massB} kg</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={massB}
                  onChange={(e) => setMassB(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <button
                  type="button"
                  onClick={handleAstronautPush}
                  className="w-full mt-1.5 py-1 rounded bg-[#161622] hover:bg-white/5 border border-white/5 text-[8.5px] font-bold text-zinc-300 text-center transition-all"
                >
                  💥 Push Astronauts
                </button>
              </div>
            )}

            {mode === 'orbit' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[7.5px] uppercase tracking-wider text-zinc-500 font-bold">Eccentricity (e)</label>
                  <span className="text-[7.5px] font-mono font-bold text-zinc-300">{eccentricity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.45"
                  step="0.05"
                  value={eccentricity}
                  onChange={(e) => setEccentricity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="text-[7.5px] uppercase tracking-wider text-zinc-500 font-bold">Orbital Speed</label>
                  <span className="text-[7.5px] font-mono font-bold text-zinc-300">{(orbitSpeed * 100).toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.08"
                  step="0.01"
                  value={orbitSpeed}
                  onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}

            {mode === 'dynamic' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[7.5px] uppercase tracking-wider text-zinc-500 font-bold">Signal Speed</label>
                  <span className="text-[7.5px] font-mono font-bold text-zinc-300">{pulseSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.1"
                  value={pulseSpeed}
                  onChange={(e) => setPulseSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                />

                <div className="flex gap-1 pt-1.5">
                  <button
                    type="button"
                    onClick={handleTriggerPulse}
                    className="flex-1 py-1 rounded bg-[#161622] hover:bg-white/5 border border-white/5 text-[8px] font-bold text-zinc-300 text-center transition-all flex items-center justify-center gap-1"
                  >
                    ⚡ Trigger Pulse
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSignalFlow}
                    className="flex-1 py-1 rounded bg-[#161622] hover:bg-white/5 border border-white/5 text-[8px] font-bold text-zinc-300 text-center transition-all"
                  >
                    🔄 Clear Flow
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Small pedagogical guidance banner */}
        <div className="text-[7.5px] text-zinc-500 font-light pt-2.5 border-t border-white/5 mt-3 space-y-0.5">
          <p>💡 Vectors scale according to mathematical values.</p>
          <p>💡 Toggle inputs to test physical hypotheses instantly.</p>
        </div>
      </div>
    </div>
  );
}


// --- MAIN MARKDOWN PARSER COMPONENT ---
export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Split into blocks by triple backticks for code block processing
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3.5 text-xs text-zinc-200 leading-relaxed font-light">
      {parts.map((part, idx) => {
        if (part.startsWith("```")) {
          // It's a code block
          const match = part.match(/```([a-zA-Z0-9+_-]*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "";
          const code = match ? match[2].trim() : part.slice(3, -3).trim();

          if (lang === "mermaid") {
            return <FlowchartRenderer key={idx} code={code} />;
          }

          return (
            <pre key={idx} className="bg-zinc-950 p-4 rounded-2xl text-[10px] font-mono border border-white/5 overflow-x-auto text-zinc-300 leading-normal spatial-shadow-sm my-2">
              <code className="block">{code}</code>
            </pre>
          );
        }

        // It's basic markdown text
        return <MarkdownTextBlock key={idx} text={part} />;
      })}
    </div>
  );
}

// --- PARSING INLINE FORMATTING & BLOCKS ---
function MarkdownTextBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const pushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1.5 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("## ")) {
      pushList(idx);
      const content = parseInline(trimmed.substring(3));
      elements.push(<h3 key={idx} className="text-sm font-bold text-white uppercase tracking-wider mt-4 mb-2 biometric-glow">{content}</h3>);
      return;
    }
    if (trimmed.startsWith("### ")) {
      pushList(idx);
      const content = parseInline(trimmed.substring(4));
      elements.push(<h4 key={idx} className="text-xs font-bold text-zinc-300 mt-3 mb-1.5">{content}</h4>);
      return;
    }
    if (trimmed.startsWith("#### ")) {
      pushList(idx);
      const content = parseInline(trimmed.substring(5));
      elements.push(<h5 key={idx} className="text-[11px] font-bold text-zinc-400 mt-2 mb-1">{content}</h5>);
      return;
    }

    // Dividers
    if (trimmed === "---" || trimmed === "___" || trimmed === "***") {
      pushList(idx);
      elements.push(<div key={idx} className="h-[1px] bg-white/5 my-4 border-none" />);
      return;
    }

    // List items: * or -
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const content = parseInline(trimmed.substring(2));
      listItems.push(<li key={`li-${idx}`} className="font-light">{content}</li>);
      return;
    }

    // Math block equation: $$ ... $$
    if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
      pushList(idx);
      const formula = trimmed.substring(2, trimmed.length - 2).trim();
      elements.push(
        <div key={idx} className="bg-[#0f0f13]/80 border border-white/5 p-4 rounded-2xl my-3 text-center shadow-inner flex items-center justify-center select-all">
          <span className="text-primary dark:text-purple-300 text-sm font-medium tracking-wide flex items-center justify-center gap-1">
            {parseLaTeXToReact(formula)}
          </span>
        </div>
      );
      return;
    }

    // Empty lines
    if (!trimmed) {
      pushList(idx);
      return;
    }

    // Standard paragraph line
    pushList(idx);
    const content = parseInline(line);
    elements.push(<p key={idx} className="mb-2 leading-relaxed font-light">{content}</p>);
  });

  // Push remaining list items
  pushList(lines.length);

  return <>{elements}</>;
}

// --- UTILITY TO FIND MATCHING NESTED BRACE ---
function findMatchingBrace(str: string, startIndex: number): number {
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// --- HIGH-FIDELITY LATEX FORMULA RENDERING ENGINE ---
function parseLaTeXToReact(str: string): React.ReactNode {
  let index = 0;

  function parseNext(): React.ReactNode {
    if (index >= str.length) return null;

    // Skip whitespace
    while (index < str.length && /\s/.test(str[index])) {
      index++;
    }

    if (index >= str.length) return null;

    // Check for LaTeX commands starting with \
    if (str[index] === '\\') {
      index++; // consume \
      let cmd = '';
      while (index < str.length && /[a-zA-Z]/.test(str[index])) {
        cmd += str[index];
        index++;
      }

      if (cmd === 'frac') {
        // Find numerator
        while (index < str.length && str[index] !== '{') index++;
        if (index < str.length) {
          const numStart = index;
          const numEnd = findMatchingBrace(str, numStart);
          if (numEnd !== -1) {
            const numText = str.substring(numStart + 1, numEnd);
            index = numEnd + 1;

            // Find denominator
            while (index < str.length && str[index] !== '{') index++;
            if (index < str.length) {
              const denStart = index;
              const denEnd = findMatchingBrace(str, denStart);
              if (denEnd !== -1) {
                const denText = str.substring(denStart + 1, denEnd);
                index = denEnd + 1;

                // Recursively parse numerator and denominator
                const numNode = parseLaTeXToReact(numText);
                const denNode = parseLaTeXToReact(denText);

                return (
                  <span key={index} className="inline-flex flex-col items-center justify-center align-middle mx-1 text-center select-all">
                    <span className="text-[10px] sm:text-xs leading-none pb-1 border-b border-zinc-500/30 w-full text-center">
                      {numNode}
                    </span>
                    <span className="text-[10px] sm:text-xs leading-none pt-1 w-full text-center">
                      {denNode}
                    </span>
                  </span>
                );
              }
            }
          }
        }
      } else if (cmd === 'vec') {
        // Find target
        let targetText = '';
        if (str[index] === '{') {
          const targetStart = index;
          const targetEnd = findMatchingBrace(str, targetStart);
          if (targetEnd !== -1) {
            targetText = str.substring(targetStart + 1, targetEnd);
            index = targetEnd + 1;
          }
        } else {
          // Single character
          targetText = str[index] || '';
          index++;
        }

        const targetNode = parseLaTeXToReact(targetText);
        return (
          <span key={index} className="relative inline-block align-middle select-all mr-0.5 ml-0.5">
            <span className="absolute -top-[9px] left-0 right-0 text-center text-[7px] leading-none pointer-events-none select-none font-sans font-bold text-primary dark:text-purple-400">
              →
            </span>
            <span className="font-serif italic">{targetNode}</span>
          </span>
        );
      } else if (cmd === 'text' || cmd === 'mathrm') {
        let textVal = '';
        if (str[index] === '{') {
          const targetStart = index;
          const targetEnd = findMatchingBrace(str, targetStart);
          if (targetEnd !== -1) {
            textVal = str.substring(targetStart + 1, targetEnd);
            index = targetEnd + 1;
          }
        }
        return <span key={index} className="font-sans italic-none">{textVal}</span>;
      } else {
        // Translate Greek / Math Symbols
        const symbols: Record<string, string> = {
          'implies': '⟹',
          'impliedby': '⟸',
          'iff': '⟺',
          'cdot': '·',
          'times': '×',
          'alpha': 'α',
          'beta': 'β',
          'gamma': 'γ',
          'delta': 'δ',
          'epsilon': 'ε',
          'theta': 'θ',
          'lambda': 'λ',
          'mu': 'μ',
          'pi': 'π',
          'sigma': 'σ',
          'phi': 'φ',
          'omega': 'ω',
          'Delta': 'Δ',
          'Sigma': 'Σ',
          'Omega': 'Ω',
          'approx': '≈',
          'le': '≤',
          'ge': '≥',
          'neq': '≠',
          'pm': '±',
          'infty': '∞',
          'partial': '∂',
          'nabla': '∇',
          'hbar': 'ħ',
          'sqrt': '√'
        };
        const sym = symbols[cmd] || cmd;
        return <span key={index} className="font-sans mx-0.5 text-zinc-200">{sym}</span>;
      }
    }

    // Check for subscript or superscript
    const char = str[index];
    index++;

    if (char === '_') {
      // Subscript
      let subText = '';
      if (str[index] === '{') {
        const subStart = index;
        const subEnd = findMatchingBrace(str, subStart);
        if (subEnd !== -1) {
          subText = str.substring(subStart + 1, subEnd);
          index = subEnd + 1;
        }
      } else {
        subText = str[index] || '';
        index++;
      }
      const subNode = parseLaTeXToReact(subText);
      return <sub key={index} className="text-[8px] align-sub leading-none opacity-80 select-all">{subNode}</sub>;
    }

    if (char === '^') {
      // Superscript
      let supText = '';
      if (str[index] === '{') {
        const supStart = index;
        const supEnd = findMatchingBrace(str, supStart);
        if (supEnd !== -1) {
          supText = str.substring(supStart + 1, supEnd);
          index = supEnd + 1;
        }
      } else {
        supText = str[index] || '';
        index++;
      }
      const supNode = parseLaTeXToReact(supText);
      return <sup key={index} className="text-[8px] align-super leading-none opacity-80 select-all">{supNode}</sup>;
    }

    // Check if it's a variable (single letter) that needs math-serif rendering
    if (/[a-zA-Z]/.test(char)) {
      return <span key={index} className="font-serif italic mr-0.5 text-zinc-100 select-all">{char}</span>;
    }

    // Numbers or math operators
    return <span key={index} className="font-sans text-zinc-300 mx-0.5 select-all">{char}</span>;
  }

  const nodes: React.ReactNode[] = [];
  while (index < str.length) {
    const node = parseNext();
    if (node) {
      nodes.push(node);
    }
  }

  return <>{nodes}</>;
}

// --- FLUX-POWERED IMAGE GENERATOR WITH PUTER.JS ---
// Detects flux:// protocol and generates images via Puter.js + FLUX models.
// Falls back to standard URL loading for regular image URLs.
// Each instance independently manages its own state — multiple images generate in PARALLEL.
function ImageWithSkeleton({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = React.useState<'loading' | 'generating' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [progressMsg, setProgressMsg] = React.useState('Initializing...');
  const generatedRef = React.useRef(false);

  // Check if this is a FLUX generation request (flux:// protocol)
  const isFluxRequest = src.startsWith('flux://');

  React.useEffect(() => {
    if (!isFluxRequest) return; // Standard URL — let the <img> tag handle it
    if (generatedRef.current) return; // Prevent double-generation in StrictMode
    generatedRef.current = true;

    const generateWithFlux = async () => {
      setStatus('generating');
      setProgressMsg('Connecting to FLUX model...');

      // Decode the prompt from the flux:// URL
      const fluxPrompt = decodeURIComponent(src.replace('flux://', ''));

      try {
        // Wait for Puter.js SDK to be available (loaded async via script tag)
        let attempts = 0;
        while (typeof puter === 'undefined' && attempts < 30) {
          await new Promise(r => setTimeout(r, 200));
          attempts++;
        }

        if (typeof puter === 'undefined') {
          throw new Error('Puter.js SDK not loaded');
        }

        setProgressMsg('FLUX model generating image...');

        // Generate image using Puter.js + FLUX model
        const imageElement = await puter.ai.txt2img(fluxPrompt, {
          model: 'black-forest-labs/flux-1-schnell',  // Fast FLUX model
        });

        // Extract the base64 data URL from the returned HTMLImageElement
        if (imageElement && imageElement.src) {
          setImageSrc(imageElement.src);
          setStatus('loaded');
        } else {
          throw new Error('No image data returned from FLUX model');
        }
      } catch (err) {
        console.error('[FLUX Image Generation] Error:', err);
        setProgressMsg('FLUX failed, trying fallback...');

        // Fallback: Try Pollinations.ai with the same prompt
        try {
          const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
            fluxPrompt + ', highly detailed textbook schematic, professionally designed educational diagram, 8k resolution'
          )}?width=768&height=512&nologo=true`;
          setImageSrc(fallbackUrl);
          setStatus('loading'); // Let the <img> onLoad handle it
        } catch {
          setStatus('error');
        }
      }
    };

    generateWithFlux();
  }, [isFluxRequest, src]);

  // For FLUX-generated images (base64 result)
  if (isFluxRequest && status === 'generating') {
    return (
      <div className="relative w-full my-3">
        <div className="w-full aspect-[3/2] rounded-2xl border border-white/5 bg-[#0d0d11]/80 flex items-center justify-center relative overflow-hidden">
          {/* Animated shimmer background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          {/* Decorative corner glows */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-primary/10 rounded-full filter blur-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#6366f1]/10 rounded-full filter blur-xl pointer-events-none" />
          <div className="text-center space-y-3 relative z-10">
            <div className="relative mx-auto w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
              <div className="absolute inset-1.5 rounded-full border border-[#6366f1]/20 border-b-[#6366f1] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-primary/80 uppercase tracking-wider font-bold block">
                ⚡ FLUX Image Generation
              </span>
              <span className="text-[9px] text-zinc-500 block animate-pulse font-light">
                {progressMsg}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine the actual src for the img tag
  const effectiveSrc = imageSrc || (isFluxRequest ? '' : src);

  return (
    <div className="relative w-full my-3">
      {/* Skeleton placeholder frame while image loads */}
      {(status === 'loading' && !imageSrc && !isFluxRequest) && (
        <div className="w-full aspect-[3/2] rounded-2xl border border-white/5 bg-[#0d0d11]/80 animate-pulse flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          <div className="text-center space-y-2.5 relative z-10">
            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block">Generating visual...</span>
            <span className="text-[8px] text-zinc-600 block">Image loading in background</span>
          </div>
        </div>
      )}
      {/* Error fallback */}
      {status === 'error' && (
        <div className="w-full aspect-[3/2] rounded-2xl border border-rose-500/10 bg-rose-500/5 flex items-center justify-center">
          <span className="text-[10px] text-zinc-400 font-light">Image could not be loaded</span>
        </div>
      )}
      {/* Actual image — always rendered when we have a src, hidden until loaded */}
      {effectiveSrc && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={effectiveSrc}
            alt={alt}
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('error')}
            loading="eager"
            className={`max-w-full w-full h-auto rounded-2xl border border-white/5 shadow-md block spatial-shadow object-contain transition-opacity duration-700 ${
              status === 'loaded' ? 'opacity-100' : 'w-0 h-0 opacity-0 absolute overflow-hidden'
            }`}
          />
          {/* FLUX badge for AI-generated images */}
          {status === 'loaded' && isFluxRequest && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[8px] text-zinc-300 font-bold uppercase tracking-wider">
              ⚡ FLUX AI
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper to replace inline formatting: **bold**, *italic*, `code`, $math$, and ![image](url)
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match: Image (![alt](url)), Math ($...$), Bold (**...**), Italic (*...*), Inline Code (`...`)
  const regex = /(!\[.*?\]\(.*?\)|$$\$.*?\$\$|\$.*?\$|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("![") && part.includes("](")) {
      const match = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const alt = match[1];
        const url = match[2];
        return <ImageWithSkeleton key={idx} src={url} alt={alt} />;
      }
    }
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const formula = part.substring(2, part.length - 2).trim();
      return (
        <span key={idx} className="inline-flex items-center text-primary dark:text-purple-300 font-medium px-2 py-0.5 bg-white/5 border border-white/5 rounded mx-1 select-all">
          {parseLaTeXToReact(formula)}
        </span>
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      const formula = part.substring(1, part.length - 1).trim();
      return (
        <span key={idx} className="inline-flex items-center text-primary dark:text-purple-300 font-medium px-1.5 py-0.5 bg-white/5 border border-white/5 rounded mx-0.5 select-all">
          {parseLaTeXToReact(formula)}
        </span>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-bold text-white">{part.substring(2, part.length - 2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx} className="italic text-zinc-300">{part.substring(1, part.length - 1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="bg-white/5 border border-white/5 text-purple-400 px-1 py-0.5 rounded font-mono text-[10px] mx-0.5">
          {part.substring(1, part.length - 1)}
        </code>
      );
    }
    return parseLaTeXToReact(part);
  });
}
