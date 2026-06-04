import { useQuery } from '@tanstack/react-query';
import { supabase, Log, Lampadaire } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Database } from 'lucide-react';
import { useState } from 'react';

export function HistoryView() {
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d'>('24h');

  const { data: logs = [] } = useQuery<Log[]>({
    queryKey: ['logs', selectedPeriod],
    queryFn: async () => {
      const now = new Date();
      const periods = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
      };

      const since = new Date(now.getTime() - periods[selectedPeriod]);

      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const { data: lampadaires = [] } = useQuery<Lampadaire[]>({
    queryKey: ['lampadaires'],
    queryFn: async () => {
      const { data, error } = await supabase.from('lampadaires').select('*');
      if (error) throw error;
      return data;
    },
  });

  const chartData = logs.reduce((acc: any[], log) => {
    const time = new Date(log.created_at);
    const timeLabel = time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const existing = acc.find((item) => item.time === timeLabel);
    if (existing) {
      existing.intensite = (existing.intensite + log.intensite) / 2;
      existing.courant = (existing.courant + log.courant_mesure) / 2;
      existing.ldr = (existing.ldr + log.valeur_ldr) / 2;
    } else {
      acc.push({
        time: timeLabel,
        intensite: log.intensite,
        courant: log.courant_mesure,
        ldr: log.valeur_ldr,
      });
    }
    return acc;
  }, []);

  const recentLogs = logs.slice(-50).reverse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Historique & Logs</h1>
        <p className="text-gray-400">Analyse des données et événements du système</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSelectedPeriod('1h')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === '1h'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          1 heure
        </button>
        <button
          onClick={() => setSelectedPeriod('24h')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === '24h'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          24 heures
        </button>
        <button
          onClick={() => setSelectedPeriod('7d')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === '7d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          7 jours
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-500" />
          Intensité Lumineuse
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="intensite"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Intensité (%)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-500" />
          Consommation Électrique
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="courant" fill="#10b981" name="Courant (A)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-6 h-6 text-orange-500" />
          Événements Récents
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Horodatage</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Lampadaire</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Intensité</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">LDR</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Mouvement</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Courant</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => {
                const lamp = lampadaires.find((l) => l.id === log.lampadaire_id);
                return (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {lamp?.nom || 'Inconnu'}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{log.intensite}%</td>
                    <td className="py-3 px-4 text-gray-300">{log.valeur_ldr?.toFixed(0)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.mouvement_detecte
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {log.mouvement_detecte ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{log.courant_mesure?.toFixed(2)}A</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentLogs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Aucun événement enregistré pour la période sélectionnée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
