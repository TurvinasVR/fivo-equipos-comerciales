import type { ToolId, ToolNode } from "../graph";

/**
 * Grafo del paso 1 de "Cómo funciona": una red de conocimiento, no una rueda. Fivo en el centro y las herramientas en
 * posiciones a mano, agrupadas por tipo (videollamadas, CRM, trabajo e IA), a distintas distancias. Además de las líneas
 * al centro hay conexiones dentro de cada grupo, algunas entre grupos y nodos secundarios (píldoras y puntos) que cuelgan
 * de las herramientas.
 *
 * Todo se calcula una vez por tamaño de escenario, en px y con origen en el nodo de Fivo. La red se ve siempre completa;
 * lo único que se mueve (HowStage) son pulsos de luz y brillos que recorren las líneas, cada uno con su propio ritmo
 * (`pulse`), y un flotado muy pequeño de los nodos.
 */

export type GroupId = "video" | "crm" | "work" | "ai";
type P = { x: number; y: number };
/** Ritmo de los pulsos de una línea: cada `period` segundos un pulso la recorre durante `travel` de ese periodo. */
export type Rhythm = { period: number; offset: number; travel: number };

export type NetTool = P & { id: ToolId; group: GroupId };
export type NetPill = P & { id: string; label: string };
export type NetDot = P & { id: string };
export type EdgeKind = "hub" | "group" | "cross" | "minor";
export type NetEdge = {
  id: string;
  kind: EdgeKind;
  /** Extremos en px desde Fivo; los pulsos viajan de `a` a `b` (en las líneas al centro, hacia Fivo). */
  a: P;
  b: P;
  /** Punto de control de la curva cuadrática. */
  c: P;
  d: string;
  /** Pulsos (las líneas azules: al centro, de grupo y entre grupos); null en las líneas finas de los nodos secundarios. */
  pulse: Rhythm | null;
  /** Brillo largo y lento que recorre la línea (solo líneas al centro). */
  shimmer: Rhythm | null;
};
export type NetGroup = P & { id: GroupId; label: string; r: number; cap: P };
export type Network = {
  W: number;
  H: number;
  portrait: boolean;
  groups: NetGroup[];
  tools: NetTool[];
  pills: NetPill[];
  dots: NetDot[];
  edges: NetEdge[];
};

/** Grupos de herramientas. */
const GROUPS: { id: GroupId; label: string; tools: ToolId[] }[] = [
  { id: "video", label: "Videollamadas", tools: ["zoom", "meet", "teams"] },
  { id: "crm", label: "CRM", tools: ["hubspot", "salesforce", "highlevel"] },
  { id: "work", label: "Trabajo", tools: ["slack", "notion", "drive"] },
  { id: "ai", label: "IA", tools: ["claude", "chatgpt"] },
];
export const GROUP_OF: Record<ToolId, GroupId> = Object.fromEntries(GROUPS.flatMap((g) => g.tools.map((t) => [t, g.id]))) as Record<ToolId, GroupId>;

/**
 * Posiciones a mano, en px de un escenario de referencia con Fivo en el centro. En vertical (móvil) cada eje se escala
 * por separado, para usar todo el alto; en apaisado (tableta y escritorio), ver `kx` y `ky` en buildNetwork.
 */
type Spec = { W: number; H: number; caps: Record<GroupId, P>; tools: Partial<Record<ToolId, P>>; pills: (P & { id: string; label: string; to: string[] })[]; dots: (P & { id: string; to: string[] })[] };

const PORTRAIT: Spec = {
  W: 335,
  H: 600,
  caps: { crm: { x: 34, y: 30 }, ai: { x: 318, y: 127 }, work: { x: 302, y: 470 }, video: { x: 58, y: 318 } },
  tools: {
    hubspot: { x: 150, y: 40 },
    salesforce: { x: 54, y: 110 },
    highlevel: { x: 62, y: 216 },
    chatgpt: { x: 280, y: 58 },
    claude: { x: 230, y: 146 },
    slack: { x: 288, y: 268 },
    notion: { x: 284, y: 398 },
    drive: { x: 226, y: 520 },
    teams: { x: 48, y: 360 },
    meet: { x: 128, y: 440 },
    zoom: { x: 50, y: 530 },
  },
  pills: [
    { id: "contacto", label: "Contacto", x: 136, y: 175, to: ["hubspot", "salesforce"] },
    { id: "acuerdo", label: "Acuerdo", x: 74, y: 290, to: ["highlevel", "contacto"] },
    { id: "mensaje", label: "Mensaje", x: 248, y: 221, to: ["slack", "claude"] },
    { id: "objecion", label: "Objeción", x: 150, y: 386, to: ["teams", "llamada"] },
    { id: "llamada", label: "Llamada", x: 132, y: 512, to: ["zoom", "meet"] },
    { id: "nota", label: "Nota", x: 222, y: 446, to: ["notion", "drive", "llamada"] },
  ],
  dots: [
    { id: "d1", x: 196, y: 98, to: ["hubspot", "claude"] },
    { id: "d2", x: 20, y: 160, to: ["salesforce"] },
    { id: "d3", x: 318, y: 172, to: ["claude", "chatgpt"] },
    { id: "d4", x: 314, y: 334, to: ["slack", "notion"] },
    { id: "d5", x: 18, y: 440, to: ["teams", "zoom"] },
    { id: "d6", x: 300, y: 560, to: ["drive"] },
  ],
};

