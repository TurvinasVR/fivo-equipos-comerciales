"use client";

import { siteConfig } from "@/config/site";
import { nextSlotLabel } from "@/lib/nextSlot";
import { CtaButton } from "./CtaButton";
import type { CtaPosition } from "./CtaButton";

/**
 * Línea de apoyo bajo cada botón principal. Con el calendario real conectado y el hueco encendido en la
 * configuración, muestra el próximo hueco libre; si no, lo que se puede esperar de la llamada.
 */
export function CtaHint({ short = false, className = "" }: { short?: boolean; className?: string }) {
  const slot = nextSlotLabel();
  const minutes = siteConfig.calendar.minutes;
  return (
    <p className={`cta-hint ${className}`}>
      {slot ? (
        <>
          Próximo hueco: <strong className="font-semibold text-fg">{slot}</strong>
        </>
      ) : short ? (
        <>
          <strong className="font-semibold text-fg">{minutes} minutos</strong>, sin compromiso
        </>
      ) : (
        <>
          <strong className="font-semibold text-fg">{minutes} minutos</strong>, por videollamada, sin compromiso
        </>
      )}
    </p>
  );
}

/** El botón principal con su línea de apoyo debajo. */
export function CtaBlock({
  position,
  size = "lg",
  align = "start",
  heroAnchor,
  blockCta,
  className = "",
}: {
  position: CtaPosition;
  size?: "xl" | "lg" | "md";
  align?: "start" | "center";
  heroAnchor?: boolean;
  blockCta?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2.5 max-sm:w-full max-sm:items-stretch max-sm:text-center ${align === "center" ? "items-center text-center" : "items-start"} ${className}`}>
      <CtaButton position={position} size={size} heroAnchor={heroAnchor} blockCta={blockCta} />
      <CtaHint />
    </div>
  );
}
