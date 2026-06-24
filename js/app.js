import {
  getShifts, getShift, addShift, updateShift, deleteShift,
  addCall, updateCall, deleteCall, getAllCalls,
  getSettings, updateSettings,
  getCodeNote, setCodeNote,
  exportJSON, importJSON, clearAll,
  exportCodeNotes, importCodeNotes,
} from "./storage.js";
import { CODE_GROUPS, CODE_MAP, ALL_CODES, URGENCY, PROCEDURES, X_SUBCODES } from "./codes.js";
import { codeInfo } from "./codeinfo.js";
import { computeStats, shiftHours, DAYPARTS, WEEKDAYS } from "./stats.js";
import { ekgWaveSvg } from "./ekgwave.js";
import { STATIONS, stationLabel, ALL_UNITS, findStation, stationColor, DEFAULT_ACCENT, unitLevel } from "./stations.js";

// ---------- Lista + oma syöte -valitsimet (asema / yksikkö) ----------
const CUSTOM = "__custom__";

function stationComboHtml(id, value) {
  const v = value || "";
  const inList = STATIONS.some((s) => stationLabel(s) === v);
  const custom = !!v && !inList;
  return `
    <select id="${id}">
      <option value="">– valitse asema –</option>
      ${STATIONS.map((s) => `<option value="${esc(stationLabel(s))}" ${v === stationLabel(s) ? "selected" : ""}>${esc(stationLabel(s))}</option>`).join("")}
      <option value="${CUSTOM}" ${custom ? "selected" : ""}>Muu (kirjoita itse)…</option>
    </select>
    <input type="text" id="${id}-custom" placeholder="Kirjoita asema" value="${custom ? esc(v) : ""}" style="${custom ? "" : "display:none"}">
  `;
}

function unitOptionList(units, value) {
  const list = units || ALL_UNITS;
  const v = value || "";
  const inList = list.includes(v);
  const custom = !!v && !inList;
  return `
    <option value="">– valitse yksikkö –</option>
    ${list.map((u) => `<option value="${esc(u)}" ${v === u ? "selected" : ""}>${esc(u)}</option>`).join("")}
    <option value="${CUSTOM}" ${custom ? "selected" : ""}>Muu (kirjoita itse)…</option>
  `;
}

function unitComboHtml(id, value, units) {
  const v = value || "";
  const inList = (units || ALL_UNITS).includes(v);
  const custom = !!v && !inList;
  return `
    <select id="${id}">${unitOptionList(units, v)}</select>
    <input type="text" id="${id}-custom" placeholder="Kirjoita yksikkö" value="${custom ? esc(v) : ""}" style="${custom ? "" : "display:none"}">
  `;
}

// Lue valitsimen arvo (lista tai oma syöte).
function readCombo(id) {
  const sel = document.getElementById(id);
  if (!sel) return "";
  if (sel.value === CUSTOM) return (val(id + "-custom") || "").trim();
  return sel.value;
}

// Kytke asema- ja yksikkövalitsin yhteen: oma-syöte näkyviin tarvittaessa,
// yksikkölista suodattuu aseman mukaan, ja yksikkö esitäyttyy.
function wireStationUnit(stationId, unitId, { onStationChange, onUnitChange } = {}) {
  const stSel = document.getElementById(stationId);
  const stCustom = document.getElementById(stationId + "-custom");
  const unSel = document.getElementById(unitId);
  const unCustom = document.getElementById(unitId + "-custom");
  const unitChanged = () => { if (onUnitChange) onUnitChange(readCombo(unitId)); };

  function refreshUnitOptions(prefill) {
    const station = findStation(readCombo(stationId));
    const current = readCombo(unitId);
    unSel.innerHTML = unitOptionList(station?.units, current);
    if (prefill && station && station.units.length && !current) {
      unSel.value = station.units[0];
    }
    unCustom.style.display = unSel.value === CUSTOM ? "" : "none";
  }

  stSel.onchange = () => {
    stCustom.style.display = stSel.value === CUSTOM ? "" : "none";
    if (stSel.value === CUSTOM) stCustom.focus();
    refreshUnitOptions(true);
    if (onStationChange) onStationChange(findStation(readCombo(stationId)));
    unitChanged();
  };
  stCustom.oninput = () => { if (onStationChange) onStationChange(findStation(readCombo(stationId))); };
  unSel.onchange = () => {
    unCustom.style.display = unSel.value === CUSTOM ? "" : "none";
    if (unSel.value === CUSTOM) unCustom.focus();
    unitChanged();
  };
  unCustom.oninput = unitChanged;
}

const app = document.getElementById("app");
const X_OUTCOMES = CODE_GROUPS.find((g) => g.id === "x").categories[0].codes
  .map(([code, name]) => `${code} – ${name}`);
const DISPOSITIONS = [
  "Kuljetettu",
  ...X_OUTCOMES,
  "Muu",
];
// Oma rooli toimenpiteissä (valvontataso)
const ROLES = ["", "Suoritin itse", "Avustin", "Seurasin"];

// Meilahden teho-osaston moduulit (valitaan, kun kohde on teho-osasto)
const TEHO_MODULES = ["Moduuli AB", "Moduuli C", "Moduuli ED"];
// Onko kuljetuskohde Meilahden teho-osasto?
function isTeho(dest) {
  return /teho/i.test(dest || "");
}

// Tapahtumaloki: yleiset aikaleimattavat tapahtumat (ei oppikirjasisältöä).
const TIMELINE_EVENTS = [
  "Potilas tavoitettu",
  "Hoito aloitettu",
  "Painelu alkoi",
  "Rytmintarkistus",
  "Defibrillointi",
  "Adrenaliini",
  "Lääke annettu",
  "ROSC",
  "Kuljetus alkoi",
  "Luovutus",
];
function nowClock() { return new Date().toTimeString().slice(0, 8); }
function timelineListHtml(items) {
  if (!items.length) return `<p class="muted small">Ei tapahtumia. Napauta painiketta kirjataksesi aikaleiman juuri nyt.</p>`;
  return `<div class="tl-rows">${items.map((e, i) =>
    `<div class="tl-item"><span class="tl-time">${esc(e.t)}</span><span class="tl-label">${esc(e.label)}</span><button type="button" class="tl-del" data-i="${i}" aria-label="Poista">×</button></div>`).join("")}</div>`;
}

// X-koodin tarkennevalikon optiot (esim. X-4 -> X-41…X-45).
function xSubOptions(disposition, selected) {
  const base = (disposition || "").split(" ")[0];
  const subs = X_SUBCODES[base];
  if (!subs) return "";
  return `<option value="">— valitse tarkenne —</option>` +
    subs.map(([code, name]) => `<option value="${code}" ${selected === code ? "selected" : ""}>${esc(code)} ${esc(name)}</option>`).join("");
}

// ---------- Lisätietolinkit (ensihoito-online.fi) ----------
const EHO = "https://www.ensihoito-online.fi/";
const INFO_BASE = EHO + "ensihoidon-tehtavakoodit/";
// Tehtäväkoodikohtaiset sivut (varmistetut osoitteet).
const INFO_CODE = {
  "700": EHO + "eloton/", "701": EHO + "eloton/",
  "702": EHO + "702-tajuttomuus/", "703": EHO + "703-hengitysvaikeus/",
  "704": EHO + "rintakipu/", "705": EHO + "705-rytmihairio/",
  "706": EHO + "aivoverenkiertohairio/", "714": EHO + "hukkuminen/",
  "752": EHO + "752-myrkytys/", "754": EHO + "754-palovamma/",
  "771": EHO + "sokeritasapainon-hairio/", "772": EHO + "kouristelu/",
  "773": EHO + "yliherkkyysreaktio/", "774": EHO + "774-heikentynyt-yleistila-muu-sairastuminen/",
};
// Kategoriakohtaiset sivut koodin alun perusteella.
const INFO_CATEGORY = [
  { test: (c) => /^74\d?$/.test(c) || /^2\d\d$/.test(c), url: EHO + "vamma-liikenneonnettomuus/" },
];
function infoUrlForCode(code) {
  if (!code) return INFO_BASE;
  if (INFO_CODE[code]) return INFO_CODE[code];
  for (const m of INFO_CATEGORY) if (m.test(code)) return m.url;
  return INFO_BASE;
}
// Avainsanavihjeet: kuvauksesta tunnistetut aiheet nostavat esiin lisätietolinkin.
const KEYWORD_TIPS = [
  // Rytmihäiriöt
  { kw: ["svt", "supraventrikulaari"], label: "Supraventrikulaarinen takykardia (SVT)", url: EHO + "supraventrikulaarinen-takykardia/" },
  { kw: ["kammiotakykardia", " vt ", "vt,", "leveäkompleksi"], label: "Kammiotakykardia", url: EHO + "kammiotakykardia/" },
  { kw: ["kääntyvien kärkien", "torsades"], label: "Kääntyvien kärkien kammiotakykardia", url: EHO + "kaantyvien-karkien-kammiotakykardia/" },
  { kw: ["eteisvärinä", "flimmeri", "flutteri", "flutter"], label: "Eteisvärinä", url: EHO + "eteisvarina/" },
  { kw: ["rytmihäiri", "takykardia", "bradykardia", "nopea syke", "tiheälyönti"], label: "Rytmihäiriö", url: EHO + "705-rytmihairio/" },
  // Sydän & rintakipu
  { kw: ["stemi", "sydäninfarkti", "infarkti", "rintakipu", "sepelvaltimo", "nstemi"], label: "Rintakipu / sydäninfarkti", url: EHO + "rintakipu/" },
  // Elvytys
  { kw: ["elvytys", "eloton", "kammiovärinä", "vf", "rosc", "defibrillaatio"], label: "Eloton / elvytys", url: EHO + "eloton/" },
  // Hengitys
  { kw: ["hengitysvaik", "astma", "copd", "keuhkopöhö", "hengenahdistus"], label: "Hengitysvaikeus", url: EHO + "703-hengitysvaikeus/" },
  // Neurologia
  { kw: ["aivoinfarkti", "avh", "halvaus", "aivoverenkierto", "tia", "fast"], label: "Aivoverenkiertohäiriö (AVH)", url: EHO + "aivoverenkiertohairio/" },
  { kw: ["kouristel", "epilept", "status epilepticus"], label: "Kouristelu", url: EHO + "kouristelu/" },
  { kw: ["tajuttom", "gcs"], label: "Tajuttomuus", url: EHO + "702-tajuttomuus/" },
  // Aineenvaihdunta
  { kw: ["hypoglykemia", "matala sokeri", "hypo ", "verensokeri", "diabet", "ketoasidoosi"], label: "Sokeritasapainon häiriö", url: EHO + "sokeritasapainon-hairio/" },
  // Allergia
  { kw: ["anafylak", "yliherkkyys", "allerg"], label: "Yliherkkyysreaktio / anafylaksia", url: EHO + "yliherkkyysreaktio/" },
  // Myrkytys
  { kw: ["myrkytys", "intoksikaatio", "yliannos", "intox"], label: "Myrkytys", url: EHO + "752-myrkytys/" },
  // Trauma
  { kw: ["aivovamma", "kallovamma", "päävamma", "pää vamma", "ptt", "kallonsisä"], label: "Aivovammapotilas", url: EHO + "vamma-liikenneonnettomuus/" },
  { kw: ["palovamma", "palanut", "savukaasu"], label: "Palovamma", url: EHO + "754-palovamma/" },
  { kw: ["hukku", "veteen", "upos"], label: "Hukkuminen", url: EHO + "hukkuminen/" },
];
function tipsFor(text) {
  const t = (text || "").toLowerCase();
  return KEYWORD_TIPS.filter((tip) => tip.kw.some((k) => t.includes(k)));
}
function tipsHtml(tips) {
  return tips.map((tip) => `<a class="tip" href="${tip.url}" target="_blank" rel="noopener">💡 ${esc(tip.label)}</a>`).join("");
}
// Lyhyt lopputulosmerkintä (X-koodille tarkenne mukaan, esim. X-51).
function dispositionShort(c) {
  if (!c.disposition) return "Kesken";
  if (c.disposition.startsWith("X-")) {
    return c.xSub || c.disposition.split(" ")[0];
  }
  return c.disposition;
}

// ---------- Reititys ----------
function route() {
  const hash = location.hash.slice(1) || "/";
  const [path, param] = hash.split("/").filter(Boolean).length
    ? parseHash(hash)
    : ["home", null];
  setActiveTab(path);
  window.scrollTo(0, 0);
  applyAccent(); // oletusaseman teema; vuoronäkymät korvaavat omalla asemallaan
  switch (path) {
    case "home": return renderHome();
    case "shift": return renderShiftDetail(param);
    case "summary": return renderShiftSummary(param);
    case "calls": return renderCalls();
    case "stats": return renderStats();
    case "codes": return renderCodes();
    case "tools": return renderTools();
    case "report": return renderReport();
    case "weekreport": return renderWeekReport();
    case "portfolio": return renderPortfolio();
    case "fieldguide": return renderFieldGuide();
    case "ekg": return renderEkg();
    case "settings": return renderSettings();
    default: return renderHome();
  }
}

function parseHash(hash) {
  const parts = hash.split("/").filter(Boolean);
  return [parts[0] || "home", parts[1] || null];
}

function setActiveTab(path) {
  const tab = ["shift", "summary"].includes(path) ? "home" : (["report", "weekreport", "portfolio", "fieldguide", "ekg"].includes(path) ? "tools" : path);
  document.querySelectorAll(".tabbar a").forEach((a) => {
    a.classList.toggle("active", a.dataset.tab === tab);
  });
}

// ---------- Etusivu: vuorolista / kalenteri ----------
let homeView = "list";
const calCursor = new Date();
calCursor.setDate(1);

function renderHome() {
  const shifts = getShifts();
  const s = computeStats();
  const incompleteCount = getAllCalls().filter((c) => !c.disposition).length;
  app.innerHTML = `
    <header class="page-head">
      <div>
        <h1>Vuorot</h1>
        <p class="sub">${shifts.length} vuoroa · ${s.callCount} keikkaa · ${s.hoursLogged} h</p>
      </div>
      <button class="btn primary" id="newShift">+ Vuoro</button>
    </header>
    <div class="seg view-seg">
      <button type="button" data-v="list" class="${homeView === "list" ? "on" : ""}">Lista</button>
      <button type="button" data-v="calendar" class="${homeView === "calendar" ? "on" : ""}">Kalenteri</button>
    </div>
    ${incompleteCount ? `<button type="button" class="reminder" id="goIncomplete"><span class="rem-ic">⏳</span> <span><b>${incompleteCount}</b> keskeneräistä keikkaa – täydennä loppuun</span><span class="rem-go">›</span></button>` : ""}
    ${shifts.length === 0 ? emptyState() : ""}
    <div id="home-body"></div>
  `;
  document.getElementById("newShift").onclick = () => openShiftForm();
  const goInc = document.getElementById("goIncomplete");
  if (goInc) goInc.onclick = () => { callFilter = { ...callFilter, incomplete: true }; location.hash = "#calls"; };
  document.querySelectorAll(".view-seg button").forEach((b) => {
    b.onclick = () => { homeView = b.dataset.v; renderHome(); };
  });
  const body = document.getElementById("home-body");
  if (homeView === "calendar") body.innerHTML = calendarHtml(shifts);
  else body.innerHTML = shiftGroupsHtml(shifts);

  if (homeView === "calendar") {
    document.getElementById("cal-prev").onclick = () => { calCursor.setMonth(calCursor.getMonth() - 1); renderHome(); };
    document.getElementById("cal-next").onclick = () => { calCursor.setMonth(calCursor.getMonth() + 1); renderHome(); };
    body.querySelectorAll("[data-shift]").forEach((el) => { el.onclick = () => { location.hash = `#shift/${el.dataset.shift}`; }; });
    body.querySelectorAll("[data-newdate]").forEach((el) => { el.onclick = () => openShiftForm({ date: el.dataset.newdate, type: "day" }); });
  }
}

function calendarHtml(shifts) {
  const y = calCursor.getFullYear(), m = calCursor.getMonth();
  const months = ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu",
    "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"];
  const byDate = {};
  for (const s of shifts) (byDate[s.date] = byDate[s.date] || []).push(s);

  const first = new Date(y, m, 1);
  let startDow = (first.getDay() + 6) % 7; // ma=0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayIso = today();

  let cells = "";
  for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayShifts = byDate[iso] || [];
    const isToday = iso === todayIso;
    if (dayShifts.length) {
      const sft = dayShifts[0];
      const cls = sft.type === "day" ? "day" : sft.type === "night" ? "night" : "custom";
      const totalCalls = dayShifts.reduce((n, s) => n + (s.calls?.length || 0), 0);
      cells += `<div class="cal-cell ${cls} ${isToday ? "today" : ""}" data-shift="${sft.id}">
        <span class="cal-day">${d}</span>
        <span class="cal-badge">${totalCalls}</span>
      </div>`;
    } else {
      cells += `<div class="cal-cell ${isToday ? "today" : ""}" data-newdate="${iso}"><span class="cal-day">${d}</span></div>`;
    }
  }

  return `
    <div class="cal-head">
      <button class="iconbtn" id="cal-prev">‹</button>
      <strong>${months[m]} ${y}</strong>
      <button class="iconbtn" id="cal-next">›</button>
    </div>
    <div class="cal-grid">
      ${["ma", "ti", "ke", "to", "pe", "la", "su"].map((d) => `<div class="cal-dow">${d}</div>`).join("")}
      ${cells}
    </div>
    <div class="cal-legend">
      <span><i class="lg day"></i> Päivä 9–21</span>
      <span><i class="lg night"></i> Yö 21–9</span>
      <span><i class="lg custom"></i> Muu</span>
      <span class="muted">Numero = keikat</span>
    </div>`;
}

function emptyState() {
  return `
    <div class="empty">
      <div class="empty-icon">🚑</div>
      <h2>Tervetuloa KenttäLogiin</h2>
      <p>Kirjaa työharjoittelusi vuorot ja niiden keikat. Aloita lisäämällä ensimmäinen vuoro.</p>
      <p class="note">🔒 Älä kirjaa potilaan tunnistetietoja (nimi, hetu, osoite). Pidä merkinnät yleisellä tasolla.</p>
    </div>`;
}

// Vuoron suhde nykyhetkeen: 0 = tänään / käynnissä, 1 = tuleva, 2 = mennyt.
function shiftCategory(s, now = new Date()) {
  const todayISO = localISO(now);
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  if (s.date === todayISO) return 0;
  // Yövuoro (21–9) jatkuu seuraavan päivän aamuun → käynnissä klo < 9
  if (s.type === "night" && s.date === localISO(yest) && now.getHours() < 9) return 0;
  if (s.date > todayISO) return 1;
  return 2;
}

