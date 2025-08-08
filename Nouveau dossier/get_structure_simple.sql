-- Script SQL simplifié pour récupérer la structure détaillée de toutes les tables
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- =====================================================
-- STRUCTURE DÉTAILLÉE DE TOUTES LES TABLES
-- =====================================================

-- 1. Structure des colonnes avec types et contraintes
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    CASE 
        WHEN c.character_maximum_length IS NOT NULL 
        THEN c.data_type || '(' || c.character_maximum_length || ')'
        WHEN c.numeric_precision IS NOT NULL 
        THEN c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        ELSE c.data_type
    END as type_complet,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE 'NORMAL'
    END as type_cle,
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
        AND tc.table_schema = 'public'
) fk ON t.table_name = fk.table_name AND c.column_name = fk.column_name
LEFT JOIN (
    SELECT 
        kcu.table_name,
        kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
) pk ON t.table_name = pk.table_name AND c.column_name = pk.column_name
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN (
        'clients', 'sites', 'extincteurs', 'eclairages', 'alarmes', 
        'verifications', 'interventions', 'desenfumages', 'peripheriques',
        'audits', 'audit_equipements', 'prospects'
    )
ORDER BY t.table_name, c.ordinal_position;

-- =====================================================
-- LIENS ENTRE TABLES (CLÉS ÉTRANGÈRES)
-- =====================================================
SELECT 
    tc.table_name as table_source,
    kcu.column_name as colonne_source,
    '->' as relation,
    ccu.table_name as table_cible,
    ccu.column_name as colonne_cible,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, ccu.table_name;

-- =====================================================
-- STATISTIQUES DES TABLES
-- =====================================================
SELECT 
    schemaname,
    relname as table_name,
    n_live_tup as nombre_lignes,
    n_dead_tup as lignes_supprimees
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
    AND relname IN (
        'clients', 'sites', 'extincteurs', 'eclairages', 'alarmes', 
        'verifications', 'interventions', 'desenfumages', 'peripheriques',
        'audits', 'audit_equipements', 'prospects'
    )
ORDER BY relname; 