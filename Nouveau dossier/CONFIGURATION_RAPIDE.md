# ⚡ Configuration rapide Resend

## Étape 1 : Récupérer votre clé API Resend

1. Dans l'interface Resend que vous voyez
2. Cliquez sur **"Add API Key"** 
3. Copiez la clé générée (commence par `re_`)
4. Remplacez `re_votre_clé_api_resend_ici` dans le fichier `config.env`

## Étape 2 : Déployer la fonction

### Option A : Script automatique (Windows)
```bash
# Double-cliquez sur deploy-email-function.bat
# Ou exécutez dans PowerShell :
.\deploy-email-function.bat
```

### Option B : Manuel
```bash
# 1. Connexion
npx supabase login

# 2. Lier le projet
npx supabase link --project-ref anyzqzhjvankvbbajahj

# 3. Configurer les variables (remplacez par votre vraie clé)
npx supabase secrets set RESEND_API_KEY=re_votre_clé_api_resend
npx supabase secrets set FROM_EMAIL=contact@jpsincendie.com

# 4. Déployer
npx supabase functions deploy send-email
```

## Étape 3 : Tester

1. Ouvrez votre application
2. Allez sur un rapport ou audit
3. Essayez d'envoyer un email
4. Vérifiez que l'email arrive

## 🔧 Configuration manuelle (Dashboard Supabase)

Si les commandes CLI ne fonctionnent pas :

1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `anyzqzhjvankvbbajahj`
3. **Settings** → **Edge Functions**
4. Ajoutez ces variables :
   - `RESEND_API_KEY` = votre_clé_resend
   - `FROM_EMAIL` = contact@jpsincendie.com

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Dashboard Resend** : Vérifiez que les emails sont envoyés
2. **Logs Supabase** : Vérifiez les logs de la fonction
3. **Application** : Testez l'envoi d'un email

## 🆘 En cas de problème

1. **Clé API invalide** : Vérifiez que la clé commence par `re_`
2. **Fonction non trouvée** : Vérifiez que le déploiement a réussi
3. **Email non reçu** : Vérifiez les logs dans Resend

## 📧 Test rapide

Vous pouvez tester directement avec curl :

```bash
curl -X POST https://anyzqzhjvankvbbajahj.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueXpxemhqdmFua3ZiYmFqYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTIzMjgsImV4cCI6MjA2NjMyODMyOH0.74pICcGtU_Ks0COTtPsSOQ8qtLfOzRHTNa1A41BAiMU" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "votre_email@example.com",
    "verification_number": "TEST-2024-0001",
    "client_name": "Client Test",
    "site_name": "Site Test"
  }'
``` 