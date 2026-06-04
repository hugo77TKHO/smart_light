# Dashboard IoT - Gestion Intelligente de l'Éclairage Public

Application full-stack de supervision et contrôle d'un système d'éclairage public intelligent basé sur IoT (ESP32).

## Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **Lucide React** pour les icônes
- **TanStack Query (React Query)** pour la gestion d'état et le temps réel
- **Recharts** pour les graphiques et visualisations
- **Vite** comme bundler

### Backend & Base de Données
- **Supabase** (PostgreSQL + Auth)
- Row Level Security (RLS) activé sur toutes les tables
- Authentification email/password

## Architecture de la Base de Données

### Tables Principales

1. **zones** - Organisation géographique des lampadaires
   - id, nom, description, created_at

2. **lampadaires** - Équipements d'éclairage
   - id, zone_id, nom, latitude, longitude
   - mode_operation (auto/manuel)
   - intensite_cible (0-100%)
   - etat_actuel (actif/veille/panne)
   - derniere_connexion

3. **logs** - Historique des données capteurs
   - id, lampadaire_id, intensite, valeur_ldr
   - mouvement_detecte, courant_mesure, created_at

4. **alertes** - Système d'alertes
   - id, lampadaire_id, type (panne/connexion)
   - statut (ouvert/resolu), message, created_at

5. **parametres** - Configuration système
   - id, nom_parametre, valeur, unite

## Fonctionnalités

### 1. Tableau de Bord Principal
- Statistiques globales en temps réel
- Carte interactive avec visualisation des lampadaires
- Alertes actives et notifications
- Métriques d'économie d'énergie

### 2. Gestion des Lampadaires
- Vue liste de tous les équipements
- Basculement mode Auto/Manuel par lampadaire
- Contrôle d'intensité lumineuse (mode manuel)
- Indicateurs visuels d'état (Actif/Veille/Panne)
- Recherche et filtrage
- Mise à jour temps réel (5 secondes)

### 3. Historique & Logs
- Graphiques de consommation énergétique
- Courbes d'intensité lumineuse
- Tableau des événements récents
- Filtres temporels (1h, 24h, 7j)
- Actualisation automatique (10 secondes)

### 4. Configuration
- Paramétrage des seuils LDR (jour/nuit)
- Réglage intensités (veille/pleine puissance)
- Durée de détection de mouvement
- Objectifs d'économie d'énergie
- Documentation du mode automatique

## Logique Métier

### Mode Automatique
Le système fonctionne selon cette séquence :
1. Le capteur LDR mesure la luminosité ambiante
2. Si luminosité < seuil_nuit → Mode veille (intensité réduite)
3. Le détecteur PIR surveille les mouvements
4. Détection de mouvement → Intensité 100% pendant durée configurée
5. Pas de mouvement → Retour progressif au mode veille

### Mode Manuel
- Le superviseur contrôle directement l'intensité
- Les capteurs (LDR/PIR) sont désactivés
- Utile pour événements spéciaux ou maintenance

### Système d'Alertes
- Détection automatique des pannes
- Alertes de perte de connexion
- Notification temps réel dans le dashboard
- Statut ouvert/résolu

## Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

### Production

```bash
npm run build
npm run preview
```

## Authentification

Le système utilise l'authentification Supabase :
- Inscription avec email/password
- Connexion sécurisée
- Gestion de session automatique
- Protection des routes

Pour créer un utilisateur :
1. Accédez au dashboard Supabase
2. Allez dans Authentication > Users
3. Créez un nouvel utilisateur

## Données de Démonstration

Le système inclut des données d'exemple :
- 3 zones géographiques
- 6 lampadaires (différents états)
- Logs de fonctionnement sur 30 minutes
- Alertes de panne
- Paramètres préconfigurés

## Intégration ESP32

L'application est conçue pour fonctionner avec des ESP32 qui :
- Publient des logs régulièrement dans la table `logs`
- Écoutent les changements sur leur enregistrement `lampadaires`
- Créent des alertes en cas de problème
- Mettent à jour `derniere_connexion` périodiquement

### Format des Données ESP32

```javascript
// Log à insérer
{
  lampadaire_id: "uuid-du-lampadaire",
  intensite: 100,
  valeur_ldr: 250,
  mouvement_detecte: true,
  courant_mesure: 0.55
}
```

## Design

- Mode sombre par défaut
- Interface professionnelle type "Admin Panel"
- Responsive (mobile, tablette, desktop)
- Animations fluides et micro-interactions
- Contraste optimal pour lisibilité
- Palette de couleurs : Bleu, Vert, Orange, Rouge

## Sécurité

- Row Level Security (RLS) activé
- Toutes les opérations nécessitent authentification
- Pas d'exposition de données sensibles
- Validation côté serveur (Postgres)

## Performance

- Rafraîchissement intelligent avec TanStack Query
- Cache optimisé (1 minute stale time)
- Mises à jour temps réel configurable
- Build optimisé avec code splitting

## Support

Pour toute question ou problème, référez-vous à la documentation Supabase et React Query.
