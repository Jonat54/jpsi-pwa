// Service Worker DÉSACTIVÉ pour test
// Version v1.3.34 - Test sans Service Worker

const CACHE_NAME = 'jpsi-cache-v1.3.34';

// Installation - Ne rien faire
self.addEventListener('install', (evt) => {
  console.log('🔄 Service Worker: Installation v1.3.34 (DÉSACTIVÉ)...');
  // Ne rien installer
});

// Activation - Ne rien faire
self.addEventListener('activate', (evt) => {
  console.log('🔄 Service Worker: Activation v1.3.34 (DÉSACTIVÉ)...');
  // Ne rien activer
});

// Interception des requêtes - Laisser passer tout
self.addEventListener('fetch', (evt) => {
  // NE RIEN FAIRE - Laisser toutes les requêtes passer normalement
  console.log('🔄 Service Worker: Requête ignorée (DÉSACTIVÉ):', evt.request.url);
  // Pas de evt.respondWith() = laisse passer
}); 