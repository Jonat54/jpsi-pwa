# 🚀 FUTUR - Refonte Complète du Système JPSI

## 📋 CONTEXTE

Le projet actuel fonctionne mais nécessite une refonte complète de la base de données pour mieux refléter la réalité métier des vérifications de sécurité incendie.

## 🎯 PROBLÈME ACTUEL

### **Conception incorrecte :**
- Les équipements (extincteurs, BAES, alarmes) mélangent **caractéristiques fixes** et **états variables**
- Les observations de vérification sont stockées directement sur l'équipement
- Pas de distinction entre ce qui caractérise l'équipement et ce qui varie dans le temps

### **Exemple problématique :**
```sql
-- ACTUEL (incorrect)
extincteurs
├── id_ext
├── marque_ext
├── modele_ext
├── etat_ext (OK/HS) ← PROBLÈME !
├── observations ← PROBLÈME !
└── date_derniere_verif ← PROBLÈME !
```

## ✅ SOLUTION PROPOSÉE

### **Principe : Séparation claire**

#### **1. Équipements = Caractéristiques fixes + Localisation fixe**
```sql
extincteurs (CARACTÉRISTIQUES INTRINSÈQUES)
├── id_ext
├── numero_certification (référence fabricant)
├── marque_ext
├── modele_ext
├── agent_ext (type d'agent)
├── capacite_ext (6kg, 2L, etc.)
├── date_fabrication
├── numero_site (numérotation interne du site)
├── niveau_site (étage)
├── emplacement_site (localisation précise)
├── date_mise_service
├── presence_panneau (boolean)
└── id_site
```

#### **2. Vérifications = Observations variables dans le temps**
```sql
verifications_extincteurs
├── id_verification
├── id_ext
├── date_verification
├── etat_general (OK, HS, A_remplacer, A_maintenir)
├── pression_ok (boolean)
├── date_maa (maintenance annuelle)
├── date_eie (épreuve interne/externe)
├── observations (ex: "caché par meuble", "rouillé", etc.)
├── actions_realisees (text)
├── travaux_necessaires (text)
├── devis_requis (boolean)
├── photos (URLs)
└── id_verificateur
```

## 🏗️ NOUVELLE ARCHITECTURE COMPLÈTE

### **Tables Équipements (Caractéristiques fixes)**
```sql
-- Extincteurs
extincteurs
├── id_ext (PK)
├── numero_certification
├── marque_ext
├── modele_ext
├── agent_ext (FK vers AgentExtincteur)
├── capacite_ext
├── date_fabrication
├── numero_site
├── niveau_site
├── emplacement_site
├── date_mise_service
├── presence_panneau
└── id_site (FK)

-- Éclairages de sécurité
eclairages
├── id_ecl (PK)
├── numero_certification
├── marque_ecl
├── modele_ecl
├── type_ecl (centralisé, autonome, etc.)
├── puissance_ecl
├── ip_ecl (indice protection)
├── numero_site
├── niveau_site
├── emplacement_site
├── date_mise_service
├── presence_telecommande
└── id_site (FK)

-- Alarmes
alarmes
├── id_alarme (PK)
├── numero_certification
├── marque_alarme
├── modele_alarme
├── type_alarme (incendie, intrusion, etc.)
├── numero_site
├── niveau_site
├── emplacement_site
├── date_mise_service
└── id_site (FK)

-- Périphériques d'alarme
peripheriques
├── id_periph (PK)
├── numero_certification
├── marque_periph
├── modele_periph
├── type_periph (détecteur, sirène, etc.)
├── numero_site
├── niveau_site
├── emplacement_site
├── date_mise_service
├── id_alarme (FK)
└── id_site (FK)
```

