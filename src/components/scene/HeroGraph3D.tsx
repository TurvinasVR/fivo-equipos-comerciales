"use client";

import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { buildHeroGraph } from "@/lib/scene/graph";
import { pointer } from "@/lib/scene/store";
import { lerp } from "@/lib/scene/motion";
import { useSceneView } from "@/lib/scene/registry";
import { TOKENS, withAlpha } from "@/lib/scene/tokens";

const TONES = [TOKENS.accent, TOKENS.accent, TOKENS.fg].map((c) => new THREE.Color(c));

let glowTex: THREE.Texture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, withAlpha(TOKENS.fg, 1));
  grd.addColorStop(0.25, withAlpha(TOKENS.fg, 0.55));
  grd.addColorStop(1, withAlpha(TOKENS.fg, 0));
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

function Nodes() {
  const group = useRef<THREE.Group>(null);
  const { points, lines } = useMemo(() => {
    const { nodes, edges } = buildHeroGraph();
    const pos = new Float32Array(nodes.length * 3);
    const col = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      pos.set([n.x, n.y, n.z], i * 3);
      const c = TONES[n.tone];
      col.set([c.r, c.g, c.b], i * 3);
    });
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pm = new THREE.PointsMaterial({
      size: 0.34,
      map: glowTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const lp = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      lp.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], i * 6);
    });
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(lp, 3));
    const lm = new THREE.LineBasicMaterial({ color: TOKENS.accent, transparent: true, opacity: 0.2, depthWrite: false });
    return { points: new THREE.Points(pg, pm), lines: new THREE.LineSegments(lg, lm) };
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // Giro lento y parallax suave al puntero
    g.rotation.y = lerp(g.rotation.y, Math.sin(t * 0.07) * 0.25 + pointer.x * 0.16, 0.035);
    g.rotation.x = lerp(g.rotation.x, pointer.y * 0.08, 0.035);
    g.position.y = Math.sin(t * 0.12) * 0.12;
  });

  return (
    <group ref={group}>
      <primitive object={lines} />
      <primitive object={points} />
    </group>
  );
}

export default function HeroGraph3D({ track }: { track: RefObject<HTMLElement | null> }) {
  useSceneView(track, { fov: 46, position: [0, 0, 13] }, () => <Nodes />);
  return null;
}
