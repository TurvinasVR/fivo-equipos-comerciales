"use client";

import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { track } from "@/lib/analytics";

export const CTA_LABEL = "Agendar mi llamada";
/** Texto del botón de enviar del formulario: describe el paso siguiente. */
export const SUBMIT_LABEL = "Elegir día y hora";

/** Cada ubicación tiene su propio nombre, para saber qué botón convierte. */
export type CtaPosition =
  | "barra"
  | "hero"
  | "video_end"
  | "llamada"
  | "cierre"
  | "fijo-movil"
  | "gracias"
  | "herramientas"
  | "problema"
  | "como-funciona"
  | "pregunta"
  | "pregunta-enlace"
  | "para-quien"
  | "prueba"
  | "faq";

type Props = {
  /** Posición del botón, se envía con cta_click. */
  position: CtaPosition;
  /** "xl" 56px (primera pantalla y cierre), "lg" y "md" 52px (resto), "sm" barra superior. */
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

/**
 * Pone el foco en el formulario una vez hecho el salto: en el primer campo (teclado y lector de pantalla
 * llegan directos a rellenar); en pantallas táctiles, en el título, para no abrir el teclado del móvil
 * encima del formulario. El formulario puede estar aún montándose: se reintenta unos instantes.
 */
export function focusBooking() {
  let tries = 0;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const go = () => {
    const field = document.getElementById("nombre");
    const usable = field && !field.closest("[inert], [hidden]");
    const target = coarse || !usable ? document.getElementById("agendar-titulo") : field;
    if (target) target.focus({ preventScroll: true });
    else if (tries++ < 12) window.setTimeout(go, 150);
  };
  window.setTimeout(go, 500);
}

/** La única acción de la página: baja al bloque del formulario. */
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
  // El formulario queda por encima de las preguntas frecuentes y del cierre: ahí el botón sube
  const up = position === "faq" || position === "cierre";
  const Arrow = up ? ArrowUp : ArrowDown;

  return (
    <a
      ref={ref}
      href="#agendar"
      data-cta={position}
      data-hero-cta={heroAnchor ? "" : undefined}
      data-block-cta={blockCta ? "" : undefined}
      data-topbar={topbar ? "" : undefined}
      className={`${secondary ? `btn-ghost ${size === "sm" ? "max-sm:px-3.5" : ""}` : `btn-cta ${sizeCls}`} ${full ? "w-full" : ""} ${className}`}
      onClick={() => {
        track("cta_click", { position });
        focusBooking();
      }}
    >
      {label}
      <span className="cta-arrow" data-dir={up ? "up" : "down"} aria-hidden>
        <Arrow size={size === "sm" ? 16 : 18} weight="bold" />
      </span>
    </a>
  );
}
