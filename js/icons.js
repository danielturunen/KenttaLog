// Kuvakkeet ja asemakuviot SVG:nä. Kaikki piirretään currentColorilla, joten
// ne värjäytyvät aseman ja teeman mukaan ilman erillisiä värejä.

const svg = (body, size = 24) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

// Alapalkin kuvakkeet.
export const TAB_ICONS = {
  home: svg(`<rect x="3" y="4.5" width="18" height="16" rx="3.5"/><path d="M3 9.5h18M8 2.8v3.4M16 2.8v3.4"/><path d="M8.5 14h3M8.5 17h6"/>`),
  calls: svg(`<path d="M9.5 6.5H20M9.5 12H20M9.5 17.5H20"/><circle cx="4.8" cy="6.5" r="1.1"/><circle cx="4.8" cy="12" r="1.1"/><circle cx="4.8" cy="17.5" r="1.1"/>`),
  stats: svg(`<rect x="3.8" y="12" width="3.6" height="8.5" rx="1.2"/><rect x="10.2" y="7" width="3.6" height="13.5" rx="1.2"/><rect x="16.6" y="3.5" width="3.6" height="17" rx="1.2"/>`),
  codes: svg(`<path d="M9.5 3.5 7.5 20.5M16.5 3.5l-2 17M4.5 8.8h16M3.5 15.2h16"/>`),
  // Ensiapulaukku: työkalut-välilehti on ensihoidon apuvälineitä varten.
  tools: svg(`<rect x="3" y="7" width="18" height="13.5" rx="3"/><path d="M8.5 7V5.6A1.6 1.6 0 0 1 10.1 4h3.8a1.6 1.6 0 0 1 1.6 1.6V7M12 10.8v6M9 13.8h6"/>`),
  settings: svg(`<path d="M4 7h16M4 17h16"/><circle class="knob" cx="9" cy="7" r="2.3"/><circle class="knob" cx="15" cy="17" r="2.3"/>`),
};

// Asemien kuvakkeet (aseman tunnus yläpalkissa, valitsin, kortit).
const STATION_ICONS = {
  radar: svg(`<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="m12 12 5.5-5.5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>`),
  waves: svg(`<path d="M2.5 9c1.6 0 1.6-1.8 3.2-1.8S7.3 9 8.9 9s1.6-1.8 3.2-1.8S13.7 9 15.3 9s1.6-1.8 3.2-1.8S20.1 9 21.5 9"/><path d="M2.5 15c1.6 0 1.6-1.8 3.2-1.8S7.3 15 8.9 15s1.6-1.8 3.2-1.8 1.6 1.8 3.2 1.8 1.6-1.8 3.2-1.8 1.6 1.8 3 1.8"/>`),
  harbor: svg(`<path d="M12 3.2s5.6 6 5.6 10.2a5.6 5.6 0 0 1-11.2 0C6.4 9.2 12 3.2 12 3.2Z"/><path d="M9.6 14.2a2.4 2.4 0 0 0 2.4 2.2"/>`),
  hex: svg(`<path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4Z"/><circle cx="12" cy="12" r="2.2"/><path d="M12 6.6v3.2M16.7 14.7l-2.8-1.6M7.3 14.7l2.8-1.6"/>`),
  // Helikopteri sivulta: MIRG-ryhmä kuljetetaan aluksille helikopterilla.
  mirg: svg(`<path d="M2.5 5h13M9 5v2.5"/><path d="M4.5 11A3.5 3.5 0 0 1 8 7.5h5a2 2 0 0 1 2 2V15H8a3.5 3.5 0 0 1-3.5-3.5Z"/><path d="M15 10.2h5.5M20.5 8v4.5M6 18.5h9.5M8 15v3.5M13 15v3.5"/>`),
  pin: svg(`<path d="M12 21s-6.2-5.6-6.2-11.1a6.2 6.2 0 0 1 12.4 0C18.2 15.4 12 21 12 21Z"/><circle cx="12" cy="9.9" r="2.2"/>`),
};
export function stationIcon(station, size = 16) {
  const body = STATION_ICONS[station?.motif] || STATION_ICONS.pin;
  return size === 24 ? body : body.replace('width="24" height="24"', `width="${size}" height="${size}"`);
}

// Asemakuvio korttien taustalle: aseman erityisosaamisen tunnistettava muoto.
// Piirretään ohuella viivalla ja pienellä peittävyydellä (CSS .motif), jotta se
// luo identiteetin varastamatta huomiota tiedolta.
function wavesRows(fromY, toY, step, amp = 7) {
  let d = "";
  for (let y = fromY; y <= toY; y += step) {
    d += `M-10 ${y} q 15 ${-amp} 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 `;
  }
  return `<path d="${d}"/>`;
}
function hexGrid() {
  const r = 17, w = Math.sqrt(3) * r;
  let d = "";
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 9; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0) + 40;
      const cy = row * r * 1.5 - 8;
      const pts = [...Array(6)].map((_, i) => {
        const a = Math.PI / 180 * (60 * i - 90);
        return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
      });
      d += `M${pts.join("L")}Z`;
    }
  }
  return `<path d="${d}"/>`;
}
const MOTIFS = {
  radar: () => `${[22, 44, 66, 88, 110, 132].map((r) => `<circle cx="205" cy="120" r="${r}"/>`).join("")}<path d="M205 120 120 20M205 0v240M60 120h200"/>`,
  waves: () => wavesRows(14, 140, 15),
  harbor: () => `${wavesRows(70, 140, 14, 6)}<path d="M196 10s-22 24-22 40a22 22 0 0 0 44 0c0-16-22-40-22-40Z"/>`,
  hex: () => hexGrid(),
  mirg: () => `<g transform="translate(166 14) scale(3)" vector-effect="non-scaling-stroke"><path vector-effect="non-scaling-stroke" d="M2.5 5h13M9 5v2.5"/><path vector-effect="non-scaling-stroke" d="M4.5 11A3.5 3.5 0 0 1 8 7.5h5a2 2 0 0 1 2 2V15H8a3.5 3.5 0 0 1-3.5-3.5Z"/><path vector-effect="non-scaling-stroke" d="M15 10.2h5.5M20.5 8v4.5M6 18.5h9.5M8 15v3.5M13 15v3.5"/></g>${wavesRows(108, 140, 12, 6)}`,
  grid: () => {
    let c = "";
    for (let y = 8; y < 140; y += 16) for (let x = 8; x < 240; x += 16) c += `<circle cx="${x}" cy="${y}" r="1.1" fill="currentColor" stroke="none"/>`;
    return c;
  },
};
export function stationMotif(station) {
  const draw = MOTIFS[station?.motif] || MOTIFS.grid;
  return `<svg class="motif" viewBox="0 0 240 140" preserveAspectRatio="xMaxYMid slice" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">${draw()}</svg>`;
}
