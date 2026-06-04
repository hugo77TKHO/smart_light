import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lampadaire, supabase } from '../../lib/supabase';
import { Lightbulb, MapPin, Clock, Activity, Settings } from 'lucide-react';

interface LampadaireCardProps {
  lampadaire: Lampadaire;
}

export function LampadaireCard({ lampadaire }: LampadaireCardProps) {
  const [mode, setMode] = useState(lampadaire.mode_operation);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMode(lampadaire.mode_operation);
  }, [lampadaire.mode_operation]);

  const updateMutation = useMutation({
    mutationFn: async (newMode: 'auto' | 'manuel') => {
      const { error } = await supabase
        .from('lampadaires')
        .update({ mode_operation: newMode })
        .eq('id', lampadaire.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lampadaires'] });
    },
  });

  const handleModeChange = (newMode: 'auto' | 'manuel') => {
    setMode(newMode);
    updateMutation.mutate(newMode);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Lightbulb className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{lampadaire.nom}</h3>
            <p className="text-sm text-gray-400">ID: {lampadaire.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Indicateur PIR en mode auto */}
      {mode === 'auto' && (
        <div className="flex items-center gap-2 text-blue-400 text-xs mb-4 bg-blue-500/10 p-2 rounded">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Capteur PIR actif (Temporisation 15s)</span>
        </div>
      )}

      <div className="border-t border-gray-700 pt-4">
        <label className="block text-sm font-medium text-gray-300 mb-3">Mode d'opération</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('auto')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'auto' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >Auto</button>
          <button
            onClick={() => handleModeChange('manuel')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              mode === 'manuel' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >Manuel</button>
        </div>
      </div>
    </div>
  );
}