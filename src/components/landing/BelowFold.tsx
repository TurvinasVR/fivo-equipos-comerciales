"use client";

import { Proof } from "../Proof";
import { BookingSection } from "../booking/BookingSection";
import { Faq } from "../Faq";
import { Closing } from "../Closing";
import { StickyCta } from "../StickyCta";
import { HowItWorks } from "../HowItWorks";
import { ToolsScene } from "../scene/ToolsScene";
import { ProblemSection } from "../sections/ProblemSection";
import { AskSection } from "../sections/AskSection";
import { WhoSection } from "../sections/WhoSection";
import { AgendaSection } from "../sections/AgendaSection";
import { CtaGradientKeeper } from "./CtaGradientKeeper";
import { useLanding } from "./LandingContext";

/** Todo lo que hay debajo de la primera pantalla. */
export default function BelowFold() {
  const content = useLanding();
  return (
    <>
      <main className="relative z-[2] overflow-x-clip">
        <ToolsScene />
        <ProblemSection />
        <HowItWorks />
        <AskSection />
        {content.who && <WhoSection who={content.who} />}
        <Proof />
        <AgendaSection />
        <BookingSection />
        <Faq />
      </main>
      <div className="relative z-[2]">
        <Closing content={content} />
      </div>
      <StickyCta hideNearBlockCtas={content.repeatCta} />
      {content.repeatCta && <CtaGradientKeeper />}
    </>
  );
}
