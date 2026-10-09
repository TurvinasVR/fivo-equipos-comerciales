import { buildHeroGraph, projectHero } from "@/lib/scene/graph";
import { HeroGraphMount } from "./HeroGraphMount";

const TONES = ["var(--color-accent)", "var(--color-accent)", "var(--color-fg)"];

/**
 * Fondo de la primera pantalla: un grafo de nodos sueltos, lento y tenue. Se dibuja en el
 * servidor como SVG (no se hidrata); si hay 3D, HeroGraphMount lo sustituye con el canvas.
 * Siempre va debajo del contenido y bajo un velo que protege titular, vídeo y botón.
 */
export function HeroBackdrop({ lite = false }: { lite?: boolean }) {
  const graph = buildHeroGraph();
  return (
    <>
      <div aria-hidden className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${lite ? "opacity-40" : ""}`}>
        {/* Resplandor azul muy tenue y anillos orbitales finos detrás del titular */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse 80% 420px at 50% -40px, color-mix(in srgb, var(--color-accent) 20%, transparent), transparent 72%)" }} />
        <div className="absolute left-1/2 top-[190px] aspect-square w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-strong" />
        <div className="absolute left-1/2 top-[190px] aspect-square w-[1320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line" />
        <svg className="hero-graph-svg absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <g stroke="var(--color-accent)" strokeOpacity="0.2" strokeWidth="1" vectorEffect="non-scaling-stroke">
            {graph.edges.map(([a, b]) => {
              const p = projectHero(graph.nodes[a]);
              const q = projectHero(graph.nodes[b]);
              return <line key={`${a}-${b}`} x1={p.x.toFixed(0)} y1={p.y.toFixed(0)} x2={q.x.toFixed(0)} y2={q.y.toFixed(0)} />;
            })}
          </g>
          {graph.nodes.map((n, i) => {
            const p = projectHero(n);
            return <circle key={i} cx={p.x.toFixed(0)} cy={p.y.toFixed(0)} r={(1.3 + p.s * 1.6).toFixed(1)} fill={TONES[n.tone]} fillOpacity={(0.18 + p.s * 0.22).toFixed(2)} />;
          })}
        </svg>
      </div>

      {!lite && <HeroGraphMount />}

      {/* Velo oscuro por encima del canvas y por debajo del contenido */}
      <div
        aria-hidden
        hidden={lite}
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ backgroundImage: "radial-gradient(ellipse 52% 62% at 50% 52%, color-mix(in srgb, var(--color-bg) 82%, transparent), color-mix(in srgb, var(--color-bg) 50%, transparent) 55%, transparent 100%)" }}
      />
    </>
  );
}
