import type { LandingContent } from "@/content/types";
import { rich } from "@/lib/rich";
import { ClientLogos } from "./ClientLogos";
import { ClientProfiles } from "./ClientProfiles";
import { CtaBlock } from "./CtaBlock";
import { MainVsl } from "./VideoPlayer";

/**
 * Primera pantalla (1440x900 y 390x844 sin scroll):
 * etiqueta, titular, subtítulo, vídeo, logotipos de clientes, botón y línea de confianza.
 */
export function Hero({ content }: { content: LandingContent }) {
  const { hero, slug } = content;
  return (
    <section aria-labelledby="titular" className="relative overflow-hidden">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center px-5 pb-5 pt-1 text-center sm:pt-3 lg:pb-8">
        <p className="rounded-[6px] border border-line bg-surface px-3 py-1 text-[12px] font-medium text-fg-muted sm:text-[13px]">
          {rich(hero.label)}
        </p>

        <h1
          id="titular"
          className="mt-3 max-w-[1040px] font-display text-[clamp(1.5rem,1.1rem+2vw,2.75rem)] font-black leading-[1.1] tracking-[-0.015em] sm:mt-4"
        >
          {/* Un solo h1: en móvil el titular corto y desde tableta el completo (el que no toca va con display:none) */}
          {hero.titleMobile ? (
            <>
              <span className="md:hidden">{hero.titleMobile}</span>
              <span className="max-md:hidden">{hero.title}</span>
            </>
          ) : (
            hero.title
          )}
        </h1>

        <p className="mt-3 max-w-[760px] text-[15px] leading-[1.5] text-fg-muted sm:text-base">
          {hero.subtitleMobile ? (
            <>
              <span className="md:hidden">{hero.subtitleMobile}</span>
              <span className="max-md:hidden">{hero.subtitle}</span>
            </>
          ) : (
            hero.subtitle
          )}
        </p>

        <div className="hero-video mt-4 w-full lg:mt-4">
          <MainVsl slug={slug} label={hero.videoLabel} endCta={hero.videoEnd} />
        </div>

        {/* Prueba social discreta bajo el vídeo: etiqueta pequeña y una fila de logotipos, sin caja */}
        <div className="mt-3 w-full lg:mt-3">
          <p className="mb-2 text-center text-[12px] font-medium text-fg-muted">Clientes de Fivo</p>
          <ClientLogos />
        </div>

        {/* Perfiles de Instagram de clientes (solo en la home: este hero no se usa en /gracias) */}
        <div className="mt-4 w-full lg:mt-4">
          <ClientProfiles />
        </div>

        <div className="mt-4 w-full sm:w-auto lg:mt-4">
          <CtaBlock position="hero" size="lg" align="center" heroAnchor />
        </div>

        {/* Línea de confianza: solo desde tableta (en móvil la primera pantalla termina en el botón) */}
        <p className="mt-3 max-w-[640px] text-[13px] leading-[1.5] text-fg-muted max-md:hidden lg:mt-3">{hero.trust}</p>
      </div>
    </section>
  );
}
