// 🔄 Sync Manager pour JPSI
// Synchronisation IndexedDB ↔ Supabase

class SyncManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.syncInProgress = false;
        this.setupNetworkListeners();
    }

    // 📡 Configuration des listeners réseau
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Connexion rétablie');
            this.showNetworkStatus('🌐 En ligne');
            this.syncPendingData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('❌ Connexion perdue');
            this.showNetworkStatus('❌ Hors ligne');
        });
    }

    // 📊 Afficher le statut réseau (utilise le composant unifié)
    showNetworkStatus(status) {
        // Utiliser le composant NetworkStatusIndicator unifié
        if (window.networkStatus) {
            if (status.includes('Synchronisation') || status.includes('🔄')) {
                window.networkStatus.startSync();
            } else {
                window.networkStatus.stopSync();
            }
        }
    }

    // 📥 Charger les données du site dans IndexedDB
    async loadSiteData(siteId) {
        if (!this.isOnline) {
            console.log('❌ Hors ligne - Impossible de charger les données');
            return false;
        }

        try {
            console.log(`📥 Chargement des données du site ${siteId}...`);

            // Charger et stocker les informations du site (pour offline)
            try {
                const { data: siteInfo } = await supabase
                    .from('sites')
                    .select('*')
                    .eq('id_site', siteId)
                    .single();
                if (siteInfo) {
                    await indexedDBManager.saveData('sites', siteInfo);
                }
            } catch (e) {
                console.warn('⚠️ Impossible de précharger les métadonnées du site:', e);
            }

            // Charger les équipements du site
            const { data: extincteurs, error: extError } = await supabase
                .from('extincteurs')
                .select('*')
                .eq('id_site', siteId);

            if (extError) throw extError;

            const { data: eclairages, error: eclError } = await supabase
                .from('eclairages')
                .select('*')
                .eq('id_site', siteId);

            if (eclError) throw eclError;

            const { data: alarmes, error: alarmError } = await supabase
                .from('alarmes')
                .select('*')
                .eq('id_site', siteId);

            if (alarmError) throw alarmError;

            const { data: desenfumages, error: desError } = await supabase
                .from('desenfumages')
                .select('*')
                .eq('id_site', siteId);

            if (desError) throw desError;

            const { data: rias, error: riaError } = await supabase
                .from('rias')
                .select('*')
                .eq('id_site', siteId);

            if (riaError) throw riaError;

            const { data: plans, error: planError } = await supabase
                .from('plans')
                .select('*')
                .eq('id_site', siteId);

            if (planError) throw planError;

            const { data: bvs, error: bvError } = await supabase
                .from('bv')
                .select('*')
                .eq('id_site', siteId);

            if (bvError) throw bvError;

            // Sauvegarder dans IndexedDB (bulk, remplacement du contenu)
            await indexedDBManager.saveBulk('extincteurs', extincteurs || [], { clearBefore: true });
            await indexedDBManager.saveBulk('eclairages', eclairages || [], { clearBefore: true });
            await indexedDBManager.saveBulk('alarmes', alarmes || [], { clearBefore: true });
            await indexedDBManager.saveBulk('desenfumages', desenfumages || [], { clearBefore: true });
            await indexedDBManager.saveBulk('rias', rias || [], { clearBefore: true });
            await indexedDBManager.saveBulk('plans', plans || [], { clearBefore: true });
            await indexedDBManager.saveBulk('bvs', bvs || [], { clearBefore: true });

            console.log('✅ Données du site chargées dans IndexedDB');
            return true;

        } catch (error) {
            console.error('❌ Erreur chargement données site:', error);
            return false;
        }
    }

    // 📚 Charger les catalogues
    async loadCatalogues() {
        if (!this.isOnline) {
            console.log('❌ Hors ligne - Impossible de charger les catalogues');
            return false;
        }

        try {
            console.log('📚 Chargement des catalogues...');

            // Charger le catalogue des éclairages
            const { data: eclairageCat, error: eclCatError } = await supabase
                .from('eclairage_catalogue')
                .select('*');

            if (eclCatError) throw eclCatError;

            // Charger le catalogue des extincteurs
            const { data: extincteurCat, error: extCatError } = await supabase
                .from('fire_extinguisher_certification_registry')
                .select('*');

            if (extCatError) throw extCatError;

            // Sauvegarder dans IndexedDB (bulk, remplacement)
            if (Array.isArray(eclairageCat)) {
                await indexedDBManager.saveBulk('eclairage_catalogue', eclairageCat, { clearBefore: true });
            } else if (eclairageCat) {
                await indexedDBManager.saveData('eclairage_catalogue', eclairageCat);
            }
            if (Array.isArray(extincteurCat)) {
                await indexedDBManager.saveBulk('fire_extinguisher_certification_registry', extincteurCat, { clearBefore: true });
            } else if (extincteurCat) {
                await indexedDBManager.saveData('fire_extinguisher_certification_registry', extincteurCat);
            }

            console.log('✅ Catalogues chargés dans IndexedDB');
            return true;

        } catch (error) {
            console.error('❌ Erreur chargement catalogues:', error);
            return false;
        }
    }

    // 📝 Sauvegarder une vérification (online + offline)
    async saveVerification(verificationData) {
        try {
            // Générer un ID temporaire pour l'usage local
            const localId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const verificationWithId = {
                ...verificationData,
                id: localId,
                timestamp: new Date().toISOString()
            };

            // Sauvegarder en IndexedDB pour usage immédiat
            await indexedDBManager.saveData('verifications', verificationWithId);

            // Ajouter à la file de synchronisation
            if (window.offlineSyncManager) {
                await window.offlineSyncManager.addToSyncQueue({
                    type: 'insert',
                    table: 'verifications',
                    data: verificationData
                });
            }

            console.log('✅ Vérification sauvegardée localement et ajoutée à la file de synchronisation');
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde vérification:', error);
            throw error;
        }
    }

    // 🆕 Sauvegarder un nouvel équipement
    async saveNewEquipment(equipmentData) {
        // Ajouter aux nouveaux équipements
        await indexedDBManager.saveData('newEquipments', {
            ...equipmentData,
            timestamp: new Date().toISOString(),
            synced: false
        });

        // Si en ligne, synchroniser immédiatement
        if (this.isOnline) {
            await this.syncPendingData();
        }

        // Mettre à jour le statut
        await this.updateSyncStatus();
    }

    // ✏️ Sauvegarder une modification d'équipement
    async saveModifiedEquipment(equipmentData) {
        // Ajouter aux équipements modifiés
        await indexedDBManager.saveData('modifiedEquipments', {
            ...equipmentData,
            timestamp: new Date().toISOString(),
            synced: false
        });

        // Si en ligne, synchroniser immédiatement
        if (this.isOnline) {
            await this.syncPendingData();
        }

        // Mettre à jour le statut
        await this.updateSyncStatus();
    }

    // 🔄 Synchroniser les données en attente
    async syncPendingData() {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }

        this.syncInProgress = true;
        console.log('🔄 Synchronisation des données en attente...');

        try {
            // Synchroniser les vérifications en attente
            const pendingVerifications = await indexedDBManager.getData('pendingVerifications');
            const unsyncedVerifications = pendingVerifications.filter(v => !v.synced);

            for (const verification of unsyncedVerifications) {
                try {
                    const { error } = await supabase
                        .from('verifications')
                        .insert(verification);

                    if (!error) {
                        // Marquer comme synchronisé
                        await indexedDBManager.deleteData('pendingVerifications', verification.id);
                    }
                } catch (error) {
                    console.error('❌ Erreur sync vérification:', error);
                }
            }

            // Synchroniser les nouveaux équipements
            const newEquipments = await indexedDBManager.getData('newEquipments');
            const unsyncedNewEquipments = newEquipments.filter(e => !e.synced);

            for (const equipment of unsyncedNewEquipments) {
                try {
                    const { error } = await supabase
                        .from(equipment.type_equipement)
                        .insert(equipment);

                    if (!error) {
                        await indexedDBManager.deleteData('newEquipments', equipment.id);
                    }
                } catch (error) {
                    console.error('❌ Erreur sync nouvel équipement:', error);
                }
            }

            // Synchroniser les équipements modifiés
            const modifiedEquipments = await indexedDBManager.getData('modifiedEquipments');
            const unsyncedModifiedEquipments = modifiedEquipments.filter(e => !e.synced);

            for (const equipment of unsyncedModifiedEquipments) {
                try {
                    const { error } = await supabase
                        .from(equipment.type_equipement)
                        .update(equipment)
                        .eq('id_' + equipment.type_equipement, equipment.id_equipement);

                    if (!error) {
                        await indexedDBManager.deleteData('modifiedEquipments', equipment.id);
                    }
                } catch (error) {
                    console.error('❌ Erreur sync équipement modifié:', error);
                }
            }

            // Mettre à jour le statut
            await this.updateSyncStatus();
            console.log('✅ Synchronisation terminée');

        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // 📊 Mettre à jour le statut de synchronisation
    async updateSyncStatus() {
        const pendingVerifications = await indexedDBManager.getData('pendingVerifications');
        const newEquipments = await indexedDBManager.getData('newEquipments');
        const modifiedEquipments = await indexedDBManager.getData('modifiedEquipments');

        const status = {
            lastSync: this.isOnline ? new Date().toISOString() : null,
            pendingVerifications: pendingVerifications.length,
            pendingNewEquipments: newEquipments.length,
            pendingModifiedEquipments: modifiedEquipments.length,
            networkStatus: this.isOnline ? 'online' : 'offline'
        };

        await indexedDBManager.updateSyncStatus(status);
        this.showSyncStatus(status);
    }

    // 📊 Afficher le statut de synchronisation (utilise le composant unifié)
    showSyncStatus(status) {
        // Utiliser le composant NetworkStatusIndicator unifié
        if (window.networkStatus) {
            const totalPending = status.pendingVerifications + status.pendingNewEquipments + status.pendingModifiedEquipments;
            
            if (totalPending > 0) {
                window.networkStatus.startSync();
            } else {
                window.networkStatus.stopSync();
            }
        }
    }

    // 📱 Vérifier la compatibilité
    static isSupported() {
        return 'indexedDB' in window && 'serviceWorker' in navigator;
    }
}

// 🌐 Instance globale
const syncManager = new SyncManager();

// 📱 Test de compatibilité au chargement
document.addEventListener('DOMContentLoaded', () => {
    if (SyncManager.isSupported()) {
        console.log('✅ SyncManager supporté');
    } else {
        console.error('❌ SyncManager non supporté sur ce navigateur');
    }
    
    // S'assurer que le composant NetworkStatusIndicator est chargé
    if (!window.networkStatus) {
        console.log('🔄 Initialisation du NetworkStatusIndicator...');
        window.networkStatus = new NetworkStatusIndicator();
    }
});
