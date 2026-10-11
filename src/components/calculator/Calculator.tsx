"use client";

import "./calculator.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { currentLanding, track, trackOnce } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/hooks";
import {
  CFG,
  LAST,
  S,
  compute,
  decodeState,
  eur,
  eur2,
  initialState,
  monthlyCost,
  posInt,
  sizeBucket,
  tierSet,
  tr,
} from "./calc";
import type { CalcState } from "./calc";
import { MethodModal } from "./MethodModal";
import { NumField } from "./NumField";
import { SectorSelect } from "./SectorSelect";

const LIVE_STATUS = ["", "Analizando tu sector…", "Estimando tus ventas…", "Valorando tus herramientas…"];
const STEP_LABELS = ["s012", "w010", "s013", "s014"];

/** Cifra que sube o baja hasta su valor (350 ms), o cuenta desde 0 la primera vez que sale el resultado. */
function useTween(target: number, reduced: boolean, startFrom?: number, ms = 350) {
  const [shown, setShown] = useState(startFrom ?? target);
  const ref = useRef(shown);
  useEffect(() => {
    if (reduced || ref.current === target) {
      ref.current = target;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(target);
      return;
    }
    const from = ref.current;
    const t0 = performance.now();
    let raf = 0;
    const f = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const v = k < 1 ? Math.round(from + (target - from) * e) : target;
      ref.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, ms]);
  return shown;
}

