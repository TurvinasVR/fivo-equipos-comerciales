import { HeroBackdrop } from "../scene/HeroBackdrop";
import { ThanksContent } from "../ThanksContent";
import type { LandingContent } from "@/content/types";

/** Página de gracias de una landing (la misma estructura para todas; el texto sale de su contenido). */
export function ThanksPage({ content }: { content: LandingContent }) {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <HeroBackdrop lite />
      <header className="relative z-[2]">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center px-5 lg:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/fivo-wordmark-white.svg" alt="Fivo" width={103} height={33} className="h-[30px] w-auto" />
        </div>
      </header>
      <ThanksContent content={content} />
    </div>
  );
}
