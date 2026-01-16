
const CACHE_NAME = 'bribiesca-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  'https://tritex.com.mx/Bribiesca%20logo%2002.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
