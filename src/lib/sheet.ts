import { siteConfig } from "@/config/site";
import { currentLanding } from "./analytics";
import { readReservaId } from "./booking";
import { visitorCode } from "./visitor";

export type SheetEvento = "resultado" | "cambio" | "pdf";
/** Lo que aporta la calculadora; el resto de campos los pone `sendCalculo`. */
export type CalculoData = {
  email: string;
  sector: string;
  comerciales: number;
  resto_equipo: number;
  gasto_anual: number;
  ingresos_anuales: number;
  graba_llamadas: string;
  revision_externa: string;
  optimizar_areas: string;
  gasto_apps_mes: number;
  gasto_grabacion_mes: number | string;
  herramientas: string;
  supuestos: string;
  ahorro: number;
  ganancia: number;
  neto_anual: number;
  coste_mes: number;
  coste_anual: number;
  facturacion: "mensual" | "anual";
};

/**
 * Envía el cálculo a la hoja de Google (Apps Script). POST "no-cors" con texto plano y cuerpo JSON, con sendBeacon de reserva.
 * Nunca lanza ni espera: si falla, la calculadora y el PDF siguen como si nada.
 */
export function sendCalculo(evento: SheetEvento, data: CalculoData): void {
  try {
    const body = {
      tipo: "calculo",
      reserva_id: readReservaId() ?? "",
      sesion: visitorCode(),
      landing: currentLanding(),
      evento,
      email: data.email,
      sector: data.sector,
      comerciales: data.comerciales,
      resto_equipo: data.resto_equipo,
      gasto_anual: data.gasto_anual,
      ingresos_anuales: data.ingresos_anuales,
      graba_llamadas: data.graba_llamadas,
      revision_externa: data.revision_externa,
      optimizar_areas: data.optimizar_areas,
      gasto_apps_mes: data.gasto_apps_mes,
      gasto_grabacion_mes: data.gasto_grabacion_mes,
      herramientas: data.herramientas,
      supuestos: data.supuestos,
      ahorro: data.ahorro,
      ganancia: data.ganancia,
      neto_anual: data.neto_anual,
      coste_mes: data.coste_mes,
      coste_anual: data.coste_anual,
      facturacion: data.facturacion,
      website: "",
    };
    const json = JSON.stringify(body);
    // No depende del consentimiento de cookies (son los datos que la persona mete para preparar su llamada).
    // Si el fetch falla (red, bloqueador) se prueba una vez con sendBeacon; si tampoco, se ignora.
    fetch(siteConfig.calculatorSheetUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: json,
    }).catch(() => {
      try {
        navigator.sendBeacon(siteConfig.calculatorSheetUrl, new Blob([json], { type: "text/plain;charset=utf-8" }));
      } catch {
        /* sin envío: no pasa nada */
      }
    });
  } catch {
    /* sin envío: no pasa nada */
  }
}
