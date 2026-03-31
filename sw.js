// TeamUp Service Worker
// Caches the app shell for offline use + instant load

const CACHE_NAME = 'teamup-v2';
// Use relative paths — works whether hosted at root or in a subdirectory
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
];

// ── Install: cache app shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// ── Activate: clear old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for Firebase, cache-first for shell ──────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always go network-first for Firebase / external APIs
  const isExternal =
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('stripe');

  if (isExternal) {
    event.respondWith(fetch(event.request).catch(() => new Response('')));
    return;
  }

  // App shell: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful GET responses for the shell
        if (
          response.ok &&
          event.request.method === 'GET' &&
          !url.pathname.includes('sw.js')
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback: serve index.html for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
      return new Response('Offline', { status: 503 });
    })
  );
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'TeamUp', body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'TeamUp', {
      body:    data.body  || '',
      icon:    './icons/icon-192.png',
      badge:   './icons/icon-192.png',
      data:    data.data  || {},
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data;
  // Use relative hash navigation
  const hash = data?.type === 'chat_message'   ? '#chat'     :
               data?.type === 'event_reminder' ? '#schedule' :
               data?.type === 'new_post'       ? '#home'     : '';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          if (hash) client.postMessage({ type: 'navigate', hash });
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow('./' + hash);
    })
  );
});
