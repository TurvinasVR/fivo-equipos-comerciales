"use client";

import { useEffect, useState } from "react";
import { inView, shown, watchCtas } from "@/lib/ctaFlow";
import { CtaButton } from "./CtaButton";

/**
 * Logotipo y un botón. Sin menú ni enlaces de salida.
 *
 * La barra es fija en escritorio y en móvil, por encima de todo el contenido y de las escenas del grafo
 * y por debajo del aviso de cookies. En lo alto de la página no tiene fondo; al pasar contenido por
 * debajo aparece su fondo (bg al 85 % con desenfoque y borde inferior, ver .topbar en globals.css). Compacta al hacer scroll. Su botón es secundario mientras el del
 * hero está a la vista (el degradado va en un solo botón por pantalla); pasa a botón principal cuando
 * el del hero ya no se ve y no hay otro botón principal en pantalla. Con el formulario a la vista, el
 * botón se oculta: no tiene sentido apuntar a lo que ya se está viendo.
 */
export function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const [primary, setPrimary] = useState(false);
  const [formOn, setFormOn] = useState(false);

  useEffect(
    () =>
      watchCtas(() => {
        setScrolled(window.scrollY > 8);
        const hero = document.querySelector("[data-hero-cta]");
        const form = document.getElementById("agendar");
        // Margen de 80px: la barra cede el degradado un poco antes de que otro botón entre, nunca coinciden
        const formIn = !!form && inView(form, -80);
        const heroIn = hero ? inView(hero, -80) : true;
        const blockIn = [...document.querySelectorAll("[data-block-cta], [data-cta='video_end']")].some((el) => shown(el, -80));
        setFormOn(formIn);
        // En móvil manda el botón fijo inferior: la barra se queda siempre en secundario (un solo degradado por pantalla)
        const desktop = window.matchMedia("(min-width: 768px)").matches;
        setPrimary(desktop && !heroIn && !blockIn && !formIn);
      }),
    [],
  );

  return (
    <header className="topbar fixed inset-x-0 top-0 z-[40]" data-scrolled={scrolled ? "" : undefined}>
      <div className={`mx-auto flex max-w-[1280px] items-center justify-between px-5 transition-[height] duration-300 lg:px-10 ${scrolled ? "h-14" : "h-16"}`}>
        {/* Logotipo oficial de fivo.ai (versión blanca del encabezado), sin redibujar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/fivo-wordmark-white.svg" alt="Fivo" width={103} height={33} className="h-[30px] w-auto" />
        <div
          inert={formOn || undefined}
          aria-hidden={formOn || undefined}
          className="transition-opacity duration-300"
          style={{ opacity: formOn ? 0 : 1, visibility: formOn ? "hidden" : "visible", transitionProperty: "opacity, visibility" }}
        >
          <CtaButton position="barra" size="sm" secondary={!primary} topbar />
        </div>
      </div>
    </header>
  );
}

/** Hueco de la altura de la barra (que es fija), para que el contenido empiece debajo. */
export function TopBarSpacer() {
  return <div aria-hidden className="h-16" />;
}
