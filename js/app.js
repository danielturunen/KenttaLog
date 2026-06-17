import {
  getShifts, getShift, addShift, updateShift, deleteShift,
  addCall, updateCall, deleteCall,
  getSettings, updateSettings,
  exportJSON, importJSON, exportCSV, clearAll,
} from "./storage.js";
import { CODE_GROUPS, CODE_MAP, ALL_CODES, URGENCY } from "./codes.js";
import { computeStats, shiftHours } from "./stats.js";
import { STATIONS, stationLabel, ALL_UNITS, findStation } from "./stations.js";

// Datalist-optiot asemille ja yksiköille (yhteiskäyttö lomakkeissa).
function stationOptions() {
  return STATIONS.map((s) => `<option value="${esc(stationLabel(s))}">${esc(s.full)}</option>`).join("");
}
function unitOptions(units) {
  return (units || ALL_UNITS).map((u) => `<option value="${esc(u)}">`).join("");
}

const app = document.getElementById("app");
const X_OUTCOMES = CODE_GROUPS.find((g) => g.id === "x").categories[0].codes
  .map(([code, name]) => `${code} – ${name}`);
const DISPOSITIONS = [
  "Kuljetettu",
  "Ohjattu omalla kyydillä",
  ...X_OUTCOMES,
  "Muu",
];

// ---------- Reititys ----------
function route() {
  const hash = location.hash.slice(1) || "/";
  const [path, param] = hash.split("/").filter(Boolean).length
    ? parseHash(hash)
    : ["home", null];
  setActiveTab(path);
  window.scrollTo(0, 0);
  switch (path) {
    case "home": return renderHome();
    case "shift": return renderShiftDetail(param);
    case "summary": return renderShiftSummary(param);
    case "calls": return renderCalls();
    case "stats": return renderStats();
    case "codes": return renderCodes();
    case "settings": return renderSettings();
    default: return renderHome();
  }
}

function parseHash(hash) {
  const parts = hash.split("/").filter(Boolean);
  return [parts[0] || "home", parts[1] || null];
}

