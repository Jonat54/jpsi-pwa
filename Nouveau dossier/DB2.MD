# 📚 Référence de la Base de Données JPSI (Supabase) - VERSION 2

Ce fichier sera mis à jour avec le schéma réel de la base de données Supabase.

**Instructions :**
1. Ouvrez `direct_inventory.html` dans votre navigateur
2. Attendez que l'analyse soit terminée
3. Cliquez sur "📄 Générer DB.MD"
4. Copiez le contenu généré
5. Collez-le ici pour remplacer ce texte

---

## 📊 Statistiques de la base de données
- **Tables :** À déterminer
- **Colonnes totales :** À déterminer
- **Clés primaires :** À déterminer
- **Clés étrangères :** À déterminer

---

# 📚 Référence de la Base de Données JPSI (Supabase)

Ce document décrit la structure complète de la base de données telle qu'observée dans les schémas fournis. Il sert de référence unique pour tout le projet.

**Dernière mise à jour :** 27/07/2025
**Généré automatiquement depuis Supabase**

---

## 📊 Statistiques de la base de données
- **Tables :** 12
- **Colonnes totales :** 135
- **Clés primaires :** 1
- **Clés étrangères :** 20

---

## 🏷️ Table : clients
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_client | integer | OUI | - | FK | À documenter |
| code_client | text | OUI | - | - | À documenter |
| nom_client | text | OUI | - | - | À documenter |
| adr_client | text | OUI | - | - | À documenter |
| tel_client | text | OUI | - | - | À documenter |
| mail_client | text | OUI | - | - | À documenter |
| siren_client | text | OUI | - | - | À documenter |
| resp_client | text | OUI | - | - | À documenter |
| mailresp_client | text | OUI | - | - | À documenter |
| telresp_client | text | OUI | - | - | À documenter |
| ville_client | text | OUI | - | - | À documenter |
| cp_client | text | OUI | - | - | À documenter |
| token | text | OUI | - | - | À documenter |

**Enregistrements :** 8

---

## 🏷️ Table : sites
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_site | integer | OUI | - | FK | À documenter |
| id_client | integer | OUI | - | FK | À documenter |
| adr_site | text | OUI | - | - | À documenter |
| ville_site | text | OUI | - | - | À documenter |
| cp_site | text | OUI | - | - | À documenter |
| resp_site | text | OUI | - | - | À documenter |
| telresp_site | unknown | OUI | - | - | À documenter |
| mailresp_site | unknown | OUI | - | - | À documenter |
| num_site | text | OUI | - | - | À documenter |
| nom_site | text | OUI | - | - | À documenter |
| famille_site | unknown | OUI | - | - | À documenter |
| typeerp_site | unknown | OUI | - | - | À documenter |
| caterp_site | unknown | OUI | - | - | À documenter |
| lastcomm_site | unknown | OUI | - | - | À documenter |

**Enregistrements :** 35

---

## 🏷️ Table : alarmes
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_alarme | integer | OUI | - | FK | À documenter |
| id_site | integer | OUI | - | FK | À documenter |
| type_alarme | text | OUI | - | - | À documenter |
| marque_alarme | text | OUI | - | - | À documenter |
| modele_alarme | text | OUI | - | - | À documenter |
| notes_alarme | text | OUI | - | - | À documenter |
| last_alarme | text | OUI | - | - | À documenter |

**Enregistrements :** 16

---

## 🏷️ Table : peripheriques
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_periph | integer | OUI | - | FK | À documenter |
| id_alarme | integer | OUI | - | FK | À documenter |
| type_periph | text | OUI | - | - | À documenter |
| marque_periph | text | OUI | - | - | À documenter |
| modele_periph | unknown | OUI | - | - | À documenter |
| loc_periph | text | OUI | - | - | À documenter |
| etat_periph | boolean | OUI | - | - | À documenter |
| ok_periph | boolean | OUI | - | - | À documenter |
| note_periph | unknown | OUI | - | - | À documenter |
| last_periph | text | OUI | - | - | À documenter |

**Enregistrements :** 19

---

## 🏷️ Table : eclairages
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_ecl | integer | OUI | - | FK | À documenter |
| id_site | integer | OUI | - | FK | À documenter |
| num_ecl | text | OUI | - | - | À documenter |
| niv_ecl | text | OUI | - | - | À documenter |
| loc_ecl | text | OUI | - | - | À documenter |
| marque_ecl | text | OUI | - | - | À documenter |
| modele_ecl | text | OUI | - | - | À documenter |
| family_ecl | text | OUI | - | - | À documenter |
| mes_ecl | text | OUI | - | - | À documenter |
| ip_ecl | text | OUI | - | - | À documenter |
| sati_ecl | boolean | OUI | - | - | À documenter |
| telecommande_ecl | boolean | OUI | - | - | À documenter |
| etat_batterie_ecl | boolean | OUI | - | - | À documenter |
| orientation_ecl | boolean | OUI | - | - | À documenter |
| obs_ecl | text | OUI | - | - | À documenter |
| last_ecl | unknown | OUI | - | - | À documenter |
| lcie_ecl | unknown | OUI | - | - | À documenter |
| ampveille_es | unknown | OUI | - | - | À documenter |
| ampsecours_es | unknown | OUI | - | - | À documenter |

