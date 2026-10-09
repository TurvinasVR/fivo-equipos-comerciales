"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, CaretDown, ChatCircleText, MagnifyingGlass } from "@phosphor-icons/react";
import type { AskAnswer, AskQuestion } from "@/content/types";
import { typeInto, useInView, useReducedMotion } from "@/lib/hooks";
import { useLanding } from "../landing/LandingContext";
import { focusBooking } from "../CtaButton";
import { track } from "@/lib/analytics";

/* ------------------------------------------------------------------ datos */

type Q = AskQuestion;

/** Cuántos pasos tiene la aparición de cada respuesta (título, filas, etc.). */
function partsOf(a: AskAnswer): number {
  switch (a.kind) {
    case "tags":
      return a.rows.length + 1;
    case "columns":
      return Math.max(...a.columns.map((c) => c.items.length)) + 1;
    case "trend":
      return 2 + a.bullets.length;
    case "timeline":
      return a.events.length + 2;
  }
}

const NODES = [
  { x: 74, y: 58 },
  { x: 232, y: 52 },
  { x: 266, y: 148 },
  { x: 214, y: 240 },
  { x: 76, y: 236 },
  { x: 34, y: 148 },
];
const HUB = { x: 150, y: 148 };

type Phase = "idle" | "typing" | "searching" | "answering" | "done";

/* ------------------------------------------------------------------ grafo */

function MiniGraph({ used, phase, runKey, hover, exit, aria }: { used: number[]; phase: Phase; runKey: string; hover: number | null; exit: "left" | "bottom"; aria: string }) {
  const searching = phase === "searching" || phase === "answering" || phase === "done";
  const out = exit === "left" ? { x: 0, y: HUB.y } : { x: HUB.x, y: 296 };
  return (
    <svg viewBox="0 0 300 296" className="h-full w-full overflow-visible" role="img" aria-label={aria}>
      <defs>
        <radialGradient id="ask-halo">
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.8" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1={HUB.x} y1={HUB.y} x2={out.x} y2={out.y} stroke="var(--color-success)" strokeWidth="1.2" style={{ opacity: searching ? 0.55 : 0, transition: "opacity 400ms cubic-bezier(0.16,1,0.3,1)" }} />
      {NODES.map((n, i) => {
        const on = searching && used.includes(i);
        const hi = hover === i;
        return (
          <g key={i}>
            <line
              x1={HUB.x}
              y1={HUB.y}
              x2={n.x}
              y2={n.y}
              stroke={on ? "var(--color-accent)" : "var(--color-accent)"}
              strokeWidth={hi ? 2 : 1.1}
              style={{ opacity: on ? 0.9 : 0.25, transition: `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${on ? used.indexOf(i) * 160 : 0}ms, stroke 300ms` }}
            />
            <circle cx={n.x} cy={n.y} r={on ? 26 : 12} fill="url(#ask-halo)" style={{ opacity: on ? 1 : 0.35, transition: `all 500ms cubic-bezier(0.16,1,0.3,1) ${on ? used.indexOf(i) * 160 : 0}ms` }} />
            <circle cx={n.x} cy={n.y} r={hi ? 7 : 5} fill={on ? "var(--color-fg)" : "var(--color-fg-muted)"} style={{ transition: "all 300ms cubic-bezier(0.16,1,0.3,1)" }} />
          </g>
        );
      })}
      {/* Pulsos de luz: de cada llamada usada al nodo central y de ahí hacia el chat */}
      {searching &&
        phase !== "done" &&
        used.map((i, k) => (
          <circle key={`${runKey}-${i}`} r="3.5" fill="var(--color-success)">
            <animateMotion dur="1.5s" begin={`${0.2 + k * 0.25}s`} repeatCount="2" path={`M${NODES[i].x} ${NODES[i].y} L${HUB.x} ${HUB.y} L${out.x} ${out.y}`} />
          </circle>
        ))}
      <circle cx={HUB.x} cy={HUB.y} r="27" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="1.4" />
      <circle cx={HUB.x} cy={HUB.y} r="40" fill="none" stroke="var(--color-accent)" strokeOpacity="0.3" />
      {/* Logotipo oficial de Fivo, dentro del nodo central */}
      <image href="/logos/fivo-mark.svg" x={HUB.x - 8.5} y={HUB.y - 10} width="17" height="20" />
    </svg>
  );
}

