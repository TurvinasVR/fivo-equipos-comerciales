"use client";

import { useEffect, useRef, useState } from "react";
import { CtaButton } from "./CtaButton";
import { CtaHint } from "./CtaBlock";

/**
 * Botón fijo inferior solo en móvil. Aparece en cuanto el vídeo del hero queda atrás (por encima de la pantalla) y
 * ya no se va hasta el final de la página; solo se esconde si se vuelve arriba, al vídeo, o mientras hay aviso de
 * cookies (globals.css). Publica su alto en --sticky-cta-h para que el body reserve ese hueco abajo y nunca tape
 * contenido (también el pie y las preguntas frecuentes); el alto incluye el área segura del iPhone.
 */
export function StickyCta() {
  const [hidden, setHidden] = useState(true);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = document.querySelector("[data-video-shell]");
    if (!video) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHidden(false);
      return;
    }
    // Oculto mientras el vídeo se ve o está por debajo; visible cuando ya se ha pasado
    const o = new IntersectionObserver(([e]) => setHidden(e.isIntersecting || e.boundingClientRect.top > 0), { threshold: 0 });
    o.observe(video);
    return () => o.disconnect();
  }, []);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty("--sticky-cta-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--sticky-cta-h");
    };
  }, []);

  return (
    <div
      ref={bar}
      className="sticky-cta fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg/95 px-4 pt-2.5 backdrop-blur-sm transition-transform duration-300 md:hidden"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        transform: hidden ? "translateY(125%)" : "none",
      }}
      aria-hidden={hidden}
      inert={hidden ? true : undefined}
    >
      <div className="flex flex-col items-center gap-1.5">
        <CtaButton position="fijo-movil" size="lg" full />
        <CtaHint short className="text-[12px]" />
      </div>
    </div>
  );
}
