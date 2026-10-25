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
    _fbq?: unknown;
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

/**
 * Meta Pixel: solo estos eventos salen hacia Meta (el resto se queda en GA4). Sin datos personales: solo la posición del
 * botón, la landing y, en la calculadora, el sector y el tramo de tamaño del equipo.
 *   cta_click            → Contact (estándar), con `position`
 *   calculator_complete  → CalculatorComplete (personalizado)
 * Schedule (estándar) va aparte, con trackSchedule. PageView lo envía AnalyticsLoader al cargar el píxel.
 */
const PIXEL: Partial<Record<AnalyticsEvent, { event: string; custom?: boolean }>> = {
  cta_click: { event: "Contact" },
  calculator_complete: { event: "CalculatorComplete", custom: true },
};

function dispatch(name: AnalyticsEvent, params: Params, beacon = false) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });
  // Con beacon el envío sobrevive al cambio de página (GA4 usa sendBeacon; el píxel de Meta ya lo hace solo)
  window.gtag?.("event", name, beacon ? { ...params, transport_type: "beacon" } : params);
  const px = PIXEL[name];
  if (px) window.fbq?.(px.custom ? "trackCustom" : "track", px.event, params);
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

/* ---------- Schedule: la reserva hecha en meetz (llega a /gracias con su id en la URL) ---------- */

const SCHEDULE_KEY = "fivo-pixel-schedule";
let pendingSchedule: string | null = null;

function sentSchedules(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(SCHEDULE_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function sendSchedule(id: string) {
  const done = sentSchedules();
  if (done.includes(id)) return;
  // El píxel aún no está creado (en /gracias la reserva se lee antes de que lo cree AnalyticsLoader): se envía al crearlo
  if (!window.fbq) {
    pendingSchedule = id;
    return;
  }
  // eventID = id de la reserva: Meta descarta duplicados; el registro local evita reenviarlo al recargar
  window.fbq("track", "Schedule", { landing: currentLanding() }, { eventID: `schedule-${id}` });
  try {
    window.localStorage.setItem(SCHEDULE_KEY, JSON.stringify([...done, id].slice(-20)));
  } catch {
    /* sin almacenamiento: puede repetirse al recargar, Meta lo deduplica por eventID */
  }
}

/** Una reserva por id, nunca dos: si aún no hay consentimiento, espera a que se acepte (y se descarta si se rechaza). */
export function trackSchedule(reservaId: string) {
  if (typeof window === "undefined" || !reservaId) return;
  const consent = readConsent();
  if (consent === "granted") sendSchedule(reservaId);
  else if (consent === null) pendingSchedule = reservaId;
}

export function flushQueue() {
  while (queue.length) {
    const e = queue.shift()!;
    dispatch(e.name, e.params);
  }
  if (pendingSchedule && window.fbq) {
    const id = pendingSchedule;
    pendingSchedule = null;
    sendSchedule(id);
  }
}

export function clearQueue() {
  queue.length = 0;
  pendingSchedule = null;
}

/** Si el visitante retira el consentimiento tras haberlo dado, se detiene todo envío. */
export function revokeConsent() {
  clearQueue();
  window.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied" });
  window.fbq?.("consent", "revoke");
}
