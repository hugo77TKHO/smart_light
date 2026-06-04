import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Zone = {
  id: string;
  nom: string;
  description: string | null;
  created_at: string;
};

export type Lampadaire = {
  id: string;
  zone_id: string | null;
  nom: string;
  latitude: number | null;
  longitude: number | null;
  mode_operation: 'auto' | 'manuel';
  intensite_cible: number;
  etat_actuel: 'actif' | 'veille' | 'panne';
  derniere_connexion: string;
  created_at: string;
};

export type Log = {
  id: string;
  lampadaire_id: string;
  intensite: number;
  valeur_ldr: number;
  mouvement_detecte: boolean;
  courant_mesure: number;
  created_at: string;
};

export type Alerte = {
  id: string;
  lampadaire_id: string;
  type: 'panne' | 'connexion';
  statut: 'ouvert' | 'resolu';
  message: string;
  created_at: string;
};

export type Parametre = {
  id: string;
  nom_parametre: string;
  valeur: string;
  unite: string | null;
  created_at: string;
};
