import { Calculator } from "./Calculator";

/** Bloque de la calculadora en /gracias, debajo de todo lo demás. El titular es provisional. */
export function CalculatorSection() {
  return (
    <section aria-labelledby="calculadora" className="mx-auto mt-16 max-w-[1120px]">
      <h2 id="calculadora" className="mx-auto max-w-[760px] text-center font-display text-2xl font-bold leading-snug text-balance sm:text-[1.75rem]">
        Mientras llega la llamada, calcula lo que Fivo puede ahorrarte
      </h2>
      <div className="mt-8">
        <Calculator />
      </div>
    </section>
  );
}
