"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Envelope, Heart, PencilSimple } from "@phosphor-icons/react";
import { calendarIsMock, siteConfig } from "@/config/site";
import { goesFree, qualification } from "@/config/qualification";
import { thanksHref } from "@/content/index";
import { track } from "@/lib/analytics";
import { rich } from "@/lib/rich";
import { captureUtm } from "@/lib/utm";
import { showPending } from "@/lib/pending";
import { emptyLead, LeadForm, type LeadValues } from "./LeadForm";
import { MockCalendar } from "./MockCalendar";
import { ProviderEmbed } from "./ProviderEmbed";
import { PendingTag } from "../PendingTag";
import { TestimonialCard } from "../Testimonial";
import { useLanding } from "../landing/LandingContext";

type Stage = "form" | "calendar" | "free";

export const BOOKING_KEY = "fivo-booking";

function Steps({ stage }: { stage: Stage }) {
  const second = stage === "calendar";
  return (
    <ol className="mt-6 flex max-w-[420px] items-center gap-3 text-[15px]" aria-label="Pasos">
      <li className="flex items-center gap-2.5 font-medium" aria-current={!second ? "step" : undefined}>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-[13px] font-bold transition-colors duration-300 ${second ? "border-accent bg-accent text-bg" : "border-accent text-accent"}`}>
          {second ? <Check size={14} weight="bold" aria-hidden /> : "1"}
        </span>
        <span className={second ? "text-fg-muted" : "text-fg"}>Tus datos</span>
      </li>
      <span aria-hidden className="relative h-px flex-1 bg-line-strong">
        <span className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-500" style={{ width: second ? "100%" : "0%" }} />
      </span>
      <li className="flex items-center gap-2.5 font-medium" aria-current={second ? "step" : undefined}>
        <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-[13px] font-bold transition-colors duration-300 ${second ? "border-accent text-accent" : "border-line-strong text-fg-muted"}`}>2</span>
        <span className={second ? "text-fg" : "text-fg-muted"}>Elige hora</span>
      </li>
    </ol>
  );
}

