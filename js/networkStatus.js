// 🌐 Composant de statut réseau unifié pour JPSI
// Affiche un voyant vert (en ligne), rouge (hors ligne) ou une roulette (synchro)

class NetworkStatusIndicator {
    constructor() {
        this.isOnline = navigator.onLine;
        this.isSyncing = false;
        this.indicator = null;
        this.setupNetworkListeners();
        this.createIndicator();
        this.updateDisplay();
    }

    // 📡 Configuration des listeners réseau
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Connexion rétablie');
            this.updateDisplay();
            this.autoSync();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('❌ Connexion perdue');
            this.updateDisplay();
        });
    }

    // 🎨 Créer l'indicateur visuel
    createIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.id = 'networkStatusIndicator';
        this.indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(this.indicator);
    }

    // 🔄 Mettre à jour l'affichage
    updateDisplay() {
        if (!this.indicator) return;

        if (this.isSyncing) {
            // Mode synchronisation - roulette qui tourne
            this.indicator.innerHTML = '🔄';
            this.indicator.style.background = '#FFA500';
            this.indicator.style.color = 'white';
            this.indicator.style.animation = 'spin 1s linear infinite';
            this.addSpinAnimation();
        } else if (this.isOnline) {
            // Mode en ligne - voyant vert
            this.indicator.innerHTML = '🟢';
            this.indicator.style.background = '#4CAF50';
            this.indicator.style.color = 'white';
            this.indicator.style.animation = 'none';
        } else {
            // Mode hors ligne - voyant rouge
            this.indicator.innerHTML = '🔴';
            this.indicator.style.background = '#f44336';
            this.indicator.style.color = 'white';
            this.indicator.style.animation = 'none';
        }
    }

    // 🎠 Ajouter l'animation de rotation
    addSpinAnimation() {
        if (!document.getElementById('spinKeyframes')) {
            const style = document.createElement('style');
            style.id = 'spinKeyframes';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 🔄 Démarrer la synchronisation
    startSync() {
        this.isSyncing = true;
        this.updateDisplay();
        console.log('🔄 Synchronisation démarrée');
    }

    // ✅ Arrêter la synchronisation
    stopSync() {
        this.isSyncing = false;
        this.updateDisplay();
        console.log('✅ Synchronisation terminée');
    }

    // 🔄 Synchronisation automatique
    async autoSync() {
        if (!this.isOnline) return;

        try {
            this.startSync();
            
            // Attendre un peu pour simuler la synchronisation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.stopSync();
            console.log('✅ Synchronisation automatique terminée');
        } catch (error) {
            console.error('❌ Erreur synchronisation automatique:', error);
            this.stopSync();
        }
    }

    // 🧹 Nettoyer l'indicateur
    destroy() {
        if (this.indicator && this.indicator.parentNode) {
            this.indicator.parentNode.removeChild(this.indicator);
        }
    }
}

// 🌐 Exposer globalement
window.NetworkStatusIndicator = NetworkStatusIndicator;

// 🚀 Initialisation automatique si le DOM est prêt
function initializeNetworkStatus() {
    if (!window.networkStatus) {
        window.networkStatus = new NetworkStatusIndicator();
        console.log('✅ NetworkStatusIndicator initialisé');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNetworkStatus);
} else {
    initializeNetworkStatus();
}
