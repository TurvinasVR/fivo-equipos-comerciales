"use client";

import { useEffect, useState } from "react";
import { BellRinging, CalendarPlus, CheckCircle } from "@phosphor-icons/react";
import { siteConfig } from "@/config/site";
import { showPending } from "@/lib/pending";
import type { LandingContent } from "@/content/types";
import { BOOKING_KEY } from "./booking/BookingBlock";
import { PendingTag } from "./PendingTag";
import { VideoPlayer } from "./VideoPlayer";
import { TestimonialCard } from "./Testimonial";
import { CalculatorSection } from "./calculator/CalculatorSection";

type Booking = { startsAt: string | null; minutes: number; mock: boolean };

const whenFmt = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function toIcsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function downloadIcs(b: Booking, prodid: string) {
  if (!b.startsAt) return;
  const start = new Date(b.startsAt);
  const end = new Date(start.getTime() + b.minutes * 60_000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodid}`,
    "BEGIN:VEVENT",
    `UID:${toIcsDate(start)}-fivo-llamada@fivo.ai`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    "SUMMARY:Llamada de 30 minutos con Fivo",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "llamada-fivo.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function ThanksContent({ content }: { content: LandingContent }) {
  const { slug, thanks, proof } = content;
  const rt = siteConfig.landings[slug];
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(BOOKING_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setBooking(JSON.parse(raw) as Booking);
    } catch {
      /* sin datos: confirmación genérica */
    }
  }, []);

  const when = booking?.startsAt ? whenFmt.format(new Date(booking.startsAt)) : null;

  return (
    <main className="relative z-[2] mx-auto max-w-[1120px] px-5 pb-20 pt-6 lg:px-10">
      <div className="mx-auto max-w-[760px] text-center">
        <CheckCircle size={52} weight="fill" className="mx-auto text-success" aria-hidden />
        <h1 className="mt-5 font-display text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] font-black leading-[1.1] tracking-[-0.015em]">
          {thanks.title}
        </h1>
        <p className="mt-4 text-lg text-fg-muted">
          {when ? (
            <>
              Te esperamos el <strong className="font-semibold text-fg">{when}</strong>. Dura <strong className="font-semibold text-fg">{booking?.minutes} minutos</strong>.
            </>
          ) : (
            <>Te esperamos en la hora que has elegido. Dura <strong className="font-semibold text-fg">{siteConfig.calendar.minutes} minutos</strong>.</>
          )}
        </p>
        {booking?.mock && (
          <p className="mt-3 text-sm text-warn">Reserva de ejemplo: el calendario de la página anterior era simulado.</p>
        )}

        <div className="mt-7 flex flex-col items-center gap-3">
          <button
            type="button"
            className="btn-cta"
            disabled={!booking?.startsAt}
            onClick={() => booking && downloadIcs(booking, thanks.ics.prodid)}
          >
            <CalendarPlus size={20} aria-hidden />
            Añadir al calendario
          </button>
          {!booking?.startsAt && (
            <p className="max-w-[420px] text-sm text-fg-muted">
              Añade la cita desde la confirmación que te ha llegado del calendario.
            </p>
          )}
        </div>
      </div>



      <CalculatorSection />
    </main>
  );
}