function shiftStartMin(s) {
  const t = s.startTime || (s.type === "night" ? "21:00" : "09:00");
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function shiftTypeName(s) {
  return s.type === "day" ? "Päivävuoro" : s.type === "night" ? "Yövuoro" : "Vuoro";
}

// Ryhmittely: nykyinen + tulevat ylhäällä (aikajärjestyksessä), menneet erikseen alla.
function shiftGroupsHtml(shifts) {
  const now = new Date();
  const active = [], past = [];
  for (const s of shifts) (shiftCategory(s, now) === 2 ? past : active).push(s);
  const byDateAsc = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : shiftStartMin(a) - shiftStartMin(b));
  active.sort(byDateAsc);
  past.sort((a, b) => -byDateAsc(a, b)); // menneet: uusin ensin

  const block = (s, isPast) =>
    `<div class="shift-block${isPast ? " past" : ""}"><div class="shift-date">${formatDateLong(s.date)}</div>${shiftCard(s)}</div>`;

  let html = `<div class="list">${active.map((s) => block(s, false)).join("")}</div>`;
  if (past.length) {
    html += `<div class="group-div">Menneet vuorot</div>`;
    html += `<div class="list">${past.map((s) => block(s, true)).join("")}</div>`;
  }
  return html;
}

function shiftCard(s) {
  const calls = s.calls || [];
  const tag = s.type === "day"
    ? `<span class="pill day">Päivä 9–21</span>`
    : s.type === "night"
      ? `<span class="pill night">Yö 21–9</span>`
      : `<span class="pill">${esc(s.startTime || "")}–${esc(s.endTime || "")}</span>`;
  const dots = calls.slice(0, 12).map((c) => {
    const col = URGENCY[c.urgency]?.color || "#888";
    return `<span class="dot" style="background:${col}" title="${esc(c.code || "")}"></span>`;
  }).join("");
  const level = s.ht === false ? `<span class="pill pt">PT</span>` : `<span class="pill ht">HT</span>`;
  const today = shiftCategory(s) === 0 ? `<span class="pill now">Tänään</span>` : "";
  const sub = [s.unit, s.station].filter(Boolean).map(esc).join(" · ");
  const accent = stationColor(s.station) || "var(--primary)";
  return `
    <a class="card shift-card${today ? " is-today" : ""}" href="#shift/${s.id}" style="--sc:${accent}">
      <div class="card-top">
        <div class="date">${shiftTypeName(s)}</div>
        <span class="pills">${today}${level}${tag}</span>
      </div>
      ${sub ? `<div class="muted card-sub">${sub}</div>` : ""}
      <div class="card-bottom">
        <span class="count">${calls.length} keikkaa</span>
        <span class="dots">${dots}</span>
      </div>
    </a>`;
}

// ---------- Vuoron lisäys / muokkaus ----------
function openShiftForm(existing) {
  const settings = getSettings();
  const s = existing || {
    date: today(),
    type: "day",
    unit: settings.defaultUnit || "",
    station: settings.defaultStation || "",
    ht: settings.defaultHt !== false,
  };
  const isDay = s.type === "day", isNight = s.type === "night";
  const isCustom = !isDay && !isNight;
  const isHt = s.ht !== false;
  openModal(existing ? "Muokkaa vuoroa" : "Uusi vuoro", `
    <label>Päivämäärä
      <input type="date" id="f-date" value="${esc(s.date)}">
    </label>
    <label>Vuorotyyppi
      <div class="seg" id="f-type">
        <button type="button" data-t="day" class="${isDay ? "on" : ""}">Päivä 9–21</button>
        <button type="button" data-t="night" class="${isNight ? "on" : ""}">Yö 21–9</button>
        <button type="button" data-t="custom" class="${isCustom ? "on" : ""}">Muu</button>
      </div>
    </label>
    <div id="f-customtimes" class="row" style="${isCustom ? "" : "display:none"}">
      <label>Alku<input type="time" id="f-start" value="${esc(s.startTime || "")}"></label>
      <label>Loppu<input type="time" id="f-end" value="${esc(s.endTime || "")}"></label>
    </div>
    <label>Taso
      <div class="seg" id="f-ht">
        <button type="button" data-ht="1" class="${isHt ? "on" : ""}">Hoitotaso (HT)</button>
        <button type="button" data-ht="0" class="${isHt ? "" : "on"}">Perustaso (PT)</button>
      </div>
    </label>
    <label>Asema / tukikohta
      ${stationComboHtml("f-station", s.station)}
    </label>
    <label>Yksikkö
      ${unitComboHtml("f-unit", s.unit, findStation(s.station)?.units)}
    </label>
    <label>Muistiinpanot / oppimispäiväkirja
      <textarea id="f-notes" rows="3" placeholder="Mitä opit tänään?">${esc(s.notes || "")}</textarea>
    </label>
  `, {
    onSave: () => {
      let type = document.querySelector("#f-type .on")?.dataset.t || "day";
      const patch = {
        date: val("f-date") || today(),
        type,
        startTime: type === "custom" ? val("f-start") : "",
        endTime: type === "custom" ? val("f-end") : "",
        ht: (document.querySelector("#f-ht .on")?.dataset.ht ?? "1") === "1",
        unit: readCombo("f-unit"),
        station: readCombo("f-station"),
        notes: val("f-notes"),
      };
      if (existing) updateShift(existing.id, patch);
      else {
        const created = addShift(patch);
        location.hash = `#shift/${created.id}`;
      }
      closeModal();
      route();
    },
    extra: existing ? {
      label: "Poista vuoro",
      danger: true,
      action: () => {
        if (confirm("Poistetaanko vuoro ja sen keikat?")) {
          deleteShift(existing.id);
          closeModal();
          location.hash = "#/";
        }
      },
    } : null,
  });

  // tyyppivalinnan logiikka
  document.querySelectorAll("#f-type button").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("#f-type button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      document.getElementById("f-customtimes").style.display = b.dataset.t === "custom" ? "" : "none";
    };
  });
  // tasovalinnan logiikka
  const setHt = (ht) => document.querySelectorAll("#f-ht button").forEach((x) => x.classList.toggle("on", x.dataset.ht === (ht ? "1" : "0")));
  document.querySelectorAll("#f-ht button").forEach((b) => {
    b.onclick = () => setHt(b.dataset.ht === "1");
  });
  // asema → suodata yksikkövalinnat; yksikkö → automaattinen taso (HE12=HT, HE13=PT)
  wireStationUnit("f-station", "f-unit", {
    onUnitChange: (unit) => { const lvl = unitLevel(unit); if (lvl !== null) setHt(lvl); },
  });
  // uudessa vuorossa esitäytä taso oletusyksikön mukaan
  if (!existing) { const lvl = unitLevel(readCombo("f-unit")); if (lvl !== null) setHt(lvl); }
}

// ---------- Vuoron tarkka näkymä + keikat ----------
function renderShiftDetail(id) {
  const s = getShift(id);
  if (!s) { location.hash = "#/"; return; }
  applyShiftAccent(s);
  const calls = (s.calls || []).slice();
  const head = s.type === "day" ? "Päivävuoro 9–21"
    : s.type === "night" ? "Yövuoro 21–9"
      : `Vuoro ${esc(s.startTime || "")}–${esc(s.endTime || "")}`;
  app.innerHTML = `
    <header class="page-head">
      <div>
        <a class="back" href="#/">‹ Vuorot</a>
        <h1>${formatDate(s.date)}</h1>
        <p class="sub">${s.ht === false ? "PT" : "HT"} · ${head} · ${shiftHours(s)} h${s.unit ? " · " + esc(s.unit) : ""}${s.station ? " · " + esc(s.station) : ""}</p>
      </div>
      <div class="head-actions">
        <button class="btn ghost" id="summaryBtn">Yhteenveto</button>
        <button class="btn ghost" id="editShift">Muokkaa</button>
      </div>
    </header>
    ${s.notes ? `<div class="notebox">📝 ${esc(s.notes)}</div>` : ""}
    <div class="section-head">
      <h2>Keikat (${calls.length})</h2>
      <button class="btn primary" id="newCall">+ Keikka</button>
    </div>
    <div class="list">
      ${calls.length === 0 ? `<p class="muted center">Ei vielä keikkoja tällä vuorolla.</p>` : calls.map((c) => callRow(s.id, c)).join("")}
    </div>
    <button class="fab" id="fabCall" aria-label="Lisää keikka">+</button>
  `;
  document.getElementById("editShift").onclick = () => openShiftForm(s);
  document.getElementById("summaryBtn").onclick = () => { location.hash = `#summary/${s.id}`; };
  document.getElementById("newCall").onclick = () => openCallForm(s.id);
  document.getElementById("fabCall").onclick = () => openCallForm(s.id);
  app.querySelectorAll("[data-call]").forEach((el) => {
    el.onclick = (e) => {
      if (e.target.closest("[data-dup]")) return;
      openCallForm(s.id, (s.calls || []).find((c) => c.id === el.dataset.call));
    };
  });
  app.querySelectorAll("[data-dup]").forEach((b) => {
    b.onclick = (e) => {
      e.stopPropagation();
      const src = (s.calls || []).find((c) => c.id === b.dataset.dup);
      if (!src) return;
      const { id, ...rest } = src;
      const dup = { ...rest, time: nowTime(), description: "", reflection: "", timeline: null, photos: null };
      addCall(s.id, dup);
      toast("Keikka kopioitu");
      renderShiftDetail(s.id);
    };
  });
}

// Tehtävän "teema-aste": jos tehtävällä on lopputulos kuljetuskoodilla/-asteella,
// käytä kuljetuksen (lopputuloksen) hälytysastetta; muuten alkuperäistä hälytyskoodin astetta.
function effectiveUrgency(c) {
  if (c.disposition === "Kuljetettu" && c.transportUrgency) return c.transportUrgency;
  return c.urgency || "";
}

function callRow(shiftId, c) {
  const eu = effectiveUrgency(c);
  const u = URGENCY[eu];
  const info = CODE_MAP.get(c.code);
  return `
    <div class="call" data-call="${c.id}" style="${u ? `--uc:${u.color}` : ""}">
      <div class="call-left">
        ${u ? `<span class="urg" style="background:${u.color}">${u.label}</span>` : `<span class="urg none">–</span>`}
      </div>
      <div class="call-body">
        <div class="call-title">
          <span class="code">${esc(c.code || "?")}</span>
          <span class="cname">${esc(c.codeName || info?.name || "")}</span>
          ${c.time ? `<span class="time">${esc(c.time)}</span>` : ""}
        </div>
        ${c.description ? `<div class="call-desc">${esc(c.description)}</div>` : ""}
        ${vitalsLine(c.vitals)}
        <div class="call-meta">
          ${c.disposition ? `<span class="meta-pill">${esc(dispositionShort(c))}</span>` : `<span class="meta-pill kesken">Kesken</span>`}
          ${c.destination ? `<span class="meta-pill dest">${esc(c.destination)}${c.tehoModule ? " · " + esc(c.tehoModule) : ""}</span>` : ""}
          ${c.disposition === "Kuljetettu" && c.transportCode ? `<span class="meta-pill">Kulj. ${esc(c.transportCode)}${c.transportUrgency ? " " + esc(c.transportUrgency) : ""}</span>` : ""}
          ${(c.tags || []).map((t) => `<span class="meta-pill tag">${esc(t)}</span>`).join("")}
          ${c.role ? `<span class="meta-pill role">${esc(c.role)}</span>` : ""}
          ${(c.timeline || []).length ? `<span class="meta-pill tl">⏱ ${c.timeline.length} tapahtumaa</span>` : ""}
          ${(c.photos || []).length ? `<span class="meta-pill">📷 ${c.photos.length}</span>` : ""}
        </div>
      </div>
      <button class="dup-btn" data-dup="${c.id}" title="Kopioi keikka">⧉</button>
    </div>`;
}

function vitalsLine(v) {
  if (!v) return "";
  const parts = [];
  if (v.rr) parts.push(`RR ${esc(v.rr)}`);
  if (v.hr) parts.push(`P ${esc(v.hr)}`);
  if (v.spo2) parts.push(`SpO₂ ${esc(v.spo2)}`);
  if (v.gcs) parts.push(`GCS ${esc(v.gcs)}`);
  return parts.length ? `<div class="vitals-line">${parts.join(" · ")}</div>` : "";
}

// ---------- Vuoron yhteenveto (tulostettava) ----------
function renderShiftSummary(id) {
  const s = getShift(id);
  if (!s) { location.hash = "#/"; return; }
  applyShiftAccent(s);
  const calls = (s.calls || []).slice().sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const head = s.type === "day" ? "Päivävuoro 9–21"
    : s.type === "night" ? "Yövuoro 21–9"
      : `Vuoro ${esc(s.startTime || "")}–${esc(s.endTime || "")}`;
  const urg = { A: 0, B: 0, C: 0, D: 0 };
  let transported = 0;
  const tagCount = {};
  for (const c of calls) {
    if (urg[c.urgency] != null) urg[c.urgency]++;
    if (c.disposition === "Kuljetettu") transported++;
    for (const t of c.tags || []) tagCount[t] = (tagCount[t] || 0) + 1;
  }
  const tagSummary = Object.entries(tagCount).map(([t, n]) => `${esc(t)}${n > 1 ? " ×" + n : ""}`).join(", ");

  app.innerHTML = `
    <div class="no-print page-head">
      <a class="back" href="#shift/${s.id}">‹ Takaisin</a>
      <button class="btn primary" id="printBtn">🖨️ Tulosta / Tallenna PDF</button>
    </div>
    <article class="print-view">
      <div class="pv-head">
        <h1>KenttäLog – vuoroyhteenveto</h1>
        <div class="pv-meta">
          <strong>${formatDate(s.date)}</strong> · ${s.ht === false ? "Perustaso (PT)" : "Hoitotaso (HT)"} · ${head} · ${shiftHours(s)} h
          ${s.unit ? "<br>Yksikkö: " + esc(s.unit) : ""}${s.station ? " · " + esc(s.station) : ""}
        </div>
      </div>

      <div class="pv-stats">
        <span><b>${calls.length}</b> keikkaa</span>
        <span><b>${transported}</b> kuljetusta</span>
        <span>A:${urg.A} B:${urg.B} C:${urg.C} D:${urg.D}</span>
      </div>
      ${tagSummary ? `<p class="pv-tags"><b>Merkittävät tapaukset:</b> ${tagSummary}</p>` : ""}

      <table class="pv-table">
        <thead>
          <tr><th>Aika</th><th>Aste</th><th>Koodi</th><th>Tehtävä</th><th>Kuvaus</th><th>Peruselintoiminnot</th><th>Kuljetus</th></tr>
        </thead>
        <tbody>
          ${calls.length ? calls.map((c) => {
            const v = c.vitals;
            const vs = v ? [v.rr && "RR " + v.rr, v.hr && "P " + v.hr, v.spo2 && "SpO₂ " + v.spo2, v.gcs && "GCS " + v.gcs].filter(Boolean).join(", ") : "";
            const destLabel = c.destination ? (c.tehoModule ? `${c.destination} (${c.tehoModule})` : c.destination) : "";
            let disp = c.disposition ? [dispositionShort(c), destLabel].filter(Boolean).join(": ") : "Kesken";
            if (c.disposition === "Kuljetettu" && c.transportCode) {
              disp += ` (${c.transportCode}${c.transportUrgency ? " " + c.transportUrgency : ""})`;
            }
            const tagsLine = (c.tags || []).length ? `<div class="pv-rowtags">${(c.tags || []).map(esc).join(", ")}${c.role ? ` — ${esc(c.role)}` : ""}</div>` : (c.role ? `<div class="pv-rowtags">${esc(c.role)}</div>` : "");
            const refl = c.reflection ? `<div class="pv-rowrefl">💡 ${esc(c.reflection)}</div>` : "";
            const tl = (c.timeline || []).length ? `<div class="pv-rowtl">⏱ ${c.timeline.map((e) => `${esc(e.t)} ${esc(e.label)}`).join(" · ")}</div>` : "";
            return `<tr>
              <td>${esc(c.time || "")}</td>
              <td>${esc(c.urgency || "")}</td>
              <td>${esc(c.code || "")}</td>
              <td>${esc(c.codeName || "")}</td>
              <td>${esc(c.description || "")}${tagsLine}${tl}${refl}</td>
              <td>${esc(vs)}</td>
              <td>${esc(disp)}</td>
            </tr>`;
          }).join("") : `<tr><td colspan="7" class="muted">Ei keikkoja.</td></tr>`}
        </tbody>
      </table>

      ${s.notes ? `<div class="pv-notes"><h2>Oppimispäiväkirja</h2><p>${esc(s.notes)}</p></div>` : ""}

      <p class="pv-foot">Henkilökohtainen oppimispäiväkirja. Ei sisällä potilaan tunnistetietoja. Ei virallinen potilasasiakirja.</p>
    </article>
  `;
  document.getElementById("printBtn").onclick = () => window.print();
}

