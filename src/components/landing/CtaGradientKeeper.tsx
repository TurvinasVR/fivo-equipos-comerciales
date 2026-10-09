"use client";

import { useEffect } from "react";
import { shown as isShown, watchCtas } from "@/lib/ctaFlow";

/**
 * El degradado de marca va en un solo botón por pantalla visible. Con el botón repetido en cada bloque,
 * dos pueden coincidir en pantalla (la barra superior se gestiona sola, ver TopBar): el primero (arriba) conserva el degradado y el resto pasa a estilo
 * secundario (data-demoted) hasta que el primero sale de la pantalla.
 */
export function CtaGradientKeeper() {
  useEffect(
    () =>
      watchCtas(() => {
        let owner: Element | null = null;
        document.querySelectorAll(".btn-cta:not([data-topbar])").forEach((el) => {
          const shown = isShown(el);
          if (shown && !owner) {
            owner = el;
            el.removeAttribute("data-demoted");
          } else if (shown) {
            el.setAttribute("data-demoted", "");
          } else {
            el.removeAttribute("data-demoted");
          }
        });
      }),
    [],
  );
  return null;
}
