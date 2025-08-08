-- Script de mise à jour de la table desenfumages
-- Ajout des nouveaux champs selon les spécifications

-- 1. Ajouter les nouveaux champs à la table existante
ALTER TABLE desenfumages 
ADD COLUMN IF NOT EXISTS numero_ensemble VARCHAR(100),
ADD COLUMN IF NOT EXISTS localisation_ensemble VARCHAR(255),
ADD COLUMN IF NOT EXISTS niveau_ouvrant VARCHAR(100),
ADD COLUMN IF NOT EXISTS localisation_ouvrant VARCHAR(255),
ADD COLUMN IF NOT EXISTS type_ouvrant VARCHAR(100),
ADD COLUMN IF NOT EXISTS niveau_commande_primaire VARCHAR(100),
ADD COLUMN IF NOT EXISTS localisation_commande_primaire VARCHAR(255),
ADD COLUMN IF NOT EXISTS type_commande_primaire VARCHAR(100),
ADD COLUMN IF NOT EXISTS niveau_commande_secondaire VARCHAR(100),
ADD COLUMN IF NOT EXISTS localisation_commande_secondaire VARCHAR(255),
ADD COLUMN IF NOT EXISTS type_commande_secondaire VARCHAR(100),
ADD COLUMN IF NOT EXISTS grammage_ouverture DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS grammage_fermeture DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS grammage_secondaire DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS observations TEXT;

-- 2. Mettre à jour les contraintes et index
CREATE INDEX IF NOT EXISTS idx_desenfumages_id_site ON desenfumages(id_site);
CREATE INDEX IF NOT EXISTS idx_desenfumages_statut ON desenfumages(statut);
CREATE INDEX IF NOT EXISTS idx_desenfumages_type ON desenfumages(type_desenfumage);

-- 3. Ajouter des contraintes de validation
ALTER TABLE desenfumages 
ADD CONSTRAINT chk_type_ouvrant 
CHECK (type_ouvrant IN (
    'Ouvrant en façade intérieur',
    'Ouvrant en façade extérieur', 
    'Exutoire en toiture',
    'Fenêtre de toit'
));

ALTER TABLE desenfumages 
ADD CONSTRAINT chk_type_commande_primaire 
CHECK (type_commande_primaire IN (
    'Treuil mécanique à relâchement de câble',
    'Tirez-lâchez',
    'Commande ouverture-fermeture pneumatique'
));

ALTER TABLE desenfumages 
ADD CONSTRAINT chk_type_commande_secondaire 
CHECK (type_commande_secondaire IN (
    'Commande pneumatique',
    'Commande électrique'
) OR type_commande_secondaire IS NULL);



-- 4. Commentaires pour documenter la table
COMMENT ON TABLE desenfumages IS 'Table des équipements de désenfumage par site';
COMMENT ON COLUMN desenfumages.numero_ensemble IS 'Numéro de l''ensemble de désenfumage';
COMMENT ON COLUMN desenfumages.localisation_ensemble IS 'Localisation de l''ensemble';
COMMENT ON COLUMN desenfumages.niveau_ouvrant IS 'Niveau de l''ouvrant';
COMMENT ON COLUMN desenfumages.localisation_ouvrant IS 'Localisation de l''ouvrant';
COMMENT ON COLUMN desenfumages.type_ouvrant IS 'Type d''ouvrant (obligatoire)';
COMMENT ON COLUMN desenfumages.niveau_commande_primaire IS 'Niveau de la commande primaire';
COMMENT ON COLUMN desenfumages.localisation_commande_primaire IS 'Localisation de la commande primaire';
COMMENT ON COLUMN desenfumages.type_commande_primaire IS 'Type de commande primaire (obligatoire)';
COMMENT ON COLUMN desenfumages.niveau_commande_secondaire IS 'Niveau de la commande secondaire';
COMMENT ON COLUMN desenfumages.localisation_commande_secondaire IS 'Localisation de la commande secondaire';
COMMENT ON COLUMN desenfumages.type_commande_secondaire IS 'Type de commande secondaire (optionnel)';
COMMENT ON COLUMN desenfumages.grammage_ouverture IS 'Grammage d''ouverture (g) pour commande pneumatique';
COMMENT ON COLUMN desenfumages.grammage_fermeture IS 'Grammage de fermeture (g) pour commande pneumatique';
COMMENT ON COLUMN desenfumages.grammage_secondaire IS 'Grammage (g) pour commande secondaire pneumatique';
COMMENT ON COLUMN desenfumages.observations IS 'Observations générales';

-- 5. Vérification de la structure mise à jour
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
ORDER BY ordinal_position; 