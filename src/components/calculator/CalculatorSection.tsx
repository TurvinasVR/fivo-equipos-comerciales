"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ClientLogos } from "../ClientLogos";
import { Calculator } from "./Calculator";

// Las opiniones solo se piden al llegar al resultado y en su propio fragmento: no retrasan nada de lo anterior
const Reviews = dynamic(() => import("../reviews/Reviews"), { ssr: false });

const heading = "font-display text-[clamp(1.375rem,1rem+1.6vw,2rem)] font-black leading-[1.15] tracking-[-0.015em]";
const sub = "mt-2 text-[15px] text-fg-muted sm:text-base";

/**
 * Titular + calculadora + opiniones. En los pasos 1 a 3 el titular invita a calcular; en el resultado dice "Este es tu
 * cálculo". Los dos textos comparten celda de la rejilla: el alto lo marca el mayor y el cambio no mueve la página.
 */
export function CalculatorSection({ title, intro, resultTitle, disclaimer }: { title: string; intro: string; resultTitle: string; disclaimer: string }) {
  const section = useRef<HTMLElement>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const onStep = (e: Event) => setStep((e as CustomEvent<{ step: number }>).detail.step);
    el.addEventListener("calc:step", onStep);
    return () => el.removeEventListener("calc:step", onStep);
  }, []);

  const result = step === 4;
  return (
    <section ref={section} data-calc-section aria-labelledby={result ? "calculadora-resultado" : "calculadora"} className="mt-8 scroll-mt-4 lg:mt-12">
      <div className="mx-auto grid max-w-[760px] text-center">
        <div style={{ gridArea: "1 / 1" }} className={result ? "invisible" : ""} aria-hidden={result}>
          <h2 id="calculadora" className={heading}>
            {title}
          </h2>
          <p className={sub}>{intro}</p>
        </div>
        <div style={{ gridArea: "1 / 1" }} className={result ? "" : "invisible"} aria-hidden={!result}>
          <h2 id="calculadora-resultado" className={heading}>
            {resultTitle}
          </h2>
        </div>
      </div>
      <div className="mt-5 lg:mt-6">
        <Calculator disclaimer={disclaimer} />
      </div>
      {result && (
        <>
          <div className="mt-2 lg:mt-6">
            <p className="mb-2 text-center text-[12px] font-medium text-fg-muted">Clientes de Fivo</p>
            <ClientLogos />
          </div>
          <Reviews className="mt-8 lg:mt-[41px]" />
        </>
      )}
    </section>
  );
}
