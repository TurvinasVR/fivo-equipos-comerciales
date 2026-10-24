"use client";

import { useId } from "react";
import { ArrowDown, ArrowRight } from "@phosphor-icons/react";
import type { LandingContent } from "@/content/types";
import { useInView, useReducedMotion } from "@/lib/hooks";

const EASE = "cubic-bezier(0.16,1,0.3,1)";

type Row = LandingContent["problem"]["rows"][number];
type Pt = [number, number];

/**
 * Nodos de cada fila (viewBox 120x64). `loose`: dónde están hoy, dispersos. `graph`: dónde quedan con Fivo, alrededor
 * del nodo central (como el grafo de "Cómo funciona"). `links`: uniones entre nodos además de las del centro.
 */
const HUB: Pt = [60, 32];
const LAYOUTS: { loose: Pt[]; graph: Pt[]; links: [number, number][] }[] = [
  { loose: [[10, 42], [42, 10], [80, 50], [108, 18], [56, 30]], graph: [[22, 16], [32, 52], [88, 10], [102, 42], [70, 56]], links: [[0, 1], [2, 3]] },
  { loose: [[8, 14], [32, 46], [68, 8], [96, 34], [112, 56]], graph: [[16, 32], [40, 8], [92, 14], [104, 50], [50, 56]], links: [[0, 1], [3, 4]] },
  { loose: [[12, 28], [48, 54], [44, 8], [88, 14], [106, 48]], graph: [[24, 50], [20, 14], [78, 8], [106, 30], [82, 56]], links: [[1, 2], [3, 4]] },
  { loose: [[20, 10], [8, 52], [62, 42], [84, 8], [110, 36]], graph: [[14, 40], [36, 10], [94, 18], [100, 52], [58, 58]], links: [[0, 1], [2, 3]] },
];

/**
 * Hoy: puntos grises sueltos. Con Fivo: los mismos puntos se desplazan hasta el grafo, se encienden y se unen al nodo
 * central con el degradado de marca. `on` lanza la transición (al entrar en pantalla); `instant` la quita.
 */
