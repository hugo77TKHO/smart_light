# Guide de Test - Inscription et Authentification

Ce document explique comment tester la création de compte et vérifier l'enregistrement en base de données.

## Prérequis

1. Variables d'environnement configurées dans `.env`
2. Application en cours d'exécution : `npm run dev`
3. Accès au dashboard Supabase de votre projet

## Processus de Test Complet

### Étape 1 : Accéder à la Page d'Inscription

1. Ouvrez http://localhost:5173 dans votre navigateur
2. Vous devriez voir un formulaire avec deux onglets : **"Connexion"** et **"Inscription"**
3. Cliquez sur l'onglet **"Inscription"**

### Étape 2 : Créer un Compte

Remplissez le formulaire d'inscription avec les données suivantes :

**Exemple de test 1 :**
- Email : `test@smartlighting.com`
- Mot de passe : `TestPassword123`
- Confirmer : `TestPassword123`

**Exemple de test 2 :**
- Email : `supervisor@yamoussoukro.ci`
- Mot de passe : `Supervision2024`
- Confirmer : `Supervision2024`

Cliquez sur "Créer un compte"

### Étape 3 : Vérifier le Résultat

Vous devriez voir un message de succès en vert :
> "Compte créé avec succès ! Vous pouvez maintenant vous connecter."

L'écran devrait automatiquement basculer sur la page de connexion après 2 secondes.

### Étape 4 : Vérification en Base de Données

#### Via le Dashboard Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans **Authentication** > **Users**
3. Vous devriez voir votre nouvel utilisateur dans la liste
4. Vérifiez que :
   - L'email correspond à celui saisi
   - Le statut est "Confirmed" (confirmé)
   - La date de création est récente

#### Via SQL Query Editor (Supabase)

Exécutez cette requête pour voir tous les utilisateurs authentifiés :

```sql
-- Voir le nombre total d'utilisateurs
SELECT COUNT(*) as total_users FROM auth.users;

-- Voir les détails des utilisateurs créés
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

### Étape 5 : Se Connecter avec le Nouveau Compte

1. Le formulaire devrait afficher l'onglet "Connexion"
2. Entrez votre email et mot de passe
3. Cliquez sur "Se connecter"
4. Vous devriez être redirigé vers le dashboard principal

### Étape 6 : Vérifier l'Accès au Dashboard

Une fois connecté, vous devriez voir :

- **Tableau de Bord** : Statistiques en temps réel
  - Total lampadaires : 8
  - Lampadaires actifs : nombre variable
  - Alertes actives : 1
  - Consommation : X Watts

- **Carte Interactive** : Affichage de 8 lampadaires sur la route INP-HB Yamoussoukro
  - Points numérotés de 1 à 8
  - Codes couleur : vert (actif), orange (veille), rouge (panne)
  - Cliquez sur un point pour voir les détails

- **Sidebar** : Navigation vers Lampadaires, Historique, Configuration

## Tests de Validation

### Test 1 : Validation des Mots de Passe

**Cas de test :** Mots de passe non identiques
- Email : `test@example.com`
- Mot de passe : `Password123`
- Confirmer : `Password456`

**Résultat attendu :** Message d'erreur
> "Les mots de passe ne correspondent pas."

### Test 2 : Validation de la Longueur du Mot de Passe

**Cas de test :** Mot de passe trop court
- Email : `test@example.com`
- Mot de passe : `Pass1`
- Confirmer : `Pass1`

**Résultat attendu :** Message d'erreur
> "Le mot de passe doit contenir au moins 6 caractères."

### Test 3 : Email Invalide

**Cas de test :** Email déjà utilisé
- Email : `test@smartlighting.com` (créé dans Étape 2)
- Mot de passe : `NewPassword123`

**Résultat attendu :** Message d'erreur Supabase
> "Erreur lors de la création du compte." (L'utilisateur existe déjà)

### Test 4 : Connexion Réussie

**Cas de test :** Connexion avec compte créé
- Email : `test@smartlighting.com`
- Mot de passe : `TestPassword123`

**Résultat attendu :**
- Redirection vers le dashboard
- Affichage de la page de gestion des lampadaires
- Barre latérale active

### Test 5 : Identifiants Incorrects

**Cas de test :** Mot de passe incorrect
- Email : `test@smartlighting.com`
- Mot de passe : `WrongPassword123`

**Résultat attendu :** Message d'erreur
> "Échec de connexion. Vérifiez vos identifiants."

## Vérification de la Persistance de Données

### Structure des Données Authentifiés

```
Supabase
├── auth.users (Table système)
│   ├── id (uuid) - Identifiant unique
│   ├── email - Adresse email
│   ├── encrypted_password - Mot de passe hashé
│   ├── email_confirmed_at - Date de confirmation
│   ├── created_at - Date de création
│   └── last_sign_in_at - Dernière connexion
│
└── Données accessibles à l'utilisateur
    └── Tableaux : lampadaires, zones, logs, etc.
