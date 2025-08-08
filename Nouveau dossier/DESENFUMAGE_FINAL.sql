-- =====================================================
-- SCRIPT FINAL POUR CRÉER LA STRUCTURE DÉSENFUMAGE
-- Structure hiérarchique : Installation > Ouvrants > Commandes primaires > Commandes secondaires
-- Avec relations many-to-many entre les niveaux
-- =====================================================

-- 1. Table principale des installations de désenfumage
CREATE TABLE IF NOT EXISTS installations_desenfumage (
    id_installation SERIAL PRIMARY KEY,
    id_site INTEGER NOT NULL REFERENCES sites(id_site) ON DELETE CASCADE,
    numero_installation VARCHAR(100) NOT NULL,
    nom_installation VARCHAR(255),
    localisation_installation VARCHAR(255),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT unique_numero_installation_site UNIQUE(id_site, numero_installation)
);

-- 2. Table des ouvrants (appartiennent à une installation)
CREATE TABLE IF NOT EXISTS ouvrants_desenfumage (
    id_ouvrant SERIAL PRIMARY KEY,
    id_installation INTEGER NOT NULL REFERENCES installations_desenfumage(id_installation) ON DELETE CASCADE,
    numero_ouvrant VARCHAR(100),
    niveau VARCHAR(100),
    localisation VARCHAR(255),
    type_ouvrant VARCHAR(100) NOT NULL CHECK (type_ouvrant IN (
        'Ouvrant en façade intérieur',
        'Ouvrant en façade extérieur', 
        'Exutoire en toiture',
        'Fenêtre de toit'
    )),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des commandes primaires (peuvent commander plusieurs ouvrants)
CREATE TABLE IF NOT EXISTS commandes_primaires_desenfumage (
    id_commande_primaire SERIAL PRIMARY KEY,
    id_installation INTEGER NOT NULL REFERENCES installations_desenfumage(id_installation) ON DELETE CASCADE,
    numero_commande VARCHAR(100),
    niveau VARCHAR(100),
    localisation VARCHAR(255),
    type_commande VARCHAR(100) NOT NULL CHECK (type_commande IN (
        'Treuil mécanique à relâchement de câble',
        'Tirez-lâchez',
        'Commande ouverture-fermeture pneumatique'
    )),
    grammage_ouverture DECIMAL(8,2),
    grammage_fermeture DECIMAL(8,2),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table des commandes secondaires (peuvent commander plusieurs commandes primaires)
CREATE TABLE IF NOT EXISTS commandes_secondaires_desenfumage (
    id_commande_secondaire SERIAL PRIMARY KEY,
    id_installation INTEGER NOT NULL REFERENCES installations_desenfumage(id_installation) ON DELETE CASCADE,
    numero_commande VARCHAR(100),
    niveau VARCHAR(100),
    localisation VARCHAR(255),
    type_commande VARCHAR(100) NOT NULL CHECK (type_commande IN (
        'Commande pneumatique',
        'Commande électrique'
    )),
    grammage DECIMAL(8,2),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table de liaison OUVRANT -> COMMANDE PRIMAIRE (many-to-many)
-- Un ouvrant peut être commandé par plusieurs commandes primaires
-- Une commande primaire peut commander plusieurs ouvrants
CREATE TABLE IF NOT EXISTS liaison_ouvrant_commande_primaire (
    id_liaison SERIAL PRIMARY KEY,
    id_ouvrant INTEGER NOT NULL REFERENCES ouvrants_desenfumage(id_ouvrant) ON DELETE CASCADE,
    id_commande_primaire INTEGER NOT NULL REFERENCES commandes_primaires_desenfumage(id_commande_primaire) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte pour éviter les doublons
    CONSTRAINT unique_ouvrant_commande_primaire UNIQUE(id_ouvrant, id_commande_primaire)
);

-- 6. Table de liaison COMMANDE PRIMAIRE -> COMMANDE SECONDAIRE (many-to-many)
-- Une commande primaire peut être commandée par plusieurs commandes secondaires
-- Une commande secondaire peut commander plusieurs commandes primaires
CREATE TABLE IF NOT EXISTS liaison_commande_primaire_secondaire (
    id_liaison SERIAL PRIMARY KEY,
    id_commande_primaire INTEGER NOT NULL REFERENCES commandes_primaires_desenfumage(id_commande_primaire) ON DELETE CASCADE,
    id_commande_secondaire INTEGER NOT NULL REFERENCES commandes_secondaires_desenfumage(id_commande_secondaire) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte pour éviter les doublons
    CONSTRAINT unique_commande_primaire_secondaire UNIQUE(id_commande_primaire, id_commande_secondaire)
);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index sur les clés étrangères
CREATE INDEX IF NOT EXISTS idx_installations_site ON installations_desenfumage(id_site);
CREATE INDEX IF NOT EXISTS idx_ouvrants_installation ON ouvrants_desenfumage(id_installation);
CREATE INDEX IF NOT EXISTS idx_commandes_primaires_installation ON commandes_primaires_desenfumage(id_installation);
CREATE INDEX IF NOT EXISTS idx_commandes_secondaires_installation ON commandes_secondaires_desenfumage(id_installation);

-- Index sur les tables de liaison
CREATE INDEX IF NOT EXISTS idx_liaison_ouvrant_commande ON liaison_ouvrant_commande_primaire(id_ouvrant, id_commande_primaire);
CREATE INDEX IF NOT EXISTS idx_liaison_commande_primaire_secondaire ON liaison_commande_primaire_secondaire(id_commande_primaire, id_commande_secondaire);

-- Index sur les numéros pour les recherches
CREATE INDEX IF NOT EXISTS idx_installations_numero ON installations_desenfumage(numero_installation);
CREATE INDEX IF NOT EXISTS idx_ouvrants_numero ON ouvrants_desenfumage(numero_ouvrant);
CREATE INDEX IF NOT EXISTS idx_commandes_primaires_numero ON commandes_primaires_desenfumage(numero_commande);
CREATE INDEX IF NOT EXISTS idx_commandes_secondaires_numero ON commandes_secondaires_desenfumage(numero_commande);

-- =====================================================
-- COMMENTAIRES POUR LA DOCUMENTATION
-- =====================================================

COMMENT ON TABLE installations_desenfumage IS 'Installations de désenfumage par site - Niveau 1 de la hiérarchie';
COMMENT ON TABLE ouvrants_desenfumage IS 'Ouvrants d''une installation - Niveau 2 de la hiérarchie';
COMMENT ON TABLE commandes_primaires_desenfumage IS 'Commandes primaires d''une installation - Niveau 3 de la hiérarchie';
COMMENT ON TABLE commandes_secondaires_desenfumage IS 'Commandes secondaires d''une installation - Niveau 4 de la hiérarchie';
COMMENT ON TABLE liaison_ouvrant_commande_primaire IS 'Liaison many-to-many entre ouvrants et commandes primaires';
COMMENT ON TABLE liaison_commande_primaire_secondaire IS 'Liaison many-to-many entre commandes primaires et secondaires';

-- =====================================================
-- FONCTIONS POUR FACILITER LES REQUÊTES
-- =====================================================

-- Fonction pour obtenir une installation complète avec toute sa hiérarchie
CREATE OR REPLACE FUNCTION get_installation_hierarchie_complete(id_inst INTEGER)
RETURNS TABLE (
    installation_info JSON,
    ouvrants JSON,
    commandes_primaires JSON,
    commandes_secondaires JSON,
    liaisons_ouvrant_commande JSON,
    liaisons_commande_primaire_secondaire JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Informations de l'installation
        json_build_object(
            'id', i.id_installation,
            'numero', i.numero_installation,
            'nom', i.nom_installation,
            'localisation', i.localisation_installation,
            'observations', i.observations,
            'created_at', i.created_at,
            'updated_at', i.updated_at
        ) as installation_info,
        
        -- Tous les ouvrants de l'installation
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', o.id_ouvrant,
                    'numero', o.numero_ouvrant,
                    'niveau', o.niveau,
                    'localisation', o.localisation,
                    'type', o.type_ouvrant,
                    'observations', o.observations,
                    'created_at', o.created_at,
                    'updated_at', o.updated_at
                )
            ) FROM ouvrants_desenfumage o WHERE o.id_installation = i.id_installation),
            '[]'::json
        ) as ouvrants,
        
        -- Toutes les commandes primaires de l'installation
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', cp.id_commande_primaire,
                    'numero', cp.numero_commande,
                    'niveau', cp.niveau,
                    'localisation', cp.localisation,
                    'type', cp.type_commande,
                    'grammage_ouverture', cp.grammage_ouverture,
                    'grammage_fermeture', cp.grammage_fermeture,
                    'observations', cp.observations,
                    'created_at', cp.created_at,
                    'updated_at', cp.updated_at
                )
            ) FROM commandes_primaires_desenfumage cp WHERE cp.id_installation = i.id_installation),
            '[]'::json
        ) as commandes_primaires,
        
        -- Toutes les commandes secondaires de l'installation
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', cs.id_commande_secondaire,
                    'numero', cs.numero_commande,
                    'niveau', cs.niveau,
                    'localisation', cs.localisation,
                    'type', cs.type_commande,
                    'grammage', cs.grammage,
                    'observations', cs.observations,
                    'created_at', cs.created_at,
                    'updated_at', cs.updated_at
                )
            ) FROM commandes_secondaires_desenfumage cs WHERE cs.id_installation = i.id_installation),
            '[]'::json
        ) as commandes_secondaires,
        
        -- Toutes les liaisons ouvrant -> commande primaire
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id_liaison', loc.id_liaison,
                    'id_ouvrant', loc.id_ouvrant,
                    'id_commande_primaire', loc.id_commande_primaire,
                    'created_at', loc.created_at
                )
            ) FROM liaison_ouvrant_commande_primaire loc 
             JOIN ouvrants_desenfumage o ON o.id_ouvrant = loc.id_ouvrant
             WHERE o.id_installation = i.id_installation),
            '[]'::json
        ) as liaisons_ouvrant_commande,
        
        -- Toutes les liaisons commande primaire -> commande secondaire
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id_liaison', lcps.id_liaison,
                    'id_commande_primaire', lcps.id_commande_primaire,
                    'id_commande_secondaire', lcps.id_commande_secondaire,
                    'created_at', lcps.created_at
                )
            ) FROM liaison_commande_primaire_secondaire lcps 
             JOIN commandes_primaires_desenfumage cp ON cp.id_commande_primaire = lcps.id_commande_primaire
             WHERE cp.id_installation = i.id_installation),
            '[]'::json
        ) as liaisons_commande_primaire_secondaire
        
    FROM installations_desenfumage i
    WHERE i.id_installation = id_inst;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir la hiérarchie d'un ouvrant spécifique
