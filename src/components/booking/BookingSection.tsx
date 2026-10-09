"use client";

import BookingBlock from "./BookingBlock";
import { useEffect } from "react";
import { trackOnce } from "@/lib/analytics";
import { useInView } from "@/lib/hooks";
import { GraphMark } from "../scene/GraphMark";

/**
 * Bloque 9. El contenedor (id "agendar") está siempre; el formulario se monta al acercarse
 * o poco después de la carga, para que un salto desde cualquier botón nunca encuentre un hueco.
 */
export function BookingSection() {
  const [ref, seen] = useInView<HTMLElement>({ threshold: 0.25 });
  useEffect(() => {
    // form_view: el bloque del formulario ha entrado en pantalla
    if (seen) trackOnce("form_view");
  }, [seen]);

  return (
    <section id="agendar" ref={ref} aria-labelledby="agendar-titulo" className="relative scroll-mt-4 overflow-hidden border-t border-line bg-black">
      <GraphMark className="opacity-[0.07]" />
      <div className="relative">
        <BookingBlock />
      </div>
    </section>
  );
}
