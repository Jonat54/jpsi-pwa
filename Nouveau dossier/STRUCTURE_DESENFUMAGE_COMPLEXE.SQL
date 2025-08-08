-- Structure complexe pour le désenfumage avec relations multiples
-- Une installation peut avoir plusieurs ouvrants, plusieurs commandes primaires et secondaires

-- 1. Table principale des installations de désenfumage
CREATE TABLE IF NOT EXISTS installations_desenfumage (
    id_installation SERIAL PRIMARY KEY,
    id_site INTEGER NOT NULL REFERENCES sites(id_site),
    numero_installation VARCHAR(100) NOT NULL,
    nom_installation VARCHAR(255),
    localisation_installation VARCHAR(255),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des ouvrants
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

-- 3. Table des commandes primaires
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

-- 4. Table des commandes secondaires
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

-- 5. Table de liaison ouvrant -> commande primaire (plusieurs ouvrants peuvent être commandés par une commande)
CREATE TABLE IF NOT EXISTS liaison_ouvrant_commande_primaire (
    id_liaison SERIAL PRIMARY KEY,
    id_ouvrant INTEGER NOT NULL REFERENCES ouvrants_desenfumage(id_ouvrant) ON DELETE CASCADE,
    id_commande_primaire INTEGER NOT NULL REFERENCES commandes_primaires_desenfumage(id_commande_primaire) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_ouvrant, id_commande_primaire)
);

-- 6. Table de liaison commande primaire -> commande secondaire (une commande primaire peut avoir plusieurs secondaires)
CREATE TABLE IF NOT EXISTS liaison_commande_primaire_secondaire (
    id_liaison SERIAL PRIMARY KEY,
    id_commande_primaire INTEGER NOT NULL REFERENCES commandes_primaires_desenfumage(id_commande_primaire) ON DELETE CASCADE,
    id_commande_secondaire INTEGER NOT NULL REFERENCES commandes_secondaires_desenfumage(id_commande_secondaire) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(id_commande_primaire, id_commande_secondaire)
);

-- 7. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_installations_site ON installations_desenfumage(id_site);
CREATE INDEX IF NOT EXISTS idx_ouvrants_installation ON ouvrants_desenfumage(id_installation);
CREATE INDEX IF NOT EXISTS idx_commandes_primaires_installation ON commandes_primaires_desenfumage(id_installation);
CREATE INDEX IF NOT EXISTS idx_commandes_secondaires_installation ON commandes_secondaires_desenfumage(id_installation);
CREATE INDEX IF NOT EXISTS idx_liaison_ouvrant_commande ON liaison_ouvrant_commande_primaire(id_ouvrant, id_commande_primaire);
CREATE INDEX IF NOT EXISTS idx_liaison_commande_primaire_secondaire ON liaison_commande_primaire_secondaire(id_commande_primaire, id_commande_secondaire);

-- 8. Commentaires pour documenter
COMMENT ON TABLE installations_desenfumage IS 'Installations de désenfumage par site';
COMMENT ON TABLE ouvrants_desenfumage IS 'Ouvrants d''une installation de désenfumage';
COMMENT ON TABLE commandes_primaires_desenfumage IS 'Commandes primaires d''une installation';
COMMENT ON TABLE commandes_secondaires_desenfumage IS 'Commandes secondaires d''une installation';
COMMENT ON TABLE liaison_ouvrant_commande_primaire IS 'Liaison entre ouvrants et commandes primaires';
COMMENT ON TABLE liaison_commande_primaire_secondaire IS 'Liaison entre commandes primaires et secondaires';

-- 9. Fonctions pour faciliter les requêtes
CREATE OR REPLACE FUNCTION get_installation_complete(id_inst INTEGER)
RETURNS TABLE (
    installation_info JSON,
    ouvrants JSON,
    commandes_primaires JSON,
    commandes_secondaires JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        json_build_object(
            'id', i.id_installation,
            'numero', i.numero_installation,
            'nom', i.nom_installation,
            'localisation', i.localisation_installation,
            'observations', i.observations
        ) as installation_info,
        
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', o.id_ouvrant,
                    'numero', o.numero_ouvrant,
                    'niveau', o.niveau,
                    'localisation', o.localisation,
                    'type', o.type_ouvrant,
                    'observations', o.observations
                )
            ) FROM ouvrants_desenfumage o WHERE o.id_installation = i.id_installation),
            '[]'::json
        ) as ouvrants,
        
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
                    'observations', cp.observations
                )
            ) FROM commandes_primaires_desenfumage cp WHERE cp.id_installation = i.id_installation),
            '[]'::json
        ) as commandes_primaires,
        
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', cs.id_commande_secondaire,
                    'numero', cs.numero_commande,
                    'niveau', cs.niveau,
                    'localisation', cs.localisation,
                    'type', cs.type_commande,
                    'grammage', cs.grammage,
                    'observations', cs.observations
                )
            ) FROM commandes_secondaires_desenfumage cs WHERE cs.id_installation = i.id_installation),
            '[]'::json
        ) as commandes_secondaires
        
    FROM installations_desenfumage i
    WHERE i.id_installation = id_inst;
END;
$$ LANGUAGE plpgsql;

-- 10. Vérification de la structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE '%desenfumage%'
ORDER BY table_name, ordinal_position; 