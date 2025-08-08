// Système de contrôle d'accès par token pour JPSI
// Ce fichier gère l'authentification et l'autorisation par token

class TokenAuth {
    constructor() {
        this.currentToken = null;
        this.currentClient = null;
        this.isAuthenticated = false;
    }

    // Générer un nouveau token pour un client
    async generateToken(clientId) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .update({ 
                    token: crypto.randomUUID(),
                    updated_at: new Date().toISOString()
                })
                .eq('id_client', clientId)
                .select('token, nom_client, code_client')
                .single();

            if (error) throw error;

            this.currentToken = data.token;
            this.currentClient = {
                id: clientId,
                nom: data.nom_client,
                code: data.code_client
            };
            this.isAuthenticated = true;

            // Stocker le token localement
            localStorage.setItem('jpsi_token', data.token);
            localStorage.setItem('jpsi_client_id', clientId);

            return {
                success: true,
                token: data.token,
                client: this.currentClient
            };
        } catch (error) {
            console.error('Erreur génération token:', error);
            return { success: false, error: error.message };
        }
    }

    // Vérifier un token existant
    async verifyToken(token) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('id_client, nom_client, code_client, token')
                .eq('token', token)
                .single();

            if (error || !data) {
                this.logout();
                return { success: false, error: 'Token invalide' };
            }

            this.currentToken = data.token;
            this.currentClient = {
                id: data.id_client,
                nom: data.nom_client,
                code: data.code_client
            };
            this.isAuthenticated = true;

            return { success: true, client: this.currentClient };
        } catch (error) {
            console.error('Erreur vérification token:', error);
            this.logout();
            return { success: false, error: error.message };
        }
    }

    // Authentification automatique au chargement
    async autoLogin() {
        const storedToken = localStorage.getItem('jpsi_token');
        const storedClientId = localStorage.getItem('jpsi_client_id');

        if (storedToken && storedClientId) {
            const result = await this.verifyToken(storedToken);
            if (result.success) {
                return result;
            }
        }

        return { success: false, error: 'Aucune session valide' };
    }

    // Déconnexion
    logout() {
        this.currentToken = null;
        this.currentClient = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('jpsi_token');
        localStorage.removeItem('jpsi_client_id');
        
        // Rediriger vers la page de connexion
        window.location.href = 'login.html';
    }

    // Vérifier si l'utilisateur est authentifié
    isLoggedIn() {
        return this.isAuthenticated && this.currentToken !== null;
    }

    // Obtenir les informations du client actuel
    getCurrentClient() {
        return this.currentClient;
    }

    // Obtenir le token actuel
    getCurrentToken() {
        return this.currentToken;
    }

    // Protéger une page (à appeler au début de chaque page)
    async protectPage() {
        // Ne pas rediriger automatiquement depuis la page de connexion
        if (window.location.href.includes('login.html')) {
            return true;
        }
        
        if (!this.isLoggedIn()) {
            const autoLoginResult = await this.autoLogin();
            if (!autoLoginResult.success) {
                window.location.href = 'login.html';
                return false;
            }
        }
        return true;
    }

    // Ajouter le token aux requêtes Supabase
    setupSupabaseAuth() {
        if (this.currentToken) {
            supabase.auth.setSession({
                access_token: this.currentToken,
                refresh_token: null
            });
        }
    }
}

// Instance globale du système d'authentification
const tokenAuth = new TokenAuth();

// Fonction utilitaire pour vérifier l'accès aux données
async function checkDataAccess(tableName, recordId = null) {
    if (!tokenAuth.isLoggedIn()) {
        return { success: false, error: 'Non authentifié' };
    }

    const clientId = tokenAuth.getCurrentClient().id;

    // Vérifier l'accès selon la table
    switch (tableName) {
        case 'clients':
            // Un client ne peut accéder qu'à ses propres données
            return { success: recordId == clientId, error: 'Accès non autorisé' };
        
        case 'sites':
            // Un client ne peut accéder qu'à ses propres sites
            if (recordId) {
                const { data, error } = await supabase
                    .from('sites')
                    .select('id_client')
                    .eq('id_site', recordId)
                    .single();
                
                if (error || data.id_client != clientId) {
                    return { success: false, error: 'Accès non autorisé' };
                }
            }
            return { success: true };
        
        case 'extincteurs':
        case 'eclairages':
        case 'alarmes':
        case 'desenfumages':
            // Vérifier que l'équipement appartient à un site du client
            if (recordId) {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('sites.id_client')
                    .eq(`id_${tableName.slice(0, -1)}`, recordId)
                    .eq('sites.id_client', clientId)
                    .single();
                
                if (error || !data) {
                    return { success: false, error: 'Accès non autorisé' };
                }
            }
            return { success: true };
        
        default:
            return { success: true };
    }
}

// Fonction pour filtrer les données selon le client
function filterDataByClient(query, tableName) {
    if (!tokenAuth.isLoggedIn()) {
        return query;
    }

    const clientId = tokenAuth.getCurrentClient().id;

    switch (tableName) {
        case 'clients':
            return query.eq('id_client', clientId);
        
        case 'sites':
            return query.eq('id_client', clientId);
        
        case 'extincteurs':
        case 'eclairages':
        case 'alarmes':
        case 'desenfumages':
            return query.eq('sites.id_client', clientId);
        
        default:
            return query;
    }
}

    // Initialisation automatique
    document.addEventListener('DOMContentLoaded', async () => {
        // Ne pas vérifier l'authentification sur la page de connexion
        if (window.location.href.includes('login.html')) {
            console.log('Page de connexion - pas de vérification d\'authentification');
            return;
        }
        
        // Vérifier l'authentification au chargement de la page
        const isProtected = await tokenAuth.protectPage();
        
        if (isProtected) {
            // Configurer Supabase avec le token
            tokenAuth.setupSupabaseAuth();
            
            // Afficher les informations du client connecté
            const client = tokenAuth.getCurrentClient();
            if (client) {
                console.log(`Connecté en tant que: ${client.nom} (${client.code})`);
            }
        }
    });

// Export pour utilisation dans d'autres fichiers
window.tokenAuth = tokenAuth;
window.checkDataAccess = checkDataAccess;
window.filterDataByClient = filterDataByClient; 