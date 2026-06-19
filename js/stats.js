// Tilastojen laskenta keikoista ja vuoroista.
import { getShifts, getAllCalls } from "./storage.js";
import { CODE_MAP } from "./codes.js";

// Vuorokaudenajat (tunnit 0–23).
export const DAYPARTS = [
  { key: "yo", label: "Yö", short: "00–06", from: 0, to: 6 },
  { key: "aamu", label: "Aamu", short: "06–12", from: 6, to: 12 },
  { key: "paiva", label: "Päivä", short: "12–18", from: 12, to: 18 },
  { key: "ilta", label: "Ilta", short: "18–24", from: 18, to: 24 },
];

export const WEEKDAYS = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

export function computeStats() {
  const shifts = getShifts();
  const calls = getAllCalls();

  const byUrgency = { A: 0, B: 0, C: 0, D: 0, "": 0 };
  const byLead = {};
  const byCode = {};
  const byDest = {};
  const byTag = {};
  const tagStats = {}; // tag -> { total, itse } (rooli "Suoritin itse")
  let transported = 0;

  // Aika-analyysi
  const hourHist = new Array(24).fill(0);
  const weekdayHist = new Array(7).fill(0);
  const dayparts = DAYPARTS.map((d) => ({ ...d, total: 0, urg: { A: 0, B: 0, C: 0, D: 0 }, byCode: {} }));
  const bucketFor = (h) => dayparts.find((d) => h >= d.from && h < d.to);
  let timedCalls = 0;

  // Vuorotyyppi
  const stype = (s) => (s.type === "day" ? "day" : s.type === "night" ? "night" : "custom");
  const shiftTypeCount = { day: 0, night: 0, custom: 0 };
  const shiftTypeCalls = { day: 0, night: 0, custom: 0 };
  const shiftTypeTransported = { day: 0, night: 0, custom: 0 };
  const shiftTypeUrg = { day: { A: 0, B: 0, C: 0, D: 0 }, night: { A: 0, B: 0, C: 0, D: 0 }, custom: { A: 0, B: 0, C: 0, D: 0 } };

  // Päivä-/viikkokohtainen aktiivisuus
  const dayMap = {}; // "YYYY-MM-DD" -> { count, hours }
  for (const s of shifts) {
    const d = s.date;
    if (!d) continue;
    (dayMap[d] || (dayMap[d] = { count: 0, hours: 0 })).hours += shiftHours(s);
    shiftTypeCount[stype(s)]++;
  }

  // Hälytys vs. kuljetus -vertailu
  const urgRank = { A: 1, B: 2, C: 3, D: 4 };
  let cmpTotal = 0, urgSame = 0, urgChanged = 0, urgDown = 0, urgUp = 0, codeChanged = 0;
  const urgTransitions = {};

  for (const c of calls) {
    byUrgency[c.urgency || ""] = (byUrgency[c.urgency || ""] || 0) + 1;
    const lead = c.lead || (CODE_MAP.get(c.code)?.lead) || "Muu";
    byLead[lead] = (byLead[lead] || 0) + 1;
    if (c.code) byCode[c.code] = (byCode[c.code] || 0) + 1;
    for (const t of c.tags || []) {
      byTag[t] = (byTag[t] || 0) + 1;
      const ts = tagStats[t] || (tagStats[t] = { total: 0, itse: 0 });
      ts.total++;
      if (c.role === "Suoritin itse") ts.itse++;
    }

    // Aika-analyysi
    const hour = parseHour(c.time);
    if (hour != null) {
      timedCalls++;
      hourHist[hour]++;
      const bucket = bucketFor(hour);
      if (bucket) {
        bucket.total++;
        if (c.urgency && bucket.urg[c.urgency] != null) bucket.urg[c.urgency]++;
        if (c.code) bucket.byCode[c.code] = (bucket.byCode[c.code] || 0) + 1;
      }
    }
    const date = c.shift?.date;
    if (date) {
      const wd = weekdayIndex(date);
      if (wd != null) weekdayHist[wd]++;
      (dayMap[date] || (dayMap[date] = { count: 0, hours: 0 })).count++;
    }

    // Vuorotyyppi
    if (c.shift) {
      const st = stype(c.shift);
      shiftTypeCalls[st]++;
      if (c.disposition === "Kuljetettu") shiftTypeTransported[st]++;
      if (c.urgency && shiftTypeUrg[st][c.urgency] != null) shiftTypeUrg[st][c.urgency]++;
    }

    if (c.disposition === "Kuljetettu") {
      transported++;
      const d = c.destination || "Ei kohdetta";
      byDest[d] = (byDest[d] || 0) + 1;

      if (c.transportCode && c.code && c.transportCode !== c.code) codeChanged++;
      const du = c.urgency, tu = c.transportUrgency;
      if (du && tu) {
        cmpTotal++;
        if (du === tu) {
          urgSame++;
        } else {
          urgChanged++;
          const key = `${du}→${tu}`;
          urgTransitions[key] = (urgTransitions[key] || 0) + 1;
          if (urgRank[tu] > urgRank[du]) urgDown++;
          else if (urgRank[tu] < urgRank[du]) urgUp++;
        }
      }
    }
  }
  const topTransitions = Object.entries(urgTransitions).sort((a, b) => b[1] - a[1]);

  const topCodes = Object.entries(byCode)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([code, n]) => ({ code, n, name: CODE_MAP.get(code)?.name || "" }));

  const topDest = Object.entries(byDest).sort((a, b) => b[1] - a[1]);
  const topTags = Object.entries(byTag).sort((a, b) => b[1] - a[1]);

  // Vuorokaudenajan top-koodit
  for (const d of dayparts) {
    d.topCodes = Object.entries(d.byCode)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([code, n]) => ({ code, n, name: CODE_MAP.get(code)?.name || "" }));
  }

  // Päiväsarja (vain päivät joilta on vuoro tai keikka), aikajärjestyksessä
  const dailySeries = Object.keys(dayMap).sort().map((date) => ({
    date,
    count: dayMap[date].count,
    hours: Math.round(dayMap[date].hours * 10) / 10,
  }));

  // Viikkosarja (ISO-viikko)
  const weekMap = {};
  for (const date of Object.keys(dayMap)) {
    const wk = isoWeek(date);
    const w = weekMap[wk] || (weekMap[wk] = { week: wk, count: 0, hours: 0, days: 0 });
    w.count += dayMap[date].count;
    w.hours += dayMap[date].hours;
    w.days++;
  }
  const weeklySeries = Object.values(weekMap)
    .sort((a, b) => (a.week < b.week ? -1 : 1))
    .map((w) => ({ ...w, hours: Math.round(w.hours * 10) / 10, label: weekLabel(w.week) }));

  // Huiput
  const peakHour = hourHist.some((x) => x) ? hourHist.indexOf(Math.max(...hourHist)) : null;
  const peakWeekdayIdx = weekdayHist.some((x) => x) ? weekdayHist.indexOf(Math.max(...weekdayHist)) : null;
  const busiestDaypart = dayparts.reduce((a, b) => (b.total > a.total ? b : a), dayparts[0]);

  return {
    topTags,
    tagStats,
    compare: {
      total: cmpTotal, urgSame, urgChanged, urgDown, urgUp, codeChanged,
      changeRate: cmpTotal ? Math.round((urgChanged / cmpTotal) * 100) : 0,
      topTransitions,
    },
    shiftCount: shifts.length,
    callCount: calls.length,
    distinctCodes: Object.keys(byCode).length,
    callsPerShift: shifts.length ? (calls.length / shifts.length).toFixed(1) : "0",
    transported,
    transportRate: calls.length ? Math.round((transported / calls.length) * 100) : 0,
    byUrgency,
    byLead,
    topCodes,
    topDest,
    hoursLogged: Math.round(shifts.reduce((sum, s) => sum + shiftHours(s), 0) * 10) / 10,
    // aika-analyysi
    hourHist,
    weekdayHist,
    dayparts,
    timedCalls,
    untimedCalls: calls.length - timedCalls,
    peakHour,
    peakWeekdayIdx,
    busiestDaypart: busiestDaypart && busiestDaypart.total ? busiestDaypart : null,
    dailySeries,
    weeklySeries,
    // vuorotyyppi
    shiftTypeCount,
    shiftTypeCalls,
    shiftTypeTransported,
    shiftTypeUrg,
  };
}

function parseHour(t) {
  if (!t || typeof t !== "string") return null;
  const m = t.match(/^(\d{1,2}):/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  return h >= 0 && h < 24 ? h : null;
}

// Maanantai = 0 ... Sunnuntai = 6
function weekdayIndex(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return null;
  return (d.getDay() + 6) % 7;
}

// ISO-viikko muodossa "2026-W25"
function isoWeek(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return "?";
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNr = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNr + 3);
  const week = 1 + Math.round((target - firstThursday) / (7 * 24 * 3600 * 1000));
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weekLabel(wk) {
  const m = wk.match(/W(\d+)$/);
  return m ? `vk ${parseInt(m[1], 10)}` : wk;
}

export function shiftHours(s) {
  const start = s.startTime || (s.type === "night" ? "21:00" : "09:00");
  const end = s.endTime || (s.type === "night" ? "09:00" : "21:00");
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60; // yli keskiyön
  return Math.round((mins / 60) * 10) / 10;
}
