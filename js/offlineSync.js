/**
 * Gestionnaire de synchronisation offline pour JPSI PWA
 * Gère la file d'attente des modifications et la synchronisation automatique
 */

class OfflineSyncManager {
    constructor() {
        this.syncQueue = [];
        this.isSyncing = false;
        this.syncInterval = null;
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5 secondes
        
        this.init();
    }

    /**
     * Initialisation du gestionnaire de synchronisation
     */
    async init() {
        try {
            // Charger la file d'attente depuis IndexedDB
            await this.loadSyncQueue();
            
            // Démarrer la surveillance de la connectivité
            this.startConnectivityMonitoring();
            
            // Démarrer la synchronisation automatique
            this.startAutoSync();
            
            console.log('✅ OfflineSyncManager initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation OfflineSyncManager:', error);
        }
    }

    /**
     * Ajouter une modification à la file d'attente
     */
    async addToSyncQueue(operation) {
        try {
            const syncItem = {
                id: this.generateId(),
                operation: operation,
                timestamp: Date.now(),
                retryCount: 0,
                status: 'pending'
            };

            this.syncQueue.push(syncItem);
            await this.saveSyncQueue();
            
            console.log(`📝 Ajouté à la file de synchronisation: ${operation.type} ${operation.table}`);
            
            // Si en ligne, tenter la synchronisation immédiate
            if (navigator.onLine) {
                this.triggerSync();
            }
            
            return syncItem.id;
        } catch (error) {
            console.error('❌ Erreur ajout à la file de synchronisation:', error);
            throw error;
        }
    }

    /**
     * Exécuter la synchronisation de la file d'attente
     */
    async executeSync() {
        if (this.isSyncing || this.syncQueue.length === 0) {
            return;
        }

        this.isSyncing = true;
        console.log(`🔄 Début de la synchronisation de ${this.syncQueue.length} éléments...`);

        try {
            const itemsToSync = [...this.syncQueue];
            
            for (const item of itemsToSync) {
                if (item.status === 'completed') continue;
                
                try {
                    await this.syncItem(item);
                    item.status = 'completed';
                    console.log(`✅ Synchronisé: ${item.operation.type} ${item.operation.table}`);
                } catch (error) {
                    console.error(`❌ Échec synchronisation ${item.id}:`, error);
                    item.retryCount++;
                    
                    if (item.retryCount >= this.maxRetries) {
                        item.status = 'failed';
                        console.error(`💀 Échec définitif après ${this.maxRetries} tentatives: ${item.id}`);
                    } else {
                        item.status = 'pending';
                        console.log(`⏳ Nouvelle tentative dans ${this.retryDelay}ms pour ${item.id}`);
                    }
                }
                
                // Sauvegarder l'état mis à jour
                await this.saveSyncQueue();
                
                // Délai entre les synchronisations pour éviter la surcharge
                await this.delay(1000);
            }
            
            // Nettoyer les éléments terminés
            await this.cleanupCompletedItems();
            
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
        } finally {
            this.isSyncing = false;
            console.log('🔄 Synchronisation terminée');
        }
    }

    /**
     * Synchroniser un élément spécifique
     */
    async syncItem(item) {
        const { operation } = item;
        
        switch (operation.type) {
            case 'insert':
                return await this.syncInsert(operation);
            case 'update':
                return await this.syncUpdate(operation);
            case 'delete':
                return await this.syncDelete(operation);
            default:
                throw new Error(`Type d'opération non supporté: ${operation.type}`);
        }
    }

    /**
     * Synchroniser une insertion
     */
    async syncInsert(operation) {
        const { table, data } = operation;
        
        const { data: result, error } = await supabase
            .from(table)
            .insert(data)
            .select()
            .single();
            
        if (error) throw error;
        
        // Mettre à jour l'ID généré localement avec l'ID réel de Supabase
        if (result && result.id) {
            await this.updateLocalId(table, data.id, result.id);
        }
        
        return result;
    }

    /**
     * Synchroniser une mise à jour
     */
    async syncUpdate(operation) {
        const { table, data, where } = operation;
        
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .match(where)
            .select()
            .single();
            
        if (error) throw error;
        return result;
    }

    /**
     * Synchroniser une suppression
     */
    async syncDelete(operation) {
        const { table, where } = operation;
        
        const { error } = await supabase
            .from(table)
            .delete()
            .match(where);
            
        if (error) throw error;
        return true;
    }

    /**
     * Mettre à jour l'ID local avec l'ID réel de Supabase
     */
    async updateLocalId(table, localId, realId) {
        try {
            // Mettre à jour dans IndexedDB
            const items = await indexedDBManager.getData(table);
            const item = items.find(i => i.id === localId);
            if (item) {
                item.id = realId;
                await indexedDBManager.saveData(table, items);
            }
        } catch (error) {
            console.warn('⚠️ Impossible de mettre à jour l\'ID local:', error);
        }
    }

    /**
     * Déclencher la synchronisation
     */
    triggerSync() {
        if (navigator.onLine && !this.isSyncing) {
            this.executeSync();
        }
    }

