// 契約締結伺い書 押印ツール — Service Worker
// 方針: ネットワーク優先（オンライン時は常に最新を取得）＋ オフライン時はキャッシュで動作。
// これにより、index.html を差し替えるだけで次回オンライン時に全員へ更新が届きます。
const CACHE = 'oshiin-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './pdf.min.js',
  './pdf.worker.min.js',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './icon-180.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
