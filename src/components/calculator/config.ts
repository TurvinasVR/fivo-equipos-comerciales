// Parámetros de la calculadora: precios, supuestos y datos de la copia original (calculadora.fivo.info).
// Los números no se tocan: las fórmulas y los precios deben dar lo mismo que la original.
export const CFG = {
  priceMonthly: 39.99,
  priceAnnual: 29.99,
  months: 12,
  searchShare: 0.20,
  hoursWeek: 40,
  recDefault: 25,
  unknownShare: 0.20,
  consultantBoundsPct: [0.005, 0.015, 0.03],
  consultantMidPct: [0.0025, 0.01, 0.0225, 0.04],
  consultantRound: 500,
  consultantMin: 500,
  consultantFixedBounds: [2000, 6000, 15000],
  consultantFixedValues: [1000, 4000, 10500, 20000],
  consultantReplace: 0.5,
  auditRefPct: 0.01, auditRefRound: 500, auditRefMin: 1000, auditRefMax: 20000,
  upliftByReview: {no: 1.5, some: 1, yes: 0.5},
  upliftDefault: 1,
  leadEndpoint: (process.env.NEXT_PUBLIC_CALCULATOR_LEAD_ENDPOINT ?? "") as string,
  contactUrl: "https://fivo.ai/contact",
  callUrl: "https://calendly.com/joseba-fivo/llamada-con-fivo",
  callPrefill: true,
  registerUrl: "https://app.fivo.ai/{lang}/auth/register",
  abTest: false,
  showTestimonials: false,
  testimonials: [] as { name: string }[],
  showExamples: false,
  examples: [
    {label:{es:"Agencia de marketing", en:"Marketing agency"}, sector:"agency",     comerciales:4, resto:8,  gastoAnual:480000,  ingresos:1500000, revisaLlamadas:"some", consultores:null, gastoApps:1000, gastoGrabacion:400},
    {label:{es:"Inmobiliaria",         en:"Real estate agency"}, sector:"realestate", comerciales:4, resto:2,  gastoAnual:210000,  ingresos:900000,  revisaLlamadas:"no",   consultores:null, gastoApps:500,  gastoGrabacion:200},
    {label:{es:"Consultora",           en:"Consulting firm"},  sector:"services",   comerciales:8, resto:22, gastoAnual:1500000, ingresos:4500000, revisaLlamadas:"yes",  consultores:1,    gastoApps:3000, gastoGrabacion:1200}
  ],
  callDuration: null,
  defaultLang: "es",
  // Los logotipos de clientes salen del componente local (WebP), no de una dirección externa
  customerLogos: [] as { name: string; scale: number; url: string }[],
};
