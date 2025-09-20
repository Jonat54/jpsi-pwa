// 📱 Application principale JPSI
// Version: 1.4.28 - Gestion complète online/offline

// 🌐 État global de l'application
window.AppState = {
    isOnline: navigator.onLine,
    lastSync: null,
    currentUser: null,
    currentPage: null,
    pendingData: {
        verifications: 0,
        newEquipments: 0,
        modifiedEquipments: 0
    }
};

// 📱 Objet App global avec toutes les méthodes nécessaires
const App = {
    isOnline: navigator.onLine,
    currentSite: null,

    // 📡 Vérifier le statut de connexion
    async checkConnection() {
        try {
            if (window.JPSI && window.JPSI.testConnection) {
                return await JPSI.testConnection();
            }
            return navigator.onLine;
        } catch (error) {
            console.error('❌ Erreur vérification connexion:', error);
            return false;
        }
    },

    // 📡 Gestion des permissions
    async requestPermissions() {
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                return permission;
            }
            return 'granted'; // Fallback si notifications non supportées
        } catch (error) {
            console.error('❌ Erreur demande permissions:', error);
            return 'denied';
        }
    },

    // 🔄 Synchronisation des données
    async syncData() {
        if (!this.isOnline) {
            console.log('❌ Hors ligne - Synchronisation impossible');
            return false;
        }

        try {
            console.log('🔄 Synchronisation des données...');
            
            if (window.syncManager) {
                await syncManager.syncPendingData();
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
            return false;
        }
    },

    // 🔄 Synchronisation basique (fallback)
    async basicSync() {
        // Vérifier si Supabase est disponible
        if (!window.supabase) {
            throw new Error('Supabase non initialisé');
        }

        // Synchroniser les vérifications en attente
        const pendingVerifications = await this.getPendingData('pendingVerifications');
        for (const verification of pendingVerifications) {
            try {
                const { error } = await supabase
                    .from('verifications')
                    .insert(verification);
                
                if (!error) {
                    await this.removePendingData('pendingVerifications', verification.id);
                }
            } catch (error) {
                console.error('❌ Erreur sync vérification:', error);
            }
        }

        // Synchroniser les nouveaux équipements
        const newEquipments = await this.getPendingData('newEquipments');
        for (const equipment of newEquipments) {
            try {
                const { error } = await supabase
                    .from(equipment.type_equipement)
                    .insert(equipment);
                
                if (!error) {
                    await this.removePendingData('newEquipments', equipment.id);
                }
            } catch (error) {
                console.error('❌ Erreur sync nouvel équipement:', error);
            }
        }

        // Synchroniser les équipements modifiés
        const modifiedEquipments = await this.getPendingData('modifiedEquipments');
        for (const equipment of modifiedEquipments) {
            try {
                const { error } = await supabase
                    .from(equipment.type_equipement)
                    .update(equipment)
                    .eq('id_' + equipment.type_equipement, equipment.id_equipement);
                
                if (!error) {
                    await this.removePendingData('modifiedEquipments', equipment.id);
                }
            } catch (error) {
                console.error('❌ Erreur sync équipement modifié:', error);
            }
        }
    },

    // 📥 Récupérer les données en attente
    async getPendingData(storeName) {
        try {
            if (window.indexedDBManager) {
                return await indexedDBManager.getData(storeName);
            }
            // Fallback localStorage
            const data = localStorage.getItem(`jpsi_${storeName}`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`❌ Erreur récupération ${storeName}:`, error);
            return [];
        }
    },

    // 🗑️ Supprimer une donnée en attente
    async removePendingData(storeName, id) {
        try {
            if (window.indexedDBManager) {
                await indexedDBManager.deleteData(storeName, id);
            } else {
                // Fallback localStorage
                const data = await this.getPendingData(storeName);
                const filteredData = data.filter(item => item.id !== id);
                localStorage.setItem(`jpsi_${storeName}`, JSON.stringify(filteredData));
            }
        } catch (error) {
            console.error(`❌ Erreur suppression ${storeName}:`, error);
        }
    },

    // 📊 Mettre à jour le statut online/offline
    updateOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        console.log(`🌐 Statut réseau: ${isOnline ? 'En ligne' : 'Hors ligne'}`);
        
        // Mettre à jour l'interface si nécessaire
        this.updateUI();
    },

    // 📱 Mettre à jour l'interface utilisateur
    updateUI() {
        // Utiliser le composant NetworkStatusIndicator unifié
        if (window.networkStatus) {
            // Le composant gère automatiquement l'affichage
        }

        // Mettre à jour les indicateurs de statut dans les pages
        const statusElements = document.querySelectorAll('.status-indicator');
        statusElements.forEach(element => {
            if (element.id === 'connectionStatus') {
                element.textContent = this.isOnline ? 'En ligne' : 'Hors ligne';
                element.className = `status-indicator ${this.isOnline ? 'status-online' : 'status-offline'}`;
            }
        });

        // Mettre à jour la dernière synchronisation
        const lastSyncElements = document.querySelectorAll('#lastSync');
        lastSyncElements.forEach(element => {
            if (AppState.lastSync) {
                const date = new Date(AppState.lastSync);
                element.textContent = this.formatDate(date, 'dd/MM/yyyy HH:mm');
                element.className = 'status-indicator status-online';
            } else {
                element.textContent = 'Jamais';
                element.className = 'status-indicator status-offline';
            }
        });
    },

    // 📡 Afficher le statut réseau (utilise le composant unifié)
    showNetworkStatus() {
        // Le composant NetworkStatusIndicator gère automatiquement l'affichage
        // Cette méthode est conservée pour la compatibilité mais ne fait plus rien
    },

    // 📥 Pré-charger les données essentielles
    async preloadEssentialData() {
        if (!this.isOnline) {
            console.log('❌ Hors ligne - Impossible de pré-charger les données');
            return false;
        }

        try {
            console.log('📥 Pré-chargement des données essentielles...');

            // Charger les catalogues (toujours utiles)
            if (window.syncManager) {
                await syncManager.loadCatalogues();
            }

            // Charger les sites récents si l'utilisateur est connecté
            if (window.simpleAuth && simpleAuth.isLoggedIn()) {
                const clientId = localStorage.getItem('jpsi_client_id');
                if (clientId) {
                    // Charger les sites du client connecté
                    const { data: sites, error } = await supabase
                        .from('sites')
                        .select('*')
                        .eq('id_client', clientId)
                        .limit(5); // Limiter aux 5 sites les plus récents

                    if (!error && sites && sites.length > 0) {
                        // Sauvegarder les sites dans IndexedDB
                        await indexedDBManager.saveBulk('sites', sites, { clearBefore: true });
                        console.log(`✅ ${sites.length} sites pré-chargés`);
                    }
                }
            }

            console.log('✅ Pré-chargement terminé');
            return true;
        } catch (error) {
            console.error('❌ Erreur pré-chargement:', error);
            return false;
        }
    },

    // 📅 Formater une date
    formatDate(date, format = 'dd/MM/yyyy') {
        if (!date) return '';
        
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return format
            .replace('dd', day)
            .replace('MM', month)
            .replace('yyyy', year)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    // 🔄 Initialiser l'application
    async init() {
        console.log('🚀 Initialisation de l\'application JPSI...');
        
        // Configurer les listeners réseau
        this.setupNetworkListeners();
        
        // Tester la connexion Supabase
        if (window.JPSI && window.JPSI.testConnection) {
            const isConnected = await JPSI.testConnection();
            this.updateOnlineStatus(isConnected);
        } else {
            this.updateOnlineStatus(navigator.onLine);
        }
        
        // Initialiser IndexedDB si disponible
        if (window.indexedDBManager) {
            try {
                await indexedDBManager.init();
                console.log('✅ IndexedDB initialisé');
                
                // Pré-charger les données essentielles si en ligne
                if (this.isOnline) {
                    await this.preloadEssentialData();
                }
            } catch (error) {
                console.error('❌ Erreur IndexedDB:', error);
            }
        }
        
        // Mettre à jour l'interface
        this.updateUI();
        
        console.log('✅ Application initialisée');
    },

    // 📡 Configurer les listeners réseau
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('🌐 Connexion rétablie');
            this.updateOnlineStatus(true);
            
            // Pré-charger les données quand on revient en ligne
            this.preloadEssentialData();
            
            // Synchroniser automatiquement
            if (window.syncManager) {
                syncManager.syncPendingData();
            } else {
                this.syncData().catch(error => {
                    console.error('❌ Erreur sync automatique:', error);
                });
            }
        });

        window.addEventListener('offline', () => {
            console.log('❌ Connexion perdue');
            this.updateOnlineStatus(false);
        });
    }
};

// 🚀 Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Chargement de l\'application JPSI...');
    
    // Initialiser l'application
    App.init().catch(error => {
        console.error('❌ Erreur initialisation:', error);
    });
});

// 📱 Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('❌ Erreur globale:', event.error);
    
    // Afficher un message d'erreur à l'utilisateur
    if (window.JPSI && window.JPSI.showMessage) {
        JPSI.showMessage('Une erreur est survenue', 'error');
    }
});

// 📱 Gestion des promesses rejetées
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promesse rejetée:', event.reason);
    event.preventDefault();
});

console.log('✅ app.js chargé'); 