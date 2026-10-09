import { readConsent } from "./consent";

/** Nombres estables. El evento de conversión principal es call_booked. */
export type AnalyticsEvent =
  | "video_play"
  | "video_50"
  | "video_cta_reached"
  | "video_end_cta_view"
  | "cta_click"
  | "form_start"
  | "form_view"
  | "form_submit"
  | "call_booked";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __trackLog?: { name: string; params: Params }[];
  }
}

/**
 * Landing de la que sale cada evento (parámetro `landing`), para comparar las páginas entre sí. Este repositorio
 * publica solo equipos-comerciales.
 */
export type Landing = "equipos-comerciales";
export function currentLanding(): Landing {
  return "equipos-comerciales";
}

const queue: { name: AnalyticsEvent; params: Params }[] = [];
const onceFired = new Set<string>();

// Equivalentes estándar en Meta. call_booked es la conversión principal.
const META_STANDARD: Partial<Record<AnalyticsEvent, string>> = {
  form_submit: "Lead",
  call_booked: "Schedule",
};

function dispatch(name: AnalyticsEvent, params: Params) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });
  window.gtag?.("event", name, params);
  const std = META_STANDARD[name];
  if (std) window.fbq?.("track", std, params);
  window.fbq?.("trackCustom", name, params);
}

export function track(name: AnalyticsEvent, extra: Params = {}) {
  if (typeof window === "undefined") return;
  // Todos los eventos llevan el parámetro landing
  const params: Params = { ...extra, landing: currentLanding() };
  if (process.env.NODE_ENV !== "production") {
    window.__trackLog = window.__trackLog ?? [];
    window.__trackLog.push({ name, params });
    console.debug("[analytics]", name, params);
  }
  const consent = readConsent();
  if (consent === "granted") dispatch(name, params);
  else if (consent === null && queue.length < 50) queue.push({ name, params });
}

/** Evento que solo se envía una vez por visita (video_play, video_50...). */
export function trackOnce(name: AnalyticsEvent, params: Params = {}) {
  if (onceFired.has(name)) return;
  onceFired.add(name);
  track(name, params);
}

export function flushQueue() {
  while (queue.length) {
    const e = queue.shift()!;
    dispatch(e.name, e.params);
  }
}

export function clearQueue() {
  queue.length = 0;
}

/** Si el visitante retira el consentimiento tras haberlo dado, se detiene todo envío. */
export function revokeConsent() {
  clearQueue();
  window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied" });
  window.fbq?.("consent", "revoke");
}
