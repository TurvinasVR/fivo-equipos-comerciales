import { siteConfig } from "@/config/site";
import type { LandingContent } from "@/content/types";
import { CtaBlock } from "./CtaBlock";
import { GraphMark } from "./scene/GraphMark";
import { CookiePrefsButton } from "./CookiePrefsButton";

/** Bloque 11. Cierre sobre el fondo del sistema, con un resplandor de acento, y pie mínimo. */
export function Closing({ content }: { content: LandingContent }) {
  const { closing } = content;
  return (
    <>
      <section
        aria-labelledby="cierre"
        className="relative overflow-hidden border-t border-line"
        style={{ backgroundImage: "radial-gradient(ellipse 70% 70% at 50% 110%, var(--color-accent-soft), transparent 70%)" }}
      >
        <GraphMark className="opacity-[0.1]" />
        <div className="relative mx-auto flex max-w-[900px] flex-col items-center px-5 pb-16 pt-14 text-center lg:px-10 lg:pb-28 lg:pt-24">
          <h2
            id="cierre"
            className="font-display text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] font-black leading-[1.1] tracking-[-0.015em]"
          >
            {closing.title}
          </h2>
          <div className="mt-8 max-sm:w-full">
            <CtaBlock position="cierre" size="xl" align="center" blockCta={content.repeatCta} />
          </div>
          {closing.disclaimer && <p className="mt-6 max-w-[520px] text-[13px] leading-snug text-fg-muted">{closing.disclaimer}</p>}
        </div>
      </section>

      <footer className="pb-24 md:pb-0">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-3 border-t border-line px-5 py-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>Copyright 2026 Fivo AI. Todos los derechos reservados.</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <a href={siteConfig.legal.aviso} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center underline hover:text-fg">
                  Aviso legal
                </a>
              </li>
              <li>
                <a href={siteConfig.legal.privacidad} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center underline hover:text-fg">
                  Política de privacidad
                </a>
              </li>
              <li>
                <CookiePrefsButton />
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}
