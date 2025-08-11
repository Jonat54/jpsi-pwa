// 📱 IndexedDB Manager pour JPSI
// Gestion du stockage local pour mode offline

class IndexedDBManager {
    constructor() {
        this.dbName = 'JPSIDatabase';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    // 🔧 Initialisation de la base de données
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('❌ Erreur ouverture IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('✅ IndexedDB initialisé');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 🏢 Sites
                if (!db.objectStoreNames.contains('sites')) {
                    const sitesStore = db.createObjectStore('sites', { keyPath: 'id_site' });
                    sitesStore.createIndex('nom_site', 'nom_site', { unique: false });
                }

                // 🔥 Équipements
                if (!db.objectStoreNames.contains('extincteurs')) {
                    const extincteursStore = db.createObjectStore('extincteurs', { keyPath: 'id_extincteur' });
                    extincteursStore.createIndex('id_site', 'id_site', { unique: false });
                }

                if (!db.objectStoreNames.contains('eclairages')) {
                    const eclairagesStore = db.createObjectStore('eclairages', { keyPath: 'id_eclairage' });
                    eclairagesStore.createIndex('id_site', 'id_site', { unique: false });
                }

                if (!db.objectStoreNames.contains('alarmes')) {
                    const alarmesStore = db.createObjectStore('alarmes', { keyPath: 'id_alarme' });
                    alarmesStore.createIndex('id_site', 'id_site', { unique: false });
                }

                if (!db.objectStoreNames.contains('desenfumages')) {
                    const desenfumagesStore = db.createObjectStore('desenfumages', { keyPath: 'id_desenfumage' });
                    desenfumagesStore.createIndex('id_site', 'id_site', { unique: false });
                }

                if (!db.objectStoreNames.contains('rias')) {
                    const riasStore = db.createObjectStore('rias', { keyPath: 'id_ria' });
                    riasStore.createIndex('id_site', 'id_site', { unique: false });
                }

                if (!db.objectStoreNames.contains('plans')) {
                    const plansStore = db.createObjectStore('plans', { keyPath: 'id_plan' });
                    plansStore.createIndex('id_site', 'id_site', { unique: false });
                }

                if (!db.objectStoreNames.contains('bvs')) {
                    const bvsStore = db.createObjectStore('bvs', { keyPath: 'id_bv' });
                    bvsStore.createIndex('id_site', 'id_site', { unique: false });
                }

                // 📚 Catalogues
                if (!db.objectStoreNames.contains('eclairage_catalogue')) {
                    const eclairageCatStore = db.createObjectStore('eclairage_catalogue', { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains('fire_extinguisher_certification_registry')) {
                    const extincteurCatStore = db.createObjectStore('fire_extinguisher_certification_registry', { keyPath: 'id' });
                }

                // 🔄 Interventions en cours
                if (!db.objectStoreNames.contains('currentIntervention')) {
                    db.createObjectStore('currentIntervention', { keyPath: 'id' });
                }

                // 📝 Vérifications en attente
                if (!db.objectStoreNames.contains('pendingVerifications')) {
                    const verifStore = db.createObjectStore('pendingVerifications', { keyPath: 'id', autoIncrement: true });
                    verifStore.createIndex('id_equipement', 'id_equipement', { unique: false });
                    verifStore.createIndex('type_equipement', 'type_equipement', { unique: false });
                }

                // 🆕 Nouveaux équipements
                if (!db.objectStoreNames.contains('newEquipments')) {
                    const newEquipStore = db.createObjectStore('newEquipments', { keyPath: 'id', autoIncrement: true });
                    newEquipStore.createIndex('type_equipement', 'type_equipement', { unique: false });
                }

                // ✏️ Équipements modifiés
                if (!db.objectStoreNames.contains('modifiedEquipments')) {
                    const modEquipStore = db.createObjectStore('modifiedEquipments', { keyPath: 'id', autoIncrement: true });
                    modEquipStore.createIndex('id_equipement', 'id_equipement', { unique: false });
                    modEquipStore.createIndex('type_equipement', 'type_equipement', { unique: false });
                }

                // 📊 Statut de synchronisation
                if (!db.objectStoreNames.contains('syncStatus')) {
                    db.createObjectStore('syncStatus', { keyPath: 'id' });
                }

                console.log('✅ Structure IndexedDB créée');
            };
        });
    }

    // 📥 Sauvegarder des données
    async saveData(storeName, data) {
        if (!this.isInitialized) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.put(data);
            
            request.onsuccess = () => {
                console.log(`✅ Données sauvegardées dans ${storeName}`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error(`❌ Erreur sauvegarde ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    // 📥 Sauvegarde en lot (tableaux d'objets)
    async saveBulk(storeName, items, options = { clearBefore: false }) {
        if (!this.isInitialized) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => {
                console.error(`❌ Erreur transaction bulk ${storeName}:`, transaction.error);
                reject(transaction.error);
            };

            const putAll = (array) => {
                (array || []).forEach((item) => {
                    try {
                        store.put(item);
                    } catch (err) {
                        console.error(`❌ Erreur put dans ${storeName}:`, err, item);
                    }
                });
            };

            if (options?.clearBefore) {
                const clearReq = store.clear();
                clearReq.onsuccess = () => putAll(items);
                clearReq.onerror = () => {
                    console.error(`❌ Erreur clear ${storeName}:`, clearReq.error);
                    reject(clearReq.error);
                };
            } else {
                putAll(items);
            }
        });
    }

    // 📤 Récupérer des données
    async getData(storeName, key = null) {
        if (!this.isInitialized) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            
            let request;
            if (key) {
                request = store.get(key);
            } else {
                request = store.getAll();
            }
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error(`❌ Erreur lecture ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    // 🗑️ Supprimer des données
    async deleteData(storeName, key) {
        if (!this.isInitialized) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.delete(key);
            
            request.onsuccess = () => {
                console.log(`✅ Données supprimées de ${storeName}`);
                resolve();
            };
            
            request.onerror = () => {
                console.error(`❌ Erreur suppression ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    // 🧹 Vider un store
    async clearStore(storeName) {
        if (!this.isInitialized) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            const request = store.clear();
            
            request.onsuccess = () => {
                console.log(`✅ Store ${storeName} vidé`);
                resolve();
            };
            
            request.onerror = () => {
                console.error(`❌ Erreur vidage ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    // 📊 Obtenir le statut de synchronisation
    async getSyncStatus() {
        const status = await this.getData('syncStatus', 'main');
        return status || {
            lastSync: null,
            pendingVerifications: 0,
            pendingNewEquipments: 0,
            pendingModifiedEquipments: 0,
            networkStatus: 'unknown'
        };
    }

    // 🔄 Mettre à jour le statut de synchronisation
    async updateSyncStatus(status) {
        await this.saveData('syncStatus', {
            id: 'main',
            ...status,
            lastUpdate: new Date().toISOString()
        });
    }

    // 📱 Vérifier la compatibilité
    static isSupported() {
        return 'indexedDB' in window;
    }
}

// 🌐 Instance globale
const indexedDBManager = new IndexedDBManager();

// 📱 Test de compatibilité au chargement
document.addEventListener('DOMContentLoaded', async () => {
    if (IndexedDBManager.isSupported()) {
        console.log('✅ IndexedDB supporté');
        try {
            await indexedDBManager.init();
            console.log('✅ IndexedDB initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur initialisation IndexedDB:', error);
        }
    } else {
        console.error('❌ IndexedDB non supporté sur ce navigateur');
    }
});
