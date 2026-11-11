// Forge — fonctionnement hors ligne.
// Réseau d'abord (pour recevoir les mises à jour), copie locale si pas de réseau ou réseau trop lent.
const CACHE = 'forge-cache';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const fromCache = () => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'));
  const fromNet = fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  });
  const timeout = new Promise(res => setTimeout(() => res(null), 3500));
  e.respondWith(
    Promise.race([fromNet.catch(() => null), timeout]).then(r => r || fromCache().then(c => c || fromNet))
  );
});
