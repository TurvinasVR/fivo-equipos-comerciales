"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { STATIC_T } from "@/lib/scene/how/model";
import type { HowState } from "@/lib/scene/how/model";
import { clamp01 } from "@/lib/scene/motion";
import { PHONE_QUERY, useEarly } from "@/lib/hooks";
import { useScene } from "@/lib/scene/store";
import { useLanding } from "./landing/LandingContext";
import { BlockCta } from "./landing/BlockCta";
import { HowPoster } from "./scene/how/HowPoster";
import { HowPhoneCard } from "./scene/how/HowPhoneCard";

const HowStage = dynamic(() => import("./scene/how/HowStage"), { ssr: false });

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function StepHead({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <>
      <span
        aria-hidden
        className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-brand font-display text-sm font-bold text-fg"
      >
        {n}
      </span>
      <div>
        <h3 className="font-display text-xl font-bold leading-snug sm:text-2xl">{title}</h3>
        <p className="sr-only">{desc}</p>
      </div>
    </>
  );
}

/**
 * Bloque 5. Una sola historia que se recorre con el scroll: en escritorio, un escenario
 * fijo con los tres pasos a un lado; en móvil, cada paso con su escena. Todo se dibuja y se
 * anima en código. Las escenas se cargan cuando el bloque se acerca a la pantalla.
 */
