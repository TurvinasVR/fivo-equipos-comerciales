import { TOOLS } from "../graph";
import type { ToolNode } from "../graph";
import { clamp01, easeOut } from "../motion";
import { buildNetwork } from "./network";
import type { Network } from "./network";

/**
 * Línea de tiempo única del bloque "Cómo funciona". t va de 0 a 3:
 *   0 a 1  paso 1: la red de herramientas se forma alrededor del nodo de Fivo (ver network.ts)
 *   1 a 2  paso 2: videollamada, transcripción, resumen y nodo nuevo que vuela al grafo
 *   2 a 3  paso 3: pregunta, nodos de llamadas que se encienden y respuesta con referencias
 * Cada escena acaba exactamente donde empieza la siguiente. El 3D, el SVG y el estado
 * estático leen este mismo modelo, así que se ven igual.
 */

export const D = 14; // distancia de cámara (unidades de mundo)
export const STATIC_T = [1.0, 1.78, 3.0]; // estado final entendible de cada escena
/**
 * Antes del paso 1, mientras el escenario sube hasta quedar fijo, el progreso va de -HUB_PRE a 0 y en ese tramo entra el
 * nodo de Fivo: cuando empiezan a llegar las herramientas, ya está en el centro.
 */
export const HUB_PRE = 0.12;

const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

type Pose = { x: number; y: number; s: number };

export type Layout = {
  W: number;
  H: number;
  unit: number;
  compact: boolean;
  /** Óvalo donde caen los nodos de llamadas de los pasos 2 y 3. */
  RX: number;
  RY: number;
  center: Pose;
  corner: Pose;
  right: Pose;
  call: Box;
  chat: Box;
};
type Box = { x: number; y: number; w: number; h: number };

export function makeLayout(W: number, H: number): Layout {
  const compact = W < 560;
  if (compact) {
    const unit = Math.min(W / 9, H / 10.2);
    const RY = Math.min(7.2, (H / 2 / unit - 1.6) / 0.8);
    const RX = Math.min(6.4, (W / 2 / unit - 1.4) / 0.86);
    return {
      W, H, unit, compact, RX, RY,
      center: { x: 0, y: 0, s: 1 },
      corner: { x: 0, y: 4.55, s: 0.3 },
      right: { x: 0, y: 4.6, s: 0.32 },
      call: { x: W * 0.02, y: H * 0.3, w: W * 0.96, h: H * 0.68 },
      chat: { x: W * 0.02, y: H * 0.3, w: W * 0.96, h: H * 0.68 },
    };
  }
  const unit = Math.min(W / 8.8, H / 6.4);
  return {
    W, H, unit, compact, RX: 3.15, RY: 2.6,
    center: { x: 0, y: 0, s: 1 },
    corner: { x: 2.35, y: 1.75, s: 0.4 },
    right: { x: 2.2, y: 0, s: 0.68 },
    call: { x: W * 0.02, y: H * 0.08, w: W * 0.64, h: H * 0.88 },
    chat: { x: W * 0.02, y: H * 0.08, w: W * 0.5, h: H * 0.88 },
  };
}

/* ------------------------------------------------------------------ nodos */

export type NodeKind = "tool" | "call";
export type NodeState = {
  id: string;
  kind: NodeKind;
  index: number;
  /** mundo, tras girar y escalar el grafo */
  X: number;
  Y: number;
  Z: number;
  /** pantalla (px del escenario) */
  sx: number;
  sy: number;
  ss: number;
  /** 0 a 1 */
  appear: number;
  lineP: number;
  lit: number;
  /** progreso del pulso hub a nodo, -1 si no hay */
  pulse: number;
};

const CALL_BASE = [
  { a: 22, r: 0.56, z: 0.5 },
  { a: 152, r: 0.52, z: -0.4 },
  { a: 250, r: 0.54, z: 0.35 },
  { a: 332, r: 0.58, z: -0.3 },
  { a: 76, r: 0.5, z: 0.2 },
];
/** Llamadas de donde sale la respuesta del paso 3 */
export const SOURCES = [0, 2, 3];

/* ------------------------------------------------------------------ estado */

