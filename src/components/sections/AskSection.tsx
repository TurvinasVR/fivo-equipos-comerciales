"use client";

import AskDemo from "./AskDemo";
import { useLanding } from "../landing/LandingContext";
import { BlockCta } from "../landing/BlockCta";

/** Bloque 6. Demo interactiva: una ventana de chat y tres preguntas seleccionables. */
export function AskSection() {
  const { ask } = useLanding();
  return (
    <section aria-labelledby="preguntale" className="bg-bg">
      <div className="mx-auto max-w-[1120px] px-5 pb-5 pt-12 lg:px-10 lg:pb-8 lg:pt-20">
        <h2 id="preguntale" className="font-display text-3xl font-black tracking-[-0.015em] sm:text-4xl">
          {ask.title}
        </h2>
        <AskDemo />
        <BlockCta position="pregunta" />
      </div>
    </section>
  );
}
