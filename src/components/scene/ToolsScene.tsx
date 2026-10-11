"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { compactRing, toolsFor } from "@/lib/scene/graph";
import { useScene } from "@/lib/scene/store";
import { DUR, EASE_CSS } from "@/lib/scene/motion";
import { useLanding } from "../landing/LandingContext";
import { BlockCta } from "../landing/BlockCta";

const ToolsView3D = dynamic(() => import("./ToolsView3D"), { ssr: false });

/**
 * Bloque 3. Los logotipos son nodos alrededor del nodo central de Fivo. Las líneas
 * se dibujan al entrar en pantalla; al pasar por una herramienta se enciende su
 * conexión y aparece qué aporta. 3D con canvas compartido; SVG en móvil, equipos
 * modestos y sin WebGL; con movimiento reducido, el estado final fijo.
 */
export function ToolsScene() {
  const { tools } = useLanding();
  const TOOLS = useMemo(() => toolsFor(tools.ids), [tools.ids]);
  const COMPACT = useMemo(() => compactRing(TOOLS.length), [TOOLS.length]);
  const { plan, canvas } = useScene();
  const is3d = plan === "3d" && canvas;

  const box = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLElement | null)[]>([]);
  const litRef = useRef(-1);
  const enteredRef = useRef(false);
  const [lit, setLitState] = useState(-1);
  const [entered, setEntered] = useState(false);

  const setLit = (i: number) => {
    litRef.current = i;
    setLitState(i);
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          enteredRef.current = true;
          setEntered(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Al salir del modo 3D, los logotipos vuelven a su sitio por CSS
  const was3d = useRef(false);
  useEffect(() => {
    if (is3d) {
      was3d.current = true;
      return;
    }
    if (!was3d.current) return;
    was3d.current = false;
    chipRefs.current.forEach((el) => {
      if (el) {
        el.style.transform = "translate(-50%,-50%)";
        el.style.opacity = "";
        el.style.zIndex = "";
      }
    });
  }, [is3d]);

  // Dos disposiciones (ancha y compacta) calculadas aquí y elegidas por CSS (.tool-*): el HTML del servidor ya
  // trae cada logotipo en su sitio final, sin esperar a medir nada, y no hay salto al cargar el JavaScript.
  const FULL = { rx: 40, ry: 37 };
  const COMP = { rx: 33, ry: 38 };
  const pos = (i: number) => ({
    "--lf": `${50 + TOOLS[i].u * FULL.rx}%`,
    "--tf": `${50 - TOOLS[i].v * FULL.ry}%`,
    "--lc": `${50 + COMPACT[i].u * COMP.rx}%`,
    "--tc": `${50 - COMPACT[i].v * COMP.ry}%`,
  });
  const drawn = plan === "static" || plan === "pending" || entered; // sin JS o en estático, ya dibujado

  return (
    <section aria-labelledby="herramientas" className="relative border-y border-line">
      <div className="mx-auto max-w-[1120px] px-5 pb-6 pt-14 text-center lg:px-10 lg:pt-16">
        <h2 id="herramientas" className="font-display text-2xl font-black sm:text-3xl">
          {tools.title}
        </h2>
        {tools.intro && <p className="mx-auto mt-3 max-w-[640px] text-[16px] leading-snug text-fg-muted">{tools.intro}</p>}
      </div>

      <div className="mx-auto max-w-[1120px] px-2 pb-5 sm:px-5 lg:px-10 lg:pb-8">
        <div
          ref={box}
          className="relative mx-auto h-[470px] w-full sm:h-[440px] lg:h-[500px]"
          onPointerLeave={() => setLit(-1)}
        >
          {/* Anillos orbitales finos detrás del grupo */}
          <div aria-hidden className="tool-ring pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-line-strong" style={{ "--w": `${FULL.rx * 2}%`, "--h": `${FULL.ry * 2}%`, "--wc": `${COMP.rx * 2}%`, "--hc": `${COMP.ry * 2}%` } as React.CSSProperties} />
          <div aria-hidden className="tool-ring pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-line" style={{ "--w": `${FULL.rx * 1.2}%`, "--h": `${FULL.ry * 1.2}%`, "--wc": `${COMP.rx * 1.2}%`, "--hc": `${COMP.ry * 1.2}%` } as React.CSSProperties} />

          {/* Líneas 2D (en 3D las dibuja WebGL). Dos juegos, ancho y compacto; CSS enseña el que toca */}
          {!is3d &&
            (["full", "compact"] as const).map((kind) => (
              <svg key={kind} aria-hidden className={`tool-lines tool-lines--${kind} absolute inset-0 h-full w-full overflow-visible`}>
                {TOOLS.map((n, i) => {
                  const r = kind === "full" ? FULL : COMP;
                  const uv = kind === "full" ? { u: n.u, v: n.v } : COMPACT[i];
                  const l = 50 + uv.u * r.rx;
                  const t = 50 - uv.v * r.ry;
                  const on = lit === i;
                  return (
                    <line
                      key={n.id}
                      x1="50%"
                      y1="50%"
                      x2={`${l}%`}
                      y2={`${t}%`}
                      pathLength={1}
                      stroke="var(--color-accent)"
                      strokeOpacity={lit === -1 ? 0.5 : on ? 1 : 0.14}
                      strokeWidth={on ? 1.6 : 1}
                      strokeDasharray={1}
                      strokeDashoffset={drawn ? 0 : 1}
                      vectorEffect="non-scaling-stroke"
                      style={{
                        transition: `stroke-dashoffset ${plan === "static" ? 0 : DUR.scene}ms ${EASE_CSS} ${plan === "static" ? 0 : i * 90}ms, stroke-opacity ${DUR.micro}ms ${EASE_CSS}`,
                      }}
                    />
                  );
                })}
              </svg>
            ))}

          {/* Nodo central: Fivo */}
          <div
            className="absolute left-1/2 top-1/2 flex h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/60 bg-bg/80"
            style={{ boxShadow: "0 0 0 8px color-mix(in srgb, var(--color-accent) 10%, transparent), 0 0 48px color-mix(in srgb, var(--color-accent) 55%, transparent)", zIndex: 5 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/fivo-mark.svg" alt="Fivo" width={30} height={35} className="h-[35px] w-[30px]" />
          </div>

          {/* Herramientas */}
          {TOOLS.map((n, i) => {
            const on = lit === i;
            const style: React.CSSProperties = is3d
              ? { left: 0, top: 0 }
              : ({ ...pos(i), transform: "translate(-50%,-50%)" } as React.CSSProperties);
            return (
              <div
                key={n.id}
                ref={(el) => {
                  chipRefs.current[i] = el;
                }}
                className={`absolute ${is3d ? "" : "tool-chip"}`}
                style={style}
              >
                <span
                  aria-hidden={!on}
                  className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[6px] border border-line-strong bg-glass px-3 py-1 text-[13px] font-medium text-fg"
                  style={{ opacity: on ? 1 : 0, marginBottom: on ? 8 : 4, transition: `opacity ${DUR.micro}ms ${EASE_CSS}, transform ${DUR.micro}ms ${EASE_CSS}` }}
                >
                  {n.gives}
                </span>
                <button
                  type="button"
                  aria-label={`${n.name}${n.mcp ? ", vía MCP" : ""}. Aporta: ${n.gives}`}
                  aria-pressed={on}
                  onPointerEnter={() => setLit(i)}
                  onFocus={() => setLit(i)}
                  onBlur={() => setLit(-1)}
                  onClick={() => setLit(on ? -1 : i)}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border bg-fg"
                  style={{
                    borderColor: on ? "var(--color-accent)" : "transparent",
                    boxShadow: on ? "0 0 0 4px var(--color-accent-soft)" : "none",
                    transition: `border-color ${DUR.micro}ms ${EASE_CSS}, box-shadow ${DUR.micro}ms ${EASE_CSS}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/logos/tools/${n.file}`} alt="" width={24} height={24} className="h-6 w-6" />
                </button>
                <span className="absolute left-1/2 top-full mt-1.5 w-max max-w-[92px] -translate-x-1/2 px-1 text-center text-[13px] leading-tight text-fg-muted">
                  {n.name}
                  {n.mcp && <span className="block text-[12px] text-fg-muted">vía MCP</span>}
                </span>
              </div>
            );
          })}

          {plan === "3d" && canvas && (
            <ToolsView3D track={box} chipRefs={chipRefs} litRef={litRef} enteredRef={enteredRef} tools={TOOLS} />
          )}
        </div>

        {tools.after && (
          <div className="mx-auto mt-2 max-w-[640px] text-center">
            <p className="font-display text-xl font-bold leading-snug sm:text-2xl">{tools.after.main}</p>
            <p className="mt-3 text-[14px] leading-snug text-fg-muted">{tools.after.small}</p>
          </div>
        )}
        <BlockCta position="herramientas" />
      </div>
    </section>
  );
}
