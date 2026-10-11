/** Destino de todos los botones "Agendar mi llamada". */
import { currentLanding } from "./analytics";

export const MEETZ_URL = "https://meetz.pro/fivo-ai";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** El enlace de meetz con los utm_ de la URL de la página (si los trae) y siempre ref=<landing>. */
export function meetzHref(search: string = typeof window === "undefined" ? "" : window.location.search): string {
  const from = new URLSearchParams(search);
  const to = new URLSearchParams();
  for (const k of UTM_KEYS) {
    const v = from.get(k);
    if (v) to.set(k, v);
  }
  to.set("ref", currentLanding());
  return `${MEETZ_URL}?${to.toString()}`;
}
