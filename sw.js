// sw.js — cache hero images (stale-while-revalidate)

const CACHE_NAME = "mm-hero-v1";
const HERO_PATH  = "/images/hero/"; // carpeta a cachear

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Estrategia: Stale-While-Revalidate para /images/hero/
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo interceptamos imágenes de la carpeta /images/hero/
  if (url.pathname.startsWith(HERO_PATH)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request, { cache: "no-store" })
        .then((networkResp) => {
          // Guardar/actualizar en cache en segundo plano
          cache.put(event.request, networkResp.clone()).catch(()=>{});
          return networkResp;
        })
        .catch(() => null);

      // Si hay cache, devolvelo YA y actualizá de fondo
      if (cached) {
        // Disparar actualización de fondo sin bloquear la respuesta
        event.waitUntil(fetchPromise);
        return cached;
      }

      // Si no hay cache, probá red; si falla, devolvé un 404 controlado
      const network = await fetchPromise;
      return network || new Response("Imagen no disponible", { status: 404 });
    })());
  }
});