// ---------- Keikan lisäys / muokkaus ----------
function openCallForm(shiftId, existing) {
  const settings = getSettings();
  const c = existing || { time: nowTime(), urgency: "", disposition: "" };
  let timeline = (c.timeline || []).map((e) => ({ ...e }));
  let photos = (c.photos || []).slice();
  // Sisäänrakennetut toimenpiteet + käyttäjän omat tagit
  const allTags = [...new Set([...PROCEDURES, ...(settings.tags || [])])];
  const isX = (c.disposition || "").startsWith("X-");
  openModal(existing ? "Muokkaa keikkaa" : "Uusi keikka", `
    <div class="row">
      <label>Kellonaika<input type="time" id="c-time" value="${esc(c.time || "")}"></label>
      <label>Hälytysaste
        <div class="seg urg-seg" id="c-urg">
          ${["A", "B", "C", "D"].map((k) => `<button type="button" data-u="${k}" class="${c.urgency === k ? "on" : ""}" style="--uc:${URGENCY[k].color}">${k}</button>`).join("")}
        </div>
      </label>
    </div>
    <label>Tehtäväkoodi (hälytyskoodi)
      <input type="text" id="c-codesearch" list="codelist" value="${esc(c.code || "")}" placeholder="Hae numerolla tai sanalla, esim. 704 tai rintakipu" autocomplete="off">
      <datalist id="codelist">
        ${ALL_CODES.map((x) => `<option value="${x.code}">${x.code} – ${esc(x.name)} (${x.lead})</option>`).join("")}
      </datalist>
      <div class="quickcodes" id="c-quick">${quickCodesHtml(c.code)}</div>
      <div class="hint" id="c-codehint">${codeHint(c.code)}</div>
      <a class="info-link" id="c-info" href="${infoUrlForCode(c.code)}" target="_blank" rel="noopener">ⓘ Lisätiedot ensihoito-online.fi</a>
      <div class="code-note" id="c-note">${codeNoteHtml(c.code)}</div>
    </label>
    <p class="form-note">Voit tallentaa pelkän hälytyskoodin nyt ja täydentää loput myöhemmin.</p>
    <div id="c-guide">${guidanceHtml(c.code, c.urgency)}</div>
    <label>Kuvaus
      <textarea id="c-desc" rows="3" placeholder="Lyhyt kuvaus keikasta (ei tunnistetietoja)">${esc(c.description || "")}</textarea>
      <div class="tips" id="c-tips">${tipsHtml(tipsFor(c.description))}</div>
    </label>
    <label>Lopputulos / kuljetus
      <select id="c-disp">
        <option value="" ${!c.disposition ? "selected" : ""}>— Kesken (täydennä myöhemmin)</option>
        ${DISPOSITIONS.map((d) => `<option ${c.disposition === d ? "selected" : ""}>${esc(d)}</option>`).join("")}
      </select>
    </label>
    <div id="c-xwrap" style="${isX ? "" : "display:none"}">
      <label>Tarkenne
        <select id="c-xsub">${isX ? xSubOptions(c.disposition, c.xSub) : ""}</select>
      </label>
    </div>
    <div id="c-destwrap" style="${c.disposition === "Kuljetettu" ? "" : "display:none"}">
      <label>Kuljetuskohde
        <input type="text" id="c-dest" list="destlist" value="${esc(c.destination || "")}" placeholder="esim. Meilahti">
        <datalist id="destlist">
          ${settings.destinations.map((d) => `<option value="${esc(d)}">`).join("")}
        </datalist>
      </label>
      <div id="c-tehowrap" style="${isTeho(c.destination) ? "" : "display:none"}">
        <label>Teho-osaston moduuli
          <div class="seg" id="c-teho">
            ${TEHO_MODULES.map((m) => `<button type="button" data-m="${esc(m)}" class="${(c.tehoModule || "") === m ? "on" : ""}">${esc(m)}</button>`).join("")}
          </div>
        </label>
      </div>
      <div class="row">
        <label>Kuljetuskoodi
          <input type="text" id="c-tcode" list="codelist" value="${esc(c.transportCode || c.code || "")}" placeholder="oletus = hälytyskoodi" autocomplete="off">
        </label>
        <label>Kuljetuksen kiireellisyys
          <div class="seg urg-seg" id="c-turg">
            ${["A", "B", "C", "D"].map((k) => `<button type="button" data-u="${k}" class="${(c.transportUrgency || c.urgency) === k ? "on" : ""}" style="--uc:${URGENCY[k].color}">${k}</button>`).join("")}
          </div>
        </label>
      </div>
    </div>
    <label>Merkittävät tapaukset / toimenpiteet
      <div class="chips" id="c-tags">
        ${allTags.map((t) => `<button type="button" class="chip ${(c.tags || []).includes(t) ? "on" : ""}" data-tag="${esc(t)}">${esc(t)}</button>`).join("")}
      </div>
      <input type="text" id="c-tagextra" placeholder="Muu, lisää pilkulla eroteltuna" value="${esc((c.tags || []).filter((t) => !allTags.includes(t)).join(", "))}">
    </label>
    <label>Oma rooli toimenpiteissä
      <div class="seg" id="c-role">
        ${ROLES.map((r) => `<button type="button" data-r="${esc(r)}" class="${(c.role || "") === r ? "on" : ""}">${esc(r || "–")}</button>`).join("")}
      </div>
    </label>
    <label>Tapahtumaloki – aikaleimat
      <div class="tl-presets" id="c-tl-presets">
        ${TIMELINE_EVENTS.map((e) => `<button type="button" class="tl-btn" data-ev="${esc(e)}">+ ${esc(e)}</button>`).join("")}
      </div>
      <div class="tl-add">
        <input type="text" id="c-tl-custom" placeholder="Oma tapahtuma…">
        <button type="button" class="btn-sm" id="c-tl-addbtn">Lisää nyt</button>
      </div>
      <div class="tl-list" id="c-tl-list">${timelineListHtml(timeline)}</div>
    </label>
    <label>Peruselintoiminnot (vapaaehtoinen)
      <div class="vitals">
        <span><small>RR</small><input type="text" id="v-rr" inputmode="numeric" value="${esc(c.vitals?.rr || "")}" placeholder="120/80"></span>
        <span><small>Pulssi</small><input type="text" id="v-hr" inputmode="numeric" value="${esc(c.vitals?.hr || "")}" placeholder="72"></span>
        <span><small>SpO₂</small><input type="text" id="v-spo2" inputmode="numeric" value="${esc(c.vitals?.spo2 || "")}" placeholder="98%"></span>
        <span><small>GCS</small><input type="text" id="v-gcs" inputmode="numeric" value="${esc(c.vitals?.gcs || "")}" placeholder="15"></span>
      </div>
    </label>
    <label>Reflektio – mitä opin
      <textarea id="c-reflect" rows="2" placeholder="Lyhyt oppi tästä keikasta">${esc(c.reflection || "")}</textarea>
    </label>
    <label>Kuvat (vapaaehtoinen, ei potilastietoja)
      <input type="file" id="c-photo" accept="image/*" multiple capture="environment">
      <div class="photo-grid" id="c-photos">${(c.photos || []).map((p, i) => `<div class="photo-thumb"><img src="${esc(p)}" alt=""><button type="button" class="photo-del" data-pi="${i}">×</button></div>`).join("")}</div>
      <p class="form-note">Esim. rytmistrippi, tilannekuva (anonymisoitu). Tallentuu tähän laitteeseen.</p>
    </label>
  `, {
    onSave: () => {
      const code = val("c-codesearch").trim().toUpperCase();
      const urgency = document.querySelector("#c-urg .on")?.dataset.u || "";
      const chipTags = [...document.querySelectorAll("#c-tags .chip.on")].map((b) => b.dataset.tag);
      const extraTags = splitList(val("c-tagextra"));
      const vitals = { rr: val("v-rr"), hr: val("v-hr"), spo2: val("v-spo2"), gcs: val("v-gcs") };
      const hasVitals = Object.values(vitals).some((v) => v.trim());
      const disposition = val("c-disp");
      const transported = disposition === "Kuljetettu";
      const xSub = disposition.startsWith("X-") ? val("c-xsub") : "";
      // Kuljetuskoodi/-kiireellisyys: oletus = hälytyskoodi/-aste (millä HäKe hälytti)
      const transportCode = transported ? (val("c-tcode").trim().toUpperCase() || code) : "";
      const transportUrgency = transported ? (document.querySelector("#c-turg .on")?.dataset.u || urgency) : "";
      const patch = {
        time: val("c-time"),
        urgency,
        code,
        codeName: CODE_MAP.get(code)?.name || "",
        lead: CODE_MAP.get(code)?.lead || "",
        description: val("c-desc"),
        disposition,
        xSub,
        destination: transported ? val("c-dest") : "",
        tehoModule: transported && isTeho(val("c-dest")) ? (document.querySelector("#c-teho .on")?.dataset.m || "") : "",
        transportCode,
        transportCodeName: CODE_MAP.get(transportCode)?.name || "",
        transportUrgency,
        tags: [...new Set([...chipTags, ...extraTags])],
        role: document.querySelector("#c-role .on")?.dataset.r || "",
        reflection: val("c-reflect"),
        vitals: hasVitals ? vitals : null,
        timeline: timeline.length ? timeline : null,
        photos: photos.length ? photos : null,
      };
      if (existing) updateCall(shiftId, existing.id, patch);
      else addCall(shiftId, patch);
      closeModal();
      renderShiftDetail(shiftId);
    },
    extra: existing ? {
      label: "Poista keikka",
      danger: true,
      action: () => {
        if (confirm("Poistetaanko keikka?")) {
          deleteCall(shiftId, existing.id);
          closeModal();
          renderShiftDetail(shiftId);
        }
      },
    } : null,
  });

  // Onko kuljetuskenttiä muokattu käsin? Jos ei, ne peilaavat hälytyskoodia/-astetta.
  let tcodeEdited = !!(existing && existing.transportCode && existing.transportCode !== existing.code);
  let turgEdited = !!(existing && existing.transportUrgency && existing.transportUrgency !== existing.urgency);
  const tcodeEl = document.getElementById("c-tcode");
  tcodeEl.addEventListener("input", () => { tcodeEdited = true; });

  function selectUrg(container, value) {
    container.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x.dataset.u === value));
  }

  const currentUrg = () => document.querySelector("#c-urg .on")?.dataset.u || "";
  const refreshGuide = () => {
    document.getElementById("c-guide").innerHTML = guidanceHtml(search.value.trim().toUpperCase(), currentUrg());
  };
  document.querySelectorAll("#c-urg button").forEach((b) => {
    b.onclick = () => {
      selectUrg(document.getElementById("c-urg"), b.dataset.u);
      if (!turgEdited) selectUrg(document.getElementById("c-turg"), b.dataset.u);
      refreshGuide();
    };
  });
  document.querySelectorAll("#c-turg button").forEach((b) => {
    b.onclick = () => { turgEdited = true; selectUrg(document.getElementById("c-turg"), b.dataset.u); };
  });
  const search = document.getElementById("c-codesearch");
  const applyCode = () => {
    const code = search.value.trim().toUpperCase();
    document.getElementById("c-codehint").innerHTML = codeHint(code);
    document.getElementById("c-info").href = infoUrlForCode(code);
    document.getElementById("c-note").innerHTML = codeNoteHtml(code);
    refreshGuide();
    document.querySelectorAll("#c-quick .qc-chip").forEach((x) => x.classList.toggle("on", x.dataset.qc === code));
    if (!tcodeEdited) tcodeEl.value = code;
  };
  search.oninput = applyCode;
  document.querySelectorAll("#c-quick .qc-chip").forEach((b) => {
    b.onclick = () => { search.value = b.dataset.qc; applyCode(); };
  });
  document.getElementById("c-note").onclick = (e) => {
    const a = e.target.closest("[data-editnote]");
    if (!a) return;
    e.preventDefault();
    openCodeNote(a.dataset.editnote, () => {
      document.getElementById("c-note").innerHTML = codeNoteHtml(search.value.trim().toUpperCase());
    });
  };
  const descEl = document.getElementById("c-desc");
  descEl.addEventListener("input", () => {
    document.getElementById("c-tips").innerHTML = tipsHtml(tipsFor(descEl.value));
  });
  document.getElementById("c-disp").onchange = (e) => {
    const v = e.target.value;
    document.getElementById("c-destwrap").style.display = v === "Kuljetettu" ? "" : "none";
    const xwrap = document.getElementById("c-xwrap");
    const isXnow = v.startsWith("X-");
    xwrap.style.display = isXnow ? "" : "none";
    if (isXnow) document.getElementById("c-xsub").innerHTML = xSubOptions(v, "");
  };
  const destEl = document.getElementById("c-dest");
  destEl.addEventListener("input", () => {
    document.getElementById("c-tehowrap").style.display = isTeho(destEl.value) ? "" : "none";
  });
  document.querySelectorAll("#c-teho button").forEach((b) => {
    b.onclick = () => document.querySelectorAll("#c-teho button").forEach((x) => x.classList.toggle("on", x === b));
  });
  document.querySelectorAll("#c-tags .chip").forEach((b) => {
    b.onclick = () => b.classList.toggle("on");
  });
  document.querySelectorAll("#c-role button").forEach((b) => {
    b.onclick = () => document.querySelectorAll("#c-role button").forEach((x) => x.classList.toggle("on", x === b));
  });
  // Tapahtumaloki
  const tlList = document.getElementById("c-tl-list");
  const renderTl = () => {
    tlList.innerHTML = timelineListHtml(timeline);
    tlList.querySelectorAll(".tl-del").forEach((b) => {
      b.onclick = () => { timeline.splice(Number(b.dataset.i), 1); renderTl(); };
    });
  };
  document.querySelectorAll("#c-tl-presets .tl-btn").forEach((b) => {
    b.onclick = () => { timeline.push({ t: nowClock(), label: b.dataset.ev }); renderTl(); };
  });
  const tlAdd = () => {
    const v = val("c-tl-custom").trim();
    if (!v) return;
    timeline.push({ t: nowClock(), label: v });
    document.getElementById("c-tl-custom").value = "";
    renderTl();
  };
  document.getElementById("c-tl-addbtn").onclick = tlAdd;
  document.getElementById("c-tl-custom").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); tlAdd(); }
  });
  renderTl();
  // Kuvaliitteet
  const photosEl = document.getElementById("c-photos");
  const renderPhotos = () => {
    photosEl.innerHTML = photos.map((p, i) => `<div class="photo-thumb"><img src="${esc(p)}" alt=""><button type="button" class="photo-del" data-pi="${i}">×</button></div>`).join("");
    photosEl.querySelectorAll(".photo-del").forEach((b) => {
      b.onclick = () => { photos.splice(Number(b.dataset.pi), 1); renderPhotos(); };
    });
  };
  renderPhotos();
  document.getElementById("c-photo").onchange = (e) => {
    for (const file of e.target.files) {
      const reader = new FileReader();
      reader.onload = () => { photos.push(reader.result); renderPhotos(); };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };
}

function codeHint(code) {
  const info = CODE_MAP.get((code || "").toUpperCase());
  if (!info) return "";
  return `<span class="lead-tag" style="--lc:${info.color}">${info.lead}</span> ${esc(info.name)} · <span class="muted">${esc(info.category)}</span>`;
}
// Pikavalinta: omat yleisimmät/viimeisimmät koodit, tai oletusjoukko ilman historiaa.
const QUICK_DEFAULTS = ["745", "704", "703", "702", "774", "781", "785", "770"];
function topCodesForQuickPick(limit = 8) {
  const freq = {}, lastSeen = {};
  for (const c of getAllCalls()) {
    if (!c.code) continue;
    freq[c.code] = (freq[c.code] || 0) + 1;
    const ts = (c.shift?.date || "") + (c.time || "");
    if (!lastSeen[c.code] || ts > lastSeen[c.code]) lastSeen[c.code] = ts;
  }
  const codes = Object.keys(freq);
  if (!codes.length) return QUICK_DEFAULTS.filter((c) => CODE_MAP.has(c)).slice(0, limit);
  codes.sort((a, b) => (freq[b] - freq[a]) || (lastSeen[b] > lastSeen[a] ? 1 : -1));
  return codes.slice(0, limit);
}
function quickCodesHtml(currentCode) {
  const cur = (currentCode || "").toUpperCase();
  const codes = topCodesForQuickPick(8);
  if (!codes.length) return "";
  return `<div class="qc-label">Pikavalinta</div><div class="qc-row">${codes.map((code) => {
    const name = CODE_MAP.get(code)?.name || "";
    return `<button type="button" class="qc-chip ${cur === code ? "on" : ""}" data-qc="${esc(code)}"><b>${esc(code)}</b> ${esc(name)}</button>`;
  }).join("")}</div>`;
}
// Kevyt, turvallinen Markdown-muotoilu omille muistiinpanoille.
// Tukee: # otsikot, **lihavointi**, *kursiivi*, - / 1. listat, [linkki](url),
// ![kuva](url) ja `koodi`. Teksti escapetataan AINA ennen muotoilua.
function mdInline(s) {
  // s on jo HTML-escapattu
  s = s.replace(/!\[([^\]]*)\]\((https?:[^)\s]+)\)/g, (_m, alt, url) => `<img class="cn-img" src="${url}" alt="${alt}" loading="lazy">`);
  s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (_m, t, url) => `<a href="${url}" target="_blank" rel="noopener">${t}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(>])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/(^|[\s(>])_([^_\n]+)_/g, "$1<em>$2</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}
function renderNoteMarkdown(md) {
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let listType = null;
  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };
  let para = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${mdInline(esc(para.join(" ")))}</p>`); para = []; } };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) { flushPara(); closeList(); continue; }
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      flushPara(); closeList();
      const lvl = Math.min(m[1].length + 2, 6);
      out.push(`<h${lvl} class="cn-h">${mdInline(esc(m[2]))}</h${lvl}>`);
    } else if ((m = line.match(/^!\[([^\]]*)\]\((https?:[^)\s]+)\)\s*$/))) {
      flushPara(); closeList();
      out.push(`<img class="cn-img" src="${esc(m[2])}" alt="${esc(m[1])}" loading="lazy">`);
    } else if ((m = line.match(/^[-*•]\s+(.*)$/))) {
      flushPara();
      if (listType !== "ul") { closeList(); out.push('<ul class="cn-ul">'); listType = "ul"; }
      out.push(`<li>${mdInline(esc(m[1]))}</li>`);
    } else if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      flushPara();
      if (listType !== "ol") { closeList(); out.push('<ol class="cn-ol">'); listType = "ol"; }
      out.push(`<li>${mdInline(esc(m[1]))}</li>`);
    } else {
      para.push(line.trim());
    }
  }
  flushPara(); closeList();
  return out.join("");
}

