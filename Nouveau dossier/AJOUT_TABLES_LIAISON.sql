-- =====================================================
-- AJOUT DES TABLES DE LIAISON MANQUANTES
-- =====================================================

-- 1. Table de liaison OUVRANT -> COMMANDE PRIMAIRE (many-to-many)
CREATE TABLE IF NOT EXISTS liaison_ouvrant_commande_primaire (
    id_liaison SERIAL PRIMARY KEY,
    id_ouvrant INTEGER NOT NULL REFERENCES ouvrants_desenfumage(id_ouvrant) ON DELETE CASCADE,
    id_commande_primaire INTEGER NOT NULL REFERENCES commandes_primaires_desenfumage(id_commande_primaire) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte pour éviter les doublons
    CONSTRAINT unique_ouvrant_commande_primaire UNIQUE(id_ouvrant, id_commande_primaire)
);

-- 2. Table de liaison COMMANDE PRIMAIRE -> COMMANDE SECONDAIRE (many-to-many)
CREATE TABLE IF NOT EXISTS liaison_commande_primaire_secondaire (
    id_liaison SERIAL PRIMARY KEY,
    id_commande_primaire INTEGER NOT NULL REFERENCES commandes_primaires_desenfumage(id_commande_primaire) ON DELETE CASCADE,
    id_commande_secondaire INTEGER NOT NULL REFERENCES commandes_secondaires_desenfumage(id_commande_secondaire) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte pour éviter les doublons
    CONSTRAINT unique_commande_primaire_secondaire UNIQUE(id_commande_primaire, id_commande_secondaire)
);

-- 3. Index pour les performances sur les tables de liaison
CREATE INDEX IF NOT EXISTS idx_liaison_ouvrant_commande ON liaison_ouvrant_commande_primaire(id_ouvrant, id_commande_primaire);
CREATE INDEX IF NOT EXISTS idx_liaison_commande_primaire_secondaire ON liaison_commande_primaire_secondaire(id_commande_primaire, id_commande_secondaire);

-- 4. Commentaires pour documenter
COMMENT ON TABLE liaison_ouvrant_commande_primaire IS 'Liaison many-to-many entre ouvrants et commandes primaires';
COMMENT ON TABLE liaison_commande_primaire_secondaire IS 'Liaison many-to-many entre commandes primaires et secondaires';

-- 5. Vérification
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%liaison%'
ORDER BY table_name;

-- 6. Vérification des index
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename LIKE '%liaison%'
ORDER BY tablename, indexname;

-- 7. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Tables de liaison créées avec succès !';
    RAISE NOTICE '🔗 liaison_ouvrant_commande_primaire : OK';
    RAISE NOTICE '🔗 liaison_commande_primaire_secondaire : OK';
    RAISE NOTICE '📈 Index de performance : OK';
    RAISE NOTICE '🚀 Structure complète prête pour les tests !';
END $$; 