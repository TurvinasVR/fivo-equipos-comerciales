"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject, RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ToolNode } from "@/lib/scene/graph";
import { pointer } from "@/lib/scene/store";
import { DUR, clamp01, easeOut, lerp } from "@/lib/scene/motion";
import { useSceneView } from "@/lib/scene/registry";
import type { SceneView } from "@/lib/scene/registry";
import { glowTexture } from "./HeroGraph3D";
import { TOKENS } from "@/lib/scene/tokens";

type Shared = {
  tools: ToolNode[];
  chipRefs: MutableRefObject<(HTMLElement | null)[]>;
  litRef: MutableRefObject<number>;
  enteredRef: MutableRefObject<boolean>;
};

const SX = 7.4;
const SY = 3.5;
const BLUE = new THREE.Color(TOKENS.accent);
const CYAN = new THREE.Color(TOKENS.accent);
const SKY = new THREE.Color(TOKENS.accent);

function Hub({ view, tools, chipRefs, litRef, enteredRef }: Shared & { view: SceneView }) {
  const world = useMemo(() => tools.map((n) => new THREE.Vector3(n.u * SX, n.v * SY, n.z)), [tools]);
  const group = useRef<THREE.Group>(null);
  const wire = useRef<THREE.LineSegments>(null);
  const start = useRef<number | null>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const o = useMemo(() => {
    const tex = glowTexture();
    const lines = world.map((p) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 0, 0]), 3));
      const m = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.5, depthWrite: false });
      void p;
      return new THREE.Line(g, m);
    });
    const halos = world.map(() => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: SKY, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      return s;
    });
    const pulse = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: CYAN, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    pulse.scale.setScalar(0.7);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 32), new THREE.MeshBasicMaterial({ color: TOKENS.accent }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: BLUE, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.setScalar(4.2);
    const wireObj = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.98, 1)),
      new THREE.LineBasicMaterial({ color: SKY, transparent: true, opacity: 0.42, depthWrite: false }),
    );
    const ring = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 96 }, (_, i) => new THREE.Vector3(Math.cos((i / 96) * Math.PI * 2) * 1.55, Math.sin((i / 96) * Math.PI * 2) * 1.55, 0))),
      new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.35, depthWrite: false }),
    );
    ring.rotation.x = 1.15;
    // Polvo de fondo: nodos tenues que dan profundidad
    const n = 46;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8.5;
      pos[i * 3 + 2] = -2 - Math.random() * 6;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.22, map: tex, color: SKY, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending }));
    return { lines, halos, pulse, core, glow, wireObj, ring, dust };
  }, [world]);

  useEffect(
    () => () => {
      [...o.lines, o.wireObj, o.ring, o.dust, o.core].forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      [...o.halos, o.pulse, o.glow].forEach((s) => s.material.dispose());
    },
    [o],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (enteredRef.current && start.current === null) start.current = t;
    const since = start.current === null ? -1 : t - start.current;

    g.rotation.y = lerp(g.rotation.y, Math.sin(t * 0.22) * 0.2 + pointer.x * 0.26, 0.05);
    g.rotation.x = lerp(g.rotation.x, -pointer.y * 0.1, 0.05);
    if (wire.current) wire.current.rotation.y = t * 0.25;
    o.ring.rotation.z = t * 0.12;
    o.core.scale.setScalar(1 + Math.sin(t * 1.4) * 0.025);

    const lit = litRef.current;
    let pulseOn = false;

    view.camera.aspect = view.w / Math.max(1, view.h);
    view.camera.updateProjectionMatrix();
    view.camera.updateMatrixWorld();
    g.updateMatrixWorld(true);

    for (let i = 0; i < world.length; i++) {
      const p = easeOut(clamp01((since - i * 0.09) / (DUR.scene / 1000)));
      const pos = o.lines[i].geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(1, world[i].x * p, world[i].y * p, world[i].z * p);
      pos.needsUpdate = true;

      const mat = o.lines[i].material as THREE.LineBasicMaterial;
      const target = lit === -1 ? 0.5 : lit === i ? 1 : 0.14;
      mat.opacity = lerp(mat.opacity, target, 0.12);
      mat.color.lerp(lit === i ? CYAN : BLUE, 0.15);

      const hs = o.halos[i];
      hs.position.copy(world[i]);
      const hTarget = lit === i ? 1 : 0.4;
      (hs.material as THREE.SpriteMaterial).opacity = lerp((hs.material as THREE.SpriteMaterial).opacity, since < 0 ? 0 : hTarget * p, 0.12);
      hs.scale.setScalar(lerp(hs.scale.x || 1, lit === i ? 2.4 : 1.5, 0.12));

      if (lit === i && p >= 1) {
        const k = (t * 0.7) % 1;
        o.pulse.position.set(world[i].x * k, world[i].y * k, world[i].z * k);
        pulseOn = true;
      }

      // Posición de los logotipos del DOM = proyección del nodo
      const el = chipRefs.current[i];
      if (el) {
        tmp.copy(world[i]).applyMatrix4(g.matrixWorld);
        const dist = view.camera.position.distanceTo(tmp);
        tmp.project(view.camera);
        const x = (tmp.x * 0.5 + 0.5) * view.w;
        const y = (-tmp.y * 0.5 + 0.5) * view.h;
        const depth = clamp01(12 / dist - 0.55);
        // Antes de entrar en pantalla se queda como la versión estática (a tamaño y opacidad completos): nunca vacío
        const s = (0.8 + depth * 0.4) * (since < 0 ? 1 : 0.6 + 0.4 * p);
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${s.toFixed(3)})`;
        el.style.opacity = String(since < 0 ? 1 : clamp01(p * 1.4) * (0.55 + depth * 0.45));
        el.style.zIndex = String(Math.round(depth * 10) + (lit === i ? 20 : 0));
      }
    }
    const pm = o.pulse.material as THREE.SpriteMaterial;
    pm.opacity = lerp(pm.opacity, pulseOn ? 1 : 0, 0.2);
  });

  return (
    <group ref={group}>
      <primitive object={o.dust} />
      {o.lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      {o.halos.map((h, i) => (
        <primitive key={i} object={h} />
      ))}
      <primitive object={o.pulse} />
      <primitive object={o.glow} />
      <primitive object={o.core} />
      <primitive ref={wire} object={o.wireObj} />
      <primitive object={o.ring} />
    </group>
  );
}

export default function ToolsView3D({ track, ...shared }: Shared & { track: RefObject<HTMLElement | null> }) {
  useSceneView(track, { fov: 34, position: [0, 0, 12.5] }, (view) => <Hub view={view} {...shared} />);
  return null;
}
