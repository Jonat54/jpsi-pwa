// Configuration Supabase centralisée pour JPSI PWA
// Version: 1.2.1

// Configuration Supabase
const SUPABASE_URL = 'https://anyzqzhjvankvbbajahj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueXpxemhqdmFua3ZiYmFqYWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTIzMjgsImV4cCI6MjA2NjMyODMyOH0.74pICcGtU_Ks0COTtPsSOQ8qtLfOzRHTNa1A41BAiMU';

// Initialisation de Supabase (avec protection contre les connexions multiples)
let supabase = null;
let isInitializing = false;

function initializeSupabase() {
  if (supabase) return supabase; // Déjà initialisé
  if (isInitializing) return null; // En cours d'initialisation
  
  isInitializing = true;
  
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase;
    window.currentUser = null;
    window.isConnected = false;
    
    console.log('✅ Supabase client initialisé');
    return supabase;
  } catch (error) {
    console.error('❌ Erreur initialisation Supabase:', error);
    isInitializing = false;
    return null;
  } finally {
    isInitializing = false;
  }
}

// Initialiser immédiatement
supabase = initializeSupabase();

// Fonctions utilitaires globales
window.JPSI = {
  // Test de connexion Supabase (optimisé)
  async testConnection() {
    try {
      // Vérifier que Supabase est initialisé
      if (!supabase) {
        supabase = initializeSupabase();
        if (!supabase) {
          console.error('❌ Supabase non initialisé');
          return false;
        }
      }
      
      // Éviter les tests multiples simultanés
      if (window.isConnected) {
        console.log('✅ Connexion déjà établie');
        return true;
      }
      
      console.log('🔍 Test de connexion Supabase...');
      
      // Test simple avec timeout
      const testPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      const { data: { session }, error } = await Promise.race([testPromise, timeoutPromise]);
      
      if (error) {
        console.error('❌ Erreur de connexion Supabase:', error);
        return false;
      }
      
      console.log('✅ Connexion Supabase établie');
      window.isConnected = true;
      
      if (session) {
        window.currentUser = session.user;
        console.log('👤 Utilisateur connecté:', session.user.email);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Échec de la connexion:', error);
      return false;
    }
  },

  // Gestion des erreurs
  handleError(error, context = '') {
    console.error(`❌ Erreur ${context}:`, error);
    
    let message = 'Une erreur est survenue';
    if (error.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    // Afficher le message d'erreur à l'utilisateur
    this.showMessage(message, 'error');
  },

  // Affichage des messages
  showMessage(message, type = 'info') {
    // Créer ou réutiliser le conteneur de messages
    let messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.id = 'message-container';
      messageContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 300px;
        font-family: 'SF Pro Display', 'Segoe UI', Arial, sans-serif;
      `;
      document.body.appendChild(messageContainer);
    }

    // Créer le message
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      ${type === 'error' ? `
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fecaca;
      ` : type === 'success' ? `
        background: #dcfce7;
        color: #16a34a;
        border: 1px solid #bbf7d0;
      ` : `
        background: #dbeafe;
        color: #2563eb;
        border: 1px solid #bfdbfe;
      `}
    `;
    messageElement.textContent = message;

    // Ajouter l'animation CSS
    if (!document.getElementById('message-animations')) {
      const style = document.createElement('style');
      style.id = 'message-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    messageContainer.appendChild(messageElement);

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      messageElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, 5000);
  },

  // Validation des formulaires
  validateForm(formData, rules) {
    const errors = {};
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = formData[field];
      
      if (rule.required && (!value || value.trim() === '')) {
        errors[field] = `${rule.label || field} est requis`;
        continue;
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${rule.label || field} n'est pas valide`;
      }
      
      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = `${rule.label || field} doit contenir au moins ${rule.minLength} caractères`;
      }
    }
    
    return errors;
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
  },

  // Génération de codes uniques
  generateCode(prefix = 'CL', table = 'clients', field = 'code_client') {
    return new Promise(async (resolve) => {
      try {
        // Récupérer le dernier code
        const { data, error } = await supabase
          .from(table)
          .select(field)
          .order(field, { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        let nextNumber = 1;
        if (data && data.length > 0) {
          const lastCode = data[0][field];
          const match = lastCode.match(new RegExp(`${prefix}(\\d+)`));
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }
        
        const newCode = `${prefix}${String(nextNumber).padStart(4, '0')}`;
        resolve(newCode);
      } catch (error) {
        console.error('Erreur génération code:', error);
        resolve(`${prefix}0001`);
      }
    });
  }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initialisation JPSI PWA...');
  
  // Tester la connexion Supabase
  await JPSI.testConnection();
  
  // Ajouter les styles globaux si pas déjà présents
  if (!document.getElementById('jpsi-global-styles')) {
    const style = document.createElement('style');
    style.id = 'jpsi-global-styles';
    style.textContent = `
      .loading {
        opacity: 0.6;
        pointer-events: none;
      }
      
      .btn-loading {
        position: relative;
        color: transparent !important;
      }
      
      .btn-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  console.log('✅ JPSI PWA initialisée');
});

// Export pour utilisation dans d'autres fichiers
window.JPSI = JPSI; 