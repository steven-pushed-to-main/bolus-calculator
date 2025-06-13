self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('bolus-calculator-v2').then(cache =>
      cache.addAll([
        './',
        './index.html',
        './settings_page.html',
        './log_graph_page.html',
        './manifest.json',
        './icon-192.png',
        './icon-512.png',
        './timeUtils.js'
      ])
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
