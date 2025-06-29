const CACHE_NAME = 'aniguide-v2';
const STATIC_CACHE = 'aniguide-static-v2';
const DYNAMIC_CACHE = 'aniguide-dynamic-v2';
const API_CACHE = 'aniguide-api-v2';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/attached_assets/anime-hero-image_1751209694703.webp',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

const API_ENDPOINTS = [
  '/api/anime/trending',
  '/api/anime/popular',
  '/api/anime/airing',
  '/api/anime/upcoming',
  '/api/anime/top-rated',
  '/api/anime/all-time-popular'
];

// Install event - cache static assets and API endpoints
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(API_CACHE).then(cache => cache.addAll(API_ENDPOINTS))
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline, with network-first strategy for API calls
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          if (response.status === 200) {
            caches.open(API_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response(
                JSON.stringify({ error: 'Offline - data not available' }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if it's not a successful response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response before caching
            const responseClone = response.clone();
            
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            
            return response;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    const cache = await caches.open(API_CACHE);
    for (const endpoint of API_ENDPOINTS) {
      const response = await fetch(endpoint);
      if (response.ok) {
        await cache.put(endpoint, response.clone());
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notifications support
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New anime updates available!',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"%3E%3Cstop offset="0%" style="stop-color:%239C0D38;stop-opacity:1" /%3E%3Cstop offset="100%" style="stop-color:%23DAD2D8;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx="96" cy="96" r="80" fill="url(%23grad)"/%3E%3Cpolygon fill="%2306070E" points="72,64 128,96 72,128"/%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"%3E%3Ccircle cx="36" cy="36" r="32" fill="%239C0D38"/%3E%3Cpolygon fill="%2306070E" points="28,24 48,36 28,48"/%3E%3C/svg%3E',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239C0D38"%3E%3Cpath d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/%3E%3C/svg%3E'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/%3E%3C/svg%3E'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('AniGuide', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for data updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'anime-data-sync') {
    event.waitUntil(syncAnimeData());
  }
});

async function syncAnimeData() {
  try {
    const cache = await caches.open(API_CACHE);
    
    for (const endpoint of API_ENDPOINTS) {
      const response = await fetch(endpoint);
      if (response.ok) {
        await cache.put(endpoint, response.clone());
      }
    }
    
    // Notify clients of updated data
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'DATA_UPDATED' });
    });
  } catch (error) {
    console.log('Periodic sync failed:', error);
  }
}

// Share Target API support
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHARE_TARGET') {
    event.waitUntil(
      clients.openWindow('/?shared=' + encodeURIComponent(event.data.url))
    );
  }
});
