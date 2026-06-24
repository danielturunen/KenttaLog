// Itse generoidut EKG-rytmistripit (SVG). Ei kopioituja kuvia – piirretään
// ohjelmallisesti gaussisilla aalloilla EKG-paperin näköiselle ruudukolle.
// Tarkoitettu rytmin TUNNISTAMISEN harjoitteluun, ei diagnostiseen käyttöön.

const W = 640, H = 170, BASE = 105;

// Siemennetty satunnaisgeneraattori, jotta sama rytmi piirtyy aina samanlaisena.
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function gauss(x, c, amp, w) { const d = x - c; return amp * Math.exp(-(d * d) / (2 * w * w)); }

// Yhden lyönnin gaussiset aallot keskipisteeseen c.
function beatWaves(c, o = {}) {
  const { p = true, pa = 7, q = 6, r = 60, s = 14, ta = 14, st = 0,
    wideQRS = false, negT = false, pr = 42, qt = 32, pw = 6 } = o;
  const w = [];
  if (p) w.push({ c: c - pr, amp: pa, w: pw });
  if (wideQRS) {
    w.push({ c: c - 7, amp: -10, w: 4 });
    w.push({ c: c, amp: r, w: 9 });
    w.push({ c: c + 15, amp: -r * 0.5, w: 7 });
  } else {
    w.push({ c: c - 7, amp: -q, w: 2.2 });
    w.push({ c: c, amp: r, w: 3 });
    w.push({ c: c + 8, amp: -s, w: 2.6 });
  }
  if (st) w.push({ c: c + 18, amp: st, w: 14 });
  w.push({ c: c + qt, amp: negT ? -ta : ta, w: wideQRS ? 12 : 9 });
  return w;
}

function build(id) {
  const waves = [], spikes = [];
  const r = rng(hashStr(id));
  const add = (c, amp, w) => waves.push({ c, amp, w });
  const beat = (c, o) => { for (const wv of beatWaves(c, o)) waves.push(wv); };
  const start = 24, end = W - 20;
  switch (id) {
    case "ekg-sinus":
      for (let c = start + 30; c < end; c += 150) beat(c, {});
      break;
    case "ekg-brady":
      for (let c = start + 30; c < end; c += 260) beat(c, {});
      break;
    case "ekg-tachy":
      for (let c = start + 20; c < end; c += 92) beat(c, { pr: 34, qt: 26, ta: 12 });
      break;
    case "ekg-svt":
      for (let c = start + 20; c < end; c += 82) beat(c, { p: false, qt: 24, ta: 11 });
      break;
    case "ekg-vt":
      for (let c = start + 20; c < end; c += 98) beat(c, { p: false, wideQRS: true, negT: true, r: 55, qt: 34, ta: 18 });
      break;
    case "ekg-vf":
      for (let i = 0; i < 46; i++) add(start + i * ((end - start) / 46) + (r() - 0.5) * 8, (r() * 2 - 1) * (22 + r() * 22), 6 + r() * 9);
      break;
    case "ekg-asys":
      add(150, 3, 50); add(430, -2, 70);
      break;
    case "ekg-pea":
      for (let c = start + 30; c < end; c += 215) beat(c, { p: false, wideQRS: true, r: 34, ta: 9, qt: 38 });
      break;
    case "ekg-af": {
      let c = start + 30;
      while (c < end) { beat(c, { p: false }); c += 95 + r() * 80; }
      for (let x = start; x < end; x += 10) add(x + (r() - 0.5) * 6, (r() * 2 - 1) * 3.5, 4);
      break;
    }
    case "ekg-flutter":
      for (let c = start; c < end; c += 42) add(c, 14, 7);
      for (let c = start + 64; c < end; c += 138) beat(c, { p: false, qt: 30 });
      break;
    case "ekg-av1":
      for (let c = start + 40; c < end; c += 165) beat(c, { pr: 70 });
      break;
    case "ekg-av2a": {
      let c = start + 40, i = 0;
      const prs = [40, 58, 76];
      while (c < end) { const ph = i % 4; if (ph === 3) add(c - 50, 7, 6); else beat(c, { pr: prs[ph] }); c += 150; i++; }
      break;
    }
    case "ekg-av2b": {
      let c = start + 40, i = 0;
      while (c < end) { if (i % 3 === 2) add(c - 44, 7, 6); else beat(c, { pr: 44 }); c += 140; i++; }
      break;
    }
    case "ekg-av3":
      for (let c = start + 10; c < end; c += 72) add(c, 7, 6);
      for (let c = start + 40; c < end; c += 175) beat(c, { p: false, wideQRS: true, r: 42, qt: 36, ta: 12 });
      break;
    case "ekg-stemi":
      for (let c = start + 30; c < end; c += 155) beat(c, { st: 26, qt: 30, ta: 11 });
      break;
    case "ekg-ves": {
      let c = start + 30, i = 0;
      while (c < end) {
        if (i === 2) { for (const wv of beatWaves(c - 55, { p: false, wideQRS: true, negT: true, r: 50, qt: 34, ta: 16 })) waves.push(wv); }
        else beat(c, {});
        c += 150; i++;
      }
      break;
    }
    case "ekg-pace":
      for (let c = start + 40; c < end; c += 160) {
        spikes.push(c - 16);
        for (const wv of beatWaves(c, { p: false, wideQRS: true, r: 46, qt: 34, negT: true, ta: 12 })) waves.push(wv);
      }
      break;
    default:
      return null;
  }
  return { waves, spikes };
}

function samplePath(waves) {
  const step = 1.5;
  let d = "";
  for (let x = 0; x <= W; x += step) {
    let y = BASE;
    for (const wv of waves) y -= gauss(x, wv.c, wv.amp, wv.w);
    y = Math.max(6, Math.min(H - 6, y));
    d += (x === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
  }
  return d.trim();
}

function gridLines(stepPx) {
  let s = "";
  for (let x = 0; x <= W; x += stepPx) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 0; y <= H; y += stepPx) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  return s;
}

// Palauttaa EKG-stripin SVG-merkkijonona, tai null jos id ei ole tunnettu rytmi.
export function ekgWaveSvg(id) {
  const b = build(id);
  if (!b) return null;
  const d = samplePath(b.waves);
  const spikes = b.spikes
    .map((x) => `<line x1="${x}" y1="${BASE + 8}" x2="${x}" y2="${BASE - 48}" stroke="#0a0a0a" stroke-width="1.6"/>`)
    .join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="ekgsvg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="EKG-rytmistrippi">
    <rect width="${W}" height="${H}" fill="#fff5f6"/>
    <g stroke="#ffd0d6" stroke-width="1">${gridLines(8)}</g>
    <g stroke="#ff9aa6" stroke-width="1">${gridLines(40)}</g>
    ${spikes}
    <path d="${d}" fill="none" stroke="#12141b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

// Onko tämä id sisäänrakennettu rytmi (jolle generoidaan kuva)?
export function isRhythmCard(id) {
  return !!build(id);
}
