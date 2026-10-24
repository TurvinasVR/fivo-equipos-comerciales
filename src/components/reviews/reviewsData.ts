// Opiniones de clientes: las 12 que facilita Fivo, en su orden y con sus palabras exactas. No editar los textos.
// Sin país ni sector: no hay datos para ellas. Las usan la home y /gracias (bajo el resultado de la calculadora).
export type Review = { name: string; text: string; stars: number };

export const REVIEWS: Review[] = [
  { name: "Javier M.", stars: 5, text: "Antes tenía que estar preguntando todo el rato cómo había ido cada llamada. Ahora puedo revisarlo yo." },
  { name: "Carlos R.", stars: 5, text: "Tenemos HubSpot, Drive y mil herramientas más. Me gusta que la información no se quede aislada en cada una." },
  { name: "Miguel G.", stars: 5, text: "Lo del grafo me parecía un poco abstracto al principio, pero tiene sentido cuando ves cómo conecta toda la información." },
  { name: "Daniel F.", stars: 5, text: "Pensaba que el problema era que faltaban leads, pero revisando las llamadas he encontrado otras cosas." },
  { name: "Sergio T.", stars: 5, text: "Hemos conectado todas nuestras herramientas y ahora puedo consultar toda la información de la empresa desde Claude. Es una pasada." },
  { name: "Alberto S.", stars: 5, text: "Lo interesante es que no solo guarda la información, sino que relaciona las tareas con las conversaciones y sabes por qué se tomó cada decisión." },
  { name: "Javier M.", stars: 5, text: "Ahora veo qué hacen diferente los closers que más venden y puedo usar sus llamadas para ayudar a mejorar a los que menos convierten." },
  { name: "Daniel R.", stars: 5, text: "Antes me faltaba tiempo para revisar las llamadas de todos. Ahora puedo detectar mejor dónde falla cada comercial y trabajar con él para corregirlo." },
  { name: "Pablo M.", stars: 5, text: "Ahora puedo preguntarle cosas a la IA sobre el negocio sin empezar explicándole todo desde cero." },
  { name: "Marta G.", stars: 5, text: "Los resúmenes de las llamadas están bien, pero para mí lo mejor es que esa información luego sirve para otras consultas." },
  { name: "Laura G.", stars: 5, text: "Lo conectamos con las herramientas que ya usamos y no tenemos que cambiar nuestra forma de trabajar." },
  { name: "Fernando L.", stars: 5, text: "Me ha gustado poder entender por qué una oportunidad se quedó parada sin preguntar a cinco personas." },
];
