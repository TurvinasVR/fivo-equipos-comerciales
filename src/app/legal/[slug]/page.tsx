import type { Metadata } from "next";
import { notFound } from "next/navigation";

const PAGES: Record<string, string> = {
  "aviso-legal": "Aviso legal",
  privacidad: "Política de privacidad",
  cookies: "Política de cookies",
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${PAGES[slug] ?? "Legal"} | Fivo`, robots: { index: false, follow: false } };
}

/** Páginas legales de sustitución. Apunta siteConfig.legal a las reales cuando existan. */
export default async function Legal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = PAGES[slug];
  if (!title) notFound();
  return (
    <main className="mx-auto max-w-[720px] px-5 py-16">
      <h1 className="font-display text-3xl font-black">{title}</h1>
      <p className="mt-4 text-fg-muted">El texto legal de esta página está pendiente de redacción y revisión.</p>
    </main>
  );
}
