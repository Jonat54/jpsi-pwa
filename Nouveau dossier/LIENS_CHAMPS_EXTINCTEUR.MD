# 🔗 Liens entre les champs du formulaire et les tables de la base de données

## 📋 Formulaire d'ajout d'extincteur (`extSite.html`)

### 🧯 Table : `extincteurs` (table principale)

| Champ du formulaire | ID HTML | Type | Table | Champ DB | Description |
|-------------------|---------|------|-------|----------|-------------|
| **Numéro** | `num_ext` | text | `extincteurs` | `num_ext` | Numéro de l'extincteur |
| **Niveau** | `niv_ext` | text | `extincteurs` | `niv_ext` | Niveau/étage |
| **Localisation** | `loc_ext` | text | `extincteurs` | `loc_ext` | Localisation |
| **Marque** | `marque_ext` | text | `extincteurs` | `marque_ext` | Marque de l'extincteur |
| **Modèle** | `modele_ext` | text | `extincteurs` | `modele_ext` | Modèle de l'extincteur |
| **Agent** | `agent_ext` | select | `extincteurs` | `agent_ext` | Référence vers `AgentExtincteur.id_agt` |
| **Capacité** | `capa_ext` | select | `extincteurs` | `capa_ext` | Capacité (ex: 6kg, 2Lt) |
| **RCM** | `rcm_ext` | text | `extincteurs` | `rcm_ext` | Date recharge/contrôle |
| **MAA** | `maa_ext` | text | `extincteurs` | `maa_ext` | Date maintenance annuelle |
| **EIE** | `eie_ext` | text | `extincteurs` | `eie_ext` | Date épreuve interne/externe |
| **Panneau** | `pcf_ext` | checkbox | `extincteurs` | `pcf_ext` | Pression/contrôle faite |
| **Certification** | `cert_ext` | text | `extincteurs` | `cert_ext` | Numéro de certificat |
| **Site** | - | - | `extincteurs` | `id_site` | Référence vers `sites.id_site` |

---

## 🔍 Table : `fire_extinguisher_certification_registry` (registre de certification)

### Fonction de recherche automatique
Quand l'utilisateur saisit un numéro de certification et clique sur 🔍 :

| Champ recherché | Champ retourné | Table | Champ DB | Utilisation |
|----------------|----------------|-------|----------|-------------|
| `cert_ext` | `marque` | `fire_extinguisher_certification_registry` | `marque` | Remplit `marque_ext` |
| `cert_ext` | `modele` | `fire_extinguisher_certification_registry` | `modele` | Remplit `modele_ext` |
| `cert_ext` | `agent` | `fire_extinguisher_certification_registry` | `agent` | Remplit `agent_ext` |
| `cert_ext` | `capacit` | `fire_extinguisher_certification_registry` | `capacit` | Remplit `capa_ext` |

---

## 🧪 Table : `AgentExtincteur` (référentiel des agents)

### Chargement dynamique des options

| Champ du formulaire | ID HTML | Table | Champ DB | Description |
|-------------------|---------|-------|----------|-------------|
| **Agent** | `agent_ext` | `AgentExtincteur` | `id_agt` | Clé primaire |
| - | - | `AgentExtincteur` | `long_agt` | Texte affiché dans le select |
| - | - | `AgentExtincteur` | `court_agt` | Nom court (non utilisé) |

**Fonction :** `loadAgents()` charge tous les agents triés par `long_agt`

---

## 🔄 Relations entre les tables

### 1. **extincteurs → sites**
- `extincteurs.id_site` → `sites.id_site`
- **Type :** Clé étrangère
- **Usage :** Lier l'extincteur au site

### 2. **extincteurs → AgentExtincteur**
- `extincteurs.agent_ext` → `AgentExtincteur.id_agt`
- **Type :** Clé étrangère
- **Usage :** Définir le type d'agent de l'extincteur

### 3. **extincteurs ↔ fire_extinguisher_certification_registry**
- `extincteurs.cert_ext` ↔ `fire_extinguisher_certification_registry.certification`
- **Type :** Correspondance de valeurs (pas de clé étrangère)
- **Usage :** Recherche automatique des informations de certification

---

## ⚙️ Logique métier

### 🔍 **Recherche de certification**
```javascript
// Quand l'utilisateur saisit un numéro de certification
searchCertification() {
  // 1. Recherche dans fire_extinguisher_certification_registry
  // 2. Si trouvé, remplit automatiquement :
  //    - marque_ext ← marque
  //    - modele_ext ← modele  
  //    - agent_ext ← agent (recherche dans AgentExtincteur)
  //    - capa_ext ← capacit
}
```

### 📊 **Mise à jour des capacités selon l'agent**
```javascript
// Quand l'utilisateur change l'agent
updateCapaOptions() {
  // Selon l'agent sélectionné, charge les capacités appropriées :
  // - Poudre : 1kg, 2kg, 3kg, 4kg, 6kg, 9kg, 25kg, 50kg, 100kg, 150kg
  // - CO2 : 2kg, 5kg, 10kg, 20kg
  // - Eau : 2Lt, 6Lt, 9Lt, 45Lt, 50Lt, 100Lt, 150Lt
}
```

### 🚫 **Désactivation MAA/EIE**
```javascript
// Pour les extincteurs CO2, désactive les champs MAA et EIE
updateMaaEieDisabled() {
  // Si agent contient 'co2' ou 'dioxyde' → désactive maa_ext et eie_ext
}
```

---

## 📝 Validation des données

### ✅ **Champs obligatoires**
- `num_ext` : Numéro de l'extincteur
- `loc_ext` : Localisation

### 🔄 **Conversion des dates**
- RCM, MAA, EIE : Format AAAA → AAAA-01-01
- Si format invalide → null

### 🎯 **Types de données**
- `pcf_ext` : boolean (checkbox)
- `papp_ext` : boolean (checkbox)
- `agent_ext` : integer (référence AgentExtincteur)
- `id_site` : integer (référence sites)

---

**Ce document sert de référence pour comprendre les liens entre l'interface utilisateur et la structure de la base de données.** 