// ---- Ohjerungot per tehtäväkoodi ----
// HUOM: Itse laadittuja, yleisiä kliinisiä muistirunkoja (ei Ensihoito-oppaan
// tekstiä, ei lääkeannoksia). Erottavat kiireellisen (A/B) ja vakaan (C/D)
// tehtävän painopisteet. Käyttäjä täydentää omalla materiaalillaan.
const GUIDE_BASE_AB = [
  "Varmista oma ja työparin turvallisuus; hälytä lisäapu ajoissa",
  "cABCDE: tunnista ja hoida henkeä uhkaavat löydökset heti",
  "Jatkuva monitorointi ja ABCDE:n toistaminen",
  "Ennakkoilmoitus ja kuljetus oikeaan hoitopaikkaan viiveettä",
];
const GUIDE_BASE_CD = [
  "Systemaattinen tutkiminen ja peruselintoimintojen arvio",
  "Esitiedot (SAMPLE) ja oireanalyysi (OPQRST)",
  "Arvioi kuljetustarve ja oikea hoitolinja",
  "Jos ei kuljeteta: selkeät jatko-ohjeet ja turvaverkko (milloin soitettava uudelleen)",
];
const GUIDE_CODE = {
  "700": { focus: "Eloton", primary: "ab", ab: ["Aloita laadukas paineluelvytys mahdollisimman keskeytyksittä", "Defibrilloi iskettävä rytmi varhain", "Turvaa ilmatie ja hapetus, ventiloi", "Mieti ja hoida palautuvat syyt", "Kirjaa tapahtuma-ajat tapahtumalokiin"], cd: ["Tämä tehtävä on lähtökohtaisesti kiireellinen – toimi A/B-rungolla", "Elottomuuden toteaminen / elvytyksestä pidättäytyminen pysyväisohjeen mukaan"] },
  "701": { focus: "Elvytys", primary: "ab", ab: ["Laadukas painelu–puhallus, minimoi tauot", "Defibrillaatio iskettävälle rytmille", "Ilmatien hallinta ja hapetus", "Hoida palautuvat syyt; harkitse syyn mukaista hoitoa", "Kirjaa ajat tapahtumalokiin (rytmintarkistus, defib, lääke, ROSC)"], cd: ["Lähtökohtaisesti kiireellinen – käytä A/B-runkoa"] },
  "702": { focus: "Tajuttomuus", primary: "ab", ab: ["Turvaa ilmatie (asento ja apuvälineet)", "Hapetus ja ventilaation tuki tarvittaessa", "Mittaa verensokeri", "Arvioi GCS, pupillat ja puolierot", "Etsi syytä (mm. happivaje, matala sokeri, myrkytys, AVH)"], cd: ["Seuraa tajunnan tasoa toistuvasti", ...GUIDE_BASE_CD] },
  "703": { focus: "Hengitysvaikeus", primary: "ab", ab: ["Tue happeutumista tavoitesaturaatioon", "Arvioi hengitystyö, -taajuus ja hengitysäänet", "Asentohoito (puoli-istuva)", "Harkitse CPAP / ventilaation tuki pysyväisohjeen mukaan"], cd: ["Selvitä taustasairaus ja lääkitys", ...GUIDE_BASE_CD] },
  "704": { focus: "Rintakipu", primary: "ab", ab: ["Ota 12-kanavainen EKG varhain ja toista tarvittaessa", "Jatkuva rytmiseuranta, defibrillaatiovalmius", "Hoida pysyväisohjeen mukaan", "Ennakkoilmoitus tarvittaessa (PCI-valmius)"], cd: ["Kivun luonne (OPQRST) ja riskitekijät", "12-EKG myös vakaalla", ...GUIDE_BASE_CD] },
  "705": { focus: "Rytmihäiriö", primary: "ab", ab: ["12-kanavainen EKG ja jatkuva monitorointi", "Arvioi vakaus vs. epävakaus", "Kardioversio- / tahdistusvalmius epävakaalla", "Hoito pysyväisohjeen tai konsultaation mukaan"], cd: ["Dokumentoi rytmi ja oireet (EKG)", ...GUIDE_BASE_CD] },
  "706": { focus: "Aivoverenkiertohäiriö", primary: "ab", ab: ["Tunnista oireet (esim. FAST) ja oireiden tarkka alkamisaika", "Mittaa verensokeri", "Pre-alert ja kuljetus AVH-yksikköön viiveettä", "Vältä turhia viiveitä kohteessa"], cd: ["Kirjaa oireiden alku ja kulku tarkasti", ...GUIDE_BASE_CD] },
  "711": { focus: "Ilmatie-este", primary: "ab", ab: ["Avaa ja turvaa ilmatie", "Poista este hallitusti, hapetus", "Varaudu ventilaatioon / kajoavaan ilmatiehen"], cd: GUIDE_BASE_CD },
  "713": { focus: "Hirttäytyminen / kuristuminen", primary: "ab", ab: ["Turvaa ilmatie ja hapetus", "Huomioi kaularangan mahdollinen vamma", "Seuraa tajuntaa ja hengitystä"], cd: GUIDE_BASE_CD },
  "714": { focus: "Hukkuminen", primary: "ab", ab: ["Turvaa ilmatie ja hapetus, varaudu elvytykseen", "Estä jäähtyminen, mittaa lämpö", "Seuraa hengitystä ja tajuntaa"], cd: GUIDE_BASE_CD },
  "771": { focus: "Sokeritasapainon häiriö", primary: "ab", ab: ["Mittaa verensokeri", "Hoida pysyväisohjeen mukaan", "Arvioi tajunta ja nielemiskyky ennen suun kautta annettavaa"], cd: ["Selvitä syy (lääkitys, ruokailu, sairaus)", ...GUIDE_BASE_CD] },
  "772": { focus: "Kouristelu", primary: "ab", ab: ["Turvaa ilmatie ja estä lisävammat", "Mittaa verensokeri", "Kirjaa kesto ja toistuvuus; hoito pysyväisohjeen mukaan"], cd: ["Toipumisen seuranta, syiden kartoitus", ...GUIDE_BASE_CD] },
  "773": { focus: "Yliherkkyysreaktio", primary: "ab", ab: ["Tunnista anafylaksia (hengitys ja verenkierto)", "Poista altiste", "Hoida pysyväisohjeen mukaan viiveettä"], cd: ["Lievässä reaktiossa seuranta ja jatko-ohjeet", ...GUIDE_BASE_CD] },
  "791": { focus: "Synnytys", primary: "ab", ab: ["Arvioi synnytyksen vaihe ja ehtiikö sairaalaan", "Valmistaudu äidin ja vauvan hoitoon", "Vastasyntyneen lämpötalous, hengitys ja virkeys"], cd: ["Säännölliset supistukset: arvioi kuljetus ajoissa", ...GUIDE_BASE_CD] },
  "796": { focus: "Monipotilastilanne", primary: "ab", ab: ["Tee tilannearvio ja triage", "Johtaminen, työnjako ja lisäresurssit", "Raportointi ja potilaiden priorisointi"], cd: ["Pienemmässä tilanteessa systemaattinen priorisointi", ...GUIDE_BASE_CD] },
  "785": { focus: "Mielenterveysongelma", primary: "cd", ab: ["Jos peruselintoiminnot uhattuna tai välitön vaara, siirry A/B-runkoon", "Oma turvallisuus; yhteistyö poliisin kanssa tarvittaessa"], cd: ["Arvioi itsetuhoisuus ja väkivaltariski", "Sulje pois somaattiset syyt", "Rauhallinen kohtaaminen, hoitopaikan ja -linjan valinta"] },
};
const GUIDE_PREFIX = {
  trauma: { focus: "Vamma", primary: "ab", ab: ["Hallitse henkeä uhkaava ulkoinen verenvuoto (paine- / kiristysside)", "cABCDE ja vammojen kartoitus", "Tue ranka ja immobilisoi tarvittaessa", "Estä jäähtyminen; kuljetus oikeaan traumayksikköön"], cd: ["Paikallinen vamma: tutki, tue ja arvioi toimintakyky", ...GUIDE_BASE_CD] },
  expo: { focus: "Onnettomuus / altistuminen", primary: "ab", ab: ["Oma turvallisuus ja altisteen tunnistus ensin", "Lopeta altistuminen turvallisesti", "ABCDE; palovammassa jäähdytä ja suojaa, estä jäähtyminen", "Myrkytyksessä selvitä aine, määrä ja altistusaika"], cd: ["Lievä altistus: seuranta ja jatko-ohjeet", ...GUIDE_BASE_CD] },
  bleed: { focus: "Verenvuoto", primary: "ab", ab: ["Arvioi vuodon määrä ja hemodynamiikka", "Tyrehdytä ulkoinen vuoto", "Varaudu sokin tunnistukseen ja hoitoon"], cd: ["Vähäinen vuoto: paikallishoito ja seuranta", ...GUIDE_BASE_CD] },
  symptom: { focus: "Kipuoire", primary: "cd", ab: ["Jos peruselintoiminnot uhattuna, siirry A/B-runkoon"], cd: ["Oireanalyysi (OPQRST) ja systemaattinen tutkiminen", "Tunnista hälyttävät löydökset (punaiset liput)", "Kivunhoito pysyväisohjeen mukaan", "Kuljetustarve ja oikea hoitopaikka"] },
};
const GUIDE_GROUP = {
  x: { focus: "Ei kuljetusta", primary: "cd", ab: ["Varmista, ettei jää henkeä uhkaavaa tilaa", "Konsultoi / pyydä hoito-ohje tarvittaessa"], cd: ["Dokumentoi tutkiminen ja päätöksen perustelu", "Anna selkeät jatko-ohjeet ja turvaverkko", "Varmista potilaan suostumus ja ymmärrys", "Kirjaa konsultaatio ja hoito-ohje"] },
  pel: { focus: "Pelastusjohtoinen", primary: "ab", ab: ["Oma turvallisuus ja työnjako viranomaisten kesken", "Potilaiden triage ja ensihoidon priorisointi", "Tilannekuva ja raportointi johdolle"], cd: ["Pienemmässä tilanteessa systemaattinen arvio", ...GUIDE_BASE_CD] },
  pol: { focus: "Poliisijohtoinen", primary: "ab", ab: ["Oma turvallisuus ensin; toimi vasta kun kohde on poliisin turvaama", "cABCDE ja ulkoisen vuodon hallinta", "Dokumentoi löydökset huolellisesti"], cd: ["Vakaa potilas: systemaattinen arvio ja jatko", ...GUIDE_BASE_CD] },
};
// Kenttäoppaan kuvakortit per tehtäväkoodi (näkyvät keikkalomakkeen ohjeessa).
const HUD_BASE = "./img/hud/";
const HUD_CODE = {
  "702": [["tajuttomuus-faint.jpg", "Tajuttomuus & lyhistyminen (FAINT)"]],
  "703": [["hengitys-breath.jpg", "Hengitysvaikeus (BREATH) & auskultaatio"]],
  "704": [["rintakipu-anatomia.jpg", "Rintakivun anatomia"], ["rintakipu-matriisi.jpg", "Rintakivun erotusdiagnostiikka"]],
  "706": [["avh-stroke.jpg", "Aivoverenkiertohäiriö (STROKE) & FAST"]],
  "772": [["kouristelu-captured.jpg", "Kouristelu (CAPTURED)"]],
  "773": [["anafylaksia-racer.jpg", "Anafylaksia (RACER)"]],
  "781": [["vatsakipu-anatomia.jpg", "Vatsakivun anatomia"], ["vatsakipu-matriisi.jpg", "Vatsakivun erotusdiagnostiikka"]],
  "782": [["paansarky.jpg", "Päänsäryn aikajana ja punaiset liput"]],
  "783": [["selkakipu.jpg", "Selkäkivun erotusdiagnostiikka"]],
  "791": [["raskaus-pregnant.jpg", "Raskausajan arviointi (PREGNANT)"], ["obstetriset-hatatilanteet.jpg", "Obstetriset hätätilanteet"]],
};
function hudCardsHtml(code) {
  const cards = HUD_CODE[(code || "").toUpperCase()];
  if (!cards) return "";
  return `<details class="g-sec g-hud"><summary>📋 Kenttäoppaan kortit (${cards.length})</summary>
    ${cards.map(([f, t]) => `<figure class="hud-fig"><img class="hud-img" src="${HUD_BASE}${f}" alt="${esc(t)}" loading="lazy"><figcaption>${esc(t)}</figcaption></figure>`).join("")}
  </details>`;
}
function codeGuidance(code) {
  code = (code || "").toUpperCase();
  const info = CODE_MAP.get(code);
  if (!info) return null;
  let spec = GUIDE_CODE[code];
  if (!spec) {
    if (/^74/.test(code)) spec = GUIDE_PREFIX.trauma;
    else if (/^75/.test(code)) spec = GUIDE_PREFIX.expo;
    else if (/^76/.test(code)) spec = GUIDE_PREFIX.bleed;
    else if (/^78/.test(code)) spec = GUIDE_PREFIX.symptom;
  }
  if (!spec) spec = GUIDE_GROUP[info.groupId];
  const ab = (spec?.ab?.length ? spec.ab : GUIDE_BASE_AB).slice(0, 6);
  const cd = (spec?.cd?.length ? spec.cd : GUIDE_BASE_CD).slice(0, 6);
  return { ab, cd, focus: spec?.focus || info.name, primary: spec?.primary || "ab" };
}
function guidanceHtml(code, urgency) {
  code = (code || "").toUpperCase();
  const g = codeGuidance(code);
  if (!g) return "";
  const info = codeInfo(code);
  const u = (urgency || "").toUpperCase();
  const tier = (u === "A" || u === "B") ? "ab" : (u === "C" || u === "D") ? "cd" : null;
  const list = (arr) => `<ul class="g-list">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const what = info?.what ? `<p class="g-what">${esc(info.what)}</p>` : "";
  const assess = info?.assess?.length ? `<div class="g-sec"><h4>Keskeinen arvio</h4>${list(info.assess)}</div>` : "";
  const note = `<p class="g-note">Yleistä, itse koostettua ensihoidon tietoa (lähteinä mm. StatPearls, ERC, AHA/ASA, WHO). Noudata alueellista hoito-ohjetta – ei lääkeannoksia, ei korvaa virallista ohjetta.</p>`;
  const hud = hudCardsHtml(code);

  if (tier === "ab") {
    return `<details class="guidance g-acute" open>
      <summary>🚨 ${esc(u)}-${esc(code)} · kiireellinen lähestyminen</summary>
      <div class="g-body">
        ${what}
        <div class="g-tier g-ab"><h4>Toimi heti – painopisteet</h4>${list(g.ab)}</div>
        ${info?.red?.length ? `<div class="g-sec g-redflags"><h4>⚠️ Tunnista / sulje pois heti</h4>${list(info.red)}</div>` : ""}
        ${assess}
        ${hud}
        ${note}
      </div>
    </details>`;
  }
  if (tier === "cd") {
    return `<details class="guidance g-stable" open>
      <summary>🩺 ${esc(u)}-${esc(code)} · vakaa, kiireetön lähestyminen</summary>
      <div class="g-body">
        ${what}
        <div class="g-tier g-cd"><h4>Systemaattinen ote</h4>${list(g.cd)}</div>
        ${info?.red?.length ? `<div class="g-sec g-redflags"><h4>⚠️ Sulje pois ennen kuin hoidat kiireettömänä</h4>${list(info.red)}</div>` : ""}
        ${assess}
        ${hud}
        ${note}
      </div>
    </details>`;
  }
  // Ei valittua hälytysastetta → näytä molemmat (esim. koodikirjasto / referenssi)
  return `<details class="guidance">
    <summary>🧭 Tietoa tehtävästä & lähestyminen kiireellisyyden mukaan</summary>
    <div class="g-body">
      ${what}
      <p class="g-hint">Valitse hälytysaste, niin näet juuri sille keikalle painottuvan ohjeen. Yleisesti:</p>
      <div class="g-tier g-ab"><h4>A / B · kiireellinen – toimi heti</h4>${list(g.ab)}</div>
      <div class="g-tier g-cd"><h4>C / D · vakaa – systemaattinen ote</h4>${list(g.cd)}</div>
      ${info?.red?.length ? `<div class="g-sec g-redflags"><h4>⚠️ Hälyttävät löydökset / pois suljettavat</h4>${list(info.red)}</div>` : ""}
      ${assess}
      ${hud}
      ${note}
    </div>
  </details>`;
}
function guidanceMarkdown(code, urgency) {
  code = (code || "").toUpperCase();
  const g = codeGuidance(code);
  if (!g) return "";
  const info = codeInfo(code);
  const u = (urgency || "").toUpperCase();
  const tier = (u === "A" || u === "B") ? "ab" : (u === "C" || u === "D") ? "cd" : null;
  const sec = (title, arr) => arr?.length ? `### ${title}\n${arr.map((x) => `- ${x}`).join("\n")}\n\n` : "";
  let md = "";
  if (info?.what) md += `${info.what}\n\n`;
  if (info) md += sec("Keskeinen arvio", info.assess);
  if (tier === "ab") {
    md += `## Kiireellinen (A/B) – toimi heti\n${g.ab.map((x) => `- ${x}`).join("\n")}\n\n`;
    md += sec("Sulje pois / tunnista heti", info?.red);
  } else if (tier === "cd") {
    md += `## Vakaa (C/D) – systemaattinen ote\n${g.cd.map((x) => `- ${x}`).join("\n")}\n\n`;
    md += sec("Sulje pois ennen kiireetöntä linjaa", info?.red);
  } else {
    md += `## A/B – kiireellinen\n${g.ab.map((x) => `- ${x}`).join("\n")}\n\n## C/D – vakaa\n${g.cd.map((x) => `- ${x}`).join("\n")}\n\n`;
    md += sec("Hälyttävät löydökset", info?.red);
  }
  return md.trimEnd() + "\n";
}

function codeNoteHtml(code) {
  code = (code || "").toUpperCase();
  if (!CODE_MAP.get(code)) return "";
  const note = getCodeNote(code);
  if (note) return `<div class="cn-show cn-rich">${renderNoteMarkdown(note)}<a href="#" class="cn-edit" data-editnote="${esc(code)}">✎ muokkaa</a></div>`;
  return `<a href="#" class="cn-add" data-editnote="${esc(code)}">+ Lisää hoito-ohje / muistiinpano</a>`;
}

// ---------- Kaikki keikat (haku + suodatus) ----------
let callFilter = { q: "", urgency: "", lead: "", incomplete: false };
function renderCalls() {
  let calls = (function () {
    const out = [];
    for (const s of getShifts()) for (const c of s.calls || []) out.push({ ...c, shift: s });
    return out;
  })();
  calls.sort((a, b) => (a.shift.date + (a.time || "") < b.shift.date + (b.time || "") ? 1 : -1));
  const incompleteCount = calls.filter((c) => !c.disposition).length;

  const f = callFilter;
  let filtered = calls.filter((c) => {
    if (f.incomplete && c.disposition) return false;
    if (f.urgency && c.urgency !== f.urgency) return false;
    if (f.lead && (c.lead || CODE_MAP.get(c.code)?.lead) !== f.lead) return false;
    if (f.q) {
      const hay = `${c.code} ${c.codeName} ${c.description} ${c.destination}`.toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false;
    }
    return true;
  });

  app.innerHTML = `
    <header class="page-head"><h1>Kaikki keikat</h1></header>
    <input type="search" id="q" class="search" placeholder="Hae koodia, kuvausta, kohdetta…" value="${esc(f.q)}">
    <div class="filters">
      <select id="f-urg">
        <option value="">Kaikki asteet</option>
        ${["A", "B", "C", "D"].map((k) => `<option ${f.urgency === k ? "selected" : ""}>${k}</option>`).join("")}
      </select>
      <select id="f-lead">
        <option value="">Kaikki johtovastuut</option>
        ${["Ensihoito", "Pelastus", "Poliisi"].map((k) => `<option ${f.lead === k ? "selected" : ""}>${k}</option>`).join("")}
      </select>
      <button type="button" id="f-incomplete" class="filter-chip ${f.incomplete ? "on" : ""}">Vain kesken${incompleteCount ? ` (${incompleteCount})` : ""}</button>
    </div>
    <p class="muted">${filtered.length} / ${calls.length} keikkaa</p>
    <div class="list">
      ${filtered.length === 0 ? `<p class="muted center">Ei osumia.</p>` : filtered.map((c) => { const eu = effectiveUrgency(c); const u = URGENCY[eu]; return `
        <a class="call linkrow" href="#shift/${c.shift.id}" style="${u ? `--uc:${u.color}` : ""}">
          <div class="call-left">${u ? `<span class="urg" style="background:${u.color}">${u.label}</span>` : `<span class="urg none">–</span>`}</div>
          <div class="call-body">
            <div class="call-title"><span class="code">${esc(c.code || "?")}</span><span class="cname">${esc(c.codeName || "")}</span></div>
            <div class="call-meta"><span class="muted">${formatDate(c.shift.date)} ${esc(c.time || "")}</span> · ${c.disposition ? `<span class="meta-pill">${esc(dispositionShort(c))}</span>` : `<span class="meta-pill kesken">Kesken</span>`}${c.destination ? ` <span class="meta-pill dest">${esc(c.destination)}${c.tehoModule ? " · " + esc(c.tehoModule) : ""}</span>` : ""}</div>
            ${c.description ? `<div class="call-desc">${esc(c.description)}</div>` : ""}
          </div>
        </a>`; }).join("")}
    </div>
  `;
  const q = document.getElementById("q");
  q.oninput = debounce(() => { callFilter.q = q.value; renderCalls(); restoreFocus("q"); }, 200);
  document.getElementById("f-urg").onchange = (e) => { callFilter.urgency = e.target.value; renderCalls(); };
  document.getElementById("f-lead").onchange = (e) => { callFilter.lead = e.target.value; renderCalls(); };
  document.getElementById("f-incomplete").onclick = () => { callFilter.incomplete = !callFilter.incomplete; renderCalls(); };
}