const Arrow = () => (
  <svg aria-hidden fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function Radio({ name, value, checked, onPick, children, box }: { name: string; value: string; checked: boolean; onPick: (v: string) => void; children: React.ReactNode; box?: boolean }) {
  return (
    <label className={`fc-ch${box ? " box" : ""}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onPick(value)} />
      <span>{children}</span>
    </label>
  );
}

function Result({ state, r, reduced, first, onBack, onOpen }: { state: CalcState; r: ReturnType<typeof compute>; reduced: boolean; first: boolean; onBack: () => void; onOpen: () => void }) {
  const from = first ? 0 : undefined;
  const save = useTween(r.save, reduced, from, 700);
  const earn = useTween(r.earn, reduced, from, 700);
  const cost = useTween(Math.round(monthlyCost(r, state.plan) * 100), reduced, from, 700);
  const net = useTween(r.net, reduced, from, 1100);
  const pos = r.net > 0;
  return (
    <section id="fc-step4" aria-label={S("s014")}>
      <div className="fc-rs">
        <p className="fc-rs-back">
          <button type="button" className="fc-link-btn" id="fc-editData" onClick={onBack}>
            {S("s070")}
          </button>
        </p>
        <div className="fc-res" id="fc-netCard">
          <h2 className="fc-rs-title">{S("r001")}</h2>
          <p className={`fc-net${pos ? "" : " neg"}`} id="fc-net">
            <span className="fc-net-k" id="fc-rcTail">
              {tr(pos ? "calcTail" : "calcTailNeg")}
            </span>
            <b className="fc-net-n" id="fc-rcEq">
              {tr(pos ? "calcEq" : "calcEqNeg", { n: eur(net) })}
            </b>
          </p>
          {!pos && (
            <p className="fc-rs-negnote" id="fc-rcNeg">
              {tr("calcNeg", { n: eur(r.net) })}
            </p>
          )}
          <div className="fc-dual" id="fc-dual">
            <div className="fc-stat">
              <span className="dl">{S("r002")}</span>
              <p className="big" id="fc-saveBig">
                {eur(save)}
              </p>
              <span className="dy">{S("r004")}</span>
            </div>
            {state.revOn && (
              <div className="fc-stat plus" id="fc-earnBox">
                <span className="dl">{S("r003")}</span>
                <p className="big" id="fc-earnBig">
                  {eur(earn)}
                </p>
                <span className="dy">{S("r004")}</span>
              </div>
            )}
            <div className="fc-stat minus" id="fc-costBox">
              <span className="dl">Coste de Fivo al mes</span>
              <p className="big" id="fc-costBig">
                {eur2(cost / 100)}
              </p>
              <span className="dy" id="fc-costYear">
                {eur(r.cost) + " al año"}
              </span>
            </div>
          </div>
          <p className="fc-rs-price" id="fc-priceMsg">
            {tr("priceMsg", { max: eur(Math.floor(CFG.priceMonthly) + 1) })}
          </p>
          <p className="fc-rs-est">
            <span>{S("r030")}</span> ·{" "}
            <button type="button" className="fc-rs-link" id="fc-openCalc" onClick={onOpen}>
              {S("r031")}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Calculadora "¿Cuánto dinero se le escapa a tu empresa cada año?": copia de la de calculadora.fivo.info
 * (mismos pasos, fórmulas y textos). Sin iframe ni carga de la web original. Analítica: solo la de esta landing.
 */
export function Calculator() {
  const [state, setState] = useState<CalcState>(initialState);
  const [maxStep, setMaxStep] = useState(1);
  const [modal, setModal] = useState(false);
  const [anim, setAnim] = useState(false);
  const [first, setFirst] = useState(false);
  const [srText, setSrText] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const skipScroll = useRef(true);
  const reduced = useReducedMotion();
  const r = useMemo(() => compute(state), [state]);

  const members = posInt(state.reps, 1e5) + posInt(state.rest, 1e5);
  const params = () => ({ sector: state.sector || undefined, team_size: sizeBucket(members), step: state.step });
  const source = `gracias-${currentLanding()}`;

  // Enlace compartido (#c=…): carga el cálculo y lo deja en su paso
  useEffect(() => {
    const s = decodeState(location.hash);
    if (!s) return;
    const c = compute(s);
    if (s.step === LAST && !c.ready) s.step = 1;
    else if (s.step > 1 && !(c.people >= 1 && c.team > 0)) s.step = 1;
    done.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(s);
    setMaxStep(s.step);
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch {
      /* sin historial */
    }
    requestAnimationFrame(() => root.current?.scrollIntoView({ behavior: "auto", block: "start" }));
  }, []);

  // Al cambiar de paso, la calculadora vuelve a la vista (sin saltar al principio de la página)
  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    root.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [state.step, reduced]);

  const started = useRef(false);
  const startTracking = useCallback(() => {
    if (started.current) return;
    started.current = true;
    trackOnce("calculator_start", {});
  }, []);

  const set = useCallback(
    (patch: Partial<CalcState>) => {
      startTracking();
      setState((s) => ({ ...s, ...patch }));
    },
    [startTracking],
  );

  const canNext1 = r.people >= 1 && r.team > 0;
  const goto = (n: number) => {
    const firstTime = n === LAST && !done.current && r.ready;
    if (firstTime) {
      done.current = true;
      setFirst(true);
      trackOnce("calculator_complete", { sector: state.sector || undefined, team_size: sizeBucket(members) });
    } else if (n !== LAST) setFirst(false);
    startTracking();
    setAnim(true);
    setMaxStep((m) => Math.max(m, n));
    setState((s) => ({ ...s, step: n }));
  };

  // Aviso para lectores de pantalla, con retraso como en la original
  useEffect(() => {
    const t = window.setTimeout(() => {
      setSrText(state.step === LAST ? (r.net > 0 ? tr("stickyProfit", { x: eur(r.net) }) : tr("stickyNoProfit")) : LIVE_STATUS[state.step]);
    }, 800);
    return () => window.clearTimeout(t);
  }, [state.step, r.net]);

  const ts = tierSet(state.calls);
  const b = ts.bounds;
  const tierLabels = [tr("tierUp", { a: eur(b[0]) }), tr("tierMid", { a: eur(b[0]), b: eur(b[1]) }), tr("tierMid", { a: eur(b[1]), b: eur(b[2]) }), tr("tierOver", { a: eur(b[2]) })];
  const capped = !state.appsUnknown && r.appsRepIn > r.appsM;
  const next = (n: number) => () => goto(n);
  const result = state.step === LAST;

  const pick = (name: "recCalls" | "hasConsult" | "optimize") => (v: string) => {
    const patch: Partial<CalcState> = { [name]: v };
    if (name === "hasConsult" && v === "no") patch.consultTier = -1;
    if (name === "recCalls" && !state.upliftSet) patch.uplift = CFG.upliftByReview[v];
    set(patch);
  };
  const step = (field: "reps" | "rest", d: number) => set({ [field]: Math.max(0, Math.min(99999, state[field] + d)) });

  return (
    <div ref={root} className={`fc${anim ? " anim" : ""}`} id="fc-calc">
      {!result && (
        <ol className="fc-steps" id="fc-steps" aria-label={S("s092")}>
          {STEP_LABELS.map((k, i) => {
            const n = i + 1;
            return (
              <li key={n} className={`fc-stp${state.step === n ? " on" : ""}${state.step > n ? " done" : ""}`}>
                {n > 1 && (
                  <div aria-hidden className="fc-stp-line">
                    <i />
                  </div>
                )}
                <button
                  type="button"
                  className="fc-stp-btn"
                  disabled={n > maxStep}
                  aria-current={state.step === n ? "step" : undefined}
                  onClick={() => {
                    if (n === state.step || n > maxStep) return;
                    if (n > 1 && !canNext1) return;
                    goto(n);
                  }}
                >
                  <b>
                    <em className="n" style={{ fontStyle: "normal" }}>
                      {n}
                    </em>
                    <svg aria-hidden className="ck" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </b>
                  <span>{S(k)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <div className="fc-wrap">
        <div className="fc-shell" hidden={result}>
          <section aria-labelledby="fc-h1s" className="fc-wiz" id="fc-step1" hidden={state.step !== 1}>
            <div className="fc-wiz-body">
              <h2 className="fc-q-title" id="fc-h1s" style={{ marginBottom: 16 }}>
                ¿A qué sector pertenece tu empresa?
              </h2>
              <SectorSelect value={state.sector} onChange={(v) => set({ sector: v })} labelId="fc-h1s" reduced={reduced} />
              <p className="fc-q-sub" id="fc-memTitle">
                {S("w023")}
              </p>
              <div className="fc-fields" role="group" aria-labelledby="fc-memTitle">
                <div className="fc-fld">
                  <label htmlFor="fc-reps">{S("w024")}</label>
                  <div className="fc-input stepper">
                    <button type="button" className="fc-sq" aria-label="Quitar un comercial" onClick={() => step("reps", -1)}>
                      −
                    </button>
                    <NumField id="fc-reps" value={state.reps} onValue={(n) => set({ reps: n })} onEnter={() => canNext1 && goto(2)} placeholder={S("s093")} invalid={!canNext1 && r.people < 1} describedBy="fc-step1Msg" align="center" />
                    <button type="button" className="fc-sq" aria-label="Añadir un comercial" onClick={() => step("reps", 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="fc-fld">
                  <label htmlFor="fc-rest">{S("w025")}</label>
                  <div className="fc-input stepper">
                    <button type="button" className="fc-sq" aria-label="Quitar una persona del resto del equipo" onClick={() => step("rest", -1)}>
                      −
                    </button>
                    <NumField id="fc-rest" value={state.rest} onValue={(n) => set({ rest: n })} onEnter={() => canNext1 && goto(2)} placeholder={S("s093")} invalid={!canNext1 && r.people < 1} describedBy="fc-step1Msg" align="center" />
                    <button type="button" className="fc-sq" aria-label="Añadir una persona al resto del equipo" onClick={() => step("rest", 1)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
              <p className="fc-q-sub">Tus números</p>
              <div className="fc-fields">
                <div className="fc-fld">
                  <label htmlFor="fc-team">{S("s019")}</label>
                  <div className="fc-input">
                    <NumField id="fc-team" value={state.team} onValue={(n) => set({ team: n })} onEnter={() => canNext1 && goto(2)} placeholder={S("s094")} invalid={!canNext1 && r.team <= 0} describedBy="fc-step1Msg" />
                    <span className="unit">€</span>
                  </div>
                  <p className="fc-hint">{S("s020")}</p>
                </div>
                <div className="fc-fld">
                  <label htmlFor="fc-calls">{S("s021")}</label>
                  <div className="fc-input">
                    <NumField id="fc-calls" value={state.calls} onValue={(n) => set({ calls: n })} onEnter={() => canNext1 && goto(2)} placeholder={S("s095")} />
                    <span className="unit">€</span>
                  </div>
                  <p className="fc-hint">{S("s022")}</p>
                </div>
              </div>
            </div>
            <div className="fc-nav-row">
              <p className="fc-hint warn" id="fc-step1Msg" aria-live="polite">
                {canNext1 ? "" : tr("step1Need")}
              </p>
              <span />
              <button type="button" className="fc-btn fc-btn-main" id="fc-next1" disabled={!canNext1} onClick={next(2)}>
                <span>{S("s023")}</span> <Arrow />
              </button>
            </div>
          </section>

          <section aria-labelledby="fc-h2s" className="fc-wiz" id="fc-step2" hidden={state.step !== 2}>
            <div className="fc-wiz-body">
              <h2 className="fc-q-title" id="fc-h2s">
                {S("w032")}
              </h2>
              <div className="fc-cards c3" role="radiogroup" aria-labelledby="fc-h2s">
                <Radio name="recCalls" value="no" checked={state.recCalls === "no"} onPick={pick("recCalls")}>
                  {S("w033")}
                </Radio>
                <Radio name="recCalls" value="some" checked={state.recCalls === "some"} onPick={pick("recCalls")}>
                  {S("w034")}
                </Radio>
                <Radio name="recCalls" value="yes" checked={state.recCalls === "yes"} onPick={pick("recCalls")}>
                  {S("w035")}
                </Radio>
              </div>
              <fieldset className="fc-q">
                <legend className="fc-q-sub">{S("w036")}</legend>
                <div className="fc-cards c2">
                  <Radio name="hasConsult" value="no" checked={state.hasConsult === "no"} onPick={pick("hasConsult")}>
                    {S("w033")}
                  </Radio>
                  <Radio name="hasConsult" value="yes" checked={state.hasConsult === "yes"} onPick={pick("hasConsult")}>
                    {S("w037")}
                  </Radio>
                </div>
                <div className="fc-sub-q" id="fc-consultBox" hidden={state.hasConsult !== "yes"}>
                  <p className="fc-q-sub">{S("w038")}</p>
                  <div className="fc-cards tiers" id="fc-tiers">
                    {tierLabels.map((t, i) => (
                      <label key={i} className="fc-ch">
                        <input type="radio" name="consultTier" value={i} checked={state.consultTier === i} onChange={() => set({ consultTier: i })} />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>
              <fieldset className="fc-q">
                <legend className="fc-q-sub">{S("w039")}</legend>
                <div className="fc-cards c3">
                  <Radio name="optimize" value="yes" checked={state.optimize === "yes"} onPick={pick("optimize")}>
                    {S("w037")}
                  </Radio>
                  <Radio name="optimize" value="maybe" checked={state.optimize === "maybe"} onPick={pick("optimize")}>
                    {S("w040")}
                  </Radio>
                  <Radio name="optimize" value="no" checked={state.optimize === "no"} onPick={pick("optimize")}>
                    {S("w033")}
                  </Radio>
                </div>
              </fieldset>
            </div>
            <div className="fc-nav-row">
              <button type="button" className="fc-btn fc-btn-line" id="fc-back2" onClick={next(1)}>
                {S("s036")}
              </button>
              <button type="button" className="fc-btn fc-btn-main" id="fc-next2" onClick={next(3)}>
                <span>{S("s023")}</span> <Arrow />
              </button>
            </div>
          </section>

          <section aria-labelledby="fc-h3s" className="fc-wiz" id="fc-step3" hidden={state.step !== 3}>
            <div className="fc-wiz-body">
              <h2 className="fc-q-title" id="fc-h3s">
                {S("w043")}
              </h2>
              <div className="fc-input xl">
                <NumField id="fc-apps" value={state.apps} onValue={(n) => set({ apps: n })} onEnter={() => goto(4)} placeholder={S("w047")} labelledBy="fc-h3s" />
                <span className="unit">{S("w044")}</span>
              </div>
              <label className="fc-q-sub" htmlFor="fc-appsRep">
                {S("w045")}
              </label>
              <div className={`fc-input${state.appsUnknown ? " off" : ""}`} id="fc-appsRepBox">
                <NumField id="fc-appsRep" value={state.appsRep} onValue={(n) => set({ appsRep: n })} onEnter={() => goto(4)} placeholder={S("w047")} disabled={state.appsUnknown} />
                <span className="unit">{S("w044")}</span>
              </div>
              <label className="fc-ch tog box">
                <input type="checkbox" id="fc-appsUnknown" checked={state.appsUnknown} onChange={(e) => set({ appsUnknown: e.target.checked })} />
                <span>{S("w046")}</span>
              </label>
              <p className={`fc-hint${capped ? " warn" : ""}`} id="fc-appsHint">
                {capped ? tr("appsHintCap", { a: eur(r.appsM) }) : ""}
              </p>
            </div>
            <div className="fc-nav-row">
              <button type="button" className="fc-btn fc-btn-line" id="fc-back3" onClick={next(2)}>
                {S("s036")}
              </button>
              <button type="button" className="fc-btn fc-btn-main" id="fc-next3" onClick={next(4)}>
                <span>{S("s037")}</span> <Arrow />
              </button>
            </div>
          </section>

          <aside className="fc-live" id="fc-live" aria-label="Resultado estimado">
            <p className="fc-live-k">Beneficio neto estimado</p>
            <p className="fc-live-n">
              <span className="fc-live-num">— — — €</span>
              <span className="fc-live-per">al año</span>
            </p>
            <p className="fc-live-status" id="fc-liveStatus">
              {LIVE_STATUS[Math.min(state.step, 3)]}
            </p>
            <dl className="fc-live-rows">
              <div>
                <dt>Te ahorrarías</dt>
                <dd />
              </div>
              <div id="fc-liveGainRow" hidden={!state.revOn}>
                <dt>Ganarías más</dt>
                <dd />
              </div>
              <div>
                <dt>Coste de Fivo</dt>
                <dd />
              </div>
            </dl>
            <p className="fc-live-note">Tu resultado se calcula con cada respuesta. Lo verás al final.</p>
          </aside>
        </div>

        {result && r.ready && (
          <Result
            state={state}
            r={r}
            reduced={reduced}
            first={first}
            onBack={() => goto(1)}
            onOpen={() => {
              setModal(true);
            }}
          />
        )}
      </div>

      <p className="fc-sr" role="status" aria-live="polite" id="fc-srStatus">
        {srText}
      </p>

      {modal && (
        <MethodModal
          state={state}
          r={r}
          set={set}
          onClose={() => setModal(false)}
          onPdf={() => track("calculator_pdf", params())}
          onReportSent={() => track("calculator_report_sent", params())}
          source={source}
        />
      )}
    </div>
  );
}

