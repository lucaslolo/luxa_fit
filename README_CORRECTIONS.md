# LUXA_FIT — corrections et mise en route

## Ce qui a été corrigé

- Inscription : validation serveur plus stricte, hash bcrypt renforcé et création du compte + profil dans une transaction MySQL.
- Connexion : vérification du statut du compte avant d'ouvrir une session.
- Sessions : stockage persistant dans `web_sessions` au lieu du `MemoryStore` volatile d'Express.
- Administration : `/admin/database` et `/api/test-db` sont protégés par une authentification HTTP Basic. Le tableau de bord masque les colonnes contenant des secrets, limite l'affichage à 100 lignes par table et échappe le HTML.
- Configuration : plus de secret de session fixe dans le code. En production, `SESSION_SECRET` est obligatoire (32 caractères minimum). Le contrôle des certificats TLS MySQL est activé par défaut.
- Base de données : table `web_sessions` ajoutée au script d'initialisation ; les anciennes références orphelines de `performances.performance_type_id` sont mises à `NULL` avant l'ajout de la clé étrangère.
- Données : les enregistrements de mensurations et la synchronisation du poids du profil sont atomiques ; le questionnaire synchronise également le poids du profil.
- Validation : dates ISO réelles vérifiées côté serveur ; les mises à jour de tâches exigent un booléen et un identifiant positif.
- Calendrier : dates du jour calculées dans le fuseau local du navigateur, pas en UTC (évite le décalage autour de minuit en Belgique).
- Dépôt : `.env`, `.git` et les dépendances sont exclus des archives ; un `.env.example` sans secret est fourni.

## Installation

1. Installer Node.js (version LTS récente).
2. Copier `.env.example` vers `.env` et compléter les paramètres MySQL.
3. Générer un secret aléatoire long pour `SESSION_SECRET` (au moins 32 caractères).
4. Installer les dépendances : `npm ci`.
5. Initialiser / migrer la base : `npm run db:setup`.
6. Vérifier les fichiers JavaScript : `npm test`.
7. Démarrer : `npm start`.

## Variables d'environnement

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` : connexion MySQL.
- `DB_SSL=true` par défaut. `DB_SSL_REJECT_UNAUTHORIZED=true` par défaut. Préférer installer le certificat CA de l'hébergeur plutôt que désactiver sa vérification.
- `SESSION_SECRET` : obligatoire en production, 32 caractères minimum.
- `ADMIN_DATABASE_TOKEN` : facultatif. S'il est défini, l'accès à `/admin/database` est possible avec l'utilisateur HTTP Basic `admin` et ce token comme mot de passe.
- `NODE_ENV=production` active le cookie `Secure`.

## Important pour la base existante

Le script `npm run db:setup` utilise `CREATE TABLE IF NOT EXISTS`, ajoute les colonnes manquantes prévues par les migrations existantes et ajoute la clé étrangère des types de performances. Il ne supprime pas les tables ni les comptes. Fais tout de même une sauvegarde MySQL avant de l'exécuter sur la base de production.

## Limites des vérifications réalisées

Les fichiers JavaScript ont été contrôlés avec `node --check` et le test `npm test`. La base MySQL réelle n'a pas été contactée : les identifiants ne sont volontairement pas inclus dans cette archive corrigée. Il reste donc à exécuter `npm run db:setup`, puis à tester les parcours inscription, connexion, profil, mensurations, performances, objectifs et tâches avec ta base.
