-- RPC et RLS pour insertions sécurisées (clients/sites)
-- A exécuter sur le projet Supabase (SQL Editor)

-- 1) Table auxiliaire tokens (si non existante)
-- CREATE TABLE IF NOT EXISTS public.tokens (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   token_value text UNIQUE NOT NULL,
--   is_active boolean NOT NULL DEFAULT true,
--   user_type text CHECK (user_type IN ('technicien','client')),
--   client_id integer REFERENCES public.clients(id_client),
--   created_at timestamptz DEFAULT now()
-- );

-- 2) Fonctions SECURITY DEFINER pour bypass RLS sous contrôle
-- Insertion client sans exigence de token (SECURITY DEFINER)
create or replace function public.fn_insert_client(client_in jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted jsonb;
begin
  insert into public.clients (
    code_client, nom_client, adr_client, ville_client, cp_client,
    mail_client, tel_client, siren_client, resp_client, mailresp_client, telresp_client
  ) values (
    client_in->>'code_client', client_in->>'nom_client', client_in->>'adr_client', client_in->>'ville_client', client_in->>'cp_client',
    client_in->>'mail_client', client_in->>'tel_client', client_in->>'siren_client', client_in->>'resp_client', client_in->>'mailresp_client', client_in->>'telresp_client'
  ) returning to_jsonb(clients.*) into inserted;

  return inserted;
end;
$$;

grant execute on function public.fn_insert_client(jsonb) to anon, authenticated;

-- Insertion site sans exigence de token (SECURITY DEFINER)
create or replace function public.fn_insert_site(site_in jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted jsonb;
begin

  insert into public.sites (
    id_client, nom_site, num_site, adr_site, ville_site, cp_site,
    telresp_site, mailresp_site, resp_site, famille_site, typeerp_site, caterp_site, lastcomm_site
  ) values (
    (site_in->>'id_client')::int, site_in->>'nom_site', site_in->>'num_site', site_in->>'adr_site', site_in->>'ville_site', site_in->>'cp_site',
    site_in->>'telresp_site', site_in->>'mailresp_site', site_in->>'resp_site', site_in->>'famille_site', site_in->>'typeerp_site', nullif(site_in->>'caterp_site','')::int, nullif(site_in->>'lastcomm_site','')::date
  ) returning to_jsonb(sites.*) into inserted;

  return inserted;
end;
$$;

grant execute on function public.fn_insert_site(jsonb) to anon, authenticated;

-- 3) Exemple de politiques RLS recommandées
-- Activer RLS
-- alter table public.clients enable row level security;
-- alter table public.sites enable row level security;

-- Politique lecture clients (client voit ses données; technicien voit tout)
-- create policy clients_select on public.clients
-- for select using (
--   exists (
--     select 1 from public.tokens t
--     where t.token_value = current_setting('request.headers.x-client-token', true)
--       and t.is_active = true
--       and (
--         t.user_type = 'technicien' or t.client_id = clients.id_client
--       )
--   )
-- );

-- Politique lecture/insert sites
-- create policy sites_select on public.sites for select using (
--   exists (
--     select 1 from public.tokens t
--     where t.token_value = current_setting('request.headers.x-client-token', true)
--       and t.is_active = true
--       and (
--         t.user_type = 'technicien' or t.client_id = sites.id_client
--       )
--   )
-- );
-- create policy sites_insert on public.sites for insert with check (
--   exists (
--     select 1 from public.tokens t
--     where t.token_value = current_setting('request.headers.x-client-token', true)
--       and t.is_active = true
--       and (
--         t.user_type = 'technicien' or t.client_id = (new.id_client)
--       )
--   )
-- );

-- Remarque: pour faire passer le token côté client, ajoutez un header personnalisé
-- via supabase-js v2: supabase.auth.setSession(...) ne couvre pas ce cas.
-- Vous pouvez utiliser supabase.auth.setSession pour un vrai JWT, ou configurer
-- des Edge Functions qui injectent le contexte.

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