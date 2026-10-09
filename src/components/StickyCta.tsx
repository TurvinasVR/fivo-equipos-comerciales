"use client";

import { useEffect, useState } from "react";
import { shown, watchCtas } from "@/lib/ctaFlow";
import { CtaButton } from "./CtaButton";
import { CtaHint } from "./CtaBlock";

/**
 * Botón fijo inferior solo en móvil. Se oculta mientras el botón del hero
 * o el bloque del formulario están a la vista (o el botón de un bloque), y mientras hay aviso de cookies.
 */
export function StickyCta({ hideNearBlockCtas = false }: { hideNearBlockCtas?: boolean }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero-cta]");
    const form = document.getElementById("agendar");
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const o = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0 });
      o.observe(hero);
      observers.push(o);
    }
    if (form) {
      const o = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.05 });
      o.observe(form);
      observers.push(o);
    }
    // Landings con el botón repetido al final de cada bloque: el fijo se aparta para no duplicar el degradado
    // (los botones de los bloques diferidos se montan más tarde, por eso se vigila el scroll)
    const stop = hideNearBlockCtas
      ? watchCtas(() => setBlockVisible([...document.querySelectorAll("[data-block-cta]")].some((el) => shown(el))))
      : undefined;
    return () => {
      observers.forEach((o) => o.disconnect());
      stop?.();
    };
  }, [hideNearBlockCtas]);

  const hidden = heroVisible || formVisible || blockVisible;

  return (
    <div
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
