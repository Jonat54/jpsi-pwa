-- Script SQL pour récupérer la structure complète de toutes les tables
-- Utilisé pour mettre à jour le fichier DB.md
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- =====================================================
-- STRUCTURE COMPLÈTE DE TOUTES LES TABLES
-- =====================================================

-- 1. Structure détaillée avec types, contraintes et liens
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
    c.ordinal_position,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
        ELSE 'NORMAL'
    END as type_cle,
    fk.foreign_table_name,
    fk.foreign_column_name,
    fk.constraint_name as foreign_key_name
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    SELECT 
        kcu.table_name,
        kcu.column_name,
        ccu.table_name as foreign_table_name,
        ccu.column_name as foreign_column_name,
        tc.constraint_name
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
-- RÉSUMÉ PAR TABLE (NOMBRE DE COLONNES ET TYPES)
-- =====================================================
SELECT 
    table_name,
    COUNT(*) as nombre_colonnes,
    COUNT(CASE WHEN type_cle = 'PRIMARY KEY' THEN 1 END) as nb_cles_primaires,
    COUNT(CASE WHEN type_cle = 'FOREIGN KEY' THEN 1 END) as nb_cles_etrangeres,
    COUNT(CASE WHEN data_type = 'integer' OR data_type = 'bigint' THEN 1 END) as nb_entiers,
    COUNT(CASE WHEN data_type = 'text' OR data_type = 'character varying' THEN 1 END) as nb_textes,
    COUNT(CASE WHEN data_type = 'boolean' THEN 1 END) as nb_booleens,
    COUNT(CASE WHEN data_type = 'date' OR data_type = 'timestamp' THEN 1 END) as nb_dates,
    COUNT(CASE WHEN is_nullable = 'YES' THEN 1 END) as nb_nullables
FROM (
    SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        CASE 
            WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
            WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
            ELSE 'NORMAL'
        END as type_cle
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
) details
GROUP BY table_name
ORDER BY table_name;

-- =====================================================
-- LIENS ENTRE TABLES (DIAGRAMME DES RELATIONS)
-- =====================================================
SELECT 
    tc.table_name as table_source,
    kcu.column_name as colonne_source,
    '->' as relation,
    ccu.table_name as table_cible,
    ccu.column_name as colonne_cible,
    tc.constraint_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, ccu.table_name;

-- =====================================================
-- INDEXES ET PERFORMANCE
-- =====================================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN (
        'clients', 'sites', 'extincteurs', 'eclairages', 'alarmes', 
        'verifications', 'interventions', 'desenfumages', 'peripheriques',
        'audits', 'audit_equipements', 'prospects'
    )
ORDER BY tablename, indexname;

-- =====================================================
-- SÉQUENCES (AUTO-INCREMENT)
-- =====================================================
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment,
    cycle_option
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name; 