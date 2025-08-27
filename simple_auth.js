// Système d'authentification simple avec token de la base
// Juste une identification basique

class SimpleAuth {
    constructor() {
        this.currentClient = null;
        this.OP_TOKEN_KEY = 'jpsi_operator_token';
        this.OP_TOKEN_VERIFIED_AT_KEY = 'jpsi_operator_verified_at';
        this.LEGACY_TOKEN_KEY = 'jpsi_token';
        this.MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24h
    }

    // Vérifier si un client est connecté
    isLoggedIn() {
        const token = localStorage.getItem('jpsi_token');
        return token !== null;
    }

    // Obtenir le client connecté
    getCurrentClient() {
        return this.currentClient;
    }

    // Connexion simple avec token
    async login(clientId) {
        try {
            // Mode Solo: aucune validation distante
            this.currentClient = {
                id: null,
                nom: 'Technicien',
                code: 'TECH'
            };

            // Barrière d'accès locale
            localStorage.setItem('jpsi_token', String(clientId));
            localStorage.setItem('jpsi_client_id', null);

            return { success: true, client: this.currentClient };
        } catch (error) {
            console.error('Erreur connexion:', error);
            return { success: false, error: error.message };
        }
    }

    // Connexion avec token de la table tokens
    async loginWithToken(token) {
        try {
            const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

            if (isOnline && window.supabase) {
                // Vérifier le token opérateur côté Supabase (table tokens)
                const { data, error } = await supabase
                    .from('tokens')
                    .select('*')
                    .eq('token_value', token)
                    .eq('is_active', true)
                    .maybeSingle();

                if (error || !data) {
                    return { success: false, error: 'Token opérateur invalide' };
                }

                // Cache local pour usage offline
                localStorage.setItem(this.OP_TOKEN_KEY, token);
                localStorage.setItem(this.OP_TOKEN_VERIFIED_AT_KEY, String(Date.now()));
                // Compat rétro
                localStorage.setItem(this.LEGACY_TOKEN_KEY, token);
                localStorage.setItem('jpsi_client_id', null);

                this.currentClient = { id: null, nom: 'Technicien', code: 'TECH', isTechnician: true };
                return { success: true, client: this.currentClient };
            }

            // Offline: accepter si le token correspond à celui déjà validé et mis en cache
            const cached = localStorage.getItem(this.OP_TOKEN_KEY);
            if (cached && cached === token) {
                this.currentClient = { id: null, nom: 'Technicien', code: 'TECH', isTechnician: true };
                // Compat rétro
                localStorage.setItem(this.LEGACY_TOKEN_KEY, token);
                localStorage.setItem('jpsi_client_id', null);
                return { success: true, client: this.currentClient };
            }

            return { success: false, error: 'Hors ligne: token non validé auparavant' };
        } catch (error) {
            console.error('Erreur connexion avec token:', error);
            return { success: false, error: error.message };
        }
    }

    // Déconnexion
    logout() {
        this.currentClient = null;
        localStorage.removeItem('jpsi_token');
        localStorage.removeItem('jpsi_client_id');
        window.location.href = 'login.html';
    }

    // Vérifier la connexion au chargement
    async checkLogin() {
        const localToken = localStorage.getItem(this.OP_TOKEN_KEY) || localStorage.getItem(this.LEGACY_TOKEN_KEY);
        if (!localToken) return false;

        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        if (!isOnline) return true; // Offline: autoriser si token local présent

        // Online: revalider périodiquement (toutes les 24h)
        const last = Number(localStorage.getItem(this.OP_TOKEN_VERIFIED_AT_KEY) || 0);
        const needsRefresh = !last || (Date.now() - last) > this.MAX_CACHE_AGE_MS;
        if (!needsRefresh) return true;

        if (!window.supabase) return true; // si supabase non prêt, ne bloque pas

        try {
            const { data, error } = await supabase
                .from('tokens')
                .select('id')
                .eq('token_value', localToken)
                .eq('is_active', true)
                .maybeSingle();
            if (error || !data) {
                return false;
            }
            localStorage.setItem(this.OP_TOKEN_VERIFIED_AT_KEY, String(Date.now()));
            return true;
        } catch (_) {
            // En cas d’erreur réseau ponctuelle, ne pas bloquer
            return true;
        }
    }

    // Initialisation automatique au chargement
    async init() {
        if (window.location.href.includes('login.html')) {
            return; // Ne pas vérifier sur la page de connexion
        }

        const isLoggedIn = await this.checkLogin();
        if (isLoggedIn) {
            console.log('✅ Reconnexion automatique réussie');
        } else {
            console.log('⚠️ Pas de session valide');
        }
    }
}

// Instance globale
const simpleAuth = new SimpleAuth();

// Initialisation automatique au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    await simpleAuth.init();
});

// Export
window.simpleAuth = simpleAuth; 