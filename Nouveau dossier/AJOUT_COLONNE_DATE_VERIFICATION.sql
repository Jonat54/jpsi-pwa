-- Ajout de la colonne date_verification à la table desenfumages
-- Script pour enregistrer la date de la dernière vérification

ALTER TABLE desenfumages 
ADD COLUMN IF NOT EXISTS date_verification TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN desenfumages.date_verification IS 'Date de la dernière vérification du désenfumage';

CREATE INDEX IF NOT EXISTS idx_desenfumages_date_verification ON desenfumages(date_verification);

-- Mise à jour des commentaires existants pour rappel
COMMENT ON COLUMN desenfumages.voyant_des IS 'État du voyant (true=ON/vert si fonctionnel, false=OFF/rouge si défaillant)';
COMMENT ON COLUMN desenfumages.num_des IS 'Numéro du désenfumage (généré automatiquement)';
COMMENT ON COLUMN desenfumages.localisation_des IS 'Localisation du désenfumage';
COMMENT ON COLUMN desenfumages.descouvr_des IS 'Description du type d''ouvrant';
COMMENT ON COLUMN desenfumages.obs_des IS 'Observations sur le désenfumage'; 