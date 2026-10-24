import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";

/** Movimiento reducido (en servidor se asume sin reducir para no ocultar contenido). */
export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Verdadero cuando el elemento entra en pantalla. Con once=true se queda en verdadero. */
export function useInView<T extends Element>(opts: { threshold?: number; rootMargin?: string; once?: boolean } = {}): [RefObject<T | null>, boolean] {
  const { threshold = 0.3, rootMargin = "0px", once = true } = opts;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, inView];
}

/** Escribe `text` en `el` letra a letra. Devuelve la función que lo cancela. */
export function typeInto(el: HTMLElement | null, text: string, ms: number, onDone?: () => void) {
  if (!el) return () => {};
  let i = 0;
  const id = window.setInterval(() => {
    i += 1;
    el.textContent = text.slice(0, i) + (i < text.length ? "|" : "");
    if (i >= text.length) {
      window.clearInterval(id);
      onDone?.();
    }
  }, ms);
  return () => window.clearInterval(id);
}

/**
 * Verdadero cuando conviene empezar a cargar el código de una escena: cuando el elemento está a unas dos
 * pantallas de distancia, o cuando el navegador queda libre tras la carga inicial, lo que ocurra antes.
 * Nunca hay un retraso fijo. Se queda en verdadero.
 */
export function useEarly<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [early, setEarly] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let idleId = 0;
    let timer = 0;
    const done = () => setEarly(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) done();
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(el);
    const onIdle = () => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(done, { timeout: 2000 });
      else timer = window.setTimeout(done, 200);
    };
    if (document.readyState === "complete") onIdle();
    else window.addEventListener("load", onIdle, { once: true });
    return () => {
      io.disconnect();
      window.removeEventListener("load", onIdle);
      if (idleId && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(timer);
    };
  }, []);
  return [ref, early];
}

/** Verdadero mientras se cumple la media query (en servidor, falso). */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Móvil: por debajo de md (768 px), el mismo corte que el botón fijo. */
export const PHONE_QUERY = "(max-width: 767.98px)";

/**
 * Avance de 0 a 1 ligado al scroll, sin temporizadores: 0 cuando el borde superior del elemento entra por
 * `start` (fracción de la pantalla desde arriba) y 1 cuando ha subido `span` pantallas más. Se recalcula en el
 * fotograma siguiente a cada scroll o cambio de tamaño. `enabled` en falso lo deja quieto en 1 (estado final).
 */
export function useScrollProgress<T extends Element>(enabled: boolean, start = 0.9, span = 0.75): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [p, setP] = useState(1);
  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setP(1);
      return;
    }
    let raf = 0;
    const run = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const vh = window.innerHeight;
      const v = Math.min(1, Math.max(0, (vh * start - el.getBoundingClientRect().top) / (vh * span)));
      setP(Math.round(v * 400) / 400);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled, start, span]);
  return [ref, p];
}
