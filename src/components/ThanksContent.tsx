"use client";

import { useLayoutEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { siteConfig } from "@/config/site";
import type { LandingContent } from "@/content/types";
import { readBooking, type BookingInfo } from "@/lib/booking";
import { CalendarAdd } from "./CalendarAdd";
import { TestimonialCard } from "./Testimonial";
import { CalculatorSection } from "./calculator/CalculatorSection";

const whenFmt = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function ThanksContent({ content }: { content: LandingContent }) {
  const { slug, thanks, proof } = content;
  const rt = siteConfig.landings[slug];
  const [booking, setBooking] = useState<BookingInfo | null>(null);

  // Antes de pintar (también al llegar por navegación interna, donde el script de ThanksPage no corre): fecha de la
  // llamada, de los parámetros de la URL del proveedor de calendario o de la reserva guardada en el navegador
  useLayoutEffect(() => {
    const b = readBooking();
    document.documentElement.toggleAttribute("data-booking", Boolean(b));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBooking(b);
  }, []);

  const when = booking ? whenFmt.format(booking.startsAt) : null;
  const showTestimonials = rt.ready.testimonials && proof.testimonials.length >= 3;

  return (
    <main className="relative z-[2] mx-auto max-w-[1120px] px-5 pb-5 pt-2 lg:px-10 lg:pb-8">
      {/* Confirmación compacta: la calculadora tiene que verse en la primera pantalla */}
      <div className="mx-auto max-w-[960px] text-center">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <CheckCircle size={32} weight="fill" className="shrink-0 text-success" aria-hidden />
          <h1 className="font-display text-[1.75rem] font-black leading-[1.1] tracking-[-0.015em] lg:text-[2.5rem]">{thanks.title}</h1>
        </div>
        <p className="mt-3 text-[15px] text-fg-muted sm:text-base">
          {when ? (
            <>
              Te esperamos el <strong className="font-semibold text-fg">{when}</strong>. Dura <strong className="font-semibold text-fg">{booking?.minutes} minutos</strong>.
            </>
          ) : (
            <>Te esperamos en la hora que has elegido. Dura <strong className="font-semibold text-fg">{siteConfig.calendar.minutes} minutos</strong>.</>
          )}{" "}
          Te llegará un recordatorio por email.
        </p>
        {booking?.mock && (
          <p className="mt-2 text-sm text-warn">Reserva de ejemplo: el calendario de la página anterior era simulado.</p>
        )}

        <CalendarAdd booking={booking} prodid={thanks.ics.prodid} />
      </div>

      {showTestimonials && (
        <div className="mt-14 grid gap-4 md:grid-cols-2 md:gap-5">
          <TestimonialCard data={proof.testimonials[1]} />
          <TestimonialCard data={proof.testimonials[2]} />
        </div>
      )}

      <CalculatorSection title={thanks.calculator.title} intro={thanks.calculator.intro} resultTitle={thanks.calculator.resultTitle} disclaimer={content.footer.disclaimer ?? ""} />
    </main>
  );
}
