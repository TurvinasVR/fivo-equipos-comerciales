import { siteConfig } from "@/config/site";
import { currentLanding } from "./analytics";
import { readReservaId } from "./booking";

export type SheetEvento = "resultado" | "cambio" | "pdf";
/** Lo que aporta la calculadora; el resto de campos los pone `sendCalculo`. */
export type CalculoData = {
  email: string;
  sector: string;
  comerciales: number;
  resto_equipo: number;
  gasto_anual: number;
  ingresos_anuales: number;
  herramientas: number;
  supuestos: string;
  ahorro: number;
  ganancia: number;
  neto_anual: number;
  coste_mes: number;
  facturacion: "mensual" | "anual";
};

const SESSION_KEY = "fivo-sesion";

/** Un id aleatorio por visita (sessionStorage). */
function sesionId(): string {
  try {
    const saved = window.sessionStorage.getItem(SESSION_KEY);
    if (saved) return saved;
    const id = (window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`).replace(/-/g, "");
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Envía el cálculo a la hoja de Google (Apps Script). POST "no-cors" con texto plano y cuerpo JSON. Nunca lanza ni
 * espera: si falla, la calculadora y el PDF siguen como si nada.
 */
export function sendCalculo(evento: SheetEvento, data: CalculoData): void {
  try {
    const body = {
      tipo: "calculo",
      reserva_id: readReservaId() ?? "",
      sesion: sesionId(),
      landing: currentLanding(),
      evento,
      email: data.email,
      sector: data.sector,
      comerciales: data.comerciales,
      resto_equipo: data.resto_equipo,
      gasto_anual: data.gasto_anual,
      ingresos_anuales: data.ingresos_anuales,
      herramientas: data.herramientas,
      supuestos: data.supuestos,
      ahorro: data.ahorro,
      ganancia: data.ganancia,
      neto_anual: data.neto_anual,
      coste_mes: data.coste_mes,
      facturacion: data.facturacion,
      website: "",
    };
    void fetch(siteConfig.calculatorSheetUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* sin envío: no pasa nada */
  }
}
