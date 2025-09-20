// Service Worker pour JPSI PWA - Optimisé iPadOS/Safari
// Version v1.4.39 - Fix Mode Offline iPad Safari

const STATIC_CACHE = 'jpsi-static-v1.4.39';
const DYNAMIC_CACHE = 'jpsi-dynamic-v1.4.39';
const FALLBACK_CACHE = 'jpsi-fallback-v1.4.39';

// Pages ESSENTIELLES pour le terrain (intervention)
const ALL_PAGES = [
    // Pages de base
    '/index.html',
    '/accueil.html',
    '/login.html',
    '/offline.html',
    
    // Vérifications des équipements (ESSENTIEL)
    '/verification.html',
    '/newVerification.html',
    '/ongoingVerification.html',
    '/verificationDetail.html',
    '/verificationSummary.html',
    
    // Équipements à vérifier
    '/verifSite.html',
    '/verifDes.html',
    '/extSite.html',
    '/extDetail.html',
    '/eclairageSite.html',
    '/eclairageDetail.html',
    '/alarmeSite.html',
    '/desenfumageList.html',
    '/desenfumageDetail.html',
    '/verifAlarme.html',
    
    // Navigation clients/sites (pour accéder aux équipements)
    '/ListClients.html',
    '/detailSite.html',
    
    // Page de test
    '/test-offline-ipad.html'
];

// Ressources statiques critiques
const STATIC_RESOURCES = [
    '/styles.css',
    '/app.js',
    '/supabase-config.js',
    '/simple_auth.js',
    '/js/indexedDB.js',
    '/js/networkStatus.js',
    '/js/syncManager.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/icobm.png',
    '/img/logo.png',
    '/img/entete.png'
];

// Pages de fallback en ordre de priorité
const FALLBACK_PAGES = [
    '/accueil.html',
    '/offline.html',
    '/index.html'
];

