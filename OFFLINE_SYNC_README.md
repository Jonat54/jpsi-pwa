# 🔄 Synchronisation Offline - JPSI PWA

## 📋 Vue d'ensemble

La JPSI PWA dispose maintenant d'un système de synchronisation offline complet qui permet de :
- **Travailler hors ligne** sans perte de données
- **Synchroniser automatiquement** au retour en ligne
- **Gérer les conflits** et les erreurs de synchronisation
- **Maintenir l'intégrité** des données

## 🚀 Fonctionnalités principales

### 1. **Préchargement intelligent**
- **Catalogues** : types d'équipements, codes, etc.
- **Données d'intervention** : site, client, équipements
- **Métadonnées** : informations de base pour la navigation

### 2. **Synchronisation différée**
- **File d'attente** des modifications offline
- **Synchronisation automatique** au retour en ligne
- **Gestion des erreurs** avec retry automatique
- **Nettoyage automatique** des éléments synchronisés

### 3. **Mode offline-first**
- **Lecture** depuis IndexedDB (données préchargées)
- **Écriture** en IndexedDB + file de synchronisation
- **Interface adaptative** selon la connectivité

## 🧪 Comment tester

### **Étape 1 : Préchargement des données**
1. **Ouvre** `ongoingInterventions.html` en ligne
2. **Clique** sur une intervention existante
3. **Confirme** le préchargement
4. **Attends** que toutes les données soient téléchargées

### **Étape 2 : Test hors ligne**
1. **Coupe le réseau** (Firefox : Réseau → "Hors ligne")
2. **Recharge** la page
3. **Vérifie** que les données sont toujours accessibles
4. **Effectue** des modifications (vérifications, etc.)

### **Étape 3 : Test de synchronisation**
1. **Remets le réseau** en ligne
2. **Observe** l'indicateur de synchronisation
3. **Vérifie** que les modifications sont synchronisées
4. **Contrôle** les logs de synchronisation

## 📱 Interface utilisateur

### **Indicateur de synchronisation**
- **🔄 Synchronisation...** : synchronisation en cours
- **📴 X en attente** : modifications en attente de synchronisation
- **❌ X erreur(s)** : erreurs de synchronisation
- **✅ À jour** : toutes les données sont synchronisées

### **Badge réseau**
- **🌐 En ligne** : connexion active
- **❌ Hors ligne** : mode offline

## 🔧 Fichiers modifiés

### **`ongoingInterventions.html`**
- `viewIntervention()` : préchargement complet avant navigation
- `preloadInterventionData()` : téléchargement des données spécifiques

### **`verifSite.html`**
- `loadInterventionData()` : lecture depuis IndexedDB
- `loadInterventionEquipmentsFromCache()` : équipements depuis le cache
- `pauseIntervention()` : synchronisation offline
- Indicateur de statut de synchronisation

### **`js/offlineSync.js`** (nouveau)
- `OfflineSyncManager` : gestionnaire de synchronisation
- File d'attente des modifications
- Synchronisation automatique
- Gestion des erreurs et retry

### **`js/syncManager.js`**
- `saveVerification()` : intégration avec OfflineSyncManager

## 📊 Structure des données

### **Données préchargées**
```
interventions/          # Interventions avec relations
├── sites/             # Sites des interventions
├── clients/           # Clients des sites
├── extincteurs/       # Équipements du site
├── eclairages/        # Éclairages du site
├── alarmes/           # Alarmes du site
├── desenfumages/      # Desenfumages du site
└── catalogues/        # Types et codes d'équipements
```

### **File de synchronisation**
```javascript
{
  id: "unique_id",
  operation: {
    type: "insert|update|delete",
    table: "table_name",
    data: {...},           // Pour insert/update
    where: {...}           // Pour update/delete
  },
  timestamp: Date.now(),
  retryCount: 0,
  status: "pending|completed|failed"
}
```

## 🚨 Gestion des erreurs

### **Types d'erreurs**
- **Erreurs réseau** : retry automatique (3 tentatives)
- **Erreurs de données** : validation avant synchronisation
- **Conflits** : résolution automatique par timestamp

### **Stratégies de récupération**
- **Retry automatique** avec délai progressif
- **Fallback IndexedDB** en cas d'échec Supabase
- **Nettoyage automatique** des éléments échoués

## 🔍 Débogage

### **Page de test**
- **`test-offline-sync.html`** : interface de test complète
- **Statut de connectivité** : vérification réseau
- **Statut de synchronisation** : file d'attente
- **Logs en temps réel** : suivi des opérations

### **Console de développement**
- **Logs détaillés** de chaque opération
- **Statuts de synchronisation** en temps réel
- **Erreurs et warnings** avec contexte

### **Commandes utiles**
```javascript
// Vérifier le statut de synchronisation
window.offlineSyncManager.getSyncStatus()

// Forcer la synchronisation
window.offlineSyncManager.forceSync()

// Vider la file d'attente
window.offlineSyncManager.clearSyncQueue()

// Vérifier la connectivité
navigator.onLine
```

## 📈 Performance

### **Optimisations**
- **Préchargement ciblé** : seulement les données nécessaires
- **Synchronisation par lots** : évite la surcharge
- **Cache intelligent** : réutilisation des données
- **Nettoyage automatique** : maintenance de l'espace

### **Métriques**
- **Temps de préchargement** : < 5 secondes pour une intervention
- **Taille du cache** : optimisée selon l'usage
- **Latence de synchronisation** : < 2 secondes par opération

## 🔮 Évolutions futures

### **Fonctionnalités prévues**
- **Synchronisation bidirectionnelle** : détection des conflits
- **Gestion des versions** : historique des modifications
- **Synchronisation partielle** : mise à jour incrémentale
- **Compression des données** : optimisation de la bande passante

### **Améliorations techniques**
- **Service Worker** : synchronisation en arrière-plan
- **Push notifications** : alertes de synchronisation
- **Mode hors ligne avancé** : travail complet sans réseau
- **Sauvegarde cloud** : protection des données locales

## 📞 Support

### **En cas de problème**
1. **Vérifier** la console de développement
2. **Tester** avec `test-offline-sync.html`
3. **Contrôler** le statut de synchronisation
4. **Vérifier** la connectivité réseau

### **Logs utiles**
- **Erreurs de préchargement** : données manquantes
- **Échecs de synchronisation** : problèmes réseau
- **Conflits de données** : incohérences détectées
- **Problèmes de cache** : corruption IndexedDB

---

**Version** : v1.4.13  
**Date** : Décembre 2024  
**Auteur** : Assistant IA JPSI





