# LUXA_FIT — architecture et règles de fonctionnement

## Structure

- `server.js` : point d'entrée HTTP Express, middlewares, sessions et routes API.
- `js/database.js` : pool de connexions MySQL partagé par le serveur et les migrations.
- `js/create-tables.js` : création des tables et migrations idempotentes. À exécuter explicitement, jamais à chaque démarrage du serveur.
- `shared/validation.js` : règles pures partagées/testables (dates SQL et identifiants).
- `js/core/api.js` : client HTTP frontend unique, gestion uniforme du JSON et des erreurs HTTP.
- `js/dashboard.js`, `js/alimentation/alimentation.js`, `js/entrainement/**` : logique d'écran et de domaine frontend.
- `js/tasks.js` : rendu et interactions du calendrier des tâches ; les données restent côté serveur.

## Règles à conserver

1. Le navigateur ne choisit jamais le `user_id` à utiliser. Le serveur le prend exclusivement depuis `req.session.userId`.
2. Toute requête SQL avec une donnée utilisateur utilise des paramètres `?` ; ne jamais concaténer une valeur utilisateur dans une requête SQL.
3. Toute lecture ou modification de données privées doit être filtrée par `user_id`.
4. Les dates métier sont transmises au format strict `YYYY-MM-DD`. Ne pas convertir une date de calendrier en ISO UTC avec `toISOString()` côté navigateur : cela peut décaler le jour selon le fuseau horaire.
5. Une opération qui modifie plusieurs tables doit utiliser une transaction MySQL (`beginTransaction`, `commit`, `rollback`).
6. Le frontend affiche le contenu utilisateur avec `textContent` ou des nœuds DOM. Éviter d'injecter des valeurs dynamiques dans `innerHTML`.
7. Les pages ne doivent pas appeler directement MySQL. Elles passent par `/api/...`.
8. Les scripts de migration doivent échouer avec un code de sortie non nul si une étape échoue ; ne jamais masquer une erreur de schéma.

## Parcours fonctionnels principaux

- Compte : `/api/register`, `/api/login`, `/api/me`, `/api/logout`.
- Profil : `GET/PUT /api/profile`.
- Mensurations : `GET/POST /api/body-measurements`.
- Performances : `GET/POST /api/performances`, `DELETE /api/performances/:id`.
- Objectifs : `GET/POST /api/goals`, `PUT/DELETE /api/goals/:id`.
- Tâches : `GET/POST /api/tasks`, `PUT/DELETE /api/tasks/:id`.
- Questionnaire : `POST /api/questionnaire`.

## Vérifications disponibles

`npm test` exécute les tests unitaires des règles partagées, vérifie la syntaxe de tous les fichiers JavaScript et contrôle les chemins de scripts référencés par les pages HTML ainsi que quelques invariants critiques des migrations et de l'authentification.

Ces vérifications ne remplacent pas un test d'intégration sur une base MySQL réelle. Il faut encore valider les parcours métier sur une copie de la base avant toute migration en production.
