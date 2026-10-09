"use client";

import type { ReactNode } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";

/** Entrada suave al aparecer en pantalla. Contenido visible por defecto si falla el script. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const hidden = !seen && !reduced;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(14px)" : "none",
        transition: `opacity 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 600ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
