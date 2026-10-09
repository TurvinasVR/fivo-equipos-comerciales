/** Una sola curva y una sola familia de duraciones para toda la página (ms). */
export const EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
export const DUR = { micro: 200, reveal: 600, scene: 1200 } as const;

/** Misma curva en JS (ease out exponencial). */
export const easeOut = (t: number) => (t >= 1 ? 1 : t <= 0 ? 0 : 1 - Math.pow(2, -10 * t));
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const lerp = (a: number, b: number, t: number) => a + (a === b ? 0 : (b - a) * t);
