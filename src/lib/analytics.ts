import { readConsent } from "./consent";

/** Nombres estables. El evento principal es cta_click (position) hacia meetz. */
export type AnalyticsEvent =
  | "video_play"
  | "video_50"
  | "video_cta_reached"
  | "video_end_cta_view"
  | "cta_click"
  | "calculator_start"
  | "calculator_complete"
  | "calculator_pdf"
  | "calculator_report_sent"
  | "calendar_add";

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

function dispatch(name: AnalyticsEvent, params: Params, beacon = false) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });
  // Con beacon el envío sobrevive al cambio de página (GA4 usa sendBeacon; el píxel de Meta ya lo hace solo)
  window.gtag?.("event", name, beacon ? { ...params, transport_type: "beacon" } : params);
  window.fbq?.("trackCustom", name, params);
}

/** `beacon: true` para los eventos que se envían justo al cambiar de página (cta_click). */
export function track(name: AnalyticsEvent, extra: Params = {}, opts: { beacon?: boolean } = {}) {
  if (typeof window === "undefined") return;
  // Todos los eventos llevan el parámetro landing
  const params: Params = { ...extra, landing: currentLanding() };
  if (process.env.NODE_ENV !== "production") {
    window.__trackLog = window.__trackLog ?? [];
    window.__trackLog.push({ name, params });
    console.debug("[analytics]", name, params);
  }
  const consent = readConsent();
  if (consent === "granted") dispatch(name, params, opts.beacon);
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
