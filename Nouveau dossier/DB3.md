# 📚 Référence complète de la Base de Données JPSI (Supabase) - DB3.md

Ce document contient la structure complète et actuelle de la base de données JPSI. Il sert de référence officielle pour tout le projet.

**Dernière mise à jour :** Structure complète extraite de la base de données

---

## 🧑‍💼 Table : clients
| Champ            | Type    | Description                        |
|------------------|---------|------------------------------------|
| id_client        | int4    | Clé primaire (auto-increment)      |
| code_client      | varchar(10) | Code unique client               |
| nom_client       | varchar(255) | Nom du client                    |
| adr_client       | text    | Adresse complète                  |
| tel_client       | varchar(20) | Téléphone                        |
| mail_client      | varchar(255) | Email                            |
| siren_client     | varchar(9) | SIREN                            |
| resp_client      | varchar(255) | Responsable                      |
| mailresp_client  | varchar(255) | Email du responsable             |
| telresp_client   | varchar(20) | Téléphone du responsable         |
| ville_client     | varchar(100) | Ville                            |
| cp_client        | varchar(10) | Code postal                      |
| token            | uuid    | Token d'authentification          |

---

## 🏢 Table : sites
| Champ            | Type    | Description                        |
|------------------|---------|------------------------------------|
| id_site          | int4    | Clé primaire (auto-increment)      |
| id_client        | int4    | Référence client                   |
| adr_site         | varchar(255) | Adresse du site                  |
| ville_site       | varchar(100) | Ville                             |
| cp_site          | varchar(10) | Code postal                       |
| resp_site        | varchar(255) | Responsable site                  |
| telresp_site     | varchar(20) | Téléphone responsable site        |
| mailresp_site    | varchar(255) | Email responsable site            |
| num_site         | varchar(20) | Numéro interne site               |
| nom_site         | varchar(255) | Nom du site                       |
| famille_site     | text    | Famille ERP                       |
| typeerp_site     | text    | Type ERP (code lettre)            |
| caterp_site      | int2    | Catégorie ERP (1, 2, 3, 4, 5)    |
| lastcomm_site    | date    | Date dernière commission sécurité  |

---

## 🚨 Table : alarmes
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_alarme        | int4        | Clé primaire (auto-increment)      |
| id_site          | int4        | Référence site                     |
| type_alarme      | varchar(50) | Type d'alarme                      |
| marque_alarme    | varchar(50) | Marque                             |
| modele_alarme    | varchar(50) | Modèle                             |
| notes_alarme     | text        | Notes                              |
| last_alarme      | timestamptz | Date du dernier contrôle           |

---

## 🖲️ Table : peripheriques
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_periph        | int4        | Clé primaire (auto-increment)      |
| id_alarme        | int4        | Référence alarme                   |
| type_periph      | varchar(50) | Type de périphérique               |
| marque_periph    | varchar(100) | Marque                            |
| modele_periph    | varchar(100) | Modèle                            |
| loc_periph       | varchar(255) | Localisation                      |
| etat_periph      | bool        | État (fonctionnel ou non)          |
| ok_periph        | bool        | Statut OK                          |
| note_periph      | text        | Note                               |
| last_periph      | timestamp   | Date du dernier contrôle           |

---

## 💡 Table : eclairages
| Champ              | Type    | Description                        |
|--------------------|---------|------------------------------------|
| id_ecl             | int4    | Clé primaire (auto-increment)      |
| id_site            | int4    | Référence site                     |
| num_ecl            | varchar(50) | Numéro d'éclairage                |
| niv_ecl            | varchar(50) | Niveau/étage                       |
| loc_ecl            | varchar(255) | Localisation                      |
| marque_ecl         | varchar(100) | Marque                            |
| modele_ecl         | varchar(100) | Modèle                            |
| family_ecl         | varchar(100) | Famille/type                       |
| mes_ecl            | varchar(4) | Mesure/puissance                  |
| ip_ecl             | varchar(50) | Indice de protection               |
| sati_ecl           | bool    | Saturation                          |
| telecommande_ecl   | bool    | Présence télécommande               |
| etat_batterie_ecl  | bool    | État batterie                       |
| orientation_ecl    | bool    | Orientation                         |
| obs_ecl            | text    | Observations                        |
| last_ecl           | date    | Date du dernier contrôle            |
| lcie_ecl           | text    | Référence LCIE                      |
| ampveille_es       | varchar | Ampérage en veille                 |
| ampsecours_es      | varchar | Ampérage en secours                |

