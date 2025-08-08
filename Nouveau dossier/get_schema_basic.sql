-- Script basique pour récupérer la structure de la base de données
-- Exécutez ce script dans votre base Supabase

-- 1. Liste des tables
SELECT 'TABLES:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;

-- 2. Structure des colonnes
SELECT 'COLONNES:' as info;
SELECT table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 3. Clés primaires
SELECT 'CLES PRIMAIRES:' as info;
SELECT tc.table_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. Clés étrangères
SELECT 'CLES ETRANGERES:' as info;
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name; 