/** Marcadores de contenido pendiente: visibles en desarrollo o con NEXT_PUBLIC_SHOW_PENDING=1. */
export const showPending =
  process.env.NEXT_PUBLIC_SHOW_PENDING === "1" || process.env.NODE_ENV !== "production";
