import type { Metadata } from "next";

export const metadata: Metadata = { title: "Página no encontrada | Fivo", robots: { index: false, follow: false } };

// Next añade por su cuenta solo "noindex" a la página 404: esta etiqueta completa el nofollow (se sube a <head>)
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-[640px] flex-col items-center justify-center px-5 text-center">
      <meta name="robots" content="noindex, nofollow" />
      <h1 className="font-display text-3xl font-black">Página no encontrada</h1>
      <a href="/" className="mt-6 text-[15px] font-semibold text-accent underline underline-offset-4">
        Volver al inicio
      </a>
    </main>
  );
}
