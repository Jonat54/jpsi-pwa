-- =====================================================
-- MODIFICATION DE LA TABLE DESENFUMAGES
-- Ajout de 2 nouveaux champs : descouvr_des, obs_des
-- =====================================================

-- 1. Ajouter les nouveaux champs à la table desenfumages
ALTER TABLE desenfumages 
ADD COLUMN IF NOT EXISTS descouvr_des TEXT,
ADD COLUMN IF NOT EXISTS obs_des TEXT;

-- 2. Ajouter des commentaires pour documenter les nouveaux champs
COMMENT ON COLUMN desenfumages.descouvr_des IS 'Description détaillée de l''ouvrant de désenfumage';
COMMENT ON COLUMN desenfumages.obs_des IS 'Observations spécifiques sur l''équipement de désenfumage';

-- 3. Vérification de la structure mise à jour
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Afficher un résumé des modifications
SELECT 
    'Table desenfumages modifiée avec succès' as message,
    COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
    AND table_schema = 'public';

-- 5. Vérifier que les nouveaux champs sont bien présents
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'desenfumages' 
    AND table_schema = 'public'
    AND column_name IN ('descouvr_des', 'obs_des')
ORDER BY column_name; 