export function HowItWorks() {
  const { how, tools } = useLanding();
  const STEPS = how.steps;
  const { plan, canvas } = useScene();
  const wide = useMedia("(min-width: 1024px)");
  // Móvil: los pasos 2 y 3 son solo su tarjeta (HowPhoneCard), sin el grafo, que ya sale en el paso 1
  const phone = useMedia(PHONE_QUERY);
  const staticMode = plan === "static";
  const sticky = wide && !staticMode;
  const use3d = plan === "3d" && canvas && sticky;

  // El código de la animación o del 3D empieza a cargar con antelación (a dos pantallas o con el navegador libre)
  const [section, early] = useEarly<HTMLElement>();
  // Cuando la animación pinta su primer fotograma, sustituye al póster estático (misma geometría)
  const readyRef = useRef<Record<string, boolean>>({});
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const markReady = useCallback((key: string) => {
    if (readyRef.current[key]) return;
    readyRef.current[key] = true;
    setReady((r) => ({ ...r, [key]: true }));
  }, []);

  /* ---------- escritorio: escenario fijo, el scroll es la línea de tiempo */
  const track = useRef<HTMLDivElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement>(null);
  const lastActive = useRef(-1);

  const getTSticky = useCallback(() => {
    const el = track.current;
    if (!el) return 0;
    const st = stick.current;
    if (!st) return 0;
    const r = el.getBoundingClientRect();
    // La escena se queda fija cuando el recorrido llega a su `top` y se suelta cuando su borde inferior toca el del recorrido
    const top = parseFloat(getComputedStyle(st).top) || 0;
    const total = r.height - st.offsetHeight;
    return clamp01((top - r.top) / Math.max(1, total)) * 3;
  }, []);

  const onFrame = useCallback((s: HowState) => {
    if (s.active !== lastActive.current) {
      lastActive.current = s.active;
      items.current.forEach((it, i) => it && (it.dataset.active = i === s.active ? "true" : "false"));
    }
    if (bar.current) bar.current.style.transform = `scaleY(${(s.t / 3).toFixed(4)})`;
  }, []);

  /* ---------- móvil y estático: cada paso con su escena */
  const stepEls = useRef<(HTMLElement | null)[]>([]);
  const getTStep = (k: number) => () => {
    const el = stepEls.current[k];
    if (!el) return k;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return k + clamp01((vh * 0.9 - r.top) / (r.height + vh * 0.5));
  };

  const stage = (key: string, k: 0 | 1 | 2, compactFirst: boolean) => (
    <>
      {/* Póster estático ya pintado en el HTML: nunca un hueco mientras carga la animación */}
      <div className="absolute inset-0" style={{ opacity: ready[key] ? 0 : 1, pointerEvents: "none" }}>
        {compactFirst ? (
          <>
            <div className="h-full md:hidden">
              <HowPoster k={k} toolIds={tools.ids} scene={how.scene} compact />
            </div>
            <div className="hidden h-full md:block">
              <HowPoster k={k} toolIds={tools.ids} scene={how.scene} />
            </div>
          </>
        ) : (
          <HowPoster k={k} toolIds={tools.ids} scene={how.scene} />
        )}
      </div>
    </>
  );

  return (
    <section ref={section} aria-labelledby="como-funciona" className="relative overflow-x-clip border-t border-line">
      {/* Escritorio con movimiento: escenario fijo, el scroll es la línea de tiempo. CSS elige esta disposición o la apilada, así el HTML no cambia al cargar el JS */}
      <div className="hidden lg:block lg:pt-20 motion-reduce:lg:hidden" style={{ "--h": "max(min(72dvh, 640px), 36rem)" } as React.CSSProperties}>
        {/* El recorrido mide justo lo que dura la animación: la escena (alto --h) más 130dvh de scroll. Al acabar el paso 3
            la escena termina en el borde inferior del recorrido y el bloque del botón aparece enseguida, sin pantalla vacía. */}
        <div ref={track} data-how-track style={{ height: "calc(var(--h) + 130dvh)" }}>
          <div
            ref={stick}
            className="sticky mx-auto grid w-full max-w-[1280px] grid-cols-12 items-center gap-10 px-10"
            style={{ top: "max(72px, calc((100dvh - var(--h)) / 2))", height: "var(--h)" }}
          >
              <div className="col-span-4 self-start">
                <h2 id="como-funciona" className="font-display text-4xl font-black tracking-[-0.015em]">
                  Cómo funciona
                </h2>
                <ol className="relative mt-9 space-y-8">
                  <span aria-hidden className="absolute bottom-3 left-4 top-3 w-px bg-line" />
                  <span ref={bar} aria-hidden className="absolute bottom-3 left-4 top-3 w-px origin-top bg-brand-y" style={{ transform: "scaleY(0)" }} />
                  {STEPS.map((s, i) => (
                    <li
                      key={s.title}
                      ref={(el) => {
                        items.current[i] = el;
                      }}
                      data-active={i === 0 ? "true" : "false"}
                      className="relative flex gap-4 transition-opacity duration-200 data-[active=false]:opacity-60"
                    >
                      <StepHead n={i + 1} title={s.title} desc={s.desc} />
                    </li>
                  ))}
                </ol>
              </div>
              <div className="relative col-span-8 h-[var(--h)]">
                {stage("sticky", 0, false)}
                {early && sticky && (
                  // Invisible hasta su primer fotograma: antes de eso sus piezas aún no tienen sitio y taparían al póster
                  <div className="absolute inset-0" style={{ opacity: ready.sticky ? 1 : 0 }}>
                    <HowStage
                      toolIds={tools.ids}
                      scene={how.scene}
                      getT={getTSticky}
                      staticT={null}
                      use3d={use3d}
                      onFrame={(st) => {
                        onFrame(st);
                        markReady("sticky");
                      }}
                    />
                  </div>
                )}
              </div>
          </div>
        </div>
        {/* Pegado al final de la animación. Bajo el chat del paso 3 el escenario deja un aire que crece con su alto (--h):
            el bloque sube lo que sobra de ese aire (nunca baja), para quedar a unos 56 px del chat, como el resto de
            bloques. Abajo, sin padding propio */}
        <BlockCta position="como-funciona" className="mx-auto mt-[min(0px,calc(223px-0.48*var(--h)))] max-w-[1280px] px-10" />
      </div>

      {/* Móvil, tableta y movimiento reducido: cada paso con su escena */}
      <div className="block lg:hidden motion-reduce:lg:block">
        <div className="mx-auto max-w-[1120px] px-5 pb-0 pt-12 lg:px-10 lg:pb-8 lg:pt-20">
          <h2 className="font-display text-3xl font-black tracking-[-0.015em] sm:text-4xl">Cómo funciona</h2>
          <div className="mt-8 space-y-10">
            {STEPS.map((s, k) => (
              <article
                key={s.title}
                ref={(el) => {
                  stepEls.current[k] = el;
                }}
                className="grid items-center gap-6 md:grid-cols-12 md:gap-10"
              >
                <div className="flex gap-4 md:col-span-4">
                  <StepHead n={k + 1} title={s.title} desc={s.desc} />
                </div>
                {k > 0 && (
                  <div className="md:hidden">
                    <HowPhoneCard k={k as 1 | 2} scene={how.scene} />
                  </div>
                )}
                {/* El paso 1 (el grafo de 11 herramientas) tiene un escenario más alto para que los nodos no se junten */}
                <div className={`relative w-full md:col-span-8 ${k === 0 ? "aspect-[3/5] max-[389px]:aspect-[3/5.5] md:aspect-square" : "aspect-[7/10] md:aspect-[4/3] max-md:hidden"}`}>
                  {stage(`step${k}`, k as 0 | 1 | 2, true)}
                  {early && !sticky && !(phone && k > 0) && (
                    <div className="absolute inset-0" style={{ opacity: ready[`step${k}`] ? 1 : 0 }}>
                      <HowStage
                        toolIds={tools.ids}
                        scene={how.scene}
                        key={`${staticMode}-${k}`}
                        getT={getTStep(k)}
                        staticT={staticMode ? STATIC_T[k] : null}
                        use3d={false}
                        onFrame={() => markReady(`step${k}`)}
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
          <BlockCta position="como-funciona" className="mt-8 lg:mt-14" />
        </div>
      </div>
    </section>
  );
}
