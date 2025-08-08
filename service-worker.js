const CACHE_NAME = 'jpsi-cache-v1.3.21';
const FILES_TO_CACHE = [
  // ⚠️ PAS de '/' ici
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
  // ⚠️ PAS de '/service-worker.js' ici
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
        console.log('🔄 Service Worker: Installation v1.3.15...');
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
        console.log('🔄 Service Worker: Activation v1.3.15...');
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
  const url = new URL(evt.request.url);

  // Laisse passer le SW lui-même
  if (url.pathname.endsWith('/service-worker.js')) return;

  // Ne gère pas Supabase ni blob/data
  if (url.host.includes('supabase.co')) return;
  if (url.protocol === 'blob:' || url.protocol === 'data:') return;

  // 1) Navigations (HTML) - Compatible Safari iOS
  if (evt.request.mode === 'navigate') {
    evt.respondWith((async () => {
      try {
        const net = await fetch(evt.request);
        // Safari iOS gère différemment les redirections
        // On évite de manipuler la propriété 'redirected'
        return net;
      } catch (error) {
        console.log('❌ Erreur réseau, utilisation du cache (Safari iOS)');
        
        // Essayer de trouver la page dans le cache en ignorant les paramètres
        const urlWithoutParams = new URL(evt.request.url);
        urlWithoutParams.search = ''; // Supprime les paramètres d'URL
        
        // Chercher d'abord la page exacte sans paramètres
        let cached = await caches.match(urlWithoutParams.pathname);
        
        // Si pas trouvé, essayer avec le chemin complet sans paramètres
        if (!cached) {
          cached = await caches.match(urlWithoutParams.pathname + urlWithoutParams.pathname);
        }
        
        // Si toujours pas trouvé, essayer les pages principales
        if (!cached) {
          const mainPages = ['/index.html', '/extSite.html', '/verifSite.html', '/verification.html'];
          for (const page of mainPages) {
            cached = await caches.match(page);
            if (cached) break;
          }
        }
        
        if (cached) {
          console.log('✅ Page trouvée en cache (Safari iOS)');
          return cached;
        }
        
        // Fallback simple pour Safari iOS
        return new Response('Mode hors ligne - Reconnectez-vous', { 
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }

  // 2) Assets (cache-first + maj silencieuse) - Compatible Safari iOS
  evt.respondWith((async () => {
    try {
      const cached = await caches.match(evt.request);
      if (cached) {
        console.log('💾 Ressource depuis le cache (Safari iOS)');
        return cached;
      }
      
      const net = await fetch(evt.request);
      // Mise en cache silencieuse pour Safari iOS
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(evt.request, net.clone());
      } catch (cacheError) {
        console.log('⚠️ Erreur mise en cache (Safari iOS):', cacheError);
      }
      return net;
    } catch (error) {
      console.log('❌ Erreur réseau pour ressource (Safari iOS):', error);
      return new Response('Ressource non disponible', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 