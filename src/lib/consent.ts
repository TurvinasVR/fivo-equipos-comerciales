export type Consent = "granted" | "denied" | null;

const KEY = "fivo-consent";
const EVENT = "fivo-consent-change";
/** Elección de esta visita, por si el navegador bloquea el almacenamiento: así "Aceptar" vale al menos hasta recargar. */
let memory: Consent = null;

export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : memory;
  } catch {
    return memory;
  }
}

export function writeConsent(value: Exclude<Consent, null> | "reset") {
  memory = value === "reset" ? null : value;
  try {
    if (value === "reset") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    /* almacenamiento bloqueado: la elección vale solo para esta sesión */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeConsent(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
