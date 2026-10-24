"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "@phosphor-icons/react";
import { REVIEWS as ALL_REVIEWS } from "./reviewsData";

// Esta landing es de equipos comerciales: la reseña de otro sector (Infoproductores) no se muestra. Los textos no se tocan.
const OTHER_LANDING_SECTORS = ["Infoproductores"];
const REVIEWS = ALL_REVIEWS.filter((r) => !OTHER_LANDING_SECTORS.includes(r.sector));

/**
 * Opiniones de la calculadora original (mismas 10, una sola fuente: reviewsData.ts). Se usan bajo el resultado de /gracias y en la landing. Carrusel con scroll nativo: se pasa con el
 * dedo o la rueda y con las flechas. Tarjetas planas en surface, sin cajas dentro de cajas.
 */
export default function Reviews({ headingLevel = 3, className = "mt-14 lg:mt-20" }: { headingLevel?: 2 | 3; className?: string }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const paint = useCallback(() => {
    const t = track.current;
    if (!t) return;
    setAtStart(t.scrollLeft <= 2);
    setAtEnd(t.scrollLeft >= t.scrollWidth - t.clientWidth - 2);
  }, []);

  useEffect(() => {
    paint();
    window.addEventListener("resize", paint);
    return () => window.removeEventListener("resize", paint);
  }, [paint]);

  const go = (dir: 1 | -1) => {
    const t = track.current;
    if (!t) return;
    const card = t.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 16 : t.clientWidth;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollBy({ left: dir * step, behavior: reduced ? "auto" : "smooth" });
  };

  const arrow =
    "inline-flex size-11 items-center justify-center rounded-full border border-line text-fg transition-colors hover-ring-brand disabled:cursor-default disabled:opacity-40";

  return (
    <section aria-labelledby="opiniones" className={className}>
      <div className="flex items-end justify-between gap-4">
        <Heading id="opiniones" className="font-display text-[clamp(1.375rem,1rem+1.4vw,1.875rem)] font-black leading-tight tracking-[-0.015em]">
          Opiniones sobre Fivo
        </Heading>
        <div className="hidden gap-2 sm:flex">
          <button type="button" className={arrow} onClick={() => go(-1)} disabled={atStart} aria-label="Opinión anterior">
            <ArrowLeft size={20} aria-hidden />
          </button>
          <button type="button" className={arrow} onClick={() => go(1)} disabled={atEnd} aria-label="Opinión siguiente">
            <ArrowRight size={20} aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={track}
        onScroll={paint}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Opiniones sobre Fivo"
        tabIndex={0}
        className="mt-5 grid auto-cols-[85%] grid-flow-col grid-rows-[auto_auto_auto] gap-x-4 snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-xl [scrollbar-width:none] sm:mt-6 sm:auto-cols-[calc((100%-16px)/2)] lg:auto-cols-[calc((100%-32px)/3)] [&::-webkit-scrollbar]:hidden"
      >
        {/* Las tarjetas comparten las filas del carrusel (subgrid): estrellas, texto y firma. Todas miden lo que la más alta,
            también las que están fuera de la vista (no cambian al desplazarse), y el nombre empieza a la misma altura en
            todas, a 20/24 px del texto más largo */}
        {REVIEWS.map((r, i) => (
          <figure
            key={r.name}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${REVIEWS.length}`}
            className="row-span-3 grid snap-start grid-rows-subgrid rounded-xl border border-line bg-surface p-5 sm:p-6"
          >
            <div className="flex gap-0.5" role="img" aria-label={`${r.stars} estrellas`}>
              {Array.from({ length: r.stars }, (_, k) => (
                <Star key={k} size={16} weight="fill" className="icon-brand" aria-hidden />
              ))}
            </div>
            <div className="mt-3 flex flex-col sm:mt-4">
              <blockquote className="text-[15px] leading-[1.6] text-fg">{r.text}</blockquote>
              {r.translated && <span className="mt-2 text-[13px] text-fg-muted">Traducido del inglés</span>}
            </div>
            <figcaption className="pt-5 sm:pt-6">
              <span className="block font-semibold text-fg">{r.name}</span>
              <span className="block text-[14px] text-fg-muted">{[r.place, r.sector].join(" · ")}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
