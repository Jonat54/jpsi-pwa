// Service Worker pour JPSI PWA - Optimisé iPadOS/Safari
// Version v1.4.3 - Pré-chargement des données essentielles

const STATIC_CACHE = 'jpsi-static-v1.4.3';
const DYNAMIC_CACHE = 'jpsi-dynamic-v1.4.3';
const FALLBACK_CACHE = 'jpsi-fallback-v1.4.3';

// Pages principales de l'application (liste explicite)
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

// Ressources statiques critiques
const STATIC_RESOURCES = [
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
        if (url.hostname !== 'jpsi-pwa.pages.dev') return true;
        
        // Ignorer les requêtes vers des chemins non gérés
        if (url.pathname === '/offline') return true;
        
        return false;
    },
    
    // Gestion d'erreur du cache.addAll avec retry individuel
    async cacheAddAllWithRetry(cache, resources) {
        const results = [];
        for (const resource of resources) {
            try {
                await cache.add(resource);
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
    
    // Vérifier le quota de stockage (iPadOS)
    async checkStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const usagePercent = (estimate.usage / estimate.quota) * 100;
                console.log(`💾 Stockage: ${usagePercent.toFixed(1)}% utilisé`);
                return usagePercent < 90; // Garder 10% de marge
            } catch (error) {
                console.warn('⚠️ Impossible de vérifier le quota:', error);
                return true; // Continuer par défaut
            }
        }
        return true;
    }
};

// Installation - Cache des ressources avec gestion d'erreur robuste
self.addEventListener('install', (evt) => {
    console.log('🔄 Service Worker: Installation v1.4.3...');
    
    evt.waitUntil(
        (async () => {
            try {
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
                
                await self.skipWaiting();
            } catch (error) {
                console.error('❌ Erreur installation:', error);
            }
        })()
    );
});

// Activation - Nettoyage des caches
self.addEventListener('activate', (evt) => {
    console.log('🔄 Service Worker: Activation v1.4.3...');
    
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
                await self.clients.claim();
            } catch (error) {
                console.error('❌ Erreur activation:', error);
            }
        })()
    );
});

// Interception des requêtes - Cache First simple pour iPadOS
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
                // Stratégie Cache First simple
                const cachedResponse = await caches.match(request);
                
                if (cachedResponse) {
                    console.log('✅ Ressource servie depuis le cache:', request.url);
                    return cachedResponse;
                }
                
                // Vérifier le quota avant de mettre en cache
                const hasQuota = await utils.checkStorageQuota();
                
                try {
                    const networkResponse = await fetch(request);
                    
                    if (networkResponse && networkResponse.status === 200) {
                        // Mettre en cache seulement si on a du quota
                        if (hasQuota) {
                            const responseClone = networkResponse.clone();
                            const cacheName = isStaticResource ? STATIC_CACHE : DYNAMIC_CACHE;
                            const cache = await caches.open(cacheName);
                            await cache.put(request, responseClone);
                            console.log('✅ Ressource mise en cache:', request.url);
                        }
                        return networkResponse;
                    }
                    
                    // Réponse non-200, essayer le fallback
                    throw new Error(`HTTP ${networkResponse.status}`);
                    
                } catch (networkError) {
                    console.log('❌ Erreur réseau:', request.url, networkError);
                    
                    // Pour les pages, essayer le fallback
                    if (request.destination === 'document') {
                        return await utils.getFallbackPage();
                    }
                    
                    // Pour les ressources statiques, essayer offline.html
                    return await caches.match('/offline.html') || 
                           new Response('Ressource non disponible', { status: 404 });
                }
                
            } catch (error) {
                console.error('❌ Erreur fetch:', error);
                
                // Dernier recours
                if (request.destination === 'document') {
                    return await utils.getFallbackPage();
                }
                
                return new Response('Erreur interne', { status: 500 });
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
        event.ports[0].postMessage({ version: 'v1.4.3' });
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

console.log('✅ Service Worker chargé v1.4.3 - Optimisé iPadOS/Safari');