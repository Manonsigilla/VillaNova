// sw.js - VillaNova Service Worker
// Cache-First pour les assets statiques, Network-First pour l'API

const CACHE_NAME = 'villanova-v1';

const STATIC_ASSETS = [
    '/frontend/html/index.html',
    '/frontend/html/login.html',
    '/frontend/html/event-detail.html',
    '/frontend/html/contact.html',
    '/frontend/html/politique.html',
    '/frontend/css/main.css',
    '/frontend/js/main.js',
    '/frontend/js/ui.js',
    '/frontend/js/api.js',
    '/frontend/js/auth.js',
    '/frontend/js/event-detail.js',
    '/frontend/js/eventTransformer.js',
    '/frontend/images/logo_villanova.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Network-First : API Flask et ressources externes (images.weserv.nl, Google Fonts)
    if (
        url.hostname === '127.0.0.1' ||
        url.hostname === 'localhost' ||
        url.hostname === 'images.weserv.nl' ||
        url.hostname === 'fonts.googleapis.com' ||
        url.hostname === 'fonts.gstatic.com'
    ) {
        event.respondWith(
            fetch(request)
                .then(response => response)
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache-First : assets statiques locaux
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                return response;
            });
        })
    );
});
