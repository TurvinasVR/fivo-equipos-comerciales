import type { LandingContent } from "@/content/types";
import { TopBar, TopBarSpacer } from "../TopBar";
import { Hero } from "../Hero";
import { SceneRoot } from "../scene/SceneRoot";
import { HeroBackdrop } from "../scene/HeroBackdrop";
import { LandingProvider } from "./LandingContext";
import BelowFold from "./BelowFold";

/** La landing completa. Cada ruta le pasa su contenido (src/content); la estructura es la misma. */
export function Landing({ content }: { content: LandingContent }) {
  return (
    <>
      {/* Capas: fondo (0), canvas WebGL único (1), contenido (2) */}
      <SceneRoot />
      {/* La barra fija va fuera de la capa de contenido para quedar por encima de todo (y bajo las cookies) */}
      <TopBar />
      <div className="relative">
        <HeroBackdrop />
        <div className="relative z-[2]">
          <TopBarSpacer />
          <Hero content={content} />
        </div>
      </div>
      {/* Todo lo de debajo va en el HTML inicial, con cada escena ya pintada en su estado final */}
      <LandingProvider content={content}>
        <BelowFold />
      </LandingProvider>
    </>
  );
}
