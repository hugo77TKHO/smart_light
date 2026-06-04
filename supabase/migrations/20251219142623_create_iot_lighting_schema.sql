/*
  # IoT Smart Lighting Management System Schema

  1. New Tables
    - `zones`
      - `id` (uuid, primary key)
      - `nom` (text) - Zone name
      - `description` (text) - Zone description
      - `created_at` (timestamptz) - Creation timestamp
    
    - `lampadaires` (Streetlights)
      - `id` (uuid, primary key)
      - `zone_id` (uuid, foreign key to zones)
      - `nom` (text) - Streetlight name
      - `latitude` (numeric) - GPS latitude
      - `longitude` (numeric) - GPS longitude
      - `mode_operation` (text) - Operation mode: 'auto' or 'manuel'
      - `intensite_cible` (integer) - Target intensity (0-100)
      - `etat_actuel` (text) - Current state: 'actif', 'veille', 'panne'
      - `derniere_connexion` (timestamptz) - Last connection timestamp
      - `created_at` (timestamptz) - Creation timestamp
    
    - `logs`
      - `id` (uuid, primary key)
      - `lampadaire_id` (uuid, foreign key to lampadaires)
      - `intensite` (integer) - Light intensity
      - `valeur_ldr` (numeric) - LDR sensor value
      - `mouvement_detecte` (boolean) - Motion detected
      - `courant_mesure` (numeric) - Measured current
      - `created_at` (timestamptz) - Log timestamp
    
    - `alertes` (Alerts)
      - `id` (uuid, primary key)
      - `lampadaire_id` (uuid, foreign key to lampadaires)
      - `type` (text) - Alert type: 'panne' or 'connexion'
      - `statut` (text) - Status: 'ouvert' or 'resolu'
      - `message` (text) - Alert message
      - `created_at` (timestamptz) - Alert timestamp
    
    - `parametres` (Parameters)
      - `id` (uuid, primary key)
      - `nom_parametre` (text) - Parameter name
      - `valeur` (text) - Parameter value
      - `unite` (text) - Unit of measure
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and manage all data
*/

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create lampadaires table
CREATE TABLE IF NOT EXISTS lampadaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES zones(id) ON DELETE CASCADE,
  nom text NOT NULL,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  mode_operation text DEFAULT 'auto' CHECK (mode_operation IN ('auto', 'manuel')),
  intensite_cible integer DEFAULT 0 CHECK (intensite_cible >= 0 AND intensite_cible <= 100),
  etat_actuel text DEFAULT 'veille' CHECK (etat_actuel IN ('actif', 'veille', 'panne')),
  derniere_connexion timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lampadaire_id uuid REFERENCES lampadaires(id) ON DELETE CASCADE,
  intensite integer CHECK (intensite >= 0 AND intensite <= 100),
  valeur_ldr numeric,
  mouvement_detecte boolean DEFAULT false,
  courant_mesure numeric,
  created_at timestamptz DEFAULT now()
);

-- Create alertes table
CREATE TABLE IF NOT EXISTS alertes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lampadaire_id uuid REFERENCES lampadaires(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('panne', 'connexion')),
  statut text DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'resolu')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create parametres table
CREATE TABLE IF NOT EXISTS parametres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_parametre text UNIQUE NOT NULL,
  valeur text NOT NULL,
  unite text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lampadaires_zone_id ON lampadaires(zone_id);
CREATE INDEX IF NOT EXISTS idx_logs_lampadaire_id ON logs(lampadaire_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alertes_lampadaire_id ON alertes(lampadaire_id);
CREATE INDEX IF NOT EXISTS idx_alertes_statut ON alertes(statut);
CREATE INDEX IF NOT EXISTS idx_alertes_created_at ON alertes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampadaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zones
CREATE POLICY "Users can view all zones"
  ON zones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert zones"
  ON zones FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update zones"
  ON zones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete zones"
  ON zones FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for lampadaires
CREATE POLICY "Users can view all lampadaires"
  ON lampadaires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert lampadaires"
  ON lampadaires FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update lampadaires"
  ON lampadaires FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete lampadaires"
  ON lampadaires FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for logs
CREATE POLICY "Users can view all logs"
  ON logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert logs"
  ON logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete logs"
  ON logs FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for alertes
CREATE POLICY "Users can view all alertes"
  ON alertes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert alertes"
  ON alertes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update alertes"
  ON alertes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete alertes"
  ON alertes FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for parametres
CREATE POLICY "Users can view all parametres"
  ON parametres FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert parametres"
  ON parametres FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update parametres"
  ON parametres FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete parametres"
  ON parametres FOR DELETE
  TO authenticated
  USING (true);

-- Insert default parameters
INSERT INTO parametres (nom_parametre, valeur, unite) VALUES
  ('seuil_ldr_nuit', '500', 'lux'),
  ('seuil_ldr_jour', '2000', 'lux'),
  ('intensite_veille', '20', '%'),
  ('intensite_pleine', '100', '%'),
  ('duree_mouvement', '300', 'secondes'),
  ('economie_energie_cible', '40', '%')
ON CONFLICT (nom_parametre) DO NOTHING;