import { siteConfig } from "@/config/site";

/** Clave de sessionStorage con la reserva que guarda el formulario antes de ir a /gracias. */
export const BOOKING_KEY = "fivo-booking";

export type BookingInfo = {
  startsAt: Date;
  minutes: number;
  /** Reserva hecha con el calendario de ejemplo (los horarios no son reales). */
  mock: boolean;
  /** Enlace de la videollamada, si el proveedor lo manda. */
  meetingUrl?: string;
};

// Parámetros con los que el proveedor de reservas (meetz, Calendly, Cal.com) redirige al terminar la reserva. La duración es siempre la de la landing (30 minutos).
const START_PARAMS = ["event_start_time", "startTime", "start_time", "start"];
const MEETING_PARAMS = ["meeting_url", "meetingUrl", "videoCallUrl", "video_call_url", "join_url", "hangoutLink", "location"];

function validDate(v: string | null | undefined): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function httpUrl(v: string | null | undefined): string | undefined {
  if (!v) return undefined;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Fecha y hora de la llamada, de donde estén: primero los parámetros de la URL con los que llegue el proveedor de
 * calendario, y si no, la reserva guardada en el navegador. Sin ninguna, null.
 */
export function readBooking(): BookingInfo | null {
  const q = meetzParams();
  const first = (keys: string[]) => keys.map((k) => q.get(k)).find((v) => v) ?? null;

  const fromUrl = validDate(first(START_PARAMS));
  if (fromUrl) {
    const meetingUrl = MEETING_PARAMS.map((k) => httpUrl(q.get(k))).find(Boolean);
    return { startsAt: fromUrl, minutes: siteConfig.calendar.minutes, mock: false, meetingUrl };
  }

  try {
    const raw = window.sessionStorage.getItem(BOOKING_KEY);
    if (!raw) return null;
    const b = JSON.parse(raw) as { startsAt?: string | null; minutes?: number; mock?: boolean; meetingUrl?: string };
    const d = validDate(b.startsAt);
    if (!d) return null;
    return { startsAt: d, minutes: b.minutes || siteConfig.calendar.minutes, mock: Boolean(b.mock), meetingUrl: httpUrl(b.meetingUrl) };
  } catch {
    return null;
  }
}

/**
 * Script que corre antes de pintar la confirmación y marca <html data-booking> si hay fecha. Así el botón "Añadir al
 * calendario" ya está (o no está) en la primera pintura y la página no salta al hidratar.
 */
export const BOOKING_SNIFF = `try{var q=new URLSearchParams(location.search),k=${JSON.stringify(START_PARAMS)},ok=false;for(var i=0;i<k.length;i++){var v=q.get(k[i]);if(v&&!isNaN(Date.parse(v)))ok=true}if(!ok){var r=sessionStorage.getItem(${JSON.stringify(BOOKING_KEY)});if(r){var b=JSON.parse(r);if(b&&b.startsAt&&!isNaN(Date.parse(b.startsAt)))ok=true}}if(ok)document.documentElement.setAttribute("data-booking","1")}catch(e){}`;

/** Clave de sessionStorage con el id de la reserva de meetz. */
const RESERVA_KEY = "fivo-reserva";
/** Clave de sessionStorage con todos los parámetros que trajo la URL de /gracias (lo que manda meetz al redirigir). */
const PARAMS_KEY = "fivo-meetz-params";
/** Nombres con los que puede llegar el id de la reserva. */
const RESERVA_PARAMS = ["r", "booking_id", "bookingId", "id"];

/** Los parámetros de la URL; si la URL no trae ninguno, los guardados al llegar (se pierden al navegar dentro de la web). */
function meetzParams(): URLSearchParams {
  const q = new URLSearchParams(window.location.search);
  if ([...q.keys()].length) return q;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(PARAMS_KEY) ?? "{}") as Record<string, string>;
    return new URLSearchParams(saved);
  } catch {
    return q;
  }
}

/** Guarda en la sesión todos los parámetros de la URL y los muestra en la consola (para saber qué manda meetz). */
export function captureMeetzParams(): void {
  try {
    const q = new URLSearchParams(window.location.search);
    if (![...q.keys()].length) return;
    const all: Record<string, string> = {};
    q.forEach((v, k) => {
      all[k] = v.slice(0, 300);
    });
    window.sessionStorage.setItem(PARAMS_KEY, JSON.stringify(all));
    console.info("Parámetros de meetz:", all);
  } catch {
    /* sin sessionStorage: no pasa nada */
  }
}

/**
 * El id de la reserva solo si viene en la URL (la redirección de meetz al terminar la reserva), sin mirar lo guardado en
 * la sesión: así el evento Schedule del píxel no sale al volver a /gracias navegando dentro de la web.
 */
export function reservaIdFromUrl(): string | null {
  try {
    const q = new URLSearchParams(window.location.search);
    return RESERVA_PARAMS.map((k) => q.get(k)?.trim()).find(Boolean)?.slice(0, 100) ?? null;
  } catch {
    return null;
  }
}

/** El id de la reserva (r, booking_id, bookingId o id), guardado mientras dure la visita. */
export function readReservaId(): string | null {
  try {
    const q = meetzParams();
    const found = RESERVA_PARAMS.map((k) => q.get(k)?.trim()).find(Boolean);
    if (found) {
      const id = found.slice(0, 100);
      window.sessionStorage.setItem(RESERVA_KEY, id);
      return id;
    }
    return window.sessionStorage.getItem(RESERVA_KEY);
  } catch {
    return null;
  }
}
