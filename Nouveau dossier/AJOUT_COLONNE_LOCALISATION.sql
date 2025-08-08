-- =====================================================
-- AJOUT DE LA COLONNE localisation_des À LA TABLE desenfumages
-- =====================================================

-- 1. Ajouter la colonne localisation_des
ALTER TABLE desenfumages 
ADD COLUMN IF NOT EXISTS localisation_des VARCHAR(255);

-- 2. Ajouter un commentaire pour documenter la nouvelle colonne
COMMENT ON COLUMN desenfumages.localisation_des IS 'Localisation du désenfumage';

-- 3. Créer un index pour optimiser les recherches par localisation
CREATE INDEX IF NOT EXISTS idx_desenfumages_localisation ON desenfumages(localisation_des);

-- 4. Vérification de la structure mise à jour
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Afficher un résumé des modifications
SELECT 
    'Colonne localisation_des ajoutée avec succès' as message; 