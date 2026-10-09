import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { landingMetadata } from "@/content/meta";
import { ACTIVE_LANDING } from "@/lib/activeLanding";
import { AnalyticsLoader } from "@/components/AnalyticsLoader";
import { CookieBanner } from "@/components/CookieBanner";

// Manrope: toda la interfaz (sistema de diseño de Fivo). next/font la autoaloja en el build.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

// Satoshi Black: la cara que sirve hoy el H1 de fivo.ai (font-satoshi, font-black). Solo titulares.
const satoshi = localFont({
  src: [
    { path: "./fonts/satoshi-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/satoshi-900.woff2", weight: "900", style: "normal" },
  ],
  display: "swap",
  // Sin precarga: el titular se pinta con la fuente de repuesto (ajustada, sin salto) y la sustituye al llegar.
  // Así los 48 KB de las dos caras no compiten con el póster y el JavaScript de la primera pantalla.
  preload: false,
  variable: "--font-satoshi",
});

// Metadatos de la landing; noindex en todas las páginas (etiqueta meta: un sitio estático no tiene cabeceras)
export const metadata: Metadata = landingMetadata(ACTIVE_LANDING);

export const viewport: Viewport = {
  themeColor: "#08090B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${manrope.variable} ${satoshi.variable}`}>
      <body>
        {/* El aviso va el primero en el DOM (es fixed, no cambia dónde se ve) para ser lo primero en el orden de tabulación */}
        <CookieBanner />
        {children}
        <AnalyticsLoader />
      </body>
    </html>
  );
}