// ---------- Tilastot ----------
let statsActivityMode = "day"; // "day" | "week"
function renderStats() {
  const s = computeStats();
  if (s.callCount === 0) {
    app.innerHTML = `
      <header class="page-head"><h1>Tilastot</h1></header>
      <div class="empty">
        <div class="empty-icon">📊</div>
        <h2>Ei vielä dataa</h2>
        <p>Kirjaa vuoroja ja keikkoja, niin tilastot kertyvät tähän automaattisesti.</p>
      </div>`;
    return;
  }
  const urgSegments = ["A", "B", "C", "D"].map((k) => ({ label: k, value: s.byUrgency[k] || 0, color: URGENCY[k].color }));
  const leadSegments = Object.entries(s.byLead).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: v, color: leadColor(k) }));

  app.innerHTML = `
    <header class="page-head"><h1>Tilastot</h1></header>

    <div class="kpis kpis-4">
      ${kpi(s.shiftCount, "vuoroa")}
      ${kpi(s.callCount, "keikkaa")}
      ${kpi(s.hoursLogged + " h", "tuntia")}
      ${kpi(s.callsPerShift, "keikkaa / vuoro")}
    </div>

    ${internshipHtml(s)}

    ${insightsHtml(s)}

    ${goalsSectionHtml(s)}

    <h2 class="block-h">📈 Aktiivisuus ajan myötä</h2>
    <div class="seg toggle-seg" id="act-toggle">
      <button type="button" data-m="day" class="${statsActivityMode === "day" ? "on" : ""}">Päivittäin</button>
      <button type="button" data-m="week" class="${statsActivityMode === "week" ? "on" : ""}">Viikoittain</button>
    </div>
    <div class="card chart-card">${activityChartHtml(s)}</div>

    <h2 class="block-h">🕐 Keikat kellonajoittain</h2>
    <div class="card chart-card">
      ${hourHistHtml(s.hourHist, "var(--primary)")}
      ${s.untimedCalls ? `<p class="muted small">${s.untimedCalls} keikkaa ilman kellonaikaa ei näy tässä.</p>` : ""}
    </div>

    <h2 class="block-h">🌗 Vuorokaudenaika × kiireellisyys</h2>
    <p class="muted small">Mihin aikaan tulee minkä kiireellisyyden ja tyyppisiä hälytyksiä.</p>
    <div class="card">${daypartHtml(s.dayparts)}</div>

    <h2 class="block-h">📅 Viikonpäivät</h2>
    <div class="card chart-card">${weekdayHtml(s.weekdayHist)}</div>

    <h2 class="block-h">☀️ Päivä- vs. 🌙 yövuoro</h2>
    <div class="cmp-grid">${shiftTypeHtml(s)}</div>

    <h2 class="block-h">🚑 Kuljetus</h2>
    <div class="ring-wrap">
      <div class="ring" style="--p:${s.transportRate}"><span>${s.transportRate}%</span></div>
      <div class="ring-info">
        <h3>${s.transported} / ${s.callCount} kuljetettu</h3>
        <p class="muted">${s.callsPerShift} keikkaa / vuoro · ${s.callCount - s.transported} ei kuljetusta</p>
      </div>
    </div>

    <h2 class="block-h">🎯 Hälytysasteet</h2>
    <div class="card">${donutHtml(urgSegments, { center: s.callCount, sub: "keikkaa" })}</div>

    <h2 class="block-h">🛡️ Johtovastuu</h2>
    <div class="card">${leadSegments.length ? donutHtml(leadSegments, { center: s.callCount, sub: "keikkaa" }) : `<p class="muted">Ei dataa.</p>`}</div>

    <h2 class="block-h">🔁 Hälytys → kuljetus</h2>
    ${s.compare.total ? `
      <div class="kpis">
        ${kpi(s.compare.changeRate + " %", "kiireellisyys muuttui")}
        ${kpi(s.compare.urgDown, "laski (esim. B→C)")}
        ${kpi(s.compare.urgUp, "nousi (esim. C→B)")}
      </div>
      <p class="muted" style="margin-top:10px">${s.compare.urgSame}/${s.compare.total} kuljetuksessa kiireellisyys pysyi samana · koodi muuttui ${s.compare.codeChanged} kertaa</p>
      ${s.compare.topTransitions.length ? `<div class="list compact" style="margin-top:10px">
        ${s.compare.topTransitions.map(([k, n]) => `<div class="ranked"><span class="cname">${esc(k)}</span><span class="rcount">${n}</span></div>`).join("")}
      </div>` : ""}
    ` : `<p class="muted">Ei vielä kuljetuksia, joissa sekä hälytys- että kuljetusaste on kirjattu.</p>`}

    <h2 class="block-h">🏷️ Yleisimmät tehtäväkoodit</h2>
    <div class="list compact">
      ${s.topCodes.length ? s.topCodes.map((c) => `<div class="ranked"><span class="code">${esc(c.code)}</span> <span class="cname">${esc(c.name)}</span><span class="rcount">${c.n}</span></div>`).join("") : `<p class="muted">Ei dataa.</p>`}
    </div>

    <h2 class="block-h">📍 Kuljetuskohteet</h2>
    <div class="list compact">
      ${s.topDest.length ? s.topDest.map(([d, n]) => `<div class="ranked"><span class="cname">${esc(d)}</span><span class="rcount">${n}</span></div>`).join("") : `<p class="muted">Ei kuljetuksia.</p>`}
    </div>

    <h2 class="block-h">⭐ Merkittävät tapaukset / toimenpiteet</h2>
    <div class="list compact">
      ${s.topTags.length ? s.topTags.map(([t, n]) => `<div class="ranked"><span class="cname">${esc(t)}</span><span class="rcount">${n}</span></div>`).join("") : `<p class="muted">Ei merkintöjä vielä.</p>`}
    </div>
  `;

  const toggle = document.getElementById("act-toggle");
  if (toggle) toggle.querySelectorAll("button").forEach((b) => {
    b.onclick = () => { statsActivityMode = b.dataset.m; renderStats(); };
  });
}

// Harjoittelujakson edistyminen
function internshipHtml(s) {
  const st = getSettings();
  const targetHours = Number(st.targetHours) || 0;
  const targetShifts = Number(st.targetShifts) || 0;
  const start = st.internshipStart, end = st.internshipEnd;
  if (!targetHours && !targetShifts && !start && !end) return "";

  const pct = (done, target) => (target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0);
  const bars = [];
  if (targetHours) bars.push({ lab: "Tunnit", done: s.hoursLogged, target: targetHours, unit: " h" });
  if (targetShifts) bars.push({ lab: "Vuorot", done: s.shiftCount, target: targetShifts, unit: "" });

  let dayInfo = "";
  if (start && end) {
    const t = new Date(today() + "T00:00:00");
    const sd = new Date(start + "T00:00:00");
    const ed = new Date(end + "T00:00:00");
    const dayMs = 86400000;
    const totalDays = Math.max(1, Math.round((ed - sd) / dayMs) + 1);
    const elapsed = Math.min(totalDays, Math.max(0, Math.round((t - sd) / dayMs) + 1));
    const left = Math.max(0, Math.round((ed - t) / dayMs));
    const phase = t < sd ? "alkaa pian" : t > ed ? "päättynyt" : `${left} pv jäljellä`;
    const dpct = Math.min(100, Math.round((elapsed / totalDays) * 100));
    dayInfo = `<div class="goal">
      <div class="goal-top"><span class="goal-name">Jakson aika</span><span class="goal-num">${formatDate(start)}–${formatDate(end)} · ${phase}</span></div>
      <div class="bartrack"><div class="barfill" style="width:${dpct}%;background:#6366f1"></div></div>
    </div>`;
  }

  const barRows = bars.map((b) => {
    const p = pct(b.done, b.target);
    const reached = b.done >= b.target;
    return `<div class="goal">
      <div class="goal-top"><span class="goal-name">${b.lab}</span><span class="goal-num ${reached ? "done" : ""}">${b.done}${b.unit} / ${b.target}${b.unit} · ${p} %</span></div>
      <div class="bartrack"><div class="barfill" style="width:${p}%"></div></div>
    </div>`;
  }).join("");

  return `<h2 class="block-h">🎓 Harjoittelujakso</h2><div class="goals">${barRows}${dayInfo}</div>`;
}

// Lyhyet havainnot ("insights") datasta.
function insightsHtml(s) {
  const items = [];
  if (s.peakHour != null) items.push(`Vilkkain kellonaika: <b>klo ${s.peakHour}–${(s.peakHour + 1) % 24}</b>`);
  if (s.busiestDaypart) items.push(`Vilkkain vuorokaudenaika: <b>${s.busiestDaypart.label} (${s.busiestDaypart.short})</b>`);
  if (s.peakWeekdayIdx != null) items.push(`Vilkkain viikonpäivä: <b>${WEEKDAYS[s.peakWeekdayIdx]}</b>`);
  const ds = s.shiftTypeCalls.day, ns = s.shiftTypeCalls.night;
  if (ds || ns) items.push(ns > ds ? `Yövuoroissa enemmän keikkoja (${ns} vs ${ds})` : ds > ns ? `Päivävuoroissa enemmän keikkoja (${ds} vs ${ns})` : `Päivä- ja yövuorot yhtä vilkkaita`);
  if (s.distinctCodes) items.push(`Eri tehtäväkoodeja: <b>${s.distinctCodes}</b>`);
  if (!items.length) return "";
  return `<div class="insights">${items.map((t) => `<div class="insight">💡 ${t}</div>`).join("")}</div>`;
}

// Päivä/viikko -pylväskaavio
function activityChartHtml(s) {
  if (statsActivityMode === "week") {
    const items = s.weeklySeries.map((w) => ({ label: w.label, value: w.count, sub: w.hours + " h" }));
    return columnsHtml(items, { color: "var(--primary)", emptyText: "Ei viikkodataa." });
  }
  const items = s.dailySeries.map((d) => ({ label: shortDate(d.date), value: d.count, sub: d.hours + " h" }));
  return columnsHtml(items, { color: "var(--primary)", emptyText: "Ei päivädataa." });
}

// Pystypylväät (HTML/CSS), arvo päällä ja otsikko alla.
function columnsHtml(items, { color, max, emptyText }) {
  if (!items || !items.length) return `<p class="muted">${esc(emptyText || "Ei dataa.")}</p>`;
  const mx = max || Math.max(1, ...items.map((i) => i.value));
  return `<div class="colchart" style="--cols:${items.length}">${items.map((i) => {
    const h = Math.round((i.value / mx) * 100);
    return `<div class="col" title="${esc(i.label)}: ${i.value}${i.sub ? " · " + esc(i.sub) : ""}">
      <div class="col-val">${i.value || ""}</div>
      <div class="col-track"><div class="col-bar" style="height:${Math.max(h, i.value ? 6 : 0)}%;background:${color}"></div></div>
      <div class="col-lab">${esc(i.label)}</div>
    </div>`;
  }).join("")}</div>`;
}

// 24 tunnin histogrammi
function hourHistHtml(hist, color) {
  const total = hist.reduce((a, b) => a + b, 0);
  if (!total) return `<p class="muted">Ei kellonaikatietoja vielä.</p>`;
  const mx = Math.max(1, ...hist);
  return `<div class="hourchart">${hist.map((v, h) => {
    const ht = Math.round((v / mx) * 100);
    return `<div class="hcol" title="klo ${h}:00–${h}:59 · ${v} keikkaa">
      <div class="hcol-track"><div class="hcol-bar" style="height:${Math.max(ht, v ? 8 : 0)}%;background:${color}"></div></div>
      <div class="hcol-lab">${h % 6 === 0 ? h : ""}</div>
    </div>`;
  }).join("")}</div>`;
}

// Viikonpäivät Ma–Su
function weekdayHtml(hist) {
  const total = hist.reduce((a, b) => a + b, 0);
  if (!total) return `<p class="muted">Ei dataa.</p>`;
  const items = hist.map((v, i) => ({ label: WEEKDAYS[i], value: v }));
  return columnsHtml(items, { color: "#6366f1" });
}

// Vuorokaudenaika × kiireellisyys + top-koodit
function daypartHtml(dayparts) {
  const maxTotal = Math.max(1, ...dayparts.map((d) => d.total));
  return dayparts.map((d) => {
    const segs = ["A", "B", "C", "D"].map((k) => d.urg[k] ? `<span class="seg-fill" style="flex:${d.urg[k]};background:${URGENCY[k].color}" title="${k}: ${d.urg[k]}"></span>` : "").join("");
    const width = Math.max(Math.round((d.total / maxTotal) * 100), d.total ? 8 : 3);
    const codes = d.topCodes && d.topCodes.length
      ? d.topCodes.map((c) => `<span class="dp-code"><b>${esc(c.code)}</b> ${esc(c.name)} <span class="muted">·${c.n}</span></span>`).join("")
      : `<span class="muted small">ei keikkoja tähän aikaan</span>`;
    return `<div class="daypart">
      <div class="dp-head"><span class="dp-name">${esc(d.label)} <span class="muted">${esc(d.short)}</span></span><span class="dp-total">${d.total}</span></div>
      <div class="dp-track"><div class="dp-bar" style="width:${width}%">${segs || `<span class="seg-fill" style="flex:1;background:var(--surface-2)"></span>`}</div></div>
      <div class="dp-codes">${codes}</div>
    </div>`;
  }).join("");
}

// Donitsikaavio (conic-gradient) + legenda
function donutHtml(segments, opts = {}) {
  const active = segments.filter((s) => s.value > 0);
  const total = active.reduce((s, x) => s + x.value, 0);
  if (!total) return `<p class="muted">Ei dataa.</p>`;
  let acc = 0;
  const stops = active.map((s) => {
    const a = (acc / total) * 360; acc += s.value; const b = (acc / total) * 360;
    return `${s.color} ${a.toFixed(2)}deg ${b.toFixed(2)}deg`;
  }).join(",");
  const legend = active.map((s) => `<div class="lg-item"><span class="lg-dot" style="background:${s.color}"></span><span class="lg-lab">${esc(s.label)}</span><b>${s.value}</b><span class="muted">${Math.round((s.value / total) * 100)} %</span></div>`).join("");
  return `<div class="donut-wrap">
    <div class="donut2" style="background:conic-gradient(${stops})"><div class="donut2-hole"><b>${esc(String(opts.center ?? total))}</b><span>${esc(opts.sub ?? "yht.")}</span></div></div>
    <div class="donut-legend">${legend}</div>
  </div>`;
}

// Päivä- vs yövuoro -vertailu
function shiftTypeHtml(s) {
  const cards = [
    { key: "day", title: "Päivä 9–21", icon: "☀️" },
    { key: "night", title: "Yö 21–9", icon: "🌙" },
  ];
  if (s.shiftTypeCount.custom) cards.push({ key: "custom", title: "Muu aika", icon: "⏱️" });
  return cards.map(({ key, title, icon }) => {
    const shifts = s.shiftTypeCount[key];
    const calls = s.shiftTypeCalls[key];
    const transp = s.shiftTypeTransported[key];
    const avg = shifts ? (calls / shifts).toFixed(1) : "0";
    const tRate = calls ? Math.round((transp / calls) * 100) : 0;
    const urg = s.shiftTypeUrg[key];
    const uTotal = ["A", "B", "C", "D"].reduce((a, k) => a + urg[k], 0);
    const mini = uTotal ? `<div class="mini-stack">${["A", "B", "C", "D"].map((k) => urg[k] ? `<span style="flex:${urg[k]};background:${URGENCY[k].color}" title="${k}: ${urg[k]}"></span>` : "").join("")}</div>` : "";
    return `<div class="cmp-card">
      <div class="cmp-title">${icon} ${esc(title)}</div>
      <div class="cmp-big">${calls}<span class="muted small"> keikkaa</span></div>
      <div class="cmp-rows">
        <div><span class="muted">Vuoroja</span><b>${shifts}</b></div>
        <div><span class="muted">Keikkaa / vuoro</span><b>${avg}</b></div>
        <div><span class="muted">Kuljetus</span><b>${tRate} %</b></div>
      </div>
      ${mini}
    </div>`;
  }).join("");
}

function shortDate(iso) {
  const [, m, d] = iso.split("-");
  return `${parseInt(d, 10)}.${parseInt(m, 10)}.`;
}

function kpi(value, label) {
  return `<div class="kpi"><div class="kpi-val">${esc(String(value))}</div><div class="kpi-lab">${esc(label)}</div></div>`;
}
function goalsSectionHtml(s) {
  const goals = getSettings().goals || [];
  if (!goals.length) return "";
  const rows = goals.map((g) => {
    const ts = s.tagStats[g.tag] || { total: 0, itse: 0 };
    const done = ts.total;
    const pct = Math.min(100, Math.round((done / g.target) * 100));
    const reached = done >= g.target;
    return `<div class="goal">
      <div class="goal-top"><span class="goal-name">${esc(g.tag)}</span><span class="goal-num ${reached ? "done" : ""}">${done} / ${g.target}${ts.itse ? ` · ${ts.itse} itse` : ""}</span></div>
      <div class="bartrack"><div class="barfill" style="width:${pct}%;background:${reached ? "var(--primary)" : "var(--primary)"}"></div></div>
    </div>`;
  }).join("");
  return `<h2 class="block-h">Osaamistavoitteet</h2><div class="goals">${rows}</div>`;
}
function bar(label, value, max, color) {
  const w = Math.round((value / max) * 100);
  return `<div class="barrow"><span class="barlab">${esc(label)}</span><div class="bartrack"><div class="barfill" style="width:${w}%;background:${color}"></div></div><span class="barval">${value}</span></div>`;
}
function leadColor(k) {
  return { Ensihoito: "#1f9d57", Pelastus: "#e0563b", Poliisi: "#2b6cd4" }[k] || "#888";
}

// ---------- Koodikirjasto ----------
let codeQuery = "";
function renderCodes() {
  const q = codeQuery.toLowerCase();
  app.innerHTML = `
    <header class="page-head"><h1>Tehtäväkoodit</h1></header>
    <input type="search" id="cq" class="search" placeholder="Hae koodi tai tehtävä…" value="${esc(codeQuery)}">
    <a class="info-banner" href="${INFO_BASE}" target="_blank" rel="noopener">ⓘ Avaa koodien lisätiedot ensihoito-online.fi:ssä →</a>
    ${CODE_GROUPS.map((g) => {
      const cats = g.categories.map((cat) => {
        const codes = cat.codes.filter(([code, name]) =>
          !q || code.toLowerCase().includes(q) || name.toLowerCase().includes(q) || cat.title.toLowerCase().includes(q));
        if (!codes.length) return "";
        return `<div class="codecat"><h3>${esc(cat.title)}</h3>${codes.map(([code, name]) =>
          `<button type="button" class="coderow" data-code="${esc(code)}"><span class="code" style="--lc:${g.color}">${esc(code)}</span><span class="cname">${esc(name)}</span>${getCodeNote(code) ? `<span class="coderow-note">📝</span>` : ""}<span class="coderow-go">›</span></button>`).join("")}</div>`;
      }).join("");
      if (!cats) return "";
      return `<section class="codegroup"><div class="grouphead" style="--lc:${g.color}">${esc(g.label)}</div>${cats}</section>`;
    }).join("")}
  `;
  const cq = document.getElementById("cq");
  cq.oninput = debounce(() => { codeQuery = cq.value; renderCodes(); restoreFocus("cq"); }, 200);
  app.querySelectorAll("[data-code]").forEach((el) => {
    el.onclick = () => openCodeNote(el.dataset.code, () => renderCodes());
  });
}

