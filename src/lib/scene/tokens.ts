/**
 * Colores del sistema para las escenas WebGL y de canvas, que no leen variables CSS.
 * Deben coincidir con @theme en src/app/globals.css (única fuente de verdad en el CSS).
 */
export const TOKENS = {
  bg: "#08090b",
  surface: "#111215",
  fg: "#f4f4f6",
  fgMuted: "#a1a1b0",
  lineStrong: "#32333b",
  accent: "#6b86ff",
} as const;

/** "#rrggbb" + alfa 0..1 -> "rgba(r,g,b,a)" para degradados de canvas. */
export function withAlpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
