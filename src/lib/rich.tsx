import type { ReactNode } from "react";

/** `**texto**` se pinta en negrita: los números dentro de una frase van en negrita. */
export function rich(t: string): ReactNode[] {
  return t.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i} className="font-semibold text-fg">{part}</strong> : part));
}

/** El mismo texto sin marcas, para sitios donde no cabe la negrita. */
export function plain(t: string): string {
  return t.replace(/\*\*(.+?)\*\*/g, "$1");
}

/** Saltos de línea `\n` como <br />. */
export function lines(t: string): ReactNode[] {
  return t.split("\n").flatMap((l, i) => (i ? [<br key={`b${i}`} />, l] : [l]));
}
