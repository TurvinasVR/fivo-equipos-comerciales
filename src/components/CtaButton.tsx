"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { track } from "@/lib/analytics";
import { meetzHref } from "@/lib/meetz";

export const CTA_LABEL = "Agendar mi llamada";

/** Cada ubicación tiene su propio nombre, para saber qué botón convierte. */
export type CtaPosition =
  | "barra"
  | "hero"
  | "video_end"
  | "fijo-movil"
  | "gracias"
  | "herramientas"
  | "problema"
  | "como-funciona"
  | "pregunta"
  | "pregunta-enlace"
  | "prueba"
  | "faq";

type Props = {
  /** Posición del botón, se envía con cta_click. */
  position: CtaPosition;
  /** "xl" 56px (primera pantalla), "lg" y "md" 52px (resto), "sm" barra superior. */
  size?: "xl" | "lg" | "md" | "sm";
  /** Botón secundario (borde line, texto fg). El degradado va solo en el botón principal. */
  secondary?: boolean;
  full?: boolean;
  className?: string;
  /** Marca el botón del hero para el botón fijo móvil, la barra superior y el realce del vídeo. */
  heroAnchor?: boolean;
  /** Botón repetido al final de un bloque (el botón fijo de móvil se aparta mientras está a la vista). */
  blockCta?: boolean;
  /** Botón de la barra superior: gestiona su propio degradado. */
  topbar?: boolean;
  /** Etiqueta del botón (por defecto "Agendar mi llamada"). */
  label?: string;
};

/** La única acción de la página: abre la reserva en meetz (misma pestaña), con los utm_ de la URL si los trae. */
export function CtaButton({
  position,
  size = "lg",
  secondary,
  full,
  className = "",
  heroAnchor,
  blockCta,
  topbar,
  label = CTA_LABEL,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  // En el HTML va el enlace tal cual; con los utm_ de la URL se completa al cargar
  const [href, setHref] = useState(() => meetzHref("", false));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHref(meetzHref());
  }, []);

  // Brillo de entrada: una sola vez, la primera vez que el botón entra en pantalla (en CSS se anula con movimiento reducido)
  useEffect(() => {
    const el = ref.current;
    if (!el || secondary || size === "sm") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.setAttribute("data-sheen", "");
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [secondary, size]);

  // Realce único del resplandor cuando el vídeo llega a la llamada a la acción
  useEffect(() => {
    if (!heroAnchor) return;
    let off = 0;
    const pulse = () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      el.setAttribute("data-pulse", "");
      off = window.setTimeout(() => el.removeAttribute("data-pulse"), 1700);
    };
    window.addEventListener("fivo:video-cta", pulse, { once: true });
    return () => {
      window.removeEventListener("fivo:video-cta", pulse);
      window.clearTimeout(off);
    };
  }, [heroAnchor]);

  const sizeCls = size === "xl" ? "btn-cta--xl" : size === "lg" ? "btn-cta--lg" : size === "sm" ? "btn-cta--sm max-sm:px-4" : "";
  return (
    <a
      ref={ref}
      href={href}
      data-cta={position}
      data-hero-cta={heroAnchor ? "" : undefined}
      data-block-cta={blockCta ? "" : undefined}
      data-topbar={topbar ? "" : undefined}
      className={`${secondary ? `btn-ghost ${size === "sm" ? "max-sm:px-3.5" : ""}` : `btn-cta ${sizeCls}`} ${full ? "w-full" : ""} ${className}`}
      onClick={() => {
        // La página cambia al pulsar: el evento sale por sendBeacon
        // el enlace con el código real, por si el clic llega antes que el efecto que lo completa
        if (ref.current) ref.current.href = meetzHref();
        track("cta_click", { position }, { beacon: true });
      }}
    >
      {label}
      <span className="cta-arrow" data-dir="right" aria-hidden>
        <ArrowRight size={size === "sm" ? 16 : 18} weight="bold" />
      </span>
    </a>
  );
}
