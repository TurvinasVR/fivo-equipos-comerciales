import type { LandingContent } from "@/content/types";
import { rich } from "@/lib/rich";
import { CtaBlock } from "./CtaBlock";
import { ClientLogos } from "./ClientLogos";
import { MainVsl } from "./VideoPlayer";

/** Las cifras de escala en pequeño, bajo el botón (en lugar de los logotipos de clientes). */
function ScaleLine({ figures }: { figures: LandingContent["proof"]["scale"] }) {
  return (
    <ul
      className="mx-auto grid max-w-[360px] grid-cols-2 gap-x-4 gap-y-2 text-center text-[12px] leading-tight sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-x-8 sm:text-[13px]"
      aria-label="Fivo a escala"
    >
      {figures.map((s) => (
        <li key={s.figure}>
          <span className="sr-only">{s.sr}</span>
          <span aria-hidden>
            <strong className="block text-[15px] font-semibold text-fg sm:inline sm:text-[13px]">{s.figure}</strong>{" "}
            <span className="text-fg-muted">{s.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Primera pantalla (1440x900 y 390x844 sin scroll):
 * etiqueta, titular, subtítulo, vídeo, botón, prueba y línea de confianza.
 */
export function Hero({ content }: { content: LandingContent }) {
  const { hero, slug } = content;
  return (
    <section aria-labelledby="titular" className="relative overflow-hidden">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center px-5 pb-6 pt-1 text-center sm:pt-3 lg:pb-5">
        <p className="rounded-[6px] border border-line bg-surface px-3 py-1 text-[12px] font-medium text-fg-muted sm:text-[13px]">
          {rich(hero.label)}
        </p>

        <h1
          id="titular"
          className="mt-3 max-w-[1040px] font-display text-[clamp(1.5rem,1.1rem+2vw,2.75rem)] font-black leading-[1.1] tracking-[-0.015em] sm:mt-4"
        >
          {hero.title}
        </h1>

        <p className="mt-3 max-w-[760px] text-[15px] leading-[1.5] text-fg-muted sm:text-base">{hero.subtitle}</p>

        <div className="hero-video mt-4 w-full lg:mt-4">
          <MainVsl slug={slug} label={hero.videoLabel} endCta={hero.videoEnd} />
        </div>

        <div className="mt-4 w-full sm:w-auto lg:mt-4">
          <CtaBlock position="hero" size="xl" align="center" heroAnchor />
        </div>

        <div className="mt-5 w-full lg:mt-4">{hero.proof === "logos" ? <ClientLogos /> : <ScaleLine figures={content.proof.scale} />}</div>

        <p className="mt-3 max-w-[640px] text-[13px] leading-[1.5] text-fg-muted lg:mt-3">{hero.trust}</p>
      </div>
    </section>
  );
}
