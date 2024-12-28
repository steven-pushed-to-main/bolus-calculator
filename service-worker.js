self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("bolus-calculator-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./manifest.json",
        "./style.css", // Update with your CSS file path
        "./script.js", // Update with your JS file path
        "./icon-192.png",
        "./icon-512.png"
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
