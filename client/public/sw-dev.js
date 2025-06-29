// Development service worker - minimal functionality to avoid interference
const CACHE_NAME = 'aniguide-dev-v1';

self.addEventListener('install', (event) => {
  console.log('[SW Dev] Service worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW Dev] Service worker activating');
  event.waitUntil(self.clients.claim());
});

// In development, pass through all requests without caching
self.addEventListener('fetch', (event) => {
  // Let all requests pass through normally in development
  return;
});

self.addEventListener('message', (event) => {
  console.log('[SW Dev] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});