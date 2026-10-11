/** Destino de todos los botones "Agendar mi llamada". */
import { currentLanding } from "./analytics";
import { visitorCode } from "./visitor";

export const MEETZ_URL = "https://meetz.pro/fivo-ai";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/**
 * El enlace de meetz con los utm_ de la URL de la página (si los trae) y siempre ref=<landing>.<código de visitante>.
 * Con `withCode: false` (HTML del servidor y primer pintado) lleva solo ref=<landing>; el navegador lo completa al cargar.
 */
export function meetzHref(search: string = typeof window === "undefined" ? "" : window.location.search, withCode = true): string {
  const from = new URLSearchParams(search);
  const to = new URLSearchParams();
  for (const k of UTM_KEYS) {
    const v = from.get(k);
    if (v) to.set(k, v);
  }
  const code = withCode ? visitorCode() : "";
  to.set("ref", code ? `${currentLanding()}.${code}` : currentLanding());
  return `${MEETZ_URL}?${to.toString()}`;
}
