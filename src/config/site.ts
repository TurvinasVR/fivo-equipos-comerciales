/**
 * Único archivo de configuración de todo lo que depende de servicios externos.
 * Mientras un valor esté vacío, la página funciona con sustitutos marcados.
 * El texto de cada landing está en src/content.
 */

import type { LandingSlug } from "@/content/types";

/** Lo que cambia de una landing a otra: vídeos y contenido real disponible. */
type LandingRuntime = {
  video: {
    /** URL del vídeo (mp4/webm). Vacío = vídeo de sustitución. */
    src: string;
    /** Versión ligera para móvil (ver MOBILE_VIDEO_MEDIA en VideoPlayer). Vacío = la misma que src. */
    mobileSrc: string;
    /** Miniatura. Vacío = miniatura de sustitución. */
    poster: string;
    /**
     * Segundo del vídeo en el que empieza la llamada a la acción. Al llegar a él
     * la reproducción dispara video_cta_reached (una sola vez). null = no se envía.
     * Pendiente del segundo real del VSL: mientras no llegue, null.
     */
    ctaSecond: number | null;
  };
  /**
   * Contenido real disponible. Mientras sea false, el bloque se ve con un
   * marcador solo en desarrollo y se oculta en producción (ver PENDIENTES.md).
   */
  ready: { video: boolean; testimonials: boolean };
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
  videoCtaSecond: process.env.NEXT_PUBLIC_VIDEO_CTA_SECOND?.trim() || "",
  ga4: process.env.NEXT_PUBLIC_GA4_ID?.trim() || "",
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "",
};

/**
 * VSL oficial (vsl-01), comprimido desde el original con x264 (high, yuv420p, AAC 128k, faststart) en public/video:
 * escritorio 1080p CRF 26 (56 MB) y móvil 720p CRF 29 (19 MB). Póster en public/img.
 * Las variables NEXT_PUBLIC_VIDEO_* siguen mandando si se rellenan (p. ej. para servirlo desde fuera); con una URL
 * propia no se usa la versión móvil local, que sería de otro vídeo.
 */
const VSL = { src: "/video/vsl-01.mp4", mobileSrc: "/video/vsl-01-720.mp4", poster: "/img/vsl-01-poster.webp" };

/** Vídeo y miniatura de cada landing. */
const landingRuntime = (): LandingRuntime => ({
  video: {
    src: env.videoUrl || VSL.src,
    mobileSrc: env.videoUrl ? "" : VSL.mobileSrc,
    poster: env.videoPoster || VSL.poster,
    ctaSecond: env.videoCtaSecond === "" || env.videoCtaSecond === "none" ? null : Number(env.videoCtaSecond) || null,
  },
  ready: { video: true, testimonials: false },
});

export const siteConfig = {
  /** URL pública de las landings (para metadatos y OG). NEXT_PUBLIC_SITE_URL, p. ej. https://equiposcomerciales.fivo.info */
  siteUrl: env.siteUrl || "https://equiposcomerciales.fivo.info",

  landings: {
    "equipos-comerciales": landingRuntime(),
  } as Record<LandingSlug, LandingRuntime>,

  calendar: {
    /** Duración en minutos de la llamada (también para el .ics de /gracias). */
    minutes: 30,
    /**
     * Próximo hueco libre en la línea bajo los botones ("Próximo hueco: mañana a las 10:00").
     * APAGADO hasta conectar el calendario real: no hay horarios inventados. Al conectarlo, poner
     * enabled en true y rellenar startsAtIso (ISO 8601) con el primer hueco que devuelva el proveedor
     * (src/lib/nextSlot.ts lo formatea). Con enabled en false o sin fecha, la línea no cambia.
     */
    nextSlot: { enabled: false, startsAtIso: "" },
  },

  /** Google Apps Script que guarda en la hoja los cálculos de /gracias (unidos a la reserva de meetz por ?r=). */
  calculatorSheetUrl: "https://script.google.com/macros/s/AKfycbzllKUnAnPfo0AwD9wQGB8DCpqio1Qkq6gdsl2pnLAZs67GpBb_rJqLWeAleILaifwsLA/exec",

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
