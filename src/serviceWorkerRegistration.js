/**
 * ==============================================================================
 * Experiment 2 - Service Worker Registration Helper (Requirement d: PWA)
 * File: src/serviceWorkerRegistration.js
 * 
 * Safely registers public/sw.js in compatible browsers and provides
 * callbacks for successful registration or updates.
 * ==============================================================================
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // In local development, unregister any stale service workers that intercept Vite modules
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    if (isLocalhost && window.location.port !== '') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      }).catch(() => {});
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.info('[PWA] Service Worker registered successfully with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.info('[PWA] New content available; please refresh to update.');
                } else {
                  console.info('[PWA] Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker unregister error:', error);
      });
  }
}
