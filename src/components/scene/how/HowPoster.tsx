import { toolsFor } from "@/lib/scene/graph";
import type { ToolId } from "@/lib/scene/graph";
import type { HowScene } from "@/content/types";
import { STATIC_T, computeState, makeLayout } from "@/lib/scene/how/model";
import { EDGE_STYLE } from "./edgeStyle";

/**
 * Estado inicial estático de cada escena de "Cómo funciona": el grafo con sus nodos y líneas en la posición
 * final y, en los pasos 2 y 3, el panel de la videollamada o del chat ya dibujado. Se pinta en el HTML del
 * servidor, sin JavaScript. HowStage (la animación o el 3D) lo sustituye cuando está listo, con la misma
 * geometría (el mismo modelo), así que no hay salto de diseño.
 */
const SIZES = { wide: { W: 720, H: 540 }, compact: { W: 350, H: 500 } } as const;
/** El paso 1 tiene un escenario más alto (ver HowItWorks): mismas proporciones aquí para que no haya salto. */
const SIZES_STEP1 = { wide: { W: 728, H: 582 }, compact: { W: 350, H: 583 } } as const;
/** Escenario fijo de escritorio (ver HowItWorks): unos 786 x 640 px. */
const SIZE_STICKY = { W: 786, H: 640 } as const;

const Dot = ({ tone }: { tone: "win" | "lose" }) => <i aria-hidden className={`status-dot ${tone === "lose" ? "text-danger" : "text-success"}`} />;

