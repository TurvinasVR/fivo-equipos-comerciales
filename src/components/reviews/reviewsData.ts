// Opiniones tal cual las tenía la calculadora original (calculadora.fivo.info): mismas 10, mismas palabras. No editar.
export type Review = { name: string; place: string; sector: string; text: string; stars: number; translated?: boolean };

export const REVIEWS: Review[] = [
  {
    "name": "Javier Martínez",
    "place": "España",
    "sector": "Equipos comerciales",
    "text": "Fivo nos ayuda a tener una visión mucho más clara de lo que ocurre en nuestro equipo comercial. Tener las conversaciones y los datos organizados en un mismo sitio facilita muchísimo el seguimiento.",
    "stars": 5
  },
  {
    "name": "Laura Fernández",
    "place": "España",
    "sector": "Infoproductores",
    "text": "Lo que más me gusta es poder centralizar la información de las reuniones, tareas y herramientas de trabajo. Es mucho más fácil recuperar información importante sin perder tiempo buscando.",
    "stars": 5
  },
  {
    "name": "Alejandro Ruiz",
    "place": "España",
    "sector": "Empresas tecnológicas",
    "text": "La idea del grafo de memoria es especialmente interesante. Poder relacionar tareas, conversaciones y documentos permite entender mejor el contexto de lo que sucede en la empresa.",
    "stars": 5
  },
  {
    "name": "Marta Sánchez",
    "place": "España",
    "sector": "Gestión empresarial",
    "text": "Tener la información de diferentes herramientas conectada facilita el trabajo diario. Fivo tiene mucho potencial para reducir el tiempo que dedicamos a buscar datos y reconstruir conversaciones antiguas.",
    "stars": 5
  },
  {
    "name": "Daniel López",
    "place": "España",
    "sector": "Dirección comercial",
    "text": "La posibilidad de analizar reuniones comerciales y consultar información sobre el rendimiento del equipo es una de las funciones más interesantes de Fivo. Ayuda a tomar decisiones con más contexto.",
    "stars": 5
  },
  {
    "name": "Elena García",
    "place": "España",
    "sector": "Agencias y marketing",
    "text": "Me parece especialmente útil conectar herramientas como Notion, Drive y las aplicaciones de gestión de proyectos. Tener toda esa información relacionada abre muchas posibilidades para trabajar de forma más eficiente.",
    "stars": 5
  },
  {
    "name": "Pablo Romero",
    "place": "España",
    "sector": "SaaS y tecnología",
    "text": "La conexión con asistentes de IA mediante MCP es un punto diferencial. Poder consultar información de la empresa sin tener que explicar todo el contexto desde cero puede ahorrar muchísimo trabajo.",
    "stars": 5
  },
  {
    "name": "Michael Carter",
    "place": "Estados Unidos",
    "sector": "Productividad empresarial",
    "text": "Fivo aborda un problema importante: el conocimiento de la empresa está disperso en demasiadas herramientas. Conectar esa información facilita encontrar respuestas y entender el contexto detrás de las decisiones.",
    "stars": 5,
    "translated": true
  },
  {
    "name": "Emily Johnson",
    "place": "Estados Unidos",
    "sector": "Equipos comerciales",
    "text": "La combinación de resúmenes de reuniones, herramientas de trabajo conectadas y conocimiento de empresa consultable es convincente. Podría ayudar a los responsables comerciales a identificar patrones y a entrenar mejor a sus equipos.",
    "stars": 5,
    "translated": true
  },
  {
    "name": "Sebastián Rodríguez",
    "place": "Latinoamérica",
    "sector": "Infoproductos y formación online",
    "text": "Fivo me parece una propuesta muy interesante para empresas que necesitan conectar reuniones, tareas, clientes y documentación. Tener una memoria centralizada del negocio puede facilitar mucho la organización y el crecimiento.",
    "stars": 5
  }
];