**Enregistrements :** 343

---

## 🏷️ Table : desenfumages
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_desenfumage | integer | OUI | - | FK | À documenter |
| id_site | integer | OUI | - | FK | À documenter |
| equipement_desenfumage | text | OUI | - | - | À documenter |
| explication_installation | text | OUI | - | - | À documenter |
| created_at | text | OUI | - | - | À documenter |
| updated_at | text | OUI | - | - | À documenter |

**Enregistrements :** 3

---

## 🏷️ Table : extincteurs
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_ext | integer | OUI | - | FK | À documenter |
| id_site | integer | OUI | - | FK | À documenter |
| num_ext | text | OUI | - | - | À documenter |
| niv_ext | text | OUI | - | - | À documenter |
| loc_ext | text | OUI | - | - | À documenter |
| marque_ext | text | OUI | - | - | À documenter |
| modele_ext | text | OUI | - | - | À documenter |
| agent_ext | text | OUI | - | - | À documenter |
| mes_ext | unknown | OUI | - | - | À documenter |
| rcm_ext | unknown | OUI | - | - | À documenter |
| maa_ext | unknown | OUI | - | - | À documenter |
| eie_ext | unknown | OUI | - | - | À documenter |
| pcf_ext | boolean | OUI | - | - | À documenter |
| cert_ext | unknown | OUI | - | - | À documenter |
| obs_ext | unknown | OUI | - | - | À documenter |
| last_ext | unknown | OUI | - | - | À documenter |
| papp_ext | unknown | OUI | - | - | À documenter |
| capa_ext | unknown | OUI | - | - | À documenter |

**Enregistrements :** 216

---

## 🏷️ Table : fire_extinguisher_certification_registry
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id | integer | OUI | - | PK  | À documenter |
| marque | text | OUI | - | - | À documenter |
| modele | text | OUI | - | - | À documenter |
| certification | text | OUI | - | - | À documenter |
| capacit | integer | OUI | - | - | À documenter |
| id_agent | integer | OUI | - | FK | À documenter |
| pression | boolean | OUI | - | - | À documenter |

**Enregistrements :** 33

---

## 🏷️ Table : eclairage_catalogue
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_catalogue_es | integer | OUI | - | FK | À documenter |
| lcie_es | text | OUI | - | - | À documenter |
| marque_es | text | OUI | - | - | À documenter |
| modele_es | text | OUI | - | - | À documenter |
| famille_es | text | OUI | - | - | À documenter |
| ampveille_es | text | OUI | - | - | À documenter |
| ampsecours_es | text | OUI | - | - | À documenter |
| ip_es | text | OUI | - | - | À documenter |
| sati_es | boolean | OUI | - | - | À documenter |

**Enregistrements :** 19

---

## 🏷️ Table : prospects
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_prospect | integer | OUI | - | FK | À documenter |
| code_prospect | unknown | OUI | - | - | À documenter |
| nom_prospect | text | OUI | - | - | À documenter |
| adr_prospect | text | OUI | - | - | À documenter |
| tel_prospect | text | OUI | - | - | À documenter |
| mail_prospect | text | OUI | - | - | À documenter |
| siren_prospect | text | OUI | - | - | À documenter |
| resp_prospect | text | OUI | - | - | À documenter |
| mailresp_prospect | text | OUI | - | - | À documenter |
| telresp_prospect | text | OUI | - | - | À documenter |
| ville_prospect | text | OUI | - | - | À documenter |
| cp_prospect | text | OUI | - | - | À documenter |

**Enregistrements :** 1

---

## 🏷️ Table : audits
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_audit | integer | OUI | - | FK | À documenter |
| id_prospect | integer | OUI | - | FK | À documenter |
| num_audit | integer | OUI | - | - | À documenter |
| date_audit_site | text | OUI | - | - | À documenter |
| observation_site | text | OUI | - | - | À documenter |
| statut | text | OUI | - | - | À documenter |
| date_devis | text | OUI | - | - | À documenter |
| montant_devis | unknown | OUI | - | - | À documenter |
| date_reception_commande | unknown | OUI | - | - | À documenter |
| date_pose_prevue | unknown | OUI | - | - | À documenter |
| date_pose_intervention | unknown | OUI | - | - | À documenter |
| created_at | text | OUI | - | - | À documenter |
| updated_at | text | OUI | - | - | À documenter |

**Enregistrements :** 1

---

## 🏷️ Table : audit_equipements
| Champ | Type | Nullable | Default | Clés | Description |
|-------|------|----------|---------|------|-------------|
| id_equipement | integer | OUI | - | FK | À documenter |
| id_audit | integer | OUI | - | FK | À documenter |
| type_extincteur | text | OUI | - | - | À documenter |
| localisation | text | OUI | - | - | À documenter |
| justification | text | OUI | - | - | À documenter |
| quantite | integer | OUI | - | - | À documenter |
| created_at | text | OUI | - | - | À documenter |

**Enregistrements :** 6

---


*En attente de l'analyse de la base de données...* 