function setActiveTab(path) {
  const tab = ["shift", "summary"].includes(path) ? "home" : path;
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
  else body.innerHTML = `<div class="list">${shifts.map(shiftCard).join("")}</div>`;

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
  const sub = [s.unit, s.station].filter(Boolean).map(esc).join(" · ");
  return `
    <a class="card" href="#shift/${s.id}">
      <div class="card-top">
        <div class="date">${formatDate(s.date)}</div>
        <span class="pills">${level}${tag}</span>
      </div>
      ${sub ? `<div class="muted">${sub}</div>` : ""}
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
    <label>Yksikkö
      <input type="text" id="f-unit" list="unitlist" value="${esc(s.unit || "")}" placeholder="esim. HE1251">
      <datalist id="unitlist">${unitOptions(findStation(s.station)?.units)}</datalist>
    </label>
    <label>Asema / tukikohta
      <input type="text" id="f-station" list="stationlist" value="${esc(s.station || "")}" placeholder="esim. Malmi (AS.50)">
      <datalist id="stationlist">${stationOptions()}</datalist>
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
        unit: val("f-unit"),
        station: val("f-station"),
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
  document.querySelectorAll("#f-ht button").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll("#f-ht button").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
    };
  });
  // asema → suodata yksikköehdotukset ja esitäytä yksikkö
  const stationEl = document.getElementById("f-station");
  const unitEl = document.getElementById("f-unit");
  const unitList = document.getElementById("unitlist");
  stationEl.addEventListener("input", () => {
    const st = findStation(stationEl.value);
    unitList.innerHTML = unitOptions(st?.units);
    if (st && st.units.length && !unitEl.value) unitEl.value = st.units[0];
  });
}

// ---------- Vuoron tarkka näkymä + keikat ----------
function renderShiftDetail(id) {
  const s = getShift(id);
  if (!s) { location.hash = "#/"; return; }
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
  `;
  document.getElementById("editShift").onclick = () => openShiftForm(s);
  document.getElementById("summaryBtn").onclick = () => { location.hash = `#summary/${s.id}`; };
  document.getElementById("newCall").onclick = () => openCallForm(s.id);
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
          ${c.disposition ? `<span class="meta-pill">${esc(c.disposition)}</span>` : ""}
          ${c.destination ? `<span class="meta-pill dest">${esc(c.destination)}</span>` : ""}
          ${c.disposition === "Kuljetettu" && c.transportCode ? `<span class="meta-pill">Kulj. ${esc(c.transportCode)}${c.transportUrgency ? " " + esc(c.transportUrgency) : ""}</span>` : ""}
          ${(c.tags || []).map((t) => `<span class="meta-pill tag">${esc(t)}</span>`).join("")}
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
            let disp = [c.disposition, c.destination].filter(Boolean).join(": ");
            if (c.disposition === "Kuljetettu" && c.transportCode) {
              disp += ` (${c.transportCode}${c.transportUrgency ? " " + c.transportUrgency : ""})`;
            }
            const tags = (c.tags || []).length ? `<div class="pv-rowtags">${(c.tags || []).map(esc).join(", ")}</div>` : "";
            return `<tr>
              <td>${esc(c.time || "")}</td>
              <td>${esc(c.urgency || "")}</td>
              <td>${esc(c.code || "")}</td>
              <td>${esc(c.codeName || "")}</td>
              <td>${esc(c.description || "")}${tags}</td>
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
  const c = existing || { time: nowTime(), urgency: "C", disposition: "Kuljetettu" };
  openModal(existing ? "Muokkaa keikkaa" : "Uusi keikka", `
    <div class="row">
      <label>Kellonaika<input type="time" id="c-time" value="${esc(c.time || "")}"></label>
      <label>Hälytysaste
        <div class="seg urg-seg" id="c-urg">
          ${["A", "B", "C", "D"].map((k) => `<button type="button" data-u="${k}" class="${c.urgency === k ? "on" : ""}" style="--uc:${URGENCY[k].color}">${k}</button>`).join("")}
        </div>
      </label>
    </div>
    <label>Tehtäväkoodi
      <input type="text" id="c-codesearch" list="codelist" value="${esc(c.code || "")}" placeholder="Hae numerolla tai sanalla, esim. 704 tai rintakipu" autocomplete="off">
      <datalist id="codelist">
        ${ALL_CODES.map((x) => `<option value="${x.code}">${x.code} – ${esc(x.name)} (${x.lead})</option>`).join("")}
      </datalist>
      <div class="hint" id="c-codehint">${codeHint(c.code)}</div>
    </label>
    <label>Kuvaus
      <textarea id="c-desc" rows="3" placeholder="Lyhyt kuvaus keikasta (ei tunnistetietoja)">${esc(c.description || "")}</textarea>
    </label>
    <label>Lopputulos / kuljetus
      <select id="c-disp">
        ${DISPOSITIONS.map((d) => `<option ${c.disposition === d ? "selected" : ""}>${esc(d)}</option>`).join("")}
      </select>
    </label>
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
        ${settings.tags.map((t) => `<button type="button" class="chip ${(c.tags || []).includes(t) ? "on" : ""}" data-tag="${esc(t)}">${esc(t)}</button>`).join("")}
      </div>
      <input type="text" id="c-tagextra" placeholder="Muu, lisää pilkulla eroteltuna" value="${esc((c.tags || []).filter((t) => !settings.tags.includes(t)).join(", "))}">
    </label>
    <label>Peruselintoiminnot (vapaaehtoinen)
      <div class="vitals">
        <span><small>RR</small><input type="text" id="v-rr" inputmode="numeric" value="${esc(c.vitals?.rr || "")}" placeholder="120/80"></span>
        <span><small>Pulssi</small><input type="text" id="v-hr" inputmode="numeric" value="${esc(c.vitals?.hr || "")}" placeholder="72"></span>
        <span><small>SpO₂</small><input type="text" id="v-spo2" inputmode="numeric" value="${esc(c.vitals?.spo2 || "")}" placeholder="98%"></span>
        <span><small>GCS</small><input type="text" id="v-gcs" inputmode="numeric" value="${esc(c.vitals?.gcs || "")}" placeholder="15"></span>
      </div>
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
        destination: transported ? val("c-dest") : "",
        transportCode,
        transportCodeName: CODE_MAP.get(transportCode)?.name || "",
        transportUrgency,
        tags: [...new Set([...chipTags, ...extraTags])],
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
    document.getElementById("c-codehint").innerHTML = codeHint(search.value.trim().toUpperCase());
    if (!tcodeEdited) tcodeEl.value = search.value.trim().toUpperCase();
  };
  document.getElementById("c-disp").onchange = (e) => {
    document.getElementById("c-destwrap").style.display = e.target.value === "Kuljetettu" ? "" : "none";
  };
  document.querySelectorAll("#c-tags .chip").forEach((b) => {
    b.onclick = () => b.classList.toggle("on");
  });
}

