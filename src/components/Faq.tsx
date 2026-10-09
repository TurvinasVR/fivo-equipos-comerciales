"use client";

import { useId, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { showPending } from "@/lib/pending";
import { rich } from "@/lib/rich";
import { PendingTag } from "./PendingTag";
import { BlockCta } from "./landing/BlockCta";
import { useLanding } from "./landing/LandingContext";

/** Bloque 10. Acordeón accesible. Sin respuesta publicable = solo visible en desarrollo. */
export function Faq() {
  const { faq } = useLanding();
  const ITEMS = faq.items;
  const base = useId();
  const [open, setOpen] = useState<number | null>(null);
  const visible = ITEMS.map((it, i) => ({ it, i })).filter(({ it }) => it.a || showPending);

  return (
    <section aria-labelledby="faq" className="bg-bg">
      <div className="mx-auto max-w-[1120px] px-5 section-pad lg:px-10">
        <div className="max-w-[820px]">
        <h2 id="faq" className="font-display text-3xl font-black tracking-[-0.015em] sm:text-4xl">
          {faq.title}
        </h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {visible.map(({ it, i }) => {
            const isOpen = open === i;
            const bid = `${base}-b${i}`;
            const pid = `${base}-p${i}`;
            return (
              <div key={it.q}>
                <h3>
                  <button
                    id={bid}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={pid}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left font-display text-lg font-bold leading-snug sm:text-xl"
                  >
                    {it.q}
                    <Plus
                      size={22}
                      aria-hidden
                      className="shrink-0 text-accent transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                    />
                  </button>
                </h3>
                <div id={pid} role="region" aria-labelledby={bid} className="acc-panel" data-open={isOpen}>
                  <div>
                    <div className="space-y-3 pb-6 pr-8 text-fg-muted">
                      {it.a && <p>{rich(it.a)}</p>}
                      {it.pending && (
                        <p>
                          <PendingTag>{it.pending}</PendingTag>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
        <BlockCta position="faq" />
      </div>
    </section>
  );
}