// Koodikohtainen muistiinpano + virallinen lähde. Käyttäjän oma teksti, tallentuu laitteelle.
function openCodeNote(code, after) {
  const info = CODE_MAP.get(code);
  const note = getCodeNote(code);
  openModal(`${code}${info ? " · " + info.name : ""}`, `
    ${info ? `<p class="muted">${esc(info.lead)} · ${esc(info.category)}</p>` : ""}
    <a class="info-link" href="${infoUrlForCode(code)}" target="_blank" rel="noopener">ⓘ Avaa virallinen lisätieto (ensihoito-online.fi)</a>
    ${guidanceHtml(code)}
    <label style="margin-top:12px">Hoito-ohje / muistiinpano
      <textarea id="cn-text" rows="10" placeholder="Kirjoita tai liitä omat muistilistasi / hoito-ohjeesi tästä tehtävästä.">${esc(note)}</textarea>
    </label>
    <button type="button" class="btn-sm ghost" id="cn-tpl">＋ Lisää ohjerunko pohjaksi</button>
    <p class="cn-help">Muotoilu: <code># Otsikko</code> · <code>**lihavointi**</code> · <code>- lista</code> · <code>[linkki](url)</code> · <code>![kuva](url)</code></p>
    <div class="cn-prev-wrap">
      <div class="cn-prev-lab">Esikatselu</div>
      <div class="cn-rich" id="cn-prev">${note ? renderNoteMarkdown(note) : '<p class="muted">Esikatselu näkyy tässä kun kirjoitat…</p>'}</div>
    </div>
    <p class="form-note">Tallentuu vain tähän laitteeseen (ei julkiseen versionhallintaan). Voit liittää tähän oman materiaalisi.</p>
  `, {
    onSave: () => {
      setCodeNote(code, val("cn-text"));
      closeModal();
      if (after) after();
    },
  });
  const ta = document.getElementById("cn-text");
  const prev = document.getElementById("cn-prev");
  const refreshPrev = () => {
    const v = ta.value.trim();
    prev.innerHTML = v ? renderNoteMarkdown(v) : '<p class="muted">Esikatselu näkyy tässä kun kirjoitat…</p>';
  };
  if (ta && prev) ta.addEventListener("input", refreshPrev);
  const tplBtn = document.getElementById("cn-tpl");
  if (tplBtn) tplBtn.onclick = () => {
    const tpl = guidanceMarkdown(code);
    if (!tpl) return;
    ta.value = ta.value.trim() ? ta.value.replace(/\s*$/, "") + "\n\n" + tpl : tpl;
    refreshPrev();
    ta.focus();
  };
}

// Yleisesti opetetut kliiniset muistilistat (ei Ensihoito-oppaasta kopioitua sisältöä).
const HUD = "./img/hud/";
const MEMORY_AIDS = [
  { t: "SAMPLE – esitiedot", items: [
    "S – Oireet (Symptoms)",
    "A – Allergiat",
    "M – Lääkitys (Medication) – huom. verenohennus, NSAID",
    "P – Perussairaudet (Past history)",
    "L – Viimeksi syöty/juotu (Last intake)",
    "E – Tapahtumat ennen oireita (Events)",
  ]},
  { t: "SOCRATES / OPQRST – kipuanamneesi", img: HUD + "kipu-socrates.jpg", items: [
    "S – Sijainti: missä kipu on?",
    "O – Alku: äkillinen vai vähittäinen?",
    "C – Luonne: terävä, puristava, repivä?",
    "R – Säteily: mihin kipu heijastuu?",
    "A – Muut oireet: pahoinvointi, hengenahdistus?",
    "T – Aikajana: jatkuva vai aaltoileva?",
    "E – Helpottaa/pahentaa: liike, lepo, lääke?",
    "S – Voimakkuus: VAS 0–10",
  ]},
  { t: "BREATH – hengitysvaikeus", img: HUD + "hengitys-breath.jpg", items: [
    "B – Tausta (Background): COPD, sydänvika",
    "R – Alku (Resp onset): äkillinen vs. vähittäinen",
    "E – Pahentavat tekijät: rasitus, makuuasento",
    "A – Muut oireet: yskä, rintakipu, kuume",
    "T – Ajoitus: jatkuva, yöllinen",
    "H – Hoidot: inhalaattorit, happi, diureetit",
  ]},
  { t: "FAINT – pyörtyminen / synkopee", img: HUD + "tajuttomuus-faint.jpg", items: [
    "F – Piirteet (Features): kollapsin kulku",
    "A – Muut oireet (Associated symptoms)",
    "I – Vammat (Injuries from fall)",
    "N – Neurohistoria (Neuro history)",
    "T – Laukaisijat (Triggers)",
  ]},
  { t: "CAPTURED – kouristelu", img: HUD + "kouristelu-captured.jpg", items: [
    "C – Kohtauksen piirteet",
    "A – Edeltävä toiminta",
    "P – Sairaudet",
    "T – Ajoitus",
    "U – Virtsankarkailu",
    "R – Lääkkeet / huumeet",
    "E – Ensiaputoimet",
    "D – Silminnäkijöiden tiedot",
    "AINA: tarkista verensokeri kouristavalta!",
  ]},
  { t: "STROKE – aivoverenkiertohäiriö", img: HUD + "avh-stroke.jpg", items: [
    "S – Oireiden alku (Symptom onset)",
    "T – Heikkouden tyyppi: fokaalinen vs. yleinen",
    "R – Riskitekijät: eteisvärinä, verenpaine, diabetes",
    "O – Muut neuro-oireet: puhe, näköhäiriöt",
    "K – Tunnetut sairaudet",
    "E – Tutkimuslöydökset (FAST-testi)",
  ]},
  { t: "RACER – anafylaksia", img: HUD + "anafylaksia-racer.jpg", items: [
    "R – Reagoinnin nopeus: sekunteja/minuutteja = anafylaksia",
    "A – Ilmatiet: turvotus, käheys (hengenvaara!)",
    "C – Verenkierto: hypotensio, takykardia, synkopee",
    "E – Altistus: ruoka, lääke, hyönteisen pisto",
    "R – Hengitysoireet: vinkuna, hengenahdistus",
    "Vihje: anafylaksia voi esiintyä ilman iho-oireita.",
  ]},
  { t: "PAT / TICLS – lapsen arviointikolmio", img: HUD + "lapsi-pat.jpg", items: [
    "Arviointikolmio: ulkonäkö – hengitystyö – verenkierto",
    "T – Tone: veltto vai jäntevä?",
    "I – Interactiveness: reagoiko ympäristöön?",
    "C – Consolability: onko lohdutettavissa?",
    "L – Look/gaze: katsekontakti",
    "S – Speech/cry: heikko vai kimeä itku?",
    "Tee yleisvaikutelma ovelta ennen lapseen koskemista.",
  ]},
  { t: "PREGNANT – raskausajan arviointi", img: HUD + "raskaus-pregnant.jpg", items: [
    "P – Raskaushistoria (Gravida/Para, aiemmat sektiot)",
    "R – Nykyiset oireet: kipu, supistukset, vuoto",
    "E – Tapahtumat: vedenmeno, trauma, infektiot",
    "G – Raskausviikot, sikiön liikkeet",
    "N – Oireiden luonne: kivun sijainti, vuodon määrä ja väri",
    "A – Sairaudet: verenpaine, diabetes, lääkitykset",
    "N – Neuro/systeemiset: päänsärky, näköhäiriöt = pre-eklampsia?",
    "T – Ajoitus ja hoidot: milloin alkoi?",
  ]},
];

// ---------- Työkalut: muistilistat + laskurit + koodivisa ----------
function renderTools() {
  app.innerHTML = `
    <header class="page-head"><h1>Työkalut</h1></header>

    <section class="settings-block">
      <h2>Raportit</h2>
      <p class="muted">Yhteenvedot tulostettavaksi / PDF:ksi ohjaajalle.</p>
      <div class="btn-row">
        <a class="btn primary" href="#report">Jakson raportti →</a>
        <a class="btn" href="#weekreport">Viikkoraportti →</a>
        <a class="btn" href="#portfolio">CV-portfolio →</a>
      </div>
    </section>

    <section class="settings-block">
      <h2>EKG-kortit</h2>
      <p class="muted">Harjoittele rytmintunnistusta. Toistuva kertaus (Leitner) painottaa kortteja, jotka eivät vielä ole hallussa. Voit lisätä omia kortteja ja kuvia.</p>
      <a class="btn primary" href="#ekg">Avaa EKG-kortit →</a>
    </section>

    <section class="settings-block">
      <h2>Kliininen kenttäopas</h2>
      <p class="muted">Oirekohtaiset arviointimatriisit, anatomia ja punaiset liput visuaalisina kortteina. Yleistä, itse koostettua tietoa – noudata alueellista hoito-ohjetta.</p>
      <a class="btn primary" href="#fieldguide">Avaa kenttäopas →</a>
    </section>

    <section class="settings-block">
      <h2>Muistilistat</h2>
      <p class="muted">Yleiset kliiniset muistikehykset nopeaan kertaukseen. Avaa kortti nähdäksesi myös visuaalisen version.</p>
      ${MEMORY_AIDS.map((m) => `<details class="aid"><summary>${esc(m.t)}</summary><ul>${m.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>${m.img ? `<img class="aid-img" src="${esc(m.img)}" alt="${esc(m.t)}" loading="lazy">` : ""}</details>`).join("")}
    </section>

    <section class="settings-block">
      <h2>Hoito-ohjeet ja lisätieto</h2>
      <p class="muted">Viralliset, ajantasaiset hoito-ohjeet näistä lähteistä. <em>Ensihoito-opas (Duodecim)</em> on tekijänoikeudella suojattu, joten KenttäLog linkittää siihen eikä kopioi sisältöä.</p>
      <div class="btn-row">
        <a class="btn" href="https://www.oppiportti.fi/op/opk04598" target="_blank" rel="noopener">Ensihoito-opas (Oppiportti)</a>
        <a class="btn" href="https://www.ensihoito-online.fi/ensihoidon-tehtavakoodit/" target="_blank" rel="noopener">Ensihoito-online</a>
        <a class="btn" href="https://www.kaypahoito.fi/" target="_blank" rel="noopener">Käypä hoito</a>
      </div>
    </section>

    <section class="settings-block">
      <h2>GCS-laskuri</h2>
      <div class="row">
        <label>Silmät (E)
          <select id="gcs-e">${[4,3,2,1].map((n)=>`<option value="${n}">${n}</option>`).join("")}</select>
        </label>
        <label>Puhe (V)
          <select id="gcs-v">${[5,4,3,2,1].map((n)=>`<option value="${n}">${n}</option>`).join("")}</select>
        </label>
        <label>Liike (M)
          <select id="gcs-m">${[6,5,4,3,2,1].map((n)=>`<option value="${n}">${n}</option>`).join("")}</select>
        </label>
      </div>
      <div class="calc-out" id="gcs-out">GCS 15</div>
    </section>

    <section class="settings-block">
      <h2>Annoslaskuri</h2>
      <div class="row">
        <label>Paino (kg)<input type="number" id="d-w" inputmode="decimal" placeholder="80"></label>
        <label>Annos (mg/kg)<input type="number" id="d-mgkg" inputmode="decimal" placeholder="0.1"></label>
        <label>Pitoisuus (mg/ml)<input type="number" id="d-conc" inputmode="decimal" placeholder="1"></label>
      </div>
      <div class="calc-out" id="d-out">Syötä arvot</div>
    </section>

    <section class="settings-block">
      <h2>NEWS2-laskuri</h2>
      <div class="news-grid">
        <label>Hengitystaajuus<input type="number" id="n-rr" inputmode="numeric" placeholder="/min"></label>
        <label>SpO₂ %<input type="number" id="n-spo2" inputmode="numeric" placeholder="%"></label>
        <label>Lisähappi<select id="n-o2"><option value="0">Ei</option><option value="2">Kyllä</option></select></label>
        <label>Systolinen RR<input type="number" id="n-sbp" inputmode="numeric" placeholder="mmHg"></label>
        <label>Pulssi<input type="number" id="n-hr" inputmode="numeric" placeholder="/min"></label>
        <label>Lämpö °C<input type="number" id="n-temp" inputmode="decimal" placeholder="°C"></label>
        <label>Tajunta<select id="n-acvpu"><option value="0">Hereillä (A)</option><option value="3">Poikkeava (CVPU)</option></select></label>
      </div>
      <div class="calc-out" id="n-out">Syötä arvot</div>
    </section>

    <section class="settings-block">
      <h2>Koodivisa</h2>
      <p class="muted">Harjoittele tehtäväkoodeja: valitse oikea tehtävä koodille.</p>
      <div id="quiz"></div>
    </section>
  `;
  setupCalculators();
  startQuiz();
}

function setupCalculators() {
  const gcs = () => {
    const t = +val("gcs-e") + +val("gcs-v") + +val("gcs-m");
    document.getElementById("gcs-out").textContent = `GCS ${t}`;
  };
  ["gcs-e", "gcs-v", "gcs-m"].forEach((id) => document.getElementById(id).onchange = gcs);

  const dose = () => {
    const w = parseFloat(val("d-w")), mgkg = parseFloat(val("d-mgkg")), conc = parseFloat(val("d-conc"));
    const out = document.getElementById("d-out");
    if (!w || !mgkg) { out.textContent = "Syötä arvot"; return; }
    const mg = w * mgkg;
    let txt = `${round(mg)} mg`;
    if (conc > 0) txt += ` = ${round(mg / conc)} ml`;
    out.textContent = txt;
  };
  ["d-w", "d-mgkg", "d-conc"].forEach((id) => document.getElementById(id).oninput = dose);

  const news = () => {
    const rr = parseFloat(val("n-rr")), spo2 = parseFloat(val("n-spo2")), sbp = parseFloat(val("n-sbp"));
    const hr = parseFloat(val("n-hr")), temp = parseFloat(val("n-temp"));
    const o2 = +val("n-o2"), acvpu = +val("n-acvpu");
    const out = document.getElementById("n-out");
    if ([rr, spo2, sbp, hr, temp].some((x) => isNaN(x))) { out.textContent = "Syötä kaikki arvot"; return; }
    let score = o2 + acvpu;
    score += rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3;
    score += spo2 >= 96 ? 0 : spo2 >= 94 ? 1 : spo2 >= 92 ? 2 : 3;
    score += sbp <= 90 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : sbp <= 219 ? 0 : 3;
    score += hr <= 40 ? 3 : hr <= 50 ? 1 : hr <= 90 ? 0 : hr <= 110 ? 1 : hr <= 130 ? 2 : 3;
    score += temp <= 35 ? 3 : temp <= 36 ? 1 : temp <= 38 ? 0 : temp <= 39 ? 1 : 2;
    const risk = score >= 7 ? "korkea riski" : score >= 5 ? "keskisuuri riski" : "matala riski";
    out.textContent = `NEWS2 ${score} – ${risk}`;
  };
  ["n-rr", "n-spo2", "n-sbp", "n-hr", "n-temp"].forEach((id) => document.getElementById(id).oninput = news);
  ["n-o2", "n-acvpu"].forEach((id) => document.getElementById(id).onchange = news);
}

let quizScore = { ok: 0, total: 0 };
function startQuiz() {
  const correct = ALL_CODES[Math.floor(Math.random() * ALL_CODES.length)];
  const opts = [correct];
  while (opts.length < 4) {
    const r = ALL_CODES[Math.floor(Math.random() * ALL_CODES.length)];
    if (!opts.some((o) => o.code === r.code)) opts.push(r);
  }
  opts.sort(() => Math.random() - 0.5);
  const box = document.getElementById("quiz");
  if (!box) return;
  box.innerHTML = `
    <div class="quiz-q">Mikä tehtävä on koodilla <span class="code">${esc(correct.code)}</span>?</div>
    <div class="quiz-opts">
      ${opts.map((o) => `<button type="button" class="btn quiz-opt" data-code="${o.code}">${esc(o.name)}</button>`).join("")}
    </div>
    <div class="quiz-score">${quizScore.total ? `Oikein ${quizScore.ok}/${quizScore.total}` : ""}</div>
  `;
  box.querySelectorAll(".quiz-opt").forEach((b) => {
    b.onclick = () => {
      quizScore.total++;
      const right = b.dataset.code === correct.code;
      if (right) quizScore.ok++;
      box.querySelectorAll(".quiz-opt").forEach((x) => {
        x.disabled = true;
        if (x.dataset.code === correct.code) x.classList.add("right");
        else if (x === b) x.classList.add("wrong");
      });
      setTimeout(startQuiz, 850);
    };
  });
}

// ---------- Jakson raportti (tulostettava) ----------
function renderReport() {
  const shifts = getShifts();
  const s = computeStats();
  const dates = shifts.map((x) => x.date).sort();
  const range = dates.length ? `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}` : "";
  const reflections = [];
  for (const sh of shifts) {
    for (const c of sh.calls || []) if (c.reflection) reflections.push({ date: sh.date, code: c.code, text: c.reflection });
    if (sh.notes) reflections.push({ date: sh.date, code: "", text: sh.notes, shift: true });
  }
  const goals = getSettings().goals || [];
  app.innerHTML = `
    <div class="no-print page-head">
      <a class="back" href="#tools">‹ Työkalut</a>
      <button class="btn primary" id="printBtn">🖨️ Tulosta / Tallenna PDF</button>
    </div>
    <article class="print-view">
      <div class="pv-head">
        <h1>KenttäLog – jakson raportti</h1>
        <div class="pv-meta">${range ? "Ajalta " + range + " · " : ""}${s.shiftCount} vuoroa · ${s.callCount} keikkaa · ${s.hoursLogged} h</div>
      </div>

      <div class="pv-stats">
        <span><b>${s.callCount}</b> keikkaa</span>
        <span><b>${s.transportRate}%</b> kuljetettu</span>
        <span>A:${s.byUrgency.A||0} B:${s.byUrgency.B||0} C:${s.byUrgency.C||0} D:${s.byUrgency.D||0}</span>
      </div>

      ${goals.length ? `<h2>Osaamistavoitteet</h2>
      <table class="pv-table"><thead><tr><th>Toimenpide</th><th>Tehty</th><th>Itse</th><th>Tavoite</th></tr></thead><tbody>
        ${goals.map((g) => { const ts = s.tagStats[g.tag] || { total: 0, itse: 0 }; return `<tr><td>${esc(g.tag)}</td><td>${ts.total}</td><td>${ts.itse}</td><td>${g.target}</td></tr>`; }).join("")}
      </tbody></table>` : ""}

      <h2>Toimenpiteet ja tapaukset</h2>
      ${s.topTags.length ? `<table class="pv-table"><thead><tr><th>Toimenpide</th><th>Kpl</th></tr></thead><tbody>
        ${s.topTags.map(([t, n]) => `<tr><td>${esc(t)}</td><td>${n}</td></tr>`).join("")}
      </tbody></table>` : `<p class="muted">Ei merkintöjä.</p>`}

      <h2>Yleisimmät tehtäväkoodit</h2>
      ${s.topCodes.length ? `<table class="pv-table"><thead><tr><th>Koodi</th><th>Tehtävä</th><th>Kpl</th></tr></thead><tbody>
        ${s.topCodes.map((c) => `<tr><td>${esc(c.code)}</td><td>${esc(c.name)}</td><td>${c.n}</td></tr>`).join("")}
      </tbody></table>` : ""}

      ${reflections.length ? `<h2>Reflektiot ja oppimispäiväkirja</h2>
        ${reflections.map((r) => `<p class="pv-refl"><b>${formatDate(r.date)}${r.code ? " · " + esc(r.code) : (r.shift ? " · vuoro" : "")}:</b> ${esc(r.text)}</p>`).join("")}` : ""}

      <p class="pv-foot">Henkilökohtainen oppimispäiväkirja. Ei sisällä potilaan tunnistetietoja. Ei virallinen potilasasiakirja.</p>
    </article>
  `;
  document.getElementById("printBtn").onclick = () => window.print();
}

// ---------- Viikkoraportti ----------
let weekReportSel = null;
function isoWeekOf(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return "?";
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dn = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dn + 3);
  const ft = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const fdn = (ft.getUTCDay() + 6) % 7;
  ft.setUTCDate(ft.getUTCDate() - fdn + 3);
  const wk = 1 + Math.round((t - ft) / (7 * 24 * 3600 * 1000));
  return `${t.getUTCFullYear()}-W${String(wk).padStart(2, "0")}`;
}
function weekDateRange(wk) {
  const m = wk.match(/^(\d{4})-W(\d+)$/);
  if (!m) return "";
  const year = +m[1], week = +m[2];
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4dn = (jan4.getUTCDay() + 6) % 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4dn + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const fmt = (d) => `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`;
  return `${fmt(monday)}–${fmt(sunday)}${year !== new Date().getFullYear() ? sunday.getUTCFullYear() : ""}`;
}
function renderWeekReport() {
  const shifts = getShifts();
  const weeks = [...new Set(shifts.map((s) => isoWeekOf(s.date)))].sort().reverse();
  if (!weeks.length) {
    app.innerHTML = `<div class="no-print page-head"><a class="back" href="#tools">‹ Työkalut</a></div>
      <div class="empty"><div class="empty-icon">📅</div><h2>Ei vielä dataa</h2><p>Kirjaa vuoroja, niin viikkoraportti kertyy tähän.</p></div>`;
    return;
  }
  if (!weekReportSel || !weeks.includes(weekReportSel)) weekReportSel = weeks[0];
  const wk = weekReportSel;
  const wkShifts = shifts.filter((s) => isoWeekOf(s.date) === wk).sort((a, b) => (a.date < b.date ? -1 : 1));
  const calls = [];
  for (const s of wkShifts) for (const c of s.calls || []) calls.push({ ...c, shift: s });
  const hours = Math.round(wkShifts.reduce((sum, s) => sum + shiftHours(s), 0) * 10) / 10;
  const urg = { A: 0, B: 0, C: 0, D: 0 };
  const byCode = {}, byTag = {}, tagItse = {};
  let transported = 0;
  const reflections = [];
  for (const c of calls) {
    if (urg[c.urgency] != null) urg[c.urgency]++;
    if (c.code) byCode[c.code] = (byCode[c.code] || 0) + 1;
    if (c.disposition === "Kuljetettu") transported++;
    for (const t of c.tags || []) { byTag[t] = (byTag[t] || 0) + 1; if (c.role === "Suoritin itse") tagItse[t] = (tagItse[t] || 0) + 1; }
    if (c.reflection) reflections.push({ date: c.shift.date, code: c.code, text: c.reflection });
  }
  for (const s of wkShifts) if (s.notes) reflections.push({ date: s.date, code: "", text: s.notes, shift: true });
  reflections.sort((a, b) => (a.date < b.date ? -1 : 1));
  const topCodes = Object.entries(byCode).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topTags = Object.entries(byTag).sort((a, b) => b[1] - a[1]);
  const tRate = calls.length ? Math.round((transported / calls.length) * 100) : 0;

  app.innerHTML = `
    <div class="no-print page-head">
      <a class="back" href="#tools">‹ Työkalut</a>
      <button class="btn primary" id="printBtn">🖨️ Tulosta / PDF</button>
    </div>
    <div class="no-print wr-pick">
      <label class="field">Viikko
        <select id="wr-sel">${weeks.map((w) => `<option value="${w}" ${w === wk ? "selected" : ""}>${weekLabel(w)} (${weekDateRange(w)})</option>`).join("")}</select>
      </label>
    </div>
    <article class="print-view">
      <div class="pv-head">
        <h1>KenttäLog – viikkoraportti</h1>
        <div class="pv-meta">${weekLabel(wk)} · ${weekDateRange(wk)} · ${wkShifts.length} vuoroa · ${calls.length} keikkaa · ${hours} h</div>
      </div>
      <div class="pv-stats">
        <span><b>${calls.length}</b> keikkaa</span>
        <span><b>${tRate}%</b> kuljetettu</span>
        <span>A:${urg.A} B:${urg.B} C:${urg.C} D:${urg.D}</span>
      </div>

      <h2>Vuorot</h2>
      <table class="pv-table"><thead><tr><th>Pvm</th><th>Tyyppi</th><th>Asema/yksikkö</th><th>Keikkaa</th></tr></thead><tbody>
        ${wkShifts.map((s) => `<tr><td>${formatDate(s.date)}</td><td>${esc(shiftTypeText(s))}</td><td>${esc([s.station, s.unit].filter(Boolean).join(" / "))}</td><td>${(s.calls || []).length}</td></tr>`).join("")}
      </tbody></table>

      ${topTags.length ? `<h2>Toimenpiteet ja tapaukset</h2>
      <table class="pv-table"><thead><tr><th>Toimenpide</th><th>Kpl</th><th>Itse</th></tr></thead><tbody>
        ${topTags.map(([t, n]) => `<tr><td>${esc(t)}</td><td>${n}</td><td>${tagItse[t] || 0}</td></tr>`).join("")}
      </tbody></table>` : ""}

      ${topCodes.length ? `<h2>Tehtäväkoodit</h2>
      <table class="pv-table"><thead><tr><th>Koodi</th><th>Tehtävä</th><th>Kpl</th></tr></thead><tbody>
        ${topCodes.map(([code, n]) => `<tr><td>${esc(code)}</td><td>${esc(CODE_MAP.get(code)?.name || "")}</td><td>${n}</td></tr>`).join("")}
      </tbody></table>` : ""}

      ${reflections.length ? `<h2>Reflektiot ja oppimispäiväkirja</h2>
        ${reflections.map((r) => `<p class="pv-refl"><b>${formatDate(r.date)}${r.code ? " · " + esc(r.code) : (r.shift ? " · vuoro" : "")}:</b> ${esc(r.text)}</p>`).join("")}` : `<p class="muted">Ei reflektioita tältä viikolta.</p>`}

      <p class="pv-foot">Henkilökohtainen oppimispäiväkirja. Ei sisällä potilaan tunnistetietoja. Ei virallinen potilasasiakirja.</p>
    </article>
  `;
  document.getElementById("printBtn").onclick = () => window.print();
  document.getElementById("wr-sel").onchange = (e) => { weekReportSel = e.target.value; renderWeekReport(); };
}
function shiftTypeText(s) {
  if (s.type === "day") return "Päivä 9–21";
  if (s.type === "night") return "Yö 21–9";
  return `${s.startTime || ""}–${s.endTime || ""}`;
}

