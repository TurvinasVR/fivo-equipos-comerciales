/**
 * Utilidades para vigilar los botones "Agendar mi llamada" mientras se hace scroll.
 * Solo las usan las landings que repiten el botón al final de cada bloque.
 */

/** Verdadero si el elemento está (aunque sea en parte) dentro de la pantalla. */
export function inView(el: Element, margin = 2) {
  const r = el.getBoundingClientRect();
  return r.height > 0 && r.bottom > margin && r.top < window.innerHeight - margin;
}

/** Verdadero si el elemento se ve de verdad: dentro de la pantalla y no dentro de algo inerte (botón fijo oculto, botón aún por aparecer). */
export function shown(el: Element, margin = 2) {
  return inView(el, margin) && !el.closest("[inert]");
}

/**
 * Llama a `cb` al hacer scroll, al cambiar el tamaño y cuando aparece o desaparece un botón
 * (los bloques se montan de forma diferida) y cuando un botón deja de ser inerte. Agrupa las llamadas en un fotograma.
 */
export function watchCtas(cb: () => void) {
  let raf = 0;
  const run = () => {
    raf = 0;
    cb();
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(run);
  };
  const hasCta = (n: Node) => n.nodeType === 1 && ((n as Element).matches(".btn-cta") || Boolean((n as Element).querySelector(".btn-cta")));
  const mo = new MutationObserver((list) => {
    // un botón que aparece o desaparece del DOM, o que deja de ser inerte (p. ej. el de "Con Fivo")
    if (list.some((m) => m.type === "attributes" || [...m.addedNodes, ...m.removedNodes].some(hasCta))) schedule();
  });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["inert"] });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();
  return () => {
    mo.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (raf) cancelAnimationFrame(raf);
  };
}
