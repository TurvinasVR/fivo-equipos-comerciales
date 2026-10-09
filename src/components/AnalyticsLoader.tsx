"use client";

import { useEffect, useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { readConsent, subscribeConsent } from "@/lib/consent";
import { flushQueue, revokeConsent } from "@/lib/analytics";
import { captureUtm } from "@/lib/utm";

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

/** Carga GA4 y Meta Pixel solo después de aceptar cookies (RGPD). */
export function AnalyticsLoader() {
  const consent = useConsent();

  useEffect(() => {
    captureUtm();
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
