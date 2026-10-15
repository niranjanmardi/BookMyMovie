/**
 * ==============================================================================
 * Experiment 2 - Basic PWA Service Worker (Requirement d)
 * File: public/sw.js
 * 
 * Features:
 * 1. Pre-caching static app shell (HTML, manifest, icons)
 * 2. Cache-first strategy for static assets & images
 * 3. Network-first strategy with cache fallback for navigation routes
 * 4. Offline resilience: app remains accessible without internet connection
 * 5. Automatic cleanup of outdated cache versions during activation
 * ==============================================================================
 */

const CACHE_NAME = 'bookmymovie-pwa-v1';

// Static assets to pre-cache on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/bookmymovie-icon.svg',
];

// 1. Install Event: Cache app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Activate worker immediately without waiting for existing clients to close
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('[PWA SW] Pre-caching warning:', err);
      })
  );
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
            return null;
          })
        );
      })
      .then(() => {
        // Take control of all open pages immediately
        return self.clients.claim();
      })
  );
});

// 3. Fetch Event: Serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extension schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // A. Static assets & Images: Cache-First strategy
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If image fails offline, try fallback icon
            if (request.destination === 'image') {
              return caches.match('/bookmymovie-icon.svg');
            }
          });
      })
    );
    return;
  }

  // B. HTML Navigation / Page routes: Network-First with Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          // Fallback to cached index.html for Single Page Application routing
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Default: Network with Cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
