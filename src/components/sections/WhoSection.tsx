import type { LandingContent } from "@/content/types";
import { BlockCta } from "../landing/BlockCta";

type Who = NonNullable<LandingContent["who"]>;

/** Una columna de la lista: un punto de estado y una frase por punto, separados por una línea. */
function Column({ label, items, tone }: { label: string; items: string[]; tone: "text-success" | "text-danger" }) {
  return (
    <div>
      <h3 className="font-display text-xl font-bold leading-snug sm:text-2xl">{label}</h3>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-3.5 py-4 text-[16px] leading-snug sm:text-[17px]">
            <i aria-hidden className={`status-dot mt-[9px] ${tone}`} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Para quién es y para quién no. El acento de estado es un punto de 6px, nunca un check en un cuadrado. */
export function WhoSection({ who }: { who: Who }) {
  return (
    <section aria-labelledby="para-quien" className="bg-bg">
      <div className="mx-auto max-w-[1120px] px-5 py-12 lg:px-10 lg:py-24">
        <h2 id="para-quien" className="font-display text-3xl font-black tracking-[-0.015em] sm:text-4xl">
          {who.title}
        </h2>
        <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <Column label={who.yes.label} items={who.yes.items} tone="text-success" />
          <Column label={who.no.label} items={who.no.items} tone="text-danger" />
        </div>
        <BlockCta position="para-quien" />
      </div>
    </section>
  );
}
