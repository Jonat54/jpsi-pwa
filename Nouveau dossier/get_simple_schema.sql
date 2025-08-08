-- Script SQL simple pour diagnostiquer la structure de la base de données
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Lister toutes les tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Vérifier si les tables importantes existent
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('interventions', 'verifications', 'clients', 'sites', 'extincteurs', 'eclairages', 'alarmes')
ORDER BY table_name;

-- 3. Structure de la table verifications (si elle existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'verifications'
ORDER BY ordinal_position;

-- 4. Structure de la table interventions (si elle existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'interventions'
ORDER BY ordinal_position;

-- 5. Structure des tables d'équipements
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('extincteurs', 'eclairages', 'alarmes')
ORDER BY table_name, ordinal_position;

-- 6. Compter les lignes (méthode alternative)
SELECT 
    'clients' as table_name,
    COUNT(*) as nombre_lignes
FROM clients
UNION ALL
SELECT 
    'sites' as table_name,
    COUNT(*) as nombre_lignes
FROM sites
UNION ALL
SELECT 
    'extincteurs' as table_name,
    COUNT(*) as nombre_lignes
FROM extincteurs
UNION ALL
SELECT 
    'eclairages' as table_name,
    COUNT(*) as nombre_lignes
FROM eclairages
UNION ALL
SELECT 
    'alarmes' as table_name,
    COUNT(*) as nombre_lignes
FROM alarmes; 