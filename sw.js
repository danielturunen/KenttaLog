// KenttäLog service worker – offline-tuki välimuistilla.
const CACHE = "kenttalog-v62";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./js/app.js",
  "./js/codes.js",
  "./js/codeinfo.js",
  "./js/storage.js",
  "./js/stats.js",
  "./js/stations.js",
  "./js/ekgwave.js",
  "./icons/icon.svg",
  "./icons/icon-maskable.svg",
  "./img/hud/anafylaksia-racer.jpg",
  "./img/hud/avh-stroke.jpg",
  "./img/hud/ensiarvio.jpg",
  "./img/hud/hengitys-breath.jpg",
  "./img/hud/kipu-socrates.jpg",
  "./img/hud/kouristelu-captured.jpg",
  "./img/hud/lapsi-hengitys.jpg",
  "./img/hud/lapsi-pat.jpg",
  "./img/hud/lapsi-punaiset-liput.jpg",
  "./img/hud/master-red-flags.jpg",
  "./img/hud/obstetriset-hatatilanteet.jpg",
  "./img/hud/paansarky.jpg",
  "./img/hud/raskaus-pregnant.jpg",
  "./img/hud/rintakipu-anatomia.jpg",
  "./img/hud/rintakipu-matriisi.jpg",
  "./img/hud/selkakipu.jpg",
  "./img/hud/tajuttomuus-faint.jpg",
  "./img/hud/vatsakipu-anatomia.jpg",
  "./img/hud/vatsakipu-matriisi.jpg",
];

self.addEventListener("install", (e) => {
  // Ei skipWaiting-kutsua asennuksessa: uusi versio odottaa, kunnes käyttäjä
  // hyväksyy päivityksen sovelluksen bannerista (app.js lähettää viestin).
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
