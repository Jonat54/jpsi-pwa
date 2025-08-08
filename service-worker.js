const CACHE_NAME = 'jpsi-cache-v1.3.27';
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

// Fonction de normalisation des URLs pour iOS
function normalizeUrl(url) {
  const normalized = new URL(url);
  
  // Supprimer les paramètres de requête
  normalized.search = '';
  
  // Normaliser les chemins
  let path = normalized.pathname;
  
  // Supprimer les trailing slashes sauf pour la racine
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  
  // Gérer les cas spéciaux pour iOS
  if (path === '' || path === '/') {
    path = '/index.html';
  }
  
  // Ajouter .html si nécessaire (pour les pages principales)
  const mainPages = [
    '/accueil', '/verification', '/newVerification', '/verificationSummary',
    '/verificationHistory', '/verificationDetail', '/ongoingInterventions',
    '/verifSite', '/extSite', '/extDetail', '/eclairageSite', '/eclairageDetail',
    '/alarmeSite', '/desenfumageList', '/desenfumageDetail', '/addEfu',
    '/addClient', '/addSite', '/ListClients', '/client', '/detailSite',
    '/audits', '/newAudit', '/auditHistory', '/auditDetail', '/inventairePDF'
  ];
  
  if (mainPages.includes(path)) {
    path += '.html';
  }
  
  normalized.pathname = path;
  return normalized.toString();
}

self.addEventListener('install', (evt) => {
  console.log('🔄 Service Worker: Installation v1.3.27...');
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
  console.log('🔄 Service Worker: Activation v1.3.27...');
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

  // 1) Navigations (HTML) - Cache-First béton (iOS-friendly)
  if (evt.request.mode === 'navigate') {
    evt.respondWith((async () => {
      try {
        // Normaliser l'URL pour iOS
        const normalizedUrl = normalizeUrl(evt.request.url);
        console.log('🔄 URL normalisée:', normalizedUrl);
        
        // Essayer d'abord le cache avec l'URL normalisée
        let cached = await caches.match(normalizedUrl);
        
        // Si pas trouvé, essayer avec l'URL originale
        if (!cached) {
          cached = await caches.match(evt.request.url);
        }
        
        // Si toujours pas trouvé, essayer avec le pathname
        if (!cached) {
          cached = await caches.match(url.pathname);
        }
        
        // Si toujours pas trouvé, essayer les pages de fallback
        if (!cached) {
          const fallbackPages = ['/index.html', '/accueil.html'];
          for (const page of fallbackPages) {
            cached = await caches.match(page);
            if (cached) {
              console.log(`✅ Page de fallback trouvée: ${page}`);
              break;
            }
          }
        }
        
        // Si trouvé en cache, retourner immédiatement
        if (cached) {
          console.log('✅ Navigation depuis cache (iOS-friendly)');
          return cached;
        }
        
        // Si pas en cache, essayer le réseau UNIQUEMENT pour la première visite
        console.log('🔄 Tentative réseau pour navigation...');
        const net = await fetch(evt.request);
        
        // Mettre en cache silencieusement
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(normalizedUrl, net.clone());
          console.log('✅ Page mise en cache:', normalizedUrl);
        } catch (cacheError) {
          console.log('⚠️ Erreur mise en cache:', cacheError);
        }
        
        return net;
        
      } catch (error) {
        console.log('❌ Erreur navigation (iOS-friendly):', error);
        
        // Retourner une page d'erreur simple
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Hors ligne</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Mode hors ligne</h1>
            <p>Cette page n'est pas disponible hors ligne.</p>
            <p>Veuillez vous reconnecter pour accéder à cette fonctionnalité.</p>
          </body>
          </html>
        `, {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
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