import { D, STATIC } from "./texts";

/**
 * Lógica de la calculadora: copia fiel de la de calculadora.fivo.info (fórmulas, precios, redondeos y enlace
 * compartible). Las cifras de dinero salen todas de `compute`; la interfaz solo las lee.
 */

export const CFG = {
  priceMonthly: 39.99,
  priceAnnual: 29.99,
  months: 12,
  searchShare: 0.2,
  hoursWeek: 40,
  recDefault: 25,
  unknownShare: 0.2,
  consultantBoundsPct: [0.005, 0.015, 0.03],
  consultantMidPct: [0.0025, 0.01, 0.0225, 0.04],
  consultantRound: 500,
  consultantMin: 500,
  consultantFixedBounds: [2000, 6000, 15000],
  consultantFixedValues: [1000, 4000, 10500, 20000],
  consultantReplace: 0.5,
  auditRefPct: 0.01,
  auditRefRound: 500,
  auditRefMin: 1000,
  auditRefMax: 20000,
  upliftByReview: { no: 1.5, some: 1, yes: 0.5 } as Record<string, number>,
  upliftDefault: 1,
  /** Destino de "Enviarme mi informe". Vacío, como en la original: el formulario queda oculto. */
  leadEndpoint: process.env.NEXT_PUBLIC_CALCULATOR_LEAD_ENDPOINT ?? "",
  privacyUrl: "https://fivo.ai/privacy-policy",
};

export type CalcState = {
  v: number;
  sector: string;
  reps: number;
  rest: number;
  team: number;
  calls: number;
  recCalls: string;
  hasConsult: string;
  consultTier: number;
  optimize: string;
  apps: number;
  appsRep: number;
  appsUnknown: boolean;
  rec: number;
  uplift: number;
  upliftSet: boolean;
  subst: number;
  plan: "monthly" | "annual";
  audOn: boolean;
  revOn: boolean;
  step: number;
  lang: string;
};

export const LAST = 4;

/** Mismo orden de claves que la original: el enlace compartido es el mismo. */
export function initialState(): CalcState {
  return {
    v: 2,
    sector: "",
    reps: 3,
    rest: 7,
    team: 300000,
    calls: 600000,
    recCalls: "",
    hasConsult: "",
    consultTier: -1,
    optimize: "",
    apps: 600,
    appsRep: 350,
    appsUnknown: false,
    rec: CFG.recDefault,
    uplift: CFG.upliftDefault,
    upliftSet: false,
    subst: 100,
    plan: "monthly",
    audOn: true,
    revOn: true,
    step: 1,
    lang: "es",
  };
}

/* ---------- textos */

const fillVars = (): Record<string, number> => ({
  search: Math.round(CFG.searchShare * 100),
  unknown: Math.round(CFG.unknownShare * 100),
  replace: Math.round(CFG.consultantReplace * 100),
  auditPct: Math.round(CFG.auditRefPct * 100),
  rec: CFG.recDefault,
  upNo: CFG.upliftByReview.no,
  upSome: CFG.upliftByReview.some,
  upYes: CFG.upliftByReview.yes,
  annualSave: Math.round((1 - CFG.priceAnnual / CFG.priceMonthly) * 100),
});

/** Texto estático de la calculadora por clave (con los marcadores {…} resueltos, como en la original). */
export function S(key: string): string {
  const v = STATIC[key];
  if (v === undefined) return "";
  const K = fillVars();
  return String(v).replace(/\{(\w+)\}/g, (m, k: string) => {
    if (k === "auditMin") return eur(CFG.auditRefMin);
    if (k === "auditMax") return eur(CFG.auditRefMax);
    if (k === "priceM") return eur2(CFG.priceMonthly);
    return K[k] !== undefined ? pct(K[k]) : m;
  });
}

/** Texto dinámico con variables {x}. */
export function tr(k: string, v?: Record<string, string | number>): string {
  const s = D[k] !== undefined ? D[k] : "";
  return String(s).replace(/\{(\w+)\}/g, (_, x: string) => (v && v[x] !== undefined ? String(v[x]) : ""));
}

/* ---------- formatos (español) */

