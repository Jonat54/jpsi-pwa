# Edge Function - Envoi d'emails (Solutions GRATUITES)

Cette Edge Function remplace EmailJS pour l'envoi d'emails avec pièces jointes PDF.

## 🆓 Solutions GRATUITES recommandées

### 1. **Resend (RECOMMANDÉ)**
- ✅ **3,000 emails GRATUITS par mois**
- ✅ Configuration simple
- ✅ Interface moderne
- ✅ Excellente délivrabilité

### 2. **Brevo (anciennement Sendinblue)**
- ✅ **300 emails GRATUITS par jour**
- ✅ Interface en français
- ✅ Support français
- ✅ Très fiable

### 3. **Mailgun**
- ✅ **5,000 emails GRATUITS pendant 3 mois**
- ✅ Puis 100 emails/mois gratuits
- ✅ Très professionnel

## Configuration Resend (Recommandé)

### 1. Installer Supabase CLI
```bash
npm install -g supabase
```

### 2. Créer un compte Resend
1. Aller sur [resend.com](https://resend.com)
2. Créer un compte gratuit
3. Vérifier votre domaine ou utiliser leur domaine de test
4. Créer une API Key

### 3. Configurer les variables d'environnement
```bash
supabase secrets set RESEND_API_KEY=re_votre_clé_api_resend
supabase secrets set FROM_EMAIL=contact@jpsincendie.com
```

### 4. Déployer la fonction
```bash
supabase functions deploy send-email
```

## Configuration Brevo (Alternative)

Si vous préférez Brevo :

### 1. Créer un compte Brevo
1. Aller sur [brevo.com](https://brevo.com)
2. Créer un compte gratuit
3. Aller dans API Keys
4. Créer une nouvelle clé API

### 2. Modifier la fonction pour Brevo
```typescript
// Remplacer dans index.ts
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

const response = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'api-key': BREVO_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sender: { email: FROM_EMAIL },
    to: [{ email: to_email }],
    subject: emailSubject,
    textContent: emailContent,
    attachment: [{
      name: filename,
      content: pdf_attachment
    }]
  })
})
```

### 3. Configurer Brevo
```bash
supabase secrets set BREVO_API_KEY=votre_clé_api_brevo
```

## Utilisation

### Depuis le frontend JavaScript :
```javascript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to_email: 'destinataire@example.com',
    verification_number: '2024-0001',
    client_name: 'Nom du client',
    site_name: 'Nom du site',
    pdf_attachment: 'base64_du_pdf'
  }
})
```

## Comparaison des solutions gratuites

| Service | Emails gratuits | Limite taille | Configuration | Support |
|---------|----------------|---------------|---------------|---------|
| **Resend** | 3,000/mois | 25MB | Très simple | Excellent |
| **Brevo** | 300/jour | 10MB | Simple | Français |
| **Mailgun** | 5,000 (3mois) | 25MB | Moyen | Bon |

## Pour votre usage (20 emails/semaine)

- **Resend** : 3,000 emails/mois = 750 emails/semaine ✅
- **Brevo** : 300 emails/jour = 2,100 emails/semaine ✅
- **Mailgun** : 100 emails/mois après 3 mois ❌

## Recommandation finale

**Utilisez Resend** car :
- 3,000 emails gratuits couvrent largement vos besoins
- Configuration ultra-simple
- Excellente délivrabilité
- Interface moderne
- Support réactif 