const CACHE_NAME = 'expense-tracker-v1.2.0';
const ASSETS = [
    './',
    './index.html',
    './css/base.css',
    './css/themes.css',
    './css/components.css',
    './css/layout.css',
    './js/app.js',
    './js/storage.js',
    './js/utils.js',
    './js/models.js',
    './js/ui.js',
    './js/charts.js',
    './js/recurring.js',
    './js/csv.js',
    './js/pwa.js',
    './js/vendor/chart.umd.min.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Only handle same-origin requests; let anything else fall through to the network.
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    // Navigation requests: network-first, fall back to the cached shell offline.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Static assets: cache-first, then network (and cache the result).
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response && response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                }
                return response;
            });
        })
    );
});