// Service Worker pour JPSI PWA
// Version v1.3.38 - Offline complet pour toute l'application

const STATIC_CACHE = 'jpsi-static-v1.3.38';
const DYNAMIC_CACHE = 'jpsi-dynamic-v1.3.38';

// Toutes les pages de l'application
const ALL_PAGES = [
    '/',
    '/index.html',
    '/accueil.html',
    '/login.html',
    '/verification.html',
    '/newVerification.html',
    '/ongoingVerification.html',
    '/verificationDetail.html',
    '/verificationSummary.html',
    '/verificationHistory.html',
    '/verifSite.html',
    '/verifDes.html',
    '/extSite.html',
    '/extDetail.html',
    '/eclairageSite.html',
    '/eclairageDetail.html',
    '/alarmeSite.html',
    '/desenfumageList.html',
    '/desenfumageDetail.html',
    '/desenfumageInstallation.html',
    '/desenfumageHierarchie.html',
    '/clients.html',
    '/ListClients.html',
    '/addClient.html',
    '/editClient.html',
    '/client.html',
    '/sites.html',
    '/addSite.html',
    '/editSite.html',
    '/detailSite.html',
    '/audits.html',
    '/newAudit.html',
    '/auditDetail.html',
    '/auditHistory.html',
    '/inventairePDF.html',
    '/stocks.html',
    '/parametres.html',
    '/offline.html'
];

// Ressources à pré-cacher pour toute l'application
const STATIC_RESOURCES = [
    ...ALL_PAGES,
    '/styles.css',
    '/app.js',
    '/supabase-config.js',
    '/simple_auth.js',
    '/token_auth.js',
    '/js/indexedDB.js',
    '/js/syncManager.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icobm.png',
    '/img/logo.png',
    '/img/entete.png'
];

// Installation - Mettre en cache les ressources statiques
self.addEventListener('install', (evt) => {
    console.log('🔄 Service Worker: Installation v1.3.38 (scope complet)...');

    evt.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Mise en cache de toutes les ressources...');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('✅ Cache statique complet créé');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Erreur installation cache:', error);
            })
    );
});

// Activation - Nettoyer les anciens caches
self.addEventListener('activate', (evt) => {
    console.log('🔄 Service Worker: Activation v1.3.38 (scope complet)...');

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

    const isAppPath = (path) => {
        // correspond à toutes les pages de l'application
        return ALL_PAGES.includes(path) || path.includes('.html');
    };

    const isStaticResource = (reqUrl) => {
        const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
        for (const ext of staticExtensions) {
            if (reqUrl.includes(ext)) return true;
        }
        return STATIC_RESOURCES.some(res => reqUrl.endsWith(res));
    };

    const inAppScope = isAppPath(pathname) || STATIC_RESOURCES.some(p => request.url.endsWith(p));

    // Gérer toutes les pages de l'application
    if (!inAppScope) return;

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

    // Autres ressources dans le scope de l'app: Stale-While-Revalidate
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
        event.ports[0].postMessage({ version: 'v1.3.38' });
    }
});
console.log('✅ Service Worker chargé v1.3.38 (scope complet)');