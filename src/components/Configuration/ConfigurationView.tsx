import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Parametre } from '../../lib/supabase';
import { Settings, Save } from 'lucide-react';
import { useState } from 'react';

export function ConfigurationView() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: parametres = [] } = useQuery<Parametre[]>({
    queryKey: ['parametres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parametres')
        .select('*')
        .order('nom_parametre');
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, valeur }: { id: string; valeur: string }) => {
      const { error } = await supabase
        .from('parametres')
        .update({ valeur })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametres'] });
      setEditingId(null);
    },
  });

  const handleEdit = (param: Parametre) => {
    setEditingId(param.id);
    setEditValue(param.valeur);
  };

  const handleSave = (id: string) => {
    updateMutation.mutate({ id, valeur: editValue });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const getParameterLabel = (nom: string) => {
    const labels: Record<string, string> = {
      'seuil_ldr_nuit': 'Seuil LDR pour la nuit',
      'seuil_ldr_jour': 'Seuil LDR pour le jour',
      'intensite_veille': 'Intensité en veille',
      'intensite_pleine': 'Intensité pleine puissance',
      'duree_mouvement': 'Durée détection mouvement',
      'economie_energie_cible': "Objectif d'économie d'énergie",
    };
    return labels[nom] || nom;
  };

  const getParameterDescription = (nom: string) => {
    const descriptions: Record<string, string> = {
      'seuil_ldr_nuit': 'Valeur LDR en dessous de laquelle la nuit est détectée',
      'seuil_ldr_jour': 'Valeur LDR au-dessus de laquelle le jour est détecté',
      'intensite_veille': "Intensité lumineuse en mode veille automatique",
      'intensite_pleine': 'Intensité maximale lors de la détection de mouvement',
      'duree_mouvement': 'Durée pendant laquelle la lumière reste à pleine intensité après détection',
      'economie_energie_cible': "Pourcentage d'économie d'énergie visé",
    };
    return descriptions[nom] || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configuration Système</h1>
        <p className="text-gray-400">Paramétrage du comportement automatique des lampadaires</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-blue-400 text-sm">
          Les modifications apportées ici affecteront le comportement de tous les lampadaires en mode automatique. Les changements sont appliqués immédiatement.
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-500" />
            Paramètres du Système
          </h2>
        </div>

        <div className="divide-y divide-gray-700">
          {parametres.map((param) => (
            <div key={param.id} className="p-6 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {getParameterLabel(param.nom_parametre)}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {getParameterDescription(param.nom_parametre)}
                  </p>

                  {editingId === param.id ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">{param.unite}</span>
                      <button
                        onClick={() => handleSave(param.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white">
                        {param.valeur}
                      </span>
                      <span className="text-gray-400">{param.unite}</span>
                    </div>
                  )}
                </div>

                {editingId !== param.id && (
                  <button
                    onClick={() => handleEdit(param)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Logique de Fonctionnement</h2>
        <div className="space-y-4 text-gray-300">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-white mb-2">Mode Automatique</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Le capteur LDR détecte le niveau de luminosité ambiante</li>
              <li>En dessous du seuil nuit, le lampadaire passe en mode veille à intensité réduite</li>
              <li>Le détecteur de mouvement PIR surveille l'environnement</li>
              <li>Lors d'une détection, l'intensité monte à 100% pendant la durée configurée</li>
              <li>Sans détection supplémentaire, retour progressif au mode veille</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-white mb-2">Mode Manuel</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Le superviseur contrôle directement l'intensité lumineuse</li>
              <li>Les capteurs LDR et PIR sont ignorés</li>
              <li>L'intensité définie est maintenue jusqu'à changement manuel</li>
              <li>Utile pour des événements spéciaux ou maintenance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
