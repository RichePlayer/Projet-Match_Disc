import { useState, useRef, useCallback, useEffect } from "react";

const W = 560, H = 320, R = 22;

type NodeMap = Record<string, { x: number; y: number }>;
type Edge = { from: string; to: string; weight: number };

type DijkstraStep = {
  iteration: number;
  selected: string;
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  visited: string[];
  updates: { node: string; oldDist: number; newDist: number; via: string }[];
};

function dijkstraWithSteps(nodes: string[], edges: Edge[], start: string) {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const steps: DijkstraStep[] = [];

  nodes.forEach((n) => { dist[n] = Infinity; prev[n] = null; });
  dist[start] = 0;

  // Initial state step
  steps.push({
    iteration: 0,
    selected: start,
    distances: { ...dist },
    predecessors: { ...prev },
    visited: [],
    updates: [],
  });

  const queue = [...nodes];

  while (queue.length) {
    queue.sort((a, b) => dist[a] - dist[b]);
    const u = queue.shift()!;
    if (dist[u] === Infinity) break;
    visited.add(u);

    const updates: DijkstraStep["updates"] = [];
    edges
      .filter((e) => e.from === u || e.to === u)
      .forEach((e) => {
        const nb = e.from === u ? e.to : e.from;
        if (visited.has(nb)) return;
        const alt = dist[u] + e.weight;
        if (alt < dist[nb]) {
          const oldDist = dist[nb];
          dist[nb] = alt;
          prev[nb] = u;
          updates.push({ node: nb, oldDist, newDist: alt, via: u });
        }
      });

    steps.push({
      iteration: steps.length,
      selected: u,
      distances: { ...dist },
      predecessors: { ...prev },
      visited: [...visited],
      updates,
    });
  }

  function getPath(node: string): string[] {
    const path: string[] = [];
    let cur: string | null = node;
    while (cur !== null) { path.unshift(cur); cur = prev[cur]; }
    return path.length > 1 || path[0] === start ? path : [];
  }

  return { dist, getPath, steps };
}

