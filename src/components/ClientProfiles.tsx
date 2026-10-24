"use client";

import { useRef } from "react";

/**
 * Perfiles de Instagram de clientes, bajo el vídeo del hero (solo en la home). Una tarjeta por perfil: la foto de perfil
 * pública de la cuenta (public/img/perfiles, 72 y 144 px en WebP), el @usuario con su insignia de verificado y los
 * seguidores. Los datos son los que facilita Fivo (no se leen de Instagram). Cada tarjeta abre su Instagram en una
 * pestaña nueva.
 *
 * Desde md (768 px): rejilla de tarjetas del mismo tamaño (2x2 en tableta, 4 en fila desde lg). Las columnas 1fr de la
 * rejilla inline toman el ancho del contenido más largo, así que el @ nunca se corta.
 * En móvil: una cinta que avanza sola hacia la derecha en bucle (solo CSS, ver .profiles-track en globals.css), con la
 * lista duplicada para que el reinicio no se note. Mantener pulsado la pausa; un toque abre el perfil. Con movimiento
 * reducido no se mueve: es una fila que se desliza con el dedo.
 */
const PROFILES = [
  { user: "rous.loveyourbody", followers: "96,8k", verified: true },
  { user: "davidruizfitness", followers: "42,6k", verified: true },
  { user: "monicamfit", followers: "147k", verified: true },
  { user: "hugo.lopezc", followers: "21,4k", verified: true },
];
type Profile = (typeof PROFILES)[number];

export const PROFILES_TITLE = "Ya confían en Fivo";

/** Pulsación más larga que esto = mantener para pausar: al soltar no se abre el perfil. */
const HOLD_MS = 350;

/** Insignia de verificado propia: círculo azul con un check blanco. */
function Verified() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" className="shrink-0" role="img" aria-label="Cuenta verificada">
      <circle cx="8" cy="8" r="8" fill="#3B82F6" />
      <path d="M4.6 8.3 7 10.6l4.4-4.9" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Card({ p, hidden = false, className = "", onClick, onPointerDown }: { p: Profile; hidden?: boolean; className?: string; onClick?: (e: React.MouseEvent) => void; onPointerDown?: () => void }) {
  return (
    <a
      href={`https://www.instagram.com/${p.user}/`}
      target="_blank"
      rel="noopener noreferrer nofollow"
      tabIndex={hidden ? -1 : undefined}
      aria-label={hidden ? undefined : `@${p.user}${p.verified ? ", cuenta verificada" : ""}, ${p.followers} seguidores, en Instagram (se abre en una pestaña nueva)`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      draggable={false}
      className={`flex items-center gap-3 rounded-[12px] border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong ${className}`}
    >
      {/* Foto redonda con borde fino en el degradado de marca */}
      <span className="bg-brand shrink-0 rounded-full p-[1.5px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/img/perfiles/${p.user}-72.webp`}
          srcSet={`/img/perfiles/${p.user}-72.webp 1x, /img/perfiles/${p.user}-144.webp 2x`}
          alt={hidden ? "" : `@${p.user}`}
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block size-12 rounded-full border-2 border-surface bg-bg object-cover"
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1 whitespace-nowrap text-[15px] font-semibold leading-tight text-fg">
          @{p.user}
          {p.verified && <Verified />}
        </span>
        <span className="mt-0.5 whitespace-nowrap text-[13px] leading-tight text-fg-muted">{p.followers} seguidores</span>
      </span>
    </a>
  );
}

export function ClientProfiles() {
  const pressedAt = useRef(0);
  const marquee = useRef<HTMLDivElement>(null);
  const down = () => {
    pressedAt.current = performance.now();
  };
  // Mientras se mantiene pulsado (dedo o ratón), data-held pausa la cinta (CSS); al soltar, sigue. Solo eventos, nada por fotograma
  const hold = (on: boolean) => marquee.current?.toggleAttribute("data-held", on);
  // Mantener pulsado pausa la cinta; al soltar tras una pulsación larga no se abre el perfil
  const click = (e: React.MouseEvent) => {
    if (pressedAt.current && performance.now() - pressedAt.current > HOLD_MS) e.preventDefault();
    pressedAt.current = 0;
  };

  return (
    <div className="w-full">
      <p id="perfiles" className="mb-2.5 text-center text-[12px] font-medium text-fg-muted">
        {PROFILES_TITLE}
      </p>

      {/* Móvil: cinta en bucle. Ancho fijo de tarjeta (cabe el @ más largo); la altura es la de la tarjeta, sin saltos */}
      <div
        ref={marquee}
        className="profiles-marquee -mx-5 overflow-hidden px-0 md:hidden"
        onPointerDown={() => hold(true)}
        onPointerUp={() => hold(false)}
        onPointerCancel={() => hold(false)}
        onPointerLeave={() => hold(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="profiles-track flex w-max">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-labelledby={copy === 0 ? "perfiles" : undefined}
              aria-hidden={copy === 1 ? true : undefined}
              className={`flex shrink-0 gap-3 pr-3 ${copy === 1 ? "motion-reduce:hidden" : "motion-reduce:pl-5"}`}
            >
              {PROFILES.map((p) => (
                <li key={p.user} className="snap-start">
                  <Card p={p} hidden={copy === 1} className="w-[268px]" onPointerDown={down} onClick={click} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Tableta y escritorio: rejilla */}
      <div className="flex justify-center max-md:hidden">
        <ul
          aria-labelledby="perfiles"
          className="grid w-full max-w-[400px] gap-2 sm:inline-grid sm:w-auto sm:max-w-none sm:grid-cols-[repeat(2,1fr)] sm:gap-3 lg:grid-cols-[repeat(4,1fr)]"
        >
          {PROFILES.map((p) => (
            <li key={p.user} className="flex">
              <Card p={p} className="w-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