### **Tables Vérifications (États variables)**
```sql
-- Vérifications générales
verifications
├── id_verification (PK)
├── id_site (FK)
├── id_client (FK)
├── type_verification (annuelle, maintenance, urgence)
├── date_debut
├── date_fin (NULL si en cours)
├── statut (0=en_cours, 1=terminee, 2=interrompue)
├── progression (pourcentage)
├── observations_generales
├── mode_offline (boolean)
└── id_verificateur

-- Vérifications extincteurs
verifications_extincteurs
├── id_verif_ext (PK)
├── id_verification (FK)
├── id_ext (FK)
├── date_verification
├── etat_general (OK, HS, A_remplacer, A_maintenir)
├── pression_ok (boolean)
├── date_maa (maintenance annuelle)
├── date_eie (épreuve interne/externe)
├── observations
├── actions_realisees
├── travaux_necessaires
├── devis_requis (boolean)
├── photos (URLs)
└── id_verificateur

-- Vérifications éclairages
verifications_eclairages
├── id_verif_ecl (PK)
├── id_verification (FK)
├── id_ecl (FK)
├── date_verification
├── etat_general (OK, HS, A_remplacer, A_maintenir)
├── batterie_ok (boolean)
├── orientation_ok (boolean)
├── saturation_ok (boolean)
├── observations
├── actions_realisees
├── travaux_necessaires
├── devis_requis (boolean)
├── photos (URLs)
└── id_verificateur

-- Vérifications alarmes
verifications_alarmes
├── id_verif_alarme (PK)
├── id_verification (FK)
├── id_alarme (FK)
├── date_verification
├── etat_general (OK, HS, A_remplacer, A_maintenir)
├── fonctionnement_ok (boolean)
├── observations
├── actions_realisees
├── travaux_necessaires
├── devis_requis (boolean)
├── photos (URLs)
└── id_verificateur

-- Vérifications périphériques
verifications_peripheriques
├── id_verif_periph (PK)
├── id_verification (FK)
├── id_periph (FK)
├── date_verification
├── etat_general (OK, HS, A_remplacer, A_maintenir)
├── fonctionnement_ok (boolean)
├── observations
├── actions_realisees
├── travaux_necessaires
├── devis_requis (boolean)
├── photos (URLs)
└── id_verificateur
```

## 🎯 AVANTAGES DE LA NOUVELLE ARCHITECTURE

### **1. Séparation claire des responsabilités**
- ✅ **Équipements** = Ce qui ne change pas
- ✅ **Vérifications** = Ce qui change dans le temps

### **2. Historique complet**
- ✅ **Toutes les vérifications** d'un équipement
- ✅ **Évolution des observations** dans le temps
- ✅ **Suivi des actions** réalisées

### **3. Flexibilité**
- ✅ **Observations contextuelles** (meuble déplacé, etc.)
- ✅ **Travaux et devis** liés aux vérifications
- ✅ **Photos** pour chaque vérification

### **4. Conformité**
- ✅ **Suivi des dates** MAA et EIE
- ✅ **Traçabilité** des interventions
- ✅ **Rapports** détaillés

## 🚀 PLAN DE MIGRATION

### **Phase 1 : Préparation**
- [ ] Créer les nouvelles tables
- [ ] Développer les scripts de migration
- [ ] Tester la migration sur données de test

### **Phase 2 : Migration**
- [ ] Sauvegarder l'ancienne base
- [ ] Migrer les données existantes
- [ ] Valider l'intégrité des données

### **Phase 3 : Adaptation interface**
- [ ] Adapter les formulaires de vérification
- [ ] Créer les vues d'historique
- [ ] Implémenter le mode offline

### **Phase 4 : Tests et déploiement**
- [ ] Tests complets
- [ ] Formation utilisateurs
- [ ] Déploiement en production

## 📊 IMPACT SUR L'INTERFACE

### **Nouvelles fonctionnalités possibles :**
- 📈 **Graphiques d'évolution** des équipements
- 📅 **Planning des vérifications** futures
- 📋 **Rapports détaillés** par équipement
- 🔍 **Recherche avancée** dans l'historique
- 📱 **Mode offline** complet pour vérifications

### **Améliorations UX :**
- 🎯 **Workflow de vérification** optimisé
- 📸 **Gestion des photos** intégrée
- ⚡ **Synchronisation intelligente**
- 📊 **Tableaux de bord** avancés

## 💡 CONSIDÉRATIONS TECHNIQUES

### **Performance :**
- **Indexation** sur les clés de vérification
- **Partitionnement** des tables de vérifications par année
- **Archivage** des anciennes vérifications

### **Sécurité :**
- **Audit trail** complet des modifications
- **Permissions** par type de vérification
- **Chiffrement** des données sensibles

### **Maintenance :**
- **Scripts de nettoyage** automatiques
- **Sauvegardes** incrémentales
- **Monitoring** des performances

---

**Note :** Ce document sera mis à jour au fur et à mesure de l'avancement du projet de refonte. 