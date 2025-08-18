// Service Worker pour JPSI PWA - Version minimale
// Version v1.4.2 - Service worker désactivé temporairement

console.log('🔄 Service Worker chargé v1.4.2 - Mode minimal');

// Installation - Ne rien faire
self.addEventListener('install', (evt) => {
    console.log('🔄 Service Worker: Installation v1.4.2 (mode minimal)...');
    evt.waitUntil(self.skipWaiting());
});

// Activation - Ne rien faire
self.addEventListener('activate', (evt) => {
    console.log('🔄 Service Worker: Activation v1.4.2 (mode minimal)...');
    evt.waitUntil(self.clients.claim());
});

// Fetch - Ne rien intercepter
self.addEventListener('fetch', (evt) => {
    // Ne rien faire - laisser toutes les requêtes passer
    return;
});

// Messages - Répondre avec la version
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: 'v1.4.2 (mode minimal)' });
    }
});

console.log('✅ Service Worker v1.4.2 en mode minimal - Aucune interception');