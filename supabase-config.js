// Configuration Supabase centralisée pour JPSI PWA
// Version: 1.2.2 - Simplifié

// Configuration Supabase
const SUPABASE_URL = 'https://anyzqzhjvankvbbajahj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueXpxemhqdmFua3ZiYmFqYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTIzMjgsImV4cCI6MjA2NjMyODMyOH0.74pICcGtU_Ks0COTtPsSOQ8qtLfOzRHTNa1A41BAiMU';

// Initialisation de Supabase
let supabase = null;

function initializeSupabase() {
  if (supabase) return supabase;
  
  // Attendre que Supabase soit disponible
  if (!window.supabase) {
    console.warn('⚠️ Supabase CDN non chargé');
    return null;
  }
  
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;
    console.log('✅ Supabase client initialisé');
    return supabase;
  } catch (error) {
    console.error('❌ Erreur initialisation Supabase:', error);
    return null;
  }
}

// Fonctions utilitaires globales
window.JPSI = {
  // Test de connexion Supabase
  async testConnection() {
    try {
      if (!supabase) {
        supabase = initializeSupabase();
        if (!supabase) return false;
      }
      
      const { data, error } = await supabase.auth.getSession();
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
  
  // Attendre un peu que Supabase se charge
  setTimeout(async () => {
    await JPSI.testConnection();
    console.log('✅ JPSI PWA initialisée');
  }, 1000);
});

// Export pour utilisation dans d'autres fichiers
window.JPSI = JPSI; 