---

## 🧯 Table : extincteurs
| Champ        | Type    | Description                        |
|------------- |---------|------------------------------------|
| id_ext       | int4    | Clé primaire (auto-increment)      |
| id_site      | int4    | Référence site                     |
| num_ext      | varchar(50) | Numéro extincteur                 |
| niv_ext      | varchar(50) | Niveau/étage                       |
| loc_ext      | varchar(255) | Localisation                      |
| marque_ext   | varchar(100) | Marque                            |
| modele_ext   | varchar(100) | Modèle                            |
| agent_ext    | text    | Agent extincteur                   |
| mes_ext      | date    | Date mesure                        |
| rcm_ext      | date    | Date recharge/contrôle             |
| maa_ext      | date    | Date maintenance annuelle          |
| eie_ext      | date    | Date épreuve interne/externe        |
| pcf_ext      | bool    | Pression/contrôle faite             |
| papp_ext     | bool    | Pression apparente (PP=allumé, PA=éteint) |
| cert_ext     | varchar(100) | Numéro de certificat              |
| capa_ext     | text    | Capacité de l'extincteur           |
| obs_ext      | text    | Observations                       |
| last_ext     | date    | Date du dernier contrôle           |

---

## 🪟 Table : desenfumages
| Champ                    | Type        | Description                        |
|--------------------------|-------------|------------------------------------|
| id_desenfumage           | int4        | Clé primaire (auto-increment)      |
| id_site                  | int4        | Référence site                     |
| equipement_desenfumage   | varchar(50) | Type d'équipement                  |
| explication_installation | text        | Explication installation           |
| created_at               | timestamptz | Date de création                   |
| updated_at               | timestamptz | Date de mise à jour                |
| descouvr_des             | text        | Découverte désenfumage             |
| obs_des                  | text        | Observations désenfumage           |
| num_des                  | text        | Numéro désenfumage                 |
| localisation_des         | varchar(255) | Localisation désenfumage          |
| last_des                 | date        | Date dernier contrôle              |

---

## 🏗️ Table : installations_desenfumage
| Champ                    | Type        | Description                        |
|--------------------------|-------------|------------------------------------|
| id_installation          | int4        | Clé primaire (auto-increment)      |
| id_site                  | int4        | Référence site                     |
| numero_installation      | varchar(100) | Numéro installation               |
| nom_installation         | varchar(255) | Nom installation                  |
| localisation_installation| varchar(255) | Localisation installation         |
| observations             | text        | Observations                       |
| created_at               | timestamptz | Date de création                   |
| updated_at               | timestamptz | Date de mise à jour                |

---

## 🚪 Table : ouvrants_desenfumage
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_ouvrant       | int4        | Clé primaire (auto-increment)      |
| id_installation  | int4        | Référence installation             |
| numero_ouvrant   | varchar(100) | Numéro ouvrant                    |
| niveau           | varchar(100) | Niveau                             |
| localisation     | varchar(255) | Localisation                       |
| type_ouvrant     | varchar(100) | Type d'ouvrant                     |
| observations     | text        | Observations                       |
| created_at       | timestamptz | Date de création                   |
| updated_at       | timestamptz | Date de mise à jour                |

---

## 🔧 Table : commandes_primaires_desenfumage
| Champ                | Type        | Description                        |
|----------------------|-------------|------------------------------------|
| id_commande_primaire | int4        | Clé primaire (auto-increment)      |
| id_installation      | int4        | Référence installation             |
| numero_commande      | varchar(100) | Numéro commande                   |
| niveau               | varchar(100) | Niveau                             |
| localisation         | varchar(255) | Localisation                       |
| type_commande        | varchar(100) | Type de commande                   |
| grammage_ouverture   | numeric(8,2) | Grammage ouverture                |
| grammage_fermeture   | numeric(8,2) | Grammage fermeture                |
| observations         | text        | Observations                       |
| created_at           | timestamptz | Date de création                   |
| updated_at           | timestamptz | Date de mise à jour                |

