"use client";

import { createContext, useContext } from "react";
import type { LandingContent } from "@/content/types";

const Ctx = createContext<LandingContent | null>(null);

/** Pone el contenido de la landing al alcance de todos los componentes de cliente. */
export function LandingProvider({ content, children }: { content: LandingContent; children: React.ReactNode }) {
  return <Ctx.Provider value={content}>{children}</Ctx.Provider>;
}

export function useLanding(): LandingContent {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLanding fuera de LandingProvider");
  return c;
}
