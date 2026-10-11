/* eslint-disable */
// @ts-nocheck
// Motor de la calculadora: copia fiel del script de calculadora.fivo.info, con estos cambios de integración:
//  - todo cuelga de `root` (no toca el resto de la página) y se desmonta con la función que devuelve;
//  - la analítica es la de esta landing (host.track), solo calculator_start / _complete / _pdf / _report_sent;
//  - sin cabecera, titular ni pie propios; sin píxeles ni dataLayer de la original.
import { CFG } from "./config";
import { compute, tierSet, posInt } from "./compute";
import { STATIC_ES } from "./texts";

export type CalculatorEvent = "calculator_start" | "calculator_complete" | "calculator_pdf" | "calculator_report_sent";
export type CalculatorHost = {
  track: (name: CalculatorEvent, params?: Record<string, string | number | boolean>) => void;
  /** Valor del campo `source` de "Enviarme mi informe". */
  source: string;
  /** Fecha y hora de la llamada ya con formato (reserva guardada o URL del proveedor), o null. */
  callWhen: () => string | null;
  /** Frase de cierre del PDF. */
  disclaimer: string;
  /** Id de la reserva de meetz (?r= en la URL), o null. Con él no se pide el email. */
  reservaId: string | null;
  /** Guarda el cálculo en la hoja (resultado / cambio / pdf). No lanza ni espera. */
  save: (evento: "resultado" | "cambio" | "pdf", data: Record<string, string | number>) => void;
};