CREATE OR REPLACE FUNCTION get_hierarchie_ouvrant(id_ouvrant_param INTEGER)
RETURNS TABLE (
    ouvrant_info JSON,
    commandes_primaires_liees JSON,
    commandes_secondaires_liees JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Informations de l'ouvrant
        json_build_object(
            'id', o.id_ouvrant,
            'numero', o.numero_ouvrant,
            'niveau', o.niveau,
            'localisation', o.localisation,
            'type', o.type_ouvrant,
            'observations', o.observations,
            'id_installation', o.id_installation,
            'created_at', o.created_at,
            'updated_at', o.updated_at
        ) as ouvrant_info,
        
        -- Commandes primaires qui commandent cet ouvrant
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', cp.id_commande_primaire,
                    'numero', cp.numero_commande,
                    'niveau', cp.niveau,
                    'localisation', cp.localisation,
                    'type', cp.type_commande,
                    'grammage_ouverture', cp.grammage_ouverture,
                    'grammage_fermeture', cp.grammage_fermeture,
                    'observations', cp.observations,
                    'id_installation', cp.id_installation,
                    'created_at', cp.created_at,
                    'updated_at', cp.updated_at
                )
            ) FROM commandes_primaires_desenfumage cp
             JOIN liaison_ouvrant_commande_primaire loc ON loc.id_commande_primaire = cp.id_commande_primaire
             WHERE loc.id_ouvrant = o.id_ouvrant),
            '[]'::json
        ) as commandes_primaires_liees,
        
        -- Commandes secondaires qui commandent les commandes primaires de cet ouvrant
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', cs.id_commande_secondaire,
                    'numero', cs.numero_commande,
                    'niveau', cs.niveau,
                    'localisation', cs.localisation,
                    'type', cs.type_commande,
                    'grammage', cs.grammage,
                    'observations', cs.observations,
                    'id_installation', cs.id_installation,
                    'created_at', cs.created_at,
                    'updated_at', cs.updated_at
                )
            ) FROM commandes_secondaires_desenfumage cs
             JOIN liaison_commande_primaire_secondaire lcps ON lcps.id_commande_secondaire = cs.id_commande_secondaire
             JOIN liaison_ouvrant_commande_primaire loc ON loc.id_commande_primaire = lcps.id_commande_primaire
             WHERE loc.id_ouvrant = o.id_ouvrant),
            '[]'::json
        ) as commandes_secondaires_liees
        
    FROM ouvrants_desenfumage o
    WHERE o.id_ouvrant = id_ouvrant_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour lister toutes les installations d'un site