export function HowPoster({ k, toolIds, scene, compact = false, sticky = false }: { k: 0 | 1 | 2; toolIds: ToolId[]; scene: HowScene; compact?: boolean; sticky?: boolean }) {
  const sizes = k === 0 ? SIZES_STEP1 : SIZES;
  const { W, H } = sticky ? SIZE_STICKY : compact ? sizes.compact : sizes.wide;
  const L = makeLayout(W, H);
  const tools = toolsFor(toolIds);
  const st = computeState(STATIC_T[k], 0, L, true, tools);
  const gs = st.hub.s;
  const stepOne = Math.min(1, Math.max(0, (gs - 0.8) / 0.2));
  // Los logotipos y las píldoras encogen menos que las distancias cuando el grafo se hace pequeño (como en HowStage)
  const counter = (L.compact ? 0.05 + 0.95 * gs : 0.42 + 0.58 * gs) / gs;
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
  const box = k === 1 ? L.call : L.chat;

  return (
    <div aria-hidden className="relative h-full w-full select-none">
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={`hp-hub-${k}${compact ? "c" : ""}`}>
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={st.hub.sx} cy={st.hub.sy} r={104 * gs} fill={`url(#hp-hub-${k}${compact ? "c" : ""})`} />
        {st.nodes.map((n) =>
          n.kind === "call" ? (
            <line key={n.id} x1={st.hub.sx} y1={st.hub.sy} x2={st.hub.sx + (n.sx - st.hub.sx) * n.lineP} y2={st.hub.sy + (n.sy - st.hub.sy) * n.lineP} stroke="var(--color-accent)" strokeWidth="1" strokeOpacity={(0.18 + n.lit * 0.55) * n.appear} />
          ) : null,
        )}
        {/* Red del paso 1, en px desde Fivo */}
        <g transform={`translate(${st.hub.sx} ${st.hub.sy}) scale(${gs})`}>
          <defs>
            <linearGradient id={`hp-net-${k}${compact ? "c" : ""}`} gradientUnits="userSpaceOnUse" x1={-W / 2} y1={-H / 2} x2={W / 2} y2={H / 2}>
              <stop offset="0" stopColor="var(--color-grad-a)" />
              <stop offset="1" stopColor="var(--color-grad-b)" />
            </linearGradient>
          </defs>
          <g opacity={stepOne}>
            {st.net.groups.map((g) => (
              <circle key={g.id} cx={g.x} cy={g.y} r={g.r} fill="var(--color-grad-a)" opacity="0.05" />
            ))}
          </g>
          {st.net.edges.map((e) => (
            <path
              key={e.id}
              d={e.d}
              fill="none"
              {...EDGE_STYLE[e.kind]}
              stroke={e.kind === "hub" ? `url(#hp-net-${k}${compact ? "c" : ""})` : EDGE_STYLE[e.kind].stroke}
              opacity={e.kind === "minor" ? stepOne : 1}
            />
          ))}
          <g opacity={stepOne}>
            {st.net.dots.map((d) => (
              <g key={d.id}>
                <circle cx={d.x} cy={d.y} r="8" fill="var(--color-grad-b)" opacity="0.18" />
                <circle cx={d.x} cy={d.y} r="2.4" fill="var(--color-grad-b)" />
              </g>
            ))}
            {st.net.groups.map((g) => (
              <text key={g.id} x={g.cap.x} y={g.cap.y + 3.5} textAnchor="middle" fontSize={10 * counter} fontWeight="600" letterSpacing="1.2" fill="var(--color-fg-subtle)">
                {g.label.toUpperCase()}
              </text>
            ))}
            {st.net.pills.map((pl) => {
              const w = pl.label.length * 6.3 + 30;
              return (
                <g key={pl.id} transform={`translate(${pl.x} ${pl.y}) scale(${counter})`}>
                  <rect x={-w / 2} y={-11} width={w} height={22} rx={11} fill="var(--color-glass)" stroke="var(--color-line-strong)" />
                  <circle cx={-w / 2 + 13} cy={0} r={3} fill="var(--color-grad-b)" />
                  <text x={-w / 2 + 22} y={4} fontSize="11" fontWeight="500" fill="var(--color-fg-muted)">{pl.label}</text>
                </g>
              );
            })}
          </g>
        </g>
        {st.nodes.map((n) =>
          n.kind === "call" ? (
            <circle key={n.id} cx={n.sx} cy={n.sy} r={3.2 * n.ss * (0.6 + 0.4 * gs)} fill="var(--color-fg)" opacity={n.appear} />
          ) : null,
        )}
        {/* Nodo central */}
        <circle cx={st.hub.sx} cy={st.hub.sy} r={43 * (0.42 + 0.58 * gs)} fill="var(--color-bg)" stroke="var(--color-accent)" strokeOpacity="0.6" />
        <image href="/logos/fivo-mark.svg" x={st.hub.sx - 15 * (0.42 + 0.58 * gs)} y={st.hub.sy - 17.5 * (0.42 + 0.58 * gs)} width={30 * (0.42 + 0.58 * gs)} height={35 * (0.42 + 0.58 * gs)} />
        {/* Herramientas */}
        {st.net.tools.map((nt) => {
          const t = tools.find((x) => x.id === nt.id);
          if (!t) return null;
          return (
            <g key={nt.id} transform={`translate(${st.hub.sx + nt.x * gs} ${st.hub.sy + nt.y * gs}) scale(${counter * gs})`}>
              <circle r={24} fill="var(--color-fg)" />
              <image href={`/logos/tools/${t.file}`} x={-(t.icon ?? 24) / 2} y={-(t.icon ?? 24) / 2} width={t.icon ?? 24} height={t.icon ?? 24} />
              {stepOne > 0 && (
                <text y={24 + 15} textAnchor="middle" fontSize="13" fill="var(--color-fg-muted)" opacity={stepOne}>
                  {compact ? (t.short ?? t.name) : t.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {k > 0 && (
        <div className="absolute flex items-center" style={{ left: pct(box.x, W), top: pct(box.y, H), width: pct(box.w, W), height: pct(box.h, H) }}>
          {k === 1 ? (
            <div className="relative w-full rounded-[12px] border border-line bg-surface/92 p-3.5 sm:p-4">
              <div className="mb-3 flex items-center justify-between text-[12px] text-fg-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-fg-muted" />
                  {scene.callTitle}
                </span>
                <span className="inline-flex items-center gap-1.5 text-fg-muted">
                  <i aria-hidden className="status-dot status-dot--brand" />
                  Ejemplo
                </span>
              </div>
              <div className={`grid grid-cols-5 ${compact ? "gap-1.5" : "gap-2.5"}`}>
                {scene.initials.map((ini) => (
                  <div key={ini} className="flex aspect-square items-center justify-center rounded-[12px] border border-line bg-bg">
                    <span className="flex h-[58%] w-[58%] items-center justify-center rounded-full bg-brand font-sans text-sm font-bold text-bg">{ini}</span>
                  </div>
                ))}
                <div className="flex aspect-square items-center justify-center rounded-[12px] border border-accent/70 bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logos/fivo-mark.svg" alt="" width={22} height={26} className="h-[26px] w-[22px]" />
                </div>
              </div>
              <p className="mt-1.5 text-right text-[12px] text-accent">{scene.assistantCaption}</p>
              <div className="mt-3 rounded-[12px] border border-accent/60 bg-bg p-3 text-[13px] leading-snug">
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
          ) : (
            <div className="relative w-full rounded-[12px] border border-line bg-surface/92 p-3.5 sm:p-4">
              <div className="mb-3 flex items-center justify-between text-[12px] text-fg-muted">
                <span className="flex items-center gap-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logos/fivo-mark.svg" alt="" width={12} height={14} className="h-[14px] w-[12px]" />
                  Fivo Chat
                </span>
                <span className="inline-flex items-center gap-1.5 text-fg-muted">
                  <i aria-hidden className="status-dot status-dot--brand" />
                  Ejemplo
                </span>
              </div>
              <div className="ml-auto max-w-[92%] rounded-[12px] bg-accent-soft px-3.5 py-2.5 text-[13px] font-medium leading-snug text-fg sm:text-sm">{scene.question}</div>
              <div className="mt-3 space-y-2 text-[13px] leading-snug text-fg-muted">
                {scene.answer.map((a) => (
                  <p key={a}>{a}</p>
                ))}
              </div>
              <div className={`mt-2.5 flex ${compact ? "flex-wrap gap-1.5" : "flex-col items-start gap-1.5"}`}>
                {scene.chips.map((c) => (
                  <span key={c.text} className="flex items-center gap-2 py-1 text-[12px] text-fg">
                    <Dot tone={c.tone} />
                    {c.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