function codeHint(code) {
  const info = CODE_MAP.get((code || "").toUpperCase());
  if (!info) return "";
  return `<span class="lead-tag" style="--lc:${info.color}">${info.lead}</span> ${esc(info.name)} · <span class="muted">${esc(info.category)}</span>`;
}

// ---------- Kaikki keikat (haku + suodatus) ----------
let callFilter = { q: "", urgency: "", lead: "" };
function renderCalls() {
  let calls = (function () {
    const out = [];
    for (const s of getShifts()) for (const c of s.calls || []) out.push({ ...c, shift: s });
    return out;
  })();
  calls.sort((a, b) => (a.shift.date + (a.time || "") < b.shift.date + (b.time || "") ? 1 : -1));

  const f = callFilter;
  let filtered = calls.filter((c) => {
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
    </div>
    <p class="muted">${filtered.length} / ${calls.length} keikkaa</p>
    <div class="list">
      ${filtered.length === 0 ? `<p class="muted center">Ei osumia.</p>` : filtered.map((c) => `
        <a class="call linkrow" href="#shift/${c.shift.id}">
          <div class="call-left">${c.urgency ? `<span class="urg" style="background:${URGENCY[c.urgency].color}">${c.urgency}</span>` : `<span class="urg none">–</span>`}</div>
          <div class="call-body">
            <div class="call-title"><span class="code">${esc(c.code || "?")}</span><span class="cname">${esc(c.codeName || "")}</span></div>
            <div class="call-meta"><span class="muted">${formatDate(c.shift.date)} ${esc(c.time || "")}</span>${c.disposition ? ` · <span class="meta-pill">${esc(c.disposition)}</span>` : ""}${c.destination ? ` <span class="meta-pill dest">${esc(c.destination)}</span>` : ""}</div>
            ${c.description ? `<div class="call-desc">${esc(c.description)}</div>` : ""}
          </div>
        </a>`).join("")}
    </div>
  `;
  const q = document.getElementById("q");
  q.oninput = debounce(() => { callFilter.q = q.value; renderCalls(); restoreFocus("q"); }, 200);
  document.getElementById("f-urg").onchange = (e) => { callFilter.urgency = e.target.value; renderCalls(); };
  document.getElementById("f-lead").onchange = (e) => { callFilter.lead = e.target.value; renderCalls(); };
}

// ---------- Tilastot ----------
function renderStats() {
  const s = computeStats();
  const maxLead = Math.max(1, ...Object.values(s.byLead));
  app.innerHTML = `
    <header class="page-head"><h1>Tilastot</h1></header>
    <div class="kpis">
      ${kpi(s.shiftCount, "vuoroa")}
      ${kpi(s.callCount, "keikkaa")}
      ${kpi(s.callsPerShift, "keikkaa / vuoro")}
      ${kpi(s.hoursLogged + " h", "kirjattu")}
      ${kpi(s.transportRate + " %", "kuljetettu")}
      ${kpi(s.transported, "kuljetusta")}
    </div>

    <h2 class="block-h">Hälytysasteet</h2>
    <div class="bars">
      ${["A", "B", "C", "D"].map((k) => bar(k, s.byUrgency[k] || 0, Math.max(1, ...["A", "B", "C", "D"].map((x) => s.byUrgency[x] || 0)), URGENCY[k].color)).join("")}
    </div>

    <h2 class="block-h">Johtovastuu</h2>
    <div class="bars">
      ${Object.entries(s.byLead).sort((a, b) => b[1] - a[1]).map(([k, v]) => bar(k, v, maxLead, leadColor(k))).join("") || `<p class="muted">Ei dataa.</p>`}
    </div>

    <h2 class="block-h">Yleisimmät tehtäväkoodit</h2>
    <div class="list compact">
      ${s.topCodes.length ? s.topCodes.map((c) => `<div class="ranked"><span class="code">${esc(c.code)}</span> <span class="cname">${esc(c.name)}</span><span class="rcount">${c.n}</span></div>`).join("") : `<p class="muted">Ei dataa.</p>`}
    </div>

    <h2 class="block-h">Kuljetuskohteet</h2>
    <div class="list compact">
      ${s.topDest.length ? s.topDest.map(([d, n]) => `<div class="ranked"><span class="cname">${esc(d)}</span><span class="rcount">${n}</span></div>`).join("") : `<p class="muted">Ei kuljetuksia.</p>`}
    </div>

    <h2 class="block-h">Hälytys → kuljetus</h2>
    ${s.compare.total ? `
      <div class="kpis">
        ${kpi(s.compare.changeRate + " %", "kiireellisyys muuttui")}
        ${kpi(s.compare.urgDown, "laski (esim. B→C)")}
        ${kpi(s.compare.urgUp, "nousi (esim. C→B)")}
      </div>
      <p class="muted" style="margin-top:8px">${s.compare.urgSame}/${s.compare.total} kuljetuksessa kiireellisyys pysyi samana · koodi muuttui ${s.compare.codeChanged} kertaa</p>
      ${s.compare.topTransitions.length ? `<div class="list compact" style="margin-top:8px">
        ${s.compare.topTransitions.map(([k, n]) => `<div class="ranked"><span class="cname">${esc(k)}</span><span class="rcount">${n}</span></div>`).join("")}
      </div>` : ""}
    ` : `<p class="muted">Ei vielä kuljetuksia, joissa sekä hälytys- että kuljetusaste on kirjattu.</p>`}

    <h2 class="block-h">Merkittävät tapaukset / toimenpiteet</h2>
    <div class="list compact">
      ${s.topTags.length ? s.topTags.map(([t, n]) => `<div class="ranked"><span class="cname">${esc(t)}</span><span class="rcount">${n}</span></div>`).join("") : `<p class="muted">Ei merkintöjä vielä.</p>`}
    </div>
  `;
}

function kpi(value, label) {
  return `<div class="kpi"><div class="kpi-val">${esc(String(value))}</div><div class="kpi-lab">${esc(label)}</div></div>`;
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
    ${CODE_GROUPS.map((g) => {
      const cats = g.categories.map((cat) => {
        const codes = cat.codes.filter(([code, name]) =>
          !q || code.toLowerCase().includes(q) || name.toLowerCase().includes(q) || cat.title.toLowerCase().includes(q));
        if (!codes.length) return "";
        return `<div class="codecat"><h3>${esc(cat.title)}</h3>${codes.map(([code, name]) =>
          `<div class="coderow"><span class="code" style="--lc:${g.color}">${esc(code)}</span><span class="cname">${esc(name)}</span></div>`).join("")}</div>`;
      }).join("");
      if (!cats) return "";
      return `<section class="codegroup"><div class="grouphead" style="--lc:${g.color}">${esc(g.label)}</div>${cats}</section>`;
    }).join("")}
  `;
  const cq = document.getElementById("cq");
  cq.oninput = debounce(() => { codeQuery = cq.value; renderCodes(); restoreFocus("cq"); }, 200);
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
      <h2>Merkittävät tapaukset / toimenpiteet</h2>
      <p class="muted">Pikavalintojen tagit keikkalomakkeessa, pilkulla eroteltuna.</p>
      <textarea id="set-tags" rows="3">${esc(st.tags.join(", "))}</textarea>
    </section>

    <section class="settings-block">
      <h2>Vuoron oletukset</h2>
      <p class="muted">Esitäytetään automaattisesti uuteen vuoroon.</p>
      <label class="field">Oletusasema
        <input type="text" id="set-defstation" list="stationlist-set" value="${esc(st.defaultStation || "")}" placeholder="esim. Malmi (AS.50)">
        <datalist id="stationlist-set">${stationOptions()}</datalist>
      </label>
      <label class="field">Oletusyksikkö
        <input type="text" id="set-defunit" list="unitlist-set" value="${esc(st.defaultUnit || "")}" placeholder="esim. HE1251">
        <datalist id="unitlist-set">${unitOptions()}</datalist>
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
      <p class="muted">Tiedot tallentuvat vain tähän selaimeen. Ota varmuuskopio säännöllisesti.</p>
      <div class="btn-row">
        <button class="btn" id="expJson">Vie varmuuskopio (JSON)</button>
        <button class="btn" id="expCsv">Vie keikat (CSV)</button>
        <button class="btn" id="impBtn">Tuo varmuuskopio</button>
        <input type="file" id="impFile" accept="application/json" hidden>
      </div>
    </section>

    <section class="settings-block danger-block">
      <h2>Vaara-alue</h2>
      <button class="btn danger" id="wipe">Tyhjennä kaikki tiedot</button>
    </section>

    <p class="footnote">🔒 Tietosuoja: KenttäLog on henkilökohtainen oppimispäiväkirja. Älä koskaan kirjaa potilaan tunnistetietoja. Tiedot eivät poistu laitteeltasi.</p>
  `;
  const defStationEl = document.getElementById("set-defstation");
  defStationEl.addEventListener("input", () => {
    const station = findStation(defStationEl.value);
    document.getElementById("unitlist-set").innerHTML = unitOptions(station?.units);
    const unitEl = document.getElementById("set-defunit");
    if (station && station.units.length && !unitEl.value) unitEl.value = station.units[0];
  });
  document.getElementById("saveSettings").onclick = () => {
    updateSettings({
      destinations: splitList(val("set-dest")),
      tags: splitList(val("set-tags")),
      defaultStation: val("set-defstation").trim(),
      defaultUnit: val("set-defunit").trim(),
      defaultHt: val("set-defht") === "1",
    });
    toast("Asetukset tallennettu");
  };
  document.getElementById("expJson").onclick = () => download("kenttalog-varmuuskopio.json", exportJSON(), "application/json");
  document.getElementById("expCsv").onclick = () => download("kenttalog-keikat.csv", exportCSV(), "text/csv");
  document.getElementById("impBtn").onclick = () => document.getElementById("impFile").click();
  document.getElementById("impFile").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJSON(reader.result);
        toast("Varmuuskopio tuotu");
        location.hash = "#/";
        route();
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
  document.querySelectorAll(".modal-wrap").forEach((m) => m.remove());
  document.body.classList.remove("modal-open");
}

// ---------- Apufunktiot ----------
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function val(id) { return document.getElementById(id)?.value ?? ""; }
function today() { return new Date().toISOString().slice(0, 10); }
function nowTime() { return new Date().toTimeString().slice(0, 5); }
function splitList(s) { return s.split(",").map((x) => x.trim()).filter(Boolean); }
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const days = ["su", "ma", "ti", "ke", "to", "pe", "la"];
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

// ---------- Käynnistys ----------
window.addEventListener("hashchange", route);
route();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
