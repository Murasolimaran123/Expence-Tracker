const CACHE_NAME = 'expense-tracker-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => {
      if (k !== CACHE_NAME) return caches.delete(k);
    })))
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(()=>{});
      return resp;
    }).catch(() => cached))
  );
});


