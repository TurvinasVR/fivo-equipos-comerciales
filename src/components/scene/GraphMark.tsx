import { TOOLS } from "@/lib/scene/graph";

/**
 * El grafo ya completo y quieto: el cierre de la historia. Muy tenue, sin movimiento,
 * para que el formulario sea lo único que pide atención.
 */
export function GraphMark({ className = "" }: { className?: string }) {
  const pts = TOOLS.map((n) => ({ x: 600 + n.u * 430, y: 350 + n.v * 260 }));
  return (
    <svg aria-hidden viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}>
      <defs>
        <radialGradient id="gm-hub">
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="600" cy="350" r="190" fill="url(#gm-hub)" />
      <g stroke="var(--color-accent)" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
        {pts.map((p, i) => (
          <line key={i} x1="600" y1="350" x2={p.x} y2={p.y} />
        ))}
      </g>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="34" fill="var(--color-accent)" fillOpacity="0.25" />
          <circle cx={p.x} cy={p.y} r="6" fill="var(--color-fg)" />
        </g>
      ))}
      <circle cx="600" cy="350" r="26" fill="var(--color-fg)" />
    </svg>
  );
}
