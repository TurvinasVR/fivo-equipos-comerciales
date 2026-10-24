/**
 * Perfiles de Instagram de clientes, bajo el vídeo del hero (solo en la home). Una tarjeta por perfil: la foto de perfil
 * pública de la cuenta (public/img/perfiles, 72 y 144 px en WebP), el @usuario con su insignia de verificado y los
 * seguidores. Los datos son los que facilita Fivo (no se leen de Instagram). Cada tarjeta abre su Instagram en una
 * pestaña nueva.
 *
 * Todas las tarjetas miden lo mismo: en móvil ocupan el ancho; desde sm la rejilla es inline y sus columnas 1fr toman el
 * ancho del contenido más largo, así que el @ nunca se corta (whitespace-nowrap) y la tarjeta crece en vez de partirlo.
 * Foto con tamaño fijo y carga diferida: sin saltos de diseño.
 */
const PROFILES = [
  { user: "rous.loveyourbody", followers: "96,8k", verified: true },
  { user: "davidruizfitness", followers: "42,6k", verified: true },
  { user: "monicamfit", followers: "147k", verified: true },
  { user: "hugo.lopezc", followers: "21,4k", verified: true },
];

export const PROFILES_TITLE = "Ya confían en Fivo";

/** Insignia de verificado propia: círculo azul con un check blanco. */
function Verified() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" className="shrink-0" role="img" aria-label="Cuenta verificada">
      <circle cx="8" cy="8" r="8" fill="#3B82F6" />
      <path d="M4.6 8.3 7 10.6l4.4-4.9" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClientProfiles() {
  return (
    <div className="w-full">
      <p id="perfiles" className="mb-2.5 text-center text-[12px] font-medium text-fg-muted">
        {PROFILES_TITLE}
      </p>
      <div className="flex justify-center">
        <ul
          aria-labelledby="perfiles"
          className="grid w-full max-w-[400px] gap-2 sm:inline-grid sm:w-auto sm:max-w-none sm:grid-cols-[repeat(2,1fr)] sm:gap-3 lg:grid-cols-[repeat(4,1fr)]"
        >
          {PROFILES.map((p) => (
            <li key={p.user} className="flex">
              <a
                href={`https://www.instagram.com/${p.user}/`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label={`@${p.user}${p.verified ? ", cuenta verificada" : ""}, ${p.followers} seguidores, en Instagram (se abre en una pestaña nueva)`}
                className="flex w-full items-center gap-3 rounded-[12px] border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong"
              >
                {/* Foto redonda con borde fino en el degradado de marca */}
                <span className="bg-brand shrink-0 rounded-full p-[1.5px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/img/perfiles/${p.user}-72.webp`}
                    srcSet={`/img/perfiles/${p.user}-72.webp 1x, /img/perfiles/${p.user}-144.webp 2x`}
                    alt={`@${p.user}`}
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
