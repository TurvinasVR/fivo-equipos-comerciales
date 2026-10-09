import type { NextConfig } from "next";

/**
 * Sitio estático para GitHub Pages (equiposcomerciales.fivo.info): `next build` genera la carpeta `out`,
 * sin servidor Node. Por eso aquí no hay redirects, rewrites ni headers, ni middleware ni rutas de API.
 * El noindex va en la etiqueta <meta name="robots"> de cada página (ver src/content/meta.ts).
 */
const nextConfig: NextConfig = {
  output: "export",
  // /gracias/ -> gracias/index.html: funciona en cualquier alojamiento estático
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
