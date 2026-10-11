"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { SECTORS, S } from "./calc";

const ICONS: Record<string, ReactElement> = {
  tech: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
  services: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" />
    </>
  ),
  agency: <path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM15 9a4 4 0 010 6M18 7a7 7 0 010 10" />,
  realestate: <path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6" />,
  finance: <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6zM9 12l2 2 4-4" />,
  health: <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" />,
  education: <path d="M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6" />,
  industry: <path d="M3 21h18M5 21V11l5 3v-3l5 3V5h4v16" />,
  retail: <path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2" />,
  other: (
    <>
      <circle cx="6" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="18" cy="12" r="1.2" />
    </>
  ),
};
const LABEL_KEY: Record<string, string> = {
  tech: "w013",
  services: "w014",
  agency: "w015",
  realestate: "w016",
  finance: "w017",
  health: "w018",
  education: "w019",
  industry: "w020",
  retail: "w021",
  other: "w022",
};
const OPTIONS = SECTORS.filter(Boolean);
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Desplegable de sector con teclado completo (flechas, Inicio/Fin, escribir la inicial, Esc), como el original. */
export function SectorSelect({ value, onChange, labelId, reduced }: { value: string; onChange: (v: string) => void; labelId: string; reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [act, setAct] = useState(0);
  const [maxH, setMaxH] = useState<number | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const place = () => {
    const l = list.current;
    const b = btn.current;
    if (!l || !b) return;
    l.style.maxHeight = "";
    const r = b.getBoundingClientRect();
    const need = l.scrollHeight + 14;
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const goUp = need > below && above > below + 120;
    setUp(goUp);
    setMaxH(Math.max(160, goUp ? Math.min(need, above) : need));
    if (!goUp && need > below) window.scrollBy({ top: Math.min(need - below, 240), behavior: reduced ? "auto" : "smooth" });
  };
  const doOpen = () => {
    if (open) return;
    place();
    setOpen(true);
    const i = OPTIONS.indexOf(value);
    setAct(i < 0 ? 0 : i);
  };
  const close = () => setOpen(false);
  const choose = (i: number) => {
    onChange(OPTIONS[i]);
    close();
  };
  const move = (i: number) => {
    const n = Math.max(0, Math.min(OPTIONS.length - 1, i));
    setAct(n);
    const l = list.current;
    const o = l?.children[n] as HTMLElement | undefined;
    if (l && o) {
      const top = o.offsetTop;
      const bot = top + o.offsetHeight;
      if (top < l.scrollTop) l.scrollTop = top - 6;
      else if (bot > l.scrollTop + l.clientHeight) l.scrollTop = bot - l.clientHeight + 6;
    }
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener("click", onDoc);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("click", onDoc);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const sel = value ? value : "";
  return (
    <div ref={root} className={`fc-dd${open ? " open" : ""}${up ? " up" : ""}`}>
      <button
        ref={btn}
        type="button"
        id="fc-secBtn"
        role="combobox"
        aria-haspopup="listbox"
        aria-controls="fc-secList"
        aria-expanded={open}
        aria-labelledby={`${labelId} fc-secVal`}
        aria-activedescendant={open ? `fc-sec-${OPTIONS[act]}` : undefined}
        className={`fc-dd-btn${sel ? " has" : ""}`}
        onClick={() => (open ? close() : doOpen())}
        onKeyDown={(e) => {
          const k = e.key;
          if (k === "Tab") return close();
          if (k === "Escape") {
            if (open) {
              e.preventDefault();
              e.stopPropagation();
              close();
            }
            return;
          }
          if (k === "ArrowDown" || k === "ArrowUp") {
            e.preventDefault();
            if (!open) doOpen();
            else move(act + (k === "ArrowDown" ? 1 : -1));
            return;
          }
          if (k === "Home" || k === "End") {
            if (open) {
              e.preventDefault();
              move(k === "Home" ? 0 : OPTIONS.length - 1);
            }
            return;
          }
          if (k === "Enter" || k === " ") {
            e.preventDefault();
            if (open) choose(act);
            else doOpen();
            return;
          }
          if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            if (!open) doOpen();
            const c = norm(k);
            const n = OPTIONS.length;
            for (let j = 1; j <= n; j++) {
              const idx = (act + j) % n;
              if (norm(S(LABEL_KEY[OPTIONS[idx]])).charAt(0) === c) {
                move(idx);
                break;
              }
            }
          }
        }}
      >
        <span className="fc-dd-icon" id="fc-secIc">
          {sel && (
            <svg aria-hidden viewBox="0 0 24 24">
              {ICONS[sel]}
            </svg>
          )}
        </span>
        <span className="fc-dd-val" id="fc-secVal">
          {sel ? S(LABEL_KEY[sel]) : "Elige tu sector"}
        </span>
        <svg aria-hidden className="fc-dd-chev" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <ul
        ref={list}
        id="fc-secList"
        role="listbox"
        aria-labelledby={labelId}
        tabIndex={-1}
        className="fc-dd-list"
        style={maxH ? { maxHeight: maxH } : undefined}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          const li = (e.target as HTMLElement).closest("li");
          if (li) choose(OPTIONS.indexOf(li.dataset.v as string));
        }}
        onMouseMove={(e) => {
          const li = (e.target as HTMLElement).closest("li");
          if (li) {
            const i = OPTIONS.indexOf(li.dataset.v as string);
            if (i !== act) setAct(i);
          }
        }}
      >
        {OPTIONS.map((o, i) => (
          <li key={o} id={`fc-sec-${o}`} role="option" data-v={o} aria-selected={o === sel} className={i === act && open ? "act" : undefined}>
            <svg aria-hidden className="fc-dd-ic" viewBox="0 0 24 24">
              {ICONS[o]}
            </svg>
            <span>{S(LABEL_KEY[o])}</span>
            <svg aria-hidden className="fc-dd-ck" viewBox="0 0 24 24">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}
