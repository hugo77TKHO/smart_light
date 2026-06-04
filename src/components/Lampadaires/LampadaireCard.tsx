import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lampadaire, supabase } from '../../lib/supabase';

interface LampadaireCardProps {
  lampadaire: Lampadaire;
}

export function LampadaireCard({ lampadaire }: LampadaireCardProps) {
  const [mode, setMode] = useState<string>(lampadaire.mode_operation);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMode(lampadaire.mode_operation);
  }, [lampadaire.mode_operation]);

  const updateMutation = useMutation({
    mutationFn: async (newMode: string) => {
      // Forcer l'ID en chaîne de caractères pour éviter les erreurs de type
      const targetId = String(lampadaire.id);
      
      console.log("Mise à jour pour UUID:", targetId);
      
      const { data, error } = await supabase
        .from('lampadaires')
        .update({ mode_operation: newMode })
        .eq('id', targetId)
        .select(); // Très important pour confirmer l'action

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lampadaires'] });
    },
    onError: (err: any) => {
      console.error("Erreur détaillée:", err);
      alert("Erreur de sauvegarde : " + (err.message || "Erreur inconnue"));
    }
  });

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-white font-bold mb-4">{lampadaire.nom}</h3>
      <div className="flex gap-2">
        <button 
          onClick={() => updateMutation.mutate('auto')}
          className={`flex-1 py-2 rounded ${mode === 'auto' ? 'bg-blue-600' : 'bg-gray-700'}`}>
          Auto
        </button>
        <button 
          onClick={() => updateMutation.mutate('manuel')}
          className={`flex-1 py-2 rounded ${mode === 'manuel' ? 'bg-blue-600' : 'bg-gray-700'}`}>
          Manuel
        </button>
      </div>
    </div>
  );
}