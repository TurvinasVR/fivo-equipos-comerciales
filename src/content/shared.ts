import type { FaqItem, ScaleFigure } from "./types";

/** Cifras de escala facilitadas por Fivo. Sin confirmar: ver PENDIENTES.md antes de publicar. */
export const SCALE: ScaleFigure[] = [
  { figure: "2,4 M", label: "consultas al grafo al mes", sr: "2,4 millones de consultas al grafo al mes" },
  { figure: "1.800 M", label: "tokens procesados al mes", sr: "1.800 millones de tokens procesados al mes" },
  { figure: "< 1 s", label: "por respuesta", sr: "menos de 1 segundo por respuesta" },
  { figure: "87 %", label: "menos tokens por consulta", sr: "87 por ciento menos tokens por consulta" },
];

/** Respuestas que valen para las dos landings: una sola fuente. */
export const FAQ_TRANSCRIBE: FaqItem = {
  q: "¿Es una herramienta para transcribir llamadas?",
  a: "No. Las llamadas son una de las fuentes. Fivo construye un grafo de contexto con lo que hace tu equipo en sus herramientas y lo conecta a tu IA.",
};

export const FAQ_PRICE: FaqItem = {
  q: "¿Cuánto cuesta?",
  a: "Se paga por licencia y mes: Pro cuesta **29,99 €**, Business **39,99 €** y Enterprise es a medida. También existe un plan Free.",
};
