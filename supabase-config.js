// Configuration Supabase centralisée pour JPSI PWA
// Version: 1.2.4 - RPC insert sécurisé + centralisation client

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
  // Retourner le client déjà initialisé et valide
  if (supabase && typeof supabase.from === 'function') return supabase;

  // Si un client global existe déjà (défini plus tôt), l'utiliser
  if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
    supabase = window.supabaseClient;
    return supabase;
  }

  // Sinon tenter une initialisation propre
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
      let client = getSupabaseClient();

      // Garde supplémentaire contre un objet invalide (ex: objet librairie au lieu du client)
      if (!client || typeof client.from !== 'function') {
        console.warn('⚠️ Client Supabase invalide, tentative de réinitialisation...');
        supabase = null; // réinitialiser la référence locale
        client = initializeSupabase();
      }

      if (!client || typeof client.from !== 'function') {
        return false;
      }

      // Test de connexion avec timeout interne (3s)
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('timeout'));
        }, 3000);
      });

      // Requête la plus légère possible (HEAD-like via select head)
      const queryPromise = client
        .from('clients')
        .select('id_client', { count: 'exact', head: true })
        .limit(1);

      const result = await Promise.race([queryPromise, timeoutPromise]);

      if (result && result.error) {
        console.error('❌ Erreur de connexion Supabase:', result.error);
        return false;
      }

      console.log('✅ Connexion Supabase établie');
      return true;
    } catch (error) {
      // En cas de timeout ou d’exception réseau, considérer hors-ligne
      if (String(error && error.message).toLowerCase().includes('timeout')) {
        console.warn('⏱️ Test connexion Supabase: timeout');
        return false;
      }
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

// ------------------------------------------------------------
// Notifier global (toasts unifiés: success/info/warning/error)
// Couleurs: vert (success), bleu (info), jaune (warning), rouge (error)
// ------------------------------------------------------------
(function initGlobalNotifier() {
  if (window.Notifier) return; // éviter double init

  const THEME = {
    success: { bg: '#10b981', text: '#ffffff', icon: '✅' },
    info:    { bg: '#3b82f6', text: '#ffffff', icon: 'ℹ️' },
    warning: { bg: '#f59e0b', text: '#1f2937', icon: '⚠️' },
    error:   { bg: '#ef4444', text: '#ffffff', icon: '❌' }
  };

  function ensureStyles() {
    if (document.getElementById('notifier-styles')) return;
    const style = document.createElement('style');
    style.id = 'notifier-styles';
    style.textContent = `
      .notifier-container{position:fixed;top:20px;right:20px;z-index:2147483647;display:flex;flex-direction:column;gap:10px;max-width:360px}
      .notifier-toast{display:flex;align-items:flex-start;gap:10px;border-radius:12px;padding:12px 14px;box-shadow:0 8px 24px rgba(0,0,0,.15);font:14px/1.35 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;word-break:break-word}
      .notifier-icon{font-size:18px;line-height:1;margin-top:1px}
      .notifier-text{color:inherit}
      .notifier-close{margin-left:8px;background:transparent;border:0;color:inherit;cursor:pointer;font-size:16px}
    `;
    document.head.appendChild(style);
  }

  function getContainer() {
    let el = document.getElementById('notifier-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'notifier-container';
      el.className = 'notifier-container';
      document.body.appendChild(el);
    }
    return el;
  }

  function normalizeType(type) {
    if (!type) return 'info';
    const t = String(type).toLowerCase();
    if (t.startsWith('succ')) return 'success';
    if (t.startsWith('warn') || t === 'warning' || t === 'yellow') return 'warning';
    if (t.startsWith('err') || t === 'danger' || t === 'red') return 'error';
    if (t === 'blue' || t === 'info') return 'info';
    return ['success','info','warning','error'].includes(t) ? t : 'info';
  }

  const recent = new Map(); // message -> timestamp

  function show(message, type = 'info', options = {}) {
    try {
      ensureStyles();
      const container = getContainer();
      const t = normalizeType(type);
      const theme = THEME[t] || THEME.info;
      const text = String(message ?? '').trim();

      // Anti-spam (même message < 1.5s)
      const now = Date.now();
      const key = `${t}:${text}`;
      const last = recent.get(key) || 0;
      if (now - last < 1500) return;
      recent.set(key, now);

      const toast = document.createElement('div');
      toast.className = 'notifier-toast';
      toast.setAttribute('role', 'alert');
      toast.style.background = theme.bg;
      toast.style.color = theme.text;

      const icon = document.createElement('div');
      icon.className = 'notifier-icon';
      icon.textContent = options.icon || theme.icon;

      const span = document.createElement('div');
      span.className = 'notifier-text';
      span.textContent = text;

      const close = document.createElement('button');
      close.className = 'notifier-close';
      close.setAttribute('aria-label', 'Fermer');
      close.textContent = '×';
      close.onclick = () => toast.remove();

      toast.appendChild(icon);
      toast.appendChild(span);
      toast.appendChild(close);
      container.appendChild(toast);

      const ttl = options.ttl ?? (t === 'error' ? 5000 : t === 'warning' ? 4500 : 3500);
      setTimeout(() => toast.remove(), ttl);
    } catch (e) {
      // En dernier recours, fallback console
      console[t === 'error' ? 'error' : 'log']('Notifier:', type, message);
    }
  }

  function auto(message) {
    const text = String(message ?? '');
    const m = text.trim();
    if (m.startsWith('✅')) return show(m, 'success');
    if (m.startsWith('⚠️')) return show(m, 'warning');
    if (m.startsWith('❌') || /erreur|error|failed/i.test(m)) return show(m, 'error');
    if (/latence|lent|attente|patientez/i.test(m)) return show(m, 'warning');
    return show(m, 'info');
  }

  const Notifier = {
    show,
    success: (m, o) => show(m, 'success', o),
    info:    (m, o) => show(m, 'info', o),
    warning: (m, o) => show(m, 'warning', o),
    error:   (m, o) => show(m, 'error', o),
    auto
  };

  window.Notifier = Notifier;

  // Remplacer alert() global par toasts (déduction du type)
  const originalAlert = window.alert;
  window.alert = function(message) {
    try { Notifier.auto(message); } catch(_) { originalAlert(message); }
  };

  // Unifier showStatus s'il existe ou fournir une implémentation
  function hookShowStatus() {
    const prev = window.showStatus;
    window.showStatus = function(message, type = 'info') {
      try {
        const t = normalizeType(type);
        Notifier.show(message, t);
      } catch (_) {
        if (typeof prev === 'function') try { prev(message, type); } catch(_) {}
      }
    };
  }

  // Premier hook tout de suite
  hookShowStatus();
  // Et ré-appliquer après que les pages aient (re)défini showStatus
  document.addEventListener('DOMContentLoaded', hookShowStatus);
})();