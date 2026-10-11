"use client";

import { useEffect, useMemo } from "react";
import { siteConfig } from "@/config/site";
import type { Utm } from "@/lib/utm";

export type Lead = Record<string, string>;

/**
 * Calendario real (Calendly o Cal.com) en un iframe, dentro del mismo bloque.
 * Detecta la reserva con los mensajes postMessage de cada proveedor.
 * Sin verificar aún con una cuenta real de calendario.
 */
export function ProviderEmbed({ lead, utm, onBooked }: { lead: Lead; utm: Utm; onBooked: (startsAtIso?: string) => void }) {
  const { provider, url } = siteConfig.calendar;

  const src = useMemo(() => {
    const u = new URL(url);
    u.searchParams.set("name", lead.nombre);
    u.searchParams.set("email", lead.email);
    if (provider === "calendly") {
      u.searchParams.set("embed_type", "Inline");
      u.searchParams.set("embed_domain", window.location.hostname);
      u.searchParams.set("hide_gdpr_banner", "1");
      u.searchParams.set("a1", lead.whatsapp);
      for (const [k, v] of Object.entries(utm)) if (v && k.startsWith("utm_")) u.searchParams.set(k, v);
    } else {
      u.searchParams.set("embed", "true");
      u.searchParams.set("notes", `WhatsApp: ${lead.whatsapp}`);
    }
    return u.toString();
  }, [lead, utm, url, provider]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data as { event?: string; originator?: string; type?: string; payload?: { event?: { start_time?: string } } } | null;
      if (!d || typeof d !== "object") return;
      if (provider === "calendly" && e.origin === "https://calendly.com" && d.event === "calendly.event_scheduled") {
        onBooked(d.payload?.event?.start_time);
      }
      if (provider === "cal" && d.originator === "CAL" && d.type === "bookingSuccessful") onBooked();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [provider, onBooked]);

  return (
    <iframe
      src={src}
      title="Calendario para agendar la llamada de 30 minutos"
      className="h-[680px] w-full rounded-[12px] border border-line bg-fg"
      loading="lazy"
    />
  );
}
