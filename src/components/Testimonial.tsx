import type { TestimonialData } from "@/content/types";
import { PendingTag } from "./PendingTag";

export function TestimonialCard({
  data,
  index,
  featured = false,
}: {
  data: TestimonialData;
  index: number;
  featured?: boolean;
}) {
  const placeholder = data.logoOrPhoto === null;
  return (
    <figure className={`card flex h-full flex-col p-6 ${featured ? "sm:p-8" : ""}`}>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
            placeholder ? "border-dashed border-line-strong text-fg-muted" : "border-line"
          }`}
        >
          {placeholder ? (
            <span className="text-[10px] font-medium leading-tight">Logo o foto</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoOrPhoto!} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <figcaption>
          <p className="font-semibold leading-tight">{data.name}</p>
          <p className="text-sm text-fg-muted">{data.role}</p>
          {data.extra && <p className="text-sm text-fg-muted">{data.extra}</p>}
        </figcaption>
      </div>

      <blockquote
        className={`mt-5 font-medium leading-snug ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}
      >
        <p className="line-clamp-3">“{data.quote}”</p>
      </blockquote>

      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div>
          <p className={`font-display font-black leading-none ${featured ? "text-5xl" : "text-4xl"}`}>{data.figure}</p>
          <p className="mt-1.5 text-sm text-fg-muted">{data.figureLabel}</p>
        </div>
        {placeholder && <PendingTag>testimonio {index + 1}</PendingTag>}
      </div>
    </figure>
  );
}
