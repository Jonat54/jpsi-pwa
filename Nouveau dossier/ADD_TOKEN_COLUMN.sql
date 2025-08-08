-- Script pour ajouter la colonne token à la table clients
-- Exécutez ce script dans votre base Supabase

-- Vérifier si la colonne token existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'token'
    ) THEN
        -- Ajouter la colonne token
        ALTER TABLE clients ADD COLUMN token UUID;
        
        -- Ajouter un index sur la colonne token pour les performances
        CREATE INDEX idx_clients_token ON clients(token);
        
        RAISE NOTICE 'Colonne token ajoutée à la table clients';
    ELSE
        RAISE NOTICE 'La colonne token existe déjà dans la table clients';
    END IF;
END $$;

-- Vérifier que la colonne a été ajoutée
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name = 'token'; 