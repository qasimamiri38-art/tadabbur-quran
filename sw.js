importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
const CACHE = "tadabbur-quran-v36";
const APP_SHELL = [
  "./",
  "./index.html",
  "./tv-display.js",
  "./tv-connect.js",
  "./tv-receiver.html",
  "./tv-cast-config.js",
  "./manifest.webmanifest",
  "./icon-512.png",
  "./hero-quran.png",
  "./qari-audio-fix.js",
  "./qari-list-design.js",
  "./short-adhan-playback.js?v=20261127-4",
];

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
