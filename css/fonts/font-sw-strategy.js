// Font caching strategy for Service Worker
const FONT_CACHE_NAME = 'fonts-v1';
const FONT_URLS = [
  '/fonts/pretendardvariable-400.woff2',
  '/fonts/pretendardvariable-500.woff2',
  '/fonts/pretendardvariable-600.woff2',
  '/fonts/pretendardvariable-700.woff2',
];

// Install event - cache critical fonts
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(FONT_CACHE_NAME).then((cache) => cache.addAll(FONT_URLS)));
});

// Fetch event - serve fonts from cache
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'font') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        // If not in cache, fetch and cache
        return fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(FONT_CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        });
      })
    );
  }
});
