const CACHE_VERSION = 'aniguide-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const OFFLINE_PAGE = '/offline.html';

// Essential static assets for offline functionality
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  OFFLINE_PAGE
];

// API endpoints to cache for offline access
const CACHEABLE_API_PATTERNS = [
  /^\/api\/anime\/(trending|popular|airing)/,
  /^\/api\/cache\/status/,
  /^\/api\/auth\/user/
];

// Install - cache essential assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate - clean old caches and claim clients
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim(),
      // Initialize background sync
      self.registration.sync ? self.registration.sync.register('background-sync') : Promise.resolve()
    ])
  );
});

// Fetch - handle requests with caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }

  // API requests - cache with network fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Static assets and pages - cache first
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with intelligent caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Always try network first for API requests
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      if (CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
    
    throw new Error(`API request failed: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for specific endpoints
    if (url.pathname.includes('/api/anime/')) {
      return new Response(
        JSON.stringify({
          data: { Page: { media: [] } },
          offline: true,
          message: 'Offline - cached data not available'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Generic offline response
    return new Response(
      JSON.stringify({ error: 'Offline - data not available', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache static assets
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error(`Static request failed: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Failed to fetch static resource:', request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match(OFFLINE_PAGE);
      return offlineResponse || new Response('Offline', { status: 200 });
    }
    
    // Return empty response for other resources
    return new Response('', { status: 404 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
  
  if (event.tag === 'anime-data-sync') {
    event.waitUntil(syncAnimeData());
  }
});

// Perform background sync operations
async function doBackgroundSync() {
  console.log('[SW] Performing background sync...');
  
  try {
    // Sync pending reviews
    await syncOfflineReviews();
    
    // Sync watchlist changes
    await syncWatchlistChanges();
    
    // Update anime cache
    await refreshAnimeCache();
    
    console.log('[SW] Background sync completed successfully');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error; // Retry sync
  }
}

// Sync offline reviews when back online
async function syncOfflineReviews() {
  const pendingReviews = await getStoredData('pendingReviews') || [];
  
  for (const review of pendingReviews) {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      
      if (response.ok) {
        // Remove synced review from pending list
        const updatedReviews = pendingReviews.filter(r => r.id !== review.id);
        await setStoredData('pendingReviews', updatedReviews);
      }
    } catch (error) {
      console.error('[SW] Failed to sync review:', error);
    }
  }
}

// Sync offline watchlist changes
async function syncWatchlistChanges() {
  const pendingWatchlist = await getStoredData('pendingWatchlist') || [];
  
  for (const item of pendingWatchlist) {
    try {
      const response = await fetch('/api/watchlist', {
        method: item.action === 'delete' ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        // Remove synced item from pending list
        const updatedWatchlist = pendingWatchlist.filter(w => w.id !== item.id);
        await setStoredData('pendingWatchlist', updatedWatchlist);
      }
    } catch (error) {
      console.error('[SW] Failed to sync watchlist item:', error);
    }
  }
}

// Refresh anime cache in background
async function refreshAnimeCache() {
  const endpoints = [
    '/api/anime/trending',
    '/api/anime/popular',
    '/api/anime/airing'
  ];
  
  const cache = await caches.open(API_CACHE);
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        await cache.put(endpoint, response.clone());
      }
    } catch (error) {
      console.log('[SW] Failed to refresh cache for:', endpoint);
    }
  }
}

// Sync specific anime data
async function syncAnimeData() {
  console.log('[SW] Syncing anime data...');
  
  try {
    // Force refresh trending anime
    const response = await fetch('/api/cache/refresh', { method: 'POST' });
    if (response.ok) {
      console.log('[SW] Anime data sync completed');
      
      // Notify all clients about updated data
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'ANIME_DATA_UPDATED',
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('[SW] Anime data sync failed:', error);
    throw error;
  }
}

// Push notifications
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New anime updates available!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ],
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'AniGuide',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default click action
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'anime-updates') {
    event.waitUntil(syncAnimeData());
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ANIME_DATA') {
    event.waitUntil(
      caches.open(API_CACHE).then(cache => {
        return cache.put('/api/anime/trending', new Response(JSON.stringify(event.data.data)));
      })
    );
  }
  
  if (event.data && event.data.type === 'STORE_OFFLINE_ACTION') {
    event.waitUntil(handleOfflineAction(event.data.action));
  }
});

// Handle offline actions
async function handleOfflineAction(action) {
  if (action.type === 'REVIEW') {
    const pendingReviews = await getStoredData('pendingReviews') || [];
    pendingReviews.push({
      ...action.data,
      id: Date.now(),
      timestamp: Date.now()
    });
    await setStoredData('pendingReviews', pendingReviews);
    
    // Register for background sync
    if (self.registration.sync) {
      await self.registration.sync.register('background-sync');
    }
  }
  
  if (action.type === 'WATCHLIST') {
    const pendingWatchlist = await getStoredData('pendingWatchlist') || [];
    pendingWatchlist.push({
      ...action.data,
      id: Date.now(),
      timestamp: Date.now()
    });
    await setStoredData('pendingWatchlist', pendingWatchlist);
    
    // Register for background sync
    if (self.registration.sync) {
      await self.registration.sync.register('background-sync');
    }
  }
}

// Utility functions for storage
async function getStoredData(key) {
  try {
    const cache = await caches.open('aniguide-storage');
    const response = await cache.match(`/storage/${key}`);
    if (response) {
      const data = await response.json();
      return data.value;
    }
    return null;
  } catch (error) {
    console.error('[SW] Failed to get stored data:', error);
    return null;
  }
}

async function setStoredData(key, value) {
  try {
    const cache = await caches.open('aniguide-storage');
    const response = new Response(JSON.stringify({ value, timestamp: Date.now() }), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`/storage/${key}`, response);
  } catch (error) {
    console.error('[SW] Failed to set stored data:', error);
  }
}

console.log('[SW] AniGuide service worker loaded');