const WIDE: Spec = {
  W: 600,
  H: 560,
  caps: { crm: { x: 40, y: 40 }, ai: { x: 562, y: 84 }, work: { x: 562, y: 391 }, video: { x: 62, y: 546 } },
  tools: {
    hubspot: { x: 95, y: 92 },
    salesforce: { x: 215, y: 50 },
    highlevel: { x: 74, y: 238 },
    chatgpt: { x: 420, y: 64 },
    claude: { x: 525, y: 158 },
    slack: { x: 530, y: 318 },
    notion: { x: 470, y: 440 },
    drive: { x: 340, y: 496 },
    teams: { x: 70, y: 398 },
    meet: { x: 166, y: 490 },
    zoom: { x: 205, y: 364 },
  },
  pills: [
    { id: "contacto", label: "Contacto", x: 166, y: 166, to: ["hubspot", "salesforce"] },
    { id: "acuerdo", label: "Acuerdo", x: 166, y: 258, to: ["highlevel", "contacto"] },
    { id: "mensaje", label: "Mensaje", x: 432, y: 258, to: ["slack", "claude"] },
    { id: "objecion", label: "Objeción", x: 132, y: 322, to: ["teams", "zoom"] },
    { id: "llamada", label: "Llamada", x: 290, y: 404, to: ["zoom", "meet", "objecion"] },
    { id: "nota", label: "Nota", x: 418, y: 380, to: ["notion", "drive", "llamada"] },
  ],
  dots: [
    { id: "d1", x: 318, y: 120, to: ["salesforce", "chatgpt"] },
    { id: "d2", x: 30, y: 160, to: ["hubspot", "highlevel"] },
    { id: "d3", x: 575, y: 236, to: ["claude", "slack"] },
    { id: "d4", x: 560, y: 420, to: ["slack", "notion"] },
    { id: "d5", x: 250, y: 545, to: ["meet", "drive"] },
    { id: "d6", x: 30, y: 300, to: ["highlevel", "teams"] },
  ],
};

/** Conexiones entre herramientas: dentro de cada grupo y algunas entre grupos vecinos. */
const GROUP_EDGES: [ToolId, ToolId][] = [
  ["zoom", "meet"],
  ["meet", "teams"],
  ["hubspot", "salesforce"],
  ["salesforce", "highlevel"],
  ["slack", "notion"],
  ["notion", "drive"],
  ["claude", "chatgpt"],
];
const CROSS_EDGES: [ToolId, ToolId][] = [
  ["highlevel", "teams"],
  ["salesforce", "chatgpt"],
  ["claude", "slack"],
  ["drive", "meet"],
];

/**
 * Ritmos repartidos con una semilla fija: periodos de 4 a 14 s y desfases distintos, así los pulsos nunca coinciden
 * todos y la red parece viva sin llamar la atención.
 */
const rhythm = (i: number, base: number, spread: number, travel: number): Rhythm => {
  const h = Math.sin((i + 1) * 12.9898) * 43758.5453;
  const r = h - Math.floor(h);
  const h2 = Math.sin((i + 1) * 78.233) * 12543.21;
  return { period: base + spread * r, offset: (h2 - Math.floor(h2)) * 10, travel };
};

const curve = (a: P, b: P, bend: number) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Control desplazado en perpendicular: curvas suaves, no rectas de regla
  const c = { x: mx - dy * bend, y: my + dx * bend };
  return { c, d: `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}` };
};

/** Punto de la curva cuadrática de una conexión (para los pulsos). */
export const edgePoint = (e: NetEdge, k: number) => {
  const m = 1 - k;
  return { x: m * m * e.a.x + 2 * m * k * e.c.x + k * k * e.b.x, y: m * m * e.a.y + 2 * m * k * e.c.y + k * k * e.b.y };
};

