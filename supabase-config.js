// Configuration Supabase centralisée pour JPSI PWA
// Version: 1.2.3 - Authentification avec token utilisateur

// Configuration Supabase
const SUPABASE_URL = 'https://anyzqzhjvankvbbajahj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueXpxemhqdmFua3ZiYmFqYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTIzMjgsImV4cCI6MjA2NjMyODMyOH0.74pICcGtU_Ks0COTtPsSOQ8qtLfOzRHTNa1A41BAiMU';

// Initialisation de Supabase
let supabase = null;

function initializeSupabase() {
  // Si déjà un client valable (avec .from), le retourner
  if (supabase && typeof supabase.from === 'function') return supabase;

  // Vérifier la présence de la librairie
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.warn('⚠️ Supabase CDN non chargé');
    return null;
  }

  try {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Vérifier l'API attendue
    if (!client || typeof client.from !== 'function') {
      console.error('❌ Client Supabase invalide (API .from manquante)');
      return null;
    }
    supabase = client;
    window.supabaseClient = client;
    console.log('✅ Supabase client initialisé');
    return client;
  } catch (error) {
    console.error('❌ Erreur initialisation Supabase:', error);
    return null;
  }
}

function getSupabaseClient() {
  return initializeSupabase();
}
// Exposer pour les autres scripts
window.getSupabaseClient = getSupabaseClient;

// Initialisation immédiate au chargement du script
(() => {
  // Si la librairie est déjà chargée, init tout de suite
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    initializeSupabase();
    return;
  }
  // Sinon, attendre brièvement son chargement
  let attempts = 0;
  const maxAttempts = 20; // ~4s si interval 200ms
  const timer = setInterval(() => {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      clearInterval(timer);
      initializeSupabase();
    } else if (++attempts >= maxAttempts) {
      clearInterval(timer);
      console.warn('⚠️ Supabase non disponible après attente initiale');
    }
  }, 200);
})();

// Configuration simple sans auth complexe
async function configureSupabaseAuth() {
  if (!getSupabaseClient()) return false;

  try {
    console.log('✅ Supabase configuré (mode simple)');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration Supabase:', error);
    return false;
  }
}

// Fonction pour faire des requêtes authentifiées
async function authenticatedRequest(table, operation, data = null) {
  // Configurer l'auth avant chaque requête
  await configureSupabaseAuth();
  
  try {
    const client = getSupabaseClient();
    if (!client) throw new Error('Client Supabase indisponible');
    let result;
    
    switch (operation) {
      case 'insert':
        result = await client.from(table).insert(data).select();
        break;
      case 'update':
        result = await client.from(table).update(data).select();
        break;
      case 'delete':
        result = await client.from(table).delete().select();
        break;
      case 'select':
        result = await client.from(table).select(data || '*');
        break;
      default:
        throw new Error(`Opération non supportée: ${operation}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Erreur requête authentifiée ${table}.${operation}:`, error);
    throw error;
  }
}

// Fonctions utilitaires globales
window.JPSI = {
  // Test de connexion Supabase
  async testConnection() {
    try {
      const client = getSupabaseClient();
      if (!client) return false;
      
      // Test simple de connexion
      const { data, error } = await client.from('clients').select('count').limit(1);
      if (error) {
        console.error('❌ Erreur de connexion Supabase:', error);
        return false;
      }
      
      console.log('✅ Connexion Supabase établie');
      return true;
    } catch (error) {
      console.error('❌ Échec de la connexion:', error);
      return false;
    }
  },

  // Requête authentifiée
  async authenticatedRequest(table, operation, data = null) {
    return await authenticatedRequest(table, operation, data);
  },

  // Gestion des erreurs
  handleError(error, context = '') {
    console.error(`❌ Erreur ${context}:`, error);
  },

  // Affichage des messages
  showMessage(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
  },

  // Formatage des dates
  formatDate(date, format = 'dd/MM/yyyy') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year);
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation JPSI PWA...');
  // Initialiser immédiatement le client si possible
  initializeSupabase();
  // Test non bloquant
  setTimeout(async () => {
    await JPSI.testConnection();
    console.log('✅ JPSI PWA initialisée');
  }, 500);
});