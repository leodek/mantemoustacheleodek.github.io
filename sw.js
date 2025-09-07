// sw.js — Cache para imágenes del hero (con y sin acento codificado) + shell básico
const CACHE_NAME = "mm-hero-v4";
const HERO_PATHS = ["/Imágenes/hero/", "/Im%C3%A1genes/hero/"]; // ambas variantes
const SHELL = [
  "/", "/index.html",
];

// PNG 1x1 transparente (placeholder)
const TRANSPARENT_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABiYt2nQAAAABJRU5ErkJggg==";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Utilidad: ¿la URL apunta a /Imágenes/hero/ (o su variante codificada)?
function isHeroImage(url) {
  try {
    const u = new URL(url);
    return HERO_PATHS.some(p => u.pathname.startsWith(p));
  } catch { return false; }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // Estrategia para el shell: network-first con fallback a cache
  if (SHELL.some(p => url.endsWith(p))) {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Imágenes del hero: stale-while-revalidate
  if (isHeroImage(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkRes) => {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return networkRes;
          })
          .catch(() => cached || new Response(TRANSPARENT_PNG));
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Resto: passthrough por defecto (o podés sumar más reglas)
});
