/** Datos del grafo compartidos por las versiones 3D y 2D. Todo se genera con una semilla fija. */

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type GNode = { x: number; y: number; z: number; tone: 0 | 1 | 2 };

/** Nodos sueltos con pocas conexiones: "información suelta y desconectada". */
export function buildHeroGraph(count = 90, seed = 11) {
  const r = rng(seed);
  const nodes: GNode[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: (r() - 0.5) * 22,
      y: (r() - 0.5) * 12,
      z: (r() - 0.5) * 10,
      tone: (r() < 0.55 ? 0 : r() < 0.7 ? 2 : 1) as 0 | 1 | 2,
    });
  }
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodes.length; i++) {
    if (r() > 0.34) continue;
    let best = -1;
    let bestD = 4.2;
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y, nodes[i].z - nodes[j].z);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    const key = best < i ? `${best}-${i}` : `${i}-${best}`;
    if (best >= 0 && !seen.has(key)) {
      seen.add(key);
      edges.push([i, best]);
    }
  }
  return { nodes, edges };
}

/** Proyección sencilla para la versión SVG (viewBox 1600x900). */
export function projectHero(n: GNode) {
  const s = 14 / (14 - n.z);
  return { x: 800 + n.x * s * 58, y: 450 + n.y * s * 58, s };
}

export type ToolId = "zoom" | "meet" | "teams" | "hubspot" | "slack" | "notion" | "drive" | "claude" | "chatgpt" | "zapier";

export type ToolNode = {
  id: ToolId;
  name: string;
  file: string;
  /** Qué aporta a la memoria de Fivo. */
  gives: string;
  mcp?: boolean;
  /** Posición normalizada en el óvalo (-1 a 1) y profundidad. */
  u: number;
  v: number;
  z: number;
};

const DEFS: Record<ToolId, Omit<ToolNode, "id" | "u" | "v" | "z">> = {
  hubspot: { name: "HubSpot", file: "hubspot.svg", gives: "CRM" },
  claude: { name: "Claude", file: "claude.svg", gives: "Tu IA", mcp: true },
  zoom: { name: "Zoom", file: "zoom.svg", gives: "Llamadas" },
  meet: { name: "Google Meet", file: "googlemeet.svg", gives: "Llamadas" },
  teams: { name: "Microsoft Teams", file: "teams.svg", gives: "Llamadas" },
  slack: { name: "Slack", file: "slack.svg", gives: "Mensajes" },
  notion: { name: "Notion", file: "notion.svg", gives: "Documentos" },
  drive: { name: "Google Drive", file: "googledrive.svg", gives: "Documentos" },
  chatgpt: { name: "ChatGPT", file: "openai.svg", gives: "Tu IA", mcp: true },
  zapier: { name: "Zapier", file: "zapier.svg", gives: "Automatizaciones" },
};

/** Herramientas de /equipos-comerciales, en su orden en el anillo (el mismo de siempre). */
export const TOOL_IDS_DEFAULT: ToolId[] = ["hubspot", "claude", "zoom", "meet", "teams", "slack", "notion", "drive", "chatgpt"];

const toolCache = new Map<string, ToolNode[]>();

/** Herramientas repartidas a partes iguales en el óvalo (con 9 son 40 grados, como siempre). */
export function toolsFor(ids: readonly ToolId[]): ToolNode[] {
  const key = ids.join(",");
  const hit = toolCache.get(key);
  if (hit) return hit;
  const step = 360 / ids.length;
  const built = ids.map((id, i) => {
    const a = ((90 + i * step) * Math.PI) / 180;
    return { id, ...DEFS[id], u: Math.cos(a) * 0.86, v: Math.sin(a) * 0.8, z: Math.sin(a * 2 + 0.6) * 1.3 };
  });
  toolCache.set(key, built);
  return built;
}

export const TOOLS: ToolNode[] = toolsFor(TOOL_IDS_DEFAULT);

/**
 * Reparto en anillo por longitud de arco (para el contenedor estrecho del móvil):
 * los nodos quedan a la misma distancia entre sí, sin amontonarse arriba o abajo.
 */
export function compactRing(count: number, rxPx = 126, ryPx = 179, startDeg = 90) {
  const N = 720;
  const pts: { a: number; s: number }[] = [];
  let s = 0;
  let prev = { x: Math.cos(0) * rxPx, y: 0 };
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const p = { x: Math.cos(a) * rxPx, y: Math.sin(a) * ryPx };
    if (i > 0) s += Math.hypot(p.x - prev.x, p.y - prev.y);
    pts.push({ a, s });
    prev = p;
  }
  const total = s;
  const start = (startDeg * Math.PI) / 180;
  // longitud de arco hasta el ángulo de inicio
  const s0 = pts.reduce((best, p) => (Math.abs(p.a - start) < Math.abs(best.a - start) ? p : best)).s;
  return Array.from({ length: count }, (_, k) => {
    const target = (s0 + (k / count) * total) % total;
    const hit = pts.find((p) => p.s >= target) ?? pts[0];
    return { u: Math.cos(hit.a), v: Math.sin(hit.a) };
  });
}
