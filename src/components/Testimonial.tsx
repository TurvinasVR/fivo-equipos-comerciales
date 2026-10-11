import type { TestimonialData } from "@/content/types";

/** Tarjeta de testimonio de un infoproductor: foto (o inicial), nombre, nicho, equipo, frase y resultado. */
export function TestimonialCard({ data, featured = false }: { data: TestimonialData; featured?: boolean }) {
  return (
    <figure className={`card flex h-full flex-col p-6 ${featured ? "sm:p-8" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-brand font-sans text-lg font-bold text-bg">
          {data.logoOrPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoOrPhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            data.name.trim().charAt(0).toUpperCase()
          )}
        </div>
        <figcaption>
          <p className="font-semibold leading-tight">{data.name}</p>
          <p className="text-sm text-fg-muted">{data.role}</p>
          {data.extra && <p className="text-sm text-fg-muted">{data.extra}</p>}
        </figcaption>
      </div>

      <blockquote className={`mt-5 font-medium leading-snug ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>
        <p className="line-clamp-3">“{data.quote}”</p>
      </blockquote>

      <div className="mt-auto pt-6">
        <p className={`font-display font-black leading-none ${featured ? "text-5xl" : "text-4xl"}`}>{data.figure}</p>
        <p className="mt-1.5 text-sm text-fg-muted">{data.figureLabel}</p>
      </div>
    </figure>
  );
}