```

### Points de Vérification

1. **Utilisateurs créés en base** :
   - Vérifier dans `auth.users` via le dashboard Supabase

2. **Sessions actives** :
   - L'application maintient une session sécurisée
   - Les données d'authentification sont stockées localement (JWT)

3. **Row Level Security** :
   - Les RLS policies garantissent que chaque utilisateur ne peut accéder qu'à ses données autorisées
   - Tous les utilisateurs authentifiés peuvent voir les lampadaires (via les policies définies)

## Dépannage

### Problème : Le compte ne se crée pas

**Causes possibles :**
- Les variables d'environnement ne sont pas correctes
- La connexion à Supabase échoue
- L'email contient des caractères invalides

**Solution :**
1. Vérifiez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env`
2. Consultez la console du navigateur (F12 > Console) pour les erreurs
3. Vérifiez que votre projet Supabase est actif

### Problème : Impossible de se connecter après création

**Causes possibles :**
- Erreur lors de la création (vérifiez le message d'erreur)
- L'authentification Supabase n'est pas configurée

**Solution :**
1. Allez dans Supabase > Authentication > Users
2. Vérifiez que l'utilisateur existe
3. Redémarrez le serveur de développement

### Problème : Pas de données affichées dans le dashboard

**Causes possibles :**
- L'utilisateur est connecté mais n'a pas de droits d'accès (RLS)
- Les lampadaires ne sont pas insérés en base

**Solution :**
1. Vérifiez dans Supabase > SQL Editor que les lampadaires existent :
   ```sql
   SELECT COUNT(*) FROM lampadaires;
   ```
2. Vérifiez que le RLS est configuré correctement

## Résumé du Flux d'Authentification

```
┌─────────────┐
│  Page Login │
│  Inscription│
└──────┬──────┘
       │
       ├─ Email + Password → Validation Client
       │                       (length, matching)
       │
       └─ Valide → Supabase Auth
                     │
                     ├─ Créer utilisateur
                     │  ├─ Hash mot de passe
                     │  ├─ Stocker en auth.users
                     │  └─ Émettre JWT
                     │
                     └─ Retour au Client
                          │
                          └─ Session persistée
                             └─ Accès au Dashboard
```

## Fichiers Clés pour l'Authentification

- `src/contexts/AuthContext.tsx` - Logique d'authentification
- `src/components/Auth/LoginForm.tsx` - Interface de connexion/inscription
- `src/lib/supabase.ts` - Configuration Supabase

## Données de Démonstration Disponibles

Après création d'un compte et connexion, vous pouvez explorer :

- **Tableau de Bord** :
  - 8 lampadaires au total
  - Carte interactive avec emplacements GPS

- **Gestion des Lampadaires** :
  - Basculer mode auto/manuel
  - Ajuster l'intensité lumineuse
  - Voir l'état en temps réel

- **Historique** :
  - 210+ logs de fonctionnement
  - Graphiques de consommation électrique
  - Filtrage par période (1h, 24h, 7j)

- **Configuration** :
  - 6 paramètres système modifiables
  - Documentation du mode automatique
