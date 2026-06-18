import {
  getShifts, getShift, addShift, updateShift, deleteShift,
  addCall, updateCall, deleteCall,
  getSettings, updateSettings,
  getCodeNote, setCodeNote,
  exportJSON, importJSON, clearAll,
  exportCodeNotes, importCodeNotes,
} from "./storage.js";
import { CODE_GROUPS, CODE_MAP, ALL_CODES, URGENCY, PROCEDURES, X_SUBCODES } from "./codes.js";
import { computeStats, shiftHours } from "./stats.js";
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
    case "settings": return renderSettings();
    default: return renderHome();
  }
}

function parseHash(hash) {
  const parts = hash.split("/").filter(Boolean);
  return [parts[0] || "home", parts[1] || null];
}

function setActiveTab(path) {
  const tab = ["shift", "summary"].includes(path) ? "home" : (path === "report" ? "tools" : path);
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
    ${shifts.length === 0 ? emptyState() : ""}
    <div id="home-body"></div>
  `;
  document.getElementById("newShift").onclick = () => openShiftForm();
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
    el.onclick = () => openCallForm(s.id, (s.calls || []).find((c) => c.id === el.dataset.call));
  });
}

function callRow(shiftId, c) {
  const u = URGENCY[c.urgency];
  const info = CODE_MAP.get(c.code);
  return `
    <div class="call" data-call="${c.id}">
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
          ${c.destination ? `<span class="meta-pill dest">${esc(c.destination)}</span>` : ""}
          ${c.disposition === "Kuljetettu" && c.transportCode ? `<span class="meta-pill">Kulj. ${esc(c.transportCode)}${c.transportUrgency ? " " + esc(c.transportUrgency) : ""}</span>` : ""}
          ${(c.tags || []).map((t) => `<span class="meta-pill tag">${esc(t)}</span>`).join("")}
          ${c.role ? `<span class="meta-pill role">${esc(c.role)}</span>` : ""}
        </div>
      </div>
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
            let disp = c.disposition ? [dispositionShort(c), c.destination].filter(Boolean).join(": ") : "Kesken";
            if (c.disposition === "Kuljetettu" && c.transportCode) {
              disp += ` (${c.transportCode}${c.transportUrgency ? " " + c.transportUrgency : ""})`;
            }
            const tagsLine = (c.tags || []).length ? `<div class="pv-rowtags">${(c.tags || []).map(esc).join(", ")}${c.role ? ` — ${esc(c.role)}` : ""}</div>` : (c.role ? `<div class="pv-rowtags">${esc(c.role)}</div>` : "");
            const refl = c.reflection ? `<div class="pv-rowrefl">💡 ${esc(c.reflection)}</div>` : "";
            return `<tr>
              <td>${esc(c.time || "")}</td>
              <td>${esc(c.urgency || "")}</td>
              <td>${esc(c.code || "")}</td>
              <td>${esc(c.codeName || "")}</td>
              <td>${esc(c.description || "")}${tagsLine}${refl}</td>
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
      <div class="hint" id="c-codehint">${codeHint(c.code)}</div>
      <a class="info-link" id="c-info" href="${infoUrlForCode(c.code)}" target="_blank" rel="noopener">ⓘ Lisätiedot ensihoito-online.fi</a>
      <div class="code-note" id="c-note">${codeNoteHtml(c.code)}</div>
    </label>
    <p class="form-note">Voit tallentaa pelkän hälytyskoodin nyt ja täydentää loput myöhemmin.</p>
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
        transportCode,
        transportCodeName: CODE_MAP.get(transportCode)?.name || "",
        transportUrgency,
        tags: [...new Set([...chipTags, ...extraTags])],
        role: document.querySelector("#c-role .on")?.dataset.r || "",
        reflection: val("c-reflect"),
        vitals: hasVitals ? vitals : null,
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

  document.querySelectorAll("#c-urg button").forEach((b) => {
    b.onclick = () => {
      selectUrg(document.getElementById("c-urg"), b.dataset.u);
      if (!turgEdited) selectUrg(document.getElementById("c-turg"), b.dataset.u);
    };
  });
  document.querySelectorAll("#c-turg button").forEach((b) => {
    b.onclick = () => { turgEdited = true; selectUrg(document.getElementById("c-turg"), b.dataset.u); };
  });
  const search = document.getElementById("c-codesearch");
  search.oninput = () => {
    const code = search.value.trim().toUpperCase();
    document.getElementById("c-codehint").innerHTML = codeHint(code);
    document.getElementById("c-info").href = infoUrlForCode(code);
    document.getElementById("c-note").innerHTML = codeNoteHtml(code);
    if (!tcodeEdited) tcodeEl.value = code;
  };
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
  document.querySelectorAll("#c-tags .chip").forEach((b) => {
    b.onclick = () => b.classList.toggle("on");
  });
  document.querySelectorAll("#c-role button").forEach((b) => {
    b.onclick = () => document.querySelectorAll("#c-role button").forEach((x) => x.classList.toggle("on", x === b));
  });
}

function codeHint(code) {
  const info = CODE_MAP.get((code || "").toUpperCase());
  if (!info) return "";
  return `<span class="lead-tag" style="--lc:${info.color}">${info.lead}</span> ${esc(info.name)} · <span class="muted">${esc(info.category)}</span>`;
}
function codeNoteHtml(code) {
  code = (code || "").toUpperCase();
  if (!CODE_MAP.get(code)) return "";
  const note = getCodeNote(code);
  if (note) return `<div class="cn-show">📝 ${esc(note).replace(/\n/g, "<br>")} <a href="#" data-editnote="${esc(code)}">muokkaa</a></div>`;
  return `<a href="#" class="cn-add" data-editnote="${esc(code)}">+ Lisää oma muistiinpano tälle koodille</a>`;
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
      ${filtered.length === 0 ? `<p class="muted center">Ei osumia.</p>` : filtered.map((c) => `
        <a class="call linkrow" href="#shift/${c.shift.id}">
          <div class="call-left">${c.urgency ? `<span class="urg" style="background:${URGENCY[c.urgency].color}">${c.urgency}</span>` : `<span class="urg none">–</span>`}</div>
          <div class="call-body">
            <div class="call-title"><span class="code">${esc(c.code || "?")}</span><span class="cname">${esc(c.codeName || "")}</span></div>
            <div class="call-meta"><span class="muted">${formatDate(c.shift.date)} ${esc(c.time || "")}</span> · ${c.disposition ? `<span class="meta-pill">${esc(dispositionShort(c))}</span>` : `<span class="meta-pill kesken">Kesken</span>`}${c.destination ? ` <span class="meta-pill dest">${esc(c.destination)}</span>` : ""}</div>
            ${c.description ? `<div class="call-desc">${esc(c.description)}</div>` : ""}
          </div>
        </a>`).join("")}
    </div>
  `;
  const q = document.getElementById("q");
  q.oninput = debounce(() => { callFilter.q = q.value; renderCalls(); restoreFocus("q"); }, 200);
  document.getElementById("f-urg").onchange = (e) => { callFilter.urgency = e.target.value; renderCalls(); };
  document.getElementById("f-lead").onchange = (e) => { callFilter.lead = e.target.value; renderCalls(); };
  document.getElementById("f-incomplete").onclick = () => { callFilter.incomplete = !callFilter.incomplete; renderCalls(); };
}

