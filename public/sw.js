// RestoPulse Offline-First Service Worker
const CACHE_NAME = "restopulse-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/app",
  "/app/billing",
  "/login",
  "/manifest.json",
  "/favicon.ico"
];

// Install: Cache core application shell and skip waiting immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate: Delete ALL legacy caches immediately and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-First Strategy
// Always fetch fresh bundle from the server first! Only fallback to cache if completely offline.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Bypass external APIs, Neon SQL endpoints, or dev tools
  if (url.pathname.includes("/sql") || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Only return cached copy if the network is completely down (Offline mode)
        return caches.match(event.request);
      })
  );
});

