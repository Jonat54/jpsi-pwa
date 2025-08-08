// 📱 Application principale JPSI
// Version: 1.2.1 - Gestion complète online/offline

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
window.App = {
    // 🔄 Gestion de la navigation
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'accueil.html';
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
        try {
            console.log('🔄 Début synchronisation...');
            
            // Vérifier si on est en ligne
            if (!AppState.isOnline) {
                throw new Error('Pas de connexion internet');
            }

            // Utiliser le SyncManager s'il existe
            if (window.syncManager) {
                await syncManager.syncPendingData();
            } else {
                // Fallback basique
                await this.basicSync();
            }

            // Mettre à jour le statut
            AppState.lastSync = new Date().toISOString();
            this.updateOnlineStatus(true);
            
            console.log('✅ Synchronisation terminée');
            return true;
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
            this.updateOnlineStatus(false);
            throw error;
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
        AppState.isOnline = isOnline;
        this.updateUI();
    },

    // 🎨 Mettre à jour l'interface utilisateur
    updateUI() {
        // Mettre à jour les indicateurs de statut
        const statusElements = document.querySelectorAll('.status-indicator');
        statusElements.forEach(element => {
            if (element.id === 'connectionStatus') {
                element.textContent = AppState.isOnline ? 'En ligne' : 'Hors ligne';
                element.className = `status-indicator ${AppState.isOnline ? 'status-online' : 'status-offline'}`;
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

        // Afficher/masquer les indicateurs de statut réseau
        this.showNetworkStatus();
    },

    // 📡 Afficher le statut réseau
    showNetworkStatus() {
        let statusIndicator = document.getElementById('networkStatus');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.id = 'networkStatus';
            statusIndicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: ${AppState.isOnline ? '#4CAF50' : '#f44336'};
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(statusIndicator);
        }
        
        statusIndicator.textContent = AppState.isOnline ? '🌐 En ligne' : '❌ Hors ligne';
        statusIndicator.style.background = AppState.isOnline ? '#4CAF50' : '#f44336';
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