    /**
     * Démarrer la synchronisation automatique
     */
    startAutoSync() {
        // Synchronisation toutes les 30 secondes si en ligne
        this.syncInterval = setInterval(() => {
            if (navigator.onLine && this.syncQueue.length > 0) {
                this.triggerSync();
            }
        }, 30000);
    }

    /**
     * Surveiller la connectivité
     */
    startConnectivityMonitoring() {
        window.addEventListener('online', () => {
            console.log('🌐 Connexion rétablie, synchronisation...');
            this.triggerSync();
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Connexion perdue, mode offline activé');
        });
    }

    /**
     * Charger la file d'attente depuis IndexedDB
     */
    async loadSyncQueue() {
        try {
            const stored = localStorage.getItem('jpsi_sync_queue');
            this.syncQueue = stored ? JSON.parse(stored) : [];
            console.log(`📋 File de synchronisation chargée: ${this.syncQueue.length} éléments`);
        } catch (error) {
            console.warn('⚠️ Impossible de charger la file de synchronisation:', error);
            this.syncQueue = [];
        }
    }

    /**
     * Sauvegarder la file d'attente dans localStorage
     */
    async saveSyncQueue() {
        try {
            localStorage.setItem('jpsi_sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('❌ Erreur sauvegarde file de synchronisation:', error);
        }
    }

    /**
     * Nettoyer les éléments terminés
     */
    async cleanupCompletedItems() {
        const initialLength = this.syncQueue.length;
        this.syncQueue = this.syncQueue.filter(item => item.status !== 'completed');
        
        if (this.syncQueue.length < initialLength) {
            await this.saveSyncQueue();
            console.log(`🧹 Nettoyage: ${initialLength - this.syncQueue.length} éléments supprimés`);
        }
    }

    /**
     * Obtenir le statut de la synchronisation
     */
    getSyncStatus() {
        const pending = this.syncQueue.filter(i => i.status === 'pending').length;
        const failed = this.syncQueue.filter(i => i.status === 'failed').length;
        const completed = this.syncQueue.filter(i => i.status === 'completed').length;
        
        return {
            total: this.syncQueue.length,
            pending,
            failed,
            completed,
            isSyncing: this.isSyncing
        };
    }

    /**
     * Vider complètement la file d'attente
     */
    async clearQueue() {
        try {
            this.syncQueue = [];
            await this.saveSyncQueue();
            console.log('🧹 File d\'attente de synchronisation vidée');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du vidage de la file:', error);
            return false;
        }
    }

    /**
     * Générer un ID unique
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Délai asynchrone
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Forcer la synchronisation manuelle
     */
    async forceSync() {
        console.log('🔄 Synchronisation forcée...');
        await this.executeSync();
    }

    /**
     * Vider la file d'attente (pour les tests)
     */
    async clearSyncQueue() {
        this.syncQueue = [];
        await this.saveSyncQueue();
        console.log('🗑️ File de synchronisation vidée');
    }
}

/**
 * 🚀 Gestionnaire Offline-First pour JPSI
 * Mode de travail 100% offline avec synchronisation à la fin
 */
class OfflineFirstManager {
    constructor() {
        this.preloadedSites = new Set();
        this.preloadedInterventions = new Set();
        this.isPreloading = false;
        this.preloadProgress = 0;
        this.preloadCallbacks = [];
    }

    /**
     * Précharger intelligemment les données pour une intervention
     * @param {number} interventionId - ID de l'intervention
     * @param {number} siteId - ID du site
     * @param {Function} progressCallback - Callback pour le progrès
     */
    async preloadInterventionData(interventionId, siteId, progressCallback = null) {
        if (this.isPreloading) {
            console.log('⏳ Préchargement déjà en cours...');
            return false;
        }

        // Vérifier si déjà préchargé
        const cacheKey = `${siteId}-${interventionId}`;
        if (this.preloadedInterventions.has(cacheKey)) {
            console.log('✅ Données déjà préchargées');
            return true;
        }

        this.isPreloading = true;
        this.preloadProgress = 0;
        
        try {
            console.log(`🚀 Début du préchargement intelligent pour l'intervention ${interventionId}`);
            
            // Étape 1: Précharger les catalogues (10%)
            if (progressCallback) progressCallback(10, '📚 Chargement des catalogues...');
            await this.preloadCatalogues();
            this.preloadProgress = 20;

            // Étape 2: Précharger les données du site (30%)
            if (progressCallback) progressCallback(30, '🏢 Chargement des données du site...');
            await this.preloadSiteData(siteId);
            this.preloadProgress = 50;

            // Étape 3: Précharger l'intervention spécifique (70%)
            if (progressCallback) progressCallback(70, '📋 Chargement de l\'intervention...');
            await this.preloadIntervention(interventionId, siteId);
            this.preloadProgress = 90;

            // Étape 4: Finalisation (100%)
            if (progressCallback) progressCallback(100, '✅ Préchargement terminé !');
            
            // Marquer comme préchargé
            this.preloadedInterventions.add(cacheKey);
            this.preloadedSites.add(siteId);
            
            console.log('✅ Préchargement intelligent terminé avec succès');
            return true;

        } catch (error) {
            console.error('❌ Erreur lors du préchargement intelligent:', error);
            return false;
        } finally {
            this.isPreloading = false;
        }
    }

