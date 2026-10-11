"use client";

import ProblemScene from "./ProblemScene";
import { useLanding } from "../landing/LandingContext";
import { BlockCta } from "../landing/BlockCta";

/** Bloque 4. El problema: los mismos nodos, pero sueltos. Cada dolor resalta un grupo aislado. */
export function ProblemSection() {
  const { problem } = useLanding();
  return (
    <section aria-labelledby="problema" className="bg-bg">
      <div className="mx-auto max-w-[1120px] px-5 pb-5 pt-12 lg:px-10 lg:pb-8 lg:pt-20">
        <h2 id="problema" className="max-w-[820px] font-display text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-black leading-[1.1] tracking-[-0.015em]">
          {problem.title.muted && <span className="text-fg-muted">{problem.title.muted}</span>}
          {problem.title.main}
        </h2>
        <div className="mt-8 lg:mt-10">
          <ProblemScene />
        </div>
        {/* El botón del bloque está desde el primer momento: nunca un hueco reservado y vacío */}
        <BlockCta position="problema" />
      </div>
    </section>
  );
}
