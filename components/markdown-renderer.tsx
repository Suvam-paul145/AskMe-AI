import React from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

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

  if (nodes.length === 0) {
    return <pre className="bg-zinc-950 p-3 rounded-lg text-xs font-mono border border-white/5 overflow-x-auto">{code}</pre>;
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

      {/* Header HUD */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary dark:text-purple-400 flex items-center gap-2 biometric-glow">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          Interactive Learning Flow
        </span>
        <button
          type="button"
          onClick={handleResetLayout}
          className="rounded-lg border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#09090b]/60 hover:bg-zinc-200 dark:hover:bg-[#09090b]/90 px-2.5 py-1 text-[9px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all uppercase tracking-wider"
        >
          Reset Layout
        </button>
      </div>

      {/* Main Grid Layout for SVG and Info Side Panel */}
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

        {/* Floating Figma/CAD Style viewport controls HUD */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-[#09090b]/90 border border-zinc-200 dark:border-white/5 backdrop-blur-md px-2 py-1 rounded-xl z-20 shadow-lg select-none">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(z / 1.15, 0.4))}
            className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[9px] font-mono text-zinc-400 font-bold px-1.5 min-w-[32px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(z * 1.15, 5))}
            className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="h-3.5 w-[1px] bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Reset Viewport"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
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

      {/* Helpful Hint banner */}
      <span className="mt-3.5 text-[9px] text-zinc-500 dark:text-zinc-400 font-light z-10">
        💡 Drag nodes above to organize overlays. Stages are color-coded: Ingestion/Docs (Green), Vector Data (Blue), Inputs/Query (Orange), and Model Answers (Pink).
      </span>
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
        <div key={idx} className="bg-primary/5 border border-primary/10 p-3.5 rounded-2xl my-3 text-center shadow-inner">
          <code className="text-primary dark:text-purple-400 text-xs font-mono font-medium tracking-wide">
            {formatMath(formula)}
          </code>
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

// --- LATEX TO UNICODE MATH FORMATTER ---
function formatMath(text: string): string {
  let formatted = text;

  // Replace text tags: \text{something} -> something
  formatted = formatted.replace(/\\text\{([^{}]+)\}/g, "$1");
  formatted = formatted.replace(/\\mathrm\{([^{}]+)\}/g, "$1");

  // Math symbol replacements
  const replacements: [RegExp, string | ((substring: string, ...args: string[]) => string)][] = [
    [/\\alpha/g, "α"],
    [/\\beta/g, "β"],
    [/\\gamma/g, "γ"],
    [/\\delta/g, "δ"],
    [/\\epsilon/g, "ε"],
    [/\\zeta/g, "ζ"],
    [/\\eta/g, "η"],
    [/\\theta/g, "θ"],
    [/\\iota/g, "ι"],
    [/\\kappa/g, "κ"],
    [/\\lambda/g, "λ"],
    [/\\mu/g, "μ"],
    [/\\nu/g, "ν"],
    [/\\xi/g, "ξ"],
    [/\\pi/g, "π"],
    [/\\rho/g, "ρ"],
    [/\\sigma/g, "σ"],
    [/\\tau/g, "τ"],
    [/\\upsilon/g, "υ"],
    [/\\phi/g, "φ"],
    [/\\chi/g, "χ"],
    [/\\psi/g, "ψ"],
    [/\\omega/g, "omega"], // Wait! \omega -> ω, let's fix it below
    
    // Capital Greek
    [/\\Delta/g, "Δ"],
    [/\\Sigma/g, "Σ"],
    [/\\Omega/g, "Ω"],
    [/\\Pi/g, "Π"],
    [/\\Phi/g, "Φ"],
    [/\\Psi/g, "Ψ"],

    // Operators and Brackets
    [/\\langle/g, "⟨"],
    [/\\rangle/g, "⟩"],
    [/\\sum/g, "∑"],
    [/\\int/g, "∫"],
    [/\\times/g, "×"],
    [/\\approx/g, "≈"],
    [/\\cdot/g, "·"],
    [/\\infty/g, "∞"],
    [/\\partial/g, "∂"],
    [/\\nabla/g, "∇"],
    [/\\hbar/g, "ħ"],
    [/\\sqrt/g, "√"],
    [/\\le/g, "≤"],
    [/\\ge/g, "≥"],
    [/\\neq/g, "≠"],
    [/\\pm/g, "±"],

    // Subscripts
    [/_i/g, "ᵢ"],
    [/_j/g, "ⱼ"],
    [/_x/g, "ₓ"],
    [/_y/g, "y"], // y -> y is standard subscript representation
    [/_z/g, "z"],
    [/_0/g, "₀"],
    [/_1/g, "₁"],
    [/_2/g, "₂"],
    [/_3/g, "₃"],
    [/_4/g, "₄"],
    [/_5/g, "₅"],
    [/_6/g, "₆"],
    [/_7/g, "₇"],
    [/_8/g, "₈"],
    [/_9/g, "₉"],
    [/_n/g, "ₙ"],
    [/_t/g, "ₜ"],
    [/_\{(\w+)\}/g, (_: string, p1: string) => p1.split("").map((c: string) => {
      const subs: Record<string, string> = {
        "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
        "a": "ₐ", "e": "ₑ", "h": "ₕ", "i": "ᵢ", "j": "ⱼ", "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "o": "ₒ", "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ", "u": "ᵤ", "v": "ᵥ", "x": "ₓ"
      };
      return subs[c] || c;
    }).join("")],

    // Superscripts
    [/\^2/g, "²"],
    [/\^3/g, "³"],
    [/\^n/g, "ⁿ"],
    [/\^x/g, "ˣ"],
    [/\^\{(\w+)\}/g, (_: string, p1: string) => p1.split("").map((c: string) => {
      const sups: Record<string, string> = {
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
        "a": "ᵃ", "b": "ᵇ", "c": "ᶜ", "d": "ᵈ", "e": "ᵉ", "f": "ᶠ", "g": "ᵍ", "h": "ʰ", "i": "ⁱ", "j": "ʲ", "k": "ᵏ", "l": "ˡ", "m": "ᵐ", "n": "ⁿ", "o": "ᵒ", "p": "ᵖ", "r": "ʳ", "s": "ˢ", "t": "ᵗ", "u": "ᵘ", "v": "ᵛ", "w": "ʷ", "x": "ˣ", "y": "ʸ", "z": "ᶻ"
      };
      return sups[c] || c;
    }).join("")],
  ];

  // Specific fix for \omega -> ω
  formatted = formatted.replace(/\\omega/g, "ω");

  for (const [regex, replacement] of replacements) {
    formatted = formatted.replace(regex, replacement as unknown as string);
  }

  // Remove any remaining stray backslashes before characters
  formatted = formatted.replace(/\\([a-zA-Z])/g, "$1");

  return formatted;
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
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={idx}
            src={url}
            alt={alt}
            className="max-w-full w-full h-auto rounded-2xl border border-white/5 my-3 shadow-md block spatial-shadow object-contain"
          />
        );
      }
    }
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const formula = part.substring(2, part.length - 2).trim();
      return (
        <code key={idx} className="text-primary dark:text-purple-400 bg-primary/5 px-2 py-1 rounded-md font-mono text-[10px] font-medium mx-1 border border-primary/10">
          {formatMath(formula)}
        </code>
      );
    }
    if (part.startsWith("$") && part.endsWith("$")) {
      const formula = part.substring(1, part.length - 1).trim();
      return (
        <code key={idx} className="text-primary dark:text-purple-400 bg-primary/5 px-1.5 py-0.5 rounded-md font-mono text-[10px] font-medium mx-0.5 border border-primary/10">
          {formatMath(formula)}
        </code>
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
    return formatMath(part);
  });
}
