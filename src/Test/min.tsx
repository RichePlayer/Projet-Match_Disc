import { useState, useRef, useCallback, useEffect } from "react";

const W = 560, H = 320, R = 22;

type NodeMap = Record<string, { x: number; y: number }>;
type Edge = { from: string; to: string; weight: number };

function dijkstra(nodes: string[], edges: Edge[], start: string) {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  nodes.forEach((n) => { dist[n] = Infinity; prev[n] = null; });
  dist[start] = 0;
  const queue = [...nodes];

  while (queue.length) {
    queue.sort((a, b) => dist[a] - dist[b]);
    const u = queue.shift()!;
    visited.add(u);
    edges
      .filter((e) => e.from === u || e.to === u)
      .forEach((e) => {
        const nb = e.from === u ? e.to : e.from;
        if (visited.has(nb)) return;
        const alt = dist[u] + e.weight;
        if (alt < dist[nb]) { dist[nb] = alt; prev[nb] = u; }
      });
  }

  function getPath(node: string): string[] {
    const path: string[] = [];
    let cur: string | null = node;
    while (cur !== null) { path.unshift(cur); cur = prev[cur]; }
    return path.length > 1 || path[0] === start ? path : [];
  }

  return { dist, getPath };
}

function GraphSVG({
  nodes, edges, pathEdges, pathNodes, startNode, onDragStart,
}: {
  nodes: NodeMap;
  edges: Edge[];
  pathEdges: Set<string>;
  pathNodes: Set<string>;
  startNode: string;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, n: string) => void;
}) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
      className="rounded-xl border border-slate-700 bg-slate-800 block">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        </marker>
        <marker id="arrPath" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" />
        </marker>
      </defs>

      {edges.map((e, i) => {
        const a = nodes[e.from], b = nodes[e.to];
        if (!a || !b) return null;
        const key = `${e.from}-${e.to}`;
        const isPath = pathEdges.has(key);
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return null;
        const ux = dx / len, uy = dy / len;
        const x1 = a.x + ux * R, y1 = a.y + uy * R;
        const x2 = b.x - ux * (R + 4), y2 = b.y - uy * (R + 4);
        const mx = (x1 + x2) / 2 - uy * 14, my = (y1 + y2) / 2 + ux * 14;
        return (
          <g key={i}>
            <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none"
              stroke={isPath ? "#378ADD" : "#475569"} strokeWidth={isPath ? 2.5 : 1}
              markerEnd={`url(#${isPath ? "arrPath" : "arr"})`} />
            <text x={mx} y={my - 7} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="sans-serif">
              {e.weight}
            </text>
          </g>
        );
      })}

      {Object.entries(nodes).map(([n, pos]) => {
        const isStart = n === startNode && pathNodes.size > 0;
        const inPath = pathNodes.has(n);
        const fill = isStart ? "#633806" : inPath ? "#085041" : "#3C3489";
        const stroke = isStart ? "#EF9F27" : inPath ? "#5DCAA5" : "#AFA9EC";
        const textCol = isStart ? "#FAC775" : inPath ? "#9FE1CB" : "#CECBF6";
        return (
          <g key={n} style={{ cursor: "grab" }}
            onMouseDown={(e) => onDragStart(e, n)}
            onTouchStart={(e) => onDragStart(e, n)}>
            <circle cx={pos.x} cy={pos.y} r={R} fill={fill} stroke={stroke} strokeWidth={isStart || inPath ? 2 : 1} />
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

export default function DijkstraMin() {
  const [nodes, setNodes] = useState<NodeMap>({});
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeInput, setNodeInput] = useState("");
  const [fromNode, setFromNode] = useState("");
  const [toNode, setToNode] = useState("");
  const [weight, setWeight] = useState(1);
  const [startNode, setStartNode] = useState("");
  const [pathEdges, setPathEdges] = useState(new Set<string>());
  const [pathNodes, setPathNodes] = useState(new Set<string>());
  const [results, setResults] = useState<{ node: string; dist: number; path: string[] }[] | null>(null);

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
    setEdges((p) => [...p, { from: fromNode, to: toNode, weight }]);
    clearResults();
  }

  function removeEdge(i: number) {
    setEdges((p) => p.filter((_, idx) => idx !== i));
    clearResults();
  }

  function clearResults() {
    setResults(null);
    setPathEdges(new Set());
    setPathNodes(new Set());
  }

  function clearAll() {
    setNodes({}); setEdges([]);
    setStartNode(""); setFromNode(""); setToNode("");
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
    setStartNode("A"); setFromNode("A"); setToNode("B");
    clearResults();
  }

  function runDijkstra() {
    if (!startNode || nodeList.length === 0) return;
    const { dist, getPath } = dijkstra(nodeList, edges, startNode);
    const res = nodeList.filter((n) => n !== startNode).map((n) => ({
      node: n, dist: dist[n], path: getPath(n),
    }));
    const pEdges = new Set<string>();
    const pNodes = new Set<string>([startNode]);
    nodeList.filter((n) => n !== startNode).forEach((n) => {
      const p = getPath(n);
      p.forEach((node) => pNodes.add(node));
      for (let i = 0; i < p.length - 1; i++) pEdges.add(`${p[i]}-${p[i + 1]}`);
    });
    setPathEdges(pEdges);
    setPathNodes(pNodes);
    setResults(res);
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
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">Dijkstra Min</h1>

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
            <span className="text-slate-400 text-sm">→</span>
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
                {e.from}→{e.to}({e.weight})
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
            pathNodes={pathNodes} startNode={startNode} onDragStart={onDragStart} />
          <p className="text-xs text-slate-500 mt-1">Glisse les nœuds pour repositionner</p>
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
          <button onClick={runDijkstra} className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg text-sm font-medium">Calculer</button>
          <button onClick={clearAll} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">Effacer</button>
        </div>
      )}

      {/* Résultats */}
      {results && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-3">
            Distances depuis <strong className="text-white">{startNode}</strong>
          </p>
          {results.map(({ node, dist, path }) => (
            <div key={node} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0 text-sm">
              <span className="font-medium">{startNode} → {node}</span>
              <span className="text-slate-400 text-xs">{path.join(" → ")}</span>
              <span className={dist === Infinity ? "text-red-400" : "text-blue-400 font-bold"}>
                {dist === Infinity ? "∞" : dist}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

