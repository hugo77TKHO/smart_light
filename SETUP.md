# Guide de Configuration

## Configuration de Supabase

### 1. Configuration des Variables d'Environnement

Le fichier `.env` à la racine du projet doit contenir :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Pour obtenir ces valeurs :
1. Connectez-vous à votre projet Supabase
2. Allez dans Settings > API
3. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Création d'un Compte Utilisateur

L'application dispose maintenant d'une interface d'inscription intégrée ! Vous avez deux options :

#### Option A : Inscription via l'Interface de l'Application (Recommandée)
1. Lancez l'application : `npm run dev`
2. Ouvrez http://localhost:5173
3. Cliquez sur l'onglet **"Inscription"**
4. Remplissez le formulaire avec :
   - Email : `votre@email.com`
   - Mot de passe : minimum 6 caractères
   - Confirmer le mot de passe
5. Cliquez sur "Créer un compte"
6. Message de succès apparaîtra et vous pourrez vous connecter
7. Après création, basculez sur l'onglet "Connexion" et connectez-vous

**Identifiants de test suggérés :**
- Email : `admin@smartlighting.com`
- Mot de passe : `Admin123!`

#### Option B : Via l'interface Supabase (Admin)
1. Allez dans votre projet Supabase
2. Cliquez sur "Authentication" dans le menu
3. Cliquez sur "Add user" > "Create new user"
4. Entrez un email et un mot de passe
5. Cliquez sur "Create user"

### Vérification : Le Compte est-il Enregistré en Base de Données ?

Pour confirmer que votre compte a bien été créé, vous pouvez vérifier dans Supabase :

1. Allez dans votre projet Supabase
2. Cliquez sur "Authentication" > "Users"
3. Vous devriez voir votre nouvel utilisateur dans la liste
4. Vérifiez que l'email correspond à celui utilisé lors de l'inscription

**Après création d'un compte :**
- Les données utilisateur sont automatiquement stockées dans la table `auth.users` de Supabase
- Vous pouvez vous connecter immédiatement avec vos identifiants
- Votre session persiste tant que vous êtes connecté

### 3. Vérification de la Base de Données

La base de données devrait être déjà configurée avec :
- ✅ 5 tables (zones, lampadaires, logs, alertes, parametres)
- ✅ Row Level Security (RLS) activé
- ✅ Policies configurées pour les utilisateurs authentifiés
- ✅ Données d'exemple :
  - 8 lampadaires positionnés sur la route reliant INP-HB Centre à INP-HB Sud (Yamoussoukro)
  - 3 zones géographiques
  - 210+ logs de fonctionnement
  - 2 alertes de panne actives
  - Paramètres système préconfigurés

Pour vérifier :
```sql
-- Dans l'éditeur SQL Supabase
SELECT COUNT(*) FROM lampadaires;
SELECT COUNT(*) FROM zones;
SELECT COUNT(*) FROM logs;
```

### 4. Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

### 5. Connexion à l'Application

1. Ouvrez votre navigateur
2. Accédez à l'URL locale (généralement http://localhost:5173)
3. Utilisez les identifiants que vous avez créés
4. Vous devriez voir le dashboard avec les données de démonstration

## Intégration ESP32

### Configuration ESP32

Pour connecter vos ESP32 au système :

1. **Installer les bibliothèques Arduino** :
   - `supabase-arduino` ou utiliser des requêtes HTTP directes
   - `WiFi.h` pour la connectivité
   - `ArduinoJson` pour le formatage des données

2. **Code exemple ESP32** :

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "VOTRE_WIFI";
const char* password = "VOTRE_PASSWORD";
const char* supabaseUrl = "VOTRE_SUPABASE_URL";
const char* supabaseKey = "VOTRE_SUPABASE_ANON_KEY";
const char* lampadaireId = "UUID_DE_VOTRE_LAMPADAIRE";

// Pins
const int LDR_PIN = 34;
const int PIR_PIN = 35;
const int LED_PIN = 2;
const int CURRENT_SENSOR = 33;

void sendLog() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    String url = String(supabaseUrl) + "/rest/v1/logs";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));

    StaticJsonDocument<200> doc;
    doc["lampadaire_id"] = lampadaireId;
    doc["intensite"] = getCurrentIntensity();
    doc["valeur_ldr"] = analogRead(LDR_PIN);
    doc["mouvement_detecte"] = digitalRead(PIR_PIN);
    doc["courant_mesure"] = readCurrent();

    String jsonBody;
    serializeJson(doc, jsonBody);

    int httpCode = http.POST(jsonBody);
    http.end();
  }
}

void checkCommands() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    String url = String(supabaseUrl) + "/rest/v1/lampadaires?id=eq." + String(lampadaireId) + "&select=*";
    http.begin(url);
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));

    int httpCode = http.GET();
    if(httpCode == 200) {
      String payload = http.getString();
      StaticJsonDocument<512> doc;
      deserializeJson(doc, payload);

      JsonArray array = doc.as<JsonArray>();
      if(array.size() > 0) {
        String mode = array[0]["mode_operation"];
        int intensite = array[0]["intensite_cible"];

        if(mode == "manuel") {
          setIntensity(intensite);
        }
      }
    }
    http.end();
  }
}

void updateLastConnection() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    String url = String(supabaseUrl) + "/rest/v1/lampadaires?id=eq." + String(lampadaireId);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));

    String jsonBody = "{\"derniere_connexion\":\"" + getCurrentTimestamp() + "\"}";
    http.PATCH(jsonBody);
    http.end();
  }
}

void loop() {
  // Envoyer les logs toutes les 30 secondes
  static unsigned long lastLog = 0;
  if(millis() - lastLog > 30000) {
    sendLog();
    lastLog = millis();
  }

  // Vérifier les commandes toutes les 5 secondes
  static unsigned long lastCheck = 0;
  if(millis() - lastCheck > 5000) {
    checkCommands();
    lastCheck = millis();
  }

  // Mettre à jour la dernière connexion toutes les minutes
  static unsigned long lastUpdate = 0;
  if(millis() - lastUpdate > 60000) {
    updateLastConnection();
    lastUpdate = millis();
  }
}
```

### Création d'un Nouveau Lampadaire

Pour ajouter un nouveau lampadaire dans le système :

```sql
INSERT INTO lampadaires (nom, zone_id, latitude, longitude, mode_operation, intensite_cible, etat_actuel)
VALUES (
  'Nouveau Lampadaire',
  (SELECT id FROM zones WHERE nom = 'Centre Ville'),
  33.589900,
  -7.604000,
  'auto',
  0,
  'veille'
);

-- Récupérer l'ID généré
SELECT id FROM lampadaires WHERE nom = 'Nouveau Lampadaire';
```

Utilisez cet ID dans votre code ESP32.

## Dépannage

### Problème : Impossible de se connecter
- Vérifiez que les variables d'environnement sont correctes
- Assurez-vous que le projet Supabase est actif
- Vérifiez que l'utilisateur existe dans Authentication

### Problème : Pas de données affichées
- Vérifiez que les données d'exemple sont bien insérées
- Consultez la console navigateur pour les erreurs
- Vérifiez les RLS policies dans Supabase

### Problème : ESP32 ne peut pas envoyer de données
- Vérifiez la connexion WiFi
- Vérifiez l'URL et la clé Supabase
- Assurez-vous que le lampadaire existe dans la base
- Consultez le Serial Monitor pour les messages d'erreur

## Support

Pour plus d'informations :
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React Query](https://tanstack.com/query/latest)
- [Forum ESP32](https://www.esp32.com/)
