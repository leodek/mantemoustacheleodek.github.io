// sw.js — cache hero images (stale-while-revalidate)
const CACHE_NAME = "mm-hero-v1";
const HERO_PATH  = "/images/hero/";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo interceptamos imágenes de la carpeta /images/hero/
  if (url.pathname.startsWith(HERO_PATH)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request, { cache: "no-store" })
        .then((networkResp) => {
          cache.put(event.request, networkResp.clone()).catch(()=>{});
          return networkResp;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(fetchPromise); // actualiza en segundo plano
        return cached;
      }

      const network = await fetchPromise;
      return network || new Response("Imagen no disponible", { status: 404 });
    })());
  }
});
