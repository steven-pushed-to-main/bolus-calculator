self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("bolus-calculator-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./settings_page.html",
        "./log_graph_page.html",
        "./manifest.json",
        "./icon-192.png",
        "./icon-512.png",
        "./timeUtils.js",
        "https://cdn.jsdelivr.net/npm/chart.js"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
