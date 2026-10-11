"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, CaretDown } from "@phosphor-icons/react";
import { track } from "@/lib/analytics";
import type { BookingInfo } from "@/lib/booking";
import { downloadIcs, googleCalendarUrl, outlookUrl } from "@/lib/calendarLinks";

type Option = "google" | "outlook" | "ics";

/**
 * "Añadir al calendario": un menú con Google Calendar, Outlook y .ics. Sin fecha no se pinta (y antes de hidratar lo
 * oculta el CSS: ver BOOKING_SNIFF). El menú flota: abrirlo no mueve la página.
 */
export function CalendarAdd({ booking, prodid }: { booking: BookingInfo | null; prodid: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    wrap.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Antes de conocer la fecha se pinta el mismo botón, invisible: el sitio está reservado y la página no salta al hidratar.
  // Si no hay fecha, el CSS oculta todo el hueco (.cal-slot sin <html data-booking>).
  if (!booking)
    return (
      <div className="cal-slot mt-4 inline-block" aria-hidden inert>
        <button type="button" className="btn-ghost invisible" tabIndex={-1} disabled>
          <CalendarPlus size={18} aria-hidden />
          Añadir al calendario
          <CaretDown size={14} aria-hidden />
        </button>
      </div>
    );

  const pick = (option: Option) => {
    track("calendar_add", { option });
    setOpen(false);
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = [...(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
  };
  const item = "flex min-h-11 w-full items-center px-4 text-left text-[15px] text-fg hover:bg-surface-2 focus-visible:bg-surface-2";

  return (
    <div ref={wrap} className="cal-slot relative mt-4 inline-block">
      <button ref={trigger} type="button" className="btn-ghost" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <CalendarPlus size={18} aria-hidden />
        Añadir al calendario
        <CaretDown size={14} aria-hidden className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Añadir al calendario"
          onKeyDown={onMenuKey}
          className="absolute left-1/2 top-[calc(100%+6px)] z-50 w-60 -translate-x-1/2 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface py-1 text-left shadow-[0_18px_40px_rgb(0_0_0/0.5)]"
        >
          <a role="menuitem" className={item} href={googleCalendarUrl(booking)} target="_blank" rel="noopener" onClick={() => pick("google")}>
            Google Calendar
          </a>
          <a role="menuitem" className={item} href={outlookUrl(booking)} target="_blank" rel="noopener" onClick={() => pick("outlook")}>
            Outlook
          </a>
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              downloadIcs(booking, prodid);
              pick("ics");
            }}
          >
            Apple / otro (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
