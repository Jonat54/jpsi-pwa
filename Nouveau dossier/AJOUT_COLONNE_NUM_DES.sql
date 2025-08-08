-- =====================================================
-- AJOUT DE LA COLONNE num_des À LA TABLE desenfumages
-- =====================================================

-- 1. Ajouter la colonne num_des
ALTER TABLE desenfumages 
ADD COLUMN IF NOT EXISTS num_des VARCHAR(50);

-- 2. Ajouter un commentaire pour documenter la nouvelle colonne
COMMENT ON COLUMN desenfumages.num_des IS 'Numéro du désenfumage (généré automatiquement)';

-- 3. Créer un index pour optimiser les recherches par numéro
CREATE INDEX IF NOT EXISTS idx_desenfumages_num_des ON desenfumages(num_des);

-- 4. Ajouter une contrainte d'unicité par site (optionnel)
-- ALTER TABLE desenfumages 
-- ADD CONSTRAINT unique_num_des_site UNIQUE(id_site, num_des);

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
    'Colonne num_des ajoutée avec succès à la table desenfumages' as message,
    COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
    AND table_schema = 'public'; 