---

## 🔧 Table : commandes_secondaires_desenfumage
| Champ                 | Type        | Description                        |
|-----------------------|-------------|------------------------------------|
| id_commande_secondaire| int4        | Clé primaire (auto-increment)      |
| id_installation       | int4        | Référence installation             |
| numero_commande       | varchar(100) | Numéro commande                   |
| niveau                | varchar(100) | Niveau                             |
| localisation          | varchar(255) | Localisation                       |
| type_commande         | varchar(100) | Type de commande                   |
| grammage              | numeric(8,2) | Grammage                          |
| observations          | text        | Observations                       |
| created_at            | timestamptz | Date de création                   |
| updated_at            | timestamptz | Date de mise à jour                |

---

## 🔗 Table : liaison_commande_primaire_secondaire
| Champ                 | Type        | Description                        |
|-----------------------|-------------|------------------------------------|
| id_liaison            | int4        | Clé primaire (auto-increment)      |
| id_commande_primaire  | int4        | Référence commande primaire        |
| id_commande_secondaire| int4        | Référence commande secondaire      |
| created_at            | timestamptz | Date de création                   |

---

## 🔗 Table : liaison_ouvrant_commande_primaire
| Champ                 | Type        | Description                        |
|-----------------------|-------------|------------------------------------|
| id_liaison            | int4        | Clé primaire (auto-increment)      |
| id_ouvrant            | int4        | Référence ouvrant                  |
| id_commande_primaire  | int4        | Référence commande primaire        |
| created_at            | timestamptz | Date de création                   |

---

## 📋 Table : verifications
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_verification  | int4        | Clé primaire (auto-increment)      |
| id_intervention  | int4        | Référence intervention              |
| date_verification| timestamptz | Date de vérification               |
| type_equipement  | varchar(50) | Type d'équipement                  |
| id_equipement    | int4        | ID de l'équipement                 |
| etat_verification| varchar(20) | État de la vérification            |
| observations     | text        | Observations                       |
| created_at       | timestamptz | Date de création                   |

---

## 📊 Table : interventions
| Champ                | Type        | Description                        |
|----------------------|-------------|------------------------------------|
| id_intervention      | int4        | Clé primaire (auto-increment)      |
| numero_intervention  | varchar(20) | Numéro intervention                |
| id_site              | int4        | Référence site                     |
| type_intervention    | varchar(50) | Type d'intervention                |
| scope_equipements    | varchar(100) | Scope des équipements             |
| date_debut           | timestamptz | Date de début                      |
| date_fin             | timestamptz | Date de fin                        |
| etat_intervention    | varchar(20) | État de l'intervention             |
| technicien           | varchar(100) | Technicien                        |
| observations         | text        | Observations                       |
| created_at           | timestamptz | Date de création                   |
| updated_at           | timestamptz | Date de mise à jour                |

---

## 📋 Table : audits
| Champ                | Type        | Description                        |
|----------------------|-------------|------------------------------------|
| id_audit             | int4        | Clé primaire (auto-increment)      |
| id_prospect          | int4        | Référence prospect                 |
| num_audit            | int4        | Numéro d'audit (auto-increment)    |
| date_audit_site      | date        | Date de l'audit                    |
| observation_site     | text        | Observations sur site              |
| statut               | varchar     | Statut (En cours, Terminé, Annulé) |
| date_devis           | date        | Date du devis                      |
| montant_devis        | numeric(10,2) | Montant du devis                  |
| date_reception_commande | date    | Date réception commande           |
| date_pose_prevue     | date        | Date pose prévue                   |
| date_pose_intervention| date        | Date pose intervention             |
| created_at           | timestamptz | Date de création                   |
| updated_at           | timestamptz | Date de mise à jour                |

