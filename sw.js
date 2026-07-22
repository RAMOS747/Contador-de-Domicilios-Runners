const CACHE_NAME = 'runners-v2'; // sube este número cada vez que publiques cambios grandes
const ASSETS = ['./index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Para el HTML (la app en sí): siempre intenta traer lo más reciente de internet.
  // Si no hay conexión, usa la última copia guardada.
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copia));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Para el resto de archivos (íconos, manifest): caché primero, con respaldo de red.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
