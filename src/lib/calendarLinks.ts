import type { BookingInfo } from "./booking";

export const EVENT_TITLE = "Llamada con Fivo";

function end(b: BookingInfo) {
  return new Date(b.startsAt.getTime() + b.minutes * 60_000);
}

/** 20261015T083000Z: la hora absoluta en UTC, que cada calendario muestra en la zona horaria de quien la abre. */
function compact(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function description(b: BookingInfo) {
  const lines = [`Llamada de ${b.minutes} minutos con Fivo.`];
  if (b.meetingUrl) lines.push(`Videollamada: ${b.meetingUrl}`);
  return lines.join("\n\n");
}

export function googleCalendarUrl(b: BookingInfo) {
  const u = new URL("https://calendar.google.com/calendar/render");
  u.searchParams.set("action", "TEMPLATE");
  u.searchParams.set("text", EVENT_TITLE);
  u.searchParams.set("dates", `${compact(b.startsAt)}/${compact(end(b))}`);
  u.searchParams.set("details", description(b));
  if (b.meetingUrl) u.searchParams.set("location", b.meetingUrl);
  // Zona horaria del navegador: Google enseña el evento en ella
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz) u.searchParams.set("ctz", tz);
  return u.toString();
}

export function outlookUrl(b: BookingInfo) {
  const u = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  u.searchParams.set("path", "/calendar/action/compose");
  u.searchParams.set("rru", "addevent");
  u.searchParams.set("subject", EVENT_TITLE);
  u.searchParams.set("startdt", b.startsAt.toISOString());
  u.searchParams.set("enddt", end(b).toISOString());
  u.searchParams.set("body", description(b));
  if (b.meetingUrl) u.searchParams.set("location", b.meetingUrl);
  return u.toString();
}

function esc(t: string) {
  return t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

const bytes = (s: string) => new TextEncoder().encode(s).length;

// Las líneas de un .ics no pasan de 75 bytes: las largas se parten con un espacio al principio de la siguiente
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (bytes(rest) > 75) {
    let cut = 75;
    while (bytes(rest.slice(0, cut)) > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = " " + rest.slice(cut);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function buildIcs(b: BookingInfo, prodid: string) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodid}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${compact(b.startsAt)}-fivo-llamada@fivo.ai`,
    `DTSTAMP:${compact(new Date())}`,
    `DTSTART:${compact(b.startsAt)}`,
    `DTEND:${compact(end(b))}`,
    `SUMMARY:${esc(EVENT_TITLE)}`,
    `DESCRIPTION:${esc(description(b))}`,
    ...(b.meetingUrl ? [`LOCATION:${esc(b.meetingUrl)}`, `URL:${b.meetingUrl}`] : []),
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(EVENT_TITLE)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(b: BookingInfo, prodid: string) {
  const url = URL.createObjectURL(new Blob([buildIcs(b, prodid)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "llamada-con-fivo.ics";
  a.click();
  URL.revokeObjectURL(url);
}
