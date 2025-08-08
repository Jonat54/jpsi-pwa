# 🚀 Déploiement JPSI sur CloudFlare Pages

## 📋 Prérequis

1. **Compte CloudFlare** (gratuit)
2. **Repository Git** (GitHub, GitLab, etc.)
3. **Fichiers du projet** prêts

## 🔧 Étapes de déploiement

### **1. Préparer le repository**

```bash
# Initialiser Git si pas déjà fait
git init
git add .
git commit -m "Initial commit JPSI PWA"
```

### **2. Pousser sur GitHub/GitLab**

```bash
# Créer un repository sur GitHub
# Puis pousser le code
git remote add origin https://github.com/votre-username/jpsi-pwa.git
git push -u origin main
```

### **3. Déployer sur CloudFlare Pages**

1. **Aller sur** https://dash.cloudflare.com/
2. **Cliquer** sur "Pages" dans le menu
3. **Cliquer** sur "Create a project"
4. **Choisir** "Connect to Git"
5. **Sélectionner** votre repository
6. **Configurer** :
   - **Project name** : `jpsi-pwa`
   - **Production branch** : `main`
   - **Framework preset** : `None`
   - **Build command** : (laisser vide)
   - **Build output directory** : `.` (point)
7. **Cliquer** sur "Save and Deploy"

## ⚙️ Configuration

### **Variables d'environnement**

Dans CloudFlare Pages, ajouter ces variables :

```
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

### **Domaines personnalisés**

1. **Dans CloudFlare Pages** → Votre projet
2. **Onglet** "Custom domains"
3. **Ajouter** votre domaine

## 🧪 Test après déploiement

### **1. Test PWA**
- Ouvrir l'URL de déploiement
- Vérifier l'icône "Installer" dans le navigateur
- Tester l'installation sur mobile/tablette

### **2. Test hors ligne**
- Ouvrir les DevTools (F12)
- Onglet "Application" → "Service Workers"
- Vérifier que le Service Worker est actif
- Activer le mode avion et tester

### **3. Test sur différents appareils**
- **Mobile** : Samsung Galaxy Active Tab 3
- **Tablette** : iPad 9th generation
- **Smartphone** : iPhone SE 2, iPhone 15 Pro

## 🔍 Diagnostic

### **URLs de test**
- **Diagnostic PWA** : `https://votre-domaine.pages.dev/diagnostic-pwa.html`
- **Test hors ligne** : `https://votre-domaine.pages.dev/test-offline-simple.html`

### **Outils de diagnostic**
- **Lighthouse** : Audit PWA
- **DevTools** : Vérification Service Worker
- **Network tab** : Vérification cache

## 🐛 Résolution de problèmes

### **Service Worker ne s'installe pas**
- Vérifier HTTPS
- Vérifier les en-têtes dans `_headers`
- Vérifier le scope dans `service-worker.js`

### **Cache ne fonctionne pas**
- Vérifier les logs dans DevTools
- Vérifier la stratégie de cache
- Vider le cache et retester

### **PWA ne s'installe pas**
- Vérifier le `manifest.json`
- Vérifier les icônes
- Vérifier les critères d'installation

## 📱 Optimisations pour mobile

### **Performance**
- Images optimisées
- CSS/JS minifiés
- Cache agressif

### **UX**
- Boutons tactiles (44px minimum)
- Navigation intuitive
- Feedback visuel

## 🔄 Mises à jour

### **Déploiement automatique**
- Chaque push sur `main` déclenche un déploiement
- Preview automatique sur les branches

### **Rollback**
- Dans CloudFlare Pages → Deployments
- Cliquer sur un ancien déploiement
- "Redeploy" pour revenir en arrière
