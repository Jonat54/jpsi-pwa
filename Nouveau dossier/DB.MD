# 📚 Référence de la Base de Données JPSI (Supabase)

Ce document décrit la structure complète de la base de données telle qu'observée dans les schémas fournis. Il sert de référence unique pour tout le projet.

**Dernière mise à jour :**
- Fonctionnalités front : tri dynamique sur les tableaux clients et sites, compteurs d'équipements par site et par client dans l'UI (newVerification.html).
- Système d'audits complet : création, historique, détails avec génération PDF.
- Schéma des tables à jour avec les besoins actuels (tables d'audits ajoutées).

---

## État des fonctionnalités front (UI)
- **Tri dynamique** : Les tableaux des clients et des sites sont triables par colonne (clic sur l'en-tête, ordre croissant/décroissant).
- **Compteurs d'équipements** : Le nombre d'extincteurs, d'éclairages, d'alarmes et de désenfumages est affiché dans les vignettes des sites et dans le header client.
- **Design** : UI moderne, sobre, adaptée desktop/mobile.

---

## 🧑‍💼 Table : clients
| Champ            | Type    | Description                        |
|------------------|---------|------------------------------------|
| id_client        | int4    | Clé primaire                       |
| code_client      | varchar | Code unique (ex: CL0001)           |
| nom_client       | varchar | Nom du client                      |
| adr_client       | text    | Adresse                            |
| tel_client       | varchar | Téléphone                          |
| mail_client      | varchar | Email                              |
| siren_client     | varchar | SIREN                              |
| resp_client      | varchar | Responsable                        |
| mailresp_client  | varchar | Email du responsable               |
| telresp_client   | varchar | Téléphone du responsable           |
| ville_client     | varchar | Ville                              |
| cp_client        | varchar | Code postal                        |

---

## 🏢 Table : sites
| Champ            | Type    | Description                        |
|------------------|---------|------------------------------------|
| id_site          | int4    | Clé primaire                       |
| id_client        | int4    | Référence client                   |
| adr_site         | varchar | Adresse du site                    |
| ville_site       | varchar | Ville                              |
| cp_site          | varchar | Code postal                        |
| resp_site        | varchar | Responsable site                   |
| telresp_site     | varchar | Téléphone responsable site         |
| mailresp_site    | varchar | Email responsable site             |
| num_site         | varchar | Numéro interne site                |
| nom_site         | varchar | Nom du site                        |
| famille_erp      | varchar | Famille ERP (ERP, ERT, Habitation, Privé) |
| typeerp_site     | text    | Type ERP (code lettre)             |
| caterp_site      | int2    | Catégorie ERP (1, 2, 3, 4, 5)     |
| lastcomm_site    | date    | Date dernière commission de sécurité |

---

## 🚨 Table : alarmes
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_alarme        | int4        | Clé primaire                       |
| id_site          | int4        | Référence site                     |
| type_alarme      | varchar     | Type d'alarme                      |
| marque_alarme    | varchar     | Marque                             |
| modele_alarme    | varchar     | Modèle                             |
| notes_alarme     | text        | Notes                              |
| last_alarme      | timestamptz | Date du dernier contrôle           |

---

## 🖲️ Table : peripheriques
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_periph        | int4        | Clé primaire                       |
| id_alarme        | int4        | Référence alarme                   |
| type_periph      | varchar     | Type de périphérique               |
| marque_periph    | varchar     | Marque                             |
| modele_periph    | varchar     | Modèle                             |
| loc_periph       | varchar     | Localisation                       |
| etat_periph      | bool        | État (fonctionnel ou non)          |
| ok_periph        | bool        | Statut OK                          |
| note_periph      | text        | Note                               |
| last_periph      | timestamp   | Date du dernier contrôle           |

---

## 💡 Table : eclairages
| Champ              | Type    | Description                        |
|--------------------|---------|------------------------------------|
| id_ecl             | int4    | Clé primaire                       |
| id_site            | int4    | Référence site                     |
| num_ecl            | varchar | Numéro d'éclairage                  |
| niv_ecl            | varchar | Niveau/étage                        |
| loc_ecl            | varchar | Localisation                        |
| marque_ecl         | varchar | Marque                              |
| modele_ecl         | varchar | Modèle                              |
| family_ecl         | varchar | Famille/type                        |
| mes_ecl            | varchar | Mesure/puissance                    |
| ip_ecl             | varchar | Indice de protection                |
| sati_ecl           | bool    | Saturation                          |
| telecommande_ecl   | bool    | Présence télécommande               |
| etat_batterie_ecl  | bool    | État batterie                       |
| orientation_ecl    | varchar | Orientation                         |
| obs_ecl            | text    | Observations                        |
| last_ecl           | date    | Date du dernier contrôle            |

---

## 🪟 Table : desenfumages
| Champ                    | Type        | Description                        |
|--------------------------|-------------|------------------------------------|
| id_desenfumage           | int4        | Clé primaire                       |
| id_site                  | int4        | Référence site                     |
| equipement_desenfumage   | varchar     | Type d'équipement                  |
| explication_installation | text        | Explication installation           |
| created_at               | timestamptz | Date de création                   |
| updated_at               | timestamptz | Date de mise à jour                |

---

## 🧯 Table : extincteurs
| Champ        | Type    | Description                        |
|------------- |---------|------------------------------------|
| id_ext       | int4    | Clé primaire                       |
| id_site      | int4    | Référence site                     |
| num_ext      | varchar | Numéro extincteur                  |
| niv_ext      | varchar | Niveau/étage                       |
| loc_ext      | varchar | Localisation                       |
| marque_ext   | varchar | Marque                             |
| modele_ext   | varchar | Modèle                             |
| agent_ext    | int4    | Référence agent extincteur         |
| mes_ext      | varchar | Mesure/volume                      |
| rcm_ext      | varchar | Date recharge/contrôle             |
| maa_ext      | varchar | Date maintenance annuelle          |
| eie_ext      | varchar | Date épreuve interne/externe        |
| pcf_ext      | bool    | Pression/contrôle faite             |
| papp_ext     | bool    | Pression apparente (PP=allumé, PA=éteint) |
| cert_ext     | varchar | Numéro de certificat               |
| capa_ext     | varchar | Capacité de l’extincteur (ex : 6kg, 2Lt) |
| obs_ext      | text    | Observations                       |
| last_ext     | date    | Date du dernier contrôle           |

---

## 🧪 Table : AgentExtincteur
| Champ      | Type  | Description                |
|------------|-------|---------------------------|
| id_agt     | int8  | Clé primaire              |
| long_agt   | text  | Nom long de l’agent       |
| court_agt  | text  | Nom court de l’agent      |

---

## 📋 Table : fire_extinguisher_certification_registry
| Champ         | Type    | Description                        |
|-------------- |---------|------------------------------------|
| id            | int4    | Clé primaire                       |
| marque        | varchar | Marque                             |
| modele        | varchar | Modèle                             |
| certification | varchar | Certification                      |
| capacit       | int2    | Capacité (correspond à capa_ext)   |
| agent         | text    | Agent (correspond à agent_ext)     |

---

## 📋 Table : verifications
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_verification  | int4        | Clé primaire                       |
| type_equipement  | varchar     | Type d'équipement vérifié          |
| id_equipement    | int4        | ID de l'équipement vérifié         |
| id_intervention  | int4        | Référence intervention              |
| observations     | text        | Observations de la vérification     |
| statut           | varchar     | Statut (OK, Pas OK)                |
| date_verification| timestamptz | Date de la vérification            |

---

## 🔗 Relations principales
- **clients (1) → (N) sites**
- **sites (1) → (N) interventions**
- **sites (1) → (N) alarmes**
- **sites (1) → (N) peripheriques**
- **sites (1) → (N) eclairages**
- **sites (1) → (N) desenfumages**
- **sites (1) → (N) extincteurs**
- **sites (1) → (N) rias**
- **sites (1) → (N) plans**
- **interventions (1) → (N) verifications**
- **AgentExtincteur (1) → (N) extincteurs**
- **fire_extinguisher_certification_registry** : référentiel, pas de clé étrangère directe
- **prospects (1) → (N) audits**
- **audits (1) → (N) audit_equipements**

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

---

## 📋 Table : prospects
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_prospect      | int4        | Clé primaire                       |
| nom_prospect     | varchar     | Nom du prospect                    |
| adr_prospect     | text        | Adresse                            |
| ville_prospect   | varchar     | Ville                              |
| cp_prospect      | varchar     | Code postal                        |
| tel_prospect     | varchar     | Téléphone                          |
| mail_prospect    | varchar     | Email                              |
| resp_prospect    | varchar     | Responsable                        |
| telresp_prospect | varchar     | Téléphone responsable              |
| mailresp_prospect| varchar     | Email responsable                  |
| siren_prospect   | varchar     | SIREN                              |

---

## 📊 Table : audits
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_audit         | int4        | Clé primaire                       |
| id_prospect      | int4        | Référence prospect                 |
| date_audit_site  | date        | Date de l'audit                    |
| observation_site | text        | Observations sur site              |
| statut           | varchar     | Statut (En cours, Terminé, Annulé) |

---

## 🔧 Table : audit_equipements
| Champ            | Type        | Description                        |
|------------------|-------------|------------------------------------|
| id_equipement    | int4        | Clé primaire                       |
| id_audit         | int4        | Référence audit                    |
| type_extincteur  | varchar     | Type d'extincteur proposé          |
| localisation     | varchar     | Localisation de l'équipement       |
| justification    | text        | Justification de l'équipement      |
| quantite         | int4        | Quantité proposée                  |

---

---

## 🚨 Table : interventions
| Champ                | Type        | Description                        |
|----------------------|-------------|------------------------------------|
| id_intervention      | int4        | Clé primaire                       |
| numero_intervention  | varchar     | Numéro unique de l'intervention    |
| id_site              | int4        | Référence site                     |
| date_debut           | date        | Date de début de l'intervention    |
| etat_intervention    | varchar     | État (En cours, Terminé, Annulé)  |
| types_equipements    | text[]      | Types d'équipements à contrôler    |
| observations         | text        | Observations générales             |
| date_creation        | timestamptz | Date de création                   |

---

## 📋 Table : rias
| Champ                    | Type        | Description                        |
|--------------------------|-------------|------------------------------------|
| id_ria                   | int4        | Clé primaire                       |
| id_site                  | int4        | Référence site                     |
| numero_ria               | varchar     | Numéro du RIA                      |
| niveau_ria               | varchar     | Niveau/étage                       |
| emplacement_ria          | varchar     | Emplacement précis                 |
| marque_ria               | varchar     | Marque du RIA                      |
| modele_ria               | varchar     | Modèle du RIA                      |
| diffuseur_ria            | varchar     | Type de diffuseur                  |
| longueur_ria             | varchar     | Longueur du tuyau/lance            |
| diametre_ria             | varchar     | Diamètre du tuyau                  |
| pression_statique_ria    | varchar     | Pression statique                  |
| pression_dynamique_ria   | varchar     | Pression dynamique                 |
| type_vanne_arret_ria     | varchar     | Type de vanne d'arrêt              |
| presence_panneau_ria     | bool        | Présence d'un panneau              |
| date_creation_ria        | timestamptz | Date de création                   |
| date_modification_ria    | timestamptz | Date de modification               |

---

## 📋 Table : plans
| Champ                | Type        | Description                        |
|----------------------|-------------|------------------------------------|
| id_plan              | int4        | Clé primaire                       |
| id_site              | int4        | Référence site                     |
| numero_plan          | varchar     | Numéro du plan                     |
| niveau_plan          | varchar     | Niveau/étage                       |
| emplacement_plan     | varchar     | Emplacement précis                 |
| type_plan            | varchar     | Type de plan                       |
| exactitude_plan      | bool        | Exactitude du plan                 |
| date_creation_plan   | timestamptz | Date de création                   |
| date_modification_plan| timestamptz| Date de modification               |

---

**Ce document est la référence officielle de la structure de la base JPSI pour tout le projet.** 