// Utilitaires
const utils = {
    // Vérifier si c'est une page de l'app
    isAppPage: (pathname) => ALL_PAGES.includes(pathname),
    
    // Vérifier si c'est une ressource statique
    isStaticResource: (url) => {
        const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
        return staticExtensions.some(ext => url.includes(ext)) || 
               STATIC_RESOURCES.some(res => url.endsWith(res));
    },
    
    // Vérifier si c'est une requête à ignorer (Supabase, CDN, etc.)
    shouldIgnoreRequest: (url) => {
        // Ignorer Supabase
        if (url.hostname.includes('supabase.co')) return true;
        
        // Ignorer les CDN externes
        if (url.hostname.includes('cdn.jsdelivr.net')) return true;
        if (url.hostname.includes('unpkg.com')) return true;
        if (url.hostname.includes('jsdelivr.net')) return true;
        
        // Ignorer les requêtes non-HTTP/HTTPS
        if (!url.protocol.startsWith('http')) return true;
        
        // Ignorer les requêtes vers des domaines externes
        // (le service worker ne gère que les ressources de son propre domaine)
        if (url.hostname !== self.location.hostname) return true;
        
        // Ignorer les requêtes vers des chemins non gérés
        if (url.pathname === '/offline') return true;
        
        return false;
    },
    
    // Gestion d'erreur du cache.addAll avec retry individuel
    async cacheAddAllWithRetry(cache, resources) {
        const results = [];
        for (const resource of resources) {
            try {
                // Éviter de stocker des réponses redirigées
                const response = await fetch(resource, { redirect: 'follow' });
                if (!response || !response.ok) {
                    results.push({ resource, success: false, error: new Error('HTTP ' + (response && response.status)) });
                    continue;
                }

                let responseToCache = response;
                if (response.redirected) {
                    const body = await response.blob();
                    const headers = new Headers();
                    // Conserver uniquement les en-têtes utiles, éviter Location
                    const contentType = response.headers.get('Content-Type');
                    if (contentType) headers.set('Content-Type', contentType);
                    responseToCache = new Response(body, { status: 200, headers });
                }
                await cache.put(resource, responseToCache);
                results.push({ resource, success: true });
            } catch (error) {
                console.warn(`⚠️ Échec cache pour ${resource}:`, error);
                results.push({ resource, success: false, error });
            }
        }
        return results;
    },
    
    // Fallback en chaîne pour les pages
    async getFallbackPage() {
        for (const fallbackPage of FALLBACK_PAGES) {
            try {
                const response = await caches.match(fallbackPage);
                if (response) return response;
            } catch (error) {
                console.warn(`⚠️ Fallback ${fallbackPage} non disponible:`, error);
            }
        }
        return new Response('Page non disponible', { status: 404 });
    },
    
    // Vérifier le quota de stockage (iPadOS) - Version robuste
    async checkStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                if (estimate.quota && estimate.usage !== undefined) {
                    const usagePercent = (estimate.usage / estimate.quota) * 100;
                    console.log(`💾 Stockage: ${usagePercent.toFixed(1)}% utilisé (${estimate.usage}/${estimate.quota})`);
                    return usagePercent < 85; // Garder 15% de marge pour iPad
                }
                return true; // Si pas de quota défini, continuer
            } catch (error) {
                console.warn('⚠️ Impossible de vérifier le quota:', error);
                return true; // Continuer par défaut
            }
        }
        return true;
    },
    
    // Nettoyer le cache si nécessaire (iPadOS)
    async cleanupCacheIfNeeded() {
        try {
            const estimate = await navigator.storage.estimate();
            if (estimate.quota && estimate.usage && (estimate.usage / estimate.quota) > 0.8) {
                console.log('🧹 Nettoyage du cache - Quota élevé');
                const cacheNames = await caches.keys();
                const oldCaches = cacheNames.filter(name => 
                    name.includes('jpsi-static-v1.4.') && !name.includes('v1.4.39')
                );
                
                for (const cacheName of oldCaches) {
                    await caches.delete(cacheName);
                    console.log(`🗑️ Cache supprimé: ${cacheName}`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Erreur nettoyage cache:', error);
        }
    }
};

// Installation - Cache des ressources avec gestion d'erreur robuste
self.addEventListener('install', (evt) => {
    console.log('🔄 Service Worker: Installation v1.4.39...');
    
    evt.waitUntil(
        (async () => {
            try {
                // Nettoyer le cache avant installation
                await utils.cleanupCacheIfNeeded();
                
                const cache = await caches.open(STATIC_CACHE);
                const allResources = [...ALL_PAGES, ...STATIC_RESOURCES];
                
                console.log('📦 Mise en cache des ressources...');
                const results = await utils.cacheAddAllWithRetry(cache, allResources);
                
                const successCount = results.filter(r => r.success).length;
                const failCount = results.length - successCount;
                
                console.log(`✅ Cache créé: ${successCount} succès, ${failCount} échecs`);
                
                // Créer le cache de fallback
                const fallbackCache = await caches.open(FALLBACK_CACHE);
                await utils.cacheAddAllWithRetry(fallbackCache, FALLBACK_PAGES);
                
                console.log('✅ Installation terminée, activation...');
                await self.skipWaiting();
            } catch (error) {
                console.error('❌ Erreur installation:', error);
            }
        })()
    );
});

// Activation - Nettoyage des caches
self.addEventListener('activate', (evt) => {
    console.log('🔄 Service Worker: Activation v1.4.39...');
    
    evt.waitUntil(
        (async () => {
            try {
                const cacheNames = await caches.keys();
                const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, FALLBACK_CACHE];
                
                const deletePromises = cacheNames
                    .filter(name => !currentCaches.includes(name))
                    .map(name => {
                        console.log('🗑️ Suppression ancien cache:', name);
                        return caches.delete(name);
                    });
                
                await Promise.all(deletePromises);
                console.log('✅ Service Worker activé');
                
                // Forcer l'activation immédiate pour iPad
                await self.clients.claim();
                
                // Notifier tous les clients de l'activation
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({ type: 'SW_ACTIVATED', version: 'v1.4.39' });
                });
            } catch (error) {
                console.error('❌ Erreur activation:', error);
            }
        })()
    );
});

