/**
 * ============================================================================
 * Service Worker - FUDMA Group 14 Weather App (PWA)
 * Course: GET 411 Artificial Intelligence Mini Project
 * ============================================================================
 * 
 * Strategy:
 * - Versioned Cache for Application Shell & Static UI Resources.
 * - Cache-First for static assets (HTML, CSS, JS, local icons/SVGs).
 * - Live Network-First for meteorological API queries (/api/weather).
 * - NEVER permanently caches live weather API responses or sensitive data.
 * - Friendly offline fallback when network is unavailable.
 */

const CACHE_NAME = 'fudma-weather-shell-v1.0.3';

// Core static assets required to render the application shell offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/css/style.css',
  '/js/config.js',
  '/js/app.js',
  '/assets/images/weather-logo.svg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable-192.png',
  '/assets/icons/icon-maskable-512.png',
  '/assets/icons/apple-touch-icon.png'
];

/**
 * INSTALL EVENT:
 * Pre-cache all application shell static resources into the versioned cache.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching application shell assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

/**
 * ACTIVATE EVENT:
 * Clean up outdated caches from previous deployments to ensure fresh shell.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/**
 * FETCH EVENT:
 * Differentiate between API requests and static shell resources.
 */
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Only handle HTTP/HTTPS GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 1. LIVE WEATHER API REQUESTS (/api/weather)
  // MUST NEVER be permanently cached or fabricated. Always query live server.
  if (requestUrl.pathname.startsWith('/api/weather')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Provide friendly offline JSON response when network is disconnected
        return new Response(
          JSON.stringify({
            error: "You are currently offline. Live weather information requires an internet connection.",
            offline: true
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, no-cache, must-revalidate"
            }
          }
        );
      })
    );
    return;
  }

  // 2. STATIC SHELL ASSETS & PAGE NAVIGATION
  // Cache-first strategy with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache newly fetched same-origin static resources dynamically
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          requestUrl.origin === self.location.origin
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation requests to ensure shell loads
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
      });
    })
  );
});
