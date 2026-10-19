const CACHE = 'partitions-v2';
const FILES = [
  './',
  './index.html',
  './pdf.min.js',
  './pdf.worker.min.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        FILES.map((url) =>
          cache.add(url).catch((err) => console.warn('Non mis en cache :', url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));

      return cached || network;
    })
  );
});
