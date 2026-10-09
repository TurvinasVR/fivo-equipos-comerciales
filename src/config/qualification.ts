import type { LandingSlug } from "@/content/types";

/**
 * Opciones de los campos de selección del formulario y regla de cualificación de cada landing.
 * Se cambian aquí, sin tocar componentes. Los textos de las preguntas están en src/content.
 */

export type Option = { value: string; label: string };

/** Quien cumple alguna de estas condiciones no ve el calendario: ve "Empieza gratis". */
export type FreeRule = { field: string; values: string[] };

export const qualification: Record<LandingSlug, { options: Record<string, Option[]>; freeIf: FreeRule[] }> = {
  "equipos-comerciales": {
    options: {
      closers: [
        { value: "1-2", label: "1 a 2" },
        { value: "3-5", label: "3 a 5" },
        { value: "6-15", label: "6 a 15" },
        { value: "15+", label: "Más de 15" },
      ],
      crm: ["HubSpot", "Salesforce", "Pipedrive", "Zoho CRM", "Otro", "Ninguno"].map((c) => ({ value: c, label: c })),
      rol: [
        { value: "dueno", label: "Dueño" },
        { value: "director-comercial", label: "Director comercial" },
        { value: "otro", label: "Otro" },
      ],
    },
    freeIf: [{ field: "closers", values: ["1-2"] }],
  },
};

export function goesFree(slug: LandingSlug, values: Record<string, string>): boolean {
  return qualification[slug].freeIf.some((r) => r.values.includes(values[r.field]));
}
