/* eslint-disable @typescript-eslint/no-explicit-any */
// Fórmulas de la calculadora: copia literal de la original. Única fuente de las cifras de dinero.
import { CFG } from "./config";

function roundTo(x: number, step: number){ return Math.round(x / step) * step; }
export function posInt(v: any, max?: number){ return Math.min(max || 1e12, Math.max(0, Math.round(+v || 0))); }

export function tierSet(callsIn: unknown){
  var calls = posInt(callsIn);
  var b = CFG.consultantBoundsPct.map(function(p: number){ return roundTo(calls * p, CFG.consultantRound); });
  if(b[0] > 0 && b[0] < b[1] && b[1] < b[2]){
    return {mode:"pct", bounds:b, values:CFG.consultantMidPct.map(function(p: number){ return Math.max(CFG.consultantMin, roundTo(calls * p, CFG.consultantRound)); })};
  }
  return {mode:"fixed", bounds:CFG.consultantFixedBounds.slice(), values:CFG.consultantFixedValues.slice()};
}

export function compute(i: any){
  var reps   = posInt(i.reps, 1e5), rest = posInt(i.rest, 1e5), people = reps + rest;
  var team   = posInt(i.team), calls = posInt(i.calls);
  var appsM  = posInt(i.apps), repIn = posInt(i.appsRep);
  var subst  = Math.min(100, Math.max(0, +i.subst || 0));
  var rec    = Math.max(0, +i.rec || 0);
  var uplift = Math.max(0, +i.uplift || 0);

  /* A. Herramientas: 12 × gasto sustituible al mes (si no lo sabe, el % estimado de su gasto en aplicaciones; nunca más que el total) */
  var subM      = i.appsUnknown ? Math.round(appsM * CFG.unknownShare) : Math.min(appsM, repIn);
  var toolsFull = subM * 12;
  var tools     = Math.round(toolsFull * subst / 100);

  /* B. Análisis externo: tramo de consultores × % que Fivo sustituye, o valor de referencia si no tiene */
  var ts = tierSet(calls);
  var tier = (i.hasConsult === "yes" && i.consultTier >= 0 && i.consultTier <= 3) ? Math.round(i.consultTier) : -1;
  var auditKind = "off", audit = 0, tierValue = 0;
  if(i.audOn){
    if(tier >= 0){ auditKind = "own"; tierValue = ts.values[tier]; audit = Math.round(tierValue * CFG.consultantReplace); }
    else { auditKind = "ref"; audit = Math.min(CFG.auditRefMax, Math.max(CFG.auditRefMin, roundTo(team * CFG.auditRefPct, CFG.auditRefRound))); }
  }

  /* C. Tiempo recuperado   D. Ventas extra */
  var lossToday = Math.round(team * CFG.searchShare);
  var time      = Math.round(lossToday * rec / 100);
  var extra     = i.revOn ? Math.round(calls * uplift / 100) : 0;

  /* ÚNICA FUENTE de las cifras de dinero. La interfaz solo lee estos campos, nunca recalcula:
     save = ahorro (A+B+C) · earn = ganancia (D) · gross = bruto (save+earn) · cost = coste de Fivo del plan elegido · net = neto (gross−cost) */
  var save     = tools + audit + time;      /* "Te ahorrarías" */
  var earn     = extra;                     /* "Ganarías más" */
  var gross    = save + earn;
  var costMonthly = Math.round(people * CFG.priceMonthly * CFG.months);
  var costAnnual  = Math.round(people * CFG.priceAnnual  * CFG.months);
  var cost     = i.plan === "annual" ? costAnnual : costMonthly;
  var net      = gross - cost;

  return { reps:reps, rest:rest, people:people, team:team, calls:calls, appsM:appsM, appsRepIn:repIn, subM:subM, subst:subst, rec:rec, uplift:uplift,
    toolsFull:toolsFull, tools:tools, auditKind:auditKind, tierValue:tierValue, audit:audit,
    lossToday:lossToday, time:time, extra:extra, value:time+extra, save:save, earn:earn,
    gross:gross, cost:cost, net:net,
    costMonthly:costMonthly, costAnnual:costAnnual, netIfAnnual:gross-costAnnual,   /* para la frase del ahorro con pago anual */
    ready: people>=1 && team>0 };
}
