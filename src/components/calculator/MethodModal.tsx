"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CFG, S, buildTable, dec, encodeState, eur, eur2, pct, tr, usersN } from "./calc";
import type { CalcResult, CalcState } from "./calc";

type Msg = { text: string; bad: boolean } | null;

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Ventana "Cómo se calcula tu resultado": desglose línea a línea, facturación, "Pon a prueba los supuestos",
 * enlace compartible, PDF (imprime solo esta ventana) y envío del informe. Copia fiel de la original.
 */
export function MethodModal({
  state,
  r,
  set,
  onClose,
  onPdf,
  onReportSent,
  source,
}: {
  state: CalcState;
  r: CalcResult;
  set: (patch: Partial<CalcState>) => void;
  onClose: () => void;
  onPdf: () => void;
  onReportSent: () => void;
  source: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");

  // Foco dentro, Esc cierra, el tabulador no sale de la ventana, la página de detrás no se desplaza
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("fc-md-open");
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !box.current) return;
      const f = Array.prototype.filter.call(box.current.querySelectorAll(FOCUSABLE), (x: HTMLElement) => x.offsetParent !== null) as HTMLElement[];
      if (!f.length) {
        e.preventDefault();
        return;
      }
      const first = f[0];
      const last = f[f.length - 1];
      const a = document.activeElement;
      if (e.shiftKey && (a === first || a === box.current || !box.current.contains(a))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (a === last || !box.current.contains(a))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("fc-md-open");
      if (opener && document.contains(opener) && opener.focus) opener.focus();
    };
  }, [onClose]);

  const { rows, check } = r.ready ? buildTable(r, state) : { rows: [], check: "" };
  const fillStyle = (v: number, mn: number, mx: number) => ({ ["--fill" as string]: `${(100 * (v - mn)) / (mx - mn)}%` });
  const shareLink = () => location.origin + location.pathname + location.search + "#" + encodeState(state);

  const copy = () => {
    const url = shareLink();
    const fallback = () => window.prompt(tr("copyPrompt"), url);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => setMsg({ text: tr("copied"), bad: false }), fallback);
    } else fallback();
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setMsg({ text: tr("emailBad"), bad: true });
      document.getElementById("fc-email")?.focus();
      return;
    }
    if (!r.ready) {
      setMsg({ text: tr("needData"), bad: true });
      return;
    }
    // Mismo cuerpo que la original; `source` identifica el origen de este envío (gracias-<landing>)
    const payload = {
      email: addr,
      lang: "es",
      hp,
      source,
      inputs: state,
      results: { tools: r.tools, audit: r.audit, value: r.value, benefits: r.gross, cost: r.cost, net: r.net },
      link: shareLink(),
    };
    fetch(CFG.leadEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then((res) => {
        if (!res.ok) throw 0;
        setMsg({ text: tr("sent", { email: addr }), bad: false });
        onReportSent();
      })
      .catch(() => setMsg({ text: tr("sendFail"), bad: true }));
  };

  return createPortal(
    <div className="fc-modal fc-modal-host">
      <div className="fc-modal-backdrop" onClick={onClose} />
      <div ref={box} className="fc-modal-box" role="dialog" aria-modal="true" aria-labelledby="fc-mdTitle" tabIndex={-1}>
        <div className="fc-md-head">
          <h2 id="fc-mdTitle">{S("m001")}</h2>
          <button type="button" className="fc-md-x" aria-label={S("m002")} onClick={onClose}>
            ×
          </button>
        </div>
        <div className="fc-md-body">
          <p className="fc-md-intro">{S("s072")}</p>
          <table className="fc-tbl" id="fc-tbl">
            <tbody>
              {!r.ready ? (
                <tr>
                  <td colSpan={2} style={{ padding: 0, border: 0 }}>
                    <p className="fc-empty-note">{tr("empty")}</p>
                  </td>
                </tr>
              ) : (
                rows.map((x, i) => {
                  if (x.kind === "group")
                    return (
                      <tr key={i} className="group">
                        <td>{x.label}</td>
                        <td />
                      </tr>
                    );
                  if (x.kind === "item")
                    return (
                      <tr key={i}>
                        <td>
                          {x.label}
                          <span className={`fc-tag ${x.tag}`}>{x.tagText}</span>
                          <span className="note">{x.note}</span>
                        </td>
                        <td className="amt">{x.amt}</td>
                      </tr>
                    );
                  return (
                    <tr key={i} className={`${x.kind}${x.kind === "total" && x.neg ? " neg" : ""}`}>
                      <td>
                        {x.label}
                        {x.note && <span className="note">{x.note}</span>}
                      </td>
                      <td className="amt">{x.amt}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* Cifras internas (números ya formateados): se pintan con su marcado, como en la original */}
          <p className="fc-check" id="fc-check" dangerouslySetInnerHTML={{ __html: check }} />

          <div className="fc-rs-pad">
            <div className="fc-bill">
              <div className="fc-bill-l">
                <span className="t">{S("s042")}</span>
                <span className="d">
                  {tr(state.plan === "annual" ? "billA" : "billM", {
                    us: usersN(r.people),
                    price: eur2(state.plan === "annual" ? CFG.priceAnnual : CFG.priceMonthly),
                    cost: eur(r.cost),
                  })}
                </span>
              </div>
              <div className="fc-seg" role="group" aria-label={S("s098")}>
                <button type="button" aria-pressed={state.plan === "monthly"} onClick={() => set({ plan: "monthly" })}>
                  {S("s043")}
                </button>
                <button type="button" aria-pressed={state.plan === "annual"} onClick={() => set({ plan: "annual" })}>
                  <span>{S("s044")}</span> <span className="save">{S("s045")}</span>
                </button>
              </div>
            </div>
            {r.ready && (
              <p
                className="fc-bill-note"
                dangerouslySetInnerHTML={{
                  __html:
                    state.plan === "annual" || r.netIfAnnual <= 0
                      ? tr("noteA", { s: eur(r.costMonthly - r.costAnnual) })
                      : tr("noteM", { s: eur(r.costMonthly - r.costAnnual), n: eur(r.netIfAnnual) }),
                }}
              />
            )}
          </div>

          <div className="fc-rs-pad fc-assume">
            <h3>{S("s061")}</h3>
            <p className="mini-sub">{S("s062")}</p>
            <div className="fc-range-row">
              <div className="top">
                <span>{S("s063")}</span>
                <b>{pct(r.rec)}</b>
              </div>
              <input
                type="range"
                id="fc-rec"
                min={0}
                max={50}
                step={1}
                value={state.rec}
                aria-label={S("s101")}
                style={fillStyle(state.rec, 0, 50)}
                onChange={(e) => set({ rec: parseFloat(e.target.value) })}
              />
              <p className="eq">{tr("recEq", { h: dec((CFG.hoursWeek * CFG.searchShare * r.rec) / 100), p: pct(Math.round(CFG.searchShare * 100)) })}</p>
            </div>
            <label className="fc-opt">
              <span className="t">
                <input type="checkbox" id="fc-revOn" checked={state.revOn} onChange={(e) => set({ revOn: e.target.checked })} />
                <span>
                  <span>{S("s064")}</span>
                  <small>{S("s065")}</small>
                </span>
              </span>
              {state.revOn && (
                <div className="more">
                  <div className="fc-range-row" style={{ margin: 0 }}>
                    <div className="top">
                      <span>{S("s066")}</span>
                      <b>{pct(r.uplift)}</b>
                    </div>
                    <input
                      type="range"
                      id="fc-up"
                      min={0}
                      max={5}
                      step={0.5}
                      value={state.uplift}
                      aria-label={S("s102")}
                      style={fillStyle(state.uplift, 0, 5)}
                      onChange={(e) => set({ uplift: parseFloat(e.target.value), upliftSet: true })}
                    />
                  </div>
                </div>
              )}
            </label>
            <div className="fc-range-row">
              <div className="top">
                <span>{S("s067")}</span>
                <b>{pct(Math.round(r.subst))}</b>
              </div>
              <input
                type="range"
                id="fc-sub"
                min={0}
                max={100}
                step={5}
                value={state.subst}
                aria-label={S("s103")}
                style={fillStyle(state.subst, 0, 100)}
                onChange={(e) => set({ subst: parseFloat(e.target.value) })}
              />
            </div>
            <label className="fc-opt">
              <span className="t">
                <input type="checkbox" id="fc-audOn" checked={state.audOn} onChange={(e) => set({ audOn: e.target.checked })} />
                <span>
                  <span>{S("w050")}</span>
                  <small>{S("w051")}</small>
                </span>
              </span>
            </label>
          </div>

          <div className="fc-rs-pad fc-share">
            <div className="fc-rs-btns">
              <button type="button" className="fc-btn fc-btn-line fc-btn-rect fc-btn-sm" id="fc-copyBtn" onClick={copy}>
                {S("s059")}
              </button>
              <button
                type="button"
                className="fc-btn fc-btn-line fc-btn-rect fc-btn-sm"
                id="fc-pdfBtn"
                onClick={() => {
                  onPdf();
                  window.print();
                }}
              >
                {S("s060")}
              </button>
            </div>
            {/* Como en la original: sin destino configurado el formulario "Enviarme mi informe" queda oculto */}
            {CFG.leadEndpoint && (
              <>
                <form className="fc-lead" id="fc-leadForm" noValidate onSubmit={send}>
                  <input type="text" name="company" className="fc-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
                  <div className="fc-input">
                    <input
                      id="fc-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder={S("s099")}
                      aria-label={S("s100")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="fc-btn fc-btn-send fc-btn-rect">
                    {S("s058")}
                  </button>
                </form>
                <p className="fc-legal">
                  <span>{S("n004")}</span>{" "}
                  <a href={CFG.privacyUrl} target="_blank" rel="noopener">
                    {S("s085")}
                  </a>
                  .
                </p>
              </>
            )}
            <p className={`fc-msg${msg ? (msg.bad ? " bad" : " ok") : ""}`} role="status">
              {msg?.text}
            </p>
          </div>
          <p className="fc-est-note fc-rs-pad">{S("e001")}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
