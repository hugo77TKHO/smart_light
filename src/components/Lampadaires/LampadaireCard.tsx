import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lampadaire, supabase } from '../../lib/supabase';
import { Lightbulb, Activity, Moon, Power } from 'lucide-react';

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

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{lampadaire.nom}</h3>
        <Lightbulb className={`w-6 h-6 ${mode === 'auto' ? 'text-blue-400' : 'text-gray-500'}`} />
      </div>

      {mode === 'auto' && (
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-900/30 p-2 rounded">
            <Activity className="w-4 h-4" /> Sensibilité PIR activée
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-900/30 p-2 rounded">
            <Moon className="w-4 h-4" /> Seuil obscurité (2500)
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => updateMutation.mutate('auto')}
          className={`flex-1 py-2 rounded-lg font-bold ${mode === 'auto' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        >Auto</button>
        <button
          onClick={() => updateMutation.mutate('manuel')}
          className={`flex-1 py-2 rounded-lg font-bold ${mode === 'manuel' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        >Manuel</button>
      </div>
    </div>
  );
}