"use client";

import { useEffect, useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { readConsent, subscribeConsent } from "@/lib/consent";
import { flushQueue, revokeConsent } from "@/lib/analytics";
import { visitorCode } from "@/lib/visitor";

type FbqStub = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: unknown;
  loaded: boolean;
  version: string;
};

function useConsent() {
  return useSyncExternalStore(subscribeConsent, readConsent, () => null);
}

function loadScript(src: string) {
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

/**
 * Carga GA4 y Meta Pixel solo después de aceptar cookies (RGPD): antes no hay ninguna petición a Google ni a Meta.
 * Si se acepta más tarde, se cargan en ese momento y el píxel envía el PageView de la página actual. Si se rechaza o se
 * retira, no se cargan (o se revocan con consent revoke). Sin la imagen <noscript> del píxel, que saltaría el consentimiento.
 */
export function AnalyticsLoader() {
  const consent = useConsent();

  // Código de visitante: se crea al entrar en cualquier página (une el cálculo con la reserva de meetz)
  useEffect(() => {
    visitorCode();
  }, []);

  useEffect(() => {
    if (consent === "denied") {
      revokeConsent();
      return;
    }
    if (consent !== "granted") return;

    const { ga4Id, metaPixelId } = siteConfig.analytics;

    if (ga4Id && !window.gtag) {
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", ga4Id, { anonymize_ip: true });
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`);
    }

    // Se había retirado el consentimiento y se vuelve a dar: el píxel ya cargado sigue enviando
    if (metaPixelId && window.fbq) window.fbq("consent", "grant");

    if (metaPixelId && !window.fbq) {
      // Misma estructura que el snippet oficial: fbevents.js recoge la cola al cargar.
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      } as unknown as FbqStub;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq as unknown as NonNullable<Window["fbq"]>;
      loadScript("https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", metaPixelId);
      window.fbq("track", "PageView");
    }

    flushQueue();
  }, [consent]);

  return null;
}
