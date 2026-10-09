"use client";

import type { LandingContent } from "@/content/types";

const EASE = "cubic-bezier(0.16,1,0.3,1)";

type Row = LandingContent["problem"]["rows"][number];
/** "both": las dos columnas a la vez y sin animación (movimiento reducido). */
type PanelMode = "hoy" | "con" | "both";

/** Posiciones de los nodos de cada fila (viewBox 96x44). Las mismas en "Hoy" y en "Con Fivo": se unen sin moverse. */
const LAYOUTS: [number, number][][] = [
  [[10, 30], [34, 10], [58, 34], [86, 14]],
  [[8, 14], [30, 34], [52, 12], [74, 32], [90, 10]],
  [[12, 24], [40, 8], [60, 36], [88, 22]],
  [[10, 12], [32, 32], [56, 14], [80, 34]],
];

/** Nodos sueltos y apagados ("Hoy") o unidos y encendidos en accent ("Con Fivo"). */
function Nodes({ index, linked, delay, instant }: { index: number; linked: boolean; delay: number; instant: boolean }) {
  const pts = LAYOUTS[index % LAYOUTS.length];
  const t = (d: number) => (instant ? "none" : `all 700ms ${EASE} ${d}ms`);
  return (
    <svg viewBox="0 0 96 44" width="96" height="44" className="h-[44px] w-[96px] shrink-0 overflow-visible" aria-hidden>
      {pts.slice(1).map(([x, y], i) => {
        const [px, py] = pts[i];
        return (
          <line
            key={i}
            x1={px}
            y1={py}
            x2={x}
            y2={y}
            stroke="var(--color-accent)"
            strokeWidth="1.2"
            strokeOpacity="0.75"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={linked ? 0 : 1}
            style={{ transition: t(delay + i * 90) }}
          />
        );
      })}
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={linked ? 3.6 : 3.2}
          fill={linked ? "var(--color-accent)" : "var(--color-fg-subtle)"}
          fillOpacity={linked ? 1 : 0.7}
          style={{ transition: t(delay + i * 90), filter: linked ? "drop-shadow(0 0 4px var(--color-accent))" : "none" }}
        />
      ))}
    </svg>
  );
}

/** Flecha fina entre el "Hoy" y el "Con Fivo". */
function Arrow() {
  return (
    <svg viewBox="0 0 28 12" width="28" height="12" className="hidden shrink-0 md:block" aria-hidden>
      <path d="M1 6h24M20 1.5 26 6l-6 4.5" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Comparación "Hoy" y "Con Fivo": un solo panel con una fila por tema y divisores de 1px. Las etiquetas de las
 * columnas salen una vez, en la cabecera. Al pasar a "Con Fivo", la columna "Hoy" se atenúa y la de "Con Fivo"
 * se enciende fila a fila, con los nodos de cada fila conectándose; al volver a "Hoy" ocurre al revés.
 */
export function ComparePanel({ rows, mode, instant = false }: { rows: Row[]; mode: PanelMode; instant?: boolean }) {
  const con = mode === "con" || mode === "both";
  const hoyDim = mode === "con";
  const n = rows.length;
  // Al encender, fila a fila de arriba abajo; al apagar, en orden inverso
  const delay = (i: number) => (instant ? 0 : mode === "con" ? i * 170 : (n - 1 - i) * 90);

  return (
    <div className="card overflow-hidden">
      {/* Cabecera de columnas (escritorio) */}
      <div className="hidden grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_28px_minmax(0,1.3fr)] items-center gap-x-6 border-b border-line px-7 py-3.5 text-[14px] font-semibold md:grid">
        <span aria-hidden />
        <span className="text-fg-muted" style={{ opacity: hoyDim ? 0.75 : 1, transition: instant ? "none" : `opacity 500ms ${EASE}` }}>
          Hoy
        </span>
        <span aria-hidden />
        <span className="text-accent">Con Fivo</span>
      </div>
      {/* Leyenda (móvil): también una sola vez */}
      <div className="flex items-center gap-6 border-b border-line px-5 py-3 text-[14px] font-semibold md:hidden" aria-hidden>
        <span className="flex items-center gap-2 text-fg-muted">
          <i className="status-dot text-fg-subtle" />
          Hoy
        </span>
        <span className="flex items-center gap-2 text-accent">
          <i className="status-dot" />
          Con Fivo
        </span>
      </div>

      <ul className="divide-y divide-line">
        {rows.map((r, i) => (
          <li
            key={r.topic}
            className="grid gap-3 px-5 py-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_28px_minmax(0,1.3fr)] md:items-center md:gap-x-6 md:px-7 md:py-6"
          >
            <h3 className="font-sans text-[17px] font-semibold leading-snug text-fg">{r.topic}</h3>

            <div
              className="flex items-center gap-4"
              style={{ opacity: hoyDim ? 0.75 : 1, transition: instant ? "none" : `opacity 600ms ${EASE} ${delay(i)}ms` }}
            >
              <Nodes index={i} linked={false} delay={0} instant={instant} />
              <p className="text-[15px] leading-snug text-fg-muted">
                <span className="sr-only">Hoy: </span>
                {r.today}
              </p>
            </div>

            <Arrow />

            <div className="flex items-center gap-4">
              <Nodes index={i} linked={con} delay={delay(i)} instant={instant} />
              <p
                className="text-[16px] font-semibold leading-snug md:font-medium"
                style={{
                  color: con ? "var(--color-fg)" : "var(--color-fg-muted)",
                  opacity: con ? 1 : 0.8,
                  transition: instant ? "none" : `color 500ms ${EASE} ${delay(i)}ms, opacity 500ms ${EASE} ${delay(i)}ms`,
                }}
              >
                <span className="sr-only">Con Fivo: </span>
                {r.fivo}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
