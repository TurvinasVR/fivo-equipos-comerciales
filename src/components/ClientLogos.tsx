/**
 * Clientes que aparecen en fivo.ai (y en el prompt). Logos descargados de
 * fivo.ai, sin modificar salvo el redimensionado. Se pintan en blanco
 * monocromo para el tema oscuro. Solo logos, sin etiquetas.
 *
 * Van en el HTML desde el principio, con prioridad baja (no compiten con el póster del vídeo, que es el LCP). El hueco de
 * cada logo está reservado (ancho y alto en CSS), así que no hay salto.
 */
const CLIENTS = [
  { name: "Catalana Occidente", file: "Catalana_Occidente_Logo.webp", w: 480, h: 229, height: 40 },
  { name: "Embat", file: "Embat.webp", w: 480, h: 320, height: 40 },
  { name: "Eurofins Scientific", file: "Eurofins_Scientific_logo.webp", w: 369, h: 76, height: 22 },
  { name: "Gameloft", file: "Gameloft-logo-and-wordmark.webp", w: 480, h: 96, height: 26 },
  { name: "Construccions Rubau", file: "Logo-CONSTRUCCIONS-RUBAU-ES1.webp", w: 480, h: 95, height: 28 },
  { name: "Universidad de Navarra", file: "Logotipo_Universidad_de_Navarra_negro_sobre_blanco-SVG.webp", w: 480, h: 201, height: 36 },
  { name: "UIC Barcelona", file: "Logotips_600x600_UIC_Barcelona.webp", w: 480, h: 480, height: 42 },
  { name: "Mapei", file: "Mapei_logo.webp", w: 480, h: 111, height: 24 },
  { name: "Xunta de Galicia, SERGAS", file: "xunta_de_galicia_sergas_cor.webp", w: 480, h: 196, height: 36 },
];

export function ClientLogos() {
  return (
    <ul
      className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-7"
      aria-label="Clientes de Fivo"
    >
      {CLIENTS.map((c) => (
        <li key={c.name} className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/logos/clients/${c.file}`}
            alt={c.name}
            width={c.w}
            height={c.h}
            decoding="async"
            loading="eager"
            fetchPriority="low"
            className="logo-mono h-[calc(var(--lh)*0.55*1px)] w-[calc(var(--lh)*0.55*1px*var(--ar))] opacity-70 sm:h-[calc(var(--lh)*0.8*1px)] sm:w-[calc(var(--lh)*0.8*1px*var(--ar))] xl:h-[calc(var(--lh)*1px)] xl:w-[calc(var(--lh)*1px*var(--ar))]"
            style={{ "--lh": c.height, "--ar": c.w / c.h } as React.CSSProperties}
          />
        </li>
      ))}
    </ul>
  );
}
