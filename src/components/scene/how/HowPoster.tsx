import { toolsFor } from "@/lib/scene/graph";
import type { ToolId } from "@/lib/scene/graph";
import type { HowScene } from "@/content/types";
import { STATIC_T, computeState, makeLayout } from "@/lib/scene/how/model";

/**
 * Estado inicial estático de cada escena de "Cómo funciona": el grafo con sus nodos y líneas en la posición
 * final y, en los pasos 2 y 3, el panel de la videollamada o del chat ya dibujado. Se pinta en el HTML del
 * servidor, sin JavaScript. HowStage (la animación o el 3D) lo sustituye cuando está listo, con la misma
 * geometría (el mismo modelo), así que no hay salto de diseño.
 */
const SIZES = { wide: { W: 720, H: 540 }, compact: { W: 350, H: 500 } } as const;

const Dot = ({ tone }: { tone: "win" | "lose" }) => <i aria-hidden className={`status-dot ${tone === "lose" ? "text-danger" : "text-success"}`} />;

export function HowPoster({ k, toolIds, scene, compact = false }: { k: 0 | 1 | 2; toolIds: ToolId[]; scene: HowScene; compact?: boolean }) {
  const { W, H } = compact ? SIZES.compact : SIZES.wide;
  const L = makeLayout(W, H);
  const tools = toolsFor(toolIds);
  const st = computeState(STATIC_T[k], 0, L, true, tools);
  const gs = st.hub.s;
  const stepOne = Math.min(1, Math.max(0, (gs - 0.8) / 0.2));
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
        {st.nodes.map((n) => (
          <line
            key={n.id}
            x1={st.hub.sx}
            y1={st.hub.sy}
            x2={st.hub.sx + (n.sx - st.hub.sx) * n.lineP}
            y2={st.hub.sy + (n.sy - st.hub.sy) * n.lineP}
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeOpacity={(0.18 + n.lit * 0.55) * n.appear}
          />
        ))}
        {st.nodes.map((n) =>
          n.kind === "call" ? (
            <circle key={n.id} cx={n.sx} cy={n.sy} r={3.2 * n.ss * (0.6 + 0.4 * gs)} fill="var(--color-fg)" opacity={n.appear} />
          ) : null,
        )}
        {/* Nodo central */}
        <circle cx={st.hub.sx} cy={st.hub.sy} r={43 * (0.42 + 0.58 * gs)} fill="var(--color-bg)" stroke="var(--color-accent)" strokeOpacity="0.6" />
        <image href="/logos/fivo-mark.svg" x={st.hub.sx - 15 * (0.42 + 0.58 * gs)} y={st.hub.sy - 17.5 * (0.42 + 0.58 * gs)} width={30 * (0.42 + 0.58 * gs)} height={35 * (0.42 + 0.58 * gs)} />
        {/* Herramientas */}
        {st.nodes.map((n) => {
          if (n.kind !== "tool") return null;
          const t = tools[n.index];
          const sc = n.ss * (0.42 + 0.58 * gs);
          return (
            <g key={n.id} opacity={0.3 + 0.7 * n.lineP}>
              <circle cx={n.sx} cy={n.sy} r={24 * sc} fill="var(--color-fg)" />
              <image href={`/logos/tools/${t.file}`} x={n.sx - 12 * sc} y={n.sy - 12 * sc} width={24 * sc} height={24 * sc} />
              {stepOne > 0 && (
                <text x={n.sx} y={n.sy + 24 * sc + 15} textAnchor="middle" fontSize="13" fill="var(--color-fg-muted)" opacity={stepOne * n.lineP}>
                  {t.name}
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
                  <i aria-hidden className="status-dot text-accent" />
                  Ejemplo
                </span>
              </div>
              <div className={`grid grid-cols-5 ${compact ? "gap-1.5" : "gap-2.5"}`}>
                {scene.initials.map((ini) => (
                  <div key={ini} className="flex aspect-square items-center justify-center rounded-[12px] border border-line bg-bg">
                    <span className="flex h-[58%] w-[58%] items-center justify-center rounded-full bg-accent font-sans text-sm font-bold text-bg">{ini}</span>
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
                  <i aria-hidden className="status-dot text-accent" />
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
