"use client";

import { COOKIE_PREFS_EVENT } from "./CookieBanner";

/** Enlace "Cookies" del pie: reabre el aviso para cambiar la elección. */
export function CookiePrefsButton() {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 cursor-pointer items-center underline hover:text-fg"
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFS_EVENT))}
    >
      Cookies
    </button>
  );
}
