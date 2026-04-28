const CACHE = 'gow-worksheets-v1';
const ASSETS = [
  '/lfl-ppm/',
  '/lfl-ppm/index.html',
  '/lfl-ppm/manifest.json',
  '/lfl-ppm/gow-logo.webp',
  '/lfl-ppm/ladrillos-logo.png',
  '/lfl-ppm/mswebb-logo.png',
  '/lfl-ppm/icon-192.png',
  '/lfl-ppm/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for API calls, cache first for static assets
  const url = new URL(e.request.url);
  if (url.hostname.includes('supabase.co')) {
    // Always network for Supabase — never cache auth/data
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
