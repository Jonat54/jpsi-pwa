-- =====================================================
-- AJOUT DES TABLES RIA ET PLANS
-- =====================================================

-- Table RIA (Robinet d'Incendie Armé)
CREATE TABLE IF NOT EXISTS rias (
    id_ria SERIAL PRIMARY KEY,
    id_site INTEGER REFERENCES sites(id_site) ON DELETE CASCADE,
    numero_ria VARCHAR(50) NOT NULL, -- Numéro du RIA
    niveau_ria VARCHAR(50), -- Niveau/étage
    emplacement_ria VARCHAR(200), -- Emplacement précis
    marque_ria VARCHAR(100), -- Marque du RIA
    modele_ria VARCHAR(100), -- Modèle du RIA
    diffuseur_ria VARCHAR(100), -- Type de diffuseur
    longueur_ria VARCHAR(50), -- Longueur du tuyau/lance
    diametre_ria VARCHAR(20), -- Diamètre du tuyau
    pression_statique_ria VARCHAR(50), -- Pression statique
    pression_dynamique_ria VARCHAR(50), -- Pression dynamique
    type_vanne_arret_ria VARCHAR(100), -- Type de vanne d'arrêt
    presence_panneau_ria BOOLEAN DEFAULT false, -- Présence d'un panneau
    date_creation_ria TIMESTAMPTZ DEFAULT NOW(),
    date_modification_ria TIMESTAMPTZ DEFAULT NOW()
);

-- Table Plans
CREATE TABLE IF NOT EXISTS plans (
    id_plan SERIAL PRIMARY KEY,
    id_site INTEGER REFERENCES sites(id_site) ON DELETE CASCADE,
    numero_plan VARCHAR(50) NOT NULL, -- Numéro du plan
    niveau_plan VARCHAR(50), -- Niveau/étage
    emplacement_plan VARCHAR(200), -- Emplacement précis
    type_plan VARCHAR(100), -- Type de plan
    exactitude_plan BOOLEAN DEFAULT true, -- Exactitude du plan
    date_creation_plan TIMESTAMPTZ DEFAULT NOW(),
    date_modification_plan TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_rias_site ON rias(id_site);
CREATE INDEX IF NOT EXISTS idx_rias_numero ON rias(numero_ria);
CREATE INDEX IF NOT EXISTS idx_rias_emplacement ON rias(emplacement_ria);
CREATE INDEX IF NOT EXISTS idx_plans_site ON plans(id_site);

CREATE INDEX IF NOT EXISTS idx_plans_numero ON plans(numero_plan);
CREATE INDEX IF NOT EXISTS idx_plans_emplacement ON plans(emplacement_plan);
CREATE INDEX IF NOT EXISTS idx_plans_type ON plans(type_plan);

-- Trigger pour mettre à jour automatiquement date_modification_ria
CREATE OR REPLACE FUNCTION update_ria_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification_ria = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ria_modification
    BEFORE UPDATE ON rias
    FOR EACH ROW
    EXECUTE FUNCTION update_ria_modification();

-- Trigger pour mettre à jour automatiquement date_modification_plan
CREATE OR REPLACE FUNCTION update_plan_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification_plan = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plan_modification
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_plan_modification();

-- Commentaires sur les tables
COMMENT ON TABLE rias IS 'Table des Robinets d''Incendie Armés par site';
COMMENT ON TABLE plans IS 'Table des plans associés aux sites';

-- RLS (Row Level Security) si nécessaire
-- ALTER TABLE rias ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