---

## 🔧 Table : audit_equipements
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_equipement    | int4        | Clé primaire (auto-increment)      |
| id_audit         | int4        | Référence audit                    |
| type_extincteur  | varchar     | Type d'extincteur proposé          |
| localisation     | varchar     | Localisation de l'équipement       |
| justification    | text        | Justification de l'équipement      |
| quantite         | int4        | Quantité proposée                  |
| created_at       | timestamptz | Date de création                   |

---

## 📋 Table : prospects
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_prospect      | int4        | Clé primaire (auto-increment)      |
| code_prospect    | varchar     | Code prospect                      |
| nom_prospect     | varchar     | Nom du prospect                    |
| adr_prospect     | text        | Adresse                            |
| tel_prospect     | varchar     | Téléphone                          |
| mail_prospect    | varchar     | Email                              |
| siren_prospect   | varchar     | SIREN                              |
| resp_prospect    | varchar     | Responsable                        |
| mailresp_prospect| varchar     | Email responsable                  |
| telresp_prospect | varchar     | Téléphone responsable              |
| ville_prospect   | varchar     | Ville                              |
| cp_prospect      | varchar     | Code postal                        |

---

## 🧪 Table : AgentExtincteur
| Champ      | Type  | Description                |
|------------|-------|---------------------------|
| id_agt     | bigint| Clé primaire              |
| long_agt   | text  | Nom long de l'agent       |
| court_agt  | text  | Nom court de l'agent      |

---

## 📋 Table : fire_extinguisher_certification_registry
| Champ         | Type    | Description                        |
|-------------- |---------|------------------------------------|
| id            | int4    | Clé primaire                       |
| marque        | varchar(50) | Marque                            |
| modele        | varchar(50) | Modèle                            |
| certification | varchar(50) | Certification                      |
| capacit       | int2    | Capacité (correspond à capa_ext)   |
| id_agent      | bigint  | Agent (correspond à agent_ext)     |
| pression      | bool    | Pression                           |

---

## 💡 Table : eclairage_catalogue
| Champ            | Type    | Description                                 |
|------------------|---------|---------------------------------------------|
| id_catalogue_es  | int4    | Clé primaire                               |
| lcie_es          | text    | Référence LCIE ou autre certification       |
| marque_es        | varchar | Marque de l'éclairage                      |
| modele_es        | varchar | Modèle de l'éclairage                      |
| famille_es       | varchar | Famille/type                               |
| ampveille_es     | varchar | Ampérage en veille                         |
| ampsecours_es    | varchar | Ampérage en secours                        |
| ip_es            | varchar | Indice de protection                       |
| sati_es          | bool    | Présence de SATI (oui/non)                 |

---

## 📦 Table : produits
| Champ                | Type        | Description                        |
|----------------------|-------------|------------------------------------|
| id_produit           | int4        | Clé primaire (auto-increment)      |
| code_produit         | varchar(50) | Code produit                      |
| nom_produit          | varchar(200) | Nom du produit                    |
| description          | text        | Description                        |
| id_categorie         | int4        | Référence catégorie               |
| id_fournisseur       | int4        | Référence fournisseur             |
| reference_fournisseur| varchar(100) | Référence fournisseur             |
| prix_unitaire        | numeric(10,2) | Prix unitaire                     |
| unite_mesure         | varchar(20) | Unité de mesure                   |
| stock_minimum        | int4        | Stock minimum                      |
| stock_actuel         | int4        | Stock actuel                       |
| localisation_stock   | varchar(100) | Localisation stock                |
| date_derniere_entree | date        | Date dernière entrée               |
| date_derniere_sortie | date        | Date dernière sortie               |
| statut_produit       | varchar(20) | Statut du produit                  |
| created_at           | timestamptz | Date de création                   |
| updated_at           | timestamptz | Date de mise à jour                |

---

## 📂 Table : categories_stock
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_categorie     | int4        | Clé primaire (auto-increment)      |
| nom_categorie    | varchar(100) | Nom de la catégorie               |
| description      | text        | Description                        |
| couleur_categorie| varchar(7)  | Couleur de la catégorie           |
| created_at       | timestamptz | Date de création                   |