// ---------- Kliininen kenttäopas (visuaaliset oirekortit) ----------
// Kuvat ovat itse koostettuja, yleisluontoisia arviointikortteja (ei oppikirjasisältöä).
const FIELD_GUIDE = [
  { t: "Ensiarvio ja punaiset liput", cards: [
    ["ensiarvio.jpg", "Hengenvaarojen poissulku (ABCDE) & kliininen päättely (SOAP)"],
    ["master-red-flags.jpg", "Master red flag – yhteenveto henkeä uhkaavista löydöksistä"],
  ]},
  { t: "Kipu", cards: [
    ["kipu-socrates.jpg", "Kivun arviointi (SOCRATES) & esitiedot (AMPLE)"],
  ]},
  { t: "Rintakipu (704)", cards: [
    ["rintakipu-anatomia.jpg", "Rintakivun anatomia"],
    ["rintakipu-matriisi.jpg", "Rintakivun diagnostinen matriisi"],
  ]},
  { t: "Vatsakipu (781)", cards: [
    ["vatsakipu-anatomia.jpg", "Vatsakivun anatomia"],
    ["vatsakipu-matriisi.jpg", "Vatsakivun diagnostinen matriisi"],
  ]},
  { t: "Pää- ja selkäkipu (782/783)", cards: [
    ["paansarky.jpg", "Päänsäryn aikajana ja hälytysmerkit"],
    ["selkakipu.jpg", "Selkäkivun erotusdiagnostiikka"],
  ]},
  { t: "Hengitysvaikeus (703)", cards: [
    ["hengitys-breath.jpg", "Hengenahdistus (BREATH) & auskultaatiolöydökset"],
  ]},
  { t: "Tajuttomuus ja kouristelu (702/772)", cards: [
    ["tajuttomuus-faint.jpg", "Tajuttomuus ja lyhistyminen (FAINT)"],
    ["kouristelu-captured.jpg", "Kouristuskohtaukset (CAPTURED)"],
  ]},
  { t: "AVH ja anafylaksia (706/773)", cards: [
    ["avh-stroke.jpg", "Aivoverenkiertohäiriö (STROKE) & FAST"],
    ["anafylaksia-racer.jpg", "Anafylaksia ja allergiset reaktiot (RACER)"],
  ]},
  { t: "Lapsipotilas", cards: [
    ["lapsi-pat.jpg", "Lapsipotilaan arviointikolmio (PAT / TICLS)"],
    ["lapsi-hengitys.jpg", "Lasten hengitysvaikeus ja kuume"],
    ["lapsi-punaiset-liput.jpg", "Lapsipotilaan punaiset liput"],
  ]},
  { t: "Raskaus ja synnytys (791)", cards: [
    ["raskaus-pregnant.jpg", "Raskausajan arviointi (PREGNANT)"],
    ["obstetriset-hatatilanteet.jpg", "Obstetriset hätätilanteet"],
  ]},
];
function renderFieldGuide() {
  app.innerHTML = `
    <header class="page-head"><a class="back" href="#tools">‹ Työkalut</a><h1>Kliininen kenttäopas</h1></header>
    <p class="muted">Oirekohtaiset arviointimatriisit, anatomia ja punaiset liput. Yleistä, itse koostettua tietoa nopeaan kertaukseen – ei korvaa virallista hoito-ohjetta eikä sisällä lääkeannoksia. Napauta kuvaa suurentaaksesi.</p>
    ${FIELD_GUIDE.map((g) => `
      <details class="aid fg-group" open>
        <summary>${esc(g.t)}</summary>
        <div class="fg-cards">
          ${g.cards.map(([f, t]) => `<figure class="hud-fig"><img class="hud-img" src="${HUD_BASE}${f}" alt="${esc(t)}" loading="lazy" data-full="${HUD_BASE}${f}"><figcaption>${esc(t)}</figcaption></figure>`).join("")}
        </div>
      </details>`).join("")}
    <p class="form-note">Kuvat: itse koostettuja arviointikortteja. Lähteinä yleiset kansainväliset ensihoidon muistisäännöt ja avoimet lähteet.</p>
  `;
  app.querySelectorAll(".hud-img").forEach((img) => {
    img.onclick = () => openImageLightbox(img.dataset.full, img.alt);
  });
}
function openImageLightbox(src, alt) {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = `<img src="${esc(src)}" alt="${esc(alt || "")}"><button class="lightbox-close" aria-label="Sulje">×</button>`;
  box.onclick = () => box.remove();
  document.body.appendChild(box);
}

// ---------- CV / Portfolio (tulostettava osaamisyhteenveto) ----------
function renderPortfolio() {
  const shifts = getShifts();
  const allC = getAllCalls();
  const s = computeStats();
  const settings = getSettings();
  const dates = shifts.map((x) => x.date).filter(Boolean).sort();
  const from = dates.length ? formatDate(dates[0]) : "–";
  const to = dates.length ? formatDate(dates[dates.length - 1]) : "–";
  const totalH = shifts.reduce((sum, x) => sum + shiftHours(x), 0);
  const urg = { A: 0, B: 0, C: 0, D: 0 };
  let transported = 0;
  const tagCount = {}, codeCount = {}, stationSet = new Set();
  for (const c of allC) {
    if (urg[c.urgency] != null) urg[c.urgency]++;
    if (c.disposition === "Kuljetettu") transported++;
    for (const t of c.tags || []) tagCount[t] = (tagCount[t] || 0) + 1;
    if (c.code) codeCount[c.code] = (codeCount[c.code] || 0) + 1;
    if (c.shift?.station) stationSet.add(c.shift.station);
  }
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
  const topCodes = Object.entries(codeCount).sort((a, b) => b[1] - a[1]).slice(0, 15);
  const goals = settings.goals || [];
  const goalRows = goals.map((g) => {
    const done = tagCount[g.tag] || 0;
    return { tag: g.tag, target: g.target, done, pct: g.target ? Math.min(100, Math.round((done / g.target) * 100)) : 100 };
  });
  const ekgDeck = getEkgDeck();
  const ekgMast = ekgMastered(ekgDeck);

  app.innerHTML = `
    <div class="no-print page-head">
      <a class="back" href="#tools">‹ Työkalut</a>
      <button class="btn primary" id="printBtn">🖨️ Tulosta / PDF</button>
    </div>
    <article class="print-view">
      <div class="pv-head">
        <h1>KenttäLog – osaamisportfolio</h1>
        <div class="pv-meta">Kenttäharjoittelu ${from} – ${to}</div>
      </div>

      <h2>Yhteenveto</h2>
      <div class="pv-stats">
        <span><b>${shifts.length}</b> vuoroa</span>
        <span><b>${totalH}</b> tuntia</span>
        <span><b>${allC.length}</b> keikkaa</span>
        <span><b>${transported}</b> kuljetusta</span>
      </div>
      <div class="pv-stats">
        <span>A: ${urg.A}</span><span>B: ${urg.B}</span><span>C: ${urg.C}</span><span>D: ${urg.D}</span>
        <span>Asemia: ${stationSet.size}</span>
      </div>

      ${topTags.length ? `<h2>Toimenpiteet ja kliiniset kokemukset</h2>
      <table class="pv-table"><thead><tr><th>Toimenpide</th><th>Kertaa</th></tr></thead><tbody>
        ${topTags.map(([t, n]) => `<tr><td>${esc(t)}</td><td>${n}</td></tr>`).join("")}
      </tbody></table>` : ""}

      ${goalRows.length ? `<h2>Osaamistavoitteet</h2>
      <table class="pv-table"><thead><tr><th>Tavoite</th><th>Tehty</th><th>Tavoite</th><th>%</th></tr></thead><tbody>
        ${goalRows.map((g) => `<tr><td>${esc(g.tag)}</td><td>${g.done}</td><td>${g.target}</td><td>${g.pct}%</td></tr>`).join("")}
      </tbody></table>` : ""}

      ${topCodes.length ? `<h2>Yleisimmät tehtäväkoodit</h2>
      <table class="pv-table"><thead><tr><th>Koodi</th><th>Tehtävä</th><th>Kertaa</th></tr></thead><tbody>
        ${topCodes.map(([code, n]) => `<tr><td>${esc(code)}</td><td>${esc(CODE_MAP.get(code)?.name || "")}</td><td>${n}</td></tr>`).join("")}
      </tbody></table>` : ""}

      <h2>EKG-rytmintunnistus</h2>
      <p>Hallussa ${ekgMast}/${ekgDeck.length} rytmiä (Leitner-toisto).</p>

      ${stationSet.size ? `<h2>Harjoitteluasemat</h2><p>${[...stationSet].sort().map(esc).join(", ")}</p>` : ""}

      <p class="pv-foot">Luotu KenttäLog-sovelluksella. Henkilökohtainen osaamisyhteenveto kenttäharjoittelusta.</p>
    </article>
  `;
  document.getElementById("printBtn").onclick = () => window.print();
}

