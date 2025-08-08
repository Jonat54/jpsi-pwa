// Script pour récupérer le schéma complet de la base de données Supabase
// Utilise les informations de configuration du projet

const SUPABASE_URL = 'https://anyzqzhjvankvbbajahj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueXpxemhqdmFua3ZiYmFqYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTIzMjgsImV4cCI6MjA2NjMyODMyOH0.74pICcGtU_Ks0COTtPsSOQ8qtLfOzRHTNa1A41BAiMU';

// Initialiser Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getDatabaseSchema() {
  try {
    console.log('🔍 Récupération du schéma de la base de données...\n');

    // Requête pour récupérer toutes les tables du schéma public
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_info');

    if (tablesError) {
      // Si la fonction RPC n'existe pas, utiliser une requête SQL directe
      console.log('⚠️ Fonction RPC non disponible, utilisation d\'une requête SQL directe...\n');
      
      const { data: tablesData, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');

      if (error) {
        console.error('❌ Erreur lors de la récupération des tables:', error);
        return;
      }

      console.log('📋 Tables trouvées dans la base de données:');
      console.log('==========================================\n');

      for (const table of tablesData) {
        const tableName = table.table_name;
        console.log(`🏷️ Table: ${tableName}`);
        console.log('─'.repeat(50));

        // Récupérer les colonnes de chaque table
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .order('ordinal_position');

        if (columnsError) {
          console.error(`❌ Erreur pour la table ${tableName}:`, columnsError);
          continue;
        }

        if (columns && columns.length > 0) {
          console.log('| Champ | Type | Nullable | Default |');
          console.log('|-------|------|----------|---------|');
          
          columns.forEach(column => {
            const nullable = column.is_nullable === 'YES' ? 'OUI' : 'NON';
            const defaultValue = column.column_default || '-';
            console.log(`| ${column.column_name} | ${column.data_type} | ${nullable} | ${defaultValue} |`);
          });
        } else {
          console.log('Aucune colonne trouvée');
        }

        console.log('\n');

        // Récupérer les contraintes de clé primaire
        const { data: primaryKeys, error: pkError } = await supabase
          .from('information_schema.key_column_usage')
          .select('column_name')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .eq('constraint_name', `${tableName}_pkey`);

        if (!pkError && primaryKeys && primaryKeys.length > 0) {
          console.log(`🔑 Clé primaire: ${primaryKeys.map(pk => pk.column_name).join(', ')}`);
        }

        // Récupérer les clés étrangères
        const { data: foreignKeys, error: fkError } = await supabase
          .from('information_schema.key_column_usage')
          .select(`
            column_name,
            constraint_name,
            referenced_table_name,
            referenced_column_name
          `)
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .neq('constraint_name', `${tableName}_pkey`);

        if (!fkError && foreignKeys && foreignKeys.length > 0) {
          console.log('🔗 Clés étrangères:');
          foreignKeys.forEach(fk => {
            console.log(`  - ${fk.column_name} → ${fk.referenced_table_name}.${fk.referenced_column_name}`);
          });
        }

        console.log('\n' + '='.repeat(60) + '\n');
      }

    } else {
      // Utiliser les données de la fonction RPC si disponible
      console.log('📋 Schéma de la base de données:');
      console.log('================================\n');
      
      tables.forEach(table => {
        console.log(`🏷️ Table: ${table.table_name}`);
        console.log('─'.repeat(50));
        
        if (table.columns && table.columns.length > 0) {
          console.log('| Champ | Type | Nullable | Default |');
          console.log('|-------|------|----------|---------|');
          
          table.columns.forEach(column => {
            const nullable = column.is_nullable ? 'OUI' : 'NON';
            const defaultValue = column.column_default || '-';
            console.log(`| ${column.column_name} | ${column.data_type} | ${nullable} | ${defaultValue} |`);
          });
        }
        
        if (table.primary_key) {
          console.log(`\n🔑 Clé primaire: ${table.primary_key}`);
        }
        
        if (table.foreign_keys && table.foreign_keys.length > 0) {
          console.log('🔗 Clés étrangères:');
          table.foreign_keys.forEach(fk => {
            console.log(`  - ${fk.column_name} → ${fk.referenced_table}.${fk.referenced_column}`);
          });
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du schéma:', error);
  }
}

// Alternative: Requête SQL directe pour récupérer le schéma
async function getSchemaWithSQL() {
  try {
    console.log('🔍 Récupération du schéma avec requête SQL directe...\n');

    // Requête SQL pour récupérer toutes les tables et leurs colonnes
    const { data, error } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          SELECT 
            t.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default,
            c.character_maximum_length,
            c.numeric_precision,
            c.numeric_scale
          FROM information_schema.tables t
          JOIN information_schema.columns c ON t.table_name = c.table_name
          WHERE t.table_schema = 'public' 
            AND t.table_type = 'BASE TABLE'
            AND c.table_schema = 'public'
          ORDER BY t.table_name, c.ordinal_position;
        `
      });

    if (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête SQL:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('📋 Schéma complet de la base de données:');
      console.log('========================================\n');

      let currentTable = '';
      data.forEach(row => {
        if (row.table_name !== currentTable) {
          if (currentTable !== '') {
            console.log('\n' + '='.repeat(60) + '\n');
          }
          currentTable = row.table_name;
          console.log(`🏷️ Table: ${currentTable}`);
          console.log('─'.repeat(50));
          console.log('| Champ | Type | Taille | Nullable | Default |');
          console.log('|-------|------|--------|----------|---------|');
        }

        const type = row.data_type + 
          (row.character_maximum_length ? `(${row.character_maximum_length})` : '') +
          (row.numeric_precision ? `(${row.numeric_precision}${row.numeric_scale ? ',' + row.numeric_scale : ''})` : '');
        
        const nullable = row.is_nullable === 'YES' ? 'OUI' : 'NON';
        const defaultValue = row.column_default || '-';
        
        console.log(`| ${row.column_name} | ${type} | ${row.character_maximum_length || '-'} | ${nullable} | ${defaultValue} |`);
      });

      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      console.log('❌ Aucune donnée trouvée');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du schéma:', error);
  }
}

// Exécuter les fonctions
console.log('🚀 Début de l\'analyse du schéma de la base de données Supabase\n');

// Essayer d'abord la méthode principale
getDatabaseSchema().then(() => {
  console.log('✅ Analyse terminée');
}).catch(error => {
  console.error('❌ Erreur dans l\'analyse principale:', error);
  console.log('\n🔄 Tentative avec la méthode alternative...\n');
  getSchemaWithSQL();
}); 