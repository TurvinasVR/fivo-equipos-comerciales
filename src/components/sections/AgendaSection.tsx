"use client";

import Agenda from "./Agenda";
import { useLanding } from "../landing/LandingContext";
import { BlockCta } from "../landing/BlockCta";

/** Bloque 8. Qué pasa en los 30 minutos. */
export function AgendaSection() {
  const { agenda } = useLanding();
  return (
    <section aria-labelledby="treinta" className="bg-bg">
      <div className="mx-auto max-w-[1120px] px-5 section-pad lg:px-10">
        <h2 id="treinta" className="font-display text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-black leading-[1.1] tracking-[-0.015em]">
          {agenda.title}
        </h2>
        <Agenda />
        <BlockCta position="llamada" />
      </div>
    </section>
  );
}