// ---------- EKG-kortit (rytmintunnistus, Leitner-toisto) ----------
// Yleistä, itse laadittua rytmintunnistustietoa (ei kopioitua sisältöä, ei kuvia).
const EKG_DECK = [
  { id: "ekg-sinus", q: "Sinusrytmi", a: "P-aalto ennen jokaista QRS:ää, säännöllinen, taajuus 60–100/min. Normaali perusrytmi." },
  { id: "ekg-brady", q: "Sinusbradykardia", a: "Sinusrytmi alle 60/min. Oireinen ja hidas → harkitse syytä ja hoitoa (esim. tahdistus) hoito-ohjeen mukaan." },
  { id: "ekg-tachy", q: "Sinustakykardia", a: "Sinusrytmi yli 100/min, P-aallot näkyvissä. Etsi taustasyy (kipu, kuume, hypovolemia, hypoksia)." },
  { id: "ekg-af", q: "Eteisvärinä (FA)", a: "Epäsäännöllisen epäsäännöllinen, ei selkeitä P-aaltoja. Nopea kammiovaste voi olla oireinen." },
  { id: "ekg-flutter", q: "Eteislepatus (flutter)", a: "Sahalaita-aallot (eteistaajuus n. 300/min), usein säännöllinen kammiovaste (esim. 2:1 → ~150/min)." },
  { id: "ekg-svt", q: "Supraventrikulaarinen takykardia (SVT)", a: "Kapea QRS, säännöllinen, nopea (usein >150/min), P-aaltoja vaikea erottaa. Epävakaa → kardioversio hoito-ohjeen mukaan." },
  { id: "ekg-vt", q: "Kammiotakykardia (VT)", a: "Leveä QRS, säännöllinen ja nopea. Suhtaudu kammioperäisenä; epävakaa → kardioversio, pulssiton → defibrillointi." },
  { id: "ekg-vf", q: "Kammiovärinä (VF)", a: "Kaoottinen, ei tunnistettavia QRS-komplekseja. Iskettävä rytmi → defibrillointi viiveettä + painelu." },
  { id: "ekg-asys", q: "Asystolia", a: "Ei sähköistä toimintaa (lähes suora viiva). EI iskettävä → painelu, adrenaliini ja syyn hoito." },
  { id: "ekg-pea", q: "PEA (sykkeetön rytmi)", a: "Monitorissa organisoitunut rytmi, mutta ei pulssia. EI iskettävä → painelu ja palautuvien syiden hoito." },
  { id: "ekg-av1", q: "I asteen AV-katkos", a: "PQ-aika pitkä (>200 ms), mutta jokainen P-aalto johtuu kammioihin. Yleensä hyvänlaatuinen." },
  { id: "ekg-av2a", q: "II asteen AV-katkos, Mobitz I (Wenckebach)", a: "PQ-aika pitenee lyönti lyönniltä, kunnes yksi QRS jää väliin. Usein hyvänlaatuinen." },
  { id: "ekg-av2b", q: "II asteen AV-katkos, Mobitz II", a: "Ajoittain P-aalto ei johdu, PQ-aika pysyy vakiona. Voi edetä täydelliseksi katkokseksi → seuraa tarkasti." },
  { id: "ekg-av3", q: "III asteen AV-katkos (täydellinen)", a: "P-aallot ja QRS-kompleksit täysin toisistaan riippumatta. Usein hidas ja oireinen → tahdistusvalmius." },
  { id: "ekg-stemi", q: "STEMI (ST-nousuinfarkti)", a: "ST-nousu vähintään kahdessa vierekkäisessä kytkennässä. Ennakkoilmoitus ja kuljetus PCI-valmiuteen." },
  { id: "ekg-ves", q: "Kammiolisälyönti (VES)", a: "Ennenaikainen leveä QRS ilman edeltävää P-aaltoa. Yksittäisinä usein vaaraton; tiheät/parittaiset huomioi." },
  { id: "ekg-pace", q: "Tahdistinrytmi", a: "Kapeat tahdistuspiikit ennen P-aaltoa ja/tai QRS:ää. Tunnista piikit ja arvioi tahdistuksen toimivuus." },
];
function getEkgProgress() { return getSettings().ekgProgress || {}; }
function getEkgDeck() {
  const custom = (getSettings().ekgCards || []).map((c) => ({ ...c, custom: true }));
  return [...EKG_DECK, ...custom];
}
function ekgMastered(deck) {
  const prog = getEkgProgress();
  return deck.filter((c) => (prog[c.id] || 0) >= 4).length;
}
let ekgState = null;
function startEkgSession(deck) {
  const prog = getEkgProgress();
  const queue = deck.map((c) => ({ id: c.id, box: prog[c.id] || 0 }))
    .sort((a, b) => (a.box - b.box) || (Math.random() - 0.5))
    .map((x) => x.id);
  return { queue, idx: 0, flipped: false };
}
function renderEkg() {
  const deck = getEkgDeck();
  if (!deck.length) {
    app.innerHTML = `<div class="no-print page-head"><a class="back" href="#tools">‹ Työkalut</a></div>
      <div class="empty"><div class="empty-icon">📈</div><h2>Ei kortteja</h2></div>`;
    return;
  }
  if (!ekgState) ekgState = startEkgSession(deck);
  const total = ekgState.queue.length;
  const done = ekgState.idx >= total;
  const mastered = ekgMastered(deck);

  if (done) {
    app.innerHTML = `
      <header class="page-head"><a class="back" href="#tools">‹ Työkalut</a><h1>EKG-kortit</h1></header>
      <div class="ekg-summary card">
        <div class="empty-icon">✅</div>
        <h2>Kierros valmis!</h2>
        <p class="muted">Hallussa ${mastered}/${deck.length} korttia.</p>
        <button class="btn primary" id="ekg-restart">Aloita uusi kierros</button>
      </div>
      <button class="btn" id="ekg-add" style="margin-top:12px">+ Lisää oma kortti</button>
    `;
    document.getElementById("ekg-restart").onclick = () => { ekgState = startEkgSession(getEkgDeck()); renderEkg(); };
    document.getElementById("ekg-add").onclick = () => openEkgCardForm();
    return;
  }

  const card = deck.find((c) => c.id === ekgState.queue[ekgState.idx]);
  const prog = getEkgProgress();
  const box = prog[card.id] || 0;
  const wave = ekgWaveSvg(card.id);
  app.innerHTML = `
    <header class="page-head"><a class="back" href="#tools">‹ Työkalut</a><h1>EKG-kortit</h1></header>
    <div class="ekg-top">
      <span class="muted">Kortti ${ekgState.idx + 1}/${total}</span>
      <span class="muted">Hallussa ${mastered}/${deck.length}</span>
    </div>
    <div class="bartrack ekg-bar"><div class="barfill" style="width:${Math.round((ekgState.idx / total) * 100)}%"></div></div>
    <button type="button" class="ekg-card ${ekgState.flipped ? "flipped" : ""}" id="ekg-flip">
      <div class="ekg-box">Taso ${box}/5</div>
      ${wave ? `<div class="ekg-wave">${wave}</div>` : (card.img ? `<img class="ekg-img" src="${esc(card.img)}" alt="">` : "")}
      ${wave
        ? (ekgState.flipped
            ? `<div class="ekg-q">${esc(card.q)}</div><div class="ekg-a">${esc(card.a || "")}</div>`
            : `<div class="ekg-q ekg-prompt">Mikä rytmi?</div><div class="ekg-hint">Napauta nähdäksesi vastauksen</div>`)
        : `<div class="ekg-q">${esc(card.q)}</div>${ekgState.flipped
            ? `<div class="ekg-a">${esc(card.a || "")}</div>`
            : `<div class="ekg-hint">Napauta nähdäksesi vastauksen</div>`}`}
    </button>
    ${ekgState.flipped ? `
      <div class="ekg-actions">
        <button class="btn ekg-no" id="ekg-no">En osannut</button>
        <button class="btn primary ekg-yes" id="ekg-yes">Osasin</button>
      </div>` : `
      <button class="btn primary ekg-show" id="ekg-show">Näytä vastaus</button>`}
    <div class="btn-row" style="margin-top:14px">
      <button class="btn" id="ekg-add">+ Oma kortti</button>
      ${card.custom ? `<button class="btn danger" id="ekg-del">Poista kortti</button>` : ""}
    </div>
  `;
  const flip = () => { ekgState.flipped = true; renderEkg(); };
  document.getElementById("ekg-flip").onclick = () => { ekgState.flipped = !ekgState.flipped; renderEkg(); };
  if (document.getElementById("ekg-show")) document.getElementById("ekg-show").onclick = flip;
  const answer = (known) => {
    const p = { ...getEkgProgress() };
    p[card.id] = known ? Math.min(5, (p[card.id] || 0) + 1) : 1;
    updateSettings({ ekgProgress: p });
    ekgState.idx++; ekgState.flipped = false;
    renderEkg();
  };
  if (document.getElementById("ekg-yes")) document.getElementById("ekg-yes").onclick = () => answer(true);
  if (document.getElementById("ekg-no")) document.getElementById("ekg-no").onclick = () => answer(false);
  document.getElementById("ekg-add").onclick = () => openEkgCardForm();
  if (document.getElementById("ekg-del")) document.getElementById("ekg-del").onclick = () => {
    if (!confirm("Poistetaanko tämä oma kortti?")) return;
    const cards = (getSettings().ekgCards || []).filter((c) => c.id !== card.id);
    updateSettings({ ekgCards: cards });
    ekgState = startEkgSession(getEkgDeck());
    renderEkg();
  };
}
function openEkgCardForm() {
  openModal("Uusi EKG-kortti", `
    <label>Etupuoli (kysymys / rytmin nimi)
      <input type="text" id="ekg-cq" placeholder="esim. Kammiotakykardia">
    </label>
    <label>Takapuoli (vastaus / tunnusmerkit)
      <textarea id="ekg-ca" rows="4" placeholder="Tunnusmerkit ja toiminta omin sanoin"></textarea>
    </label>
    <label>Kuvan osoite (valinnainen)
      <input type="text" id="ekg-cimg" placeholder="https://…/oma-rytmistrippi.png">
    </label>
    <p class="form-note">Tallentuu vain tähän laitteeseen. Voit liittää oman rytmikuvasi osoitteen.</p>
  `, {
    onSave: () => {
      const q = val("ekg-cq").trim();
      if (!q) { toast("Anna kortille etupuoli"); return; }
      const cards = [...(getSettings().ekgCards || [])];
      cards.push({ id: "user-" + Date.now().toString(36), q, a: val("ekg-ca").trim(), img: val("ekg-cimg").trim() });
      updateSettings({ ekgCards: cards });
      closeModal();
      ekgState = startEkgSession(getEkgDeck());
      renderEkg();
    },
  });
}

// ---------- Asetukset ----------
function renderSettings() {
  const st = getSettings();
  app.innerHTML = `
    <header class="page-head"><h1>Asetukset</h1></header>

    <section class="settings-block">
      <h2>Kuljetuskohteet</h2>
      <p class="muted">Pilkulla eroteltuna. Näkyvät keikkalomakkeen ehdotuksissa.</p>
      <textarea id="set-dest" rows="3">${esc(st.destinations.join(", "))}</textarea>
    </section>

    <section class="settings-block">
      <h2>Omat lisätagit</h2>
      <p class="muted">Sovelluksessa on jo ${PROCEDURES.length} sisäänrakennettua edistynyttä toimenpidettä (intubaatio, kardioversio, neulatorakosenteesi…). Lisää tähän vain omat ylimääräiset, pilkulla eroteltuna.</p>
      <textarea id="set-tags" rows="3" placeholder="esim. Oma toimenpide 1, Oma toimenpide 2">${esc(st.tags.join(", "))}</textarea>
    </section>

    <section class="settings-block">
      <h2>Harjoittelujakso</h2>
      <p class="muted">Aseta jakson kesto ja tavoitteet. Edistyminen näkyy Tilastot-välilehdellä.</p>
      <div class="row">
        <label class="field">Alkaa<input type="date" id="set-istart" value="${esc(st.internshipStart || "")}"></label>
        <label class="field">Päättyy<input type="date" id="set-iend" value="${esc(st.internshipEnd || "")}"></label>
      </div>
      <div class="row">
        <label class="field">Tavoitetunnit<input type="number" id="set-thours" inputmode="numeric" min="0" value="${st.targetHours || ""}" placeholder="esim. 300"></label>
        <label class="field">Tavoitevuorot<input type="number" id="set-tshifts" inputmode="numeric" min="0" value="${st.targetShifts || ""}" placeholder="esim. 20"></label>
      </div>
    </section>

    <section class="settings-block">
      <h2>Osaamistavoitteet</h2>
      <p class="muted">Yksi per rivi muodossa <b>Toimenpide : määrä</b>. Edistyminen näkyy Tilastot-välilehdellä. Esim. "Intubaatio : 5".</p>
      <textarea id="set-goals" rows="4" placeholder="Intubaatio : 5&#10;Kardioversio : 3&#10;Synnytys : 1">${esc((st.goals || []).map((g) => `${g.tag} : ${g.target}`).join("\n"))}</textarea>
    </section>

    <section class="settings-block">
      <h2>Vuoron oletukset</h2>
      <p class="muted">Esitäytetään automaattisesti uuteen vuoroon.</p>
      <label class="field">Oletusasema
        ${stationComboHtml("set-defstation", st.defaultStation)}
      </label>
      <label class="field">Oletusyksikkö
        ${unitComboHtml("set-defunit", st.defaultUnit, findStation(st.defaultStation)?.units)}
      </label>
      <label class="field">Oletustaso
        <select id="set-defht">
          <option value="1" ${st.defaultHt !== false ? "selected" : ""}>Hoitotaso (HT)</option>
          <option value="0" ${st.defaultHt === false ? "selected" : ""}>Perustaso (PT)</option>
        </select>
      </label>
      <button class="btn primary" id="saveSettings">Tallenna asetukset</button>
    </section>

    <section class="settings-block">
      <h2>Varmuuskopio</h2>
      <p class="muted">Yksi tiedosto sisältää kaiken: vuorot, keikat, kuvat, EKG-edistyminen, muistiinpanot ja asetukset. Tiedot tallentuvat vain tähän selaimeen, joten ota varmuuskopio säännöllisesti.</p>
      <div class="btn-row">
        <button class="btn primary" id="expJson">⬆︎ Vie / jaa varmuuskopio</button>
        <button class="btn" id="impBtn">⬇︎ Palauta varmuuskopiosta</button>
        <input type="file" id="impFile" accept="application/json" hidden>
      </div>
    </section>

    <section class="settings-block">
      <h2>Monen laitteen käyttö (iCloud)</h2>
      <p class="muted">Sovellus tallentaa tiedot vain tälle laitteelle, eikä synkronoi automaattisesti. Voit silti pitää tiedot ajan tasalla useilla laitteilla iCloud Driven kautta:</p>
      <ol class="howto">
        <li><b>Vie / jaa varmuuskopio</b> → valitse <b>Tallenna Tiedostoihin → iCloud Drive</b> (tai AirDrop toiselle laitteelle).</li>
        <li>Avaa sovellus toisella laitteella (sama osoite) ja <b>Palauta varmuuskopiosta</b> → valitse sama tiedosto iCloud Drivesta.</li>
        <li>Toista aina kun haluat siirtää uusimmat kirjaukset. Tuore vienti korvaa vanhan tiedoston samalla nimellä, jos valitset niin.</li>
      </ol>
      <p class="form-note">Vinkki: lisää sovellus aloitusnäyttöön (Jaa → Lisää Koti-valikkoon) jokaisella laitteella, niin se toimii kuin natiivisovellus ja offline.</p>
    </section>

    <section class="settings-block">
      <h2>Omat koodimuistiinpanot</h2>
      <p class="muted">Vie ja tuo omat koodikohtaiset muistiinpanosi erillisenä tiedostona (esim. toiselle laitteelle). Tuonti yhdistyy nykyisiin – ne näkyvät heti koodeilla ja keikkalomakkeessa.</p>
      <div class="btn-row">
        <button class="btn" id="expNotes">⬇︎ Vie muistiinpanot</button>
        <button class="btn" id="impNotesBtn">⬆︎ Tuo muistiinpanot</button>
        <input type="file" id="impNotesFile" accept="application/json" hidden>
      </div>
    </section>

    <section class="settings-block danger-block">
      <h2>Vaara-alue</h2>
      <button class="btn danger" id="wipe">Tyhjennä kaikki tiedot</button>
    </section>

    <p class="footnote">🔒 Tietosuoja: KenttäLog on henkilökohtainen oppimispäiväkirja. Älä koskaan kirjaa potilaan tunnistetietoja. Tiedot eivät poistu laitteeltasi.</p>
  `;
  // Asema↔yksikkö-valitsin + teemavärin esikatselu aseman vaihtuessa
  wireStationUnit("set-defstation", "set-defunit", {
    onStationChange: (station) => {
      document.documentElement.style.setProperty("--primary", station?.color || DEFAULT_ACCENT);
    },
    onUnitChange: (unit) => {
      const lvl = unitLevel(unit);
      if (lvl !== null) document.getElementById("set-defht").value = lvl ? "1" : "0";
    },
  });
  document.getElementById("saveSettings").onclick = () => {
    updateSettings({
      destinations: splitList(val("set-dest")),
      tags: splitList(val("set-tags")),
      goals: parseGoals(val("set-goals")),
      internshipStart: val("set-istart"),
      internshipEnd: val("set-iend"),
      targetHours: Number(val("set-thours")) || 0,
      targetShifts: Number(val("set-tshifts")) || 0,
      defaultStation: readCombo("set-defstation"),
      defaultUnit: readCombo("set-defunit"),
      defaultHt: val("set-defht") === "1",
    });
    applyAccent();
    toast("Asetukset tallennettu");
  };
  document.getElementById("expJson").onclick = () => shareOrDownload(backupFilename(), exportJSON(), "application/json");
  document.getElementById("impBtn").onclick = () => document.getElementById("impFile").click();
  document.getElementById("impFile").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJSON(reader.result);
        applyAccent();
        toast("Varmuuskopio tuotu");
        location.hash = "#/";
        route();
      } catch (err) {
        alert("Tuonti epäonnistui: " + err.message);
      }
    };
    reader.readAsText(file);
  };
  document.getElementById("expNotes").onclick = () => shareOrDownload("kenttalog-muistiinpanot.json", exportCodeNotes(), "application/json");
  document.getElementById("impNotesBtn").onclick = () => document.getElementById("impNotesFile").click();
  document.getElementById("impNotesFile").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const n = importCodeNotes(reader.result);
        toast(`${n} muistiinpanoa tuotu`);
      } catch (err) {
        alert("Tuonti epäonnistui: " + err.message);
      }
    };
    reader.readAsText(file);
  };
  document.getElementById("wipe").onclick = () => {
    if (confirm("Poistetaanko KAIKKI vuorot ja keikat pysyvästi? Tätä ei voi perua.")) {
      clearAll();
      location.hash = "#/";
      route();
    }
  };
}

// ---------- Modaali ----------
function openModal(title, bodyHtml, { onSave, extra } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "modal-wrap";
  wrap.innerHTML = `
    <div class="modal">
      <div class="modal-head">
        <h2>${esc(title)}</h2>
        <button class="iconbtn" id="m-close">✕</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-foot">
        ${extra ? `<button class="btn ${extra.danger ? "danger" : ""}" id="m-extra">${esc(extra.label)}</button>` : "<span></span>"}
        <button class="btn primary" id="m-save">Tallenna</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  document.body.classList.add("modal-open");
  wrap.querySelector("#m-close").onclick = closeModal;
  wrap.onclick = (e) => { if (e.target === wrap) closeModal(); };
  wrap.querySelector("#m-save").onclick = onSave;
  if (extra) wrap.querySelector("#m-extra").onclick = extra.action;
}
function closeModal() {
  const wraps = document.querySelectorAll(".modal-wrap");
  if (wraps.length) wraps[wraps.length - 1].remove();
  if (!document.querySelectorAll(".modal-wrap").length) document.body.classList.remove("modal-open");
}

// ---------- Apufunktiot ----------
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function val(id) { return document.getElementById(id)?.value ?? ""; }
function localISO(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function today() { return localISO(new Date()); }
function nowTime() { return new Date().toTimeString().slice(0, 5); }
function splitList(s) { return s.split(",").map((x) => x.trim()).filter(Boolean); }
function round(n) { return Math.round(n * 100) / 100; }
function parseGoals(text) {
  return (text || "").split("\n").map((line) => {
    const m = line.split(":");
    if (m.length < 2) return null;
    const tag = m[0].trim();
    const target = parseInt(m[1].trim(), 10);
    return tag && target > 0 ? { tag, target } : null;
  }).filter(Boolean);
}
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const days = ["su", "ma", "ti", "ke", "to", "pe", "la"];
  return `${days[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}
function formatDateLong(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const days = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];
  return `${days[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}
function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
function restoreFocus(id) {
  const el = document.getElementById(id);
  if (el) { el.focus(); const v = el.value; el.value = ""; el.value = v; }
}
function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
// Aikaleimattu tiedostonimi, jotta varmuuskopiot eivät vahingossa korvaudu.
function backupFilename() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `kenttalog-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;
}
// Yritä natiivia jakoa (iOS: Tallenna Tiedostoihin / iCloud Drive, AirDrop);
// jos selain ei tue tiedostojen jakoa, lataa tiedosto tavalliseen tapaan.
async function shareOrDownload(name, content, type) {
  try {
    const file = new File([content], name, { type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "KenttäLog-varmuuskopio" });
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return; // käyttäjä perui jaon
    // muuten pudotaan latauksen kautta
  }
  download(name, content, type);
}
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2000);
}

// ---------- Asemateema ----------
function setAccentColor(color) {
  document.documentElement.style.setProperty("--primary", color);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
}
function applyAccent() {
  const station = findStation(getSettings().defaultStation);
  setAccentColor(station?.color || DEFAULT_ACCENT);
  updateStationChip(station);
}
function applyShiftAccent(shift) {
  const station = findStation(shift.station);
  if (station) {
    setAccentColor(station.color);
    updateStationChip(station);
  }
}
function updateStationChip(station) {
  const chip = document.getElementById("stationChip");
  if (!chip) return;
  if (station) {
    chip.innerHTML = `<span class="sc-dot" style="background:${station.color}"></span>${esc(station.name)} <span class="sc-code">${esc(station.code)}</span>`;
    chip.classList.add("set");
  } else {
    chip.innerHTML = `<span class="sc-dot"></span>Valitse asema`;
    chip.classList.remove("set");
  }
}

// ---------- Käynnistys ----------
applyAccent();
window.addEventListener("hashchange", route);
route();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
