import React from "react";

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
    const levels = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);
    const ySpacing = height / (levels.length + 1 || 2);
    
    levels.forEach((lvl, lvlIdx) => {
      const group = levelGroups[lvl];
      const xSpacing = width / (group.length + 1 || 2);
      group.forEach((node, nodeIdx) => {
        node.x = xSpacing * (nodeIdx + 1);
        node.y = ySpacing * (lvlIdx + 1);
      });
    });
  } else {
    // Left-Right layout
    const levels = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);
    const xSpacing = width / (levels.length + 1 || 2);
    
    levels.forEach((lvl, lvlIdx) => {
      const group = levelGroups[lvl];
      const ySpacing = height / (group.length + 1 || 2);
      group.forEach((node, nodeIdx) => {
        node.x = xSpacing * (lvlIdx + 1);
        node.y = ySpacing * (nodeIdx + 1);
      });
    });
  }

  return { nodes, links, direction };
}

// --- DIAGRAM RENDERER COMPONENT ---
export function FlowchartRenderer({ code }: { code: string }) {
  const parsed = React.useMemo(() => parseMermaid(code), [code]);
  const [nodes, setNodes] = React.useState<FlowNode[]>([]);
  const [links, setLinks] = React.useState<FlowLink[]>([]);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setNodes(parsed.nodes);
      setLinks(parsed.links);
    }, 0);
    return () => clearTimeout(timer);
  }, [parsed]);

  if (nodes.length === 0) {
    return <pre className="bg-zinc-950 p-3 rounded-lg text-xs font-mono border border-white/5 overflow-x-auto">{code}</pre>;
  }

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setDraggingId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // Scale client coords to match SVG viewBox (500x280)
    const scaleX = 500 / rect.width;
    const scaleY = 280 / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Constrain inside bounds
    const boundedX = Math.max(15, Math.min(485, x));
    const boundedY = Math.max(15, Math.min(265, y));

    setNodes(prev => prev.map(n => n.id === draggingId ? { ...n, x: boundedX, y: boundedY } : n));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleResetLayout = () => {
    setNodes(parsed.nodes);
    setLinks(parsed.links);
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
    <div className="w-full bg-[#0d0d11]/80 border border-white/5 rounded-3xl p-5 my-5 flex flex-col items-center justify-center glass-card relative overflow-hidden shadow-2xl matte-layer spatial-shadow-lg select-none">
      
      {/* Decorative glows inside container */}
      <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-[#6366f1]/5 rounded-full filter blur-2xl pointer-events-none" />

      {/* Header HUD */}
      <div className="w-full flex items-center justify-between mb-3.5 z-10">
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary dark:text-purple-400 flex items-center gap-2 biometric-glow">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          Interactive Learning Flow
        </span>
        <button
          type="button"
          onClick={handleResetLayout}
          className="rounded-lg border border-white/5 bg-[#09090b]/60 hover:bg-[#09090b]/90 px-2.5 py-1 text-[9px] font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-wider"
        >
          Reset Layout
        </button>
      </div>

      <div className="relative w-full max-w-[500px] aspect-[16/9] overflow-hidden select-none z-10">
        <svg
          ref={svgRef}
          viewBox="0 0 500 280"
          className="w-full h-full"
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
                  className="cursor-pointer group"
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
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
        </svg>
      </div>

      {/* Helpful Hint banner */}
      <span className="mt-2.5 text-[9px] text-zinc-500 font-light z-10">
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
            className="max-w-md w-full h-auto rounded-2xl border border-white/5 my-3 shadow-md block spatial-shadow"
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
