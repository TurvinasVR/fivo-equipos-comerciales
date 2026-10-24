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
        {/* Reseñas: lo primero tras la primera pantalla. Van en el HTML; no llevan imágenes ni librerías */}
        <div className="mx-auto max-w-[1120px] px-5 pb-5 pt-5 lg:px-10 lg:pb-8 lg:pt-[25px]">
          <Reviews headingLevel={2} className="" />
        </div>
        <HowItWorks />
        <ProblemSection />
        <AskSection />
        <Proof />
        <Faq />
      </main>
      <div className="relative z-[2]">
        <Footer content={content} />
      </div>
      <StickyCta />
    </>
  );
}
