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
  let transported = 0;

  for (const c of calls) {
    byUrgency[c.urgency || ""] = (byUrgency[c.urgency || ""] || 0) + 1;
    const lead = c.lead || (CODE_MAP.get(c.code)?.lead) || "Muu";
    byLead[lead] = (byLead[lead] || 0) + 1;
    if (c.code) byCode[c.code] = (byCode[c.code] || 0) + 1;
    if (c.disposition === "Kuljetettu") {
      transported++;
      const d = c.destination || "Ei kohdetta";
      byDest[d] = (byDest[d] || 0) + 1;
    }
  }

  const topCodes = Object.entries(byCode)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([code, n]) => ({ code, n, name: CODE_MAP.get(code)?.name || "" }));

  const topDest = Object.entries(byDest).sort((a, b) => b[1] - a[1]);

  return {
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
