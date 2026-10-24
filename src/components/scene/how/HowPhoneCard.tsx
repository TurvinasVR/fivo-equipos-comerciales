"use client";

import type { HowScene } from "@/content/types";
import { useReducedMotion, useScrollProgress } from "@/lib/hooks";

/**
 * Pasos 2 y 3 de "Cómo funciona" en móvil: solo la tarjeta (la videollamada o el chat), sin el grafo de herramientas,
 * que ya se ve en el paso 1. Todo avanza con el scroll (sin temporizadores) y la tarjeta mide lo que su contenido: los
 * textos que se escriben ocupan su sitio desde el principio, así que nada se mueve. Con movimiento reducido, estado final.
 */

const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Texto que se escribe letra a letra: lo que falta queda invisible y ya ocupa su sitio. */
function Typed({ text, k }: { text: string; k: number }) {
  const n = Math.round(text.length * k);
  return (
    <>
      {text.slice(0, n)}
      <span className="opacity-0">{text.slice(n)}</span>
    </>
  );
}

const show = (k: number, dy = 8) => ({ opacity: k, transform: `translateY(${((1 - k) * dy).toFixed(1)}px)` });

function Header({ title, logo }: { title: string; logo?: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between text-[12px] text-fg-muted">
      <span className="flex items-center gap-1.5">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/logos/fivo-mark.svg" alt="" width={12} height={14} className="h-[14px] w-[12px]" />
        ) : (
          <span className="h-2 w-2 rounded-full bg-fg-muted" />
        )}
        {title}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i aria-hidden className="status-dot status-dot--brand" />
        Ejemplo
      </span>
    </div>
  );
}

const BARS = 26;

function CallCard({ scene, p }: { scene: HowScene; p: number }) {
  // Sube al empezar a hablar y al final queda en reposo (nunca plana: se sigue leyendo como audio)
  const wave = seg(p, 0.15, 0.3) * (1 - 0.6 * seg(p, 0.75, 0.9));
  const combine = seg(p, 0.72, 0.88);
  return (
    <>
      <Header title={scene.callTitle} />
      <div className="grid grid-cols-5 gap-1.5">
        {scene.initials.map((ini, k) => {
          const v = 0.35 + 0.65 * seg(p, k * 0.03, 0.08 + k * 0.03);
          return (
            <div key={ini} className="flex aspect-square items-center justify-center rounded-[12px] border border-line bg-bg" style={{ opacity: v, transform: `scale(${(0.9 + 0.1 * v).toFixed(3)})` }}>
              <span className="flex h-[58%] w-[58%] items-center justify-center rounded-full bg-brand font-sans text-sm font-bold text-bg">{ini}</span>
            </div>
          );
        })}
        <div className="flex aspect-square items-center justify-center rounded-[12px] border border-accent/70 bg-bg" style={show(0.35 + 0.65 * seg(p, 0.1, 0.2), 0)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/fivo-mark.svg" alt="" width={22} height={26} className="h-[26px] w-[22px]" />
        </div>
      </div>
      <p className="mt-1.5 text-right text-[12px] text-accent" style={{ opacity: 0.35 + 0.65 * seg(p, 0.1, 0.2) }}>
        {scene.assistantCaption}
      </p>

      {/* Onda de audio: se mueve con el scroll mientras se habla */}
      <div className="mt-2 flex h-7 items-center justify-center gap-[3px]">
        {Array.from({ length: BARS }, (_, i) => {
          const amp = wave * (0.45 + 0.55 * Math.abs(Math.sin(p * 46 + i * 0.75))) * (0.6 + 0.4 * Math.sin(i * 0.5 + p * 9));
          return <span key={i} className="h-full w-[3px] origin-center rounded-full bg-brand-y" style={{ transform: `scaleY(${(0.12 + 0.88 * Math.max(0, amp)).toFixed(3)})` }} />;
        })}
      </div>

      {/* Lo que se dice: objeción, respuesta y acuerdo, uno debajo de otro */}
      <ul className="mt-3 space-y-2 text-[13px] leading-snug text-fg-muted">
        {scene.transcript.map((l, j) => {
          const k = seg(p, 0.28 + j * 0.13, 0.4 + j * 0.13);
          return (
            <li key={l.who} className="flex items-start gap-2.5" style={{ opacity: 0.4 + 0.6 * Math.min(1, k * 3) }}>
              <span aria-hidden className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent">
                <i className="status-dot status-dot--brand" />
              </span>
              <span>
                <span className="font-semibold text-fg">{l.who}: </span>
                <Typed text={l.text} k={k} />
              </span>
            </li>
          );
        })}
      </ul>

      {/* Debajo (no encima): los tres se conectan entre sí */}
      <div className="mt-3 rounded-[12px] border border-accent/60 bg-bg p-3" style={show(combine)}>
        <p className="text-[12px] font-semibold text-accent">{scene.combineLabel}</p>
        <svg viewBox="0 0 160 52" className="mt-1 h-[52px] w-full" aria-hidden>
          <g stroke="var(--color-accent)" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round">
            {[
              [30, 36, 80, 12],
              [80, 12, 130, 36],
              [30, 36, 130, 36],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - seg(combine, 0.2 + i * 0.2, 0.6 + i * 0.2)} />
            ))}
          </g>
          {[
            [30, 36],
            [80, 12],
            [130, 36],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="7" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="1.4" />
          ))}
        </svg>
      </div>
    </>
  );
}

function ChatCard({ scene, p }: { scene: HowScene; p: number }) {
  const q = seg(p, 0, 0.3);
  const n = scene.answer.length;
  return (
    <>
      <Header title="Fivo Chat" logo />
      <div className="ml-auto max-w-[92%] rounded-[12px] bg-accent-soft px-3.5 py-2.5 text-[14px] font-medium leading-snug text-fg" style={{ opacity: 0.55 + 0.45 * Math.min(1, q * 4) }}>
        <Typed text={scene.question} k={Math.max(0.12, q)} />
      </div>
      <div className="mt-3 space-y-2 text-[14px] leading-snug text-fg-muted">
        {scene.answer.map((a, j) => {
          const k = seg(p, 0.34 + (j * 0.42) / n, 0.34 + ((j + 1) * 0.42) / n);
          return (
            <p key={a}>
              <Typed text={a} k={k} />
            </p>
          );
        })}
      </div>
      {/* Las fuentes de la respuesta: las llamadas del ejemplo */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {scene.chips.map((c, j) => (
          <span key={c.text} className="flex items-center gap-2 rounded-full border border-line bg-bg px-2.5 py-1 text-[12px] text-fg" style={show(seg(p, 0.8 + j * 0.05, 0.9 + j * 0.05), 6)}>
            <i aria-hidden className={`status-dot ${c.tone === "lose" ? "text-danger" : "text-success"}`} />
            {c.text}
          </span>
        ))}
      </div>
    </>
  );
}

export function HowPhoneCard({ k, scene }: { k: 1 | 2; scene: HowScene }) {
  const reduced = useReducedMotion();
  const [ref, p] = useScrollProgress<HTMLDivElement>(!reduced, 0.92, 0.7);
  return (
    <div ref={ref} aria-hidden className="w-full rounded-[12px] border border-line bg-surface p-3.5">
      {k === 1 ? <CallCard scene={scene} p={p} /> : <ChatCard scene={scene} p={p} />}
    </div>
  );
}
