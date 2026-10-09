"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Handshake, Prohibit, VideoCamera } from "@phosphor-icons/react";
import { typeInto, useInView, useReducedMotion } from "@/lib/hooks";
import { CtaButton } from "../CtaButton";
import { useLanding } from "../landing/LandingContext";

const EASE = "cubic-bezier(0.16,1,0.3,1)";

const logo = (f: string, cls = "h-4 w-4") => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/logos/tools/${f}`} alt="" width={16} height={16} className={cls} />
);

/* Miniescena 1: las herramientas del equipo, sueltas, se van listando */
function SceneList({ play, instant }: { play: boolean; instant: boolean }) {
  const chips = [
    { f: "hubspot.svg", x: "10%", y: "14%" },
    { f: "zoom.svg", x: "52%", y: "58%" },
    { f: "slack.svg", x: "8%", y: "66%" },
    { f: "notion.svg", x: "56%", y: "10%" },
  ];
  const rows = [78, 62, 86, 54];
  return (
    <div className="relative h-[150px] w-full" aria-hidden>
      <div className="absolute inset-y-0 left-0 w-[46%]">
        {chips.map((c, i) => (
          <span
            key={c.f}
            className="absolute flex h-9 w-9 items-center justify-center rounded-full border bg-fg"
            style={{
              left: c.x,
              top: c.y,
              borderColor: play ? "var(--color-accent)" : "var(--color-line)",
              opacity: play ? 1 : 0.5,
              transition: instant ? "none" : `all 500ms ${EASE} ${300 + i * 380}ms`,
            }}
          >
            {logo(c.f, "h-[18px] w-[18px]")}
          </span>
        ))}
      </div>
      <div className="absolute inset-y-0 right-0 flex w-[50%] flex-col justify-center gap-2.5">
        {rows.map((w, i) => (
          <div
            key={i}
            className="flex items-center gap-2"
            style={{ opacity: play ? 1 : 0, transform: play ? "none" : "translateX(10px)", transition: instant ? "none" : `all 500ms ${EASE} ${300 + i * 380}ms` }}
          >
            <span className="h-2 rounded-full bg-line-strong" style={{ width: `${w}%` }} />
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent/20">
              <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6.5l2.6 2.6L10 3.4" />
              </svg>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Miniescena 2: una pregunta que se escribe y un grafo que responde */
function SceneAsk({ play, instant, text }: { play: boolean; instant: boolean; text: string }) {
  const q = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(play && instant); // estático: el grafo ya está dibujado en el HTML del servidor
  useEffect(() => {
    if (!play) {
      setDone(false);
      return;
    }
    if (instant) {
      if (q.current) q.current.textContent = text;
      setDone(true);
      return;
    }
    return typeInto(q.current, text, 38, () => setDone(true));
  }, [play, instant]);
  const nodes = [
    [28, 24],
    [84, 14],
    [118, 52],
    [76, 84],
    [26, 70],
  ];
  return (
    <div className="relative h-[150px] w-full" aria-hidden>
      <div className="ml-auto min-h-[34px] w-fit max-w-full rounded-[12px] bg-accent-soft text-fg px-3.5 py-2 text-[13px] font-medium leading-snug">
        <span ref={q}>{instant || !play ? (instant ? text : "") : ""}</span>
      </div>
      <svg viewBox="0 0 150 100" className="mt-1.5 h-[100px] w-[150px]">
        {nodes.map(([x, y], i) => (
          <g key={i}>
            <line x1="62" y1="48" x2={x} y2={y} stroke="var(--color-accent)" strokeWidth="1" pathLength={1} strokeDasharray={1} strokeDashoffset={done ? 0 : 1} style={{ transition: instant ? "none" : `stroke-dashoffset 600ms ${EASE} ${i * 120}ms` }} />
            <circle cx={x} cy={y} r="4.5" fill={done ? "var(--color-fg)" : "var(--color-fg-muted)"} style={{ transition: `fill 400ms ${i * 120 + 300}ms` }} />
          </g>
        ))}
        <circle cx="62" cy="48" r="13" fill="var(--color-surface)" stroke="var(--color-accent)" />
        <image href="/logos/fivo-mark.svg" x="56.5" y="41" width="11" height="14" />
      </svg>
    </div>
  );
}

/* Miniescena 3: dos salidas claras, sin presión */
function SceneFork({ play, instant, labels }: { play: boolean; instant: boolean; labels: [string, string] }) {
  const t = (d: number) => (instant ? "none" : `all 700ms ${EASE} ${d}ms`);
  return (
    <div className="relative h-[150px] w-full" aria-hidden>
      <svg viewBox="0 0 300 150" className="h-full w-full overflow-visible">
        <circle cx="26" cy="75" r="6" fill="var(--color-fg)" />
        <path d="M32 75 H110" stroke="var(--color-accent)" strokeWidth="1.6" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={play ? 0 : 1} style={{ transition: t(0) }} />
        <path d="M110 75 C 150 75, 150 36, 196 36" stroke="var(--color-accent)" strokeWidth="1.6" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={play ? 0 : 1} style={{ transition: t(500) }} />
        <path d="M110 75 C 150 75, 150 114, 196 114" stroke="var(--color-accent)" strokeWidth="1.6" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={play ? 0 : 1} style={{ transition: t(500) }} />
        <circle cx="110" cy="75" r="4" fill="var(--color-accent)" />
        {[
          { y: 36, label: labels[0], tone: "var(--color-success)" },
          { y: 114, label: labels[1], tone: "var(--color-danger)" },
        ].map((o) => (
          <g key={o.label} style={{ opacity: play ? 1 : 0, transition: instant ? "none" : `opacity 600ms 1000ms` }}>
            <circle cx="206" cy={o.y} r="3" fill={o.tone} />
            <text x="216" y={o.y + 5} fill="var(--color-fg)" fontSize="14" fontWeight="500">
              {o.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Duración de cada tramo al rellenarse (ms). */
const DURS = [1200, 1500, 800];

/** Bloque 8. Una línea de 30 minutos con tres tramos que se rellenan y una miniescena por tramo. */
export default function Agenda() {
  const { agenda, repeatCta } = useLanding();
  const SEGMENTS = agenda.segments.map((s, i) => ({ ...s, dur: DURS[i] }));
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  // Estado inicial estático ya pintado: los tres tramos rellenos. `armed`: la animación está lista para empezar al entrar en pantalla.
  const [step, setStep] = useState(3);
  const [armed, setArmed] = useState(false);

  // Al cargar el JavaScript: si el bloque ya se ve se queda como está; si no, se prepara la animación
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
    setStep(0);
  }, [ref]);

  useEffect(() => {
    if (reduced) {
      setStep(3);
      return;
    }
    if (!armed || !inView) return;
    setStep(1);
    const a = window.setTimeout(() => setStep(2), SEGMENTS[0].dur);
    const b = window.setTimeout(() => setStep(3), SEGMENTS[0].dur + SEGMENTS[1].dur);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [inView, reduced, armed]);


  return (
    <div ref={ref}>
      <ol className="mt-8 grid gap-8 md:grid-cols-[1fr_1.25fr_1fr] md:gap-x-8 md:gap-y-0">
        {SEGMENTS.map((s, k) => {
          const filled = step >= k + 1;
          return (
            <li key={s.text} className="relative pl-8 md:pl-0">
              {/* Línea de tiempo: horizontal en escritorio, vertical en móvil */}
              <div aria-hidden className="absolute bottom-[-2.5rem] left-[7px] top-1.5 w-px bg-line md:hidden" />
              <span
                aria-hidden
                className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 md:hidden"
                style={{ borderColor: filled ? "var(--color-accent)" : "var(--color-line-strong)", background: filled ? "var(--color-accent)" : "var(--color-bg)", transition: `all 400ms ${EASE}` }}
              />
              <p className="text-[13px] font-semibold text-accent md:mb-2">{s.range}</p>
              <div aria-hidden className="hidden h-1.5 overflow-hidden rounded-full bg-line md:block">
                <div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-accent"
                  style={{ transform: filled ? "scaleX(1)" : "scaleX(0)", transition: reduced || !armed ? "none" : `transform ${s.dur}ms linear` }}
                />
              </div>
              <div className="mt-4">
                {k === 0 && <SceneList play={filled} instant={reduced || !armed} />}
                {k === 1 && <SceneAsk play={filled} instant={reduced || !armed} text={agenda.askText} />}
                {k === 2 && <SceneFork play={filled} instant={reduced || !armed} labels={agenda.fork} />}
              </div>
              <p className="mt-3 font-display text-xl font-bold leading-snug sm:text-2xl">{s.text}</p>
            </li>
          );
        })}
      </ol>

      {/* Datos prácticos y nota de encaje */}
      <div className="mt-8 flex flex-col gap-5 border-t border-line pt-6 lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[16px] text-fg-muted">
          <li className="flex items-center gap-2.5">
            <Clock size={22} className="text-accent" aria-hidden />
            {agenda.facts[0]}
          </li>
          <li className="flex items-center gap-2.5">
            <VideoCamera size={22} className="text-accent" aria-hidden />
            {agenda.facts[1]}
          </li>
          <li className="flex items-center gap-2.5">
            <Handshake size={22} className="text-accent" aria-hidden />
            {agenda.facts[2]}
          </li>
        </ul>
        <p className="flex items-center gap-3 text-[15px] text-fg-muted lg:max-w-[460px]">
          <Prohibit size={22} className="shrink-0 text-accent" aria-hidden />
          {agenda.note}
        </p>
      </div>

      {/* Con el botón repetido en cada bloque, este lo pone AgendaSection (fuera de la carga diferida) */}
      {!repeatCta && (
        <div className="mt-8">
          <CtaButton position="llamada" />
        </div>
      )}
    </div>
  );
}
