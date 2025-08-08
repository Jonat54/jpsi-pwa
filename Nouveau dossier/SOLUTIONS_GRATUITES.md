# 🆓 Solutions GRATUITES pour remplacer EmailJS

## Pourquoi remplacer EmailJS ?

- ❌ Limite de 50KB pour les pièces jointes
- ❌ Coûts variables selon l'usage
- ❌ Dépendance à un service tiers
- ❌ Limitations de débit

## Solutions GRATUITES recommandées

### 🥇 **1. Resend (RECOMMANDÉ)**
- ✅ **3,000 emails GRATUITS par mois**
- ✅ Configuration ultra-simple
- ✅ Interface moderne
- ✅ Excellente délivrabilité
- ✅ Support réactif

### 🥈 **2. Brevo (anciennement Sendinblue)**
- ✅ **300 emails GRATUITS par jour**
- ✅ Interface en français
- ✅ Support français
- ✅ Très fiable
- ✅ Entreprise française

### 🥉 **3. Mailgun**
- ✅ **5,000 emails GRATUITS pendant 3 mois**
- ✅ Puis 100 emails/mois gratuits
- ✅ Très professionnel
- ✅ API robuste

## Configuration Resend (Recommandé)

### Étape 1 : Créer un compte Resend
1. Aller sur [resend.com](https://resend.com)
2. Cliquer sur "Get Started"
3. Créer un compte gratuit
4. Vérifier votre email

### Étape 2 : Configurer votre domaine
1. Dans le dashboard, aller dans "Domains"
2. Ajouter votre domaine ou utiliser leur domaine de test
3. Suivre les instructions de vérification

### Étape 3 : Créer une API Key
1. Aller dans "API Keys"
2. Cliquer sur "Create API Key"
3. Copier la clé (commence par `re_`)

### Étape 4 : Configurer Supabase
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet
supabase link --project-ref anyzqzhjvankvbbajahj

# Configurer les variables
supabase secrets set RESEND_API_KEY=re_votre_clé_api
supabase secrets set FROM_EMAIL=contact@jpsincendie.com

# Déployer la fonction
supabase functions deploy send-email
```

## Configuration Brevo (Alternative)

### Étape 1 : Créer un compte Brevo
1. Aller sur [brevo.com](https://brevo.com)
2. Créer un compte gratuit
3. Vérifier votre email

### Étape 2 : Configurer l'expéditeur
1. Aller dans "Senders & IP"
2. Ajouter votre email d'expédition
3. Vérifier l'email reçu

### Étape 3 : Créer une API Key
1. Aller dans "API Keys"
2. Cliquer sur "Create a new API key"
3. Copier la clé

### Étape 4 : Configurer Supabase
```bash
# Configurer Brevo
supabase secrets set BREVO_API_KEY=votre_clé_api_brevo
supabase secrets set FROM_EMAIL=contact@jpsincendie.com

# Déployer la fonction Brevo
supabase functions deploy send-email-brevo
```

## Comparaison pour votre usage (20 emails/semaine)

| Service | Emails gratuits | Votre usage | Marge | Recommandation |
|---------|----------------|-------------|-------|----------------|
| **Resend** | 3,000/mois | 80/mois | 2,920 | ✅ Parfait |
| **Brevo** | 300/jour | 80/mois | 8,920 | ✅ Excellent |
| **Mailgun** | 100/mois | 80/mois | 20 | ⚠️ Limite |

## Test de la configuration

### Test avec Resend
```bash
# Tester la fonction
curl -X POST https://anyzqzhjvankvbbajahj.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer votre_anon_key" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "verification_number": "TEST-2024-0001",
    "client_name": "Client Test",
    "site_name": "Site Test"
  }'
```

### Test avec Brevo
```bash
# Tester la fonction Brevo
curl -X POST https://anyzqzhjvankvbbajahj.supabase.co/functions/v1/send-email-brevo \
  -H "Authorization: Bearer votre_anon_key" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "verification_number": "TEST-2024-0001",
    "client_name": "Client Test",
    "site_name": "Site Test"
  }'
```

## Avantages de ces solutions

### vs EmailJS
- ✅ **Gratuit** vs coûts variables
- ✅ **Pas de limite de taille** vs 50KB
- ✅ **Meilleure délivrabilité**
- ✅ **Logs détaillés**
- ✅ **Support professionnel**

### vs Solution payante
- ✅ **Gratuit** vs $15/mois
- ✅ **Suffisant** pour vos besoins
- ✅ **Pas d'engagement**
- ✅ **Facile à changer**

## Recommandation finale

**Utilisez Resend** car :
1. 3,000 emails gratuits couvrent largement vos 80 emails/mois
2. Configuration ultra-simple
3. Excellente délivrabilité
4. Interface moderne et intuitive
5. Support réactif

**Alternative : Brevo** si vous préférez :
- Interface en français
- Support français
- Entreprise européenne

## Support

En cas de problème :
1. **Resend** : [docs.resend.com](https://docs.resend.com)
2. **Brevo** : [developers.brevo.com](https://developers.brevo.com)
3. **Supabase** : [supabase.com/docs](https://supabase.com/docs)

## Migration

La migration est transparente pour vos utilisateurs. Les fichiers HTML ont déjà été modifiés pour utiliser la nouvelle fonction `sendEmail()` qui fonctionne avec les deux services. 