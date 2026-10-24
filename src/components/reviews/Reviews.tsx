"use client";

import { useRef } from "react";
import { Star } from "@phosphor-icons/react";
import { REVIEWS, type Review } from "./reviewsData";

/**
 * Opiniones sobre Fivo (una sola fuente: reviewsData.ts). Se usan en la home y bajo el resultado de /gracias.
 * Cinta que avanza sola hacia la izquierda en bucle: la lista va dos veces y la pista se desplaza media pista con
 * translate3d (solo CSS, ver .reviews-track en globals.css), así que el reinicio no se nota. Se pausa con el ratón encima
 * o al mantener pulsado. La copia lleva aria-hidden: el lector de pantalla lee cada opinión una vez. Con movimiento
 * reducido no se mueve: es una fila que se desliza con el dedo o el trackpad.
 *
 * Todas las tarjetas miden lo mismo: ancho fijo y la altura de la más larga (la fila estira a todas); el nombre va
 * abajo, a la misma distancia del borde que las estrellas arriba, y nunca a menos de 16 px del texto.
 */
function Card({ r }: { r: Review }) {
  return (
    <figure className="flex h-full w-[300px] flex-col rounded-xl border border-line bg-surface p-5 sm:w-[320px] lg:w-[340px] lg:p-6">
      <div className="flex gap-0.5" role="img" aria-label={`${r.stars} estrellas`}>
        {Array.from({ length: r.stars }, (_, k) => (
          <Star key={k} size={16} weight="fill" className="icon-brand" aria-hidden />
        ))}
      </div>
      <blockquote className="mt-3 text-[15px] leading-[1.55] text-fg">{r.text}</blockquote>
      <figcaption className="mt-auto pt-4 font-semibold text-fg">{r.name}</figcaption>
    </figure>
  );
}

export default function Reviews({ headingLevel = 3, className = "mt-14 lg:mt-20" }: { headingLevel?: 2 | 3; className?: string }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const strip = useRef<HTMLDivElement>(null);
  // Mantener pulsado (dedo) pausa la cinta; el ratón encima la pausa por CSS (:hover). Solo eventos, nada por fotograma
  const hold = (on: boolean) => strip.current?.toggleAttribute("data-held", on);

  return (
    <section aria-labelledby="opiniones" className={className}>
      <Heading id="opiniones" className="font-display text-[clamp(1.375rem,1rem+1.4vw,1.875rem)] font-black leading-tight tracking-[-0.015em]">
        Opiniones sobre Fivo
      </Heading>

      <div
        ref={strip}
        className="reviews-marquee mt-5 overflow-hidden sm:mt-6"
        onPointerDown={(e) => e.pointerType !== "mouse" && hold(true)}
        onPointerUp={() => hold(false)}
        onPointerCancel={() => hold(false)}
        onPointerLeave={() => hold(false)}
        onContextMenu={(e) => (e.nativeEvent as PointerEvent).pointerType !== "mouse" && e.preventDefault()}
      >
        <div className="reviews-track flex w-max items-stretch">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-label={copy === 0 ? "Opiniones sobre Fivo" : undefined}
              aria-hidden={copy === 1 ? true : undefined}
              className={`flex shrink-0 items-stretch gap-4 pr-4 ${copy === 1 ? "motion-reduce:hidden" : ""}`}
            >
              {REVIEWS.map((r, i) => (
                <li key={`${r.name}-${i}`} className="flex snap-start">
                  <Card r={r} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
