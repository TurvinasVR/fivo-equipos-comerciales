const KEY = "fivo_sesion";
const DAYS = 30;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Código solo para esta visita, por si localStorage no funciona. */
let memory: string | null = null;

function newCode(): string {
  const out: string[] = [];
  try {
    const bytes = new Uint8Array(12);
    window.crypto.getRandomValues(bytes);
    for (const b of bytes) out.push(ALPHABET[b % ALPHABET.length]);
  } catch {
    for (let i = 0; i < 12; i++) out.push(ALPHABET[Math.floor(Math.random() * ALPHABET.length)]);
  }
  return out.join("");
}

/**
 * Código de visitante: 12 caracteres (minúsculas y números), guardado 30 días en localStorage ("fivo_sesion").
 * Se crea la primera vez que se pide y se renueva el plazo en cada visita. Une la calculadora con la reserva de meetz
 * (va en ref=<landing>.<código>). Sin localStorage, vale un código solo para esta visita.
 */
export function visitorCode(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem(KEY);
    const saved = raw ? (JSON.parse(raw) as { c?: string; e?: number }) : null;
    const now = Date.now();
    const valid = saved && typeof saved.c === "string" && /^[a-z0-9]{12}$/.test(saved.c) && typeof saved.e === "number" && saved.e > now;
    const code = valid ? (saved!.c as string) : newCode();
    window.localStorage.setItem(KEY, JSON.stringify({ c: code, e: now + DAYS * 24 * 60 * 60 * 1000 }));
    memory = code;
    return code;
  } catch {
    if (!memory) memory = newCode();
    return memory;
  }
}