/** Bloque 9. Formulario de 6 campos; al enviarlo, el calendario aparece en este mismo marco. */
export default function BookingBlock() {
  const content = useLanding();
  const { slug, booking, proof } = content;
  const thanksPath = thanksHref(content);
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [values, setValues] = useState<LeadValues>(() => emptyLead(content));

  const showTestimonial = siteConfig.landings[slug].ready.testimonials || showPending;

  const booked = useCallback(
    (startsAtIso?: string) => {
      const utm = captureUtm();
      try {
        window.sessionStorage.setItem(BOOKING_KEY, JSON.stringify({ startsAt: startsAtIso ?? null, minutes: siteConfig.calendar.minutes, mock: calendarIsMock }));
      } catch {
        /* sin sessionStorage: /gracias muestra la confirmación genérica */
      }
      // call_booked es la conversión principal
      const params = Object.fromEntries(Object.entries(booking.form.analytics.booked).map(([param, field]) => [param, values[field]]));
      track("call_booked", { ...params, provider: calendarIsMock ? "mock" : siteConfig.calendar.provider, ...utm });
      router.push(thanksPath);
    },
    [values, router, booking.form.analytics.booked, thanksPath],
  );

  const goto = (s: Stage) => {
    setStage(s);
    window.setTimeout(() => document.getElementById("agendar-titulo")?.focus({ preventScroll: false }), 60);
  };

  /** Resumen de los datos elegidos, para el calendario. */
  const summary = booking.form.choices.map((c) => {
    const label = qualification[slug].options[c.options].find((o) => o.value === values[c.name])?.label;
    return label ? c.summary.replace("{label}", label) : undefined;
  });

  return (
    <div className="relative mx-auto max-w-[1120px] px-5 section-pad lg:px-10">
      <h2
        id="agendar-titulo"
        tabIndex={-1}
        className="font-display text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-black leading-[1.1] tracking-[-0.015em] outline-none"
      >
        {stage === "free" ? booking.freeTitle : booking.title}
      </h2>
      {stage !== "free" && (
        <>
          <p className="mt-3 text-lg text-fg-muted">{rich(booking.sub)}</p>
          <Steps stage={stage} />
        </>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-7">
          <div className="card p-5 sm:p-8">
            {/* Formulario: se queda montado para no perder los datos al corregir */}
            <div hidden={stage !== "form"} className={stage === "form" ? "pane-in" : undefined} {...(stage !== "form" ? { inert: true } : {})}>
              <LeadForm
                values={values}
                onChange={setValues}
                onSubmitted={(v) => {
                  setValues(v);
                  goto(goesFree(slug, v) ? "free" : "calendar");
                }}
              />
            </div>

            {stage === "calendar" && (
              <div className="pane-in">
                <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line pb-4 text-[14px] text-fg-muted">
                  <span>
                    <span className="text-fg-muted">Tus datos: </span>
                    {[values.nombre, values.email, ...summary].filter(Boolean).join(", ")}
                  </span>
                  <button type="button" onClick={() => goto("form")} className="ml-auto flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[6px] px-2.5 font-medium text-accent underline-offset-4 hover:underline">
                    <PencilSimple size={16} aria-hidden />
                    Corregir datos
                  </button>
                </div>
                {calendarIsMock ? (
                  <MockCalendar onBooked={(iso) => booked(iso)} />
                ) : (
                  <ProviderEmbed lead={values} utm={captureUtm()} onBooked={(iso) => booked(iso)} />
                )}
              </div>
            )}

            {stage === "free" && (
              <div className="pane-in">
                <Heart size={32} weight="fill" className="text-accent" aria-hidden />
                <p className="mt-4 font-display text-xl font-bold leading-snug sm:text-2xl">{rich(booking.free.headline)}</p>
                <p className="mt-3 text-fg-muted">{booking.free.text}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a href={siteConfig.freeSignupUrl} target="_blank" rel="noopener" className="btn-cta">
                    {booking.free.cta}
                    <ArrowUpRight size={18} weight="bold" aria-hidden />
                  </a>
                  <button type="button" onClick={() => goto("form")} className="btn-ghost">
                    <PencilSimple size={16} aria-hidden />
                    Corregir datos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lo que da confianza */}
        <aside className="min-w-0 space-y-6 lg:col-span-5 lg:sticky lg:top-6 lg:self-start" aria-label="Qué pasa después">
          <div>
            <h3 className="font-display text-xl font-bold">Qué pasa después</h3>
            <ol className="relative mt-4 space-y-4">
              <span aria-hidden className="absolute bottom-3 left-[13px] top-3 w-px bg-line-strong" />
              {booking.next.map((t, i) => (
                <li key={i} className="relative flex items-start gap-3.5">
                  <span className="relative z-[1] flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border border-accent bg-bg text-[13px] font-bold text-accent">{i + 1}</span>
                  <span className="pt-0.5 text-[16px] leading-snug text-fg-muted">{rich(t)}</span>
                </li>
              ))}
            </ol>
          </div>

          {showTestimonial && <TestimonialCard data={proof.testimonials[0]} index={0} />}

          <p className="text-[13px] leading-snug text-fg-muted">
            Usamos tus datos para gestionar esta llamada. Más información en la{" "}
            <a href={siteConfig.legal.privacidad} target="_blank" rel="noopener" className="text-fg-muted underline">
              política de privacidad
            </a>
            .
          </p>

          {stage !== "free" && (
            <p className="text-[15px] text-fg-muted">
              {siteConfig.contactEmail ? (
                <a href={`mailto:${siteConfig.contactEmail}`} className="inline-flex items-center gap-2 text-fg-muted underline decoration-line-strong hover:text-fg">
                  <Envelope size={18} aria-hidden />
                  ¿Aún no quieres agendar? Escríbenos
                </a>
              ) : (
                showPending && (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 text-fg-muted">
                      <Envelope size={18} aria-hidden />
                      ¿Aún no quieres agendar? Escríbenos
                    </span>
                    <PendingTag>contactEmail vacío, se oculta en producción</PendingTag>
                  </span>
                )
              )}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
