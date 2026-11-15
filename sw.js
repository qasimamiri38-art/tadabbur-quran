const CACHE = "tadabbur-quran-v3";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isAppRequest = url.origin === self.location.origin;
  const isQuranApi = url.origin === "https://api.alquran.cloud";
  if (!isAppRequest && !isQuranApi) return;

  // API requests must never receive index.html as a fallback; that is invalid JSON.
  if (isQuranApi) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        return cached || new Response(JSON.stringify({
          code: 503,
          status: "offline",
          message: "این داده در حالت آفلاین در دسترس نیست. اتصال اینترنت را بررسی کنید."
        }), { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } });
      }
    })());
    return;
  }

  // App shell: prefer the latest network version, use cached files when offline.
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && request.destination !== "document") {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") return (await caches.match("./index.html")) || Response.error();
      return Response.error();
    }
  })());
});
