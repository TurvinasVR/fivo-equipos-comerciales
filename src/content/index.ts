import { equiposComerciales } from "./equipos-comerciales";
import type { LandingContent } from "./types";

/**
 * La landing que publica este repositorio.
 */
export const LANDING: LandingContent = equiposComerciales;

/** Ruta de la página de gracias: siempre "/gracias". */
export function thanksHref(_content: LandingContent): string {
  return "/gracias";
}
