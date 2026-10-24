"use client";

import { useEffect, useState } from "react";
import { watchCtas } from "@/lib/ctaFlow";

/**
 * Solo el logotipo, a la izquierda (sin botón: en la página ya están los botones de cada bloque y, en móvil, el fijo
 * de abajo). Sin menú ni enlaces de salida.
 *
 * La barra es fija en escritorio y en móvil, por encima de todo el contenido y de las escenas del grafo
 * y por debajo del aviso de cookies. En lo alto de la página no tiene fondo; al pasar contenido por
 * debajo aparece su fondo (bg al 85 % con desenfoque y borde inferior, ver .topbar en globals.css). Compacta al hacer scroll. Su botón lleva el degradado de marca, como todos los "Agendar mi llamada". Con el formulario a la vista, el
 * botón se oculta: no tiene sentido apuntar a lo que ya se está viendo.
 */
export function TopBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(
    () =>
      watchCtas(() => {
        setScrolled(window.scrollY > 8);
      }),
    [],
  );

  return (
    <header className="topbar fixed inset-x-0 top-0 z-[40]" data-scrolled={scrolled ? "" : undefined}>
      <div className={`mx-auto flex max-w-[1280px] items-center px-5 transition-[height] duration-300 lg:px-10 ${scrolled ? "h-12" : "h-14"}`}>
        {/* Logotipo oficial de fivo.ai (versión blanca del encabezado), sin redibujar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/fivo-wordmark-white.svg" alt="Fivo" width={103} height={33} className="h-[30px] w-auto" />
      </div>
    </header>
  );
}

/** Hueco de la altura de la barra (que es fija), para que el contenido empiece debajo. */
export function TopBarSpacer() {
  return <div aria-hidden className="h-14" />;
}
