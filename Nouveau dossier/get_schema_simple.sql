-- Script SQL simplifié pour récupérer la structure actuelle de la base de données
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Lister toutes les tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Structure détaillée des tables principales
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE 'NORMAL'
    END as key_type,
    fk.foreign_table_name,
    fk.foreign_column_name
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT 
        kcu.table_name,
        kcu.column_name,
        ccu.table_name as foreign_table_name,
        ccu.column_name as foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON t.table_name = fk.table_name AND c.column_name = fk.column_name
LEFT JOIN (
    SELECT 
        kcu.table_name,
        kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN (
        'clients', 'sites', 'extincteurs', 'eclairages', 'alarmes', 
        'verifications', 'interventions', 'desenfumages', 'peripheriques',
        'audits', 'audit_equipements', 'prospects'
    )
ORDER BY t.table_name, c.ordinal_position;

-- 3. Contraintes (clés primaires et étrangères)
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name IN (
        'clients', 'sites', 'extincteurs', 'eclairages', 'alarmes', 
        'verifications', 'interventions', 'desenfumages', 'peripheriques',
        'audits', 'audit_equipements', 'prospects'
    )
ORDER BY tc.table_name, tc.constraint_type;

-- 4. Vérifier si les tables interventions et verifications existent
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('interventions', 'verifications')
ORDER BY table_name;

-- 5. Compter les lignes dans chaque table principale
SELECT 
    schemaname,
    tablename,
    n_live_tup as nombre_lignes
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
    AND tablename IN (
        'clients', 'sites', 'extincteurs', 'eclairages', 'alarmes', 
        'verifications', 'interventions', 'desenfumages', 'peripheriques',
        'audits', 'audit_equipements', 'prospects'
    )
ORDER BY tablename; 