// ---------- Tilastot ----------
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
  const maxLead = Math.max(1, ...Object.values(s.byLead));
  const maxUrg = Math.max(1, ...["A", "B", "C", "D"].map((x) => s.byUrgency[x] || 0));
  app.innerHTML = `
    <header class="page-head"><h1>Tilastot</h1></header>

    <div class="kpis">
      ${kpi(s.shiftCount, "vuoroa")}
      ${kpi(s.callCount, "keikkaa")}
      ${kpi(s.hoursLogged + " h", "kirjattu")}
    </div>

    ${goalsSectionHtml(s)}

    <h2 class="block-h">Kuljetus</h2>
    <div class="ring-wrap">
      <div class="ring" style="--p:${s.transportRate}"><span>${s.transportRate}%</span></div>
      <div class="ring-info">
        <h3>${s.transported} / ${s.callCount} kuljetettu</h3>
        <p class="muted">${s.callsPerShift} keikkaa / vuoro · ${s.callCount - s.transported} ei kuljetusta</p>
      </div>
    </div>

    <h2 class="block-h">Hälytysasteet</h2>
    <div class="bars">
      ${["A", "B", "C", "D"].map((k) => bar(k, s.byUrgency[k] || 0, maxUrg, URGENCY[k].color)).join("")}
    </div>

    <h2 class="block-h">Johtovastuu</h2>
    <div class="bars">
      ${Object.entries(s.byLead).sort((a, b) => b[1] - a[1]).map(([k, v]) => bar(k, v, maxLead, leadColor(k))).join("") || `<p class="muted">Ei dataa.</p>`}
    </div>

    <h2 class="block-h">Hälytys → kuljetus</h2>
    ${s.compare.total ? `
      <div class="kpis">
        ${kpi(s.compare.changeRate + " %", "kiireellisyys muuttui")}
        ${kpi(s.compare.urgDown, "laski (B→C)")}
        ${kpi(s.compare.urgUp, "nousi (C→B)")}
      </div>
      <p class="muted" style="margin-top:10px">${s.compare.urgSame}/${s.compare.total} kuljetuksessa kiireellisyys pysyi samana · koodi muuttui ${s.compare.codeChanged} kertaa</p>
      ${s.compare.topTransitions.length ? `<div class="list compact" style="margin-top:10px">
        ${s.compare.topTransitions.map(([k, n]) => `<div class="ranked"><span class="cname">${esc(k)}</span><span class="rcount">${n}</span></div>`).join("")}
      </div>` : ""}
    ` : `<p class="muted">Ei vielä kuljetuksia, joissa sekä hälytys- että kuljetusaste on kirjattu.</p>`}

    <h2 class="block-h">Yleisimmät tehtäväkoodit</h2>
    <div class="list compact">
      ${s.topCodes.length ? s.topCodes.map((c) => `<div class="ranked"><span class="code">${esc(c.code)}</span> <span class="cname">${esc(c.name)}</span><span class="rcount">${c.n}</span></div>`).join("") : `<p class="muted">Ei dataa.</p>`}
    </div>

    <h2 class="block-h">Kuljetuskohteet</h2>
    <div class="list compact">
      ${s.topDest.length ? s.topDest.map(([d, n]) => `<div class="ranked"><span class="cname">${esc(d)}</span><span class="rcount">${n}</span></div>`).join("") : `<p class="muted">Ei kuljetuksia.</p>`}
    </div>

    <h2 class="block-h">Merkittävät tapaukset / toimenpiteet</h2>
    <div class="list compact">
      ${s.topTags.length ? s.topTags.map(([t, n]) => `<div class="ranked"><span class="cname">${esc(t)}</span><span class="rcount">${n}</span></div>`).join("") : `<p class="muted">Ei merkintöjä vielä.</p>`}
    </div>
  `;
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
    <label style="margin-top:12px">Omat muistiinpanot (omin sanoin)
      <textarea id="cn-text" rows="8" placeholder="Kirjoita omat muistilistasi tästä tehtävästä – omin sanoin.">${esc(note)}</textarea>
    </label>
    <p class="form-note">Tallentuu vain tähän laitteeseen. Kirjoita omin sanoin – älä kopioi oppikirjan tekstiä sellaisenaan.</p>
  `, {
    onSave: () => {
      setCodeNote(code, val("cn-text"));
      closeModal();
      if (after) after();
    },
  });
}

// Yleisesti opetetut kliiniset muistilistat (ei Ensihoito-oppaasta kopioitua sisältöä).
const MEMORY_AIDS = [
  { t: "cABCDE – ensiarvio", items: [
    "c – Massiivin ulkoisen verenvuodon tyrehdytys (kiristysside / painepakkaus)",
    "A – Ilmatie ja rangan tuenta",
    "B – Hengitys: taajuus, SpO₂, hengitysäänet",
    "C – Verenkierto: pulssi, RR, ihon lämpö, vuodot",
    "D – Tajunta: GCS, pupillat, verensokeri, raajojen liike",
    "E – Paljastus: vammat, iho, lämpötila (estä jäähtyminen)",
  ]},
  { t: "ISBAR – raportointi ja luovutus", items: [
    "I – Tunnista: oma nimi/yksikkö ja potilas",
    "S – Tilanne: nykyinen ongelma ja kiireellisyys",
    "B – Tausta: perussairaudet, lääkitys, tapahtumat",
    "A – Arvio: peruselintoiminnot, työdiagnoosi",
    "R – Toimintaehdotus: mitä pyydät / suosittelet",
  ]},
  { t: "SAMPLE – esitiedot", items: [
    "S – Oireet (Symptoms)",
    "A – Allergiat",
    "M – Lääkitys (Medication)",
    "P – Perussairaudet (Past history)",
    "L – Viimeksi syöty/juotu (Last intake)",
    "E – Tapahtumat ennen oireita (Events)",
  ]},
  { t: "OPQRST – kipuanamneesi", items: [
    "O – Alku (Onset)",
    "P – Provosoivat/lievittävät tekijät",
    "Q – Laatu (Quality)",
    "R – Säteily (Radiation)",
    "S – Voimakkuus (Severity, VAS 0–10)",
    "T – Kesto/ajallisuus (Time)",
  ]},
];

// ---------- Työkalut: muistilistat + laskurit + koodivisa ----------
function renderTools() {
  app.innerHTML = `
    <header class="page-head"><h1>Työkalut</h1></header>

    <section class="settings-block">
      <h2>Jakson raportti</h2>
      <p class="muted">Koko harjoittelun yhteenveto tulostettavaksi / PDF:ksi ohjaajalle.</p>
      <a class="btn primary" href="#report">Avaa jakson raportti →</a>
    </section>

    <section class="settings-block">
      <h2>Muistilistat</h2>
      <p class="muted">Yleiset kliiniset muistikehykset nopeaan kertaukseen.</p>
      ${MEMORY_AIDS.map((m) => `<details class="aid"><summary>${esc(m.t)}</summary><ul>${m.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></details>`).join("")}
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
      <p class="muted">Yksi tiedosto sisältää kaiken: vuorot, keikat sekä oletusasema, -yksikkö ja muut asetukset. Tiedot tallentuvat vain tähän selaimeen, joten ota varmuuskopio säännöllisesti.</p>
      <div class="btn-row">
        <button class="btn primary" id="expJson">⬇︎ Vie varmuuskopio</button>
        <button class="btn" id="impBtn">⬆︎ Palauta varmuuskopiosta</button>
        <input type="file" id="impFile" accept="application/json" hidden>
      </div>
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
      defaultStation: readCombo("set-defstation"),
      defaultUnit: readCombo("set-defunit"),
      defaultHt: val("set-defht") === "1",
    });
    applyAccent();
    toast("Asetukset tallennettu");
  };
  document.getElementById("expJson").onclick = () => download("kenttalog-varmuuskopio.json", exportJSON(), "application/json");
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
  document.getElementById("expNotes").onclick = () => download("kenttalog-muistiinpanot.json", exportCodeNotes(), "application/json");
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
