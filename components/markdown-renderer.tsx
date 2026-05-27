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

    // Match links: A --> B, A --- B, A -->|text| B, A -- text --> B
    const linkMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*(?:-->|---|--\s*[a-zA-Z0-9\s_-]+\s*-->)\s*([a-zA-Z0-9_-]+)/);
    
    // Node definition with label: A[Label], A(Label), A((Label))
    const nodeMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*(?:\[(.*?)\]|\((.*?)\))/);

    if (nodeMatch) {
      const id = nodeMatch[1];
      const label = nodeMatch[2] || nodeMatch[3] || id;
      const shape = trimmed.includes("[") ? "rect" : "circle";
      const node = getOrCreateNode(id, label);
      node.shape = shape as any;
    } else if (trimmed.includes("-->") || trimmed.includes("---")) {
      // Complex link parsing: support labels on edges
      let sourceId = "";
      let targetId = "";
      let edgeLabel = "";

      if (trimmed.includes("-->|")) {
        const parts = trimmed.split("-->|");
        sourceId = parts[0].trim();
        const subparts = parts[1].split("|");
        edgeLabel = subparts[0].trim();
        targetId = subparts[1].trim();
      } else {
        const arrowMatch = trimmed.match(/([a-zA-Z0-9_-]+)\s*-->\s*([a-zA-Z0-9_-]+)/);
        if (arrowMatch) {
          sourceId = arrowMatch[1];
          targetId = arrowMatch[2];
        }
      }

      if (sourceId && targetId) {
        // Handle inline node definition in link lines (e.g. A[Label] --> B[Label])
        const srcNodeMatch = sourceId.match(/^([a-zA-Z0-9_-]+)(?:\[(.*?)\]|\((.*?)\))/);
        if (srcNodeMatch) {
          sourceId = srcNodeMatch[1];
          getOrCreateNode(sourceId, srcNodeMatch[2] || srcNodeMatch[3]);
        } else {
          getOrCreateNode(sourceId);
        }

        const tgtNodeMatch = targetId.match(/^([a-zA-Z0-9_-]+)(?:\[(.*?)\]|\((.*?)\))/);
        if (tgtNodeMatch) {
          targetId = tgtNodeMatch[1];
          getOrCreateNode(targetId, tgtNodeMatch[2] || tgtNodeMatch[3]);
        } else {
          getOrCreateNode(targetId);
        }

        links.push({ source: sourceId, target: targetId, label: edgeLabel });
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
  const { nodes, links } = parseMermaid(code);

  if (nodes.length === 0) {
    return <pre className="bg-zinc-950 p-3 rounded-lg text-xs font-mono border border-white/5 overflow-x-auto">{code}</pre>;
  }

  return (
    <div className="w-full bg-black/45 border border-white/5 rounded-2xl p-4 my-4 flex flex-col items-center justify-center glass-card matte-layer shadow-lg">
      <span className="text-[9px] uppercase font-bold tracking-widest text-primary dark:text-purple-400 mb-2 self-start flex items-center gap-1.5 biometric-glow">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
        Interactive AI Concept Map
      </span>
      <div className="relative w-full max-w-[500px] aspect-[16/9] overflow-hidden select-none">
        <svg viewBox="0 0 500 280" className="w-full h-full">
          {/* Defs for arrow markers */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(139, 92, 246, 0.45)" />
            </marker>
          </defs>

          {/* Links */}
          {links.map((link, idx) => {
            const srcNode = nodes.find(n => n.id === link.source);
            const tgtNode = nodes.find(n => n.id === link.target);
            if (!srcNode || !tgtNode) return null;

            const x1 = srcNode.x || 0;
            const y1 = srcNode.y || 0;
            const x2 = tgtNode.x || 0;
            const y2 = tgtNode.y || 0;

            // Draw clean curved path for visual depth
            const cx1 = x1 + (x2 - x1) * 0.25;
            const cy1 = y1 + (y2 - y1) * 0.05;
            const cx2 = x1 + (x2 - x1) * 0.75;
            const cy2 = y1 + (y2 - y1) * 0.95;

            return (
              <g key={idx}>
                <path
                  d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                  className="transition-all hover:stroke-primary duration-300"
                />
                {link.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 4}
                    fill="rgba(255,255,255,0.4)"
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const x = node.x || 0;
            const y = node.y || 0;
            const isCircle = node.shape === "circle";
            const nodeWidth = 90;
            const nodeHeight = 32;

            return (
              <g key={node.id} className="cursor-pointer group">
                {isCircle ? (
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill="rgba(20, 20, 25, 0.9)"
                    stroke="rgba(139, 92, 246, 0.45)"
                    strokeWidth="1.5"
                    className="group-hover:stroke-primary transition-colors duration-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                  />
                ) : (
                  <rect
                    x={x - nodeWidth / 2}
                    y={y - nodeHeight / 2}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="8"
                    fill="rgba(20, 20, 25, 0.9)"
                    stroke="rgba(139, 92, 246, 0.45)"
                    strokeWidth="1.5"
                    className="group-hover:stroke-primary transition-colors duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  />
                )}
                {/* Node Label Text */}
                <text
                  x={x}
                  y={y + 3}
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  className="pointer-events-none text-zinc-100 group-hover:text-white transition-colors"
                >
                  {node.label.length > 16 ? `${node.label.substring(0, 14)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>
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
  let inList = false;

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
      inList = false;
      const content = parseInline(trimmed.substring(3));
      elements.push(<h3 key={idx} className="text-sm font-bold text-white uppercase tracking-wider mt-4 mb-2 biometric-glow">{content}</h3>);
      return;
    }
    if (trimmed.startsWith("### ")) {
      pushList(idx);
      inList = false;
      const content = parseInline(trimmed.substring(4));
      elements.push(<h4 key={idx} className="text-xs font-bold text-zinc-300 mt-3 mb-1.5">{content}</h4>);
      return;
    }
    if (trimmed.startsWith("#### ")) {
      pushList(idx);
      inList = false;
      const content = parseInline(trimmed.substring(5));
      elements.push(<h5 key={idx} className="text-[11px] font-bold text-zinc-400 mt-2 mb-1">{content}</h5>);
      return;
    }

    // Dividers
    if (trimmed === "---" || trimmed === "___" || trimmed === "***") {
      pushList(idx);
      inList = false;
      elements.push(<div key={idx} className="h-[1px] bg-white/5 my-4 border-none" />);
      return;
    }

    // List items: * or -
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      inList = true;
      const content = parseInline(trimmed.substring(2));
      listItems.push(<li key={`li-${idx}`} className="font-light">{content}</li>);
      return;
    }

    // Math block equation: $$ ... $$
    if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
      pushList(idx);
      inList = false;
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
      inList = false;
      return;
    }

    // Standard paragraph line
    pushList(idx);
    inList = false;
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
  const replacements: [RegExp, any][] = [
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
    formatted = formatted.replace(regex, replacement as any);
  }

  // Remove any remaining stray backslashes before characters
  formatted = formatted.replace(/\\([a-zA-Z])/g, "$1");

  return formatted;
}

// Helper to replace inline formatting: **bold**, *italic*, `code`, and $math$
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match: Math ($...$), Bold (**...**), Italic (*...*), Inline Code (`...`)
  const regex = /(\$\$.*?\$\$|\$.*?\$|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
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
