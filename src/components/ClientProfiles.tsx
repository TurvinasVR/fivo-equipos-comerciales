import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";

/**
 * Perfiles de Instagram de clientes, bajo los logotipos del hero (solo en la home). Las fotos son la foto de perfil
 * pública de cada cuenta, recortada en cuadrado sobre la cara (public/img/perfiles, 72 y 144 px en WebP). El nombre que
 * se muestra es el propio @usuario. Sin seguidores ni cifras. Cada perfil abre su Instagram en una pestaña nueva.
 *
 * El hueco de cada foto está fijado (ancho y alto), así que no hay salto al cargar. Van con carga diferida: quedan
 * en el borde inferior de la primera pantalla y nunca compiten con el póster del vídeo.
 */
const PROFILES = ["rous.loveyourbody", "davidruizfitness", "monicamfit", "hugo.lopezc"];

export const PROFILES_TITLE = "Ya confían en Fivo";

export function ClientProfiles() {
  return (
    <div className="w-full">
      <p id="perfiles" className="mb-2.5 text-center text-[12px] font-medium text-fg-muted">
        {PROFILES_TITLE}
      </p>
      <ul aria-labelledby="perfiles" className="mx-auto grid max-w-[340px] grid-cols-2 gap-x-3 gap-y-3 sm:flex sm:max-w-none sm:justify-center sm:gap-x-8">
        {PROFILES.map((u) => (
          <li key={u} className="flex justify-center">
            <a
              href={`https://www.instagram.com/${u}/`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label={`@${u} en Instagram (se abre en una pestaña nueva)`}
              className="group flex min-w-0 flex-col items-center gap-1.5 rounded-[8px] px-1 py-1 outline-offset-2"
            >
              {/* Borde fino con el degradado de marca */}
              <span className="bg-brand rounded-full p-[1.5px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/img/perfiles/${u}-72.webp`}
                  srcSet={`/img/perfiles/${u}-72.webp 1x, /img/perfiles/${u}-144.webp 2x`}
                  alt={`@${u}`}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="block size-14 rounded-full border-2 border-bg bg-surface object-cover"
                />
              </span>
              <span className="flex max-w-full items-center gap-1 text-[12px] font-medium leading-tight text-fg-muted transition-colors group-hover:text-fg">
                <InstagramLogo size={13} aria-hidden className="shrink-0" />
                <span className="truncate">@{u}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
