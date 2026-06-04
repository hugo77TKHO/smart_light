import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Lampadaire } from '../../lib/supabase';
import { LampadaireCard } from './LampadaireCard';
import { Lightbulb, Search } from 'lucide-react';

// Exportation nommée correcte pour App.tsx
export function LampadairesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // 1. Récupération des données avec React Query
  const { data: lampadaires = [], isLoading } = useQuery<Lampadaire[]>({
    queryKey: ['lampadaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lampadaires')
        .select('*')
        .order('nom');
      if (error) throw error;
      return data;
    },
  });

  // 2. Abonnement Realtime pour la mise à jour automatique
  useEffect(() => {
    const channel = supabase
      .channel('lampadaires-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lampadaires' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['lampadaires'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredLampadaires = lampadaires.filter((lamp) =>
    lamp.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des lampadaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gestion des Lampadaires</h1>
        <p className="text-gray-400">Contrôlez et surveillez tous les équipements d'éclairage</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un lampadaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredLampadaires.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
          <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun lampadaire trouvé</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLampadaires.map((lampadaire) => (
            <LampadaireCard key={lampadaire.id} lampadaire={lampadaire} />
          ))}
        </div>
      )}
    </div>
  );
}