---

## 🏢 Table : fournisseurs
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_fournisseur   | int4        | Clé primaire (auto-increment)      |
| nom_fournisseur  | varchar(100) | Nom du fournisseur                |
| adresse          | text        | Adresse                            |
| telephone        | varchar(20) | Téléphone                          |
| email            | varchar(100) | Email                             |
| contact_principal| varchar(100) | Contact principal                  |
| notes            | text        | Notes                              |
| created_at       | timestamptz | Date de création                   |

---

## 📊 Table : mouvements_stock
| Champ                | Type        | Description                        |
|----------------------|-------------|------------------------------------|
| id_mouvement         | int4        | Clé primaire (auto-increment)      |
| id_produit           | int4        | Référence produit                  |
| type_mouvement       | varchar(20) | Type de mouvement                  |
| quantite             | int4        | Quantité                           |
| quantite_avant       | int4        | Quantité avant                     |
| quantite_apres       | int4        | Quantité après                     |
| motif_mouvement      | varchar(100) | Motif du mouvement                |
| id_intervention      | int4        | Référence intervention             |
| id_client            | int4        | Référence client                   |
| id_site              | int4        | Référence site                     |
| reference_document    | varchar(100) | Référence document                |
| cout_unitaire        | numeric(10,2) | Coût unitaire                     |
| cout_total           | numeric(10,2) | Coût total                        |
| observations         | text        | Observations                       |
| date_mouvement       | timestamptz | Date du mouvement                 |
| created_at           | timestamptz | Date de création                   |

---

## ⚠️ Table : alertes_stock
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_alerte         | int4        | Clé primaire (auto-increment)      |
| id_produit        | int4        | Référence produit                  |
| type_alerte       | varchar(20) | Type d'alerte                      |
| message_alerte    | text        | Message d'alerte                   |
| niveau_urgence    | varchar(20) | Niveau d'urgence                   |
| statut_alerte     | varchar(20) | Statut de l'alerte                 |
| date_creation     | timestamptz | Date de création                   |
| date_resolution   | timestamptz | Date de résolution                 |
| created_at        | timestamptz | Date de création                   |

---

## 🔐 Table : tokens
| Champ        | Type        | Description                        |
|------------- |-------------|------------------------------------|
| id           | int4        | Clé primaire (auto-increment)      |
| token_value  | varchar(255) | Valeur du token                   |
| description  | text        | Description du token               |
| is_active    | bool        | Token actif                        |
| created_at   | timestamp   | Date de création                   |
| updated_at   | timestamp   | Date de mise à jour                |

---

## 📄 Table : BV
| Champ        | Type        | Description                        |
|------------- |-------------|------------------------------------|
| id           | bigint      | Clé primaire                       |
| created_at   | timestamptz | Date de création                   |
| num_bv       | numeric     | Numéro BV                          |
| client_BV    | int4        | Référence client                   |

---

## 🔗 Relations principales
- **clients (1) → (N) sites**
- **clients (1) → (N) interventions**
- **sites (1) → (N) alarmes**
- **sites (1) → (N) peripheriques**
- **sites (1) → (N) eclairages**
- **sites (1) → (N) desenfumages**
- **sites (1) → (N) extincteurs**
- **sites (1) → (N) installations_desenfumage**
- **installations_desenfumage (1) → (N) ouvrants_desenfumage**
- **installations_desenfumage (1) → (N) commandes_primaires_desenfumage**
- **installations_desenfumage (1) → (N) commandes_secondaires_desenfumage**
- **prospects (1) → (N) audits**
- **audits (1) → (N) audit_equipements**
- **interventions (1) → (N) verifications**
- **categories_stock (1) → (N) produits**
- **fournisseurs (1) → (N) produits**
- **produits (1) → (N) mouvements_stock**
- **produits (1) → (N) alertes_stock**

---

**Ce document est la référence officielle de la structure de la base JPSI pour tout le projet.** 