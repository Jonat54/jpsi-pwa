-- Fonctions SQL pour l'interface HTML de récupération de structure
-- Exécutez ces fonctions dans l'éditeur SQL de Supabase

-- =====================================================
-- 1. FONCTION POUR RÉCUPÉRER LA STRUCTURE DES TABLES
-- =====================================================

CREATE OR REPLACE FUNCTION get_database_structure()
RETURNS TABLE (
    table_name TEXT,
    column_name TEXT,
    data_type TEXT,
    type_complet TEXT,
    is_nullable TEXT,
    column_default TEXT,
    key_type TEXT,
    foreign_table_name TEXT,
    foreign_column_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        c.column_name::TEXT,
        c.data_type::TEXT,
        CASE 
            WHEN c.character_maximum_length IS NOT NULL 
            THEN c.data_type || '(' || c.character_maximum_length || ')'
            WHEN c.numeric_precision IS NOT NULL 
            THEN c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
            ELSE c.data_type
        END::TEXT as type_complet,
        c.is_nullable::TEXT,
        c.column_default::TEXT,
        CASE 
            WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
            WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY'
            ELSE 'NORMAL'
        END::TEXT as key_type,
        fk.foreign_table_name::TEXT,
        fk.foreign_column_name::TEXT
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. FONCTION POUR RÉCUPÉRER LES RELATIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_database_relations()
RETURNS TABLE (
    source_table TEXT,
    source_column TEXT,
    relation TEXT,
    target_table TEXT,
    target_column TEXT,
    constraint_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.table_name::TEXT as source_table,
        kcu.column_name::TEXT as source_column,
        '->'::TEXT as relation,
        ccu.table_name::TEXT as target_table,
        ccu.column_name::TEXT as target_column,
        tc.constraint_name::TEXT
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    ORDER BY tc.table_name, ccu.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FONCTION POUR RÉCUPÉRER LES STATISTIQUES
-- =====================================================

CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    table_name TEXT,
    active_count BIGINT,
    deleted_count BIGINT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        relname::TEXT as table_name,
        n_live_tup as active_count,
        n_dead_tup as deleted_count,
        CASE 
            WHEN n_live_tup > 100 THEN 'Très actif'
            WHEN n_live_tup > 20 THEN 'Actif'
            WHEN n_live_tup > 5 THEN 'Modéré'
            ELSE 'Faible'
        END::TEXT as status
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY n_live_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FONCTION POUR RÉCUPÉRER LES INDEXES
-- =====================================================

CREATE OR REPLACE FUNCTION get_database_indexes()
RETURNS TABLE (
    schema_name TEXT,
    table_name TEXT,
    index_name TEXT,
    index_definition TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::TEXT as schema_name,
        tablename::TEXT as table_name,
        indexname::TEXT as index_name,
        indexdef::TEXT as index_definition
    FROM pg_indexes 
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FONCTION POUR RÉCUPÉRER LES SÉQUENCES
-- =====================================================

CREATE OR REPLACE FUNCTION get_database_sequences()
RETURNS TABLE (
    sequence_name TEXT,
    data_type TEXT,
    start_value BIGINT,
    minimum_value BIGINT,
    maximum_value BIGINT,
    increment BIGINT,
    cycle_option TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sequence_name::TEXT,
        data_type::TEXT,
        start_value::BIGINT,
        minimum_value::BIGINT,
        maximum_value::BIGINT,
        increment::BIGINT,
        cycle_option::TEXT
    FROM information_schema.sequences 
    WHERE sequence_schema = 'public'
    ORDER BY sequence_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. FONCTION COMPLÈTE POUR RÉCUPÉRER TOUT
-- =====================================================

CREATE OR REPLACE FUNCTION get_complete_database_structure()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'tables', (SELECT json_agg(row_to_json(t)) FROM get_database_structure() t),
        'relations', (SELECT json_agg(row_to_json(r)) FROM get_database_relations() r),
        'stats', (SELECT json_agg(row_to_json(s)) FROM get_database_stats() s),
        'indexes', (SELECT json_agg(row_to_json(i)) FROM get_database_indexes() i),
        'sequences', (SELECT json_agg(row_to_json(seq)) FROM get_database_sequences() seq)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 