CREATE OR REPLACE FUNCTION get_installations_site(id_site_param INTEGER)
RETURNS TABLE (
    installations JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', i.id_installation,
                    'numero', i.numero_installation,
                    'nom', i.nom_installation,
                    'localisation', i.localisation_installation,
                    'observations', i.observations,
                    'nb_ouvrants', (SELECT COUNT(*) FROM ouvrants_desenfumage o WHERE o.id_installation = i.id_installation),
                    'nb_commandes_primaires', (SELECT COUNT(*) FROM commandes_primaires_desenfumage cp WHERE cp.id_installation = i.id_installation),
                    'nb_commandes_secondaires', (SELECT COUNT(*) FROM commandes_secondaires_desenfumage cs WHERE cs.id_installation = i.id_installation),
                    'created_at', i.created_at,
                    'updated_at', i.updated_at
                )
            ) FROM installations_desenfumage i WHERE i.id_site = id_site_param),
            '[]'::json
        ) as installations;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VÉRIFICATION DE LA STRUCTURE
-- =====================================================

-- Afficher toutes les tables créées
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%desenfumage%'
ORDER BY table_name;

-- Afficher la structure des tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE '%desenfumage%'
ORDER BY table_name, ordinal_position;

-- Afficher les index créés
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename LIKE '%desenfumage%'
ORDER BY tablename, indexname;

-- =====================================================
-- MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Structure désenfumage créée avec succès !';
    RAISE NOTICE '📊 Tables créées : installations_desenfumage, ouvrants_desenfumage, commandes_primaires_desenfumage, commandes_secondaires_desenfumage, liaison_ouvrant_commande_primaire, liaison_commande_primaire_secondaire';
    RAISE NOTICE '🔗 Relations many-to-many configurées';
    RAISE NOTICE '📈 Index de performance créés';
    RAISE NOTICE '⚙️ Fonctions utilitaires disponibles';
    RAISE NOTICE '🚀 Prêt pour les tests sur iPad avec Firefox !';
END $$; 