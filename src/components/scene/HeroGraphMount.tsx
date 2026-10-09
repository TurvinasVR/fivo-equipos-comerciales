"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useScene } from "@/lib/scene/store";

const HeroGraph3D = dynamic(() => import("./HeroGraph3D"), { ssr: false });

/** Recorte del canvas 3D para el fondo del hero. Cuando el 3D está activo, el SVG se desvanece. */
export function HeroGraphMount() {
  const { plan, canvas } = useScene();
  const track = useRef<HTMLDivElement>(null);
  const is3d = plan === "3d" && canvas;

  useEffect(() => {
    document.documentElement.toggleAttribute("data-hero3d", is3d);
    return () => document.documentElement.removeAttribute("data-hero3d");
  }, [is3d]);

  return (
    <>
      <div ref={track} aria-hidden className="pointer-events-none absolute inset-0" />
      {is3d && <HeroGraph3D track={track} />}
    </>
  );
}