function GraphSVG({
  nodes, edges, pathEdges, pathNodes, startNode, endNode, onDragStart,
}: {
  nodes: NodeMap;
  edges: Edge[];
  pathEdges: Set<string>;
  pathNodes: Set<string>;
  startNode: string;
  endNode: string;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, n: string) => void;
}) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
      className="rounded-xl border border-slate-700 bg-slate-800 block">

      {edges.map((e, i) => {
        const a = nodes[e.from], b = nodes[e.to];
        if (!a || !b) return null;
        const isPath = pathEdges.has(`${e.from}-${e.to}`) || pathEdges.has(`${e.to}-${e.from}`);
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return null;
        const ux = dx / len, uy = dy / len;
        const x1 = a.x + ux * R, y1 = a.y + uy * R;
        const x2 = b.x - ux * R, y2 = b.y - uy * R;
        const mx = (x1 + x2) / 2 - uy * 14, my = (y1 + y2) / 2 + ux * 14;
        return (
          <g key={i}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isPath ? "#378ADD" : "#475569"}
              strokeWidth={isPath ? 2.5 : 1}
              strokeLinecap="round"
            />
            <text x={mx} y={my - 7} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="sans-serif">
              {e.weight}
            </text>
          </g>
        );
      })}

      {Object.entries(nodes).map(([n, pos]) => {
        const isStart = n === startNode;
        const isEnd = n === endNode;
        const inPath = pathNodes.has(n);

        let fill = "#3C3489";
        let stroke = "#AFA9EC";
        let textCol = "#CECBF6";

        if (isStart) {
          fill = "#633806";
          stroke = "#EF9F27";
          textCol = "#FAC775";
        } else if (isEnd) {
          fill = "#4A1D6D";
          stroke = "#E879F9";
          textCol = "#F0ABFC";
        } else if (inPath) {
          fill = "#085041";
          stroke = "#5DCAA5";
          textCol = "#9FE1CB";
        }

        return (
          <g key={n} style={{ cursor: "grab" }}
            onMouseDown={(e) => onDragStart(e, n)}
            onTouchStart={(e) => onDragStart(e, n)}>
            <circle cx={pos.x} cy={pos.y} r={R} fill={fill} stroke={stroke} strokeWidth={(isStart || isEnd || inPath) ? 2 : 1} />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central"
              fontSize={13} fontWeight={500} fill={textCol} fontFamily="sans-serif">
              {n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DemoTable({ steps, nodeList, endNode }: { steps: DijkstraStep[]; nodeList: string[]; endNode: string }) {
  const sortedNodes = [...nodeList].sort();

  return (
    <div className="mt-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
        Tableau de démonstration — Dijkstra Min
      </h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-700/60">
            <th className="border border-slate-600 px-3 py-2 text-left text-slate-300 font-medium">Itération</th>
            <th className="border border-slate-600 px-3 py-2 text-left text-slate-300 font-medium">Sommet choisi</th>
            {sortedNodes.map((n) => (
              <th key={n} className={`border border-slate-600 px-3 py-2 text-center font-medium ${n === endNode ? "text-purple-400" : "text-slate-300"}`}>
                d({n})
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map((step, idx) => {
            const isInit = idx === 0;
            return (
              <tr key={idx} className={`${idx % 2 === 0 ? "bg-slate-800/40" : "bg-slate-800/70"} hover:bg-slate-700/50 transition-colors`}>
                <td className="border border-slate-600 px-3 py-2 text-slate-400 font-mono text-xs">
                  {isInit ? "Init" : idx}
                </td>
                <td className="border border-slate-600 px-3 py-2">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    isInit ? "bg-blue-900/50 text-blue-300 border border-blue-500/30"
                    : step.visited.includes(step.selected)
                      ? "bg-green-900/50 text-green-300 border border-green-500/30"
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {step.selected}
                  </span>
                </td>
                {sortedNodes.map((n) => {
                  const d = step.distances[n];
                  const pred = step.predecessors[n];
                  const wasUpdated = step.updates.some((u) => u.node === n);
                  const isVisited = step.visited.includes(n);
                  const isSelected = step.selected === n && !isInit;

                  let cellClass = "text-slate-400";
                  if (wasUpdated) cellClass = "text-yellow-300 font-bold";
                  else if (isSelected) cellClass = "text-green-400 font-bold";
                  else if (isVisited) cellClass = "text-slate-500";

                  return (
                    <td key={n} className={`border border-slate-600 px-3 py-2 text-center ${cellClass} ${wasUpdated ? "bg-yellow-900/15" : ""}`}>
                      <div className="leading-tight">
                        <span className="text-sm">{d === Infinity ? "∞" : d}</span>
                        {pred && d !== Infinity && (
                          <span className="text-[10px] text-slate-500 ml-0.5">({pred})</span>
                        )}
                      </div>
                      {isVisited && !isInit && (
                        <span className="text-[9px] text-green-600">✓</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-900/40 border border-yellow-600/30 inline-block"></span>
          Mis à jour
        </span>
        <span className="flex items-center gap-1">
          <span className="text-green-600">✓</span>
          Visité (fermé)
        </span>
        <span className="flex items-center gap-1">
          <span className="text-slate-500">(X)</span>
          Prédécesseur
        </span>
      </div>
    </div>
  );
}

export default function DijkstraMin() {
  const [nodes, setNodes] = useState<NodeMap>({});
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeInput, setNodeInput] = useState("");
  const [fromNode, setFromNode] = useState("");
  const [toNode, setToNode] = useState("");
  const [weight, setWeight] = useState(1);
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [pathEdges, setPathEdges] = useState(new Set<string>());
  const [pathNodes, setPathNodes] = useState(new Set<string>());
  const [result, setResult] = useState<{ distance: number; path: string[] } | null>(null);
  const [steps, setSteps] = useState<DijkstraStep[]>([]);
  const [mode, setMode] = useState<"rapide" | "demo">("rapide");

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const dragNodeRef = useRef<string | null>(null);
  const dragOffRef = useRef({ ox: 0, oy: 0 });
  const nodeList = Object.keys(nodes);

  function rndPos() {
    const angle = Math.random() * 2 * Math.PI;
    const r = 60 + Math.random() * 100;
    return { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
  }

  function addNode() {
    const v = nodeInput.trim().toUpperCase();
    if (!v || nodes[v]) return;
    setNodes((p) => ({ ...p, [v]: rndPos() }));
    setNodeInput("");
    if (!startNode) setStartNode(v);
    if (!endNode) setEndNode(v);
    if (!fromNode) setFromNode(v);
    if (!toNode) setToNode(v);
  }

  function removeNode(n: string) {
    setNodes((p) => { const c = { ...p }; delete c[n]; return c; });
    setEdges((p) => p.filter((e) => e.from !== n && e.to !== n));
    clearResults();
  }

  function addEdge() {
    if (!fromNode || !toNode || fromNode === toNode || weight < 1) return;
    // Éviter les doublons (A-B et B-A sont la même arête non dirigée)
    const duplicate = edges.some(
      (e) => (e.from === fromNode && e.to === toNode) || (e.from === toNode && e.to === fromNode)
    );
    if (duplicate) return;
    setEdges((p) => [...p, { from: fromNode, to: toNode, weight }]);
    clearResults();
  }

  function removeEdge(i: number) {
    setEdges((p) => p.filter((_, idx) => idx !== i));
    clearResults();
  }

  function clearResults() {
    setResult(null);
    setSteps([]);
    setPathEdges(new Set());
    setPathNodes(new Set());
  }

  function clearAll() {
    setNodes({}); setEdges([]);
    setStartNode(""); setEndNode("");
    setFromNode(""); setToNode("");
    clearResults();
  }

  function loadExample() {
    setNodes({
      A: { x: 100, y: 200 }, B: { x: 220, y: 100 }, C: { x: 380, y: 80 },
      D: { x: 460, y: 220 }, E: { x: 280, y: 230 },
    });
    setEdges([
      { from: "A", to: "B", weight: 7 }, { from: "A", to: "E", weight: 1 },
      { from: "B", to: "C", weight: 3 }, { from: "B", to: "E", weight: 8 },
      { from: "C", to: "D", weight: 6 }, { from: "C", to: "E", weight: 2 },
      { from: "D", to: "E", weight: 7 },
    ]);
    setStartNode("A");
    setEndNode("D");
    setFromNode("A");
    setToNode("B");
    clearResults();
  }

  function runDijkstra() {
    if (!startNode || !endNode || nodeList.length === 0) return;
    if (startNode === endNode) {
      setResult({ distance: 0, path: [startNode] });
      setPathNodes(new Set([startNode]));
      setPathEdges(new Set());
      setSteps([]);
      return;
    }

    const { dist, getPath, steps: dSteps } = dijkstraWithSteps(nodeList, edges, startNode);
    const path = getPath(endNode);

    setSteps(dSteps);

    if (path.length === 0 || dist[endNode] === Infinity) {
      setResult({ distance: Infinity, path: [] });
      setPathNodes(new Set());
      setPathEdges(new Set());
      return;
    }

    const pEdges = new Set<string>();
    const pNodes = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      pEdges.add(`${path[i]}-${path[i + 1]}`);
    }
    path.forEach((node) => pNodes.add(node));

    setPathEdges(pEdges);
    setPathNodes(pNodes);
    setResult({ distance: dist[endNode], path });
  }

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, n: string) => {
    e.preventDefault();
    dragNodeRef.current = n;
    const svg = svgContainerRef.current?.querySelector("svg");
    if (!svg) return;
    const bbox = svg.getBoundingClientRect();
    const scale = W / bbox.width;
    const pt = "touches" in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    dragOffRef.current = { ox: pt.x * scale - nodes[n].x, oy: pt.y * scale - nodes[n].y };
  }, [nodes]);

  useEffect(() => {
    const getPoint = (e: MouseEvent | TouchEvent) =>
      "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragNodeRef.current) return;
      e.preventDefault();
      const svg = svgContainerRef.current?.querySelector("svg");
      if (!svg) return;
      const scale = W / svg.getBoundingClientRect().width;
      const pt = getPoint(e);
      const x = Math.max(R + 4, Math.min(W - R - 4, pt.x * scale - dragOffRef.current.ox));
      const y = Math.max(R + 4, Math.min(H - R - 4, pt.y * scale - dragOffRef.current.oy));
      setNodes((prev) => ({ ...prev, [dragNodeRef.current!]: { x, y } }));
    };
    const onUp = () => { dragNodeRef.current = null; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div className="min-h-screen  text-white p-6 max-w-2xl mt-[60px] mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">Dijkstra - Plus Court Chemin</h1>

      {/* Nœuds */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">Ajouter des nœuds</p>
        <div className="flex gap-2 flex-wrap">
          <input
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white w-20 text-sm"
            value={nodeInput} placeholder="ex: A"
            onChange={(e) => setNodeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNode()}
          />
          <button onClick={addNode} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">+ Nœud</button>
          <button onClick={loadExample} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm">Charger exemple</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {nodeList.map((n) => (
            <span key={n} className="bg-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {n}
              <button onClick={() => removeNode(n)} className="text-red-400 hover:text-red-300">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Arêtes */}
      {nodeList.length >= 2 && (
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">Ajouter des arêtes</p>
          <div className="flex gap-2 flex-wrap items-center">
            <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              value={fromNode} onChange={(e) => setFromNode(e.target.value)}>
              {nodeList.map((n) => <option key={n}>{n}</option>)}
            </select>
            {/* Tiret à la place de la flèche → pour indiquer non-dirigé */}
            <span className="text-slate-400 text-sm font-bold">—</span>
            <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              value={toNode} onChange={(e) => setToNode(e.target.value)}>
              {nodeList.map((n) => <option key={n}>{n}</option>)}
            </select>
            <input type="number" min={1} value={weight}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white w-20 text-sm"
              onChange={(e) => setWeight(parseInt(e.target.value))} />
            <button onClick={addEdge} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">+ Arête</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {edges.map((e, i) => (
              <span key={i} className="bg-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {/* A-B(4) au lieu de A→B(4) */}
                {e.from}-{e.to}({e.weight})
                <button onClick={() => removeEdge(i)} className="text-red-400 hover:text-red-300">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Graphe SVG */}
      {nodeList.length > 0 && (
        <div className="mb-4" ref={svgContainerRef}>
          <GraphSVG nodes={nodes} edges={edges} pathEdges={pathEdges}
            pathNodes={pathNodes} startNode={startNode} endNode={endNode} onDragStart={onDragStart} />
          <p className="text-xs text-slate-500 mt-1">Glisse les nœuds pour repositionner</p>
        </div>
      )}

      {/* Mode de calcul */}
      {nodeList.length > 0 && (
        <div className="mb-4">
          <div className="flex rounded-lg overflow-hidden border border-slate-600 w-fit">
            <button
              onClick={() => setMode("rapide")}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                mode === "rapide"
                  ? "bg-blue-600 text-white shadow-inner"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
               Calcul rapide
            </button>
            <button
              onClick={() => setMode("demo")}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                mode === "demo"
                  ? "bg-blue-600 text-white shadow-inner"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
               Démonstration (tableau)
            </button>
          </div>
        </div>
      )}

      {/* Lancer Dijkstra */}
      {nodeList.length > 0 && (
        <div className="flex gap-3 items-center flex-wrap mb-4">
          <span className="text-sm text-slate-400">Départ :</span>
          <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            value={startNode} onChange={(e) => setStartNode(e.target.value)}>
            {nodeList.map((n) => <option key={n}>{n}</option>)}
          </select>
          <span className="text-sm text-slate-400">Arrivée :</span>
          <select className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            value={endNode} onChange={(e) => setEndNode(e.target.value)}>
            {nodeList.map((n) => <option key={n}>{n}</option>)}
          </select>
          <button onClick={runDijkstra} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg text-sm font-medium">
            Calculer chemin
          </button>
          <button onClick={clearAll} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">Effacer</button>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-3">
            Plus court chemin de <strong className="text-yellow-400">{startNode}</strong> à <strong className="text-purple-400">{endNode}</strong>
          </p>
          <div className="flex justify-between items-center py-2 border-b border-slate-700">
            <span className="font-medium">Chemin :</span>
            <span className="text-slate-300 text-sm">
              {result.path.length > 0 ? result.path.join(" — ") : "Aucun chemin trouvé"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Distance :</span>
            <span className={result.distance === Infinity ? "text-red-400 font-bold" : "text-green-400 font-bold text-lg"}>
              {result.distance === Infinity ? "∞" : result.distance}
            </span>
          </div>
        </div>
      )}

      {/* Tableau de démonstration */}
      {result && mode === "demo" && steps.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mt-4">
          <DemoTable steps={steps} nodeList={nodeList} endNode={endNode} />
        </div>
      )}
    </div>
  );
}