const cache = new Map<string, Network>();

export function buildNetwork(W: number, H: number, tools: readonly ToolNode[]): Network {
  const key = `${W}x${H}:${tools.map((t) => t.id).join(",")}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const portrait = H / W > 1.3;
  const S = portrait ? PORTRAIT : WIDE;
  // En apaisado se escala por el alto y, si sobra ancho, la red se abre algo más en horizontal (hasta 1,6 veces): en
  // pantallas anchas y bajas, como un móvil en horizontal, así no se juntan los nodos que están uno encima de otro
  const ky = portrait ? H / S.H : Math.min(H / S.H, W / S.W);
  const kx = portrait ? W / S.W : Math.min(W / S.W, ky * 1.6);
  const at = (p: P) => ({ x: (p.x - S.W / 2) * kx, y: (p.y - S.H / 2) * ky });

  const ids = new Set(tools.map((t) => t.id));
  const netTools: NetTool[] = [];
  GROUPS.forEach((g) => {
    g.tools
      .filter((id) => ids.has(id))
      .forEach((id) => {
        const p = S.tools[id];
        if (p) netTools.push({ id, group: g.id, ...at(p) });
      });
  });
  const byId = new Map<string, P>(netTools.map((t) => [t.id, t]));

  // Grupos: un halo suave detrás de cada uno y su nombre
  const groups: NetGroup[] = GROUPS.map((g) => {
    const ts = netTools.filter((t) => t.group === g.id);
    const cx = ts.reduce((a, t) => a + t.x, 0) / Math.max(1, ts.length);
    const cy = ts.reduce((a, t) => a + t.y, 0) / Math.max(1, ts.length);
    const r = Math.max(...ts.map((t) => Math.hypot(t.x - cx, t.y - cy))) + 56;
    return { id: g.id, label: g.label, x: cx, y: cy, r, cap: at(S.caps[g.id]) };
  });

  const edges: NetEdge[] = [];
  const hub = { x: 0, y: 0 };
  // Líneas al centro: los pulsos van de la herramienta a Fivo, como datos que entran en el grafo
  netTools.forEach((t, i) => {
    const { c, d } = curve(t, hub, i % 2 ? 0.06 : -0.06);
    edges.push({ id: `hub-${t.id}`, kind: "hub", a: { x: t.x, y: t.y }, b: hub, c, d, pulse: rhythm(i, 4.2, 3.6, 0.26), shimmer: rhythm(i + 40, 8, 6, 0.3) });
  });

  const pair = (list: [string, string][], kind: EdgeKind, bend: number, seed: number) => {
    list.forEach(([x, y], i) => {
      const a = byId.get(x);
      const b = byId.get(y);
      if (!a || !b) return;
      // En las conexiones entre nodos, el sentido del pulso se alterna
      const [from, to] = i % 2 ? [b, a] : [a, b];
      const { c, d } = curve(from, to, i % 2 ? -bend : bend);
      edges.push({ id: `${kind}-${x}-${y}`, kind, a: { x: from.x, y: from.y }, b: { x: to.x, y: to.y }, c, d, pulse: rhythm(seed + i, 5, 3, 0.22), shimmer: null });
    });
  };
  pair(GROUP_EDGES, "group", 0.14, 20);
  pair(CROSS_EDGES, "cross", 0.18, 30);

  // Nodos secundarios, con sus líneas finas
  const pills: NetPill[] = [];
  const dots: NetDot[] = [];
  const secondary = [...S.pills.map((p) => ({ ...p, pill: true })), ...S.dots.map((p) => ({ ...p, label: "", pill: false }))];
  secondary.forEach((s) => {
    const pos = at(s);
    if (s.pill) pills.push({ id: s.id, label: s.label, ...pos });
    else dots.push({ id: s.id, ...pos });
    byId.set(s.id, pos);
  });
  const minor: [string, string][] = [];
  secondary.forEach((s) => s.to.forEach((t) => minor.push([t, s.id])));
  minor.forEach(([x, y], i) => {
    const a = byId.get(x);
    const b = byId.get(y);
    if (!a || !b) return;
    const { c, d } = curve(a, b, i % 2 ? 0.1 : -0.1);
    edges.push({ id: `minor-${x}-${y}`, kind: "minor", a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, c, d, pulse: null, shimmer: null });
  });

  const net = { W, H, portrait, groups, tools: netTools, pills, dots, edges };
  cache.set(key, net);
  return net;
}
