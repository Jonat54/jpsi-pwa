-- Script SQL pour récupérer la structure complète de la base de données
-- Copiez-collez ce script dans l'éditeur SQL de Supabase

-- =====================================================
-- 1. STRUCTURE DÉTAILLÉE DE TOUTES LES TABLES
-- =====================================================

SELECT 
    t.table_name as "Table",
    c.column_name as "Colonne",
    c.data_type as "Type",
    CASE 
        WHEN c.character_maximum_length IS NOT NULL 
        THEN c.data_type || '(' || c.character_maximum_length || ')'
        WHEN c.numeric_precision IS NOT NULL 
        THEN c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        ELSE c.data_type
    END as "Type Complet",
    c.is_nullable as "Nullable",
    c.column_default as "Valeur Défaut",
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE 'NORMAL'
    END as "Type de Clé",
    fk.foreign_table_name as "Table Référencée",
    fk.foreign_column_name as "Colonne Référencée"
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
ORDER BY t.table_name, c.ordinal_position;

-- =====================================================
-- 2. LIENS ENTRE TABLES (CLÉS ÉTRANGÈRES)
-- =====================================================

SELECT 
    tc.table_name as "Table Source",
    kcu.column_name as "Colonne Source",
    '->' as "Relation",
    ccu.table_name as "Table Cible",
    ccu.column_name as "Colonne Cible",
    tc.constraint_name as "Nom Contrainte"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, ccu.table_name;

-- =====================================================
-- 3. STATISTIQUES DES TABLES
-- =====================================================

SELECT 
    schemaname as "Schéma",
    relname as "Table",
    n_live_tup as "Lignes Actives",
    n_dead_tup as "Lignes Supprimées",
    CASE 
        WHEN n_live_tup > 100 THEN 'Très actif'
        WHEN n_live_tup > 20 THEN 'Actif'
        WHEN n_live_tup > 5 THEN 'Modéré'
        ELSE 'Faible'
    END as "Statut"
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- =====================================================
-- 4. INDEXES
-- =====================================================

SELECT 
    schemaname as "Schéma",
    tablename as "Table",
    indexname as "Index",
    indexdef as "Définition"
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 5. SÉQUENCES (AUTO-INCREMENT)
-- =====================================================

SELECT 
    sequence_name as "Séquence",
    data_type as "Type",
    start_value as "Valeur Début",
    minimum_value as "Min",
    maximum_value as "Max",
    increment as "Incrément"
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name; 