import { siteConfig } from "@/config/site";
import type { LandingContent } from "@/content/types";
import { CookiePrefsButton } from "./CookiePrefsButton";

/** Pie de página: aviso de resultados, copyright y enlaces legales. */
/** `plain`: sin el margen inferior que deja sitio al botón fijo de la landing (en /gracias no hay botón fijo). */
export function Footer({ content, plain = false }: { content: LandingContent; plain?: boolean }) {
  const { footer } = content;
  return (
    <footer className={`mt-12 lg:mt-20 ${plain ? "" : "pb-24 md:pb-0"}`}>
      <div className="mx-auto max-w-[1120px] border-t border-line px-5 py-6 text-sm text-fg-muted lg:px-10">
        {footer.disclaimer && <p className="mb-4 text-[13px] leading-snug text-fg-muted">{footer.disclaimer}</p>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </footer>
  );
}
