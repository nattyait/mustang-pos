const CACHE_NAME = "mustang-pos-v72";
const ASSETS = [
  "./",
  "./index.html",
  "./admin/",
  "./admin/index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/mustang-logo.png",
  "./assets/receipt-horse-line.png",
  "./assets/transfer-qr-promptpay.jpg",
  "./assets/nutella-oreo-fresh-milk.png",
  "./assets/nutella-coffee-latte.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
