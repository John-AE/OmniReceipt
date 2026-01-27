const CACHE_NAME = 'naijareceipt-v1.0.2';
const urlsToCache = ['/'];

// Routes that should never be cached (auth-protected routes)
const noCacheRoutes = ['/dashboard', '/admin-dashboard', '/profile', '/customers', '/create-invoice', '/create-quotation', '/auth'];

self.addEventListener('install', event => {
  // Force immediate activation
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Never cache protected routes - always fetch from network
  if (noCacheRoutes.some(route => url.pathname.startsWith(route))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
