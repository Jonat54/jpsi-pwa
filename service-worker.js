// Service Worker pour JPSI PWA
// Version v1.3.35 - Cache et mode offline activé

const CACHE_NAME = 'jpsi-cache-v1.3.35';
const STATIC_CACHE = 'jpsi-static-v1.3.35';
const DYNAMIC_CACHE = 'jpsi-dynamic-v1.3.35';

// Ressources à mettre en cache immédiatement
const STATIC_RESOURCES = [
    '/',
    '/index.html',
    '/accueil.html',
    '/styles.css',
    '/app.js',
    '/supabase-config.js',
    '/manifest.json',
    '/js/indexedDB.js',
    '/js/syncManager.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/img/logo.png',
    '/img/entete.png'
];

// Installation - Mettre en cache les ressources statiques
self.addEventListener('install', (evt) => {
    console.log('🔄 Service Worker: Installation v1.3.35...');
    
    evt.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Mise en cache des ressources statiques...');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('✅ Cache statique créé');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Erreur installation cache:', error);
            })
    );
});

// Activation - Nettoyer les anciens caches
self.addEventListener('activate', (evt) => {
    console.log('🔄 Service Worker: Activation v1.3.35...');
    
    evt.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
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
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorer les requêtes vers Supabase
    if (url.hostname.includes('supabase.co')) {
        return;
    }
    
    // Stratégie pour les ressources statiques
    if (isStaticResource(request.url)) {
        evt.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        console.log('📦 Ressource servie depuis le cache:', request.url);
                        return cachedResponse;
                    }
                    
                    // Si pas en cache, récupérer depuis le réseau
                    return fetch(request)
                        .then(response => {
                            // Mettre en cache si la réponse est valide
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch(error => {
                            console.error('❌ Erreur récupération ressource:', error);
                            // Retourner une page d'erreur offline si possible
                            return caches.match('/offline.html');
                        });
                })
        );
    }
    
    // Stratégie pour les pages HTML - "Network First" avec fallback cache
    else if (request.destination === 'document') {
        evt.respondWith(
            fetch(request)
                .then(response => {
                    // Mettre en cache la réponse
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(error => {
                    console.log('❌ Hors ligne, utilisation du cache pour:', request.url);
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Page d'erreur offline
                            return caches.match('/offline.html');
                        });
                })
        );
    }
    
    // Stratégie pour les autres ressources - "Stale While Revalidate"
    else {
        evt.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    const fetchPromise = fetch(request)
                        .then(response => {
                            // Mettre en cache si valide
                            if (response && response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(DYNAMIC_CACHE)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch(error => {
                            console.error('❌ Erreur réseau:', error);
                        });
                    
                    return cachedResponse || fetchPromise;
                })
        );
    }
});

// Fonction pour identifier les ressources statiques
function isStaticResource(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
    const staticPaths = ['/styles.css', '/app.js', '/supabase-config.js', '/manifest.json', '/js/', '/icons/', '/img/'];
    
    // Vérifier les extensions
    for (const ext of staticExtensions) {
        if (url.includes(ext)) return true;
    }
    
    // Vérifier les chemins
    for (const path of staticPaths) {
        if (url.includes(path)) return true;
    }
    
    return false;
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: 'v1.3.35' });
    }
});

console.log('✅ Service Worker chargé v1.3.35'); 