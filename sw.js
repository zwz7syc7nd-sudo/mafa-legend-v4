// Mafa Legend cache reset service worker
const RESET_CACHE_VERSION = 'mafa-v4-reset-20261004';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  // Network only: do not serve any old cached game files.
  event.respondWith(fetch(event.request));
});
