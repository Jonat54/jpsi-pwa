-- 🧯 Ajout des agents extincteurs dans la table AgentExtincteur
-- Exécute ces requêtes dans ton interface Supabase ou ton client SQL

-- 1. Agents à poudre
INSERT INTO "AgentExtincteur" (long_agt, court_agt) VALUES 
('Poudre ABC', 'Poudre ABC'),
('Poudre BC', 'Poudre BC'),
('Poudre D', 'Poudre D');

-- 2. Agents gazeux
INSERT INTO "AgentExtincteur" (long_agt, court_agt) VALUES 
('Dioxyde de Carbone', 'CO2'),
('Gaz inerte', 'Gaz inerte');

-- 3. Agents à eau
INSERT INTO "AgentExtincteur" (long_agt, court_agt) VALUES 
('Eau', 'Eau'),
('Eau avec additif', 'Eau+'),
('Eau pulvérisée', 'Eau pulv'),
('Eau pulvérisée avec additif', 'EPA');

-- 4. Agents spéciaux
INSERT INTO "AgentExtincteur" (long_agt, court_agt) VALUES 
('Mousse', 'Mousse'),
('Mousse AFFF', 'Mousse AFFF'),
('Mousse AR', 'Mousse AR'),
('Halogène', 'Halogène'),
('Halon', 'Halon');

-- 5. Agents pour cuisines
INSERT INTO "AgentExtincteur" (long_agt, court_agt) VALUES 
('Agent pour cuisines', 'Cuisine'),
('Agent pour graisses', 'Graisses');

-- Vérification
SELECT * FROM "AgentExtincteur" ORDER BY long_agt; 