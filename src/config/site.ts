/**
 * Único archivo de configuración de todo lo que depende de servicios externos.
 * Mientras un valor esté vacío, la página funciona con sustitutos marcados.
 * El texto de cada landing está en src/content; las opciones del formulario y la regla
 * de cualificación, en src/config/qualification.ts.
 */

import type { LandingSlug } from "@/content/types";

export type CalendarProvider = "mock" | "calendly" | "cal";

/** Lo que cambia de una landing a otra: vídeos y contenido real disponible. */
type LandingRuntime = {
  video: {
    /** URL del vídeo (mp4/webm). Vacío = vídeo de sustitución. */
    src: string;
    /** Miniatura. Vacío = miniatura de sustitución. */
    poster: string;
    /** Subtítulos WebVTT en español. Vacío = subtítulos de sustitución. */
    captions: string;
    /**
     * Segundo del vídeo en el que empieza la llamada a la acción. Al llegar a él
     * la reproducción dispara video_cta_reached (una sola vez). null = no se envía.
     * Valor provisional para el vídeo de sustitución de 20 s: poner el real.
     */
    ctaSecond: number | null;
  };
  /** Vídeo de 60 segundos de la página de gracias. Vacío = hueco marcado. */
  thanksVideo: { src: string; poster: string };
  /**
   * Contenido real disponible. Mientras sea false, el bloque se ve con un
   * marcador solo en desarrollo y se oculta en producción (ver PENDIENTES.md).
   */
  ready: { video: boolean; testimonials: boolean; thanksVideo: boolean };
};

/**
 * Valores que cambian de un despliegue a otro (cada landing en IONOS Deploy Now). Se leen de variables
 * de entorno NEXT_PUBLIC_* en el momento de compilar: un sitio estático no tiene servidor, así que se
 * quedan escritas en el JavaScript. Vacías = valor de sustitución marcado (ver PENDIENTES.md).
 * Importante: cada variable se escribe entera (process.env.NEXT_PUBLIC_X) para que Next la sustituya.
 */
const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "",
  videoUrl: process.env.NEXT_PUBLIC_VIDEO_URL?.trim() || "",
  videoPoster: process.env.NEXT_PUBLIC_VIDEO_POSTER_URL?.trim() || "",
  videoCaptions: process.env.NEXT_PUBLIC_VIDEO_CAPTIONS_URL?.trim() || "",
  videoCtaSecond: process.env.NEXT_PUBLIC_VIDEO_CTA_SECOND?.trim() || "",
  thanksVideoUrl: process.env.NEXT_PUBLIC_THANKS_VIDEO_URL?.trim() || "",
  thanksVideoPoster: process.env.NEXT_PUBLIC_THANKS_VIDEO_POSTER_URL?.trim() || "",
  webhook: process.env.NEXT_PUBLIC_FORM_WEBHOOK_URL?.trim() || "",
  calendarProvider: process.env.NEXT_PUBLIC_CALENDAR_PROVIDER?.trim() || "",
  calendarUrl: process.env.NEXT_PUBLIC_CALENDAR_URL?.trim() || "",
  ga4: process.env.NEXT_PUBLIC_GA4_ID?.trim() || "",
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
};

/** Vídeo, miniatura y subtítulos de cada landing: URLs externas (nada de vídeo en el repositorio). */
const landingRuntime = (): LandingRuntime => ({
  video: {
    src: env.videoUrl,
    poster: env.videoPoster,
    captions: env.videoCaptions,
    ctaSecond: env.videoCtaSecond === "" ? 10 : env.videoCtaSecond === "none" ? null : Number(env.videoCtaSecond) || 10,
  },
  thanksVideo: { src: env.thanksVideoUrl, poster: env.thanksVideoPoster },
  ready: { video: Boolean(env.videoUrl), testimonials: false, thanksVideo: Boolean(env.thanksVideoUrl) },
});

export const siteConfig = {
  /** URL pública de las landings (para metadatos y OG). NEXT_PUBLIC_SITE_URL, p. ej. https://equiposcomerciales.fivo.info */
  siteUrl: env.siteUrl || "https://equiposcomerciales.fivo.info",

  landings: {
    "equipos-comerciales": landingRuntime(),
  } as Record<LandingSlug, LandingRuntime>,

  calendar: {
    /** "calendly" | "cal" | "mock". Con url vacía se usa siempre "mock". */
    provider: (env.calendarProvider || "calendly") as CalendarProvider,
    /** URL de reserva incrustable (Calendly o Cal.com). */
    url: env.calendarUrl,
    /** Duración en minutos (también para el .ics). */
    minutes: 30,
    /**
     * Próximo hueco libre en la línea bajo los botones ("Próximo hueco: mañana a las 10:00").
     * APAGADO hasta conectar el calendario real: no hay horarios inventados. Al conectarlo, poner
     * enabled en true y rellenar startsAtIso (ISO 8601) con el primer hueco que devuelva el proveedor
     * (src/lib/nextSlot.ts lo formatea). Con enabled en false o sin fecha, la línea no cambia.
     */
    nextSlot: { enabled: false, startsAtIso: "" },
  },

  /** Webhook que recibe el formulario (POST JSON). Vacío = envío simulado. */
  formWebhookUrl: env.webhook,

  /** Email del enlace "Escríbenos". Vacío = enlace oculto en producción. */
  contactEmail: env.contactEmail,

  /** Destino del botón "Empieza gratis" (quien no cumple la regla de cualificación). */
  freeSignupUrl: "https://fivo.ai",

  analytics: {
    ga4Id: env.ga4, // p. ej. G-XXXXXXXXXX
    metaPixelId: env.metaPixel,
  },

  legal: {
    aviso: "/legal/aviso-legal",
    privacidad: "/legal/privacidad",
    cookies: "/legal/cookies",
  },

  ready: {
    legal: false,
  },
};

export const calendarIsMock = !siteConfig.calendar.url || siteConfig.calendar.provider === "mock";
