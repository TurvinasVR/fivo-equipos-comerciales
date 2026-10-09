import { SCALE, FAQ_PRICE, FAQ_TRANSCRIBE } from "./shared";
import type { LandingContent, TestimonialData } from "./types";

const placeholder: TestimonialData = {
  logoOrPhoto: null,
  name: "Nombre y apellidos",
  role: "Cargo, empresa",
  quote: "Aquí va la frase del cliente, en tres líneas como máximo.",
  figure: "Cifra",
  figureLabel: "Qué mide la cifra",
};

/** Todo el texto de /equipos-comerciales. */
export const equiposComerciales: LandingContent = {
  slug: "equipos-comerciales",
  path: "/equipos-comerciales",
  thanksPath: "/gracias",
  repeatCta: true,
  ctaLines: {
    herramientas: "¿Ya trabajáis con estas herramientas? Te enseñamos cómo quedaría conectado lo vuestro.",
    problema: "Así se ve con Fivo. En la llamada lo vemos con las llamadas de tu equipo.",
    "como-funciona": "Te lo enseñamos con un caso como el tuyo en **30 minutos**.",
    pregunta: "¿Qué le preguntarías tú a las llamadas de tu equipo? Tráelo a la llamada y lo vemos.",
    prueba: "Equipos de este tamaño ya trabajan con Fivo. Mira si encaja con el tuyo.",
    faq: "¿Te queda alguna duda? Resuélvela en la llamada.",
  },

  hero: {
    label: "Para equipos comerciales de **3 o más** closers",
    title: "Descubre por qué tu mejor closer cierra el doble que el resto, y enséñaselo a los demás",
    subtitle:
      "Fivo une las llamadas de tu equipo, tu CRM y tu correo en un grafo de contexto, y te dice qué hace distinto el que cierra. Sin escuchar ni una grabación.",
    videoLabel: "Vídeo de Fivo para equipos comerciales",
    videoEnd: { title: "¿Lo vemos con tu equipo?", replay: "Volver a ver" },
    proof: "logos",
    trust: "Cumple RGPD y SOC 2. Datos alojados en la UE. Tú decides quién ve cada llamada.",
  },

  tools: {
    ids: ["hubspot", "claude", "zoom", "meet", "teams", "slack", "notion", "drive", "chatgpt"],
    title: "Se conecta a lo que ya usas, y a tu IA",
    intro: "Conecta el grafo a Claude o ChatGPT y tu IA conocerá a tu equipo sin que se lo expliques.",
    srList: "Zoom, Google Meet, Microsoft Teams, HubSpot, Slack, Notion, Google Drive, y Claude y ChatGPT vía MCP.",
  },

  problem: {
    title: { muted: "Diriges a tu equipo con dos números: ", main: "llamadas hechas y ventas cerradas" },
    pains: [
      { text: "No sabes qué pasa dentro de la llamada.", group: "calls" },
      { text: "Das feedback de memoria, porque no tienes horas para escuchar grabaciones.", group: "docs" },
      { text: "El closer que no cierra sigue recibiendo leads que te cuestan dinero.", group: "crm" },
    ],
    groups: [
      {
        id: "calls",
        label: "Llamadas",
        cx: 0.24,
        cy: 0.28,
        ring: [170, 150],
        labelTop: 82,
        nodes: [
          { f: "zoom.svg", dx: -34, dy: -22 },
          { f: "googlemeet.svg", dx: 30, dy: -34 },
          { f: "teams.svg", dx: 6, dy: 34 },
        ],
      },
      { id: "crm", label: "CRM", cx: 0.76, cy: 0.24, ring: [86, 86], labelTop: 54, nodes: [{ f: "hubspot.svg", dx: 0, dy: 0 }] },
      {
        id: "docs",
        label: "Mensajes y documentos",
        cx: 0.6,
        cy: 0.68,
        ring: [170, 150],
        labelTop: 82,
        nodes: [
          { f: "slack.svg", dx: -54, dy: -10 },
          { f: "notion.svg", dx: 4, dy: 18 },
          { f: "googledrive.svg", dx: 58, dy: -16 },
        ],
      },
    ],
    compare: true,
    rows: [
      { topic: "Saber qué pasa en las llamadas", today: "Escuchar grabaciones una a una", fivo: "Preguntar y recibir la respuesta con las llamadas delante" },
      { topic: "Comparar closers", today: "Llamadas hechas y ventas cerradas", fivo: "Qué dice y hace cada uno, y en qué se diferencia del que más cierra" },
      { topic: "Feedback al equipo", today: "De memoria y con opiniones", fivo: "Con ejemplos concretos de sus propias llamadas" },
      { topic: "Datos de la venta", today: "Repartidos entre CRM, calendario, correo y cobros", fivo: "Unidos en un solo sitio" },
    ],
  },

  how: {
    steps: [
      {
        title: "Conectas tus herramientas.",
        desc: "Escena animada: los logotipos de Zoom, Google Meet, Microsoft Teams, HubSpot, Slack, Notion, Google Drive, Claude y ChatGPT aparecen sueltos y se van conectando uno a uno con el nodo central de Fivo, hasta formar un grafo unido.",
      },
      {
        title: "Cada llamada entra en el grafo: qué objeciones salieron, cómo se respondieron y qué se acordó.",
        desc: "Escena animada de ejemplo: en una videollamada con cuatro participantes entra el asistente de Fivo. Lo que se dice se convierte en tres nodos, objeción, respuesta y acuerdo, que se conectan entre sí y vuelan al grafo.",
      },
      {
        title: "Preguntas a Fivo, o a tu propia IA, y te responde con las llamadas delante.",
        desc: "Escena animada de ejemplo: en el chat se escribe la pregunta «¿Qué hace Luis en las llamadas que cierra y no en las que pierde?». Se iluminan en el grafo las llamadas de donde sale la respuesta. La respuesta dice que, cuando cierra, Luis deja que el cliente cuente su situación y acuerda el siguiente paso con fecha, y que, cuando pierde, presenta la solución antes de entender el problema. Cada referencia está enlazada con su llamada.",
      },
    ],
    scene: {
      callTitle: "Videollamada",
      initials: ["M", "L", "A", "R"],
      assistantCaption: "Asistente de Fivo",
      transcript: [
        { who: "Objeción", text: "el precio frente a otra herramienta" },
        { who: "Respuesta", text: "pregunta cuánto cuesta hoy el problema" },
        { who: "Acuerdo", text: "siguiente paso con fecha de decisión" },
      ],
      combineLabel: "Se conectan entre sí",
      question: "¿Qué hace Luis en las llamadas que cierra y no en las que pierde?",
      answer: [
        "En las llamadas que cierra, Luis deja que el cliente cuente su situación y acuerda el siguiente paso con fecha.",
        "En las que pierde, presenta la solución antes de entender el problema y deja el cierre abierto.",
      ],
      chips: [
        { text: "Llamada 1, cierra", tone: "win" },
        { text: "Llamada 2, cierra", tone: "win" },
        { text: "Llamada 3, pierde", tone: "lose" },
      ],
    },
  },

  ask: {
    title: "Pregúntale a tus llamadas",
    placeholder: "Pregunta a tus llamadas",
    searching: "Buscando en las llamadas",
    graphAria: "Grafo de llamadas: se iluminan las llamadas de donde sale la respuesta.",
    cta: "Quiero ver esto con mis llamadas",
    questions: [
      {
        id: "marta",
        q: "¿Qué objeciones le hacen más a Marta y cómo las responde?",
        title: "Las objeciones que más aparecen en las llamadas de Marta.",
        used: [0, 2, 4],
        calls: [
          { title: "Llamada con objeción de precio", note: "Fuente de la fila Precio" },
          { title: "Llamada con «lo vemos más adelante»", note: "Fuente de la fila Momento de decidir" },
          { title: "Llamada comparando herramientas", note: "Fuente de la fila Comparación" },
        ],
        sr: "Las objeciones que más aparecen en las llamadas de Marta son el precio, el momento de decidir y la comparación con otra herramienta. Ante el precio, pregunta cuánto le cuesta hoy el problema y vuelve al valor. Ante el momento de decidir, propone fijar una fecha de decisión antes de colgar. Ante la comparación, compara por el resultado en llamada y no por funciones. Ejemplo.",
        fallback:
          "Las objeciones que más aparecen son el precio, el momento de decidir y la comparación con otra herramienta. Ante el precio, pregunta cuánto le cuesta hoy el problema y vuelve al valor. Ante «lo vemos más adelante», propone fijar una fecha de decisión antes de colgar. Ejemplo.",
        answer: {
          kind: "tags",
          rows: [
            { tag: "Precio", line: "Pregunta cuánto le cuesta hoy el problema y vuelve al valor." },
            { tag: "Momento de decidir", line: "Propone fijar una fecha de decisión antes de colgar." },
            { tag: "Comparación con otra herramienta", line: "Compara por el resultado en llamada, no por funciones." },
          ],
        },
      },
      {
        id: "luis",
        q: "¿Qué hace Luis en las llamadas que cierra y no en las que pierde?",
        title: "Lo que cambia entre sus llamadas que cierra y las que pierde.",
        used: [1, 3, 5],
        calls: [
          { title: "Llamada que cierra", note: "Fuente de «Cuando cierra»" },
          { title: "Llamada que cierra", note: "Fuente de «Cuando cierra»" },
          { title: "Llamada que pierde", note: "Fuente de «Cuando pierde»" },
        ],
        sr: "Cuando cierra, Luis deja que el cliente cuente su situación, resume el problema con sus palabras y acuerda el siguiente paso con fecha. Cuando pierde, presenta la solución antes de entender el problema, deja el cierre abierto y no fija fecha de decisión. Ejemplo.",
        fallback:
          "Cuando cierra, deja que el cliente cuente su situación, resume el problema con sus palabras y acuerda el siguiente paso con fecha. Cuando pierde, presenta la solución antes de entender el problema y deja el cierre abierto. Ejemplo.",
        answer: {
          kind: "columns",
          columns: [
            {
              h: "Cuando cierra",
              tone: "win",
              items: ["Deja que el cliente cuente su situación", "Resume el problema con sus palabras", "Acuerda el siguiente paso con fecha"],
            },
            {
              h: "Cuando pierde",
              tone: "lose",
              items: ["Presenta la solución antes de entender el problema", "Deja el cierre abierto", "No fija fecha de decisión"],
            },
          ],
        },
      },
      {
        id: "tasa",
        q: "¿Cuál es la tasa de cierre de cada closer este mes y por qué ha cambiado?",
        title: "Este mes sube la tasa de cierre de Luis y baja la de Marta.",
        used: [0, 3, 4],
        calls: [
          { title: "Llamada de Luis, este mes", note: "Fuente de la subida" },
          { title: "Llamada de Marta, este mes", note: "Fuente de la bajada" },
          { title: "Llamada de Marta, canal nuevo", note: "Fuente de la causa" },
        ],
        sr: "Este mes sube la tasa de cierre de Luis y baja la de Marta. Luis ha empezado a proponer fecha de decisión en la propia llamada. Marta ha recibido más leads de un canal nuevo, donde la objeción de precio aparece antes. Ejemplo.",
        fallback:
          "Sube la de Luis y baja la de Marta. Luis ha empezado a proponer fecha de decisión en la propia llamada, y Marta ha recibido más leads de un canal nuevo, donde la objeción de precio aparece antes. Ejemplo.",
        answer: {
          kind: "trend",
          up: "Luis",
          down: "Marta",
          bullets: [
            { who: "Luis: ", text: "propone fecha de decisión en la propia llamada.", tone: "win" },
            { who: "Marta: ", text: "recibe más leads de un canal nuevo, donde el precio aparece antes.", tone: "lose" },
          ],
        },
      },
    ],
  },

  proof: {
    title: "Fivo ya funciona a esta escala",
    scale: SCALE,
    logos: false,
    testimonials: [placeholder, placeholder, placeholder],
  },

  agenda: {
    title: "Qué pasa en los 30 minutos",
    segments: [
      { range: "0 a 10 min", text: "Vemos cómo trabaja hoy tu equipo." },
      { range: "10 a 25 min", text: "Te enseñamos Fivo con un caso como el tuyo." },
      { range: "25 a 30 min", text: "Te decimos con claridad si te encaja o no." },
    ],
    srList: [
      "Vemos cómo trabaja hoy tu equipo.",
      "Te enseñamos Fivo con un caso como el tuyo.",
      "Te decimos con claridad si te encaja o no.",
      "30 minutos, por videollamada, sin compromiso. No es para ti si vendes tú solo o con un único closer.",
    ],
    askText: "¿Qué hace distinto el que cierra?",
    fork: ["Encaja", "No encaja"],
    facts: ["30 minutos", "Por videollamada", "Sin compromiso"],
    note: "No es para ti si vendes tú solo o con un único closer.",
  },

  booking: {
    title: "Elige hora para tu llamada",
    freeTitle: "Gracias por tu interés",
    sub: "Te lleva **30 segundos**.",
    next: ["Eliges día y hora en el calendario.", "Ves la confirmación de tu cita.", "Hablamos **30 minutos** por videollamada."],
    free: {
      headline: "Esta llamada es para equipos de **3 o más** closers.",
      text: "Con uno o dos closers, lo mejor es que empieces gratis por tu cuenta. Si tu equipo crece, aquí estaremos.",
      cta: "Empieza gratis",
    },
    form: {
      emailLabel: "Email de trabajo",
      whatsappHelp: "Con prefijo si no es de España.\nPor si necesitamos cambiar la hora de la llamada.",
      choices: [
        {
          name: "closers",
          label: "Número de closers",
          control: "cards",
          options: "closers",
          layout: "2/4",
          help: "Esta llamada es para equipos de **3 o más** closers.",
          error: "Elige cuántos closers sois.",
          summary: "{label} closers",
        },
        { name: "crm", label: "CRM que usáis", control: "select", options: "crm", error: "Elige el CRM que usáis.", placeholder: "Elige una opción", summary: "{label}" },
        { name: "rol", label: "Tu rol", control: "cards", options: "rol", layout: "1/3", error: "Elige tu rol.", summary: "{label}" },
      ],
      submitHint: "Al enviar, eliges día y hora en el calendario.",
      analytics: { submit: { closers: "closers", crm: "crm", rol: "rol" }, booked: { closers: "closers" } },
    },
  },

  faq: {
    title: "Preguntas frecuentes",
    items: [
      FAQ_TRANSCRIBE,
      {
        q: "¿Mis closers tienen que cambiar algo de cómo trabajan?",
        a: "El asistente de Fivo entra en las reuniones de Zoom, Google Meet y Microsoft Teams y las añade al grafo. Fivo se conecta a las herramientas que ya usa el equipo.",
      },
      {
        q: "¿El cliente sabe que la llamada se graba?",
        a: "",
      },
      {
        q: "¿Dónde se guardan las llamadas y quién puede verlas?",
        a: "Los datos se alojan en la UE y van cifrados en tránsito y en reposo. Tú decides quién ve cada llamada, con control de acceso por usuario y equipo. Fivo cumple RGPD y SOC 2.",
      },
      {
        q: "¿Con qué CRM y herramientas de videollamada funciona?",
        a: "Entra en las reuniones de Zoom, Google Meet y Microsoft Teams. Se integra con Slack, Notion, Google Drive, HubSpot, CRM, Zapier y webhooks. Además, su memoria se conecta por MCP a Claude, ChatGPT y Gemini.",
      },
      {
        q: "¿Cuánto tarda en estar funcionando?",
        a: "",
      },
      FAQ_PRICE,
    ],
  },

  closing: { title: "Tu próximo mejor closer ya está en tu equipo. Solo le falta saber qué cambiar." },

  thanks: {
    title: "Tu llamada está agendada",
    prepTitle: "Para aprovechar la llamada",
    prepIntro: "Ten a mano:",
    prep: ["Qué herramientas usa tu equipo", "Cuántos closers tienes", "Qué quieres resolver primero"],
    videoLabel: "Vídeo de 60 segundos antes de la llamada",
    ics: { prodid: "-//Fivo//Llamada equipos comerciales//ES" },
  },
};
