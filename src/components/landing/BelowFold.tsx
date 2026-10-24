"use client";

import { Proof } from "../Proof";
import { Faq } from "../Faq";
import { Footer } from "../Footer";
import { StickyCta } from "../StickyCta";
import { HowItWorks } from "../HowItWorks";
import { ProblemSection } from "../sections/ProblemSection";
import { AskSection } from "../sections/AskSection";
import Reviews from "../reviews/Reviews";
import { useLanding } from "./LandingContext";

/** Todo lo que hay debajo de la primera pantalla. */
export default function BelowFold() {
  const content = useLanding();
  return (
    <>
      <main className="relative z-[2] overflow-x-clip">
        <HowItWorks />
        <ProblemSection />
        <AskSection />
        <Proof />
        {/* Reseñas: justo antes de las preguntas frecuentes, con el mismo espaciado que el resto de secciones */}
        <div className="mx-auto max-w-[1120px] px-5 pb-5 pt-12 lg:px-10 lg:pb-8 lg:pt-20">
          <Reviews headingLevel={2} className="" />
        </div>
        <Faq />
      </main>
      <div className="relative z-[2]">
        <Footer content={content} />
      </div>
      <StickyCta />
    </>
  );
}
