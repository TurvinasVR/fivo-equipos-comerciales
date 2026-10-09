import { useSyncExternalStore } from "react";

/**
 * Qué versión de las escenas se muestra:
 * pending: aún sin decidir (se ve la versión 2D estática del servidor)
 * static: movimiento reducido, estado final fijo
 * 2d: SVG ligero con animación de entrada (móvil, equipos modestos, sin WebGL)
 * 3d: canvas WebGL compartido
 */
export type ScenePlan = "pending" | "static" | "2d" | "3d";

type State = { plan: ScenePlan; canvas: boolean };

let state: State = { plan: "pending", canvas: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const sceneStore = {
  get: () => state,
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    emit();
  },
  /** El 3D falla o rinde mal: se pasa a la versión 2D sin recargar. */
  fallTo2d() {
    state = { plan: "2d", canvas: false };
    emit();
  },
};

const SERVER: State = { plan: "pending", canvas: false };
export function useScene() {
  return useSyncExternalStore(sceneStore.subscribe, sceneStore.get, () => SERVER);
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function decidePlan(): ScenePlan {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const coarse = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(hover: hover)").matches;
  const narrow = window.innerWidth < 900;
  const weak = (nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4;
  const saveData = Boolean(nav.connection?.saveData);
  if (coarse || narrow || weak || saveData || !hasWebGL()) return "2d";
  return "3d";
}

/** Puntero normalizado (-1 a 1), suavizado por quien lo lee. */
export const pointer = { x: 0, y: 0 };
let pointerOn = false;
export function trackPointer() {
  if (pointerOn || typeof window === "undefined") return;
  pointerOn = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
}
