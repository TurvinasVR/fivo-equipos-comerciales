"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { toolsFor } from "@/lib/scene/graph";
import type { ToolId } from "@/lib/scene/graph";
import type { HowScene } from "@/content/types";
import { bezier, computeState, makeLayout, SOURCES } from "@/lib/scene/how/model";
import type { HowState } from "@/lib/scene/how/model";
import { clamp01, easeOut, lerp } from "@/lib/scene/motion";

const HowView3D = dynamic(() => import("./HowView3D"), { ssr: false });

type Props = {
  /** Herramientas del grafo, en su orden del anillo. */
  toolIds: ToolId[];
  /** Texto del escenario (videollamada y chat). */
  scene: HowScene;
  /** Tiempo de la historia (0 a 3) en cada fotograma. */
  getT: () => number;
  /** Si no es null, se dibuja una sola vez en ese instante (movimiento reducido). */
  staticT: number | null;
  use3d: boolean;
  onFrame?: (s: HowState) => void;
};

const dist = (el: HTMLElement | null, stage: HTMLElement) => {
  // Centro de `el` en coordenadas del escenario, sin leer transformaciones.
  if (!el) return null;
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let n: HTMLElement | null = el;
  while (n && n !== stage) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
};

export default function HowStage({ toolIds, scene, getT, staticT, use3d, onFrame }: Props) {
  const TOOLS = useMemo(() => toolsFor(toolIds), [toolIds]);
  const NODE_COUNT = TOOLS.length + 5;
  const TRANSCRIPT = scene.transcript;
  const QUESTION = scene.question;
  const ANSWER = scene.answer;
  const CHIPS = scene.chips;
  const INITIALS = scene.initials;
  const stage = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ W: 720, H: 520 });
  const L = useMemo(() => makeLayout(size.W, size.H), [size]);
  const stateRef = useRef<HowState>(computeState(0, 0, L, false, TOOLS));
  const layoutRef = useRef(L);
  layoutRef.current = L;

  const R = useRef({
    lines: [] as (SVGLineElement | null)[],
    halos: [] as (SVGCircleElement | null)[],
    pulses: [] as (SVGCircleElement | null)[],
    cores: [] as (SVGCircleElement | null)[],
    chips: [] as (HTMLElement | null)[],
    labels: [] as (HTMLElement | null)[],
    hubGlow: null as SVGCircleElement | null,
    hubRing: null as SVGCircleElement | null,
    hubChip: null as HTMLElement | null,
    callWrap: null as HTMLElement | null,
    tiles: [] as (HTMLElement | null)[],
    assistant: null as HTMLElement | null,
    assistantCap: null as HTMLElement | null,
    bars: [] as (HTMLElement | null)[],
    tLines: [] as (HTMLElement | null)[],
    tBox: null as HTMLElement | null,
    sumCard: null as HTMLElement | null,
    sumItems: [] as (HTMLElement | null)[],
    fly: null as HTMLElement | null,
    flyDots: [] as (HTMLElement | null)[],
    chatWrap: null as HTMLElement | null,
    q: null as HTMLElement | null,
    qBubble: null as HTMLElement | null,
    dots: null as HTMLElement | null,
    ans: [] as (HTMLElement | null)[],
    ansBox: null as HTMLElement | null,
    chatChips: [] as (HTMLElement | null)[],
    linkPaths: [] as (SVGPathElement | null)[],
    linkPulses: [] as (SVGCircleElement | null)[],
    meas: null as null | { summary: { x: number; y: number } | null; anchor: { x: number; y: number } | null; chips: ({ x: number; y: number } | null)[] },
  });

  // Tamaño del escenario
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ W: Math.round(e.contentRect.width), H: Math.round(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Medidas de los puntos de anclaje (sin leer transformaciones)
  const measure = () => {
    const el = stage.current;
    if (!el) return;
    const r = R.current;
    const compactNow = layoutRef.current.compact;
    r.meas = {
      summary: dist(r.sumCard, el),
      anchor: (() => {
        const c = dist(r.ansBox, el);
        return c && r.ansBox ? { x: c.x + r.ansBox.offsetWidth / 2, y: c.y } : null;
      })(),
      // En escritorio los enlaces salen por el borde derecho de cada referencia; en móvil, por su centro
      chips: r.chatChips.map((c) => {
        const p = dist(c, el);
        return p && c ? { x: compactNow ? p.x : p.x + c.offsetWidth / 2, y: p.y } : null;
      }),
    };
  };
  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  /* ------------------------------------------------------------- aplicar */
  const apply = (st: HowState) => {
    const r = R.current;
    const { L: lay } = st;
    const m = r.meas;
    if (m?.summary) st.call.flyFrom = m.summary;
    if (m?.anchor) st.chat.anchor = m.anchor;
    if (m?.chips) m.chips.forEach((c, k) => c && (st.chat.chipPos[k] = c));
    stateRef.current = st;

    const gs = st.hub.s;
    const stepOne = clamp01((gs - 0.8) / 0.2);

    // Grafo en SVG (el 3D lo dibuja WebGL)
    st.nodes.forEach((n, i) => {
      const line = r.lines[i];
      if (line) {
        line.setAttribute("x1", st.hub.sx.toFixed(1));
        line.setAttribute("y1", st.hub.sy.toFixed(1));
        line.setAttribute("x2", (st.hub.sx + (n.sx - st.hub.sx) * n.lineP).toFixed(1));
        line.setAttribute("y2", (st.hub.sy + (n.sy - st.hub.sy) * n.lineP).toFixed(1));
        line.style.strokeOpacity = String((0.18 + n.lit * 0.55) * n.appear);
        line.style.stroke = n.lit > 0.55 ? "var(--color-accent)" : "var(--color-accent)";
      }
      const halo = r.halos[i];
      if (halo) {
        halo.setAttribute("cx", n.sx.toFixed(1));
        halo.setAttribute("cy", n.sy.toFixed(1));
        halo.setAttribute("r", (16 * n.ss * (0.5 + 0.5 * gs) * (1 + n.lit * 0.7)).toFixed(1));
        halo.style.opacity = String(n.appear * (0.07 + n.lit * 0.7));
      }
      const core = r.cores[i];
      if (core) {
        core.setAttribute("cx", n.sx.toFixed(1));
        core.setAttribute("cy", n.sy.toFixed(1));
        core.setAttribute("r", (3.2 * n.ss * (0.6 + 0.4 * gs)).toFixed(1));
        core.style.opacity = String(n.appear);
      }
      const pulse = r.pulses[i];
      if (pulse) {
        const p = n.pulse;
        pulse.style.opacity = p >= 0 ? "1" : "0";
        if (p >= 0) {
          pulse.setAttribute("cx", (st.hub.sx + (n.sx - st.hub.sx) * p).toFixed(1));
          pulse.setAttribute("cy", (st.hub.sy + (n.sy - st.hub.sy) * p).toFixed(1));
        }
      }
      // Logotipos de las herramientas (DOM), en la misma posición proyectada
      if (n.kind === "tool") {
        const chip = r.chips[n.index];
        if (chip) {
          const sc = n.ss * (0.42 + 0.58 * gs);
          chip.style.transform = `translate3d(${n.sx.toFixed(1)}px,${n.sy.toFixed(1)}px,0) translate(-50%,-50%) scale(${sc.toFixed(3)})`;
          chip.style.opacity = String(0.3 + 0.7 * n.lineP);
          chip.style.zIndex = String(Math.round((n.ss - 0.7) * 20) + (n.lit > 0.5 ? 4 : 0));
          chip.dataset.on = n.lit > 0.7 ? "1" : "0";
        }
        const lab = r.labels[n.index];
        if (lab) lab.style.opacity = String(stepOne * n.lineP);
      }
    });
    if (r.hubGlow) {
      r.hubGlow.setAttribute("cx", st.hub.sx.toFixed(1));
      r.hubGlow.setAttribute("cy", st.hub.sy.toFixed(1));
      r.hubGlow.setAttribute("r", (104 * gs).toFixed(1));
    }
    if (r.hubRing) {
      r.hubRing.setAttribute("cx", st.hub.sx.toFixed(1));
      r.hubRing.setAttribute("cy", st.hub.sy.toFixed(1));
      r.hubRing.setAttribute("r", (62 * (0.5 + 0.5 * gs)).toFixed(1));
    }
    if (r.hubChip) {
      r.hubChip.style.transform = `translate3d(${st.hub.sx.toFixed(1)}px,${st.hub.sy.toFixed(1)}px,0) translate(-50%,-50%) scale(${(0.42 + 0.58 * gs).toFixed(3)})`;
    }

    // Videollamada
    const c = st.call;
    if (r.callWrap) {
      r.callWrap.style.opacity = String(c.op);
      r.callWrap.style.visibility = c.op > 0.001 ? "visible" : "hidden";
      r.callWrap.style.transform = `translateY(${((1 - clamp01(c.op * 2)) * 14).toFixed(1)}px)`;
    }
    r.tiles.forEach((tile, k) => {
      if (!tile) return;
      tile.style.opacity = String(c.tiles[k]);
      tile.style.transform = `scale(${(0.86 + 0.14 * c.tiles[k]).toFixed(3)})`;
      tile.dataset.speaking = c.speaker === k ? "1" : "0";
    });
    if (r.assistant) {
      r.assistant.style.opacity = String(c.assistant);
      r.assistant.style.transform = `translateX(${((1 - c.assistant) * 26).toFixed(1)}px) scale(${(0.9 + 0.1 * c.assistant).toFixed(3)})`;
      r.assistant.style.boxShadow = c.assistant > 0 && c.assistant < 1 ? `0 0 0 ${(6 * (1 - c.assistant)).toFixed(1)}px color-mix(in srgb, var(--color-accent) 25%, transparent)` : "none";
    }
    if (r.assistantCap) r.assistantCap.style.opacity = String(c.assistant);
    r.bars.forEach((b, i) => {
      if (!b) return;
      const amp = c.wave * (0.45 + 0.55 * Math.abs(Math.sin(st.tm * 6.5 + i * 0.75))) * (0.6 + 0.4 * Math.sin(i * 0.5 + st.tm));
      b.style.transform = `scaleY(${(0.12 + 0.88 * Math.max(0, amp)).toFixed(3)})`;
    });
    if (r.tBox) r.tBox.style.opacity = String(c.transcriptOp);
    r.tLines.forEach((ln, j) => {
      if (!ln) return;
      const full = TRANSCRIPT[j].text;
      const n = Math.floor(full.length * c.lines[j]);
      if (ln.dataset.n !== String(n)) {
        ln.dataset.n = String(n);
        ln.textContent = full.slice(0, n) + (c.lines[j] > 0 && c.lines[j] < 1 ? "|" : "");
      }
      ln.style.opacity = c.lines[j] > 0 ? "1" : "0";
    });
    if (r.sumCard) {
      const sc = 1 - 0.88 * c.shrink;
      r.sumCard.style.opacity = String(c.summary * (c.fly > 0 ? 0 : 1));
      r.sumCard.style.transform = `translateY(${((1 - c.summary) * 10).toFixed(1)}px) scale(${sc.toFixed(3)})`;
      r.sumCard.style.borderRadius = `${(16 + 40 * c.shrink).toFixed(0)}px`;
    }
    r.sumItems.forEach((it, k) => {
      if (!it) return;
      const full = it.dataset.full ?? "";
      const n = Math.floor(full.length * c.bullets[k]);
      if (it.dataset.n !== String(n)) {
        it.dataset.n = String(n);
        it.textContent = full.slice(0, n);
      }
    });
    if (r.fly) {
      const target = st.nodes[TOOLS.length];
      const p = bezier(c.flyFrom, { x: target.sx, y: target.sy }, c.fly, lay.compact ? 40 : 70);
      r.fly.style.opacity = String(c.shrink > 0.5 && c.fly < 1 ? easeOut(clamp01((c.shrink - 0.5) * 2)) : 0);
      r.fly.style.transform = `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0) translate(-50%,-50%) scale(${(1 - 0.3 * c.fly).toFixed(3)})`;
      const OFF = [[-10, 7], [10, 7], [0, -9]];
      r.flyDots.forEach((d, k) => {
        if (d) d.style.transform = `translate(calc(-50% + ${(OFF[k][0] * (1 - c.fly)).toFixed(1)}px), calc(-50% + ${(OFF[k][1] * (1 - c.fly)).toFixed(1)}px))`;
      });
    }

    // Chat
    const ch = st.chat;
    if (r.chatWrap) {
      r.chatWrap.style.opacity = String(ch.op);
      r.chatWrap.style.visibility = ch.op > 0.001 ? "visible" : "hidden";
      r.chatWrap.style.transform = `translateY(${((1 - ch.op) * 14).toFixed(1)}px)`;
    }
    if (r.q) {
      const n = Math.floor(QUESTION.length * ch.q);
      if (r.q.dataset.n !== String(n)) {
        r.q.dataset.n = String(n);
        r.q.textContent = QUESTION.slice(0, n) + (ch.q > 0 && ch.q < 1 ? "|" : "");
      }
    }
    if (r.qBubble) r.qBubble.style.opacity = ch.q > 0 ? "1" : "0";
    if (r.dots) {
      r.dots.style.opacity = String(ch.thinking);
      Array.from(r.dots.children).forEach((d, i) => ((d as HTMLElement).style.transform = `translateY(${(-Math.max(0, Math.sin(st.tm * 7 - i * 0.9)) * 4).toFixed(1)}px)`));
    }
    r.ans.forEach((a, k) => {
      if (!a) return;
      const full = ANSWER[k];
      const n = Math.floor(full.length * ch.answer[k]);
      if (a.dataset.n !== String(n)) {
        a.dataset.n = String(n);
        a.textContent = full.slice(0, n);
      }
    });
    if (r.ansBox) r.ansBox.style.opacity = ch.answer[0] > 0 ? "1" : "0";
    r.chatChips.forEach((chip, k) => {
      if (!chip) return;
      chip.style.opacity = String(ch.chips[k]);
      chip.style.transform = `translateY(${((1 - ch.chips[k]) * 6).toFixed(1)}px)`;
    });

    // Enlaces nodo a chat y nodo a referencia (con pulsos de luz)
    const u3 = clamp01(st.t - 2);
    SOURCES.forEach((idx, j) => {
      const node = st.nodes[TOOLS.length + idx];
      const path = r.linkPaths[j];
      const pulse = r.linkPulses[j];
      if (!path || !pulse) return;
      const drawn = easeOut(clamp01((u3 - (0.42 + j * 0.03)) / 0.08));
      const toChip = ch.links[j];
      const end = { x: lerp(ch.anchor.x, ch.chipPos[j].x, toChip), y: lerp(ch.anchor.y, ch.chipPos[j].y, toChip) };
      // Al enlazar con una referencia, la curva pasa por debajo del texto de la respuesta
      const mid = { x: (node.sx + end.x) / 2, y: lerp(Math.min(node.sy, end.y) - 26, Math.max(node.sy, end.y) + 44, toChip) };
      path.setAttribute("d", `M${node.sx.toFixed(1)} ${node.sy.toFixed(1)} Q${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`);
      path.style.strokeDashoffset = String(1 - drawn);
      path.style.opacity = String(ch.op * (0.9 - 0.35 * toChip));
      const ph = (ch.phase + j * 0.31) % 1;
      const pt = bezier({ x: node.sx, y: node.sy }, end, ph, 26);
      const quad = (() => {
        const m2 = 1 - ph;
        return { x: m2 * m2 * node.sx + 2 * m2 * ph * mid.x + ph * ph * end.x, y: m2 * m2 * node.sy + 2 * m2 * ph * mid.y + ph * ph * end.y };
      })();
      void pt;
      pulse.setAttribute("cx", quad.x.toFixed(1));
      pulse.setAttribute("cy", quad.y.toFixed(1));
      pulse.style.opacity = drawn > 0.95 && ch.op > 0.5 ? "1" : "0";
    });

    onFrame?.(st);
  };

  /* ------------------------------------------------------------- motor */
  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    if (staticT !== null) {
      // Movimiento reducido: un solo fotograma, estado final
      const draw = () => {
        const lay = layoutRef.current;
        measure();
        apply(computeState(staticT, 0, lay, true, TOOLS));
      };
      draw();
      const id = window.setTimeout(draw, 120);
      return () => window.clearTimeout(id);
    }

    let raf = 0;
    let visible = false;
    let disp = getT();
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      const target = getT();
      disp = Math.abs(target - disp) < 0.0004 ? target : lerp(disp, target, 0.16);
      apply(computeState(disp, now / 1000, layoutRef.current, false, TOOLS));
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticT, L]);

  /* ------------------------------------------------------------- vista */
  const cb = L.call;
  const cc = L.chat;
  const set = <T,>(arr: T[], i: number) => (el: T | null) => {
    if (el) arr[i] = el;
  };
  const compact = L.compact;

  return (
    <div ref={stage} className="relative h-full w-full select-none" aria-hidden>
      {!use3d && (
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <radialGradient id="how-halo">
              <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.9" />
              <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="how-hub">
              <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle ref={(e) => { R.current.hubGlow = e; }} fill="url(#how-hub)" />
          <circle ref={(e) => { R.current.hubRing = e; }} fill="none" stroke="var(--color-accent)" strokeOpacity="0.5" />
          {Array.from({ length: NODE_COUNT }, (_, i) => (
            <line key={`l${i}`} ref={set(R.current.lines, i)} stroke="var(--color-accent)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          {Array.from({ length: NODE_COUNT }, (_, i) => (
            <circle key={`h${i}`} ref={set(R.current.halos, i)} fill="url(#how-halo)" />
          ))}
          {Array.from({ length: NODE_COUNT - TOOLS.length }, (_, j) => (
            <circle key={`c${j}`} ref={set(R.current.cores, TOOLS.length + j)} fill="var(--color-fg)" />
          ))}
          {Array.from({ length: NODE_COUNT }, (_, i) => (
            <circle key={`p${i}`} ref={set(R.current.pulses, i)} r="3.5" fill="var(--color-accent)" style={{ opacity: 0 }} />
          ))}
        </svg>
      )}
      {use3d && <HowView3D track={stage} stateRef={stateRef} nodeCount={NODE_COUNT} />}

      {/* Nodo central: Fivo */}
      <div
        ref={(e) => { R.current.hubChip = e; }}
        className="absolute left-0 top-0 flex h-[86px] w-[86px] items-center justify-center rounded-full border border-accent/60 bg-bg/80"
        style={{ boxShadow: "0 0 0 8px color-mix(in srgb, var(--color-accent) 10%, transparent), 0 0 44px color-mix(in srgb, var(--color-accent) 50%, transparent)", zIndex: 6 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/fivo-mark.svg" alt="" width={30} height={35} className="h-[35px] w-[30px]" />
      </div>

      {/* Herramientas como nodos */}
      {TOOLS.map((n, i) => (
        <div key={n.id} ref={set(R.current.chips, i)} className="how-chip absolute left-0 top-0" style={{ opacity: 0.3 }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-transparent bg-fg [[data-on='1']_&]:border-accent">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/logos/tools/${n.file}`} alt="" width={24} height={24} className="h-6 w-6" />
          </div>
          <span
            ref={set(R.current.labels, i)}
            className="absolute left-1/2 top-full mt-1.5 w-max max-w-[92px] -translate-x-1/2 px-1 text-center text-[13px] leading-tight text-fg-muted"
          >
            {n.name}
          </span>
        </div>
      ))}

      {/* Enlaces de las llamadas hacia el chat */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" style={{ zIndex: compact ? 7 : 9 }}>
        {SOURCES.map((_, j) => (
          <g key={j}>
            <path ref={set(R.current.linkPaths, j)} fill="none" stroke="var(--color-accent)" strokeWidth="1.4" pathLength={1} strokeDasharray={1} strokeDashoffset={1} vectorEffect="non-scaling-stroke" />
            <circle ref={set(R.current.linkPulses, j)} r="3.5" fill="var(--color-accent)" style={{ opacity: 0 }} />
          </g>
        ))}
      </svg>

      {/* PASO 2: videollamada esquemática */}
      <div className="pointer-events-none absolute flex items-center" style={{ left: cb.x, top: cb.y, width: cb.w, height: cb.h, zIndex: 8 }}>
        <div ref={(e) => { R.current.callWrap = e; }} className="relative w-full rounded-[12px] border border-line bg-surface/92 p-3.5 sm:p-4" style={{ opacity: 0, visibility: "hidden" }}>
          <div className="mb-3 flex items-center justify-between text-[12px] text-fg-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-fg-muted" />
              {scene.callTitle}
            </span>
            <span className="inline-flex items-center gap-1.5 text-fg-muted"><i aria-hidden className="status-dot text-accent" />Ejemplo</span>
          </div>

          <div className={`grid grid-cols-5 ${compact ? "gap-1.5" : "gap-2.5"}`}>
            {INITIALS.map((ini, k) => (
              <div key={ini} ref={set(R.current.tiles, k)} className="group flex aspect-square items-center justify-center rounded-[12px] border border-line bg-bg data-[speaking='1']:border-accent" style={{ opacity: 0 }}>
                <span className="flex h-[58%] w-[58%] items-center justify-center rounded-full bg-accent font-sans text-sm font-bold text-bg">
                  {ini}
                </span>
              </div>
            ))}
            <div ref={(e) => { R.current.assistant = e; }} className="flex aspect-square items-center justify-center rounded-[12px] border border-accent/70 bg-bg" style={{ opacity: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/fivo-mark.svg" alt="" width={22} height={26} className="h-[26px] w-[22px]" />
            </div>
          </div>
          <p ref={(e) => { R.current.assistantCap = e; }} className="mt-1.5 text-right text-[12px] text-accent" style={{ opacity: 0 }}>
            {scene.assistantCaption}
          </p>

          <div className="mt-2 flex h-8 items-center justify-center gap-[3px]">
            {Array.from({ length: compact ? 26 : 38 }, (_, i) => (
              <span key={i} ref={set(R.current.bars, i)} className="h-full w-[3px] origin-center rounded-full bg-accent" style={{ transform: "scaleY(0.12)" }} />
            ))}
          </div>

          <div className="relative mt-2" style={{ height: compact ? 116 : 108 }}>
            <div ref={(e) => { R.current.tBox = e; }} className="absolute inset-0 space-y-1.5 text-[13px] leading-snug text-fg-muted">
              {TRANSCRIPT.map((l, j) => (
                <p key={j} className="flex items-start gap-2.5">
                  <span aria-hidden className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent">
                    <i className="status-dot text-accent" />
                  </span>
                  <span>
                    <span className="font-semibold text-fg">{l.who}: </span>
                    <span ref={set(R.current.tLines, j)} style={{ opacity: 0 }} />
                  </span>
                </p>
              ))}
            </div>
            <div
              ref={(e) => { R.current.sumCard = e; }}
              className="absolute inset-0 rounded-[12px] border border-accent/60 bg-bg p-3 text-[13px] leading-snug"
              style={{ opacity: 0 }}
            >
              <p className="mb-1 text-[12px] font-semibold text-accent">{scene.combineLabel}</p>
              <svg viewBox="0 0 160 60" className="h-[62px] w-full" aria-hidden>
                <g stroke="var(--color-accent)" strokeWidth="1.2" strokeOpacity="0.7">
                  <line x1="30" y1="40" x2="80" y2="14" />
                  <line x1="80" y1="14" x2="130" y2="40" />
                  <line x1="30" y1="40" x2="130" y2="40" />
                </g>
                {[[30, 40], [80, 14], [130, 40]].map(([x, y]) => (
                  <circle key={x} cx={x} cy={y} r="7" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="1.4" />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* El resumen se hace nodo y vuela al grafo */}
      <div ref={(e) => { R.current.fly = e; }} className="pointer-events-none absolute left-0 top-0 h-7 w-7" style={{ opacity: 0, zIndex: 9 }}>
        {[0, 1, 2].map((k) => (
          <span key={k} ref={set(R.current.flyDots, k)} className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full border border-accent bg-bg" style={{ boxShadow: "0 0 12px color-mix(in srgb, var(--color-accent) 55%, transparent)" }} />
        ))}
      </div>

      {/* PASO 3: chat */}
      <div className="pointer-events-none absolute flex items-center" style={{ left: cc.x, top: cc.y, width: cc.w, height: cc.h, zIndex: 8 }}>
        <div ref={(e) => { R.current.chatWrap = e; }} className="relative w-full rounded-[12px] border border-line bg-surface/92 p-3.5 sm:p-4" style={{ opacity: 0, visibility: "hidden" }}>
          <div className="mb-3 flex items-center justify-between text-[12px] text-fg-muted">
            <span className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/fivo-mark.svg" alt="" width={12} height={14} className="h-[14px] w-[12px]" />
              Fivo Chat
            </span>
            <span className="inline-flex items-center gap-1.5 text-fg-muted"><i aria-hidden className="status-dot text-accent" />Ejemplo</span>
          </div>
          <div ref={(e) => { R.current.qBubble = e; }} className="ml-auto max-w-[92%] rounded-[12px] bg-accent-soft px-3.5 py-2.5 text-[13px] font-medium leading-snug text-fg sm:text-sm" style={{ minHeight: 40, opacity: 0 }}>
            <span ref={(e) => { R.current.q = e; }} />
          </div>
          <div ref={(e) => { R.current.dots = e; }} className="mt-3 flex gap-1.5 pl-1" style={{ opacity: 0, height: 10 }}>
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="h-2 w-2 rounded-full bg-accent" />
          </div>
          <div ref={(e) => { R.current.ansBox = e; }} className="relative mt-3 text-[13px] leading-snug text-fg-muted" style={{ opacity: 0, minHeight: compact ? 148 : 140 }}>
            <p ref={set(R.current.ans, 0)} />
            <p ref={set(R.current.ans, 1)} className="mt-2" />
          </div>
          <div className={`mt-2.5 flex ${compact ? "flex-wrap gap-1.5" : "flex-col items-start gap-1.5"}`}>
            {CHIPS.map((c, k) => (
              <span key={c.text} ref={set(R.current.chatChips, k)} className="flex items-center gap-2 py-1 text-[12px] text-fg" style={{ opacity: 0 }}>
                <i aria-hidden className={`status-dot ${c.tone === "lose" ? "text-danger" : "text-success"}`} />
                {c.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
