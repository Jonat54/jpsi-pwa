// 📱 Gestionnaire offline/online unifié pour JPSI
// Gère le chargement des données depuis Supabase ou IndexedDB selon le statut réseau

class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupNetworkListeners();
    }

    // 📡 Configuration des listeners réseau
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Connexion rétablie - Mode en ligne activé');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Connexion perdue - Mode hors ligne activé');
        });
    }

    // 🔍 Vérifier si on est en ligne
    isOnline() {
        return this.isOnline;
    }

    // 🔍 Vérifier si on est hors ligne
    isOffline() {
        return !this.isOnline;
    }

    // 📥 Charger les données avec fallback offline
    async loadDataWithFallback(loadOnlineFunction, loadOfflineFunction, params) {
        try {
            if (this.isOnline) {
                console.log('🌐 Mode en ligne - Chargement depuis Supabase');
                return await loadOnlineFunction(params);
            } else {
                console.log('📱 Mode hors ligne - Chargement depuis le cache local');
                return await loadOfflineFunction(params);
            }
        } catch (error) {
            console.error('❌ Erreur chargement en ligne, tentative hors ligne:', error);
            
            try {
                console.log('📱 Fallback vers le cache local...');
                return await loadOfflineFunction(params);
            } catch (offlineError) {
                console.error('❌ Erreur chargement hors ligne:', offlineError);
                throw offlineError;
            }
        }
    }

    // 🔄 Charger les données du site avec fallback
    async loadSiteDataWithFallback(siteId, interventionId = null) {
        const loadOnline = async (params) => {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Supabase non disponible');

            if (interventionId) {
                // Charger l'intervention
                const { data: intervention, error: interventionError } = await supabase
                    .from('interventions')
                    .select(`
                        *,
                        sites!inner(
                            *,
                            clients!inner(*)
                        )
                    `)
                    .eq('id_intervention', interventionId)
                    .single();

                if (interventionError) throw interventionError;
                return intervention;
            } else {
                // Charger directement le site
                const { data: site, error: siteError } = await supabase
                    .from('sites')
                    .select(`
                        *,
                        clients(*)
                    `)
                    .eq('id_site', siteId)
                    .single();

                if (siteError) throw siteError;
                return site;
            }
        };

        const loadOffline = async (params) => {
            if (!window.indexedDBManager) {
                throw new Error('IndexedDB non disponible');
            }

            // Charger le site depuis IndexedDB
            const site = await indexedDBManager.getData('sites', siteId);
            if (!site) {
                throw new Error('Site non trouvé dans le cache local');
            }

            // Charger le client depuis IndexedDB
            let client = null;
            if (site.id_client) {
                client = await indexedDBManager.getData('clients', site.id_client);
            }

            return { site, client };
        };

        return await this.loadDataWithFallback(loadOnline, loadOffline, { siteId, interventionId });
    }

    // 🔄 Charger les équipements avec fallback
    async loadEquipmentsWithFallback(equipmentType, siteId) {
        const loadOnline = async (params) => {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Supabase non disponible');

            const { data, error } = await supabase
                .from(equipmentType)
                .select('*')
                .eq('id_site', siteId)
                .order('num_ext', { ascending: true });

            if (error) throw error;
            return data || [];
        };

        const loadOffline = async (params) => {
            if (!window.indexedDBManager) {
                throw new Error('IndexedDB non disponible');
            }

            const allEquipments = await indexedDBManager.getAllData(equipmentType);
            const siteEquipments = allEquipments.filter(equip => equip.id_site === siteId);
            
            // Trier par numéro
            return siteEquipments.sort((a, b) => {
                const numA = parseInt(a.num_ext) || 0;
                const numB = parseInt(b.num_ext) || 0;
                return numA - numB;
            });
        };

        return await this.loadDataWithFallback(loadOnline, loadOffline, { equipmentType, siteId });
    }

    // 🔄 Charger les agents avec fallback
    async loadAgentsWithFallback(agentType) {
        const loadOnline = async (params) => {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Supabase non disponible');

            const { data, error } = await supabase
                .from(agentType)
                .select('*')
                .order('long_agt');

            if (error) throw error;
            return data || [];
        };

        const loadOffline = async (params) => {
            if (!window.indexedDBManager) {
                throw new Error('IndexedDB non disponible');
            }

            const agents = await indexedDBManager.getAllData(agentType);
            return agents || [];
        };

        return await this.loadDataWithFallback(loadOnline, loadOffline, { agentType });
    }

    // 🔄 Charger les vérifications avec fallback
    async loadVerificationsWithFallback(interventionId, equipmentType) {
        const loadOnline = async (params) => {
            const supabase = getSupabaseClient();
            if (!supabase) throw new Error('Supabase non disponible');

            const { data, error } = await supabase
                .from('verifications')
                .select('*')
                .eq('id_intervention', interventionId)
                .eq('type_equipement', equipmentType);

            if (error) throw error;
            return data || [];
        };

        const loadOffline = async (params) => {
            if (!window.indexedDBManager) {
                throw new Error('IndexedDB non disponible');
            }

            const allVerifications = await indexedDBManager.getAllData('verifications');
            return allVerifications.filter(v => 
                v.id_intervention === interventionId && 
                v.type_equipement === equipmentType
            );
        };

        return await this.loadDataWithFallback(loadOnline, loadOffline, { interventionId, equipmentType });
    }

    // 🔄 Synchroniser les données en attente
    async syncPendingData() {
        if (!this.isOnline) {
            console.log('📱 Hors ligne - Synchronisation impossible');
            return false;
        }

        try {
            if (window.networkStatus) {
                window.networkStatus.startSync();
            }

            if (window.syncManager) {
                await window.syncManager.syncPendingData();
            }

            if (window.networkStatus) {
                window.networkStatus.stopSync();
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
            if (window.networkStatus) {
                window.networkStatus.stopSync();
            }
            return false;
        }
    }
}

// 📱 Exposer globalement
window.OfflineManager = OfflineManager;

// 🚀 Initialisation automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.offlineManager = new OfflineManager();
    });
} else {
    window.offlineManager = new OfflineManager();
}
