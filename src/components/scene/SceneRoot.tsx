"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { decidePlan, sceneStore, trackPointer, useScene } from "@/lib/scene/store";

const SceneLayer = dynamic(() => import("./SceneLayer"), { ssr: false });

/**
 * Decide qué versión de las escenas usar y, solo si procede, carga el canvas WebGL
 * después de que la primera pantalla sea visible e interactiva.
 */
export function SceneRoot() {
  const { plan, canvas } = useScene();

  useEffect(() => {
    const decided = decidePlan();
    sceneStore.set({ plan: decided });
    if (decided !== "3d") return;
    trackPointer();

    let cancelled = false;
    const start = () => {
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
      idle(() => {
        window.setTimeout(() => {
          if (!cancelled) sceneStore.set({ canvas: true });
        }, 400);
      });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
    };
  }, []);

  return plan === "3d" && canvas ? <SceneLayer /> : null;
}
