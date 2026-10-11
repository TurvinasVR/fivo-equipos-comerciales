"use client";

import { useEffect, useRef } from "react";
import { currentLanding, track } from "@/lib/analytics";
import { readBooking } from "@/lib/booking";
import { CALCULATOR_HTML } from "./markup";
import "./calculator.css";

/**
 * Calculadora de ahorro (copia de calculadora.fivo.info). El marcado viaja en el HTML inicial, así que no hay hueco ni
 * salto; el motor se carga aparte, en reposo, para no competir con lo de arriba. Sin iframe y sin cargar la web original.
 */
const callFmt = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

export function Calculator({ disclaimer }: { disclaimer: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let started = false;
    let cancelled = false;

    const start = async () => {
      if (started) return;
      started = true;
      const { initCalculator } = await import("./engine");
      if (cancelled) return;
      destroy = initCalculator(root, {
        track: (name, params) => track(name, params),
        source: `gracias-${currentLanding()}`,
        disclaimer,
        callWhen: () => {
          const b = readBooking();
          return b ? callFmt.format(b.startsAt) : null;
        },
      });
    };

    // El motor se carga cuando el navegador está libre o al primer toque
    const hasIdle = typeof window.requestIdleCallback === "function";
    let idle: number | undefined;
    if (hasIdle) idle = window.requestIdleCallback(() => void start(), { timeout: 4000 });
    else idle = window.setTimeout(() => void start(), 2000);
    root.addEventListener("pointerdown", start, { once: true });
    root.addEventListener("focusin", start, { once: true });

    return () => {
      cancelled = true;
      if (idle !== undefined) {
        if (hasIdle) window.cancelIdleCallback(idle);
        else window.clearTimeout(idle);
      }
      root.removeEventListener("pointerdown", start);
      root.removeEventListener("focusin", start);
      destroy?.();
      // Deja el marcado como llegó del servidor por si el efecto vuelve a ejecutarse (modo estricto en desarrollo)
      if (started) {
        root.innerHTML = CALCULATOR_HTML;
        root.className = "calc";
      }
    };
  }, [disclaimer]);

  return <div ref={ref} className="calc" dangerouslySetInnerHTML={{ __html: CALCULATOR_HTML }} />;
}
