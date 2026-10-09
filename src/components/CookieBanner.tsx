"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { readConsent, subscribeConsent, writeConsent } from "@/lib/consent";
import { siteConfig } from "@/config/site";

export const COOKIE_PREFS_EVENT = "fivo-open-cookie-prefs";

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => "granted" as const);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(COOKIE_PREFS_EVENT, open);
    return () => window.removeEventListener(COOKIE_PREFS_EVENT, open);
  }, []);

  const visible = consent === null || reopened;
  useEffect(() => {
    document.documentElement.toggleAttribute("data-consent-open", visible);
  }, [visible]);

  if (!visible) return null;

  const choose = (value: "granted" | "denied") => {
    writeConsent(value);
    setReopened(false);
  };

  return (
    <section
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-[380px] sm:p-0"
    >
      <div className="card border-line-strong bg-surface-2 p-4 sm:p-5">
        <p className="text-sm text-fg-muted">
          Usamos cookies de analítica para medir esta página. No las cargamos hasta que aceptes.{" "}
          <a href={siteConfig.legal.cookies} target="_blank" rel="noopener" className="text-accent underline">
            Más información
          </a>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className="btn-ghost" onClick={() => choose("denied")}>
            Rechazar
          </button>
          <button type="button" className="btn-ghost" onClick={() => choose("granted")}>
            Aceptar
          </button>
        </div>
      </div>
    </section>
  );
}
