// Tietojen tallennus selaimen localStorageen.
// HUOM: Tiedot säilyvät vain tässä selaimessa tällä laitteella.
// Käytä Asetukset → Varmuuskopio -toimintoa datan siirtoon / talteenottoon.

const KEY = "kenttalog.v1";

const DEFAULT_DATA = {
  version: 1,
  shifts: [],
  settings: {
    destinations: [
      "Meilahti",
      "Meilahden CCU",
      "Meilahden teho-osasto",
      "Malmi",
      "Naistenklinikka",
      "Uusi lastensairaala (ULS)",
      "Haartman",
      "Jorvi",
      "Peijas",
      "Töölö",
      "Terveyskeskus",
    ],
    units: [],
    defaultStation: "",
    defaultUnit: "",
    defaultHt: true,
    // Käyttäjän omat lisätagit. Sisäänrakennetut toimenpiteet (codes.js PROCEDURES)
    // näkyvät aina näiden lisäksi.
    tags: [],
    // Osaamistavoitteet harjoittelujaksolle: [{ tag, target }]
    goals: [],
    // Harjoittelujakson tiedot ja tavoitteet
    internshipStart: "",
    internshipEnd: "",
    targetHours: 0,
    targetShifts: 0,
    // EKG-korttien edistyminen (Leitner-laatikot) ja käyttäjän omat kortit
    ekgProgress: {},
    ekgCards: [],
    // Viimeisimmän varmuuskopion päivä (muistutusta varten)
    lastBackup: "",
    // Väriteema (ks. THEMES app.js:ssä)
    theme: "yo",
  },
};

let cache = null;

export function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cache = { ...structuredClone(DEFAULT_DATA), ...parsed };
      cache.settings = { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) };
    } else {
      cache = structuredClone(DEFAULT_DATA);
    }
  } catch (e) {
    console.error("Datan luku epäonnistui, aloitetaan tyhjästä.", e);
    cache = structuredClone(DEFAULT_DATA);
  }
  return cache;
}

let quotaWarned = false;
export function save() {
  if (!cache) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) {
    // Tyypillisesti QuotaExceededError: selaimen tallennustila (~5 Mt) täynnä,
    // yleensä kuvaliitteiden takia. Kerro käyttäjälle heti – muuten muutokset
    // katoavat hiljaa sivun sulkeutuessa.
    console.error("Tallennus localStorageen epäonnistui", e);
    if (!quotaWarned) {
      quotaWarned = true;
      alert("Tallennustila on täynnä – viimeisin muutos EI tallentunut pysyvästi!\n\nPoista kuvaliitteitä tai vanhoja keikkoja ja yritä uudelleen. Ota varmuuskopio talteen (Asetukset → Vie / jaa varmuuskopio).");
    }
  }
}

export function getData() {
  return load();
}

// ---- Vuorot ----

export function getShifts() {
  return load().shifts.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getShift(id) {
  return load().shifts.find((s) => s.id === id) || null;
}

export function addShift(shift) {
  const data = load();
  const s = { id: uid(), calls: [], ...shift };
  data.shifts.push(s);
  save();
  return s;
}

export function updateShift(id, patch) {
  const s = getShift(id);
  if (!s) return null;
  Object.assign(s, patch);
  save();
  return s;
}

export function deleteShift(id) {
  const data = load();
  data.shifts = data.shifts.filter((s) => s.id !== id);
  save();
}

// ---- Keikat ----

export function addCall(shiftId, call) {
  const s = getShift(shiftId);
  if (!s) return null;
  if (!s.calls) s.calls = [];
  const c = { id: uid(), ...call };
  s.calls.push(c);
  s.calls.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  save();
  return c;
}

export function updateCall(shiftId, callId, patch) {
  const s = getShift(shiftId);
  if (!s) return null;
  const c = (s.calls || []).find((x) => x.id === callId);
  if (!c) return null;
  Object.assign(c, patch);
  s.calls.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  save();
  return c;
}

export function deleteCall(shiftId, callId) {
  const s = getShift(shiftId);
  if (!s) return;
  s.calls = (s.calls || []).filter((x) => x.id !== callId);
  save();
}

export function getAllCalls() {
  const out = [];
  for (const s of load().shifts) {
    for (const c of s.calls || []) {
      out.push({ ...c, shift: s });
    }
  }
  return out;
}

// ---- Asetukset ----

export function getSettings() {
  return load().settings;
}

export function updateSettings(patch) {
  const data = load();
  data.settings = { ...data.settings, ...patch };
  save();
  return data.settings;
}

// ---- Varmuuskopio ----

export function exportJSON() {
  return JSON.stringify(load(), null, 2);
}

export function importJSON(json) {
  const parsed = JSON.parse(json);
  if (!parsed || !Array.isArray(parsed.shifts)) {
    throw new Error("Tiedosto ei ole kelvollinen KenttäLog-varmuuskopio.");
  }
  cache = { ...structuredClone(DEFAULT_DATA), ...parsed };
  cache.settings = { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) };
  save();
  return cache;
}

export function clearAll() {
  cache = structuredClone(DEFAULT_DATA);
  save();
}

// ---- CSV-vienti ----

export function exportCSV() {
  const rows = [
    ["Pvm", "Vuoro", "Aika", "Koodi", "Tehtävä", "Hälytysaste", "Johtovastuu", "Kuljetus", "Kohde", "KuljKoodi", "KuljKiireellisyys", "Tagit", "RR", "Pulssi", "SpO2", "GCS", "HT", "B-gluk", "Lampo", "Kuvaus"],
  ];
  const calls = getAllCalls().sort((a, b) => {
    const da = a.shift.date + (a.time || "");
    const db = b.shift.date + (b.time || "");
    return da < db ? 1 : da > db ? -1 : 0;
  });
  for (const c of calls) {
    rows.push([
      c.shift.date,
      shiftTypeLabel(c.shift),
      c.time || "",
      c.code || "",
      c.codeName || "",
      c.urgency || "",
      c.lead || "",
      c.disposition || "",
      c.destination ? (c.tehoModule ? `${c.destination} (${c.tehoModule})` : c.destination) : "",
      c.transportCode || "",
      c.transportUrgency || "",
      (c.tags || []).join(", "),
      c.vitals?.rr || "",
      c.vitals?.hr || "",
      c.vitals?.spo2 || "",
      c.vitals?.gcs || "",
      c.vitals?.ht || "",
      c.vitals?.gluk || "",
      c.vitals?.temp || "",
      (c.description || "").replace(/\s+/g, " ").trim(),
    ]);
  }
  return rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
}

function shiftTypeLabel(s) {
  if (s.type === "day") return "Päivä 9–21";
  if (s.type === "night") return "Yö 21–9";
  return `${s.startTime || ""}–${s.endTime || ""}`;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
