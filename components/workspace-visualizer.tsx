import React, { useState, useEffect, useRef } from "react";
import { Brain, HelpCircle, Activity } from "lucide-react";

interface DocumentNode {
  id: string;
  title: string;
  summary?: {
    keyPoints?: string[];
  };
}

interface VisualizerProps {
  documents: DocumentNode[];
  selectedDocId: string | null;
  attachedDocIds: string[];
  onToggleAttach: (docId: string) => void;
  lastAiMessage?: {
    text: string;
    sources?: string[];
  };
}

interface GraphNode {
  id: string;
  label: string;
  type: "document" | "concept" | "query" | "chunk";
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  parentId?: string;
  color?: string;
  attached?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  type: "doc-concept" | "query-chunk" | "chunk-doc" | "concept-bridge";
}

export default function WorkspaceVisualizer({
  documents,
  selectedDocId,
  attachedDocIds,
  onToggleAttach,
  lastAiMessage,
}: VisualizerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Refs for tracking simulation states between renders
  const nodesRef = useRef<GraphNode[]>([]);
  const draggingNodeRef = useRef<string | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  // Generate document colors using HSL gradients
  const getDocColors = (title: string, index: number) => {
    const gradients = [
      { from: "from-indigo-500", to: "to-purple-600", stroke: "rgb(99, 102, 241)", glow: "rgba(99, 102, 241, 0.4)" },
      { from: "from-emerald-500", to: "to-teal-600", stroke: "rgb(16, 185, 129)", glow: "rgba(16, 185, 129, 0.4)" },
      { from: "from-amber-500", to: "to-orange-600", stroke: "rgb(245, 158, 11)", glow: "rgba(245, 158, 11, 0.4)" },
      { from: "from-rose-500", to: "to-pink-600", stroke: "rgb(244, 63, 94)", glow: "rgba(244, 63, 94, 0.4)" },
      { from: "from-cyan-500", to: "to-blue-600", stroke: "rgb(6, 182, 212)", glow: "rgba(6, 182, 212, 0.4)" },
      { from: "from-violet-500", to: "to-fuchsia-600", stroke: "rgb(139, 92, 246)", glow: "rgba(139, 92, 246, 0.4)" },
    ];
    return gradients[index % gradients.length];
  };

  // Re-build Graph Nodes and Links when inputs change
  useEffect(() => {
    const newNodes: GraphNode[] = [];
    const newLinks: GraphLink[] = [];
    const width = 600;
    const height = 400;
    const cx = width / 2;
    const cy = height / 2;

    const existingNodesMap = new Map(nodesRef.current.map(n => [n.id, n]));

    // Helper to position new nodes near their parent or center with slight jitter
    const getInitialPos = (id: string, refX: number, refY: number, offset: number = 40) => {
      const prev = existingNodesMap.get(id);
      if (prev) {
        return { x: prev.x, y: prev.y };
      }
      return {
        x: refX + (Math.random() - 0.5) * offset,
        y: refY + (Math.random() - 0.5) * offset
      };
    };

    // 1. Add Document Nodes
    documents.forEach((doc, idx) => {
      const colors = getDocColors(doc.title, idx);
      const isAttached = attachedDocIds.includes(doc.id);
      const initPos = getInitialPos(doc.id, cx + Math.sin(idx) * 120, cy + Math.cos(idx) * 120, 0);

      newNodes.push({
        id: doc.id,
        label: doc.title,
        type: "document",
        radius: doc.id === selectedDocId ? 18 : 14,
        x: initPos.x,
        y: initPos.y,
        vx: 0,
        vy: 0,
        color: colors.stroke,
        attached: isAttached
      });

      // 2. Add Concept Nodes for each document's keypoints
      const keyPoints = doc.summary?.keyPoints || [];
      keyPoints.forEach((kp, kpIdx) => {
        const kpId = `${doc.id}-concept-${kpIdx}`;
        // Spread keypoint nodes around their document parent node
        const kpPos = getInitialPos(kpId, initPos.x, initPos.y, 60);

        newNodes.push({
          id: kpId,
          label: kp,
          type: "concept",
          radius: 7,
          x: kpPos.x,
          y: kpPos.y,
          vx: 0,
          vy: 0,
          parentId: doc.id
        });

        // Link concept to its parent document
        newLinks.push({
          source: doc.id,
          target: kpId,
          type: "doc-concept"
        });
      });
    });

    // 3. Add Conceptual Cross-Document Bridges (non-linear links based on word overlaps)
    const getWords = (text: string) => {
      const stopWords = new Set(["the", "and", "of", "a", "is", "in", "to", "for", "with", "on", "at", "by", "an", "that", "this", "it", "from", "are", "or"]);
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));
    };

    const conceptNodes = newNodes.filter(n => n.type === "concept");
    for (let i = 0; i < conceptNodes.length; i++) {
      const wordsA = getWords(conceptNodes[i].label);
      for (let j = i + 1; j < conceptNodes.length; j++) {
        // Don't link concepts belonging to the same document
        if (conceptNodes[i].parentId === conceptNodes[j].parentId) continue;

        const wordsB = getWords(conceptNodes[j].label);
        const overlap = wordsA.filter(w => wordsB.includes(w));
        
        // If they share at least one significant concept word, draw a bridge link
        if (overlap.length > 0) {
          newLinks.push({
            source: conceptNodes[i].id,
            target: conceptNodes[j].id,
            type: "concept-bridge"
          });
        }
      }
    }

    // 4. Add Active Query Node and matching Source Chunks if a chat recently completed
    if (lastAiMessage && lastAiMessage.sources && lastAiMessage.sources.length > 0) {
      const qId = "query";
      const qPos = getInitialPos(qId, cx, cy - 50, 0);

      newNodes.push({
        id: qId,
        label: "Active Query",
        type: "query",
        radius: 14,
        x: qPos.x,
        y: qPos.y,
        vx: 0,
        vy: 0
      });

      lastAiMessage.sources.forEach((source, sIdx) => {
        const sId = `chunk-${sIdx}`;
        const sPos = getInitialPos(sId, cx + (sIdx - 1) * 50, cy + 30, 40);

        newNodes.push({
          id: sId,
          label: source,
          type: "chunk",
          radius: 6,
          x: sPos.x,
          y: sPos.y,
          vx: 0,
          vy: 0
        });

        // Link Query to matched Chunk
        newLinks.push({
          source: qId,
          target: sId,
          type: "query-chunk"
        });

        // Link Chunk to the main document (RAG source pathway)
        if (selectedDocId) {
          newLinks.push({
            source: sId,
            target: selectedDocId,
            type: "chunk-doc"
          });
        }
      });
    }

    nodesRef.current = newNodes;
    setNodes(newNodes);
    setLinks(newLinks);
  }, [documents, selectedDocId, attachedDocIds, lastAiMessage]);

  // Spring Simulation Animation Loop
  useEffect(() => {
    let animId: number;
    const width = 600;
    const height = 400;
    const cx = width / 2;
    const cy = height / 2;

    const tick = () => {
      const currentNodes = [...nodesRef.current];
      if (currentNodes.length === 0) {
        animId = requestAnimationFrame(tick);
        return;
      }

      // Physics constants
      const charge = -150;      // Node repulsion force
      const gravity = 0.04;     // Pull to center
      const springK = 0.08;     // Link strength
      const damping = 0.85;     // Friction

      // Reset forces and lock dragged node to mouse
      currentNodes.forEach((node) => {
        if (node.id === draggingNodeRef.current) {
          node.x = mousePosRef.current.x;
          node.y = mousePosRef.current.y;
          node.vx = 0;
          node.vy = 0;
        } else {
          // Gravity pull to center
          node.vx += (cx - node.x) * gravity;
          node.vy += (cy - node.y) * gravity;
        }
      });

      // 1. Repulsion force between all node pairs (charge)
      for (let i = 0; i < currentNodes.length; i++) {
        const nodeA = currentNodes[i];
        for (let j = i + 1; j < currentNodes.length; j++) {
          const nodeB = currentNodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          // Add small random noise to prevent coordinates from being exactly equal (divide by zero)
          const distSq = dx * dx + dy * dy || 0.01;
          const dist = Math.sqrt(distSq);

          // Force is proportional to inverse square distance
          if (dist < 180) {
            const force = (charge * nodeA.radius * nodeB.radius) / (distSq * 0.4);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (nodeA.id !== draggingNodeRef.current) {
              nodeA.vx += fx;
              nodeA.vy += fy;
            }
            if (nodeB.id !== draggingNodeRef.current) {
              nodeB.vx -= fx;
              nodeB.vy -= fy;
            }
          }
        }
      }

      // 2. Link Attraction force along edges
      links.forEach((link) => {
        const nodeA = currentNodes.find(n => n.id === link.source);
        const nodeB = currentNodes.find(n => n.id === link.target);
        if (!nodeA || !nodeB) return;

        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;

        // Custom resting lengths based on link relationship
        let restLength = 60;
        if (link.type === "doc-concept") restLength = 70;
        if (link.type === "concept-bridge") restLength = 120;
        if (link.type === "query-chunk") restLength = 40;
        if (link.type === "chunk-doc") restLength = 80;

        const force = (dist - restLength) * springK;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (nodeA.id !== draggingNodeRef.current) {
          nodeA.vx += fx;
          nodeA.vy += fy;
        }
        if (nodeB.id !== draggingNodeRef.current) {
          nodeB.vx -= fx;
          nodeB.vy -= fy;
        }
      });

      // 3. Apply velocity with damping friction, and clamp within boundaries
      currentNodes.forEach((node) => {
        if (node.id !== draggingNodeRef.current) {
          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;

          // Boundary constraints
          node.x = Math.max(node.radius + 10, Math.min(width - node.radius - 10, node.x));
          node.y = Math.max(node.radius + 10, Math.min(height - node.radius - 10, node.y));
        }
      });

      // Trigger re-render by updating state
      setNodes([...currentNodes]);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [links]);

  // Mouse Interaction Events
  const handleMouseDown = (e: React.MouseEvent<SVGGElement>, nodeId: string) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    draggingNodeRef.current = nodeId;
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNodeRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
  };

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === "document") {
      // Toggle attachment to chat
      onToggleAttach(node.id);
    }
  };

  const handleNodeHover = (e: React.MouseEvent, node: GraphNode | null) => {
    if (node && (node.type === "concept" || node.type === "chunk" || node.type === "document")) {
      const rect = containerRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);
      setHoveredNode(node);
      setHoverPos({ x, y });
    } else {
      setHoveredNode(null);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex-1 flex flex-col items-center select-none overflow-hidden h-full">
      {/* Control Map HUD */}
      <div className="absolute top-4 left-4 z-20 bg-[#09090b]/80 border border-white/5 rounded-full px-4 py-1.5 flex items-center gap-2 text-[9px] uppercase tracking-wider font-bold text-zinc-400 backdrop-blur-md">
        <Brain className="h-3.5 w-3.5 text-primary animate-pulse" />
        <span>Non-Linear Knowledge Space</span>
      </div>

      <div className="absolute top-4 right-4 z-20 bg-[#09090b]/80 border border-white/5 rounded-full px-4 py-1.5 flex items-center gap-2 text-[9px] uppercase tracking-wider font-bold text-zinc-400 backdrop-blur-md">
        <Activity className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-zinc-500 font-light">Interactive Concept Mesh:</span>
        <span className="text-emerald-400">Live</span>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 600 400"
        className="w-full flex-1 bg-black/30 border border-white/5 rounded-3xl relative min-h-[380px]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Shadow filters for glowing nodes */}
          <filter id="glow-doc" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-query" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Render Links */}
        <g>
          {links.map((link, idx) => {
            const sourceNode = nodes.find((n) => n.id === link.source);
            const targetNode = nodes.find((n) => n.id === link.target);
            if (!sourceNode || !targetNode) return null;

            let strokeColor = "rgba(255, 255, 255, 0.05)";
            let strokeDash = undefined;
            let strokeWidth = 1.2;

            if (link.type === "doc-concept") {
              strokeColor = "rgba(139, 92, 246, 0.15)";
            } else if (link.type === "concept-bridge") {
              strokeColor = "rgba(16, 185, 129, 0.25)";
              strokeDash = "2,3";
              strokeWidth = 1.0;
            } else if (link.type === "query-chunk") {
              strokeColor = "rgba(245, 158, 11, 0.3)";
            } else if (link.type === "chunk-doc") {
              strokeColor = "rgba(99, 102, 241, 0.25)";
              strokeDash = "4,2";
            }

            return (
              <line
                key={idx}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDash}
                className="transition-all duration-300"
              />
            );
          })}
        </g>

        {/* Render Nodes */}
        <g>
          {nodes.map((node) => {
            const isSelectedDoc = node.id === selectedDocId;
            const isAttached = node.attached;

            let fill = "rgba(20, 20, 25, 0.85)";
            let stroke = "rgba(255, 255, 255, 0.1)";
            let filter = undefined;

            if (node.type === "document") {
              stroke = node.color || "rgb(139, 92, 246)";
              fill = isAttached ? `${stroke}2A` : "rgba(20, 20, 25, 0.9)";
              filter = "url(#glow-doc)";
            } else if (node.type === "concept") {
              stroke = "rgba(139, 92, 246, 0.35)";
              fill = "rgba(139, 92, 246, 0.1)";
            } else if (node.type === "query") {
              stroke = "rgb(245, 158, 11)";
              fill = "rgba(245, 158, 11, 0.2)";
              filter = "url(#glow-query)";
            } else if (node.type === "chunk") {
              stroke = "rgb(99, 102, 241)";
              fill = "rgba(99, 102, 241, 0.3)";
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={(e) => handleNodeHover(e, node)}
                onMouseMove={(e) => handleNodeHover(e, node)}
                onMouseLeave={(e) => handleNodeHover(e, null)}
              >
                {/* Node Outer Selection Glow Circle (for documents) */}
                {node.type === "document" && isAttached && (
                  <circle
                    r={node.radius + 5}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                    className="animate-spin [animation-duration:12s]"
                  />
                )}

                {/* Node Base Circle */}
                <circle
                  r={node.radius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelectedDoc ? 2.5 : 1.5}
                  filter={filter}
                  className="transition-all duration-300 group-hover:scale-105 group-hover:stroke-white"
                />

                {/* Node inner symbol */}
                {node.type === "document" && (
                  <text
                    y={3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="extrabold"
                    fontFamily="monospace"
                    className="pointer-events-none uppercase text-zinc-100 group-hover:text-white"
                  >
                    {node.label.charAt(0)}
                  </text>
                )}

                {node.type === "query" && (
                  <text
                    y={3.5}
                    textAnchor="middle"
                    fill="rgb(245, 158, 11)"
                    fontSize="9"
                    fontWeight="extrabold"
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    ?
                  </text>
                )}

                {/* Truncated label for non-document nodes for layout cleanliness */}
                {(node.type === "query") && (
                  <text
                    y={node.radius + 11}
                    textAnchor="middle"
                    fill="rgba(255, 255, 255, 0.65)"
                    fontSize="7"
                    fontFamily="sans-serif"
                    className="pointer-events-none uppercase font-bold tracking-wider"
                  >
                    Active Query
                  </text>
                )}

                {node.type === "document" && (
                  <text
                    y={node.radius + 12}
                    textAnchor="middle"
                    fill={isSelectedDoc ? "#ffffff" : "rgba(255, 255, 255, 0.45)"}
                    fontSize="8"
                    fontWeight={isSelectedDoc ? "bold" : "normal"}
                    fontFamily="sans-serif"
                    className="pointer-events-none transition-all group-hover:fill-white"
                  >
                    {node.label.length > 15 ? `${node.label.substring(0, 13)}...` : node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Dynamic Hover Tooltip Card */}
      {hoveredNode && (
        <div
          className="absolute z-30 pointer-events-none bg-[#09090b]/95 border border-white/5 p-4 rounded-xl max-w-xs shadow-2xl glass-card transition-opacity duration-200 text-left spatial-shadow-md backdrop-blur-md"
          style={{
            left: `${hoverPos.x + 15}px`,
            top: `${hoverPos.y + 15}px`,
          }}
        >
          <div className="space-y-1.5">
            <span className="text-[8px] uppercase font-bold tracking-widest text-primary dark:text-purple-400 block border-b border-white/5 pb-1">
              {hoveredNode.type === "document" ? "Interactive Document" : hoveredNode.type === "concept" ? "Active Concept Node" : "Retrieved RAG Chunk"}
            </span>
            <p className="text-[10px] text-zinc-200 leading-relaxed font-light">
              {hoveredNode.label}
            </p>
            {hoveredNode.type === "document" && (
              <span className="text-[8px] text-zinc-500 block italic leading-none pt-1">
                {hoveredNode.attached ? "🟢 Attached to Chat. Click to detach." : "🔴 Detached. Click to attach to chat context."}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Helpful Hint banner */}
      <div className="mt-3.5 bg-white/5 border border-white/5 p-4.5 rounded-2xl flex items-start gap-2.5 text-[10px] text-zinc-400 max-w-lg leading-relaxed font-light">
        <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-zinc-300">How to Interact:</span>
          <p>Click-drag nodes to stretch the graph. Click **document nodes** to toggle attachment to the doubt-solving chat. Dashed lines represent conceptual connections found across separate materials.</p>
        </div>
      </div>
    </div>
  );
}
