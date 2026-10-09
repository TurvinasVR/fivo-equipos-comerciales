"use client";

import { useEffect, useId } from "react";
import type { ReactNode, RefObject } from "react";
import * as THREE from "three";

/** Una "vista" es un recorte del canvas único, alineado con un elemento del DOM. */
export type SceneView = {
  id: string;
  el: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Tamaño en píxeles CSS del elemento, actualizado en cada fotograma visible. */
  w: number;
  h: number;
  visible: boolean;
  render: (view: SceneView) => ReactNode;
};

let views: SceneView[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const viewRegistry = {
  get: () => views,
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  add(v: SceneView) {
    views = [...views, v];
    emit();
    return () => {
      views = views.filter((x) => x.id !== v.id);
      emit();
    };
  },
};

type Opts = { fov: number; position: [number, number, number] };

/** Registra un recorte del canvas compartido para `track`. `render` dibuja su escena. */
export function useSceneView(track: RefObject<HTMLElement | null>, opts: Opts, render: (v: SceneView) => ReactNode) {
  const id = useId();
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const camera = new THREE.PerspectiveCamera(opts.fov, 1, 0.1, 100);
    camera.position.set(...opts.position);
    camera.lookAt(0, 0, 0);
    const view: SceneView = { id, el, scene: new THREE.Scene(), camera, w: el.clientWidth, h: el.clientHeight, visible: false, render };
    return viewRegistry.add(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
