"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LandingContent } from "@/content/types";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { ComparePanel } from "./ComparePanel";
import { useLanding } from "../landing/LandingContext";

const EASE = "cubic-bezier(0.16,1,0.3,1)";

type Mode = "hoy" | "con";

type Problem = LandingContent["problem"];
type Row = Problem["rows"][number];

/** Los mismos nodos: sueltos en grupos aislados ("Hoy") o unidos en el grafo ("Con Fivo"). */
const nodesOf = (groups: Problem["groups"]) => groups.flatMap((g) => g.nodes.map((n) => ({ ...n, group: g.id, cx: g.cx, cy: g.cy })));

function Field({ problem, mode, active, instant = false, label }: { problem: Problem; mode: Mode; active: number; instant?: boolean; label: string }) {
  const { groups, pains } = problem;
  const NODES = useMemo(() => nodesOf(groups), [groups]);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 560, h: 380 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = size;
  const con = mode === "con";
  const rx = Math.min(w * 0.36, 250);
  const ry = Math.min(h * 0.34, 130);
  const ring = NODES.map((_, i) => {
    const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
    return { x: w / 2 + Math.cos(a) * rx, y: h / 2 + Math.sin(a) * ry };
  });
  const hiGroup = !con ? pains[active]?.group : undefined;
  const tr = (d: number) => (instant ? "none" : `all 1100ms ${EASE} ${d}ms`);

  return (
    <div ref={box} className="relative h-[350px] w-full sm:h-[360px] lg:h-[380px]" role="img" aria-label={label}>
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        {ring.map((p, i) => (
          <line
            key={i}
            x1={w / 2}
            y1={h / 2}
            x2={p.x}
            y2={p.y}
            stroke="var(--color-accent)"
            strokeOpacity={0.7}
            strokeWidth="1.2"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={con ? 0 : 1}
            style={{ transition: instant ? "none" : `stroke-dashoffset 800ms ${EASE} ${con ? 700 + i * 70 : 0}ms` }}
          />
        ))}
      </svg>

      {/* Hoy: anillos discontinuos y etiquetas de cada grupo aislado */}
      {groups.map((G) => {
        const g = G.id;
        const hi = hiGroup === g;
        const dim = !con && active !== -1 && !hi;
        return (
          <div key={g} className="absolute left-0 top-0" style={{ transform: `translate(${G.cx * w}px, ${G.cy * h}px)`, opacity: con ? 0 : dim ? 0.3 : 1, transition: instant ? "none" : `opacity 500ms ${EASE}` }} aria-hidden>
            <span
              className="absolute left-0 top-0 rounded-full border border-dashed"
              style={{
                width: G.ring[0],
                height: G.ring[1],
                borderColor: hi ? "var(--color-accent)" : "var(--color-line-strong)",
                boxShadow: hi ? "0 0 36px color-mix(in srgb, var(--color-accent) 25%, transparent)" : "none",
                transform: `translate(-50%,-50%) scale(${hi ? 1.06 : 1})`,
                transition: `all 500ms ${EASE}`,
              }}
            />
            <span
              className="absolute left-0 whitespace-nowrap rounded-[6px] border bg-surface px-3 py-1 text-[13px] font-medium"
              style={{ top: G.labelTop, transform: "translate(-50%, 0)", borderColor: hi ? "var(--color-accent)" : "var(--color-line)", color: hi ? "var(--color-fg)" : "var(--color-fg-muted)", transition: `all 400ms ${EASE}` }}
            >
              {G.label}
            </span>
          </div>
        );
      })}

      {/* Con Fivo: nodo central */}
      <div
        className="absolute flex h-[58px] w-[58px] items-center justify-center rounded-full border bg-bg"
        style={{
          left: w / 2,
          top: h / 2,
          transform: `translate(-50%,-50%) scale(${con ? 1 : 0.6})`,
          opacity: con ? 1 : 0,
          borderColor: "var(--color-accent)",
          boxShadow: "0 0 0 8px color-mix(in srgb, var(--color-accent) 10%, transparent), 0 0 40px color-mix(in srgb, var(--color-accent) 55%, transparent)",
          transition: tr(con ? 500 : 0),
          zIndex: 3,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/fivo-mark.svg" alt="" width={24} height={28} className="h-7 w-6" />
      </div>

      {NODES.map((n, i) => {
        const hi = hiGroup === n.group;
        const p = con ? ring[i] : { x: n.cx * w + n.dx, y: n.cy * h + n.dy };
        return (
          <span
            key={n.f}
            className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border bg-fg"
            style={{
              transform: `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,0) translate(-50%,-50%)`,
              opacity: con ? 1 : active !== -1 && !hi ? 0.3 : 0.75,
              borderColor: con || hi ? "var(--color-accent)" : "transparent",
              boxShadow: con ? "0 0 0 4px color-mix(in srgb, var(--color-accent) 12%, transparent), 0 0 20px color-mix(in srgb, var(--color-accent) 30%, transparent)" : hi ? "0 0 0 4px color-mix(in srgb, var(--color-accent) 12%, transparent)" : "none",
              transition: instant ? "none" : `transform 1100ms ${EASE} ${con ? i * 70 : 0}ms, opacity 500ms ${EASE}, border-color 400ms ${con ? i * 70 + 500 : 0}ms, box-shadow 500ms ${con ? i * 70 + 600 : 0}ms`,
              zIndex: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/logos/tools/${n.f}`} alt="" width={24} height={24} className="h-6 w-6" />
          </span>
        );
      })}
    </div>
  );
}

function Card({ row, mode, both, shown }: { row: Row; mode: Mode; both: boolean; shown: boolean }) {
  const con = mode === "con";
  return (
    <article
      className="rounded-[12px] border p-4 sm:p-6"
      style={{
        borderColor: both || con ? "color-mix(in srgb, var(--color-accent) 60%, transparent)" : "var(--color-line)",
        background: both || con ? "color-mix(in srgb, var(--color-accent) 12%, transparent)" : "var(--color-surface)",
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(14px)",
        transition: `all 600ms ${EASE}`,
      }}
    >
      <h3 className="font-display text-lg font-bold leading-snug" style={{ color: con || both ? "var(--color-fg)" : "var(--color-fg-muted)", transition: "color 500ms" }}>
        {row.topic}
      </h3>
      {both ? (
        <dl className="mt-4 space-y-2 text-[15px] leading-snug">
          <div>
            <dt className="text-[13px] font-medium text-fg-muted">Cómo lo haces hoy</dt>
            <dd className="text-fg-muted">{row.today}</dd>
          </div>
          <div>
            <dt className="text-[13px] font-medium text-accent">Con Fivo</dt>
            <dd className="text-fg">{row.fivo}</dd>
          </div>
        </dl>
      ) : (
        <div className="mt-4 grid text-[16px] leading-snug" aria-hidden>
          <p className="[grid-area:1/1]" style={{ color: "var(--color-fg-muted)", opacity: con ? 0 : 1, transform: con ? "translateY(-6px)" : "none", transition: `all 450ms ${EASE}` }}>
            <span className="mb-1 block text-[13px] font-medium">Cómo lo haces hoy</span>
            {row.today}
          </p>
          <p className="[grid-area:1/1]" style={{ color: "var(--color-fg)", opacity: con ? 1 : 0, transform: con ? "none" : "translateY(6px)", transition: `all 450ms ${EASE} ${con ? 250 : 0}ms` }}>
            <span className="mb-1 block text-[13px] font-medium text-accent">Con Fivo</span>
            {row.fivo}
          </p>
        </div>
      )}
    </article>
  );
}

function Pains({ pains, active, reduced, pick }: { pains: Problem["pains"]; active: number; reduced: boolean; pick: (i: number) => void }) {
  return (
    <ul className="divide-y divide-line">
      {pains.map((p, i) => {
        const on = active === i || reduced;
        return (
          <li key={p.text}>
            <button
              type="button"
              aria-pressed={active === i}
              onPointerEnter={() => pick(i)}
              onFocus={() => pick(i)}
              onClick={() => pick(i)}
              className="flex w-full cursor-pointer items-start gap-4 py-5 text-left first:pt-0"
            >
              <i aria-hidden className="status-dot mt-[13px] sm:mt-[15px]" style={{ color: active === i ? "var(--color-accent)" : "var(--color-fg-subtle)", transition: `color 300ms ${EASE}` }} />
              <span className="font-display text-xl font-bold leading-snug sm:text-2xl" style={{ color: active === -1 || active === i || on ? "var(--color-fg)" : "var(--color-fg-muted)", transition: "color 300ms" }}>
                {p.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Bloque 4 fusionado con la comparativa. Primero "Hoy": nodos sueltos en tres grupos y los tres
 * dolores. Cuando el visitante ha recorrido la sección, los mismos nodos se unen en el grafo y
 * aparecen las cuatro tarjetas "Con Fivo". El interruptor permite volver a "Hoy".
 */
/** `onCon` avisa cuando se llega a "Con Fivo" (o enseguida con movimiento reducido): ahí aparece el botón del bloque. */
export default function ProblemScene({ onCon }: { onCon?: () => void }) {
  const { problem } = useLanding();
  const { rows: ROWS } = problem;
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [zoneRef, zoneNear] = useInView<HTMLDivElement>({ threshold: 0, rootMargin: "0px 0px -38% 0px" });
  const [deepRef, zoneDeep] = useInView<HTMLDivElement>({ threshold: 0, rootMargin: "0px 0px -70% 0px" });
  const [read, setRead] = useState(false);
  const [active, setActive] = useState(-1);
  const [mode, setMode] = useState<Mode>("hoy");
  // Estado inicial estático ya pintado: tarjetas o panel visibles desde el primer momento (nunca un hueco).
  // `switched` solo controla el paso automático a "Con Fivo".
  const [shown] = useState(true);
  const [switched, setSwitched] = useState(false);

  useEffect(() => {
    if (mode === "con" || reduced) onCon?.();
  }, [mode, reduced, onCon]);
  const touched = useRef(false);

  // Una pasada de dolores al entrar: cada uno resalta su grupo; después queda en reposo
  useEffect(() => {
    if (!inView || reduced) return;
    const ids = [0, 1, 2].map((i) => window.setTimeout(() => !touched.current && setActive(i), 400 + i * 1900));
    const end = window.setTimeout(() => {
      setRead(true);
      if (!touched.current) setActive(-1);
    }, 400 + 3 * 1900);
    return () => [...ids, end].forEach(window.clearTimeout);
  }, [inView, reduced]);

  // El cambio a "Con Fivo" ocurre al llegar al final de la sección, no al entrar
  useEffect(() => {
    const zoneIn = zoneDeep || (zoneNear && read);
    if (!zoneIn || reduced || switched) return;
    const id = window.setTimeout(() => {
      setSwitched(true);
      if (!touched.current) {
        setActive(-1);
        setMode("con");
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [zoneNear, zoneDeep, read, reduced, switched]);

  const pick = (i: number) => {
    touched.current = true;
    setActive(i);
  };
  const choose = (m: Mode) => {
    touched.current = true;
    setSwitched(true);
    setActive(-1);
    setMode(m);
  };

  const sr = (
    <table className="sr-only">
      <thead>
        <tr>
          <th />
          <th>Cómo lo haces hoy</th>
          <th>Con Fivo</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={r.topic}>
            <th scope="row">{r.topic}</th>
            <td>{r.today}</td>
            <td>{r.fivo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (reduced) {
    return (
      <div>
        <Pains pains={problem.pains} active={-1} reduced pick={() => {}} />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-center text-sm font-semibold text-fg-muted">Cómo lo haces hoy</p>
            <Field problem={problem} mode="hoy" active={-1} instant label="Nodos sueltos y apagados, sin conexiones." />
          </div>
          <div>
            <p className="mb-1 text-center text-sm font-semibold text-accent">Con Fivo</p>
            <Field problem={problem} mode="con" active={-1} instant label="Los mismos nodos unidos en el grafo y encendidos." />
          </div>
        </div>
        {problem.compare ? (
          <div className="mt-8">
            <ComparePanel rows={ROWS} mode="both" instant />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {ROWS.map((r) => (
              <Card key={r.topic} row={r} mode="con" both shown />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {!problem.compare && sr}
      <p className="sr-only" role="status" aria-live="polite">
        {shown ? (mode === "con" ? "Mostrando Con Fivo: los mismos nodos, unidos en el grafo y encendidos." : "Mostrando Hoy: los nodos sueltos, sin conexión entre ellos.") : ""}
      </p>
      <div ref={ref} className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <Pains pains={problem.pains} active={active} reduced={false} pick={pick} />
        </div>
        <div className="lg:col-span-7">
          <Field problem={problem} mode={mode} active={active} label={mode === "con" ? "Los mismos nodos unidos en el grafo y encendidos." : "Nodos de llamadas, CRM, mensajes y documentos, sueltos y sin conexión entre ellos."} />
        </div>
      </div>

      {/* Final de la sección: interruptor y tarjetas */}
      <div ref={zoneRef} className="mt-4 lg:mt-6">
        <div className={`sticky top-[68px] z-20 flex justify-center py-1 lg:static lg:py-2 ${problem.compare ? "lg:pb-4" : ""}`}>
          <div role="radiogroup" aria-label="Comparar cómo lo haces hoy con Fivo" className="relative inline-grid grid-cols-2 rounded-[8px] border border-line bg-glass p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-accent">
            <span aria-hidden className="absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-[6px] bg-accent-soft border border-accent" style={{ transform: mode === "con" ? "translateX(100%)" : "none", transition: `transform 500ms ${EASE}` }} />
            {(["hoy", "con"] as Mode[]).map((m) => (
              <label key={m} className={`relative z-10 flex cursor-pointer items-center justify-center rounded-[6px] px-5 font-medium transition-colors ${problem.compare ? "min-h-[52px] min-w-[150px] text-[17px] font-semibold sm:min-w-[170px]" : "min-h-[44px] min-w-[120px] text-[15px]"}`} style={{ color: mode === m ? "var(--color-fg)" : "var(--color-fg-muted)" }}>
                <input type="radio" name="comparar" value={m} checked={mode === m} onChange={() => choose(m)} className="sr-only" />
                {m === "hoy" ? "Hoy" : "Con Fivo"}
              </label>
            ))}
          </div>
        </div>
        {problem.compare ? (
          <div ref={deepRef} className="mt-3 md:mt-4">
            <ComparePanel rows={ROWS} mode={mode} />
          </div>
        ) : (
          <div ref={deepRef} className="mt-3 grid gap-3 md:mt-4 md:grid-cols-2 md:gap-4" style={{ pointerEvents: shown ? "auto" : "none" }}>
            {ROWS.map((r) => (
              <Card key={r.topic} row={r} mode={mode} both={false} shown={shown} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
