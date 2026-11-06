const V = "v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "vendor/leaflet.js", "tashkent/", "tashkent/index.html", "tashkent/basemap.jpg", "samarkand/", "samarkand/index.html", "samarkand/basemap.jpg", "tashkent/basemap-wide.jpg", "samarkand/basemap-wide.jpg"];
self.addEventListener("install", e => { e.waitUntil(caches.open("shell-" + V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("shell-") && k !== "shell-" + V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isPage = e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  if (isPage) {  // network first for pages so updates arrive, cache fallback offline
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open("shell-" + V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && (url.origin === location.origin || url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com"))) {
      const c = r.clone(); caches.open(url.pathname.includes("/audio/") ? "audio-v1" : "shell-" + V).then(x => x.put(e.request, c));
    }
    return r;
  })));
});
