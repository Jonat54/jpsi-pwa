// Service Worker pour JPSI PWA
// Version v1.3.36 - Offline ciblé pour la branche Vérification uniquement

const STATIC_CACHE = 'jpsi-verif-static-v1.3.36';
const DYNAMIC_CACHE = 'jpsi-verif-dynamic-v1.3.36';

// Pages de la branche Vérification (et adjacentes confirmées)
const VERIF_PAGES = [
    '/verification.html',
    '/newVerification.html',
    '/ongoingVerification.html',
    '/verificationDetail.html',
    '/verificationSummary.html',
    '/verificationHistory.html',
    '/verifSite.html',
    '/verifDes.html',

    // Adjacent: Extincteurs
    '/extSite.html',
    '/extDetail.html',
    // Adjacent: Éclairage
    '/eclairageSite.html',
    '/eclairageDetail.html',
    // Adjacent: Alarme
    '/alarmeSite.html',
    // Adjacent: Désenfumage
    '/desenfumageList.html',
    '/desenfumageDetail.html',
    '/desenfumageInstallation.html',
    '/desenfumageHierarchie.html'
];

// Ressources à pré-cacher pour la branche Vérification
const STATIC_RESOURCES = [
    ...VERIF_PAGES,
    '/offline.html',
    '/styles.css',
    '/app.js',
    '/supabase-config.js',
    '/simple_auth.js',
    '/js/indexedDB.js',
    '/js/syncManager.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/img/logo.png'
];

// Installation - Mettre en cache les ressources statiques
self.addEventListener('install', (evt) => {
    console.log('🔄 Service Worker: Installation v1.3.36 (scope Vérification)...');

    evt.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Mise en cache des ressources Vérification...');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('✅ Cache statique (Vérification) créé');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Erreur installation cache Vérification:', error);
            })
    );
});

// Activation - Nettoyer les anciens caches
self.addEventListener('activate', (evt) => {
    console.log('🔄 Service Worker: Activation v1.3.36 (scope Vérification)...');

    evt.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                        return null;
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activé');
                return self.clients.claim();
            })
    );
});

// Interception des requêtes - Stratégie "Cache First" pour les ressources statiques
self.addEventListener('fetch', (evt) => {
    const request = evt.request;
    const url = new URL(request.url);

    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') return;

    // Ignorer les requêtes vers Supabase
    if (url.hostname.includes('supabase.co')) return;

    const pathname = url.pathname;

    const isVerificationPath = (path) => {
        // correspond à nos pages de vérification ou toute URL contenant "verification"
        return VERIF_PAGES.includes(path) || path.includes('verification');
    };

    const isStaticResource = (reqUrl) => {
        const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
        for (const ext of staticExtensions) {
            if (reqUrl.includes(ext)) return true;
        }
        return STATIC_RESOURCES.some(res => reqUrl.endsWith(res));
    };

    const inVerificationScope = isVerificationPath(pathname) || STATIC_RESOURCES.some(p => request.url.endsWith(p));

    // Ne gérer que la branche Vérification; le reste passe au réseau
    if (!inVerificationScope) return;

    // Documents (pages): Network First avec fallback cache -> offline.html
    if (request.destination === 'document') {
        evt.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(request).then(cached => cached || caches.match('/offline.html'))
                )
        );
        return;
    }

    // Assets: Cache First avec revalidation
    if (isStaticResource(request.url)) {
        evt.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) return cachedResponse;
                return fetch(request)
                    .then(response => {
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(STATIC_CACHE).then(cache => cache.put(request, responseClone));
                        }
                        return response;
                    })
                    .catch(() => caches.match('/offline.html'));
            })
        );
        return;
    }

    // Autres ressources dans le scope Vérification: Stale-While-Revalidate
    evt.respondWith(
        caches.match(request).then(cachedResponse => {
            const fetchPromise = fetch(request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => undefined);
            return cachedResponse || fetchPromise;
        })
    );
});

// Fonction pour identifier les ressources statiques
// Note: Détection des ressources statiques intégrée dans l'événement fetch ci-dessus

// Gestion des messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: 'v1.3.36' });
    }
});
console.log('✅ Service Worker chargé v1.3.36 (scope Vérification)');