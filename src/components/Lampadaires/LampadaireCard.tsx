import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lampadaire, supabase } from '../../lib/supabase';
import { Lightbulb, MapPin, Clock, Activity } from 'lucide-react';

interface LampadaireCardProps {
  lampadaire: Lampadaire;
}

export function LampadaireCard({ lampadaire }: LampadaireCardProps) {
  const [mode, setMode] = useState(lampadaire.mode_operation);
  const [intensite, setIntensite] = useState(lampadaire.intensite_cible);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Lampadaire>) => {
      const { error } = await supabase
        .from('lampadaires')
        .update(updates)
        .eq('id', lampadaire.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lampadaires'] });
    },
  });

  const handleModeChange = (newMode: 'auto' | 'manuel') => {
    setMode(newMode);
    updateMutation.mutate({ mode_operation: newMode });
  };

  const handleIntensiteChange = (newIntensite: number) => {
    setIntensite(newIntensite);
  };

  const handleIntensiteCommit = () => {
    updateMutation.mutate({ intensite_cible: intensite });
  };

  const getStatusColor = () => {
    switch (lampadaire.etat_actuel) {
      case 'actif':
        return 'bg-green-500';
      case 'veille':
        return 'bg-orange-500';
      case 'panne':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (lampadaire.etat_actuel) {
      case 'actif':
        return 'Actif';
      case 'veille':
        return 'Veille';
      case 'panne':
        return 'Panne';
      default:
        return 'Inconnu';
    }
  };

  const lastConnection = new Date(lampadaire.derniere_connexion);
  const isRecent = Date.now() - lastConnection.getTime() < 5 * 60 * 1000;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusColor()}/10 border border-${lampadaire.etat_actuel === 'actif' ? 'green' : lampadaire.etat_actuel === 'panne' ? 'red' : 'orange'}-500/20`}>
            <Lightbulb className={`w-6 h-6 ${lampadaire.etat_actuel === 'actif' ? 'text-green-400' : lampadaire.etat_actuel === 'panne' ? 'text-red-400' : 'text-orange-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{lampadaire.nom}</h3>
            <p className="text-sm text-gray-400">ID: {lampadaire.id.slice(0, 8)}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            lampadaire.etat_actuel === 'actif'
              ? 'bg-green-500/10 text-green-400'
              : lampadaire.etat_actuel === 'panne'
              ? 'bg-red-500/10 text-red-400'
              : 'bg-orange-500/10 text-orange-400'
          }`}
        >
          {getStatusLabel()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {lampadaire.latitude && lampadaire.longitude && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>
              {lampadaire.latitude.toFixed(6)}, {lampadaire.longitude.toFixed(6)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>
            Dernière connexion: {lastConnection.toLocaleString('fr-FR')}
          </span>
          {isRecent && (
            <span className="ml-2 flex items-center gap-1 text-green-400">
              <Activity className="w-3 h-3 animate-pulse" />
              En ligne
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Mode d'opération
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleModeChange('auto')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                mode === 'auto'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => handleModeChange('manuel')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                mode === 'manuel'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Manuel
            </button>
          </div>
        </div>

        {mode === 'manuel' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Intensité lumineuse: {intensite}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={intensite}
              onChange={(e) => handleIntensiteChange(parseInt(e.target.value))}
              onMouseUp={handleIntensiteCommit}
              onTouchEnd={handleIntensiteCommit}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {mode === 'auto' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              Mode automatique actif. L'intensité est gérée par le capteur LDR et le détecteur de mouvement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
