"use client";

import { useEffect } from "react";

/**
 * Activa el degradado de marca en los iconos (.icon-brand) una vez cargada la página. Hasta entonces llevan el acento liso
 * (están bajo la primera pantalla): rellenar medio centenar de iconos con un degradado SVG durante la primera pintura
 * retrasaba el LCP en móvil.
 */
export function BrandIcons() {
  useEffect(() => {
    const on = () => window.setTimeout(() => document.documentElement.setAttribute("data-brand-icons", ""), 1500);
    if (document.readyState === "complete") on();
    else {
      window.addEventListener("load", on, { once: true });
      return () => window.removeEventListener("load", on);
    }
  }, []);
  return null;
}