export function roundTo(x: number, step: number) {
  return Math.round(x / step) * step;
}
export function posInt(v: unknown, max?: number) {
  return Math.min(max || 1e12, Math.max(0, Math.round(+(v as number) || 0)));
}
export function group(n: number) {
  return String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
export function eur(n: number) {
  const neg = n < 0 ? "−" : "";
  return neg + group(n) + " €";
}
export function eur2(n: number) {
  const s = (Math.round(n * 100) / 100).toFixed(2);
  return s.replace(".", ",") + " €";
}
function numDec(x: string) {
  return x.replace(".", ",");
}
export function dec(n: number) {
  return numDec((Math.round(n * 10) / 10).toString());
}
export function pct(n: number) {
  return dec(n) + " %";
}
export function parse(v: unknown) {
  const s = String(v).replace(/[^\d]/g, "");
  return s ? parseInt(s, 10) : 0;
}
export function peopleW(n: number) {
  return n === 1 ? "persona" : "personas";
}
export function usersN(n: number) {
  return group(n) + " " + (n === 1 ? "usuario" : "usuarios");
}

/* ---------- cálculo */

export function tierSet(calls: number) {
  calls = posInt(calls);
  const b = CFG.consultantBoundsPct.map((p) => roundTo(calls * p, CFG.consultantRound));
  if (b[0] > 0 && b[0] < b[1] && b[1] < b[2]) {
    return {
      mode: "pct" as const,
      bounds: b,
      values: CFG.consultantMidPct.map((p) => Math.max(CFG.consultantMin, roundTo(calls * p, CFG.consultantRound))),
    };
  }
  return { mode: "fixed" as const, bounds: CFG.consultantFixedBounds.slice(), values: CFG.consultantFixedValues.slice() };
}

export type CalcInput = Pick<
  CalcState,
  "reps" | "rest" | "team" | "calls" | "apps" | "appsRep" | "appsUnknown" | "subst" | "rec" | "uplift" | "hasConsult" | "consultTier" | "audOn" | "revOn" | "plan"
>;

export function compute(i: CalcInput) {
  const reps = posInt(i.reps, 1e5);
  const rest = posInt(i.rest, 1e5);
  const people = reps + rest;
  const team = posInt(i.team);
  const calls = posInt(i.calls);
  const appsM = posInt(i.apps);
  const repIn = posInt(i.appsRep);
  const subst = Math.min(100, Math.max(0, +i.subst || 0));
  const rec = Math.max(0, +i.rec || 0);
  const uplift = Math.max(0, +i.uplift || 0);

  /* A. Herramientas: 12 × gasto sustituible al mes (si no lo sabe, el % estimado de su gasto en aplicaciones; nunca más que el total) */
  const subM = i.appsUnknown ? Math.round(appsM * CFG.unknownShare) : Math.min(appsM, repIn);
  const toolsFull = subM * 12;
  const tools = Math.round((toolsFull * subst) / 100);

  /* B. Análisis externo: tramo de consultores × % que Fivo sustituye, o valor de referencia si no tiene */
  const ts = tierSet(calls);
  const tier = i.hasConsult === "yes" && i.consultTier >= 0 && i.consultTier <= 3 ? Math.round(i.consultTier) : -1;
  let auditKind: "off" | "own" | "ref" = "off";
  let audit = 0;
  let tierValue = 0;
  if (i.audOn) {
    if (tier >= 0) {
      auditKind = "own";
      tierValue = ts.values[tier];
      audit = Math.round(tierValue * CFG.consultantReplace);
    } else {
      auditKind = "ref";
      audit = Math.min(CFG.auditRefMax, Math.max(CFG.auditRefMin, roundTo(team * CFG.auditRefPct, CFG.auditRefRound)));
    }
  }

  /* C. Tiempo recuperado   D. Ventas extra */
  const lossToday = Math.round(team * CFG.searchShare);
  const time = Math.round((lossToday * rec) / 100);
  const extra = i.revOn ? Math.round((calls * uplift) / 100) : 0;

  const save = tools + audit + time; /* "Te ahorrarías" */
  const earn = extra; /* "Ganarías más" */
  const gross = save + earn;
  const costMonthly = Math.round(people * CFG.priceMonthly * CFG.months);
  const costAnnual = Math.round(people * CFG.priceAnnual * CFG.months);
  const cost = i.plan === "annual" ? costAnnual : costMonthly;
  const net = gross - cost;

  return {
    reps, rest, people, team, calls, appsM, appsRepIn: repIn, subM, subst, rec, uplift,
    toolsFull, tools, auditKind, tierValue, audit,
    lossToday, time, extra, value: time + extra, save, earn,
    gross, cost, net,
    costMonthly, costAnnual, netIfAnnual: gross - costAnnual,
    ready: people >= 1 && team > 0,
  };
}
export type CalcResult = ReturnType<typeof compute>;

export function monthlyCost(r: CalcResult, plan: CalcState["plan"]) {
  return Math.round(r.people * (plan === "annual" ? CFG.priceAnnual : CFG.priceMonthly) * 100) / 100;
}

/* ---------- desglose (modal "Cómo se calcula tu resultado") */

export type TblRow =
  | { kind: "group"; label: string }
  | { kind: "item"; label: string; note: string; tag: "own" | "ref" | "est"; tagText: string; amt: string }
  | { kind: "sub" | "total" | "cost"; label: string; note?: string; amt: string; neg?: boolean };

export function buildTable(r: CalcResult, state: Pick<CalcState, "plan" | "revOn" | "appsUnknown">) {
  const neg = r.net < 0;
  const TAG = { own: tr("tagOwn"), ref: tr("tagRef"), est: tr("tagEst") };
  let toolsNote = state.appsUnknown
    ? tr("toolsEst", { pc: pct(Math.round(CFG.unknownShare * 100)), a: eur(r.appsM), m: eur(r.subM) })
    : tr("toolsOwn", { m: eur(r.subM) });
  if (r.subst !== 100) toolsNote += tr("toolsPart", { p: pct(Math.round(r.subst)) });

  type Item = { label: string; note: string; tag: "own" | "ref" | "est"; amt: number };
  const rowsA: Item[] = [{ label: tr("toolsLabel"), note: toolsNote, tag: state.appsUnknown ? "est" : "own", amt: r.tools }];
  const rowsB: Item[] = [];
  if (r.auditKind === "own")
    rowsB.push({ label: tr("auditOwnLabel"), note: tr("auditOwnNote", { x: eur(r.tierValue), p: pct(Math.round(CFG.consultantReplace * 100)) }), tag: "own", amt: r.audit });
  else if (r.auditKind === "ref")
    rowsB.push({
      label: tr("auditRefLabel"),
      note: tr("auditRefNote", { pc: pct(Math.round(CFG.auditRefPct * 100)), team: eur(r.team), min: eur(CFG.auditRefMin), max: eur(CFG.auditRefMax) }),
      tag: "ref",
      amt: r.audit,
    });
  const rowsC: Item[] = [
    { label: tr("timeLabel"), note: tr("timeNote", { p: pct(r.rec), loss: eur(r.lossToday), n: group(r.people), pl: peopleW(r.people), team: eur(r.team) }), tag: "est", amt: r.time },
  ];
  const rowsD: Item[] = state.revOn ? [{ label: tr("extraLabel"), note: tr("extraNote", { p: pct(r.uplift), x: eur(r.calls) }), tag: "est", amt: r.extra }] : [];

  const item = (x: Item): TblRow => ({ kind: "item", label: x.label, note: x.note, tag: x.tag, tagText: TAG[x.tag], amt: eur(x.amt) });
  const hasB = rowsB.length > 0;
  const saveParts = hasB ? "A + B + C" : "A + C";
  const totalParts = state.revOn ? saveParts + " + D" : saveParts;
  const priceTxt =
    state.plan === "annual"
      ? tr("priceA", { p: eur2(CFG.priceAnnual), m: eur2(CFG.priceMonthly), d: pct(Math.round((1 - CFG.priceAnnual / CFG.priceMonthly) * 100)) })
      : tr("priceM", { p: eur2(CFG.priceMonthly) });

  const rows: TblRow[] = [{ kind: "group", label: tr("gA") }, ...rowsA.map(item), { kind: "sub", label: tr("subtotal", { l: "A" }), amt: eur(r.tools) }];
  if (hasB) rows.push({ kind: "group", label: tr("gB") }, ...rowsB.map(item), { kind: "sub", label: tr("subtotal", { l: "B" }), amt: eur(r.audit) });
  rows.push(
    { kind: "group", label: tr("gC") },
    ...rowsC.map(item),
    { kind: "sub", label: tr("subtotal", { l: "C" }), amt: eur(r.time) },
    { kind: "sub", label: tr("saveRow", { parts: saveParts }), amt: eur(r.save) },
  );
  if (state.revOn) rows.push({ kind: "group", label: tr("gD") }, ...rowsD.map(item), { kind: "sub", label: tr("earnRow"), amt: eur(r.earn) });
  rows.push(
    { kind: "sub", label: tr("totalRow", { parts: totalParts }), amt: eur(r.gross) },
    { kind: "cost", label: tr("costRow"), note: tr("costNote", { us: usersN(r.people), price: priceTxt, mode: tr(state.plan === "annual" ? "modeA" : "modeM") }), amt: eur(-r.cost) },
    { kind: "total", label: tr("netRow"), note: tr("netNote"), amt: eur(r.net), neg },
  );

  const all = rowsA.concat(rowsB, rowsC, rowsD);
  const sumRows = all.reduce((a, s) => a + s.amt, 0);
  const okTools = r.subst !== 100 || r.tools === r.subM * 12;
  const ok = sumRows === r.gross && r.save + r.earn === r.gross && r.tools + r.audit + r.time === r.save && r.gross - r.cost === r.net && okTools;
  const check = ok
    ? tr("chkOkHead") + (r.subst === 100 ? tr("chkTools", { t: eur(r.tools), m: eur(r.subM) }) : "") + tr("chkTail", { lines: eur(sumRows), ben: eur(r.gross), cost: eur(r.cost), net: eur(r.net) })
    : tr("chkBad");
  return { rows, check, checkOk: ok };
}

/* ---------- enlace compartible (#c=…): mismo formato que la original */

export const SECTORS = ["", "tech", "services", "agency", "realestate", "finance", "health", "education", "industry", "retail", "other"];
const ENUM: Record<string, string[]> = { recCalls: ["", "no", "some", "yes"], hasConsult: ["", "no", "yes"], optimize: ["", "yes", "maybe", "no"] };

export function encodeState(state: CalcState): string {
  try {
    return "c=" + btoa(unescape(encodeURIComponent(JSON.stringify(state)))).replace(/=+$/, "");
  } catch {
    return "";
  }
}

function clampNum(v: unknown, lo: number, hi: number) {
  let n = +(v as number);
  if (!isFinite(n)) n = lo;
  return Math.min(hi, Math.max(lo, n));
}

/** Estado a partir del hash de la URL, o null si no lleva un cálculo válido. */
export function decodeState(hash: string): CalcState | null {
  const m = hash.match(/c=([A-Za-z0-9+/_-]+)/);
  if (!m) return null;
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(m[1])))) as Record<string, unknown>;
    if (!o || typeof o !== "object") return null;
    const state = initialState() as unknown as Record<string, unknown>;
    const legacy = o.v === undefined;
    Object.keys(state).forEach((k) => {
      if (o[k] !== undefined && typeof o[k] === typeof state[k]) state[k] = o[k];
    });
    if (legacy) {
      if (typeof o.people === "number") {
        state.reps = 0;
        state.rest = o.people;
      }
      if (typeof o.loom === "number" || typeof o.others === "number") {
        const t = Math.round(((+(o.loom as number) || 0) + (+(o.others as number) || 0)) / 12);
        state.apps = t;
        state.appsRep = t;
        state.appsUnknown = false;
      }
      if (typeof o.uplift === "number") state.upliftSet = true;
      if (o.step === 2) state.step = 3;
      else if (o.step === 3) state.step = 4;
    }
    (["reps", "rest"] as const).forEach((k) => (state[k] = Math.round(clampNum(state[k], 0, 1e5))));
    (["team", "calls", "apps", "appsRep"] as const).forEach((k) => (state[k] = Math.round(clampNum(state[k], 0, 1e12))));
    state.rec = clampNum(state.rec, 0, 50);
    state.uplift = clampNum(state.uplift, 0, 5);
    state.subst = clampNum(state.subst, 0, 100);
    state.consultTier = Math.round(clampNum(state.consultTier, -1, 3));
    Object.keys(ENUM).forEach((k) => {
      if (ENUM[k].indexOf(state[k] as string) < 0) state[k] = "";
    });
    if (SECTORS.indexOf(state.sector as string) < 0) state.sector = "";
    state.plan = state.plan === "annual" ? "annual" : "monthly";
    state.step = Math.round(clampNum(state.step, 1, LAST));
    state.lang = "es";
    return state as unknown as CalcState;
  } catch {
    return null;
  }
}

export function sizeBucket(n: number) {
  return n <= 2 ? "1-2" : n <= 10 ? "3-10" : "11+";
}