/* ------------------------------------------------------------------ respuestas */

const vis = (on: boolean) => `transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`;

type Tone = "win" | "lose";
const toneClass = (t: Tone) => (t === "win" ? "text-success" : "text-danger");

function Title({ text, parts }: { text: string; parts: number }) {
  return <p className={`font-sans text-lg font-bold leading-snug sm:text-xl ${vis(parts >= 1)}`}>{text}</p>;
}

function AnswerTags({ q, a, parts }: { q: Q; a: Extract<AskAnswer, { kind: "tags" }>; parts: number }) {
  return (
    <div>
      <Title text={q.title} parts={parts} />
      <ul className="mt-4 space-y-3">
        {a.rows.map((r, i) => (
          <li key={r.tag} className={`grid gap-y-1.5 ${vis(parts >= i + 2)}`}>
            <span className={`inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-accent ${r.freq ? "flex-wrap gap-y-0.5" : ""}`}>
              <i aria-hidden className="status-dot" />
              {r.tag}
              {r.freq && <span className="font-medium text-fg-muted">{r.freq}</span>}
            </span>
            <span className="text-[15px] leading-snug text-fg-muted">{r.line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnswerColumns({ q, a, parts }: { q: Q; a: Extract<AskAnswer, { kind: "columns" }>; parts: number }) {
  return (
    <div>
      <Title text={q.title} parts={parts} />
      <div className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-6">
        {a.columns.map((col) => (
          <div key={col.h} className={vis(parts >= 1)}>
            <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-fg">
              <i aria-hidden className={`status-dot ${toneClass(col.tone)}`} />
              {col.h}
            </p>
            <ul className="space-y-2">
              {col.items.map((t, i) => (
                <li key={t} className={`text-[14px] leading-snug text-fg-muted ${vis(parts >= i + 2)}`}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnswerTrend({ q, a, parts }: { q: Q; a: Extract<AskAnswer, { kind: "trend" }>; parts: number }) {
  return (
    <div>
      <Title text={q.title} parts={parts} />
      <div className={`mt-3 ${vis(parts >= 2)}`}>
        <svg viewBox="0 0 320 120" className="h-[110px] w-full" role="img" aria-label={`Gráfico sin cifras: la línea de ${a.up} sube y la de ${a.down} baja.`}>
          <line x1="8" y1="112" x2="312" y2="112" stroke="var(--color-line-strong)" />
          <line x1="8" y1="8" x2="8" y2="112" stroke="var(--color-line-strong)" />
          <path d="M12 96 C 90 90, 170 56, 292 22" fill="none" stroke="var(--color-success)" strokeWidth="2.4" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={parts >= 2 ? 0 : 1} style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(0.16,1,0.3,1) 200ms" }} />
          <path d="M12 26 C 90 34, 170 70, 292 96" fill="none" stroke="var(--color-danger)" strokeWidth="2.4" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={parts >= 2 ? 0 : 1} style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(0.16,1,0.3,1) 350ms" }} />
          <g style={{ opacity: parts >= 2 ? 1 : 0, transition: "opacity 400ms 1100ms" }}>
            <circle cx="292" cy="22" r="4" fill="var(--color-success)" />
            <circle cx="292" cy="96" r="4" fill="var(--color-danger)" />
            <text x="262" y="14" fill="var(--color-success)" fontSize="12" fontWeight="600">{a.up}</text>
            <text x="232" y="110" fill="var(--color-danger)" fontSize="12" fontWeight="600">{a.down}</text>
          </g>
        </svg>
      </div>
      <ul className="mt-3 space-y-2 text-[14px] leading-snug text-fg-muted">
        {a.bullets.map((b, i) => (
          <li key={b.who} className={`flex gap-2.5 ${vis(parts >= i + 3)}`}>
            <i aria-hidden className={`status-dot mt-[8px] ${toneClass(b.tone)}`} />
            <span><strong className="font-semibold text-fg">{b.who}</strong>{b.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Línea de tiempo corta de una tarea: cada hito con su punto y una línea que los une. */
function AnswerTimeline({ q, a, parts }: { q: Q; a: Extract<AskAnswer, { kind: "timeline" }>; parts: number }) {
  return (
    <div>
      <Title text={q.title} parts={parts} />
      <ol className="relative mt-4 space-y-4">
        <span aria-hidden className="absolute bottom-2 left-[2px] top-2 w-px bg-line-strong" />
        {a.events.map((e, i) => (
          <li key={e.label} className={`relative flex gap-3.5 ${vis(parts >= i + 2)}`}>
            <i aria-hidden className={`status-dot relative z-[1] mt-[7px] ${i === a.events.length - 1 ? "text-danger" : "text-accent"}`} />
            <span className="grid gap-0.5">
              <span className="text-[13px] font-semibold text-fg">{e.label}</span>
              <span className="text-[14px] leading-snug text-fg-muted">{e.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className={`mt-4 flex items-center gap-2 border-t border-line pt-3 text-[14px] text-fg-muted ${vis(parts >= a.events.length + 2)}`}>
        {a.nowLabel}
        <strong className="font-semibold text-fg">{a.now}</strong>
      </p>
    </div>
  );
}

function Answer({ q, parts }: { q: Q; parts: number }) {
  const a = q.answer;
  switch (a.kind) {
    case "tags":
      return <AnswerTags q={q} a={a} parts={parts} />;
    case "columns":
      return <AnswerColumns q={q} a={a} parts={parts} />;
    case "trend":
      return <AnswerTrend q={q} a={a} parts={parts} />;
    case "timeline":
      return <AnswerTimeline q={q} a={a} parts={parts} />;
  }
}

/* ------------------------------------------------------------------ demo */

export default function AskDemo() {
  const { ask } = useLanding();
  const QUESTIONS = ask.questions;
  const reduced = useReducedMotion();
  const [rootRef, inView] = useInView<HTMLDivElement>({ threshold: 0.35 });
  const [sel, setSel] = useState(0);
  const [started, setStarted] = useState(false);
  // Estado inicial estático ya pintado (el que ve el HTML del servidor): primera pregunta con su respuesta completa.
  // `armed` indica que la animación está activa: se arma al cargar el JavaScript si la demo aún no se ve, y al elegir pregunta.
  const [armed, setArmed] = useState(false);
  const [phase, setPhase] = useState<Phase>("done");
  const [parts, setParts] = useState(() => partsOf(ask.questions[0].answer));
  const [open, setOpen] = useState<boolean[]>([true, true, true]);
  // Plegado a mano por quien lo pide: solo entonces cambia la altura. La animación nunca pliega ni despliega (sin saltos de diseño).
  const [folded, setFolded] = useState<boolean[]>([false, false, false]);
  const [hover, setHover] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);
  const qRef = useRef<HTMLSpanElement>(null);

  // Al cargar el JavaScript: si la demo ya está a la vista se queda como está (sin parpadeo); si no, se prepara la animación
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
    setPhase("idle");
    setParts(0);
    setOpen([false, false, false]);
  }, [rootRef]);

  useEffect(() => {
    if (inView && armed) setStarted(true);
  }, [inView, armed]);

  useEffect(() => {
    if (!started) return;
    const q = QUESTIONS[sel];
    const total = partsOf(q.answer);
    setOpen([false, false, false]);
    if (reduced) {
      if (qRef.current) qRef.current.textContent = q.q;
      setPhase("done");
      setParts(total);
      setOpen([true, true, true]);
      return;
    }
    setPhase("typing");
    setParts(0);
    if (qRef.current) qRef.current.textContent = "";
    const timers: number[] = [];
    const cancelType = typeInto(qRef.current, q.q, 20, () => {
      timers.push(
        window.setTimeout(() => {
          setPhase("searching");
          timers.push(
            window.setTimeout(() => {
              setPhase("answering");
              for (let i = 1; i <= total; i++) timers.push(window.setTimeout(() => setParts(i), (i - 1) * 650 + 80));
              timers.push(
                window.setTimeout(() => {
                  setPhase("done");
                  [0, 1, 2].forEach((k) => timers.push(window.setTimeout(() => setOpen((o) => o.map((v, j) => (j === k ? true : v))), k * 180)));
                }, total * 650 + 250),
              );
            }, 1200),
          );
        }, 250),
      );
    });
    return () => {
      cancelType();
      timers.forEach(window.clearTimeout);
    };
  }, [sel, started, reduced, runId, QUESTIONS]);

  const q = QUESTIONS[sel];
  const pick = (i: number) => {
    if (i === sel) setRunId((n) => n + 1);
    setSel(i);
    setFolded([false, false, false]);
    setArmed(true);
    setStarted(true);
  };
  const searching = phase === "searching";

  return (
    <div ref={rootRef} className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-[300px_1fr] lg:gap-6">
      {/* Preguntas */}
      <div
        role="group"
        aria-label="Elige una pregunta"
        className="flex flex-col gap-2"
      >
        {QUESTIONS.map((it, i) => {
          const on = i === sel;
          return (
            <button
              key={it.id}
              type="button"
              aria-pressed={on}
              onClick={() => pick(i)}
              className={`flex min-h-[64px] w-full cursor-pointer items-start gap-3 rounded-[12px] border p-4 text-left text-[15px] leading-snug transition-colors duration-200 ${
                on ? "border-accent bg-accent-soft text-fg" : "border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              <ChatCircleText size={20} weight={on ? "fill" : "regular"} className={`mt-0.5 shrink-0 ${on ? "text-accent" : "text-fg-muted"}`} aria-hidden />
              {it.q}
            </button>
          );
        })}
      </div>

      {/* Ventana de chat + grafo */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 text-[13px] text-fg-muted sm:px-5">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/fivo-mark.svg" alt="" width={13} height={15} className="h-[15px] w-[13px]" />
            Fivo Chat
          </span>
          <span className="inline-flex items-center gap-1.5 text-fg-muted"><i aria-hidden className="status-dot text-accent" />Ejemplo</span>
        </div>

        <div className="ask-grid">
          {/* Grafo: en móvil, reducido y encima del chat */}
          <div style={{ gridArea: "graph" }} className="h-[150px] border-b border-line px-4 py-2 sm:h-[290px] sm:border-b-0 sm:border-l sm:py-3">
            <div className="mx-auto h-full max-h-[300px] sm:hidden">
              <MiniGraph used={q.used} phase={phase} runKey={`${sel}-${runId}`} hover={hover} exit="bottom" aria={ask.graphAria} />
            </div>
            <div className="hidden h-full sm:block">
              <MiniGraph used={q.used} phase={phase} runKey={`${sel}-${runId}`} hover={hover} exit="left" aria={ask.graphAria} />
            </div>
          </div>

          <div style={{ gridArea: "chat" }} className="min-h-[420px] p-4 sm:p-5" aria-live="polite">
            <p className="sr-only">{phase === "done" ? q.sr : "Escribiendo la respuesta de ejemplo."}</p>
            <div aria-hidden>
              <div className="ml-auto min-h-[62px] max-w-[94%] rounded-[12px] bg-accent-soft text-fg px-4 py-2.5 text-[14px] font-medium leading-snug" style={{ opacity: phase === "idle" ? 0.4 : 1 }}>
                <span ref={qRef}>{phase === "idle" ? ask.placeholder : reduced || !armed ? q.q : ""}</span>
              </div>

              <div className="mt-3 flex h-6 items-center gap-2 pl-1 text-[13px] text-accent" style={{ opacity: searching ? 1 : 0, transition: "opacity 250ms" }}>
                <MagnifyingGlass size={16} aria-hidden />
                {ask.searching}
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <i key={d} className="h-1.5 w-1.5 rounded-full bg-accent" style={{ animation: searching && !reduced ? `ask-dot 900ms ${d * 140}ms infinite` : "none" }} />
                  ))}
                </span>
              </div>

              <div className="mt-2 min-h-[250px]">
                {/* Siempre montada (con sus piezas invisibles hasta que toca): la altura no cambia al animarse */}
                <Answer q={q} parts={phase === "idle" || phase === "typing" || phase === "searching" ? 0 : parts} />
              </div>
            </div>

            {ask.cta && (
              <div className="mt-2 flex min-h-[44px] items-center">
                <a
                  href="#agendar"
                  data-cta="pregunta-enlace"
                  tabIndex={phase === "done" ? 0 : -1}
                  inert={phase !== "done" || undefined}
                  onClick={() => {
                    track("cta_click", { position: "pregunta-enlace" });
                    focusBooking();
                  }}
                  className="group inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-accent underline-offset-4 hover:underline"
                  style={{ opacity: phase === "done" ? 1 : 0, transform: phase === "done" ? "none" : "translateY(6px)", transition: "opacity 400ms 500ms, transform 400ms 500ms" }}
                >
                  {ask.cta}
                  <span className="cta-arrow" data-dir="down" aria-hidden>
                    <ArrowDown size={16} weight="bold" />
                  </span>
                </a>
              </div>
            )}
          </div>
          {/* Fichas de llamada: las fuentes de la respuesta, enlazadas con sus nodos */}
            <div style={{ gridArea: "src" }} className="grid gap-2 px-4 pb-4 sm:border-l sm:border-line sm:px-4 sm:pt-0" aria-hidden={phase !== "done"}>
              {q.calls.map((c, i) => (
                <button
                  key={`${q.id}-${i}`}
                  type="button"
                  tabIndex={phase === "done" ? 0 : -1}
                  aria-expanded={!folded[i]}
                  onClick={() => setFolded((f) => f.map((v, j) => (j === i ? !v : v)))}
                  onPointerEnter={() => setHover(q.used[i])}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(q.used[i])}
                  onBlur={() => setHover(null)}
                  className="min-h-[44px] cursor-pointer border-t border-line px-0 py-2.5 text-left text-[13px] leading-snug text-fg"
                  style={{ opacity: phase === "done" ? 1 : 0, transform: phase === "done" ? "none" : "translateY(6px)", transition: `opacity 400ms ${i * 140}ms, transform 400ms ${i * 140}ms` }}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                      {q.sourceLabel ?? "Llamada"} {i + 1}
                    </span>
                    <CaretDown size={14} className="shrink-0 text-fg-muted transition-transform duration-300" style={{ transform: folded[i] ? "none" : "rotate(180deg)" }} aria-hidden />
                  </span>
                  <span className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: folded[i] ? "0fr" : "1fr" }}>
                    <span className="overflow-hidden transition-opacity duration-500" style={{ opacity: open[i] ? 1 : 0 }}>
                      <span className="mt-1.5 block text-fg-muted">{c.title}</span>
                      {c.note && (
                        <span className="flex items-center gap-1.5 text-[12px] text-fg-muted">
                          {c.tone && <i aria-hidden className={`status-dot ${toneClass(c.tone)}`} />}
                          {c.note}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
