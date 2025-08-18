// Système d'authentification simple avec token de la base
// Juste une identification basique

class SimpleAuth {
    constructor() {
        this.currentClient = null;
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
            const { data, error } = await supabase
                .from('clients')
                .select('id_client, nom_client, code_client')
                .eq('id_client', clientId)
                .single();

            if (error) throw error;

            this.currentClient = {
                id: data.id_client,
                nom: data.nom_client,
                code: data.code_client
            };

            // Stocker le token (simplement l'ID client)
            localStorage.setItem('jpsi_token', clientId);
            localStorage.setItem('jpsi_client_id', clientId);

            return { success: true, client: this.currentClient };
        } catch (error) {
            console.error('Erreur connexion:', error);
            return { success: false, error: error.message };
        }
    }

    // Connexion avec token de la table tokens
    async loginWithToken(token) {
        try {
            // Vérifier si Supabase est disponible
            if (!window.supabase || !supabase) {
                console.warn('⚠️ Supabase non disponible, stockage local du token');
                // Stocker le token localement même si Supabase n'est pas disponible
                localStorage.setItem('jpsi_token', token);
                localStorage.setItem('jpsi_client_id', null);
                
                this.currentClient = {
                    id: null,
                    nom: 'Utilisateur',
                    code: 'USER',
                    isTechnician: false
                };
                
                return { success: true, client: this.currentClient };
            }

            // Vérifier si le token existe dans la table tokens
            const { data: tokenData, error: tokenError } = await supabase
                .from('tokens')
                .select('*')
                .eq('token_value', token)
                .eq('is_active', true)
                .single();

            if (tokenError || !tokenData) {
                return { success: false, error: 'Token invalide' };
            }

            // Vérifier si c'est un token de technicien ou de client
            if (tokenData.user_type === 'technicien' || !tokenData.client_id) {
                // Token de technicien - pas de client spécifique
                this.currentClient = {
                    id: null,
                    nom: 'Technicien',
                    code: 'TECH',
                    isTechnician: true
                };
            } else {
                // Token de client - récupérer les infos du client
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('id_client, nom_client, code_client')
                    .eq('id_client', tokenData.client_id)
                    .single();

                if (clientError || !clientData) {
                    return { success: false, error: 'Erreur lors de la récupération des données client' };
                }

                this.currentClient = {
                    id: clientData.id_client,
                    nom: clientData.nom_client,
                    code: clientData.code_client,
                    isTechnician: false
                };
            }

            // Stocker le token et l'ID client (ou null si technicien)
            localStorage.setItem('jpsi_token', token);
            localStorage.setItem('jpsi_client_id', this.currentClient.id || null);

            return { success: true, client: this.currentClient };
        } catch (error) {
            console.error('Erreur connexion avec token:', error);
            
            // En cas d'erreur, stocker quand même le token localement
            console.warn('⚠️ Erreur de connexion, mais token stocké localement');
            localStorage.setItem('jpsi_token', token);
            localStorage.setItem('jpsi_client_id', null);
            
            this.currentClient = {
                id: null,
                nom: 'Utilisateur',
                code: 'USER',
                isTechnician: false
            };
            
            return { success: true, client: this.currentClient };
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
        const token = localStorage.getItem('jpsi_token');
        if (!token) return false;

        // Vérifier si Supabase est disponible
        if (!window.supabase || !supabase) {
            console.warn('⚠️ Supabase non disponible, utilisation du token local');
            // Garder le token en local si Supabase n'est pas disponible
            return true;
        }

        try {
            // Vérifier si le token existe dans la table tokens
            const { data: tokenData, error: tokenError } = await supabase
                .from('tokens')
                .select('*')
                .eq('token_value', token)
                .eq('is_active', true)
                .single();

            if (tokenError || !tokenData) {
                console.warn('⚠️ Token invalide ou erreur Supabase, déconnexion');
                this.logout();
                return false;
            }

            // Vérifier si c'est un token de technicien ou de client
            if (tokenData.user_type === 'technicien' || !tokenData.client_id) {
                // Token de technicien - pas de client spécifique
                this.currentClient = {
                    id: null,
                    nom: 'Technicien',
                    code: 'TECH',
                    isTechnician: true
                };
            } else {
                // Token de client - récupérer les infos du client
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('id_client, nom_client, code_client')
                    .eq('id_client', tokenData.client_id)
                    .single();

                if (clientError || !clientData) {
                    console.warn('⚠️ Erreur récupération client, déconnexion');
                    this.logout();
                    return false;
                }

                this.currentClient = {
                    id: clientData.id_client,
                    nom: clientData.nom_client,
                    code: clientData.code_client,
                    isTechnician: false
                };
            }

            return true;
        } catch (error) {
            console.error('Erreur vérification connexion:', error);
            
            // Mode hors ligne toléré pour la branche Vérification
            const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
            const VERIF_ALLOW_LIST = [
                'verification',
                'newVerification.html',
                'ongoingVerification.html',
                'verificationDetail.html',
                'verificationSummary.html',
                'verificationHistory.html',
                'verifSite.html',
                'verifDes.html',
                // Adjacent confirmés
                'extSite.html',
                'extDetail.html',
                'eclairageSite.html',
                'eclairageDetail.html',
                'alarmeSite.html',
                'desenfumageList.html',
                'desenfumageDetail.html',
                'desenfumageInstallation.html',
                'desenfumageHierarchie.html'
            ];
            const isVerificationScope = VERIF_ALLOW_LIST.some(p => pathname.includes(p));

            if (!navigator.onLine && isVerificationScope) {
                console.log('✅ Hors ligne: accès autorisé à la branche Vérification avec token local');
                return true;
            }

            // Si on est en ligne mais qu'il y a une erreur, ne pas déconnecter immédiatement
            // Garder le token local pour éviter les déconnexions intempestives
            console.warn('⚠️ Erreur de connexion, mais token conservé localement');
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