# 🚀 PWA JPSI - Gestion Sécurité Incendie - TODO

## 📋 ÉTAT DU PROJET
- [ ] **PHASE 1 : Structure de base**
- [ ] **PHASE 2 : Fonctionnalités clients**
- [ ] **PHASE 3 : Fonctionnalités sites**
- [ ] **PHASE 4 : Fonctionnalités extincteurs**
- [ ] **PHASE 5 : Fonctionnalités éclairages**
- [ ] **PHASE 6 : Synchronisation et offline**
- [ ] **PHASE 7 : Tests et optimisation**

---

## 🎯 PHASE 1 : STRUCTURE DE BASE

### Configuration initiale
- [ ] Créer `index.html` (page d'accueil avec navigation)
- [ ] Créer `styles.css` (design system iOS moderne)
- [ ] Créer `app.js` (logique principale)
- [ ] Créer `manifest.json` (configuration PWA)
- [ ] Créer `service-worker.js` (cache et offline)
- [ ] Créer `supabase-config.js` (configuration Supabase)
- [ ] Créer `theme.js` (gestion thème clair/sombre)
- [ ] Créer `ios-banner.js` (bannière ajout écran d'accueil)
- [ ] Créer `_headers` et `_redirects` (Cloudflare Pages)

### Design System
- [ ] Définir variables CSS (couleurs, espacements)
- [ ] Créer composants : boutons, cartes, formulaires
- [ ] Implémenter responsive mobile-first
- [ ] Ajouter thème clair/sombre
- [ ] Créer icônes (192x192, 512x512)

---

## 🧑‍💼 PHASE 2 : FONCTIONNALITÉS CLIENTS

### Pages clients
- [ ] Créer `clients-liste.html` + `clients-liste.js`
  - [ ] Liste des clients avec recherche
  - [ ] Bouton ajout rapide
  - [ ] Navigation vers fiche client
- [ ] Créer `ajout-client.html` + `ajout-client.js`
  - [ ] Formulaire complet client
  - [ ] Validation des champs
  - [ ] Génération automatique code_client (CL0001)
- [ ] Créer `edition-client.html` + `edition-client.js`
  - [ ] Édition client existant
  - [ ] Suppression client

### Fonctions Supabase clients
- [ ] `getClients()` - Récupération liste clients
- [ ] `addClient(clientData)` - Ajout client
- [ ] `updateClient(id, clientData)` - Modification client
- [ ] `deleteClient(id)` - Suppression client
- [ ] `getClientById(id)` - Récupération client spécifique

---

## 🏢 PHASE 3 : FONCTIONNALITÉS SITES

### Pages sites
- [ ] Créer `ajout-site.html` + `ajout-site.js`
  - [ ] Formulaire site lié au client
  - [ ] Sélection client parent
  - [ ] Validation adresse
- [ ] Créer `site-fiche.html` + `site-fiche.js`
  - [ ] Affichage détaillé site
  - [ ] Liste équipements du site
  - [ ] Actions rapides

### Fonctions Supabase sites
- [ ] `getSites()` - Récupération tous sites
- [ ] `getSitesByClient(clientId)` - Sites d'un client
- [ ] `addSite(siteData)` - Ajout site
- [ ] `updateSite(id, siteData)` - Modification site
- [ ] `deleteSite(id)` - Suppression site

---

## 🔥 PHASE 4 : FONCTIONNALITÉS EXTINCTEURS

### Pages extincteurs
- [ ] Créer `extincteurs-liste.html` + `extincteurs-liste.js`
  - [ ] Liste par site
  - [ ] Filtres et recherche
  - [ ] Statut visuel (OK/À vérifier/HS)
- [ ] Créer `extincteur-ajout.html` + `extincteur-ajout.js`
  - [ ] Formulaire complet extincteur
  - [ ] Sélection site parent
  - [ ] Validation technique

### Fonctions Supabase extincteurs
- [ ] `getExtincteurs()` - Tous les extincteurs
- [ ] `getExtincteursBySite(siteId)` - Extincteurs d'un site
- [ ] `addExtincteur(extincteurData)` - Ajout extincteur
- [ ] `updateExtincteur(id, extincteurData)` - Modification
- [ ] `deleteExtincteur(id)` - Suppression

---

## 💡 PHASE 5 : FONCTIONNALITÉS ÉCLAIAGES

### Pages éclairages
- [ ] Créer `eclairages-liste.html` + `eclairages-liste.js`
  - [ ] Liste par site
  - [ ] Statut batterie visuel
  - [ ] Filtres par type
- [ ] Créer `eclairage-ajout.html` + `eclairage-ajout.js`
  - [ ] Formulaire complet éclairage
  - [ ] Gestion orientation
  - [ ] Validation IP

### Fonctions Supabase éclairages
- [ ] `getEclairages()` - Tous les éclairages
- [ ] `getEclairagesBySite(siteId)` - Éclairages d'un site
- [ ] `addEclairage(eclairageData)` - Ajout éclairage
- [ ] `updateEclairage(id, eclairageData)` - Modification
- [ ] `deleteEclairage(id)` - Suppression

---

## 🔄 PHASE 6 : SYNCHRONISATION ET OFFLINE

### Gestion offline
- [ ] Créer `sync-manager.js`
  - [ ] IndexedDB pour stockage local
  - [ ] File d'attente synchronisation
  - [ ] Marquage éléments non synchronisés
  - [ ] Synchronisation automatique en ligne

### Service Worker avancé
- [ ] Améliorer `service-worker.js`
  - [ ] Cache stratégique
  - [ ] Gestion erreurs réseau
  - [ ] Mise à jour en arrière-plan

---

## 📊 PHASE 7 : RAPPORTS ET PARAMÈTRES

### Pages finales
- [ ] Créer `rapport.html` + `rapport.js`
  - [ ] Génération rapports PDF
  - [ ] Statistiques équipements
  - [ ] Export données
- [ ] Créer `parametres.html` + `parametres.js`
  - [ ] Configuration app
  - [ ] Gestion thème
  - [ ] Synchronisation manuelle

---

## 🧪 TESTS ET OPTIMISATION

### Tests fonctionnels
- [ ] Test sur iPhone SE (iOS 17+)
- [ ] Test sur iPad (iPadOS 17+)
- [ ] Test mode offline complet
- [ ] Test synchronisation différée
- [ ] Test ajout écran d'accueil iOS

### Tests techniques
- [ ] Performance (Lighthouse)
- [ ] Accessibilité
- [ ] Responsive design
- [ ] Gestion erreurs
- [ ] Validation formulaires

### Optimisations
- [ ] Compression assets
- [ ] Lazy loading
- [ ] Cache optimisé
- [ ] Code splitting

---

## 📁 STRUCTURE FINALE À CRÉER

```
/PWA-JPSI/
├── index.html
├── app.js
├── styles.css
├── manifest.json
├── service-worker.js
├── supabase-config.js
├── supabase-functions.js
├── sync-manager.js
├── theme.js
├── ios-banner.js
├── verification-utils.js
├── clients-liste.html
├── clients-liste.js
├── ajout-client.html
├── ajout-client.js
├── edition-client.html
├── edition-client.js
├── ajout-site.html
├── ajout-site.js
├── site-fiche.html
├── site-fiche.js
├── extincteurs-liste.html
├── extincteurs-liste.js
├── extincteur-ajout.html
├── extincteur-ajout.js
├── eclairages-liste.html
├── eclairages-liste.js
├── eclairage-ajout.html
├── eclairage-ajout.js
├── rapport.html
├── rapport.js
├── parametres.html
├── parametres.js
├── _headers
├── _redirects
├── /icons/
│   ├── icon-192.png
│   └── icon-512.png
├── /img/
└── /fonts/
```

---

## 🎯 PRIORITÉS DE DÉVELOPPEMENT

1. **PHASE 1** : Structure de base (index.html, styles.css, app.js)
2. **PHASE 2** : Fonctionnalités clients (liste + ajout)
3. **PHASE 3** : Fonctionnalités sites
4. **PHASE 4** : Fonctionnalités extincteurs
5. **PHASE 6** : Synchronisation offline
6. **PHASE 5** : Fonctionnalités éclairages
7. **PHASE 7** : Rapports et paramètres

---

## ✅ CRITÈRES DE SUCCÈS

- [ ] PWA installable sur iOS via Safari
- [ ] Fonctionnement offline complet
- [ ] Synchronisation automatique
- [ ] Interface iOS moderne et intuitive
- [ ] Performance optimale
- [ ] Code maintenable et modulaire

---

**🎉 PRÊT POUR VOS INSTRUCTIONS !**

Je suis prêt à commencer le développement de votre PWA JPSI. Par quelle phase souhaitez-vous que je commence ? Je recommande de commencer par la **PHASE 1** (Structure de base) pour établir les fondations solides de l'application. 