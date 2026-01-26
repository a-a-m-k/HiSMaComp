const CACHE_VERSION = "v4";
const CACHE_NAME = `hismacomp-app-${CACHE_VERSION}`;
const MAX_CACHE_SIZE = 100;

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
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response?.status === 200 && response.type === "basic") {
              const responseClone = response.clone();
              cache.put(event.request, responseClone).then(() => {
                enforceCacheSizeLimit(cache);
              });
            }
            return response;
          });

          if (cachedResponse) {
            // Silently ignore background fetch errors - stale-while-revalidate pattern
            // returns cached response immediately, updates cache in background
            fetchPromise.catch(() => {});
            return cachedResponse;
          }

          return fetchPromise.catch(() => {
            if (event.request.destination === "document") {
              return caches.match("/HiSMaComp/index.html");
            }
            return undefined;
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
            return caches.match("/HiSMaComp/index.html");
          }
          return undefined;
        });
      }),
    );
  }
});
