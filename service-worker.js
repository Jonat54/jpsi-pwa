const CACHE_NAME = 'jpsi-cache-v1.3.33';
const FILES_TO_CACHE = [
  '/index.html',
  '/login.html',
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
  '/img/logo.png',
  '/img/icon-192x192.png',
  '/img/icon-512x512.png',
  '/styles.css',
  '/js/indexedDB.js',
  '/js/syncManager.js',
  '/supabase-config.js'
];

// Installation - Mettre en cache les fichiers essentiels
self.addEventListener('install', (evt) => {
  console.log('🔄 Service Worker: Installation v1.3.33...');
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Cache ouvert');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activation - Nettoyer les anciens caches
self.addEventListener('activate', (evt) => {
  console.log('🔄 Service Worker: Activation v1.3.33...');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('🗑️ Suppression ancien cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);
  
  // Ignorer les requêtes non-GET
  if (evt.request.method !== 'GET') return;
  
  // Ignorer les requêtes vers le Service Worker lui-même
  if (url.pathname.endsWith('/service-worker.js')) return;
  
  // Ignorer les requêtes Supabase
  if (url.host.includes('supabase.co')) return;
  
  // Ignorer les blobs et data URLs
  if (url.protocol === 'blob:' || url.protocol === 'data:') return;

  // Navigation - Cache First simple
  if (evt.request.mode === 'navigate') {
    evt.respondWith(
      caches.match(evt.request).then((response) => {
        if (response) {
          console.log('✅ Navigation depuis cache:', evt.request.url);
          return response;
        }
        
        console.log('🔄 Navigation depuis réseau:', evt.request.url);
        return fetch(evt.request).then((networkResponse) => {
          // Mettre en cache pour la prochaine fois
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evt.request, responseClone);
          });
          return networkResponse;
        }).catch(() => {
          // Fallback vers index.html si erreur réseau
          console.log('❌ Erreur réseau, fallback vers index.html');
          return caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Assets - Cache First
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      if (response) {
        console.log('✅ Asset depuis cache:', evt.request.url);
        return response;
      }
      
      console.log('🔄 Asset depuis réseau:', evt.request.url);
      return fetch(evt.request).then((networkResponse) => {
        // Mettre en cache pour la prochaine fois
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(evt.request, responseClone);
        });
        return networkResponse;
      });
    })
  );
}); 