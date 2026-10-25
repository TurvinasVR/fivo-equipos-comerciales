import type { EdgeKind } from "@/lib/scene/how/network";

/** Trazo de cada tipo de conexión de la red: las del centro con el degradado de marca, el resto más finas y tenues. */
export const EDGE_STYLE: Record<EdgeKind, { stroke: string; strokeWidth: number; strokeOpacity: number }> = {
  hub: { stroke: "url(#how-net-grad)", strokeWidth: 1.3, strokeOpacity: 0.6 },
  group: { stroke: "var(--color-accent)", strokeWidth: 1.1, strokeOpacity: 0.42 },
  cross: { stroke: "var(--color-accent)", strokeWidth: 1, strokeOpacity: 0.24 },
  minor: { stroke: "var(--color-grad-b)", strokeWidth: 0.8, strokeOpacity: 0.26 },
};
