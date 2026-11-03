// RestoPulse Offline-First Service Worker
const CACHE_NAME = "restopulse-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/app",
  "/app/billing",
  "/login",
  "/manifest.json",
  "/favicon.ico"
];

// Install: Cache core application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate Strategy
// If offline, serve directly from cache so Airplane Mode works!
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // Bypass external APIs or Neon SQL endpoints
  if (url.pathname.includes("/sql") || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
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
          // Network failed (Offline / Airplane mode)
          // If we had a cached version, it was already served or return cached
          return cachedResponse;
        });

      // Serve from cache if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
