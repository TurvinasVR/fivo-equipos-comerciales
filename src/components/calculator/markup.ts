// Marcado de la calculadora: copia del original, sin cabecera, titular ni pie (los pone esta página).
// Constante propia, sin datos de usuario.
export const CALCULATOR_HTML = `<div id="page">
<main class="wrap" id="calc">
<ol aria-label="Progreso" class="steps" data-i18n-aria="s092" id="steps">
<li class="stp on" data-s="1"><button class="stp-btn" type="button" aria-current="step"><b><em class="n">1</em><svg aria-hidden="true" class="ck" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></b><span data-i18n="s012">Tu empresa</span></button></li>
<li class="stp" data-s="2"><div aria-hidden="true" class="stp-line"><i></i></div><button class="stp-btn" type="button"><b><em class="n">2</em><svg aria-hidden="true" class="ck" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></b><span data-i18n="w010">Tus ventas</span></button></li>
<li class="stp" data-s="3"><div aria-hidden="true" class="stp-line"><i></i></div><button class="stp-btn" type="button"><b><em class="n">3</em><svg aria-hidden="true" class="ck" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></b><span data-i18n="s013">Tus herramientas</span></button></li>
<li class="stp" data-s="4"><div aria-hidden="true" class="stp-line"><i></i></div><button class="stp-btn" type="button"><b><em class="n">4</em><svg aria-hidden="true" class="ck" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></b><span data-i18n="s014">Tu resultado</span></button></li>
</ol>
<div class="shell">
<section aria-labelledby="h1s" class="wiz" id="step1">
<div class="wiz-body">
<h3 class="q-title" id="h1s">¿A qué sector pertenece tu empresa?</h3>
<div class="dd" id="secDd">
<button aria-controls="secList" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="h1s secVal" class="dd-btn" id="secBtn" role="combobox" type="button"><span class="dd-icon" id="secIc"></span><span class="dd-val" id="secVal">Elige tu sector</span><svg aria-hidden="true" class="dd-chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>
<ul aria-labelledby="h1s" class="dd-list" id="secList" role="listbox" tabindex="-1">
<li aria-selected="false" data-v="tech" id="sec-tech" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg><span data-i18n="w013">Tecnología</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="services" id="sec-services" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/></svg><span data-i18n="w014">Servicios profesionales</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="agency" id="sec-agency" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM15 9a4 4 0 010 6M18 7a7 7 0 010 10"/></svg><span data-i18n="w015">Agencia o marketing</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="realestate" id="sec-realestate" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/></svg><span data-i18n="w016">Inmobiliaria</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="finance" id="sec-finance" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6zM9 12l2 2 4-4"/></svg><span data-i18n="w017">Seguros y finanzas</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="health" id="sec-health" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/></svg><span data-i18n="w018">Salud</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="education" id="sec-education" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><path d="M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6"/></svg><span data-i18n="w019">Educación</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="industry" id="sec-industry" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><path d="M3 21h18M5 21V11l5 3v-3l5 3V5h4v16"/></svg><span data-i18n="w020">Industria</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="retail" id="sec-retail" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2"/></svg><span data-i18n="w021">Comercio</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
<li aria-selected="false" data-v="other" id="sec-other" role="option"><svg aria-hidden="true" class="dd-ic" viewBox="0 0 24 24"><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/></svg><span data-i18n="w022">Otro</span><svg aria-hidden="true" class="dd-ck" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>
</ul>
</div>
<p class="q-sub" data-i18n="w023" id="memTitle">Miembros de mi equipo</p>
<div aria-labelledby="memTitle" class="fields" role="group">
<div class="fld">
<label data-i18n="w024" for="reps">Comerciales</label>
<div class="input stepper"><button aria-label="Quitar un comercial" class="sq" data-for="reps" data-step="-1" type="button">−</button><input aria-describedby="step1Msg" autocomplete="off" data-i18n-ph="s093" data-k="reps" id="reps" inputmode="numeric" placeholder="Número de personas" value="3"/><button aria-label="Añadir un comercial" class="sq" data-for="reps" data-step="1" type="button">+</button></div>
</div>
<div class="fld">
<label data-i18n="w025" for="rest">Resto del equipo</label>
<div class="input stepper"><button aria-label="Quitar una persona del resto del equipo" class="sq" data-for="rest" data-step="-1" type="button">−</button><input aria-describedby="step1Msg" autocomplete="off" data-i18n-ph="s093" data-k="rest" id="rest" inputmode="numeric" placeholder="Número de personas" value="7"/><button aria-label="Añadir una persona al resto del equipo" class="sq" data-for="rest" data-step="1" type="button">+</button></div>
</div>
</div>
<p class="q-sub">Tus números</p>
<div class="fields">
<div class="fld">
<label data-i18n="s019" for="team">Gasto anual</label>
<div class="input"><input aria-describedby="step1Msg" autocomplete="off" data-i18n-ph="s094" data-k="team" id="team" inputmode="numeric" placeholder="Gasto anual" value="300.000"/><span class="unit">€</span></div>
<p class="hint" data-i18n="s020">Salarios y cargas de todo el equipo.</p>
</div>
<div class="fld">
<label data-i18n="s021" for="calls">Ingresos anuales aprox.</label>
<div class="input"><input autocomplete="off" data-i18n-ph="s095" data-k="calls" id="calls" inputmode="numeric" placeholder="Ingresos anuales" value="600.000"/><span class="unit">€</span></div>
<p class="hint" data-i18n="s022">Lo que generan al año las ventas de tu empresa.</p>
</div>
</div>
</div>
<div class="nav-row">
<p aria-live="polite" class="hint warn" id="step1Msg"></p>
<span></span>
<button class="btn-cta" id="next1" type="button"><span data-i18n="s023">Continuar</span> <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewbox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>
</div>
</section>
<section aria-labelledby="h2s" class="wiz" hidden="" id="step2">
<div class="wiz-body">
<h3 class="q-title" data-i18n="w032" id="h2s">¿Grabáis y revisáis las llamadas de venta?</h3>
<div aria-labelledby="h2s" class="cards c3" role="radiogroup">
<label class="ch"><input name="recCalls" type="radio" value="no"/><span data-i18n="w033">No</span></label>
<label class="ch"><input name="recCalls" type="radio" value="some"/><span data-i18n="w034">A veces</span></label>
<label class="ch"><input name="recCalls" type="radio" value="yes"/><span data-i18n="w035">Sí, siempre</span></label>
</div>
<fieldset class="q">
<legend class="q-sub" data-i18n="w036">¿Tenéis consultores o agencias externas que revisen las llamadas o los procesos de venta?</legend>
<div class="cards c2">
<label class="ch"><input name="hasConsult" type="radio" value="no"/><span data-i18n="w033">No</span></label>
<label class="ch"><input name="hasConsult" type="radio" value="yes"/><span data-i18n="w037">Sí</span></label>
</div>
<div class="sub-q" hidden="" id="consultBox">
<p class="q-sub" data-i18n="w038">¿Cuánto gastáis al año en ellos?</p>
<div class="cards tiers" id="tiers"></div>
</div>
</fieldset>
<fieldset class="q">
<legend class="q-sub" data-i18n="w039">¿Crees que sería necesario que alguien optimizase todos los departamentos de tu empresa?</legend>
<div class="cards c3">
<label class="ch"><input name="optimize" type="radio" value="yes"/><span data-i18n="w037">Sí</span></label>
<label class="ch"><input name="optimize" type="radio" value="maybe"/><span data-i18n="w040">Quizá</span></label>
<label class="ch"><input name="optimize" type="radio" value="no"/><span data-i18n="w033">No</span></label>
</div>
</fieldset>
</div>
<div class="nav-row">
<button class="btn btn-line" data-i18n="s036" id="back2" type="button">Atrás</button>
<button class="btn-cta" id="next2" type="button"><span data-i18n="s023">Continuar</span> <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewbox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>
</div>
</section>
<section aria-labelledby="h3s" class="wiz" hidden="" id="step3">
<div class="wiz-body">
<h3 class="q-title" data-i18n="w043" id="h3s">¿Cuánto gastas al mes en aplicaciones para tu empresa?</h3>
<div class="input xl"><input aria-labelledby="h3s" autocomplete="off" data-i18n-ph="w047" data-k="apps" id="apps" inputmode="numeric" placeholder="Gasto al mes" value="600"/><span class="unit" data-i18n="w044">€ al mes</span></div>
<label class="q-sub" data-i18n="w045" for="appsRep">¿Cuánto de eso es en grabación y transcripción de reuniones (Loom, Otter, Fireflies…)?</label>
<div class="input" id="appsRepBox"><input autocomplete="off" data-i18n-ph="w047" data-k="appsRep" id="appsRep" inputmode="numeric" placeholder="Gasto al mes" value="350"/><span class="unit" data-i18n="w044">€ al mes</span></div>
<label class="ch tog"><input id="appsUnknown" type="checkbox"/><span data-i18n="w046">No lo sé</span></label>
<p class="hint" id="appsHint"></p>
</div>
<div class="nav-row">
<button class="btn btn-line" data-i18n="s036" id="back3" type="button">Atrás</button>
<button class="btn-cta" id="next3" type="button"><span data-i18n="s037">Ver mi resultado</span> <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewbox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>
</div>
</section>
<aside aria-label="Resultado estimado" class="live" id="live">
<p class="live-k">Beneficio neto estimado</p>
<p class="live-n"><span class="live-num">— — — €</span><span class="live-per">al año</span></p>
<p class="live-status" id="liveStatus">Analizando tu sector…</p>
<dl class="live-rows">
<div><dt>Te ahorrarías</dt><dd></dd></div>
<div id="liveGainRow"><dt>Ganarías más</dt><dd></dd></div>
<div><dt>Coste de Fivo</dt><dd></dd></div>
</dl>
<p class="live-note">Tu resultado se calcula con cada respuesta. Lo verás al final.</p>
</aside>
</div>
<section hidden="" id="step4">
<div class="rs">
<p class="rs-back"><button class="link-btn" data-i18n="s070" id="editData" type="button">← Cambiar mis datos</button></p>
<div class="res" id="netCard">
<div class="res-head">
<h3 class="rs-title" data-i18n="r001">Esto es lo que Fivo podría darte cada año</h3>
</div>
<p class="net" id="net"><span aria-hidden="true" class="rv-ok"></span><span class="net-k" id="rcTail"></span><b class="net-n" id="rcEq"></b></p>
<p class="rs-negnote" hidden="" id="rcNeg"></p>
<div class="dual" id="dual">
<div class="stat"><span class="dl" data-i18n="r002">Te ahorrarías</span><p class="big" id="saveBig">—</p><span class="dy" data-i18n="r004">al año</span></div>
<div class="stat" id="earnBox"><span class="dl" data-i18n="r003">Ganarías más</span><p class="big" id="earnBig">—</p><span class="dy" data-i18n="r004">al año</span></div>
<div class="stat" id="costBox"><span class="dl">Coste de Fivo al mes</span><p class="big" id="costBig">—</p><span class="dy" id="costYear"></span></div>
</div>
<p class="sr-only"><span id="rcExpr"></span></p>
<p class="rs-price" id="priceMsg"></p>
<div class="cta" id="ctaBox">
<h4 id="ctaTitle">Descárgalo y tráelo a tu llamada. Lo revisamos juntos.</h4>
<div class="fv-email" id="emailBox"><label for="emailReserva">¿Con qué email has reservado?</label><input class="fv-field" id="emailReserva" type="email" autocomplete="email" inputmode="email" placeholder="Opcional"/></div>
<button class="btn-cta btn-main" id="ctaPdf" type="button"><svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" viewbox="0 0 24 24"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14"></path></svg><span id="ctaPdfText">Descargar mi cálculo en PDF</span></button>
<p class="rs-priv">Guardamos tu cálculo para preparar tu llamada. Más información en la <a href="/legal/privacidad" target="_blank" rel="noopener">política de privacidad</a>.</p>
<p class="rs-est"><span data-i18n="r030">Estimación a partir de tus datos</span> · <button class="rs-link" data-i18n="r031" id="openCalc" type="button">Ver cómo se calcula</button></p>
</div>
</div><div aria-labelledby="lbTitle" class="logo-band" hidden="" id="logoBand" role="region">
<p class="lb-title" data-i18n="w001" id="lbTitle">Empresas que ya usan Fivo</p>
<div class="lb-view"><div class="lb-track" id="lbTrack"></div></div>
</div>
</div>
<p class="rs-after">Antes de la llamada, piensa qué quieres resolver primero.</p>
<section aria-labelledby="t-ex" class="ex" hidden="" id="examples">
<div class="ex-in">
<h3 data-i18n="x001" id="t-ex">Así sale el cálculo en empresas como la tuya</h3>
<p class="ex-note" data-i18n="x002">Ejemplos ilustrativos con datos de muestra. No son clientes reales.</p>
<div class="ex-grid" id="exGrid"></div>
</div>
</section>
</section>
<p class="sr-only" id="srStatus" role="status" aria-live="polite"></p>
</main>
</div>
<div class="modal" hidden="" id="calcModal">
<div class="modal-backdrop" id="mdBackdrop"></div>
<div aria-labelledby="mdTitle" aria-modal="true" class="modal-box" id="mdBox" role="dialog" tabindex="-1">
<div class="md-head"><h2 data-i18n="m001" id="mdTitle">Cómo se calcula tu resultado</h2><button class="md-x" data-i18n-aria="m002" id="mdClose" type="button">×</button></div>
<div class="md-body">
<p class="md-intro" data-i18n="s072">Cada línea suma a su subtotal y al total. Tus datos aparecen tal cual los introduces y lo estimado va marcado como tal.</p>
<table class="tbl" id="tbl"></table>
<p class="check" id="check"></p>
<div class="rs-pad">
<div class="bill">
<div class="bill-l">
<span class="t" data-i18n="s042">Facturación · Plan Business, el más vendido</span>
<span class="d" id="billDetail"></span>
</div>
<div aria-label="Facturación de Fivo" class="cseg cseg-sm" data-i18n-aria="s098" role="group">
<button aria-pressed="true" data-i18n="s043" data-plan="monthly" type="button">Mensual</button>
<button aria-pressed="false" data-plan="annual" type="button"><span data-i18n="s044">Anual</span> <span class="save" data-i18n="s045">AHORRA 25%</span></button>
</div>
</div>
<p class="bill-note" id="billNote"></p>
</div>
<div class="rs-pad rs-assume">
<h3 data-i18n="s061">Pon a prueba los supuestos</h3>
<p class="mini-sub" data-i18n="s062">Parten de valores razonables. Bájalos o desactiva los suplementos y comprueba cuánto sigue saliendo.</p>
<div class="range-row">
<div class="top"><span data-i18n="s063">Tiempo de búsqueda que recuperas</span><b id="recv"></b></div>
<input aria-label="Porcentaje del tiempo de búsqueda que recuperas" data-i18n-aria="s101" data-k="rec" id="rec" max="50" min="0" step="1" type="range" value="25"/>
<p id="recEq" style="font-size:12px;color:var(--ph);margin:0"></p>
</div>
<label class="opt">
<span class="t"><input checked="" id="revOn" type="checkbox"/><span><span data-i18n="s064">Incluir la mejora de ventas</span><small data-i18n="s065">Es una hipótesis: mejor seguimiento de llamadas y menos oportunidades perdidas.</small></span></span>
<div class="more" id="upRow">
<div class="range-row" style="margin:0">
<div class="top"><span data-i18n="s066">Mejora sobre tus ingresos por llamadas</span><b id="upv"></b></div>
<input aria-label="Mejora de ingresos por llamadas" data-i18n-aria="s102" data-k="uplift" id="up" max="5" min="0" step="0.5" type="range" value="1"/>
</div>
</div>
</label>
<div class="range-row">
<div class="top"><span data-i18n="s067">Herramientas que Fivo sustituye</span><b id="subv"></b></div>
<input aria-label="Porcentaje de herramientas sustituidas" data-i18n-aria="s103" data-k="subst" id="sub" max="100" min="0" step="5" type="range" value="100"/>
</div>
<label class="opt">
<span class="t"><input checked="" id="audOn" type="checkbox"/><span><span data-i18n="w050">Incluir el análisis externo</span><small data-i18n="w051">Lo que costaría contratar consultores o un análisis externo. Fivo lo hace de forma continua con tus reuniones. Desactívalo si no lo contratarías.</small></span></span>
</label>
</div>
<div class="rs-pad rs-share">
<div class="rs-btns">
<button class="btn btn-line btn-rect btn-sm" data-i18n="s060" id="pdfBtn" type="button">Descargar PDF</button>
</div>
<form id="leadForm" novalidate="" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
<input type="text" name="company" id="hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
<div class="input" style="flex:1;min-width:190px"><input aria-label="Correo electrónico" autocomplete="email" data-i18n-aria="s100" data-i18n-ph="s099" id="email" placeholder="tu@empresa.com" required="" type="email"/></div>
<button class="btn-cta btn-rect" data-i18n="s058" type="submit">Enviarme mi informe</button>
</form>
<p class="legal" id="legalNote"><span data-i18n="n004">Al enviarlo aceptas la</span> <a data-i18n="s085" href="/legal/privacidad" rel="noopener" target="_blank">Política de Privacidad</a>.</p><p id="msg" role="status" style="font-size:13px;margin:12px 0 0;min-height:1em"></p>
</div>
<p class="est-note rs-pad" data-i18n="e001">Estimación basada en tus datos, en McKinsey Global Institute (2012) y en los precios públicos de Fivo. Los resultados reales dependen de cada equipo.</p>
</div>
</div>
</div>
`;
