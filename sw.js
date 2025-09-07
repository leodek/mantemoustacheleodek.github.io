// sw.js — cache /Imágenes/hero/* (maneja tilde y codificación) con stale-while-revalidate
const CACHE_NAME = "mm-hero-v3";
const HERO_PATHS = ["/Imágenes/hero/", "/Im%C3%A1genes/hero/"]; // rutas posibles

// PNG 1x1 transparente de fallback
const TRANSPARENT_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABiYt2nQAAAABJRU5ErkJggg==";

self.addEventListener("install", (event) => {
  // Activar inmediatamente la nueva versión
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo interceptamos imágenes dentro de /Imágenes/hero/ (con y sin codificación)
  if (HERO_PATHS.some(p => url.pathname.startsWith(p))) {
    event.respondWith((async () => {
