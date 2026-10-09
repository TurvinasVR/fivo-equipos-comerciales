"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Globe } from "@phosphor-icons/react";
import { siteConfig } from "@/config/site";
import { PendingTag } from "../PendingTag";

const SLOTS_BY_DAY = [
  ["10:00", "11:30", "13:00", "16:00", "17:30"],
  ["09:30", "11:00", "12:30", "16:30"],
  ["10:00", "12:00", "15:00", "17:00", "18:00"],
  ["09:00", "10:30", "13:30", "16:00"],
  ["10:30", "11:30", "14:00", "17:30", "18:30"],
  ["09:30", "12:00", "16:00"],
  ["10:00", "11:00", "13:00", "15:30", "17:00"],
];

function nextBusinessDays(count: number) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
  }
  return out;
}

const wd = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const dn = new Intl.DateTimeFormat("es-ES", { day: "numeric" });
const mn = new Intl.DateTimeFormat("es-ES", { month: "short" });
const longFmt = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });

/**
 * Calendario simulado, sustituto del embed de Cal.com o Calendly.
 * Los horarios NO son reales y la página lo dice a quien lo vea.
 */
export function MockCalendar({ onBooked }: { onBooked: (startsAtIso: string) => void }) {
  const [days, setDays] = useState<Date[]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);

  useEffect(() => setDays(nextBusinessDays(7)), []);

  const slots = SLOTS_BY_DAY[dayIdx % SLOTS_BY_DAY.length];
  const startsAt = useMemo(() => {
    if (!days[dayIdx] || !slot) return null;
    const [h, m] = slot.split(":").map(Number);
    const d = new Date(days[dayIdx]);
    d.setHours(h, m, 0, 0);
    return d;
  }, [days, dayIdx, slot]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-muted">
        <strong className="inline-flex items-center gap-2 font-semibold text-warn"><i aria-hidden className="status-dot" />Calendario de ejemplo.</strong>
        <span>Los horarios no son reales y no se reserva nada.</span>
        <PendingTag>configura calendar.url en src/config/site.ts</PendingTag>
      </div>

      <div className="mt-5 flex items-center gap-2 text-[14px] text-fg-muted">
        <Globe size={18} className="text-accent" aria-hidden />
        Hora de España (Europe/Madrid)
      </div>

      <fieldset className="mt-4">
        <legend className="field-label">Día disponible</legend>
        <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
          {days.map((d, i) => (
            <label key={d.toISOString()} className="day">
              <input
                type="radio"
                name="dia"
                checked={dayIdx === i}
                onChange={() => {
                  setDayIdx(i);
                  setSlot(null);
                }}
              />
              <span>
                <small className="capitalize">{wd.format(d).replace(".", "")}</small>
                <b>{dn.format(d)}</b>
                <small>{mn.format(d).replace(".", "")}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="field-label">Hora</legend>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {slots.map((s) => (
            <label key={s} className="seg">
              <input type="radio" name="hora" checked={slot === s} onChange={() => setSlot(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-7">
        <button type="button" className="btn-cta btn-cta--lg w-full" disabled={!startsAt} onClick={() => startsAt && onBooked(startsAt.toISOString())}>
          <CalendarCheck size={22} aria-hidden />
          Confirmar hora
        </button>
        <p className="mt-3 text-center text-sm text-fg-muted" aria-live="polite">
          {startsAt ? `${longFmt.format(startsAt)} a las ${slot}. Duración: ${siteConfig.calendar.minutes} minutos.` : "Elige día y hora."}
        </p>
      </div>
    </div>
  );
}
