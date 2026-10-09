"use client";

import { Fragment, useSyncExternalStore } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { sceneStore } from "@/lib/scene/store";
import { viewRegistry } from "@/lib/scene/registry";

/**
 * Renderizador de vistas: recorta el canvas a cada elemento visible y lo pinta.
 * Se limpia todo en cada fotograma (el fondo es transparente). Fuera de pantalla no se pinta.
 */
function ViewHost() {
  const views = useSyncExternalStore(viewRegistry.subscribe, viewRegistry.get, viewRegistry.get);

  useFrame(({ gl, size }) => {
    gl.setScissorTest(false);
    gl.setClearColor(0x000000, 0);
    gl.clear(true, true);
    for (const v of viewRegistry.get()) {
      const r = v.el.getBoundingClientRect();
      v.visible = !(r.bottom < 0 || r.top > size.height || r.right < 0 || r.left > size.width || r.width < 2 || r.height < 2);
      if (!v.visible) continue;
      v.w = r.width;
      v.h = r.height;
      const bottom = size.height - r.bottom;
      gl.setViewport(r.left, bottom, r.width, r.height);
      gl.setScissor(r.left, bottom, r.width, r.height);
      gl.setScissorTest(true);
      if (v.camera.aspect !== r.width / r.height) {
        v.camera.aspect = r.width / r.height;
        v.camera.updateProjectionMatrix();
      }
      gl.render(v.scene, v.camera);
    }
    gl.setScissorTest(false);
  }, 1);

  return (
    <>
      {views.map((v) => (
        <Fragment key={v.id}>{createPortal(<>{v.render(v)}</>, v.scene)}</Fragment>
      ))}
    </>
  );
}

function DprGuard() {
  const setDpr = useThree((s) => s.setDpr);
  return (
    <PerformanceMonitor
      flipflops={3}
      onDecline={() => setDpr(1)}
      onFallback={() => sceneStore.fallTo2d()}
    />
  );
}

export default function SceneLayer() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 10] }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => sceneStore.fallTo2d(), { once: true });
        }}
        style={{ pointerEvents: "none" }}
      >
        <DprGuard />
        <ViewHost />
      </Canvas>
    </div>
  );
}
