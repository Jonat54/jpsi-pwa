const CACHE_NAME = 'jpsi-cache-v1.3.14';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/accueil.html',
  '/verification.html',
  '/newVerification.html',
  '/verificationSummary.html',
  '/verificationHistory.html',
  '/verificationDetail.html',
  '/ongoingInterventions.html',
  '/verifSite.html',
  '/extSite.html',
  '/extDetail.html',
  '/eclairageSite.html',
  '/eclairageDetail.html',
  '/alarmeSite.html',
  '/desenfumageList.html',
  '/desenfumageDetail.html',
  '/addEfu.html',
  '/addClient.html',
  '/addSite.html',
  '/ListClients.html',
  '/client.html',
  '/detailSite.html',
  '/audits.html',
  '/newAudit.html',
  '/auditHistory.html',
  '/auditDetail.html',
  '/inventairePDF.html',
  '/manifest.json',
  '/service-worker.js',
  '/img/logo.png',
  '/img/entete.png',
  '/img/logobon.png',
  '/img/coordo.png',
  '/img/filigran.png',
  '/img/Disclaimer.png',
  '/icons/icobm.png',
  '/icons/icon-48x48.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-256x256.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (evt) => {
  console.log('🔄 Service Worker: Installation v1.3.14...');
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Mise en cache des fichiers...');
      return cache.addAll(FILES_TO_CACHE);
    }).then(() => {
      console.log('✅ Service Worker: Installation terminée');
    }).catch((error) => {
      console.error('❌ Service Worker: Erreur installation:', error);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('🔄 Service Worker: Activation v1.3.14...');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('🗑️ Service Worker: Suppression ancien cache:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      console.log('✅ Service Worker: Activation terminée');
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  // Ne gérer que les requêtes GET
  if (evt.request.method !== 'GET') {
    return;
  }
  
  // Ne pas intercepter les requêtes Supabase (API)
  if (evt.request.url.includes('supabase.co')) {
    return;
  }
  
  // Ne pas intercepter les requêtes de génération PDF
  if (evt.request.url.includes('blob:') || evt.request.url.includes('data:')) {
    return;
  }
  
  console.log('🌐 Service Worker: Interception requête:', evt.request.url);
  
  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      // Mode hors ligne - Stratégie Cache Only
      if (!navigator.onLine) {
        console.log('❌ Service Worker: Mode hors ligne détecté');
        if (cachedResponse) {
          console.log('💾 Service Worker: Ressource depuis le cache (hors ligne)');
          return cachedResponse;
        } else {
          console.log('⚠️ Service Worker: Ressource non trouvée en cache');
          // Pour les pages HTML, retourner index.html
          if (evt.request.destination === 'document') {
            return caches.match('/index.html');
          }
          // Pour les autres ressources, retourner une erreur
          return new Response('Ressource non disponible hors ligne', { 
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      }
      
      // Mode en ligne - Stratégie Network First pour les pages HTML
      if (evt.request.destination === 'document') {
        console.log('📄 Service Worker: Page HTML détectée (en ligne)');
        
        return fetch(evt.request)
          .then((networkResponse) => {
            console.log('✅ Service Worker: Réponse réseau obtenue');
            // Mettre à jour le cache avec la nouvelle version
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(evt.request, networkResponse.clone());
              console.log('💾 Service Worker: Cache mis à jour');
            });
            return networkResponse;
          })
          .catch((error) => {
            console.log('❌ Service Worker: Erreur réseau, utilisation du cache');
            if (cachedResponse) {
              return cachedResponse;
            } else {
              console.error('❌ Service Worker: Aucun cache disponible');
              return caches.match('/index.html');
            }
          });
      }
      
      // Stratégie Cache First pour les assets statiques
      if (cachedResponse) {
        console.log('💾 Service Worker: Ressource depuis le cache');
        return cachedResponse;
      }
      
      console.log('🌐 Service Worker: Tentative réseau pour ressource');
      return fetch(evt.request).then((networkResponse) => {
        // Mettre à jour le cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(evt.request, networkResponse.clone());
          console.log('💾 Service Worker: Nouvelle ressource mise en cache');
        });
        return networkResponse;
      }).catch((error) => {
        console.error('❌ Service Worker: Erreur réseau pour ressource:', error);
        return new Response('Erreur réseau', { 
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 