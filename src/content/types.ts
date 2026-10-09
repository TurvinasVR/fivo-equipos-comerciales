import type { ToolId } from "@/lib/scene/graph";
import type { CtaPosition } from "@/components/CtaButton";

export type LandingSlug = "equipos-comerciales";

export type ScaleFigure = { figure: string; label: string; sr: string };

export type TestimonialData = {
  /** Contenido real. Mientras sea null, la tarjeta es un hueco con marcador. */
  logoOrPhoto: string | null;
  name: string;
  role: string;
  /** Segunda línea bajo el nombre (p. ej. el tamaño del equipo). */
  extra?: string;
  quote: string;
  figure: string;
  figureLabel: string;
};

/** Texto del escenario de "Cómo funciona" (videollamada y chat). Las herramientas salen de `tools.ids`. */
export type HowScene = {
  callTitle: string;
  initials: string[];
  assistantCaption: string;
  /** Lo dicho en la llamada, convertido en tres nodos. */
  transcript: { who: string; text: string }[];
  combineLabel: string;
  question: string;
  answer: string[];
  chips: { text: string; tone: "win" | "lose" }[];
};

export type ProblemGroup = {
  id: string;
  label: string;
  /** Posición del grupo (0 a 1 del escenario). */
  cx: number;
  cy: number;
  /** Tamaño del anillo discontinuo y distancia de su etiqueta. */
  ring: [number, number];
  labelTop: number;
  nodes: { f: string; dx: number; dy: number }[];
};

export type AskAnswer =
  | { kind: "tags"; rows: { tag: string; freq?: string; line: string }[] }
  | { kind: "columns"; columns: { h: string; tone: "win" | "lose"; items: string[] }[] }
  | { kind: "trend"; up: string; down: string; bullets: { who: string; text: string; tone: "win" | "lose" }[] }
  | { kind: "timeline"; events: { label: string; detail: string }[]; nowLabel: string; now: string };

export type AskQuestion = {
  id: string;
  q: string;
  title: string;
  /** Nodos de llamadas (0 a 5) que sustentan la respuesta. */
  used: number[];
  calls: { title: string; note?: string; tone?: "win" | "lose" }[];
  /** Nombre de cada ficha de fuente ("Llamada" por defecto). */
  sourceLabel?: string;
  /** Respuesta completa para lectores de pantalla. */
  sr: string;
  /** Respuesta corta, antes de que cargue la demo. */
  fallback: string;
  answer: AskAnswer;
};

export type ChoiceFieldContent = {
  name: string;
  label: string;
  control: "cards" | "select";
  /** Clave de la lista de opciones en src/config/qualification.ts. */
  options: string;
  /** Rejilla de las tarjetas (ver LeadForm). */
  layout?: "2/4" | "1/3" | "1/3=" | "1/2";
  help?: string;
  error: string;
  placeholder?: string;
  /** Cómo se resume en el calendario: {label} es la opción elegida. */
  summary: string;
};

export type FaqItem = {
  q: string;
  /** Respuesta publicable, solo con hechos ya publicados. Vacía = sin respuesta aún. */
  a: string;
  /** Nota solo para desarrollo: qué falta confirmar. */
  pending?: string;
};

export type LandingContent = {
  slug: LandingSlug;
  path: string;
  thanksPath: string;
  /** Repite el botón "Agendar mi llamada" al final de cada bloque. */
  repeatCta: boolean;
  /**
   * Frase corta sobre el botón de cada bloque, que enlaza lo que se acaba de ver con la llamada.
   * Sin frase para una posición, el botón va solo. `**texto**` va en negrita.
   */
  ctaLines?: Partial<Record<CtaPosition, string>>;

  hero: {
    label: string;
    title: string;
    subtitle: string;
    videoLabel: string;
    /** Pantalla final del vídeo: titular y texto del botón de repetir. Sin esto, el vídeo termina sin pantalla final. */
    videoEnd?: { title: string; replay: string };
    /** Bajo el botón: logotipos de clientes o las cifras de escala en pequeño. */
    proof: "logos" | "scale";
    trust: string;
  };

  tools: {
    ids: ToolId[];
    title: string;
    intro?: string;
    srList: string;
    after?: { main: string; small: string };
  };

  problem: {
    title: { muted?: string; main: string };
    pains: { text: string; group: string }[];
    groups: ProblemGroup[];
    rows: { topic: string; today: string; fivo: string }[];
    /** Comparación en un solo panel de filas (en vez de cuatro tarjetas). */
    compare?: boolean;
  };

  how: {
    steps: { title: string; desc: string }[];
    scene: HowScene;
  };

  ask: {
    title: string;
    placeholder: string;
    searching: string;
    graphAria: string;
    /** Enlace de texto bajo cada respuesta de la demo (lleva al formulario). Sin esto, no hay enlace. */
    cta?: string;
    questions: AskQuestion[];
  };

  who?: {
    title: string;
    yes: { label: string; items: string[] };
    no: { label: string; items: string[] };
  };

  proof: {
    title: string;
    scale: ScaleFigure[];
    logos: boolean;
    testimonials: TestimonialData[];
  };

  agenda: {
    title: string;
    segments: { range: string; text: string }[];
    srList: string[];
    askText: string;
    fork: [string, string];
    facts: string[];
    note: string;
  };

  booking: {
    title: string;
    freeTitle: string;
    sub: string;
    next: string[];
    free: { headline: string; text: string; cta: string };
    form: {
      emailLabel: string;
      whatsappHelp: string;
      choices: ChoiceFieldContent[];
      submitHint: string;
      /** Parámetros extra de form_submit y de call_booked: nombre del parámetro y campo de donde sale. */
      analytics: { submit: Record<string, string>; booked: Record<string, string> };
    };
  };

  faq: { title: string; items: FaqItem[] };

  closing: { title: string; disclaimer?: string };

  thanks: {
    title: string;
    prepTitle: string;
    prepIntro: string;
    prep: string[];
    videoLabel: string;
    ics: { prodid: string };
  };
};
