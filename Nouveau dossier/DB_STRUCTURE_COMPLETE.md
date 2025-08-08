# Structure Complète de la Base de Données BMGros

## 📊 Vue d'ensemble

Cette base de données gère un système complet de gestion d'équipements de sécurité incendie avec :
- Gestion des clients et sites
- Suivi des équipements (extincteurs, éclairages, alarmes, désenfumage)
- Gestion des vérifications et interventions
- Système de stock et fournisseurs
- Audits et certifications

## 🗂️ Tables Principales

### 1. **Clients et Sites**
- `clients` - Informations des clients
- `sites` - Sites des clients
- `prospects` - Prospects potentiels

### 2. **Équipements de Sécurité**
- `extincteurs` - Extincteurs installés
- `eclairages` - Éclairages de sécurité
- `alarmes` - Systèmes d'alarme
- `desenfumages` - Systèmes de désenfumage
- `peripheriques` - Périphériques divers

### 3. **Gestion des Interventions**
- `verifications` - Vérifications périodiques
- `interventions` - Interventions réalisées
- `audits` - Audits de sécurité
- `audit_equipements` - Équipements audités

### 4. **Système de Stock**
- `alertes_stock` - Alertes de stock
- `categories_stock` - Catégories de produits
- `mouvements_stock` - Mouvements de stock
- `produits` - Catalogue de produits
- `fournisseurs` - Fournisseurs

### 5. **Désenfumage Avancé**
- `commandes_primaires_desenfumage` - Commandes primaires
- `commandes_secondaires_desenfumage` - Commandes secondaires
- `installations_desenfumage` - Installations de désenfumage
- `ouvrants_desenfumage` - Ouvrants de désenfumage
- `liaison_commande_primaire_secondaire` - Liaisons commandes
- `liaison_ouvrant_commande_primaire` - Liaisons ouvrants

### 6. **Système et Sécurité**
- `tokens` - Tokens d'authentification
- `fire_extinguisher_certification_registry` - Registre des certifications

## 🔗 Relations Identifiées

### Relations Principales
- `clients` ↔ `sites` (1:N)
- `sites` ↔ `extincteurs` (1:N)
- `sites` ↔ `eclairages` (1:N)
- `sites` ↔ `alarmes` (1:N)
- `sites` ↔ `desenfumages` (1:N)
- `sites` ↔ `peripheriques` (1:N)

### Relations de Gestion
- `verifications` ↔ `sites` (N:1)
- `interventions` ↔ `sites` (N:1)
- `audits` ↔ `sites` (N:1)
- `audit_equipements` ↔ `audits` (N:1)

### Relations Stock
- `mouvements_stock` ↔ `produits` (N:1)
- `produits` ↔ `categories_stock` (N:1)
- `produits` ↔ `fournisseurs` (N:1)
- `alertes_stock` ↔ `produits` (N:1)

### Relations Désenfumage
- `commandes_primaires_desenfumage` ↔ `desenfumages` (N:1)
- `commandes_secondaires_desenfumage` ↔ `desenfumages` (N:1)
- `installations_desenfumage` ↔ `desenfumages` (N:1)
- `ouvrants_desenfumage` ↔ `desenfumages` (N:1)

## 📈 Statistiques des Tables

| Table | Lignes Actives | Lignes Supprimées | Statut |
|-------|----------------|-------------------|---------|
| eclairages | 344 | 62 | Très actif |
| extincteurs | 218 | 0 | Très actif |
| sites | 35 | 8 | Modéré |
| alarmes | 17 | 8 | Modéré |
| interventions | 22 | 8 | Modéré |
| peripheriques | 19 | 7 | Modéré |
| clients | 8 | 6 | Faible |
| desenfumages | 6 | 8 | Faible |
| audit_equipements | 6 | 5 | Faible |
| verifications | 7 | 9 | Faible |
| audits | 1 | 10 | Très faible |
| prospects | 1 | 5 | Très faible |

## 🔧 Séquences (Auto-increment)

### Séquences Principales
- `clients_id_client_seq` - ID clients
- `sites_id_site_seq` - ID sites
- `extincteurs_id_ext_seq` - ID extincteurs
- `eclairages_id_ecl_seq` - ID éclairages
- `alarmes_id_alarme_seq` - ID alarmes
- `desenfumages_id_desenfumage_seq` - ID désenfumages
- `peripheriques_id_periph_seq` - ID périphériques

### Séquences de Gestion
- `verifications_id_verification_seq` - ID vérifications
- `interventions_id_intervention_seq` - ID interventions
- `audits_id_audit_seq` - ID audits
- `audit_equipements_id_equipement_seq` - ID équipements audités

### Séquences Stock
- `alertes_stock_id_alerte_seq` - ID alertes stock
- `categories_stock_id_categorie_seq` - ID catégories
- `mouvements_stock_id_mouvement_seq` - ID mouvements
- `produits_id_produit_seq` - ID produits
- `fournisseurs_id_fournisseur_seq` - ID fournisseurs

### Séquences Désenfumage
- `commandes_primaires_desenfumage_id_commande_primaire_seq`
- `commandes_secondaires_desenfumage_id_commande_secondaire_seq`
- `installations_desenfumage_id_installation_seq`
- `ouvrants_desenfumage_id_ouvrant_seq`
- `liaison_commande_primaire_secondaire_id_liaison_seq`
- `liaison_ouvrant_commande_primaire_id_liaison_seq`

### Séquences Système
- `tokens_id_seq` - ID tokens d'authentification
- `fire_extinguisher_certification_registry_id_seq` - ID certifications

## 🎯 Observations et Recommandations

### Points Positifs
- ✅ Structure complète et cohérente
- ✅ Gestion avancée du désenfumage
- ✅ Système de stock intégré
- ✅ Suivi des certifications

### Points d'Amélioration
- ⚠️ Tables `audits` et `prospects` peu utilisées
- ⚠️ Lignes supprimées à nettoyer
- ⚠️ Développement des audits recommandé

### Optimisations Suggérées
1. **Nettoyage** : Supprimer les lignes mortes
2. **Développement** : Augmenter l'utilisation des audits
3. **Performance** : Ajouter des index sur les colonnes fréquemment utilisées
4. **Documentation** : Compléter la documentation des relations

## 📝 Prochaines Étapes

1. **Récupérer la structure détaillée** de toutes les colonnes
2. **Documenter les contraintes** et règles métier
3. **Créer un diagramme** des relations
4. **Optimiser les performances** si nécessaire
5. **Mettre à jour DB.md** avec toutes les informations

---

*Document généré automatiquement - Structure de la base de données BMGros* 