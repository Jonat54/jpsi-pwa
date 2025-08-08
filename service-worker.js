const CACHE_NAME = 'jpsi-cache-v1.3.30';
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
  console.log('🔄 Service Worker: Installation v1.3.30...');
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
  console.log('🔄 Service Worker: Activation v1.3.30...');
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

  // 1) Navigations (HTML) - Solution GPT 5 modifiée pour Safari iOS 18
  if (evt.request.mode === 'navigate') {
    evt.respondWith((async () => {
      try {
        // 1) N'essaie PAS de "matcher" la requête de navigation sur des URL différentes.
        //    Serre uniquement l'app-shell *fichier* connu.
        const candidates = ['/index.html', '/accueil.html'];

        for (const path of candidates) {
          const res = await caches.match(path);
          if (!res) continue;

          // 2) Safari iOS: rejeter UNIQUEMENT les vraies redirections 30x
          //    Accepter les réponses avec flag redirected (normal sur iOS)
          const bad = res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400);
          if (bad) {
            console.log('❌ Réponse rejetée (vraie redirection):', path);
            continue;
          }

          // 3) Re-construire une Response "propre" (évite l'état interne redirection)
          const buf = await res.arrayBuffer();
          console.log('✅ Navigation depuis cache (Safari iOS 18):', path);
          return new Response(buf, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }

        // 4) À défaut: renvoyer une page d'erreur *locale* (pas de réseau)
        console.log('❌ Aucune page valide trouvée en cache');
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Hors ligne</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background: #f6f7f9;
                color: #333;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                padding: 40px 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              h1 { color: #9B2423; margin-bottom: 20px; }
              p { margin-bottom: 15px; line-height: 1.6; }
              .btn {
                background: #9B2423;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Mode hors ligne</h1>
              <p>Cette page n'est pas disponible hors ligne.</p>
              <p>Veuillez vous reconnecter pour accéder à cette fonctionnalité.</p>
              <a href="/index.html" class="btn">Retour à l'accueil</a>
            </div>
          </body>
          </html>
        `, {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
        
      } catch (error) {
        console.log('❌ Erreur navigation (Safari iOS 18):', error);
        
        // Retourner une page d'erreur simple
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Erreur</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Erreur</h1>
            <p>Une erreur est survenue lors du chargement de la page.</p>
            <p>Veuillez réessayer.</p>
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