function Graph({ index, linked, on, delay, instant }: { index: number; linked: boolean; on: boolean; delay: number; instant: boolean }) {
  const gid = useId();
  const L = LAYOUTS[index % LAYOUTS.length];
  const joined = linked && on;
  const tr = (prop: string, d: number, ms = 700) => (instant ? "none" : `${prop} ${ms}ms ${EASE} ${delay + d}ms`);
  const lines: [Pt, Pt][] = [...L.graph.map((p) => [HUB, p] as [Pt, Pt]), ...L.links.map(([a, b]) => [L.graph[a], L.graph[b]] as [Pt, Pt])];

  return (
    <svg viewBox="0 0 120 64" className="h-[45px] w-[84px] shrink-0 overflow-visible sm:h-[52px] sm:w-[98px] lg:h-[64px] lg:w-[120px]" aria-hidden>
      {linked && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="120" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--color-grad-a)" />
            <stop offset="1" stopColor="var(--color-grad-b)" />
          </linearGradient>
        </defs>
      )}
      {linked &&
        lines.map(([[x1, y1], [x2, y2]], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`url(#${gid})`}
            strokeWidth="1.4"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={joined ? 0 : 1}
            style={{ transition: tr("stroke-dashoffset", 450 + i * 60, 600) }}
          />
        ))}
      {linked && (
        <g style={{ transformOrigin: `${HUB[0]}px ${HUB[1]}px`, transform: joined ? "none" : "scale(0)", transition: tr("transform", 380, 600) }}>
          <circle cx={HUB[0]} cy={HUB[1]} r="12" fill={`url(#${gid})`} fillOpacity="0.22" />
          <circle cx={HUB[0]} cy={HUB[1]} r="6" fill={`url(#${gid})`} />
        </g>
      )}
      {L.graph.map(([gx, gy], i) => {
        const [lx, ly] = L.loose[i];
        // Con Fivo parte de las posiciones de hoy y llega al grafo; la columna Hoy se queda en las de hoy
        const dx = joined ? 0 : lx - gx;
        const dy = joined ? 0 : ly - gy;
        return (
          <g key={i} style={{ transform: `translate(${dx}px, ${dy}px)`, transition: tr("transform", i * 50) }}>
            {linked && <circle cx={gx} cy={gy} r="7" fill="var(--color-accent)" style={{ opacity: joined ? 0.22 : 0, transition: tr("opacity", 300 + i * 50) }} />}
            <circle
              cx={gx}
              cy={gy}
              r={joined ? 3.6 : 3}
              fill={joined ? "var(--color-fg)" : "var(--color-fg-subtle)"}
              style={{ transition: tr("fill", 250 + i * 50) + (instant ? "" : `, r 400ms ${EASE} ${delay + 250 + i * 50}ms`) }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Flecha entre el antes y el después: un círculo con borde en degradado sobre la unión de las dos columnas. */
function ArrowBadge({ down = false, className = "" }: { down?: boolean; className?: string }) {
  const Icon = down ? ArrowDown : ArrowRight;
  return (
    <span aria-hidden className={`ring-brand flex items-center justify-center rounded-full [--inner:var(--color-surface)] ${className}`}>
      <Icon size={down ? 16 : 18} weight="bold" className="text-accent" />
    </span>
  );
}

const conTint = "color-mix(in srgb, var(--color-accent) 7%, var(--color-surface))";
const hoyText = "text-[15px] leading-snug text-fg-muted";
const conText = "text-[16px] font-semibold leading-snug text-fg";

/**
 * Comparación "Hoy" y "Con Fivo", siempre con las dos columnas a la vista. Escritorio (lg): una tabla con la columna
 * "Con Fivo" destacada. Móvil y tableta: una tarjeta por fila con el antes y el después (apilados en móvil, en paralelo
 * desde sm). Al entrar en pantalla, los puntos de "Con Fivo" se unen fila a fila; con movimiento reducido ya están unidos.
 */
export function ComparePanel({ rows }: { rows: Row[] }) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.25 });
  const on = inView || reduced;
  const delay = (i: number) => (reduced ? 0 : 200 + i * 160);

  return (
    <div ref={ref} data-compare>
      {/* Escritorio */}
      <div className="card hidden overflow-hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Cómo lo haces hoy y cómo es con Fivo</caption>
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[35%]" />
            <col />
          </colgroup>
          <thead>
            <tr className="text-[14px] font-semibold">
              <th scope="col" className="px-7 py-4">
                <span className="sr-only">Tema</span>
              </th>
              <th scope="col" className="px-7 py-4 text-fg-muted">
                <span className="flex items-center gap-2">
                  <i className="status-dot text-fg-subtle" aria-hidden />
                  Hoy
                </span>
              </th>
              <th scope="col" className="relative py-4 pl-12 pr-7 text-fg" style={{ background: conTint }}>
                <span aria-hidden className="bg-brand-x absolute inset-x-0 top-0 h-[2px]" />
                <span className="flex items-center gap-2">
                  <i className="status-dot status-dot--brand" aria-hidden />
                  Con Fivo
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.topic} className="border-t border-line">
                <th scope="row" className="px-7 py-6 align-middle font-display text-[19px] font-bold leading-snug text-fg">
                  {r.topic}
                </th>
                <td className="py-6 pl-7 pr-10 align-middle">
                  <div className="flex items-center gap-5">
                    <Graph index={i} linked={false} on={on} delay={0} instant />
                    <p className={hoyText}>{r.today}</p>
                  </div>
                </td>
                <td className="relative py-6 pl-12 pr-7 align-middle" style={{ background: conTint }}>
                  <ArrowBadge className="absolute left-0 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2" />
                  <div className="flex items-center gap-5">
                    <Graph index={i} linked on={on} delay={delay(i)} instant={reduced} />
                    <p className={conText}>{r.fivo}</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil y tableta: una tarjeta por fila */}
      <ul className="grid gap-3 lg:hidden">
        {rows.map((r, i) => (
          <li key={r.topic} className="card p-4 sm:p-5">
            <h3 className="font-display text-[18px] font-bold leading-snug text-fg">{r.topic}</h3>
            {/* Antes y después en orden de lectura: "Hoy" y su texto, después "Con Fivo" y el suyo */}
            <div className="mt-3 grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-3">
              <div className="flex items-center gap-3 px-1 pb-2 pt-1 sm:p-0">
                <Graph index={i} linked={false} on={on} delay={0} instant />
                <div>
                  <p className="text-[12px] font-semibold text-fg-muted">Hoy</p>
                  <p className={`mt-0.5 ${hoyText}`}>{r.today}</p>
                </div>
              </div>
              <div className="relative z-[1] -mb-4 flex justify-center sm:mb-0" aria-hidden>
                <span className="sm:hidden">
                  <ArrowBadge down className="size-8" />
                </span>
                <span className="max-sm:hidden">
                  <ArrowBadge className="size-9" />
                </span>
              </div>
              <div className="ring-brand flex items-center gap-3 rounded-[10px] px-3 pb-3 pt-5 sm:pt-3 [--inner:color-mix(in_srgb,var(--color-accent)_7%,var(--color-surface))]">
                <Graph index={i} linked on={on} delay={delay(i)} instant={reduced} />
                <div>
                  <p className="text-[12px] font-semibold text-accent">Con Fivo</p>
                  <p className={`mt-0.5 ${conText}`}>{r.fivo}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