// Interception des requêtes - Cache First optimisé pour iPadOS
self.addEventListener('fetch', (evt) => {
    const request = evt.request;
    const url = new URL(request.url);
    
    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') return;
    
    // Ignorer les requêtes externes et CDN
    if (utils.shouldIgnoreRequest(url)) return;
    
    const pathname = url.pathname;
    
    // Ne gérer que les pages et ressources exactes de l'app
    const isAppPage = utils.isAppPage(pathname);
    const isStaticResource = utils.isStaticResource(request.url);
    
    if (!isAppPage && !isStaticResource) return;
    
    evt.respondWith(
        (async () => {
            try {
                // Normaliser la navigation pour iPad Safari
                let effectiveRequest = request;
                if (request.mode === 'navigate') {
                    const isRoot = url.pathname === '/' || url.pathname === '';
                    if (isRoot) {
                        effectiveRequest = new Request('/index.html', { 
                            headers: request.headers, 
                            mode: 'same-origin',
                            credentials: 'same-origin'
                        });
                    }
                }
                
                // Stratégie Cache First optimisée pour iPad
                const cachedResponse = await caches.match(effectiveRequest);
                
                if (cachedResponse && cachedResponse.ok) {
                    // Vérification stricte pour iPad Safari
                    if (cachedResponse.type !== 'opaqueredirect' && 
                        !cachedResponse.redirected && 
                        cachedResponse.status === 200) {
                        console.log('✅ Ressource servie depuis le cache:', effectiveRequest.url);
                        return cachedResponse;
                    } else {
                        console.warn('⚠️ Réponse cache invalide détectée:', effectiveRequest.url, {
                            type: cachedResponse.type,
                            redirected: cachedResponse.redirected,
                            status: cachedResponse.status
                        });
                    }
                }
                
                // Tentative réseau avec gestion d'erreur robuste
                try {
                    const networkResponse = await fetch(effectiveRequest, { 
                        redirect: 'follow',
                        credentials: 'same-origin',
                        cache: 'no-cache' // Forcer la vérification réseau
                    });
                    
                    if (networkResponse && networkResponse.ok) {
                        // Nettoyer les réponses redirigées pour iPad
                        let responseToCache = networkResponse;
                        if (networkResponse.redirected) {
                            const body = await networkResponse.blob();
                            const headers = new Headers();
                            headers.set('Content-Type', networkResponse.headers.get('Content-Type') || 'text/html');
                            headers.set('Cache-Control', 'max-age=3600');
                            responseToCache = new Response(body, { 
                                status: 200, 
                                statusText: 'OK',
                                headers 
                            });
                        }
                        
                        // Mettre en cache avec vérification de quota
                        const hasQuota = await utils.checkStorageQuota();
                        if (hasQuota && !responseToCache.redirected) {
                            const cacheName = isStaticResource ? STATIC_CACHE : DYNAMIC_CACHE;
                            const cache = await caches.open(cacheName);
                            const responseClone = responseToCache.clone();
                            await cache.put(effectiveRequest, responseClone);
                            console.log('✅ Ressource mise en cache:', effectiveRequest.url);
                        }
                        
                        return responseToCache;
                    } else {
                        throw new Error(`HTTP ${networkResponse?.status || 'Unknown'}`);
                    }
                    
                } catch (networkError) {
                    console.log('❌ Erreur réseau:', effectiveRequest.url, networkError.message);
                    
                    // Fallback pour les pages HTML
                    if (request.destination === 'document' || request.mode === 'navigate') {
                        console.log('🔄 Tentative de fallback pour page HTML...');
                        const fallback = await utils.getFallbackPage();
                        if (fallback && fallback.ok) {
                            console.log('✅ Page de fallback servie');
                            return fallback;
                        }
                    }
                    
                    // Fallback pour les ressources statiques
                    const offlineResource = await caches.match('/offline.html');
                    if (offlineResource) {
                        return offlineResource;
                    }
                    
                    // Dernier recours - réponse d'erreur simple
                    return new Response('Ressource non disponible en mode offline', { 
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain' }
                    });
                }
                
            } catch (error) {
                console.error('❌ Erreur fetch critique:', error);
                
                // Dernier recours absolu
                if (request.destination === 'document' || request.mode === 'navigate') {
                    const lastResort = await caches.match('/index.html') || 
                                     await caches.match('/accueil.html');
                    if (lastResort) {
                        return lastResort;
                    }
                }
                
                return new Response('Erreur interne du service worker', { 
                    status: 500,
                    statusText: 'Internal Server Error',
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
        })()
    );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: 'v1.4.39' });
    }
    
    if (event.data && event.data.type === 'GET_STORAGE_INFO') {
        (async () => {
            try {
                const estimate = await navigator.storage.estimate();
                event.ports[0].postMessage({
                    usage: estimate.usage,
                    quota: estimate.quota,
                    usagePercent: (estimate.usage / estimate.quota) * 100
                });
            } catch (error) {
                event.ports[0].postMessage({ error: 'Impossible de récupérer les infos stockage' });
            }
        })();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        (async () => {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                event.ports[0].postMessage({ success: true });
            } catch (error) {
                event.ports[0].postMessage({ error: 'Erreur lors du nettoyage du cache' });
            }
        })();
    }
});

console.log('✅ Service Worker chargé v1.4.39 - Fix Mode Offline iPad Safari');