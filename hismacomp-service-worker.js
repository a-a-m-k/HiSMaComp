const CACHE_VERSION = "v3";
const CACHE_NAME = `hismacomp-app-${CACHE_VERSION}`;
/** Enough for hashed JS/CSS chunks, icons, and HTML. GitHub Pages sends short browser TTL; we rewrite Cache-Control for hashed /assets when caching. */
const MAX_CACHE_SIZE = 200;
const INDEX_PATH = (() => {
  try {
    const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, "");
    return `${scopePath || ""}/index.html`;
  } catch {
    return "/index.html";
  }
})();

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

async function enforceCacheSizeLimit(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_CACHE_SIZE) {
    return;
  }

  const keysToDelete = keys.slice(0, keys.length - MAX_CACHE_SIZE);
  await Promise.all(keysToDelete.map((key) => cache.delete(key)));
}

function isStaticAsset(pathname) {
  const staticExtensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot"];
  const staticPaths = ["/assets/", "/icons/", "/favicon"];
  const pathWithoutQuery = pathname.split("?")[0].split("#")[0];
  return staticExtensions.some(ext => pathWithoutQuery.endsWith(ext)) || staticPaths.some(path => pathname.includes(path));
}

/** Vite build outputs hashed filenames under /assets/ (e.g. maplibre-ABC123.js). These are immutable; use cache-first for efficient cache lifetimes. */
function isHashedImmutableAsset(pathname) {
  const path = pathname.split("?")[0].split("#")[0];
  return /\/assets\/[^/]+\.(js|css|mjs)$/i.test(path);
}

/**
 * GitHub Pages serves hashed chunks with a short max-age. Lighthouse flags that.
 * Store a clone with a long immutable policy so cache hits (repeat visits) report efficient TTLs.
 */
function storageResponseForCache(request, response) {
  if (response?.status !== 200 || response.type !== "basic") {
    return response.clone();
  }
  let pathname;
  try {
    pathname = new URL(request.url).pathname;
  } catch {
    return response.clone();
  }
  if (!isHashedImmutableAsset(pathname)) {
    return response.clone();
  }
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(response.clone().body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
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
    event.request.url.includes("@react-refresh")
  ) {
    return;
  }

  let url;
  try {
    url = new URL(event.request.url);
  } catch (error) {
    return;
  }

  if (isStaticAsset(url.pathname)) {
    const useCacheFirst = isHashedImmutableAsset(url.pathname);
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response?.status === 200 && response.type === "basic") {
              const toStore = storageResponseForCache(event.request, response);
              cache.put(event.request, toStore.clone()).then(() => {
                enforceCacheSizeLimit(cache);
              });
              if (useCacheFirst) {
                return toStore.clone();
              }
            }
            return response;
          });

          if (cachedResponse) {
            // Hashed assets: cache-first (efficient cache lifetimes; no revalidation).
            // Other static: stale-while-revalidate (return cache, update in background).
            if (!useCacheFirst) fetchPromise.catch(() => {});
            return cachedResponse;
          }

          return fetchPromise.catch(() => {
            if (event.request.destination === "document") {
              return caches.match(INDEX_PATH);
            }
            return fetch(event.request);
          });
        });
      }),
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          const responseClone = response.clone();

          if (response?.status === 200 && response.type === "basic") {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone).then(() => {
                enforceCacheSizeLimit(cache);
              });
            });
          }
          return response;
        }).catch(() => {
          if (event.request.destination === "document") {
            return caches.match(INDEX_PATH);
          }
          return fetch(event.request);
        });
      }),
    );
  }
});
