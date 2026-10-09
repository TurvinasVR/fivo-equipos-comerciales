"use client";

import { useEffect, useMemo } from "react";
import type { MutableRefObject, RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { D } from "@/lib/scene/how/model";
import type { HowState } from "@/lib/scene/how/model";
import { clamp01, lerp } from "@/lib/scene/motion";
import { useSceneView } from "@/lib/scene/registry";
import type { SceneView } from "@/lib/scene/registry";
import { glowTexture } from "../HeroGraph3D";
import { TOKENS } from "@/lib/scene/tokens";

const BLUE = new THREE.Color(TOKENS.accent);
const CYAN = new THREE.Color(TOKENS.accent);
const SKY = new THREE.Color(TOKENS.accent);

/**
 * Dibujante 3D del grafo del bloque 5. No calcula nada: lee las posiciones del modelo
 * (las mismas que usa la versión SVG) y las pinta con líneas, luz y profundidad.
 */
function Graph({ view, stateRef, N }: { view: SceneView; stateRef: MutableRefObject<HowState>; N: number }) {
  const o = useMemo(() => {
    const tex = glowTexture();
    const lines = Array.from({ length: N }, () => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.2, depthWrite: false }));
    });
    const sprite = (color: THREE.Color, op = 0) =>
      new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
    const halos = Array.from({ length: N }, () => sprite(SKY));
    const cores = Array.from({ length: N }, () => sprite(new THREE.Color(TOKENS.fg)));
    const pulses = Array.from({ length: N }, () => {
      const s = sprite(CYAN);
      s.scale.setScalar(0.6);
      return s;
    });
    const hubCore = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 28), new THREE.MeshBasicMaterial({ color: TOKENS.accent }));
    const hubGlow = sprite(BLUE, 0.9);
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.98, 1)),
      new THREE.LineBasicMaterial({ color: SKY, transparent: true, opacity: 0.4, depthWrite: false }),
    );
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, i) => new THREE.Vector3(Math.cos((i / 96) * Math.PI * 2) * 1.55, Math.sin((i / 96) * Math.PI * 2) * 1.55, 0))),
      new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.32, depthWrite: false }),
    );
    ring.rotation.x = 1.15;
    const n = 50;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 17;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = -2.5 - Math.random() * 6;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.2, map: tex, color: SKY, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending }));
    return { lines, halos, cores, pulses, hubCore, hubGlow, wire, ring, dust };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      [...o.lines, o.hubCore, o.wire, o.ring, o.dust].forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      [...o.halos, ...o.cores, ...o.pulses, o.hubGlow].forEach((s) => s.material.dispose());
    },
    [o],
  );

  useFrame((state) => {
    const st = stateRef.current;
    const t = state.clock.elapsedTime;
    const cam = view.camera;
    // La cámara coincide con la proyección del modelo: 1 unidad de mundo = `unit` px en z = 0
    cam.fov = (2 * Math.atan(view.h / 2 / st.L.unit / D) * 180) / Math.PI;
    cam.position.set(0, 0, D);
    cam.updateProjectionMatrix();

    const gs = st.hub.s;
    const hx = st.hub.X;
    const hy = st.hub.Y;
    o.hubCore.position.set(hx, hy, 0);
    o.hubCore.scale.setScalar(gs * (0.6 + 0.4 * (1 + Math.sin(t * 1.4) * 0.03)));
    o.hubGlow.position.set(hx, hy, -0.1);
    o.hubGlow.scale.setScalar(3.4 * gs);
    o.wire.position.set(hx, hy, 0);
    o.wire.scale.setScalar(gs);
    o.wire.rotation.y = t * 0.25;
    o.ring.position.set(hx, hy, 0);
    o.ring.scale.setScalar(gs);
    o.ring.rotation.z = t * 0.12;

    for (let i = 0; i < N; i++) {
      const n = st.nodes[i];
      const isCall = n.kind === "call";
      const pos = o.lines[i].geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, hx, hy, 0);
      pos.setXYZ(1, lerp(hx, n.X, n.lineP), lerp(hy, n.Y, n.lineP), lerp(0, n.Z, n.lineP));
      pos.needsUpdate = true;
      const lm = o.lines[i].material as THREE.LineBasicMaterial;
      lm.opacity = (0.2 + n.lit * 0.55) * n.appear;
      lm.color.copy(n.lit > 0.55 ? CYAN : BLUE);

      const h = o.halos[i];
      h.position.set(n.X, n.Y, n.Z);
      h.scale.setScalar((isCall ? 0.8 : 1.05) * (0.45 + 0.55 * gs) * (1 + n.lit * 0.7));
      (h.material as THREE.SpriteMaterial).opacity = n.appear * (0.07 + n.lit * 0.7);

      const c = o.cores[i];
      c.visible = isCall;
      if (isCall) {
        c.position.set(n.X, n.Y, n.Z);
        c.scale.setScalar(0.2 * (0.6 + 0.4 * gs));
        (c.material as THREE.SpriteMaterial).opacity = n.appear;
      }

      const p = o.pulses[i];
      const on = n.pulse >= 0;
      (p.material as THREE.SpriteMaterial).opacity = on ? 1 : 0;
      if (on) p.position.set(lerp(hx, n.X, n.pulse), lerp(hy, n.Y, n.pulse), lerp(0, n.Z, n.pulse));
    }
    void clamp01;
  });

  return (
    <group>
      <primitive object={o.dust} />
      {o.lines.map((l, i) => (
        <primitive key={`l${i}`} object={l} />
      ))}
      {o.halos.map((h, i) => (
        <primitive key={`h${i}`} object={h} />
      ))}
      {o.cores.map((c, i) => (
        <primitive key={`c${i}`} object={c} />
      ))}
      {o.pulses.map((p, i) => (
        <primitive key={`p${i}`} object={p} />
      ))}
      <primitive object={o.hubGlow} />
      <primitive object={o.hubCore} />
      <primitive object={o.wire} />
      <primitive object={o.ring} />
    </group>
  );
}

/** `nodeCount`: herramientas más los cinco nodos de llamadas. */
export default function HowView3D({ track, stateRef, nodeCount }: { track: RefObject<HTMLElement | null>; stateRef: MutableRefObject<HowState>; nodeCount: number }) {
  useSceneView(track, { fov: 30, position: [0, 0, D] }, (view) => <Graph view={view} stateRef={stateRef} N={nodeCount} />);
  return null;
}
