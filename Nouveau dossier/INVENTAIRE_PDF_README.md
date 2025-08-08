# 📋 Inventaire PDF - JPSI

## 🎯 Description

La fonctionnalité **Inventaire PDF** permet de générer un inventaire complet des équipements de sécurité incendie pour un site spécifique. Cette fonctionnalité est accessible depuis la page d'accueil de l'application JPSI.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités principales

- **Sélection client/site** : Interface intuitive pour choisir un client puis un site
- **Aperçu en temps réel** : Affichage des informations du site et du résumé des équipements
- **Génération PDF** : Création d'un PDF professionnel avec tous les équipements
- **Support multi-équipements** : Extincteurs, éclairages, alarmes, désenfumages, périphériques

### 📊 Types d'équipements supportés

1. **🧯 Extincteurs**
   - Numéro, niveau, localisation
   - Marque, modèle, agent extincteur
   - Capacité

2. **💡 Éclairages de sécurité**
   - Numéro, niveau, localisation
   - Marque, modèle, famille
   - Puissance

3. **🚨 Alarmes**
   - ID, type, marque, modèle
   - Notes

4. **💨 Désenfumages**
   - ID, équipement, installation

5. **🔌 Périphériques**
   - ID, type, marque, modèle
   - Localisation

## 🎨 Interface utilisateur

### Page d'accueil
- Nouvelle tuile "Inventaire PDF" avec icône 📋
- Couleur violette (#8B5CF6) pour se distinguer
- Accessible uniquement si la connexion Supabase est établie

### Page d'inventaire
- **En-tête** : Titre et description de la fonctionnalité
- **Sélecteurs** : Client puis site avec validation
- **Aperçu** : Informations du site et résumé des équipements
- **Bouton de génération** : Création du PDF

## 📄 Structure du PDF généré

### En-tête
- Logo et couleurs JPSI
- Titre "INVENTAIRE DES ÉQUIPEMENTS"
- Informations de l'entreprise

### Informations client/site
- Nom du client
- Numéro et nom du site
- Adresse complète
- Date de génération

### Résumé quantitatif
- Total des équipements
- Détail par type d'équipement

### Détail par section
- Tableaux organisés par type d'équipement
- En-têtes colorées aux couleurs JPSI
- Alternance de couleurs pour la lisibilité

### Pied de page
- Date et heure de génération
- Mentions légales JPSI

## 🔧 Configuration technique

### Fichiers impliqués
- `inventairePDF.html` : Page principale de la fonctionnalité
- `accueil.html` : Ajout de la tuile d'accès
- `supabase-config.js` : Configuration de la base de données

### Dépendances
- **Supabase** : Connexion à la base de données
- **jsPDF** : Génération des PDF
- **jsPDF-AutoTable** : Création de tableaux dans les PDF

### Tables de base de données utilisées
- `clients` : Informations des clients
- `sites` : Informations des sites
- `extincteurs` : Données des extincteurs
- `eclairages` : Données des éclairages
- `alarmes` : Données des alarmes
- `desenfumages` : Données des désenfumages
- `peripheriques` : Données des périphériques
- `AgentExtincteur` : Référentiel des agents extincteurs

## 🎯 Utilisation

### Étape 1 : Accès
1. Ouvrir l'application JPSI
2. Cliquer sur la tuile "Inventaire PDF" (icône 📋)

### Étape 2 : Sélection
1. Choisir un client dans la liste déroulante
2. Sélectionner un site du client choisi
3. L'aperçu se met à jour automatiquement

### Étape 3 : Génération
1. Vérifier les informations dans l'aperçu
2. Cliquer sur "Générer l'inventaire PDF"
3. Le PDF se télécharge automatiquement

### Étape 4 : Résultat
- Le fichier est nommé : `Inventaire_[NumSite]_[NomSite]_[Date].pdf`
- Format A4 portrait
- Contient tous les équipements du site sélectionné

## 🔒 Sécurité et validation

### Vérifications
- Connexion Supabase obligatoire
- Validation des données avant génération
- Gestion des erreurs avec messages utilisateur

### Gestion d'erreurs
- Connexion perdue : Tuile grisée
- Données manquantes : Messages d'erreur explicites
- Échec de génération : Retour d'erreur détaillé

## 🎨 Design et UX

### Couleurs JPSI
- Rouge principal : #9B2423
- Rouge dégradé : #C53030
- Violet inventaire : #8B5CF6

### Responsive design
- Adaptation mobile et tablette
- Grille flexible selon la taille d'écran
- Boutons et sélecteurs optimisés

### Animations
- Transitions fluides
- Indicateurs de chargement
- Messages de succès/erreur

## 📈 Évolutions futures

### Fonctionnalités prévues
- [ ] Filtres par type d'équipement
- [ ] Export Excel en plus du PDF
- [ ] Historique des inventaires générés
- [ ] Templates PDF personnalisables
- [ ] Signatures électroniques

### Améliorations techniques
- [ ] Cache des données pour performance
- [ ] Génération en arrière-plan
- [ ] Notifications push
- [ ] Partage direct par email

## 🐛 Dépannage

### Problèmes courants
1. **Tuile grisée** : Vérifier la connexion Supabase
2. **Liste vide** : Vérifier les données en base
3. **PDF vide** : Vérifier les permissions d'écriture
4. **Erreur de génération** : Vérifier la console pour les détails

### Logs utiles
- Console navigateur pour les erreurs JavaScript
- Logs Supabase pour les erreurs de base de données
- Messages d'erreur affichés à l'utilisateur

## 📝 Notes de développement

### Architecture
- Page HTML autonome avec CSS/JS intégrés
- Utilisation des configurations Supabase existantes
- Intégration dans l'écosystème JPSI

### Performance
- Chargement asynchrone des données
- Pagination automatique des PDF
- Optimisation des requêtes Supabase

### Maintenance
- Code modulaire et documenté
- Gestion d'erreurs robuste
- Compatible avec les évolutions futures

---

**Version** : 1.0.0  
**Date** : Décembre 2024  
**Auteur** : JPSI Development Team 