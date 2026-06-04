import { useQuery } from '@tanstack/react-query';
import { supabase, Lampadaire, Alerte, Parametre } from '../../lib/supabase';
import { StatCard } from './StatCard';
import { MapView } from './MapView';
import { Lightbulb, Zap, AlertTriangle, TrendingDown } from 'lucide-react';

export function DashboardView() {
  const { data: lampadaires = [] } = useQuery<Lampadaire[]>({
    queryKey: ['lampadaires'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lampadaires')
        .select('*')
        .order('nom');
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const { data: alertes = [] } = useQuery<Alerte[]>({
    queryKey: ['alertes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alertes')
        .select('*')
        .eq('statut', 'ouvert')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const { data: parametres = [] } = useQuery<Parametre[]>({
    queryKey: ['parametres'],
    queryFn: async () => {
      const { data, error } = await supabase.from('parametres').select('*');
      if (error) throw error;
      return data;
    },
  });

  const totalLampadaires = lampadaires.length;
  const lampadairesActifs = lampadaires.filter((l) => l.etat_actuel === 'actif').length;
  const alertesActives = alertes.length;

  const economieParam = parametres.find((p) => p.nom_parametre === 'economie_energie_cible');
  const economieEnergie = economieParam ? parseInt(economieParam.valeur) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord</h1>
        <p className="text-gray-400">Vue d'ensemble du système d'éclairage intelligent</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Lampadaires"
          value={totalLampadaires}
          icon={Lightbulb}
          color="blue"
          subtitle={`${lampadairesActifs} actifs`}
        />
        <StatCard
          title="Économie d'énergie"
          value={`${economieEnergie}%`}
          icon={TrendingDown}
          color="green"
          subtitle="Objectif atteint"
        />
        <StatCard
          title="Alertes actives"
          value={alertesActives}
          icon={AlertTriangle}
          color="orange"
          subtitle="Nécessitent attention"
        />
        <StatCard
          title="Consommation"
          value={`${lampadairesActifs * 50}W`}
          icon={Zap}
          color="blue"
          subtitle="Temps réel"
        />
      </div>

      <MapView lampadaires={lampadaires} />

      {alertesActives > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Alertes Récentes
          </h2>
          <div className="space-y-3">
            {alertes.slice(0, 5).map((alerte) => {
              const lampadaire = lampadaires.find((l) => l.id === alerte.lampadaire_id);
              return (
                <div
                  key={alerte.id}
                  className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex items-start justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{lampadaire?.nom || 'Inconnu'}</p>
                    <p className="text-gray-400 text-sm mt-1">{alerte.message}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(alerte.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alerte.type === 'panne'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-orange-500/10 text-orange-400'
                    }`}
                  >
                    {alerte.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
