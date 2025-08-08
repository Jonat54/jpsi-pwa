-- =====================================================
-- AJOUT DES COLONNES MANQUANTES À LA TABLE desenfumages
-- =====================================================

-- 1. Ajouter toutes les colonnes manquantes
ALTER TABLE desenfumages 
ADD COLUMN IF NOT EXISTS num_des VARCHAR(50),
ADD COLUMN IF NOT EXISTS localisation_des VARCHAR(255),
ADD COLUMN IF NOT EXISTS descouvr_des VARCHAR(255),
ADD COLUMN IF NOT EXISTS obs_des TEXT,
ADD COLUMN IF NOT EXISTS voyant_des BOOLEAN DEFAULT false;

-- 2. Ajouter des commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN desenfumages.num_des IS 'Numéro du désenfumage (généré automatiquement)';
COMMENT ON COLUMN desenfumages.localisation_des IS 'Localisation du désenfumage';
COMMENT ON COLUMN desenfumages.descouvr_des IS 'Description du type d''ouvrant';
COMMENT ON COLUMN desenfumages.obs_des IS 'Observations sur le désenfumage';
COMMENT ON COLUMN desenfumages.voyant_des IS 'État du voyant (true=ON, false=OFF)';

-- 3. Créer des index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_desenfumages_num_des ON desenfumages(num_des);
CREATE INDEX IF NOT EXISTS idx_desenfumages_localisation ON desenfumages(localisation_des);
CREATE INDEX IF NOT EXISTS idx_desenfumages_voyant ON desenfumages(voyant_des);

-- 4. Ajouter des contraintes de validation (optionnel)
ALTER TABLE desenfumages 
ADD CONSTRAINT chk_voyant_des 
CHECK (voyant_des IN (true, false));

-- 5. Vérification de la structure mise à jour
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Afficher un résumé des modifications
SELECT 
    'Colonnes ajoutées avec succès à la table desenfumages' as message,
    COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
    AND table_schema = 'public';

-- 7. Lister les nouvelles colonnes ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
    AND table_schema = 'public'
    AND column_name IN ('num_des', 'localisation_des', 'descouvr_des', 'obs_des', 'voyant_des')
ORDER BY column_name; 