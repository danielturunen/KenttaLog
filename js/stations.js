// Helsingin pelastuslaitoksen pelastusasemat ja yksikkötunnukset.
// Lähde: käyttäjän toimittama asemalista.

export const STATIONS = [
  { code: "AS.10", name: "Kallio", full: "Kallion keskuspelastusasema", address: "Agricolankatu 15, 00530 Helsinki", units: ["HE1211", "HE1311", "HE1312"] },
  { code: "AS.20", name: "Erottaja", full: "Erottajan pelastusasema", address: "Korkeavuorenkatu 26, 00130 Helsinki", units: ["HE1321"] },
  { code: "AS.21", name: "Jätkäsaari", full: "Jätkäsaaren pelastusasema", address: "Tyynenmerenkatu 1, 00220 Helsinki", units: ["HE1322"], note: "Vuoronvaihto Erottajalla" },
  { code: "AS.30", name: "Haaga", full: "Haagan pelastusasema", address: "Vanha Turun maantie 2, 00320 Helsinki", units: ["HE1231"] },
  { code: "AS.31", name: "Konala", full: "Konalan pelastusasema", address: "Muonamiehentie 13, 00390 Helsinki", units: ["HE1331"] },
  { code: "AS.40", name: "Käpylä", full: "Käpylän pelastusasema", address: "Kullervonkatu 7, 00600 Helsinki", units: ["HE1341", "HE1342"] },
  { code: "AS.50", name: "Malmi", full: "Malmin pelastusasema", address: "Malmin lentoasema, 00700 Helsinki", units: ["HE1251", "HE1252"] },
  { code: "AS.60", name: "Mellunkylä", full: "Mellunkylän pelastusasema", address: "Linnanpajantie 6, 00950 Helsinki", units: ["HE1261", "HE1362", "HE1363"] },
  { code: "AS.61", name: "Kontula", full: "Kontulan pelastusasema", address: "Lirokuja 6, 00940 Helsinki", units: ["HE1361"] },
  { code: "AS.70", name: "Herttoniemi", full: "Herttoniemen pelastusasema", address: "Sorvaajankatu 16, 00880 Helsinki", units: ["HE1371"] },
];

// Aseman näyttönimi esim. "Malmi (AS.50)"
export function stationLabel(s) {
  return `${s.name} (${s.code})`;
}

// Kaikki yksikkötunnukset (litteä lista).
export const ALL_UNITS = STATIONS.flatMap((s) => s.units);

// Etsi asema näyttötekstin tai vapaan syötteen perusteella.
export function findStation(value) {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return (
    STATIONS.find((s) => stationLabel(s).toLowerCase() === v) ||
    STATIONS.find((s) => s.name.toLowerCase() === v) ||
    STATIONS.find((s) => s.code.toLowerCase() === v) ||
    STATIONS.find((s) => v.includes(s.code.toLowerCase()) || v.includes(s.name.toLowerCase())) ||
    null
  );
}

// Etsi asema yksikkötunnuksen perusteella.
export function stationForUnit(unit) {
  if (!unit) return null;
  const u = unit.trim().toUpperCase();
  return STATIONS.find((s) => s.units.includes(u)) || null;
}
