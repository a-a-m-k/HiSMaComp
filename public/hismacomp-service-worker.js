const CACHE_VERSION = "v3";
const CACHE_NAME = `hismacomp-app-${CACHE_VERSION}`;
const MAX_CACHE_SIZE = 100; // Maximum number of cached items

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

/**
 * Implements LRU-style cache eviction when cache exceeds MAX_CACHE_SIZE
 */
async function enforceCacheSizeLimit(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_CACHE_SIZE) {
    return;
  }

  // Sort by timestamp if available, otherwise use FIFO (first in, first out)
  // Since Cache API doesn't provide timestamps, we'll use FIFO eviction
  const keysToDelete = keys.slice(0, keys.length - MAX_CACHE_SIZE);
  await Promise.all(keysToDelete.map((key) => cache.delete(key)));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  if (
    event.request.url.includes("__vite") ||
    event.request.url.includes("node_modules") ||
    event.request.url.includes("@react-refresh") ||
    event.request.url.includes("favicon") ||
    event.request.url.includes("/icons/") ||
    event.request.url.includes("manifest.json")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (response?.status === 200 && response.type === "basic") {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone()).then(() => {
              // Enforce cache size limit after adding new item
              enforceCacheSizeLimit(cache);
            });
          });
        }
        return response;
      })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/HiSMaComp/index.html");
          }
          return undefined;
        });
    }),
  );
});
