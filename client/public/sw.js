// Basic Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', event => {
  // Optional: Add caching logic here
  event.respondWith(fetch(event.request));
});