export type HowState = {
  t: number;
  /** Red del paso 1, en px desde Fivo (escala 1: el escenario la mueve y la escala con la pose del grafo). */
  net: Network;
  /** Entrada del nodo de Fivo (0 a 1). */
  hubIn: number;
  tm: number;
  L: Layout;
  hub: { X: number; Y: number; sx: number; sy: number; ss: number; s: number };
  nodes: NodeState[];
  active: number;
  call: {
    op: number;
    tiles: number[];
    assistant: number;
    speaker: number;
    wave: number;
    lines: number[];
    transcriptOp: number;
    summary: number;
    bullets: number[];
    shrink: number;
    fly: number;
    flyFrom: { x: number; y: number };
  };
  chat: {
    op: number;
    q: number;
    thinking: number;
    answer: number[];
    chips: number[];
    links: number[];
    phase: number;
    anchor: { x: number; y: number };
    chipPos: { x: number; y: number }[];
  };
};

export function computeState(tRaw: number, tm: number, L: Layout, forceStatic = false, tools: ToolNode[] = TOOLS): HowState {
  const net = buildNetwork(L.W, L.H, tools);
  const t = Math.min(3, Math.max(0, tRaw));
  const u2 = clamp01(t - 1);
  const u3 = clamp01(t - 2);

  // Pose del grafo: centro, esquina (paso 2) y derecha (paso 3)
  const k1 = easeInOut(clamp01((t - 1.0) / 0.14));
  const k2 = easeInOut(clamp01((t - 2.0) / 0.14));
  const toCorner = { x: mix(L.center.x, L.corner.x, k1), y: mix(L.center.y, L.corner.y, k1), s: mix(L.center.s, L.corner.s, k1) };
  const g = { x: mix(toCorner.x, L.right.x, k2), y: mix(toCorner.y, L.right.y, k2), s: mix(toCorner.s, L.right.s, k2) };
  const g0 = { s: g.s };
  // El grafo ya no gira: sus piezas tienen sitio fijo y solo flotan un poco (HowStage)
  const yaw = 0;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const tilt = 0.16;

  const project = (x: number, y: number, z: number) => {
    // girar en Y, inclinar un poco en X, escalar y mover
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y1 = y * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
    const X = x1 * g.s + g.x;
    const Y = y1 * g.s + g.y;
    const Z = z2 * g.s;
    const sc = D / (D - Z);
    return { X, Y, Z, sx: L.W / 2 + X * sc * L.unit, sy: L.H / 2 - Y * sc * L.unit, ss: sc };
  };

  const nodes: NodeState[] = [];
  const hub0 = project(0, 0, 0);

  // Herramientas: en su sitio de la red; `lineP` es su avance de entrada (0 a 1) y `lit` el brillo al conectar
  tools.forEach((n, i) => {
    const nt = net.tools.find((x) => x.id === n.id);
    const w = nt ? clamp01((t - nt.win[0]) / (nt.win[1] - nt.win[0])) : 1;
    const x = nt?.x ?? 0;
    const y = nt?.y ?? 0;
    const flash = easeOut(clamp01((w - 0.75) / 0.25));
    nodes.push({
      id: n.id, kind: "tool", index: i,
      X: hub0.X + x / L.unit * g.s, Y: hub0.Y - y / L.unit * g.s, Z: 0,
      sx: hub0.sx + x * g.s, sy: hub0.sy + y * g.s, ss: 1,
      appear: 1, lineP: easeOut(w), lit: w >= 1 ? 0.5 : flash, pulse: -1,
    });
  });

  // Nodos de llamadas: el primero llega volando (fin del paso 2), el resto aparecen al empezar el paso 3
  CALL_BASE.forEach((c, j) => {
    const a = (c.a * Math.PI) / 180;
    const pr = project(Math.cos(a) * c.r * L.RX, Math.sin(a) * c.r * L.RY, c.z);
    const start = j === 0 ? 1.965 : 2.03 + (j - 1) * 0.025;
    const dur = j === 0 ? 0.04 : 0.07;
    const appear = easeOut(clamp01((t - start) / dur));
    const si = SOURCES.indexOf(j);
    const srcLit = si >= 0 ? easeOut(clamp01((u3 - (0.4 + si * 0.045)) / 0.06)) : 0;
    nodes.push({ id: `call${j}`, kind: "call", index: j, ...pr, appear, lineP: appear, lit: Math.max(srcLit, appear * 0.22), pulse: -1 });
  });
  if (forceStatic && t < 2) {
    const c0 = nodes[tools.length];
    c0.appear = 1;
    c0.lineP = 1;
    c0.lit = 0.6;
  }

  const hubP = hub0;

  /* ----- paso 2: videollamada */
  const callOp = easeOut(clamp01((u2 - 0.02) / 0.1)) * (1 - clamp01((u2 - 0.88) / 0.1));
  const tiles = [0, 1, 2, 3].map((k) => easeOut(clamp01((u2 - (0.04 + k * 0.025)) / 0.08)));
  const assistant = easeOut(clamp01((u2 - 0.14) / 0.1));
  const lines = [0, 1, 2].map((j) => clamp01((u2 - (0.2 + j * 0.11)) / 0.1));
  const speaker = u2 < 0.2 ? -1 : u2 < 0.31 ? 0 : u2 < 0.42 ? 1 : 0;
  const wave = clamp01((u2 - 0.12) / 0.06) * (1 - clamp01((u2 - 0.56) / 0.08));
  const transcriptOp = 1 - clamp01((u2 - 0.56) / 0.08);
  const summary = easeOut(clamp01((u2 - 0.58) / 0.1));
  const bullets = [0, 1, 2].map((k) => clamp01((u2 - (0.62 + k * 0.04)) / 0.05));
  const shrink = easeInOut(clamp01((u2 - 0.8) / 0.08));
  const fly = easeInOut(clamp01((u2 - 0.86) / 0.12));

  /* ----- paso 3: chat */
  const chatBox = L.chat;
  const anchor = { x: chatBox.x + chatBox.w, y: chatBox.y + chatBox.h * 0.62 };
  const chipPos = [0, 1, 2].map((k) => ({ x: chatBox.x + chatBox.w * (0.2 + k * 0.3), y: chatBox.y + chatBox.h * 0.9 }));
  const chatOp = easeOut(clamp01((u3 - 0.04) / 0.08));
  const q = clamp01((u3 - 0.1) / 0.26);
  const thinking = clamp01((u3 - 0.36) / 0.03) * (1 - clamp01((u3 - 0.52) / 0.03));
  const answer = [clamp01((u3 - 0.52) / 0.14), clamp01((u3 - 0.64) / 0.12)];
  const chips = [0, 1, 2].map((k) => easeOut(clamp01((u3 - (0.74 + k * 0.04)) / 0.06)));
  const links = [0, 1, 2].map((k) => easeOut(clamp01((u3 - (0.78 + k * 0.04)) / 0.08)));
  const phase = u3 < 0.78 ? ((u3 - 0.4) / 0.1) % 1 : (tm * 0.22) % 1;

  // Pulsos de los nodos de llamada hacia el chat se dibujan en la capa de enlaces
  return {
    t,
    tm,
    L,
    hub: { X: hubP.X, Y: hubP.Y, sx: hubP.sx, sy: hubP.sy, ss: hubP.ss, s: g.s },
    nodes,
    active: t < 1.06 ? 0 : t < 2.06 ? 1 : 2,
    net,
    hubIn: easeOut(clamp01((tRaw + HUB_PRE) / (HUB_PRE * 0.8))),
    call: {
      op: callOp, tiles, assistant, speaker, wave, lines, transcriptOp, summary, bullets, shrink, fly,
      flyFrom: { x: L.call.x + L.call.w * 0.5, y: L.call.y + L.call.h * 0.74 },
    },
    chat: { op: chatOp, q, thinking, answer, chips, links, phase, anchor, chipPos },
  };
}

/** Punto de una curva de Bézier cuadrática (el nodo del resumen vuela por ella). */
export function bezier(a: { x: number; y: number }, b: { x: number; y: number }, k: number, lift: number) {
  const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - lift };
  const m = 1 - k;
  return { x: m * m * a.x + 2 * m * k * c.x + k * k * b.x, y: m * m * a.y + 2 * m * k * c.y + k * k * b.y };
}
