"use client";

import { siteConfig } from "@/config/site";
import { showPending } from "@/lib/pending";
import { ClientLogos } from "./ClientLogos";
import { PendingTag } from "./PendingTag";
import { Reveal } from "./Reveal";
import { TestimonialCard } from "./Testimonial";
import { BlockCta } from "./landing/BlockCta";
import { useLanding } from "./landing/LandingContext";

/**
 * Bloque 7. Prueba de escala: cuatro cifras grandes con su etiqueta. Los logotipos de clientes y los
 * testimonios se suman debajo si la landing los usa (en producción los testimonios siguen ocultos
 * hasta que haya reales).
 */
export function Proof() {
  const { slug, proof } = useLanding();
  const SCALE = proof.scale;
  const showTestimonials = siteConfig.landings[slug].ready.testimonials || showPending;
  const [main, ...rest] = proof.testimonials;
  return (
    <section aria-labelledby="prueba">
      <div className="mx-auto max-w-[1120px] px-5 section-pad lg:px-10">
        <h2 id="prueba" className="font-display text-3xl font-black tracking-[-0.015em] sm:text-4xl">
          {proof.title}
        </h2>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 lg:mt-10 lg:grid-cols-4 lg:gap-x-8">
          {SCALE.map((s, i) => (
            <Reveal key={s.figure} delay={i * 80}>
              <div>
                <dt className="sr-only">{s.sr}</dt>
                <dd aria-hidden className="font-display text-[clamp(2.25rem,1.6rem+3vw,3.75rem)] font-black leading-none tracking-[-0.02em] text-fg">
                  {s.figure}
                </dd>
                <dd aria-hidden className="mt-2 text-[14px] leading-snug text-fg-muted">
                  {s.label}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
        {showPending && (
          <p className="mt-6 text-center">
            <PendingTag>confirmar las cuatro cifras de escala antes de publicar</PendingTag>
          </p>
        )}

        {proof.logos && (
          <div className="mt-10 border-t border-line pt-8 lg:mt-14">
            <p className="mb-5 text-center text-[14px] font-medium text-fg-muted">Clientes de Fivo</p>
            <ClientLogos />
          </div>
        )}

        {showTestimonials && (
          <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-12 lg:gap-5">
            <Reveal className="lg:col-span-7">
              <TestimonialCard data={main} index={0} featured />
            </Reveal>
            <div className="grid gap-4 lg:col-span-5 lg:gap-5">
              {rest.map((t, i) => (
                <Reveal key={i} delay={(i + 1) * 120}>
                  <TestimonialCard data={t} index={i + 1} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
        <BlockCta position="prueba" />
      </div>
    </section>
  );
}
