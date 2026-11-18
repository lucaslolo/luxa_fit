# LUXA_FIT — refactorisation logique (première passe)

## Corrections et améliorations incluses

- Correction d'une requête `INFORMATION_SCHEMA` invalide dans la migration des clés étrangères : une clause `WHERE` était dupliquée.
- Les migrations ne masquent plus les erreurs lors d'une modification de colonne et renvoient désormais un code de sortie non nul en cas d'échec.
- Correction du chemin JavaScript cassé dans `course.html` (`js/entrainement/course/prog_course.js`).
- Ajout d'un client HTTP frontend commun (`js/core/api.js`) pour centraliser les appels, les cookies de session, le décodage JSON et les erreurs HTTP.
- Refactorisation du calendrier des tâches : rendu DOM sans insertion HTML de données utilisateur, dates locales sans conversion UTC, gestion des erreurs, vérification de la réponse API et prévention des doubles soumissions.
- Ajout de règles partagées et testées pour valider les dates SQL et les identifiants (`shared/validation.js`).
- Limitation des corps de requêtes HTTP, en-têtes de sécurité de base et limitation des tentatives de connexion / inscription.
- Ajout de `/api/health` pour vérifier la disponibilité du serveur et de MySQL sans exposer d'informations sensibles.
- Ajout d'un arrêt propre du serveur et fermeture du pool MySQL sur SIGINT/SIGTERM.
- Ajout de contrôles automatiques pour repérer les chemins de scripts HTML cassés et quelques erreurs de migration/authentification.

## Tests exécutés

Commande : `npm test`

Résultat attendu :
- tests de validation : 3 réussis ;
- syntaxe JavaScript : tous les fichiers vérifiés ;
- références de scripts HTML : aucune référence manquante ;
- contrôles structurels : réussis.

## Installation

1. Copier `.env.example` vers `.env` et renseigner les paramètres MySQL.
2. Installer les dépendances avec `npm ci`.
3. Sauvegarder la base MySQL avant toute migration.
4. Exécuter `npm run db:setup` sur une base de test ou une sauvegarde restaurée.
5. Lancer `npm test`.
6. Démarrer avec `npm start`.

## Variables importantes

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- `DB_SSL=true` et `DB_SSL_REJECT_UNAUTHORIZED=true` par défaut.
- `SESSION_SECRET` : secret aléatoire long, obligatoire en production.
- `ADMIN_DATABASE_TOKEN` : protège `/admin/database` si la page d'administration est activée.
- `NODE_ENV=production` active les cookies `Secure`.

## Limites connues

La base MySQL réelle n'a pas été contactée pendant cette refactorisation. Les tests sont des tests unitaires et des contrôles statiques, pas des tests de bout en bout. Les limites de tentatives sont en mémoire : si l'application tourne sur plusieurs instances, utiliser un stockage partagé (Redis) pour rendre le quota global. Les autres grands scripts de programmes, nutrition et dashboard restent à découper progressivement en modules de domaine sans changer leurs comportements avant d'avoir des tests de non-régression.
