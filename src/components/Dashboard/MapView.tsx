import { useState } from 'react';
import { Lampadaire } from '../../lib/supabase';
import { MapPin, Lightbulb } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

interface MapViewProps {
  lampadaires: Lampadaire[];
}

export function MapView({ lampadaires }: MapViewProps) {
  const [selectedLamp, setSelectedLamp] = useState<Lampadaire | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (etat: string) => {
    switch (etat) {
      case 'actif':
        return { hex: '#10b981', label: 'Actif' };
      case 'veille':
        return { hex: '#f59e0b', label: 'Veille' };
      case 'panne':
        return { hex: '#ef4444', label: 'Panne' };
      default:
        return { hex: '#6b7280', label: 'Inconnu' };
    }
  };

  // Icône pour corriger le bug d'absence de marker par défaut dans Leaflet + React
  const customIcon = (lamp: Lampadaire) =>
    L.divIcon({
      className: '',
      html: `<div style="background: ${getStatusColor(lamp.etat_actuel).hex}; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white;"></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

  if (lampadaires.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-500" />
          Carte des Points Lumineux
        </h2>
        <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Aucun lampadaire à afficher</p>
        </div>
      </div>
    );
  }

  // Calcul d'un centre de carte judicieux : moyenne des coordonnées valides
  const validLamps = lampadaires.filter(l => Number.isFinite(l.latitude) && Number.isFinite(l.longitude));
  const avgLat = validLamps.length > 0 ? validLamps.reduce((acc, l) => acc + (l.latitude ?? 0), 0) / validLamps.length : 0;
  const avgLon = validLamps.length > 0 ? validLamps.reduce((acc, l) => acc + (l.longitude ?? 0), 0) / validLamps.length : 0;

  // Calcul du lampadaire filtré unique pour zoom et sélection après recherche
  const filteredLamps = lampadaires.filter(l => Number.isFinite(l.latitude) && Number.isFinite(l.longitude) &&
    (searchTerm.trim() === "" || l.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Si un seul lampadaire correspond à la recherche, le sélectionner et centrer
  const singleSearchedLamp = filteredLamps.length === 1 ? filteredLamps[0] : null;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-blue-500" />
        Carte des Points Lumineux - OpenStreetMap
      </h2>
      <div className="mb-5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un lampadaire..."
          className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-700">
            <MapContainer
              center={(singleSearchedLamp ? [singleSearchedLamp.latitude!, singleSearchedLamp.longitude!] : [avgLat || 5.3759, avgLon || -3.9894])}
              zoom={singleSearchedLamp ? 18 : 16}
              style={{ width: "100%", height: "100%", minHeight: 380 }}
              scrollWheelZoom={true}
              dragging={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredLamps.map((lamp) => (
                <Marker
                  key={lamp.id}
                  position={[lamp.latitude!, lamp.longitude!]}
                  icon={customIcon(lamp)}
                  eventHandlers={{
                    click: () => setSelectedLamp(lamp)
                  }}
                >
                  <Popup autoPan={true} autoClose={false}>
                    <div style={{ minWidth: '180px' }}>
                      <strong>{lamp.nom}</strong>
                      <br />
                      Etat : <span style={{ color: getStatusColor(lamp.etat_actuel).hex }}>{getStatusColor(lamp.etat_actuel).label}</span>
                      <br />
                      Latitude : {lamp.latitude?.toFixed(6)}
                      <br />
                      Longitude : {lamp.longitude?.toFixed(6)}
                      <br />
                      Mode : {lamp.mode_operation === 'auto' ? 'Automatique' : 'Manuel'}
                      <br />
                      Intensité : {lamp.intensite_cible}%
                      <br />
                      Dernière connexion : {new Date(lamp.derniere_connexion).toLocaleTimeString('fr-FR')}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Sélection automatique du marker/lampadaire si unique résultat */}
              {singleSearchedLamp && setTimeout(() => setSelectedLamp(singleSearchedLamp), 150)}
            </MapContainer>
            <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300">
              <p className="font-semibold">Vue OpenStreetMap</p>
              <p className="text-gray-400">(Zoom/déplacement possible)</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-bold text-white mb-3">Légende</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-400">Actif</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-400">Veille</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-400">Panne</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
