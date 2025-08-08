-- Script pour ajouter la colonne types_equipements à la table interventions
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne types_equipements
ALTER TABLE interventions 
ADD COLUMN types_equipements TEXT[] DEFAULT '{}';

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN interventions.types_equipements IS 'Types d''équipements à vérifier dans cette intervention (ex: [''extincteurs'', ''eclairages''])';

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'interventions' 
AND column_name = 'types_equipements'; 