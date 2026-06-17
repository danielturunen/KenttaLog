// Tilastojen laskenta keikoista ja vuoroista.
import { getShifts, getAllCalls } from "./storage.js";
import { CODE_MAP } from "./codes.js";

export function computeStats() {
  const shifts = getShifts();
  const calls = getAllCalls();

  const byUrgency = { A: 0, B: 0, C: 0, D: 0, "": 0 };
  const byLead = {};
  const byCode = {};
  const byDest = {};
  const byTag = {};
  let transported = 0;

  // Hälytys vs. kuljetus -vertailu
  const urgRank = { A: 1, B: 2, C: 3, D: 4 };
  let cmpTotal = 0, urgSame = 0, urgChanged = 0, urgDown = 0, urgUp = 0, codeChanged = 0;
  const urgTransitions = {};

  for (const c of calls) {
    byUrgency[c.urgency || ""] = (byUrgency[c.urgency || ""] || 0) + 1;
    const lead = c.lead || (CODE_MAP.get(c.code)?.lead) || "Muu";
    byLead[lead] = (byLead[lead] || 0) + 1;
    if (c.code) byCode[c.code] = (byCode[c.code] || 0) + 1;
    for (const t of c.tags || []) byTag[t] = (byTag[t] || 0) + 1;
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
          if (urgRank[tu] > urgRank[du]) urgDown++;       // esim. B→C = kiireellisyys laski
          else if (urgRank[tu] < urgRank[du]) urgUp++;    // esim. C→B = kiireellisyys nousi
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

  return {
    topTags,
    compare: {
      total: cmpTotal,
      urgSame,
      urgChanged,
      urgDown,
      urgUp,
      codeChanged,
      changeRate: cmpTotal ? Math.round((urgChanged / cmpTotal) * 100) : 0,
      topTransitions,
    },
    shiftCount: shifts.length,
    callCount: calls.length,
    callsPerShift: shifts.length ? (calls.length / shifts.length).toFixed(1) : "0",
    transported,
    transportRate: calls.length ? Math.round((transported / calls.length) * 100) : 0,
    byUrgency,
    byLead,
    topCodes,
    topDest,
    hoursLogged: shifts.reduce((sum, s) => sum + shiftHours(s), 0),
  };
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
