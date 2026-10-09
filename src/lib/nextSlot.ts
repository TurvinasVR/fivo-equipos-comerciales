import { siteConfig } from "@/config/site";

const TZ = "Europe/Madrid";
const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "long", timeZone: TZ });
const dayKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });

/** "hoy a las 16:30", "mañana a las 10:00" o "el jueves a las 10:00" (hora de Madrid). */
export function describeSlot(startsAtIso: string, now: Date = new Date()): string | null {
  const at = new Date(startsAtIso);
  if (Number.isNaN(at.getTime()) || at.getTime() < now.getTime()) return null;
  const days = Math.round((Date.parse(dayKey.format(at)) - Date.parse(dayKey.format(now))) / 86_400_000);
  const when = days <= 0 ? "hoy" : days === 1 ? "mañana" : `el ${weekday.format(at)}`;
  return `${when} a las ${time.format(at)}`;
}

/**
 * Texto del próximo hueco, o null mientras esté apagado en la configuración o no haya fecha real.
 * Nunca inventa horarios.
 */
export function nextSlotLabel(): string | null {
  const { enabled, startsAtIso } = siteConfig.calendar.nextSlot;
  if (!enabled || !startsAtIso) return null;
  return describeSlot(startsAtIso);
}
