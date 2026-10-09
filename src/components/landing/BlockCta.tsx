"use client";

import type { CtaPosition } from "../CtaButton";
import { CtaBlock } from "../CtaBlock";
import { rich } from "@/lib/rich";
import { useLanding } from "./LandingContext";

/**
 * El cierre de un bloque: una frase corta que enlaza lo que se acaba de ver con la llamada y, debajo,
 * el botón "Agendar mi llamada" con su línea de apoyo. Solo existe en las landings que repiten el botón
 * (repeatCta). Sin caja ni franja: se alinea con el contenido del bloque. Lleva el degradado; si dos
 * coinciden en pantalla, el segundo pasa a secundario (CtaGradientKeeper).
 *
 * `visible` permite que aparezca más tarde (p. ej. al pasar a "Con Fivo"). Su sitio queda reservado, así
 * que la aparición no mueve nada.
 */
export function BlockCta({
  position,
  className = "mt-10",
  visible = true,
}: {
  position: CtaPosition;
  className?: string;
  visible?: boolean;
}) {
  const { repeatCta, ctaLines } = useLanding();
  if (!repeatCta) return null;
  const line = ctaLines?.[position];
  const center = true; // cada botón repetido va centrado con su frase, como un pequeño cierre del bloque
  return (
    <div
      className={className}
      data-block-cta-wrap={position}
      aria-hidden={visible ? undefined : true}
      inert={visible ? undefined : true}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(10px)",
        transition: "opacity 600ms var(--ease-out-expo), transform 600ms var(--ease-out-expo)",
        pointerEvents: visible ? undefined : "none",
      }}
    >
      <div className={`flex flex-col gap-4 ${center ? "mx-auto items-center text-center" : "items-start"}`}>
        {line && <p className="max-w-[560px] font-display text-xl font-bold leading-snug text-balance sm:text-2xl">{rich(line)}</p>}
        <CtaBlock position={position} align={center ? "center" : "start"} blockCta />
      </div>
    </div>
  );
}
