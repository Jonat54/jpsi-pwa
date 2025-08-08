-- Requêtes SQL pour récupérer le schéma complet de la base de données JPSI
-- À exécuter dans l'interface SQL de Supabase

-- 1. Récupérer toutes les tables du schéma public
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Récupérer toutes les colonnes avec leurs détails
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND c.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- 3. Récupérer les clés primaires
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- 4. Récupérer les clés étrangères
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- 5. Requête complète pour obtenir le schéma en une seule fois
WITH table_info AS (
    SELECT 
        t.table_name,
        COUNT(c.column_name) as column_count
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name 
        AND c.table_schema = 'public'
    WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name
),
primary_keys AS (
    SELECT 
        tc.table_name,
        STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as primary_key_columns
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
    GROUP BY tc.table_name
),
foreign_keys AS (
    SELECT 
        tc.table_name,
        COUNT(*) as foreign_key_count
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    GROUP BY tc.table_name
)
SELECT 
    ti.table_name,
    ti.column_count,
    COALESCE(pk.primary_key_columns, 'Aucune') as primary_keys,
    COALESCE(fk.foreign_key_count, 0) as foreign_key_count
FROM table_info ti
LEFT JOIN primary_keys pk ON ti.table_name = pk.table_name
LEFT JOIN foreign_keys fk ON ti.table_name = fk.table_name
ORDER BY ti.table_name;

-- 6. Requête pour obtenir le schéma détaillé d'une table spécifique
-- Remplacez 'nom_de_la_table' par le nom de la table que vous voulez analyser
SELECT 
    c.column_name,
    c.data_type,
    CASE 
        WHEN c.character_maximum_length IS NOT NULL 
        THEN c.data_type || '(' || c.character_maximum_length || ')'
        WHEN c.numeric_precision IS NOT NULL 
        THEN c.data_type || '(' || c.numeric_precision || 
             CASE WHEN c.numeric_scale IS NOT NULL 
                  THEN ',' || c.numeric_scale 
                  ELSE '' 
             END || ')'
        ELSE c.data_type
    END as full_data_type,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PK'
        WHEN fk.column_name IS NOT NULL THEN 'FK'
        ELSE ''
    END as key_type,
    CASE 
        WHEN fk.column_name IS NOT NULL 
        THEN fk.referenced_table || '.' || fk.referenced_column
        ELSE ''
    END as references
FROM information_schema.columns c
LEFT JOIN (
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = 'nom_de_la_table'
        AND tc.table_schema = 'public'
) pk ON c.column_name = pk.column_name
LEFT JOIN (
    SELECT 
        kcu.column_name,
        ccu.table_name as referenced_table,
        ccu.column_name as referenced_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'nom_de_la_table'
        AND tc.table_schema = 'public'
) fk ON c.column_name = fk.column_name
WHERE c.table_name = 'nom_de_la_table'
    AND c.table_schema = 'public'
ORDER BY c.ordinal_position;

-- 7. Statistiques générales de la base de données
SELECT 
    'Tables' as metric,
    COUNT(*) as value
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Colonnes totales' as metric,
    COUNT(*) as value
FROM information_schema.columns 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'Clés primaires' as metric,
    COUNT(*) as value
FROM information_schema.table_constraints 
WHERE constraint_type = 'PRIMARY KEY'
    AND table_schema = 'public'

UNION ALL

SELECT 
    'Clés étrangères' as metric,
    COUNT(*) as value
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public'; 