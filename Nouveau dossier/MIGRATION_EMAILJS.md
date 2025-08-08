# Migration d'EmailJS vers Supabase Edge Functions

## Problème avec EmailJS

EmailJS présente plusieurs limitations :
- Limite de taille des pièces jointes (50KB)
- Dépendance à un service tiers
- Coûts variables selon l'utilisation
- Limitations de débit

## Solution : Supabase Edge Functions + SendGrid

### Avantages
- ✅ Intégration native avec Supabase
- ✅ Pas de limite de taille (jusqu'à 6MB)
- ✅ Coûts prévisibles
- ✅ Meilleure fiabilité
- ✅ Contrôle total sur l'envoi

### Configuration requise

#### 1. Installer Supabase CLI
```bash
npm install -g supabase
```

#### 2. Se connecter à votre projet
```bash
supabase login
supabase link --project-ref anyzqzhjvankvbbajahj
```

#### 3. Configurer SendGrid
1. Créer un compte sur [SendGrid](https://sendgrid.com)
2. Créer une API Key
3. Configurer les variables d'environnement :

```bash
supabase secrets set SENDGRID_API_KEY=votre_clé_api_sendgrid
supabase secrets set FROM_EMAIL=contact@jpsincendie.com
```

#### 4. Déployer la Edge Function
```bash
supabase functions deploy send-email
```

### Utilisation

#### Ancien code (EmailJS) :
```javascript
// Configuration EmailJS
const EMAILJS_USER_ID = '9wc-GWt_CQLmw3nsQ';
const EMAILJS_SERVICE_ID = 'service_xmox6ja';
const EMAILJS_TEMPLATE_ID = 'template_34y9rs8';

// Initialisation
emailjs.init(EMAILJS_USER_ID);

// Envoi
const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
```

#### Nouveau code (Supabase Edge Function) :
```javascript
// Fonction d'envoi
async function sendEmail(emailData) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: emailData
  });
  
  if (error) throw new Error(error.message);
  return data;
}

// Envoi
const response = await sendEmail({
  to_email: 'destinataire@example.com',
  verification_number: '2024-0001',
  client_name: 'Nom du client',
  site_name: 'Nom du site',
  pdf_attachment: 'base64_du_pdf'
});
```

### Services d'email alternatifs

Si vous préférez ne pas utiliser SendGrid, voici d'autres options :

#### Resend
- Plus simple à configurer
- Interface moderne
- Bonne documentation

#### Mailgun
- Très fiable
- Bonnes performances
- API robuste

#### AWS SES
- Très économique
- Intégration AWS
- Plus complexe à configurer

### Fichiers modifiés

1. `rapport.html` - Suppression d'EmailJS, ajout de la fonction `sendEmail()`
2. `auditDetail.html` - Suppression d'EmailJS, ajout de la fonction `sendEmail()`
3. `supabase/functions/send-email/index.ts` - Nouvelle Edge Function
4. `supabase/functions/send-email/README.md` - Documentation de la fonction

### Tests

Pour tester la migration :

1. **Test local** :
```bash
supabase start
# Tester avec l'interface web
```

2. **Test en production** :
```bash
supabase functions deploy send-email
# Tester l'envoi d'email depuis l'application
```

### Monitoring

La Edge Function inclut des logs détaillés :
- Succès d'envoi
- Erreurs avec détails
- Taille des pièces jointes
- Temps de traitement

### Coûts

- **SendGrid** : ~$15/mois pour 50k emails
- **Supabase Edge Functions** : Gratuit jusqu'à 500k invocations/mois
- **Total estimé** : ~$15/mois vs EmailJS qui peut varier selon l'usage

### Support

En cas de problème :
1. Vérifier les logs dans Supabase Dashboard
2. Tester la fonction directement
3. Vérifier la configuration SendGrid
4. Consulter la documentation SendGrid 