export function initCalculator(root: HTMLElement, host: CalculatorHost): () => void {
  var off = [];
  var timers = [];
  function on(t, e, f, o) { t.addEventListener(e, f, o); off.push(function () { t.removeEventListener(e, f, o); }); }
  var STATIC = { es: STATIC_ES };

  var D = {
    es:{
      tierUp:"Hasta {a}", tierMid:"{a} – {b}", tierOver:"Más de {a}",
      appsHintCap:"No puede superar tu gasto total en aplicaciones. Usamos {a} al mes.",
      recEq:"≈ {h} h por persona y semana, sobre el {p} de la semana que se va buscando información.",
      exTag:"EJEMPLO ILUSTRATIVO", exPeople:"Personas", exSpend:"Gasto anual", exRevenue:"Ingresos anuales",
      exSave:"Te ahorrarías", exEarn:"Ganarías más", exNet:"Beneficio neto", exPerYear:"al año", exLoad:"Cargar este ejemplo",
      billM:"{us} × {price} al mes × 12 meses = {cost}",
      billA:"{us} × ≈ {price} al mes × 12 meses = {cost}",
      noteA:"Con pago anual ahorras <b>{s}</b> al año frente al pago mensual.",
      noteM:"Con pago anual ahorras <b>{s}</b> al año y tu beneficio sube a <b>{n}</b>.",
      empty:"Aquí aparecerá el desglose en cuanto introduzcas tus datos.",
      calcExpr:"{a} + {g} − {c} de Fivo", calcEq:"{n}", calcEqNeg:"{n}", calcTail:"Beneficio neto estimado al año", calcTailNeg:"Resultado neto estimado al año",
      calcNeg:"Con estos datos el resultado neto es {n}. Ajusta los supuestos o cuéntanos tu caso.",
      stickyProfit:"Beneficio neto estimado: {x}/año", netRow:"Beneficio neto estimado",
      priceMsg:"Fivo cuesta menos de {max} al mes por persona.",
      toolsLabel:"Grabación, transcripción y notas de reuniones",
      toolsOwn:"{m} al mes × 12 meses, tal como lo indicas",
      toolsEst:"Estimación: el {pc} de tus {a} al mes en aplicaciones ({m} al mes) × 12 meses",
      toolsPart:" · se aplica el {p} que Fivo sustituye",
      auditOwnLabel:"Consultores o agencias que dejarías de contratar",
      auditOwnNote:"Tu tramo de gasto ({x} al año, valor medio del tramo), aplicando el {p} porque Fivo cubre una parte de ese trabajo",
      auditRefLabel:"Análisis externo de referencia (coach y analista)",
      auditRefNote:"Lo que costaría contratarlo: el {pc} de tu gasto anual ({team}), entre {min} y {max}. Fivo lo hace de forma continua con tus reuniones",
      timeLabel:"Tiempo recuperado del equipo",
      timeNote:"{p} de {loss} que hoy se pierden buscando información (≈ 20 % del gasto de {n} {pl}: {team})",
      extraLabel:"Ventas extra por llamadas",
      extraNote:"{p} sobre {x} de ingresos por llamadas",
      tagOwn:"Tu dato", tagRef:"Referencia", tagEst:"Estimación",
      gA:"A. Herramientas que dejas de pagar", gB:"B. Análisis externo que te ahorras", gC:"C. Tiempo que recupera tu equipo (estimación)", gD:"D. Ventas extra (estimación)",
      subtotal:"Subtotal {l}",
      saveRow:"Te ahorrarías ({parts})",
      earnRow:"Ganarías más (D)",
      totalRow:"Total que recuperas ({parts})",
      costRow:"Inversión en Fivo",
      costNote:"{us} × {price} × 12 meses (plan Business, pago {mode})",
      priceM:"{p} al mes", priceA:"≈ {p} al mes ({m} −{d})",
      modeM:"mensual", modeA:"anual", netNote:"Total que recuperas − inversión en Fivo",
      chkOkHead:"<b>✓ Cifras verificadas.</b> ",
      chkTools:"Herramientas ({t}) = 12 × {m} al mes que indicas; ",
      chkTail:"{lines} de líneas = {ben} recuperados; {ben} − {cost} = {net}.",
      chkBad:'<b class="bad">Revisa los datos: las cifras no cuadran.</b>',
      pdfPreparing:"Preparando PDF…", pdfDone:"PDF descargado", pdfFail:"No hemos podido generar el PDF. Inténtalo de nuevo.",
      emailBad:"Escribe un email válido.",
      needData:"Introduce primero tus datos para generar el informe.",
      sent:"Listo. Hemos enviado tu informe a {email}.",
      sendFail:"No hemos podido enviarlo. Inténtalo de nuevo o agenda una demo.",
      goContact:"Te llevamos a contacto con tu cálculo cargado.",
      step1Need:"Indica al menos 1 persona y tu gasto anual para continuar.",
      newTab:" (se abre en una pestaña nueva)"
    }
  };

  var LANG = CFG.defaultLang;
  function tr(k, v){
    var s = (D[LANG] && D[LANG][k] !== undefined) ? D[LANG][k] : D.es[k];
    return String(s).replace(/\{(\w+)\}/g, function(_, x){ return (v && v[x] !== undefined) ? v[x] : ""; });
  }

  var mdOpener = null;
  function mdFocusables(){
    return Array.prototype.filter.call($("mdBox").querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'), function(x){ return x.offsetParent!==null; });
  }
  function openCalc(opener){
    if(!$("calcModal").hidden) return;
    mdOpener = opener || document.activeElement;
    $("calcModal").hidden = false;
    document.documentElement.classList.add("md-open");
    $("page").inert = true;
    $("mdBox").focus();
  }
  function closeCalc(){
    if($("calcModal").hidden) return;
    $("calcModal").hidden = true;
    document.documentElement.classList.remove("md-open");
    $("page").inert = false;
    if(mdOpener && document.contains(mdOpener) && mdOpener.focus) mdOpener.focus();
    mdOpener = null;
  }

  var EN = function(){ return LANG==="en"; };
  function group(n){ return String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, EN()?",":"."); }
  function eur(n){ var neg = n<0 ? "−" : ""; return EN() ? neg+"€"+group(n) : neg+group(n)+" €"; }
  function eur2(n){ var s = (Math.round(n*100)/100).toFixed(2), p = s.split("."); return EN() ? "€"+s : (n<0?"−":"")+group(+p[0])+","+p[1]+" €"; }
  function numDec(x){ return EN() ? x : x.replace(".",","); }
  function d1(n){ return numDec(n.toFixed(1)); }
  function dec(n){ return numDec((Math.round(n*10)/10).toString()); }
  function pct(n){ return dec(n) + (EN() ? "%" : " %"); }
  function eurDec(n){ return EN() ? "€"+d1(n) : d1(n)+" €"; }
  function parse(v){ var s=String(v).replace(/[^\d]/g,""); return s?parseInt(s,10):0; }
  function peopleW(n){ return EN() ? (n===1?"person":"people") : (n===1?"persona":"personas"); }
  function usersN(n){ return group(n)+" "+(EN() ? (n===1?"user":"users") : (n===1?"usuario":"usuarios")); }
  var $ = function(id){ return root.querySelector("#" + id); };
  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var state = { v:2, sector:"", reps:3, rest:7, team:300000, calls:600000,
                recCalls:"", hasConsult:"", consultTier:-1, optimize:"",
                apps:600, appsRep:350, appsUnknown:false,
                rec:CFG.recDefault, uplift:CFG.upliftDefault, upliftSet:false, subst:100, plan:"monthly",
                audOn:true, revOn:true, step:1, lang:"" };

  var LAST = 4;
  var bandOK = false;

  function renderSeg(){ root.querySelectorAll(".cseg button").forEach(function(b){ b.setAttribute("aria-pressed", String(b.dataset.plan===state.plan)); }); }
  var counting = false, countTok = 0;
  var tw = {};
  function setNow(id, text){ var st = tw[id] || (tw[id] = {tok:0, shown:null, sig:null}); st.tok++; st.shown = null; $(id).textContent = text; }
  function tweenText(id, to, fmt, sig){
    var el = $(id), st = tw[id] || (tw[id] = {tok:0, shown:null, sig:null}), tok = ++st.tok, from = st.shown, last = fmt(to);
    var instant = from===null || from===to || sig!==st.sig || reduced || window.__fivoNoAnim || counting || !el.getClientRects().length;
    st.shown = to; st.sig = sig;
    if(instant){ el.textContent = last; return; }
    var t0 = performance.now(), ms = 350;
    (function f(t){
      if(tok!==st.tok) return;
      var k = Math.min(1,(t-t0)/ms), e = 1-Math.pow(1-k,3);
      if(k<1){ el.textContent = fmt(Math.round(from+(to-from)*e)); requestAnimationFrame(f); } else { el.textContent = last; }
    })(t0);
  }
  var annTimer = null;
  function announce(){
    clearTimeout(annTimer);
    annTimer = setTimeout(function(){
      var el = $("srStatus");
      if(state.step===LAST){ var rr = compute(state); el.textContent = rr.ready ? tr("stickyProfit",{x:eur(rr.net)}) : ""; }
      else el.textContent = LIVE_STATUS[state.step];
    }, 800);
  }
  function revealResult(){
    var card = $("netCard"), r = compute(state);
    card.classList.add("ok");
    if(reduced || window.__fivoNoAnim || !r.ready) return;
    var tok = ++countTok, pos = r.net>0, t0 = performance.now();
    var items = [
      ["rcEq", r.net, 0, 1100, function(v){ return tr(pos ? "calcEq" : "calcEqNeg", {n:eur(v)}); }],
      ["saveBig", r.save, 200, 700, eur], ["earnBig", r.earn, 400, 700, eur], ["costBig", Math.round(monthlyCost(r)*100), 600, 700, function(v){ return eur2(v/100); }]
    ];
    counting = true; card.classList.remove("rv"); void card.offsetWidth; card.classList.add("rv"); root.classList.add("rvw");
    (function f(t){
      if(tok!==countTok) return;
      var el = t-t0, more = false;
      items.forEach(function(it){
        var k = Math.min(1, Math.max(0, (el-it[2])/it[3])), e = 1-Math.pow(1-k,3);
        $(it[0]).textContent = it[4](Math.round(it[1]*e)); if(k<1) more = true;
      });
      if(more) requestAnimationFrame(f);
      else { counting = false; card.classList.remove("rv"); root.classList.remove("rvw"); render(); }
    })(t0);
  }

  function members(){ return posInt(state.reps,1e5) + posInt(state.rest,1e5); }
  function variant(){ return members()>2 ? AB : "conversion"; }
  var AB = "A";
  function sizeBucket(n){ return n<=2 ? "1-2" : (n<=10 ? "3-10" : "11+"); }
  function trackParams(){ return {sector: state.sector || "sin_sector", team_size: sizeBucket(members())}; }
  var started = false;
  function markStart(){ if(started) return; started = true; host.track("calculator_start"); }
  // ---- Hoja de Google: el cálculo se guarda al llegar al resultado, 2 s después de cada cambio y al descargar el PDF ----
  function sheetData(r){
    var emailEl = $("emailReserva"), email = emailEl ? emailEl.value.trim() : "";
    if(host.reservaId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) email = "";
    var secOpt = state.sector ? $("sec-"+state.sector) : null;
    var sup = [];
    if(r.rec !== CFG.recDefault) sup.push("Tiempo de búsqueda que recupera: " + pct(r.rec));
    if(!state.revOn) sup.push("Sin mejora de ventas");
    else {
      var defUp = CFG.upliftByReview[state.recCalls] !== undefined ? CFG.upliftByReview[state.recCalls] : CFG.upliftDefault;
      if(r.uplift !== defUp) sup.push("Mejora de ventas: " + pct(r.uplift));
    }
    if(r.subst !== 100) sup.push("Herramientas que Fivo sustituye: " + pct(Math.round(r.subst)));
    if(!state.audOn) sup.push("Sin análisis externo");
    return {
      email: email, sector: secOpt ? secOpt.querySelector("span").textContent : "",
      comerciales: r.reps, resto_equipo: r.rest, gasto_anual: r.team, ingresos_anuales: r.calls,
      herramientas: r.appsM, supuestos: sup.join("; "),
      ahorro: r.save, ganancia: r.earn, neto_anual: r.net, coste_mes: monthlyCost(r),
      facturacion: state.plan==="annual" ? "anual" : "mensual"
    };
  }
  var sheetSig = null, sheetTimer = null;
  function sheetSend(evento){
    var r = compute(state); if(!r.ready) return;
    clearTimeout(sheetTimer);
    var d = sheetData(r); sheetSig = JSON.stringify(d);
    try { host.save(evento, d); } catch(e) { /* nada debe frenar la calculadora */ }
  }
  function sheetSoon(){
    if(sheetSig === null) return;
    var r = compute(state); if(!r.ready || JSON.stringify(sheetData(r)) === sheetSig) return;
    clearTimeout(sheetTimer);
    sheetTimer = setTimeout(function(){ sheetSend("cambio"); }, 2000); timers.push(sheetTimer);
  }
  function canNext1(r){ return r.people>=1 && r.team>0; }

  var maxStep = 1;
  function renderSteps(){
    if(state.step>maxStep) maxStep = state.step;
    for(var n=1; n<=LAST; n++){
      $("step"+n).hidden = state.step!==n;
      var li = root.querySelector('.stp[data-s="'+n+'"]'), btn = li.querySelector(".stp-btn");
      li.classList.toggle("on", state.step===n);
      li.classList.toggle("done", state.step>n);
      btn.disabled = n>maxStep;
      if(state.step===n) btn.setAttribute("aria-current","step"); else btn.removeAttribute("aria-current");
    }
    var res = state.step===LAST;
    $("steps").hidden = res;
    if(res) ensureBand();
    $("logoBand").hidden = !(res && bandOK);
    root.classList.toggle("is-result", res);
    root.dispatchEvent(new CustomEvent("calc:step", {detail:{step:state.step}, bubbles:true}));
    $("live").hidden = res;
  }
  function goto(n){
    var first = n===LAST && !calcDone && compute(state).ready;
    if(first) calcDone = true;
    state.step = n; root.classList.add("anim"); renderSteps(); render();
    if(first){ revealResult(); host.track("calculator_complete", trackParams()); sheetSend("resultado"); } else if(n!==LAST) announce();
    var f = root.closest("[data-calc-section]") || $("calc"); if(f && f.scrollIntoView) f.scrollIntoView({behavior: reduced?"auto":"smooth", block:"start"});
  }

  var tierSig = "";
  function renderTiers(){
    var ts = tierSet(state.calls), sig = ts.mode+"|"+ts.bounds.join(",")+"|"+LANG+"|"+posInt(state.calls);
    if(sig!==tierSig){
      tierSig = sig;
      var b = ts.bounds;
      var L = [tr("tierUp",{a:eur(b[0])}), tr("tierMid",{a:eur(b[0]), b:eur(b[1])}), tr("tierMid",{a:eur(b[1]), b:eur(b[2])}), tr("tierOver",{a:eur(b[2])})];
      $("tiers").innerHTML = L.map(function(t,i){ return '<label class="ch"><input type="radio" name="consultTier" value="'+i+'"><span>'+t+'</span></label>'; }).join("");
    }
    root.querySelectorAll('input[name="consultTier"]').forEach(function(x){ x.checked = parseInt(x.value,10)===state.consultTier; });
  }

  function render(){
    var r = compute(state);
    root.querySelectorAll("input[type=range]").forEach(function(el){ var mn = +el.min||0, mx = +el.max||100; el.style.setProperty("--fill", (100*((+el.value)-mn)/(mx-mn))+"%"); });

    var ok1 = canNext1(r);
    $("liveStatus").textContent = LIVE_STATUS[Math.min(state.step, 3)];
    $("liveGainRow").hidden = !state.revOn;
    $("next1").disabled = !ok1;
    $("step1Msg").textContent = ok1 ? "" : tr("step1Need");
    ["reps","rest","team"].forEach(function(id){ $(id).setAttribute("aria-invalid", String(!ok1 && (id==="team" ? r.team<=0 : r.people<1))); });

    renderTiers();
    $("consultBox").hidden = state.hasConsult!=="yes";

    $("appsRep").disabled = state.appsUnknown;
    $("appsRepBox").classList.toggle("off", state.appsUnknown);
    var hh = $("appsHint"), capped = !state.appsUnknown && r.appsRepIn>r.appsM;
    hh.className = "hint"+(capped?" warn":"");
    hh.textContent = capped ? tr("appsHintCap",{a:eur(r.appsM)}) : "";

    $("recv").textContent = pct(r.rec);
    $("recEq").textContent = tr("recEq",{h:dec(CFG.hoursWeek*CFG.searchShare*r.rec/100), p:pct(Math.round(CFG.searchShare*100))});
    $("upv").textContent  = pct(r.uplift);
    $("subv").textContent = pct(Math.round(r.subst));
    $("upRow").hidden = !state.revOn;

    renderSeg();

    if(state.step!==LAST || !r.ready){ renderTable(r); return r; }

    if(counting){ countTok++; counting = false; $("netCard").classList.remove("rv"); root.classList.remove("rvw"); }
    tweenText("saveBig", r.save, eur); tweenText("earnBig", r.earn, eur); $("costBig").textContent = eur2(monthlyCost(r)); $("costYear").textContent = eur(r.cost) + " al año";
    $("earnBox").hidden = !state.revOn;
    $("dual").classList.toggle("one", !state.revOn);
    var nb = function(x){ return '<span class="nb">'+eur(x)+'</span>'; }, pos = r.net>0;
    $("rcExpr").innerHTML = tr("calcExpr",{a:nb(r.save), g:nb(r.earn), c:nb(r.cost)});
    tweenText("rcEq", r.net, function(v){ return tr(pos ? "calcEq" : "calcEqNeg",{n:eur(v)}); }, pos);
    $("rcTail").textContent = tr(pos ? "calcTail" : "calcTailNeg");
    $("net").classList.toggle("neg", !pos);
    $("rcNeg").hidden = pos; if(!pos) $("rcNeg").textContent = tr("calcNeg",{n:eur(r.net)});
    $("priceMsg").textContent = tr("priceMsg",{max:eur(Math.floor(CFG.priceMonthly)+1)});
    $("billDetail").textContent = tr(state.plan==="annual" ? "billA" : "billM", {us:usersN(r.people), price:eur2(state.plan==="annual" ? CFG.priceAnnual : CFG.priceMonthly), cost:eur(r.cost)});
    $("billNote").innerHTML = (state.plan==="annual" || r.netIfAnnual<=0)
      ? tr("noteA",{s:eur(r.costMonthly - r.costAnnual)})
      : tr("noteM",{s:eur(r.costMonthly - r.costAnnual), n:eur(r.netIfAnnual)});
    announce();
    renderTable(r);
    sheetSoon();
    return r;
  }

  var calcDone = false;
  var LIVE_STATUS = ["", "Analizando tu sector…", "Estimando tus ventas…", "Valorando tus herramientas…"];

  function monthlyCost(r){ return Math.round(r.people * (state.plan==="annual" ? CFG.priceAnnual : CFG.priceMonthly) * 100) / 100; }

  // Desglose del cálculo como datos: lo pintan la ventana "Cómo se calcula" y el PDF, con los mismos textos y cifras
  function breakdownModel(r){
    var neg = r.net < 0;
    var TAG = {own:tr("tagOwn"), ref:tr("tagRef"), est:tr("tagEst")};
    var toolsNote = state.appsUnknown
      ? tr("toolsEst",{pc:pct(Math.round(CFG.unknownShare*100)), a:eur(r.appsM), m:eur(r.subM)})
      : tr("toolsOwn",{m:eur(r.subM)});
    if(r.subst!==100) toolsNote += tr("toolsPart",{p:pct(Math.round(r.subst))});
    var rowsA = [{key:"tools", label:tr("toolsLabel"), note:toolsNote, tag:state.appsUnknown?"est":"own", amt:r.tools}];
    var rowsB = [];
    if(r.auditKind==="own") rowsB.push({key:"audit", label:tr("auditOwnLabel"), note:tr("auditOwnNote",{x:eur(r.tierValue), p:pct(Math.round(CFG.consultantReplace*100))}), tag:"own", amt:r.audit});
    else if(r.auditKind==="ref") rowsB.push({key:"audit", label:tr("auditRefLabel"), note:tr("auditRefNote",{pc:pct(Math.round(CFG.auditRefPct*100)), team:eur(r.team), min:eur(CFG.auditRefMin), max:eur(CFG.auditRefMax)}), tag:"ref", amt:r.audit});
    var rowsC = [{key:"time", label:tr("timeLabel"), note:tr("timeNote",{p:pct(r.rec), loss:eur(r.lossToday), n:group(r.people), pl:peopleW(r.people), team:eur(r.team)}), tag:"est", amt:r.time}];
    var rowsD = state.revOn ? [{key:"extra", label:tr("extraLabel"), note:tr("extraNote",{p:pct(r.uplift), x:eur(r.calls)}), tag:"est", amt:r.extra}] : [];
    var hasB = rowsB.length>0;
    var saveParts = hasB ? "A + B + C" : "A + C";
    var totalParts = state.revOn ? saveParts+" + D" : saveParts;
    var priceTxt = state.plan==="annual"
      ? tr("priceA",{p:eur2(CFG.priceAnnual), m:eur2(CFG.priceMonthly), d:pct(Math.round((1-CFG.priceAnnual/CFG.priceMonthly)*100))})
      : tr("priceM",{p:eur2(CFG.priceMonthly)});
    var L = [];
    function row(x){ return {k:"row", label:x.label, tag:TAG[x.tag], tagKey:x.tag, note:x.note, amt:eur(x.amt)}; }
    L.push({k:"group", label:tr("gA")}); rowsA.forEach(function(x){ L.push(row(x)); }); L.push({k:"sub", label:tr("subtotal",{l:"A"}), amt:eur(r.tools)});
    if(hasB){ L.push({k:"group", label:tr("gB")}); rowsB.forEach(function(x){ L.push(row(x)); }); L.push({k:"sub", label:tr("subtotal",{l:"B"}), amt:eur(r.audit)}); }
    L.push({k:"group", label:tr("gC")}); rowsC.forEach(function(x){ L.push(row(x)); }); L.push({k:"sub", label:tr("subtotal",{l:"C"}), amt:eur(r.time)});
    L.push({k:"sub", label:tr("saveRow",{parts:saveParts}), amt:eur(r.save)});
    if(state.revOn){ L.push({k:"group", label:tr("gD")}); rowsD.forEach(function(x){ L.push(row(x)); }); L.push({k:"sub", label:tr("earnRow"), amt:eur(r.earn)}); }
    L.push({k:"sub", label:tr("totalRow",{parts:totalParts}), amt:eur(r.gross)});
    L.push({k:"cost", label:tr("costRow"), note:tr("costNote",{us:usersN(r.people), price:priceTxt, mode:tr(state.plan==="annual"?"modeA":"modeM")}), amt:eur(-r.cost)});
    L.push({k:"total", neg:neg, label:tr("netRow"), note:tr("netNote"), amt:eur(r.net)});
    var all = rowsA.concat(rowsB, rowsC, rowsD);
    var sumRows = all.reduce(function(a,s){return a+s.amt;},0);
    var okTools = r.subst!==100 || r.tools===r.subM*12;
    var ok = sumRows===r.gross && r.save+r.earn===r.gross && r.tools+r.audit+r.time===r.save && r.gross-r.cost===r.net && okTools;
    var check = ok
      ? tr("chkOkHead") + (r.subst===100 ? tr("chkTools",{t:eur(r.tools), m:eur(r.subM)}) : "") + tr("chkTail",{lines:eur(sumRows), ben:eur(r.gross), cost:eur(r.cost), net:eur(r.net)})
      : tr("chkBad");
    return {lines:L, check:check};
  }

  function renderTable(r){
    var tbl = $("tbl");
    if(!r.ready){
      tbl.innerHTML = '<tr><td colspan="2" style="padding:0;border:0"><p class="empty-note">'+tr("empty")+'</p></td></tr>';
      $("check").innerHTML=""; return;
    }
    var bm = breakdownModel(r), html = "";
    bm.lines.forEach(function(x){
      if(x.k==="group") html += '<tr class="group"><td>'+x.label+'</td><td></td></tr>';
      else if(x.k==="row") html += '<tr><td>'+x.label+'<span class="tag '+x.tagKey+'">'+x.tag+'</span><span class="note">'+x.note+'</span></td><td class="amt">'+x.amt+'</td></tr>';
      else if(x.k==="sub") html += '<tr class="sub"><td>'+x.label+'</td><td class="amt">'+x.amt+'</td></tr>';
      else if(x.k==="cost") html += '<tr class="cost"><td>'+x.label+'<span class="note">'+x.note+'</span></td><td class="amt">'+x.amt+'</td></tr>';
      else html += '<tr class="total'+(x.neg?' neg':'')+'"><td>'+x.label+'<span class="note">'+x.note+'</span></td><td class="amt">'+x.amt+'</td></tr>';
    });
    tbl.innerHTML = html;
    $("check").innerHTML = bm.check;
  }

  var ENUM = {recCalls:["","no","some","yes"], hasConsult:["","no","yes"], optimize:["","yes","maybe","no"]};
  var SECTORS = ["","tech","services","agency","realestate","finance","health","education","industry","retail","other"];
  function paintSector(){
    var o = state.sector ? $("sec-"+state.sector) : null, b = $("secBtn");
    b.classList.toggle("has", !!o);
    root.querySelectorAll("#secList [role=option]").forEach(function(x){ x.setAttribute("aria-selected", String(x.dataset.v===state.sector)); });
    $("secVal").textContent = o ? o.querySelector("span").textContent : "Elige tu sector";
    $("secIc").innerHTML = o ? o.querySelector("svg").outerHTML : "";
  }
  (function(){
    var dd = $("secDd"), btn = $("secBtn"), list = $("secList"), opts = [].slice.call(list.children), act = -1;
    function norm(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
    function isOpen(){ return dd.classList.contains("open"); }
    function setAct(i){
      act = Math.max(0, Math.min(opts.length-1, i));
      opts.forEach(function(o, k){ o.classList.toggle("act", k===act); });
      btn.setAttribute("aria-activedescendant", opts[act].id);
      var o = opts[act], top = o.offsetTop, bot = top + o.offsetHeight;
      if(top < list.scrollTop) list.scrollTop = top - 6; else if(bot > list.scrollTop + list.clientHeight) list.scrollTop = bot - list.clientHeight + 6;
    }
    function place(){
      list.style.maxHeight = "";
      var r = btn.getBoundingClientRect(), need = list.scrollHeight + 14, below = window.innerHeight - r.bottom - 12, above = r.top - 12;
      var up = need > below && above > below + 120;
      dd.classList.toggle("up", up);
      list.style.maxHeight = Math.max(160, up ? Math.min(need, above) : need) + "px";
      if(!up && need>below) window.scrollBy({top:Math.min(need-below, 240), behavior: reduced ? "auto" : "smooth"});
    }
    function open(){
      if(isOpen()) return;
      place(); dd.classList.add("open"); btn.setAttribute("aria-expanded", "true");
      var i = SECTORS.indexOf(state.sector) - 1; setAct(i<0 ? 0 : i);
    }
    function close(){
      if(!isOpen()) return;
      dd.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.removeAttribute("aria-activedescendant");
    }
    function choose(i){ state.sector = opts[i].dataset.v; paintSector(); close(); render(); }
    btn.addEventListener("click", function(){ if(isOpen()) close(); else open(); });
    btn.addEventListener("keydown", function(e){
      var k = e.key;
      if(k==="Tab"){ close(); return; }
      if(k==="Escape"){ if(isOpen()){ e.preventDefault(); e.stopPropagation(); close(); } return; }
      if(k==="ArrowDown" || k==="ArrowUp"){ e.preventDefault(); if(!isOpen()) open(); else setAct(act + (k==="ArrowDown" ? 1 : -1)); return; }
      if(k==="Home" || k==="End"){ if(isOpen()){ e.preventDefault(); setAct(k==="Home" ? 0 : opts.length-1); } return; }
      if(k==="Enter" || k===" "){ e.preventDefault(); if(isOpen()) choose(act); else open(); return; }
      if(k.length===1 && !e.ctrlKey && !e.metaKey && !e.altKey){
        if(!isOpen()) open();
        var c = norm(k), n = opts.length;
        for(var j=1; j<=n; j++){ var idx = (act + j) % n; if(norm(opts[idx].textContent.trim()).charAt(0)===c){ setAct(idx); break; } }
      }
    });
    list.addEventListener("mousedown", function(e){ e.preventDefault(); });
    list.addEventListener("click", function(e){ var li = e.target.closest("li"); if(li) choose(opts.indexOf(li)); });
    list.addEventListener("mousemove", function(e){ var li = e.target.closest("li"); if(li){ var i = opts.indexOf(li); if(i!==act) setAct(i); } });
    on(document, "click", function(e){ if(!dd.contains(e.target)) close(); });
    on(window, "resize", close);
  })();

  function syncControls(){
    ["reps","rest","team","calls","apps","appsRep"].forEach(function(k){ $(k).value = group(state[k]); });
    paintSector();
    ["recCalls","hasConsult","optimize"].forEach(function(n){
      root.querySelectorAll('input[name="'+n+'"]').forEach(function(x){ x.checked = x.value===state[n]; });
    });
    $("rec").value = state.rec; $("up").value = state.uplift; $("sub").value = state.subst;
    $("audOn").checked = state.audOn; $("revOn").checked = state.revOn; $("appsUnknown").checked = state.appsUnknown;
    tierSig = ""; renderSeg();
  }

  function fill(s){
    var K = {
      search:Math.round(CFG.searchShare*100), unknown:Math.round(CFG.unknownShare*100), replace:Math.round(CFG.consultantReplace*100),
      auditPct:Math.round(CFG.auditRefPct*100), rec:CFG.recDefault,
      upNo:CFG.upliftByReview.no, upSome:CFG.upliftByReview.some, upYes:CFG.upliftByReview.yes,
      annualSave:Math.round((1-CFG.priceAnnual/CFG.priceMonthly)*100)
    };
    return String(s).replace(/\{(\w+)\}/g, function(m, k){
      if(k==="auditMin") return eur(CFG.auditRefMin);
      if(k==="auditMax") return eur(CFG.auditRefMax);
      if(k==="priceM") return eur2(CFG.priceMonthly);
      return K[k]!==undefined ? pct(K[k]) : m;
    });
  }
  function applyStatic(){
    var S = STATIC[LANG] || STATIC.es, E = STATIC.es;
    function val(k){ var v = S[k] !== undefined ? S[k] : E[k]; return v===undefined ? v : fill(v); }
    root.querySelectorAll("[data-i18n]").forEach(function(el){ var v = val(el.dataset.i18n); if(v!==undefined) el.textContent = v; });
    root.querySelectorAll("[data-i18n-ph]").forEach(function(el){ var v = val(el.dataset.i18nPh); if(v!==undefined) el.setAttribute("placeholder", v); });
    root.querySelectorAll("[data-i18n-aria]").forEach(function(el){ var v = val(el.dataset.i18nAria); if(v!==undefined) el.setAttribute("aria-label", v); });
  }


  root.querySelectorAll(".input input[data-k]").forEach(function(el){
    el.addEventListener("input", function(){ state[el.dataset.k] = parse(el.value); render(); });
    el.addEventListener("blur",  function(){ el.value = group(parse(el.value)); });
    el.addEventListener("focus", function(){ el.select(); });
    el.addEventListener("keydown", function(e){
      if(e.key==="Enter"){ e.preventDefault(); if(state.step===1 && !$("next1").disabled) goto(2); else if(state.step===2) goto(3); else if(state.step===3) goto(4); }
    });
  });
  on(root, "change", function(e){
    var el = e.target; if(!el || el.type!=="radio") return;
    if(el.name==="consultTier") state.consultTier = parseInt(el.value,10);
    else {
      state[el.name] = el.value;
      if(el.name==="hasConsult" && el.value==="no") state.consultTier = -1;
      if(el.name==="recCalls" && !state.upliftSet){ state.uplift = CFG.upliftByReview[el.value]; $("up").value = state.uplift; }
    }
    render();
  });
  root.querySelectorAll("input[type=range]").forEach(function(el){
    el.addEventListener("input", function(){ state[el.dataset.k] = parseFloat(el.value); if(el.dataset.k==="uplift") state.upliftSet = true; render(); });
  });
  root.querySelectorAll(".cseg button").forEach(function(b){
    b.addEventListener("click", function(){ state.plan = b.dataset.plan; render(); });
  });
  $("audOn").addEventListener("change", function(){ state.audOn = this.checked; render(); });
  $("revOn").addEventListener("change", function(){ state.revOn = this.checked; render(); });
  $("appsUnknown").addEventListener("change", function(){ state.appsUnknown = this.checked; render(); });

  $("next1").addEventListener("click", function(){ if(!this.disabled) goto(2); });
  $("back2").addEventListener("click", function(){ goto(1); });
  $("next2").addEventListener("click", function(){ goto(3); });
  $("back3").addEventListener("click", function(){ goto(2); });
  $("next3").addEventListener("click", function(){ goto(4); });
  $("editData").addEventListener("click", function(){ goto(1); });
  root.querySelectorAll(".stp").forEach(function(li){
    li.addEventListener("click", function(){
      var n = parseInt(li.dataset.s,10);
      if(n===state.step || n>maxStep) return;
      if(n>1 && !canNext1(compute(state))) return;
      goto(n);
    });
  });

  function msg(t, bad){ var m=$("msg"); m.textContent=t; m.style.color = bad ? "var(--warn)" : "var(--good)"; }
  $("openCalc").addEventListener("click", function(){ openCalc(this); });
  $("mdClose").addEventListener("click", closeCalc);
  $("mdBackdrop").addEventListener("click", closeCalc);
  on(document, "keydown", function(e){
    if($("calcModal").hidden) return;
    if(e.key==="Escape"){ e.preventDefault(); closeCalc(); return; }
    if(e.key!=="Tab") return;
    var f = mdFocusables(), box = $("mdBox"); if(!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length-1], a = document.activeElement;
    if(e.shiftKey && (a===first || a===box || !box.contains(a))){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && (a===last || !box.contains(a))){ e.preventDefault(); first.focus(); }
  });
  // ---- PDF del cálculo: se genera en el navegador y se descarga directamente (jsPDF y las fuentes se piden al pulsar) ----
  function plain(h){ return String(h).replace(/<[^>]+>/g,"").replace(/✓\s*/g,"").replace(/\s+/g," ").trim(); }
  function optText(name, value){ var i = root.querySelector('input[name="'+name+'"][value="'+value+'"]'); return i && i.nextElementSibling ? i.nextElementSibling.textContent.trim() : ""; }
  function pdfModel(){
    var r = compute(state); if(!r.ready) return null;
    var S = STATIC.es, bm = breakdownModel(r), yes = "Sí", no = "No";
    var secOpt = state.sector ? $("sec-"+state.sector) : null;
    var inputs = [
      {label:"Sector", value: secOpt ? secOpt.querySelector("span").textContent : "—"},
      {label:S.w024, value:group(r.reps)},
      {label:S.w025, value:group(r.rest)},
      {label:S.s019, value:eur(r.team)},
      {label:S.s021, value:eur(r.calls)},
      {label:S.w032, value: state.recCalls ? optText("recCalls", state.recCalls) : "—"},
      {label:S.w036, value: state.hasConsult ? optText("hasConsult", state.hasConsult) : "—"}
    ];
    if(state.hasConsult==="yes" && state.consultTier>=0){ var tl = root.querySelector('input[name="consultTier"][value="'+state.consultTier+'"]'); inputs.push({label:S.w038, value: tl && tl.nextElementSibling ? tl.nextElementSibling.textContent.trim() : "—"}); }
    inputs.push({label:S.w039, value: state.optimize ? optText("optimize", state.optimize) : "—"});
    inputs.push({label:S.w043, value:eur(r.appsM) + " " + S.w044.replace("€ ","")});
    inputs.push({label:S.w045, value: state.appsUnknown ? S.w046 : eur(r.appsRepIn) + " " + S.w044.replace("€ ","")});
    var assumptions = [
      {label:S.s063, value:pct(r.rec)},
      {label:S.s064, value: state.revOn ? yes : no}
    ];
    if(state.revOn) assumptions.push({label:S.s066, value:pct(r.uplift)});
    assumptions.push({label:S.s067, value:pct(Math.round(r.subst))});
    assumptions.push({label:S.w050, value: state.audOn ? yes : no});
    assumptions.push({label:"Facturación de Fivo", value: tr(state.plan==="annual" ? "modeA" : "modeM").replace(/^./, function(c){ return c.toUpperCase(); })});
    var pos = r.net > 0;
    var stats = [{label:S.r002, value:eur(r.save), sub:S.r004}];
    if(state.revOn) stats.push({label:S.r003, value:eur(r.earn), sub:S.r004});
    stats.push({label:"Coste de Fivo al mes", value:eur2(monthlyCost(r)), sub:eur(r.cost) + " al año"});
    var billing = tr(state.plan==="annual" ? "billA" : "billM", {us:usersN(r.people), price:eur2(state.plan==="annual" ? CFG.priceAnnual : CFG.priceMonthly), cost:eur(r.cost)});
    var billNote = (state.plan==="annual" || r.netIfAnnual<=0)
      ? tr("noteA",{s:eur(r.costMonthly - r.costAnnual)})
      : tr("noteM",{s:eur(r.costMonthly - r.costAnnual), n:eur(r.netIfAnnual)});
    return {
      inputs:inputs, assumptions:assumptions,
      result:{netLabel:tr(pos ? "calcTail" : "calcTailNeg"), net:eur(r.net), netNeg:!pos, stats:stats, price:tr("priceMsg",{max:eur(Math.floor(CFG.priceMonthly)+1)}) + (state.plan==="annual" ? "" : " " + plain(tr("noteM",{s:eur(r.costMonthly - r.costAnnual), n:eur(r.netIfAnnual)})))},
      lines:bm.lines.map(function(x){ return {k:x.k, label:x.label, note:x.note, tag:x.tag, amt:x.amt, neg:x.neg}; }),
      how:{intro:S.s072, check:plain(bm.check), billing:S.s042 + ": " + billing, billingNote:plain(billNote), estimate:S.e001},
      disclaimer:host.disclaimer, callWhen:host.callWhen()
    };
  }
  var pdfBusy = false, pdfTimer = null;
  function pdfBtns(){ return [$("ctaPdf"), $("pdfBtn")].filter(Boolean); }
  function pdfLabel(btn, text){ var s = btn.querySelector("span"); (s || btn).textContent = text; }
  function pdfIdle(){ pdfBtns().forEach(function(b){ pdfLabel(b, b.id==="ctaPdf" ? "Descargar mi cálculo en PDF" : STATIC.es.s060); }); }
  function downloadPdf(){
    if(pdfBusy) return;
    var model = pdfModel();
    if(!model){ msg(tr("needData"), true); return; }
    sheetSend("pdf");
    pdfBusy = true; clearTimeout(pdfTimer);
    pdfBtns().forEach(function(b){ b.disabled = true; b.setAttribute("aria-busy", "true"); pdfLabel(b, tr("pdfPreparing")); });
    $("srStatus").textContent = tr("pdfPreparing");
    import("./pdf").then(function(mod){
      return mod.buildCalculatorPdf(model).then(function(blob){ mod.saveBlob(blob, "calculo-fivo.pdf"); });
    }).then(function(){
      host.track("calculator_pdf", trackParams());
      pdfBtns().forEach(function(b){ pdfLabel(b, tr("pdfDone")); });
      $("srStatus").textContent = tr("pdfDone");
      pdfTimer = setTimeout(pdfIdle, 3500); timers.push(pdfTimer);
    }).catch(function(){
      pdfBtns().forEach(function(b){ pdfLabel(b, tr("pdfFail")); });
      msg(tr("pdfFail"), true);
      pdfTimer = setTimeout(pdfIdle, 4500); timers.push(pdfTimer);
    }).then(function(){
      pdfBusy = false;
      pdfBtns().forEach(function(b){ b.disabled = false; b.removeAttribute("aria-busy"); });
    });
  }
  on($("ctaPdf"), "click", downloadPdf);
  on($("pdfBtn"), "click", downloadPdf);
  root.querySelectorAll(".sq").forEach(function(b){
    b.addEventListener("click", function(){
      var inp = $(b.dataset.for), v = Math.max(0, Math.min(99999, parse(inp.value) + parseInt(b.dataset.step, 10)));
      inp.value = group(v); state[inp.dataset.k] = v; render();
    });
  });

  $("leadForm").addEventListener("submit", function(e){
    e.preventDefault();
    var email = $("email").value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ msg(tr("emailBad"), true); $("email").focus(); return; }
    var r = compute(state);
    if(!r.ready){ msg(tr("needData"), true); return; }
    var payload = { email:email, lang:LANG, hp:$("hp").value, source:host.source, inputs:state, results:{
      tools:r.tools, audit:r.audit, value:r.value, benefits:r.gross, cost:r.cost, net:r.net } };
    if(CFG.leadEndpoint){
      fetch(CFG.leadEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
        .then(function(res){ if(!res.ok) throw 0; msg(tr("sent",{email:email})); host.track("calculator_report_sent", trackParams()); })
        .catch(function(){ msg(tr("sendFail"), true); });
    } else {
      window.open(CFG.contactUrl+"?email="+encodeURIComponent(email)+"&lang="+LANG, "_blank", "noopener");
      msg(tr("goContact"));
    }
  });

  if(!CFG.leadEndpoint){ $("leadForm").hidden = true; $("legalNote").hidden = true; }


  function buildLogoBand(){
    var track = $("lbTrack"), list = CFG.customerLogos || [];
    if(!list.length) return;
    list.forEach(function(c){ new Image().src = c.url; });
    function half(hidden){
      var d = document.createElement("div"); d.className = "lb-half"; if(hidden) d.setAttribute("aria-hidden","true");
      for(var r=0; r<2; r++) list.forEach(function(c){
        var im = document.createElement("img");
        im.alt = hidden ? "" : c.name; im.src = c.url; im.setAttribute("data-u", c.url); im.decoding = "async";
        im.style.setProperty("--s", String(c.scale || 1));
        im.addEventListener("error", function(){
          track.querySelectorAll("img").forEach(function(x){ if(x.getAttribute("data-u")===c.url) x.remove(); });
          if(!track.querySelector("img")){ bandOK = false; $("logoBand").hidden = true; }
        });
        d.appendChild(im);
      });
      return d;
    }
    track.appendChild(half(false)); track.appendChild(half(true));
    bandOK = true;
  }
  var bandBuilt = false;
  function ensureBand(){ if(bandBuilt) return; bandBuilt = true; buildLogoBand(); }

  function exInputs(e){
    var tier = (typeof e.consultores==="number") ? e.consultores : -1;
    return {reps:e.comerciales, rest:e.resto, team:e.gastoAnual, calls:e.ingresos, apps:e.gastoApps, appsRep:e.gastoGrabacion, appsUnknown:false,
      rec:CFG.recDefault, uplift:CFG.upliftByReview[e.revisaLlamadas] !== undefined ? CFG.upliftByReview[e.revisaLlamadas] : CFG.upliftDefault,
      subst:100, plan:"monthly", audOn:true, revOn:true, hasConsult:tier>=0 ? "yes" : "no", consultTier:tier};
  }
  function buildExamples(){
    var grid = $("exGrid"), list = CFG.examples || [];
    grid.textContent = "";
    $("examples").hidden = !CFG.showExamples;
    if(!CFG.showExamples) return;
    list.forEach(function(e, i){
      var r = compute(exInputs(e)), card = el("article","ex-card");
      card.appendChild(el("p","ex-tag",tr("exTag")));
      card.appendChild(el("h3","",e.label[LANG] || e.label[LANG==="es"?"en":"es"] || ""));
      var dl = el("dl","ex-facts");
      [["exPeople", group(r.people)], ["exSpend", eur(r.team)], ["exRevenue", eur(r.calls)]].forEach(function(p){
        var row = el("div"); row.appendChild(el("dt","",tr(p[0]))); row.appendChild(el("dd","",p[1])); dl.appendChild(row);
      });
      card.appendChild(dl);
      var res = el("div","ex-res");
      [["exSave", r.save, ""], ["exEarn", r.earn, ""], ["exNet", r.net, "net"+(r.net<0?" neg":"")]].forEach(function(p){
        var row = el("div", p[2]); row.appendChild(el("span","",tr(p[0]) + " · " + tr("exPerYear"))); row.appendChild(el("b","",eur(p[1]))); res.appendChild(row);
      });
      card.appendChild(res);
      var b = el("button","btn btn-line btn-rect",tr("exLoad")); b.type = "button";
      b.addEventListener("click", function(){ loadExample(i); });
      card.appendChild(b);
      grid.appendChild(card);
    });
  }
  function loadExample(i){
    var e = (CFG.examples || [])[i]; if(!e) return;
    var x = exInputs(e);
    Object.assign(state, {sector:SECTORS.indexOf(e.sector)>=0 ? e.sector : "", reps:x.reps, rest:x.rest, team:x.team, calls:x.calls,
      recCalls:e.revisaLlamadas, hasConsult:x.hasConsult, consultTier:x.consultTier, apps:x.apps, appsRep:x.appsRep, appsUnknown:false,
      rec:x.rec, uplift:x.uplift, upliftSet:false, subst:100, plan:"monthly", audOn:true, revOn:true});
    syncControls();
    goto(LAST);
    var r = $("netCard"); if(r && r.scrollIntoView) r.scrollIntoView({behavior: reduced?"auto":"smooth", block:"start"});
  }

  on(root, "input", markStart);
  on(root, "change", markStart);
  on(root, "click", function(e){ if(e.target.closest && e.target.closest("button,label,li")) markStart(); });
  // Con el id de la reserva (?r=) no se pide el email; si no, el campo es opcional y se manda con el cálculo
  if(host.reservaId){ var emailBox = $("emailBox"); if(emailBox) emailBox.hidden = true; }
  if($("emailReserva")) on($("emailReserva"), "input", function(){ if(state.step===LAST) sheetSoon(); });
  LANG = "es"; state.lang = "es";
  applyStatic();
  syncControls();
  buildExamples();
  renderSteps(); render(); announce();

  return function destroy() {
    off.forEach(function (f) { f(); });
    timers.forEach(function (t) { clearInterval(t); clearTimeout(t); });
    document.documentElement.classList.remove("md-open");
  };
}