    /**
     * Précharger les catalogues
     */
    async preloadCatalogues() {
        try {
            // Vérifier si déjà en cache
            const eclairageCat = await indexedDBManager.getData('eclairage_catalogue');
            const extincteurCat = await indexedDBManager.getData('fire_extinguisher_certification_registry');
            
            if (eclairageCat && extincteurCat && eclairageCat.length > 0 && extincteurCat.length > 0) {
                console.log('✅ Catalogues déjà en cache');
                return;
            }

            console.log('📚 Préchargement des catalogues...');
            
            // Charger le catalogue des éclairages
            const { data: eclairageCatData } = await supabase
                .from('eclairage_catalogue')
                .select('*');

            // Charger le catalogue des extincteurs
            const { data: extincteurCatData } = await supabase
                .from('fire_extinguisher_certification_registry')
                .select('*');

            // Sauvegarder en IndexedDB
            if (eclairageCatData && eclairageCatData.length > 0) {
                await indexedDBManager.saveBulk('eclairage_catalogue', eclairageCatData, { clearBefore: true });
            }
            if (extincteurCatData && extincteurCatData.length > 0) {
                await indexedDBManager.saveBulk('fire_extinguisher_certification_registry', extincteurCatData, { clearBefore: true });
            }

            console.log('✅ Catalogues préchargés');
        } catch (error) {
            console.error('❌ Erreur préchargement catalogues:', error);
            throw error;
        }
    }

    /**
     * Précharger les données du site
     */
    async preloadSiteData(siteId) {
        try {
            console.log(`🏢 Préchargement des données du site ${siteId}...`);
            
            // Charger les informations du site
            const { data: siteInfo } = await supabase
                .from('sites')
                .select('*, clients(*)')
                .eq('id_site', siteId)
                .single();

            if (siteInfo) {
                await indexedDBManager.saveData('sites', siteInfo);
                if (siteInfo.clients) {
                    await indexedDBManager.saveData('clients', siteInfo.clients);
                }
            }

            // Charger tous les types d'équipements
            const equipmentTypes = ['extincteurs', 'eclairages', 'alarmes', 'desenfumages', 'rias', 'plans', 'bvs'];
            
            for (const type of equipmentTypes) {
                const { data: equipments } = await supabase
                    .from(type)
                    .select('*')
                    .eq('id_site', siteId);
                
                if (equipments && equipments.length > 0) {
                    await indexedDBManager.saveBulk(type, equipments, { clearBefore: true });
                    console.log(`✅ ${equipments.length} ${type} préchargés`);
                }
            }

            console.log('✅ Données du site préchargées');
        } catch (error) {
            console.error('❌ Erreur préchargement site:', error);
            throw error;
        }
    }

    /**
     * Précharger une intervention spécifique
     */
    async preloadIntervention(interventionId, siteId) {
        try {
            console.log(`📋 Préchargement de l'intervention ${interventionId}...`);
            
            // Charger l'intervention complète
            const { data: intervention } = await supabase
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

            if (intervention) {
                await indexedDBManager.saveData('interventions', intervention);
                
                // Sauvegarder le site et le client
                if (intervention.sites) {
                    await indexedDBManager.saveData('sites', intervention.sites);
                    if (intervention.sites.clients) {
                        await indexedDBManager.saveData('clients', intervention.sites.clients);
                    }
                }
            }

            console.log('✅ Intervention préchargée');
        } catch (error) {
            console.error('❌ Erreur préchargement intervention:', error);
            throw error;
        }
    }

    /**
     * Vérifier si les données sont préchargées
     */
    isDataPreloaded(siteId, interventionId = null) {
        const sitePreloaded = this.preloadedSites.has(siteId);
        if (!interventionId) return sitePreloaded;
        
        const cacheKey = `${siteId}-${interventionId}`;
        return this.preloadedInterventions.has(cacheKey);
    }

    /**
     * Obtenir le statut de préchargement
     */
    getPreloadStatus() {
        return {
            isPreloading: this.isPreloading,
            progress: this.preloadProgress,
            preloadedSites: this.preloadedSites.size,
            preloadedInterventions: this.preloadedInterventions.size
        };
    }

    /**
     * Nettoyer les données préchargées (optionnel)
     */
    async clearPreloadedData() {
        this.preloadedSites.clear();
        this.preloadedInterventions.clear();
        console.log('🧹 Données préchargées nettoyées');
    }

    /**
     * Synchroniser toutes les données en fin de vérification
     */
    async syncAllData() {
        console.log('🔄 Synchronisation finale de toutes les données...');
        
        // Forcer la synchronisation de la file d'attente
        if (window.offlineSyncManager) {
            await window.offlineSyncManager.forceSync();
        }
        
        // Synchroniser les données du syncManager
        if (window.syncManager) {
            await window.syncManager.syncPendingData();
        }
        
        console.log('✅ Synchronisation finale terminée');
    }
}

// Instance globale
window.offlineSyncManager = new OfflineSyncManager();
window.offlineFirstManager = new OfflineFirstManager();

