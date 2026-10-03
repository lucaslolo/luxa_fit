/* =========================================================
   LUXA_FIT
   SERVEUR EXPRESS + MYSQL
   ========================================================= */


/* =========================================================
   1. IMPORTS
   ========================================================= */

require("dotenv").config();

const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

const db = require("./js/database");


/* =========================================================
   2. CONFIGURATION
   ========================================================= */

const app = express();

const PORT = process.env.PORT || 3000;

const isProduction =
    process.env.NODE_ENV === "production";


/*
   Render utilise un reverse proxy.
   Cela permet à Express de correctement gérer
   les cookies sécurisés derrière HTTPS.
*/

app.set("trust proxy", 1);


/* =========================================================
   3. TYPES DE PERFORMANCES AUTORISÉS
   ========================================================= */

const ALLOWED_PERFORMANCE_TYPES = [

    /* -----------------------------------------------------
       ANCIENNES MESURES
       Conservées pour compatibilité avec l'interface
       actuelle.
    ----------------------------------------------------- */

    "poids",
    "taille",
    "tour_taille",
    "tour_hanche",
    "tour_bras",
    "tour_cuisse",
    "tour_mollet",
    "tour_torse",


    /* -----------------------------------------------------
       MUSCULATION / POWERLIFTING
    ----------------------------------------------------- */

    "bench_actuel",
    "squat_actuel",
    "deadlift_actuel",


    /* -----------------------------------------------------
       HYROX
    ----------------------------------------------------- */

    "hyrox solo open homme",
    "hyrox solo pro homme",
    "hyrox solo open femme",
    "hyrox solo pro femme",
    "hyrox mixte",
    "hyrox homme/homme",
    "hyrox femme/femme",


    /* -----------------------------------------------------
       COURSE À PIED
    ----------------------------------------------------- */

    "course_5km",
    "course_10km",
    "course_21km",
    "course_42km",
    "course_km_semaine"

];


/* =========================================================
   4. TYPES DE MESURES CORPORELLES
   ========================================================= */

const BODY_MEASUREMENT_TYPES = [

    "poids",
    "tour_taille",
    "tour_bras",
    "tour_cuisse",
    "tour_mollet",
    "tour_hanche",
    "tour_torse"

];


/* =========================================================
   5. MIDDLEWARES
   ========================================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.static(__dirname)
);


/* =========================================================
   6. SESSION
   ========================================================= */

app.use(
    session({

        secret:
            process.env.SESSION_SECRET ||
            "luxa_fit_dev_secret",

        resave: false,

        saveUninitialized: false,

        cookie: {

            httpOnly: true,

            sameSite: "lax",

            secure: isProduction,

            maxAge:
                1000 *
                60 *
                60 *
                24 *
                7

        }

    })
);


/* =========================================================
   7. MIDDLEWARE AUTHENTIFICATION
   ========================================================= */

function requireLogin(req, res, next) {

    if (
        !req.session ||
        !req.session.userId
    ) {

        return res.status(401).json({

            success: false,

            message:
                "Tu dois être connecté."

        });

    }

    next();
}


/* =========================================================
   8. PAGE D'ACCUEIL
   ========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


/* =========================================================
   9. TEST MYSQL
   ========================================================= */

app.get(
    "/api/test-db",
    async (req, res) => {

        try {

            const [rows] =
                await db.query(
                    "SELECT 1 AS test"
                );

            res.json({

                success: true,

                message:
                    "Connexion MySQL réussie !",

                result:
                    rows

            });

        } catch (error) {

            console.error(
                "Erreur MySQL :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur de connexion à MySQL."

            });

        }

    }
);


/* =========================================================
   10. INSCRIPTION
   ========================================================= */

app.post(
    "/api/register",
    async (req, res) => {

        const {
            prenom,
            nom,
            password
        } = req.body;


        /* -------------------------------------------------
           Vérification
        ------------------------------------------------- */

        if (
            !prenom ||
            !nom ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Tous les champs sont obligatoires."

            });

        }


        if (
            password.length < 6
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Le mot de passe doit contenir au moins 6 caractères."

            });

        }


        try {

            const cleanPrenom =
                prenom.trim();

            const cleanNom =
                nom.trim();


            /* -------------------------------------------------
               Vérifier si le compte existe
            ------------------------------------------------- */

            const [existingUsers] =
                await db.execute(

                    `SELECT id
                     FROM users
                     WHERE prenom = ?
                     AND nom = ?`,

                    [
                        cleanPrenom,
                        cleanNom
                    ]

                );


            if (
                existingUsers.length > 0
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Cet utilisateur existe déjà."

                });

            }


            /* -------------------------------------------------
               Hasher le mot de passe
            ------------------------------------------------- */

            const passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );


            /* -------------------------------------------------
               Créer utilisateur
            ------------------------------------------------- */

            const [result] =
                await db.execute(

                    `INSERT INTO users
                     (
                         prenom,
                         nom,
                         password_hash
                     )
                     VALUES (?, ?, ?)`,

                    [
                        cleanPrenom,
                        cleanNom,
                        passwordHash
                    ]

                );


            const userId =
                result.insertId;


            /* -------------------------------------------------
               Créer automatiquement son profil
            ------------------------------------------------- */

            await db.execute(

                `INSERT INTO profiles
                 (
                     user_id
                 )
                 VALUES (?)`,

                [
                    userId
                ]

            );


            res.status(201).json({

                success: true,

                message:
                    "Compte créé avec succès !",

                userId

            });

        } catch (error) {

            console.error(
                "Erreur inscription :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la création du compte."

            });

        }

    }
);


/* =========================================================
   11. CONNEXION
   ========================================================= */

app.post(
    "/api/login",
    async (req, res) => {

        const {
            prenom,
            nom,
            password
        } = req.body;


        if (
            !prenom ||
            !nom ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Tous les champs sont obligatoires."

            });

        }


        try {

            const cleanPrenom =
                prenom.trim();

            const cleanNom =
                nom.trim();


            /* -------------------------------------------------
               Recherche utilisateur
            ------------------------------------------------- */

            const [users] =
                await db.execute(

                    `SELECT
                        id,
                        prenom,
                        nom,
                        password_hash
                     FROM users
                     WHERE prenom = ?
                     AND nom = ?`,

                    [
                        cleanPrenom,
                        cleanNom
                    ]

                );


            if (
                users.length === 0
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Nom ou mot de passe incorrect."

                });

            }


            const user =
                users[0];


            /* -------------------------------------------------
               Vérification mot de passe
            ------------------------------------------------- */

            const passwordCorrect =
                await bcrypt.compare(
                    password,
                    user.password_hash
                );


            if (!passwordCorrect) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Nom ou mot de passe incorrect."

                });

            }


            /* -------------------------------------------------
               Mettre à jour dernière connexion
            ------------------------------------------------- */

            await db.execute(

                `UPDATE users
                 SET derniere_connexion = CURRENT_TIMESTAMP
                 WHERE id = ?`,

                [
                    user.id
                ]

            );


            /* -------------------------------------------------
               Créer session
            ------------------------------------------------- */

            req.session.regenerate(
                (error) => {

                    if (error) {

                        console.error(
                            "Erreur session :",
                            error
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Erreur lors de la création de la session."

                        });

                    }


                    req.session.userId =
                        user.id;


                    req.session.user = {

                        id:
                            user.id,

                        prenom:
                            user.prenom,

                        nom:
                            user.nom

                    };


                    req.session.save(
                        (error) => {

                            if (error) {

                                console.error(
                                    "Erreur sauvegarde session :",
                                    error
                                );

                                return res.status(500).json({

                                    success: false,

                                    message:
                                        "Erreur lors de la sauvegarde de la session."

                                });

                            }


                            res.json({

                                success: true,

                                message:
                                    "Connexion réussie !",

                                user: {

                                    id:
                                        user.id,

                                    prenom:
                                        user.prenom,

                                    nom:
                                        user.nom

                                }

                            });

                        }
                    );

                }
            );

        } catch (error) {

            console.error(
                "Erreur connexion :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la connexion."

            });

        }

    }
);


/* =========================================================
   12. UTILISATEUR CONNECTÉ
   ========================================================= */

app.get(
    "/api/me",
    (req, res) => {

        if (
            !req.session ||
            !req.session.userId
        ) {

            return res.json({

                success: false,

                message:
                    "Aucun utilisateur connecté."

            });

        }


        res.json({

            success: true,

            user:
                req.session.user

        });

    }
);


/* =========================================================
   13. DÉCONNEXION
   ========================================================= */

app.post(
    "/api/logout",
    (req, res) => {

        req.session.destroy(
            (error) => {

                if (error) {

                    console.error(
                        "Erreur déconnexion :",
                        error
                    );

                    return res.status(500).json({

                        success: false,

                        message:
                            "Erreur lors de la déconnexion."

                    });

                }


                res.clearCookie(
                    "connect.sid"
                );


                res.json({

                    success: true,

                    message:
                        "Déconnexion réussie."

                });

            }
        );

    }
);


/* =========================================================
   14. PROFIL
   ========================================================= */


/* =========================================================
   14.1 RÉCUPÉRER LE PROFIL
   ========================================================= */

app.get(
    "/api/profile",
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await db.execute(

                    `SELECT
                        p.id,
                        p.user_id,
                        p.date_naissance,
                        p.sexe,
                        p.taille,
                        p.poids,
                        p.niveau,
                        p.objectif_principal,
                        u.prenom,
                        u.nom,
                        u.email
                     FROM profiles p
                     INNER JOIN users u
                        ON u.id = p.user_id
                     WHERE p.user_id = ?`,

                    [
                        req.session.userId
                    ]

                );


            if (
                rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Profil introuvable."

                });

            }


            res.json({

                success: true,

                profile:
                    rows[0]

            });

        } catch (error) {

            console.error(
                "Erreur récupération profil :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la récupération du profil."

            });

        }

    }
);


/* =========================================================
   14.2 MODIFIER LE PROFIL
   ========================================================= */

app.put(
    "/api/profile",
    requireLogin,
    async (req, res) => {

        const {
            date_naissance,
            sexe,
            taille,
            niveau,
            objectif_principal
        } = req.body;


        /* -------------------------------------------------
           Vérification sexe
        ------------------------------------------------- */

        const allowedSexes = [
            "homme",
            "femme",
            "autre"
        ];


        if (
            sexe !== undefined &&
            sexe !== null &&
            sexe !== "" &&
            !allowedSexes.includes(sexe)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Sexe invalide."

            });

        }


        /* -------------------------------------------------
           Vérification niveau
        ------------------------------------------------- */

        const allowedLevels = [
            "debutant",
            "intermediaire",
            "avance"
        ];


        if (
            niveau !== undefined &&
            niveau !== null &&
            niveau !== "" &&
            !allowedLevels.includes(niveau)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Niveau invalide."

            });

        }


        /* -------------------------------------------------
           Vérification taille
        ------------------------------------------------- */

        let numericTaille = null;


        if (
            taille !== undefined &&
            taille !== null &&
            taille !== ""
        ) {

            numericTaille =
                Number(taille);


            if (
                !Number.isFinite(
                    numericTaille
                ) ||
                numericTaille <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "La taille doit être une valeur numérique valide."

                });

            }

        }


        try {

            /* -------------------------------------------------
               Vérifier si profil existe
            ------------------------------------------------- */

            const [profiles] =
                await db.execute(

                    `SELECT id
                     FROM profiles
                     WHERE user_id = ?`,

                    [
                        req.session.userId
                    ]

                );


            if (
                profiles.length === 0
            ) {

                await db.execute(

                    `INSERT INTO profiles
                     (
                         user_id,
                         date_naissance,
                         sexe,
                         taille,
                         niveau,
                         objectif_principal
                     )
                     VALUES (?, ?, ?, ?, ?, ?)`,

                    [
                        req.session.userId,
                        date_naissance || null,
                        sexe || null,
                        numericTaille,
                        niveau || null,
                        objectif_principal || null
                    ]

                );

            } else {

                await db.execute(

                    `UPDATE profiles
                     SET
                         date_naissance = ?,
                         sexe = ?,
                         taille = ?,
                         niveau = ?,
                         objectif_principal = ?
                     WHERE user_id = ?`,

                    [
                        date_naissance || null,
                        sexe || null,
                        numericTaille,
                        niveau || null,
                        objectif_principal || null,
                        req.session.userId
                    ]

                );

            }


            res.json({

                success: true,

                message:
                    "Profil mis à jour."

            });

        } catch (error) {

            console.error(
                "Erreur mise à jour profil :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la mise à jour du profil."

            });

        }

    }
);


/* =========================================================
   15. MENSURATIONS
   ========================================================= */


/* =========================================================
   15.1 RÉCUPÉRER LES MENSURATIONS
   ========================================================= */

app.get(
    "/api/body-measurements",
    requireLogin,
    async (req, res) => {

        try {

            const [measurements] =
                await db.execute(

                    `SELECT
                        id,
                        date,
                        poids,
                        tour_taille,
                        tour_bras,
                        tour_cuisse,
                        tour_mollet,
                        tour_hanche,
                        tour_torse
                     FROM body_measurements
                     WHERE user_id = ?
                     ORDER BY date DESC, id DESC`,

                    [
                        req.session.userId
                    ]

                );


            res.json({

                success: true,

                measurements

            });

        } catch (error) {

            console.error(
                "Erreur mensurations :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la récupération des mensurations."

            });

        }

    }
);


/* =========================================================
   15.2 AJOUTER UNE MESURE
   ========================================================= */

app.post(
    "/api/body-measurements",
    requireLogin,
    async (req, res) => {

        const {
            date,
            poids,
            tour_taille,
            tour_bras,
            tour_cuisse,
            tour_mollet,
            tour_hanche,
            tour_torse
        } = req.body;


        if (!date) {

            return res.status(400).json({

                success: false,

                message:
                    "La date est obligatoire."

            });

        }


        const values = {

            poids,
            tour_taille,
            tour_bras,
            tour_cuisse,
            tour_mollet,
            tour_hanche,
            tour_torse

        };


        /* -------------------------------------------------
           Convertir et vérifier les valeurs
        ------------------------------------------------- */

        const cleanValues = {};


        for (
            const [key, value] of Object.entries(values)
        ) {

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                cleanValues[key] = null;

                continue;

            }


            const numericValue =
                Number(value);


            if (
                !Number.isFinite(
                    numericValue
                ) ||
                numericValue < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Valeur invalide pour ${key}.`

                });

            }


            cleanValues[key] =
                numericValue;

        }


        /* -------------------------------------------------
           Au moins une valeur
        ------------------------------------------------- */

        const hasMeasurement =
            Object.values(
                cleanValues
            ).some(
                value =>
                    value !== null
            );


        if (!hasMeasurement) {

            return res.status(400).json({

                success: false,

                message:
                    "Au moins une mensuration doit être renseignée."

            });

        }


        try {

            const [result] =
                await db.execute(

                    `INSERT INTO body_measurements
                     (
                         user_id,
                         date,
                         poids,
                         tour_taille,
                         tour_bras,
                         tour_cuisse,
                         tour_mollet,
                         tour_hanche,
                         tour_torse
                     )
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                    [
                        req.session.userId,
                        date,
                        cleanValues.poids,
                        cleanValues.tour_taille,
                        cleanValues.tour_bras,
                        cleanValues.tour_cuisse,
                        cleanValues.tour_mollet,
                        cleanValues.tour_hanche,
                        cleanValues.tour_torse
                    ]

                );


            /*
               Synchroniser le poids avec profiles.poids
               lorsqu'un poids est fourni.
            */

            if (
                cleanValues.poids !== null
            ) {

                await db.execute(

                    `UPDATE profiles
                     SET poids = ?
                     WHERE user_id = ?`,

                    [
                        cleanValues.poids,
                        req.session.userId
                    ]

                );

            }


            res.status(201).json({

                success: true,

                message:
                    "Mensurations enregistrées.",

                measurementId:
                    result.insertId

            });

        } catch (error) {

            console.error(
                "Erreur ajout mensurations :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de l'enregistrement des mensurations."

            });

        }

    }
);


/* =========================================================
   16. PERFORMANCES
   ========================================================= */


/* =========================================================
   16.1 RÉCUPÉRER LES PERFORMANCES
   ========================================================= */

app.get(
    "/api/performances",
    requireLogin,
    async (req, res) => {

        try {

            const [performances] =
                await db.execute(

                    `SELECT
                        p.id,
                        p.type,
                        p.value,
                        p.unit,
                        p.date,
                        p.created_at,
                        p.commentaire,
                        pt.categorie
                     FROM performances p
                     LEFT JOIN performance_types pt
                        ON pt.id = p.performance_type_id
                     WHERE p.user_id = ?
                     ORDER BY p.date DESC, p.id DESC`,

                    [
                        req.session.userId
                    ]

                );


            res.json({

                success: true,

                performances

            });

        } catch (error) {

            console.error(
                "Erreur performances :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la récupération des performances."

            });

        }

    }
);


/* =========================================================
   16.2 AJOUTER UNE PERFORMANCE
   ========================================================= */

app.post(
    "/api/performances",
    requireLogin,
    async (req, res) => {

        const {
            type,
            value,
            date,
            commentaire
        } = req.body;


        if (
            !type ||
            value === undefined ||
            value === null ||
            !date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Le type, la valeur et la date sont obligatoires."

            });

        }


        if (
            !ALLOWED_PERFORMANCE_TYPES.includes(
                type
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Type de performance invalide."

            });

        }


        const numericValue =
            Number(value);


        if (
            !Number.isFinite(
                numericValue
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "La valeur doit être numérique."

            });

        }


        try {

            /* -------------------------------------------------
               Récupérer le type de performance
            ------------------------------------------------- */

            const [performanceTypes] =
                await db.execute(

                    `SELECT
                        id,
                        unite
                     FROM performance_types
                     WHERE nom = ?`,

                    [
                        type
                    ]

                );


            if (
                performanceTypes.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Type de performance introuvable en base."

                });

            }


            const performanceType =
                performanceTypes[0];


            /* -------------------------------------------------
               Ajouter performance
            ------------------------------------------------- */

            const [result] =
                await db.execute(

                    `INSERT INTO performances
                     (
                         user_id,
                         performance_type_id,
                         type,
                         value,
                         unit,
                         date,
                         commentaire
                     )
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,

                    [
                        req.session.userId,
                        performanceType.id,
                        type,
                        numericValue,
                        performanceType.unite,
                        date,
                        commentaire || null
                    ]

                );


            res.status(201).json({

                success: true,

                message:
                    "Performance ajoutée !",

                performance: {

                    id:
                        result.insertId,

                    user_id:
                        req.session.userId,

                    type,

                    value:
                        numericValue,

                    unit:
                        performanceType.unite,

                    date

                }

            });

        } catch (error) {

            console.error(
                "Erreur ajout performance :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de l'ajout de la performance."

            });

        }

    }
);


/* =========================================================
   16.3 SUPPRIMER UNE PERFORMANCE
   ========================================================= */

app.delete(
    "/api/performances/:id",
    requireLogin,
    async (req, res) => {

        const performanceId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                performanceId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "ID de performance invalide."

            });

        }


        try {

            const [result] =
                await db.execute(

                    `DELETE FROM performances
                     WHERE id = ?
                     AND user_id = ?`,

                    [
                        performanceId,
                        req.session.userId
                    ]

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Performance introuvable."

                });

            }


            res.json({

                success: true,

                message:
                    "Performance supprimée."

            });

        } catch (error) {

            console.error(
                "Erreur suppression :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la suppression."

            });

        }

    }
);


/* =========================================================
   17. OBJECTIFS
   ========================================================= */


/* =========================================================
   17.1 RÉCUPÉRER LES OBJECTIFS
   ========================================================= */

app.get(
    "/api/goals",
    requireLogin,
    async (req, res) => {

        try {

            const [goals] =
                await db.execute(

                    `SELECT
                        id,
                        type,
                        nom,
                        valeur_cible,
                        valeur_actuelle,
                        unite,
                        date_cible,
                        statut
                     FROM goals
                     WHERE user_id = ?
                     ORDER BY
                        statut ASC,
                        date_cible ASC,
                        id DESC`,

                    [
                        req.session.userId
                    ]

                );


            res.json({

                success: true,

                goals

            });

        } catch (error) {

            console.error(
                "Erreur objectifs :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la récupération des objectifs."

            });

        }

    }
);


/* =========================================================
   17.2 AJOUTER UN OBJECTIF
   ========================================================= */

app.post(
    "/api/goals",
    requireLogin,
    async (req, res) => {

        const {
            type,
            nom,
            valeur_cible,
            valeur_actuelle,
            unite,
            date_cible,
            statut
        } = req.body;


        if (
            !type ||
            !nom
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Le type et le nom de l'objectif sont obligatoires."

            });

        }


        /* -------------------------------------------------
           Statuts autorisés
        ------------------------------------------------- */

        const allowedStatuses = [
            "actif",
            "atteint",
            "abandonne"
        ];


        const cleanStatut =
            statut || "actif";


        if (
            !allowedStatuses.includes(
                cleanStatut
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Statut d'objectif invalide."

            });

        }


        /* -------------------------------------------------
           Valeurs numériques
        ------------------------------------------------- */

        let targetValue = null;
        let currentValue = null;


        if (
            valeur_cible !== undefined &&
            valeur_cible !== null &&
            valeur_cible !== ""
        ) {

            targetValue =
                Number(
                    valeur_cible
                );


            if (
                !Number.isFinite(
                    targetValue
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "La valeur cible doit être numérique."

                });

            }

        }


        if (
            valeur_actuelle !== undefined &&
            valeur_actuelle !== null &&
            valeur_actuelle !== ""
        ) {

            currentValue =
                Number(
                    valeur_actuelle
                );


            if (
                !Number.isFinite(
                    currentValue
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "La valeur actuelle doit être numérique."

                });

            }

        }


        try {

            const [result] =
                await db.execute(

                    `INSERT INTO goals
                     (
                         user_id,
                         type,
                         nom,
                         valeur_cible,
                         valeur_actuelle,
                         unite,
                         date_cible,
                         statut
                     )
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

                    [
                        req.session.userId,
                        type,
                        nom.trim(),
                        targetValue,
                        currentValue,
                        unite || null,
                        date_cible || null,
                        cleanStatut
                    ]

                );


            res.status(201).json({

                success: true,

                message:
                    "Objectif ajouté !",

                goalId:
                    result.insertId

            });

        } catch (error) {

            console.error(
                "Erreur ajout objectif :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de l'ajout de l'objectif."

            });

        }

    }
);


/* =========================================================
   17.3 MODIFIER UN OBJECTIF
   ========================================================= */

app.put(
    "/api/goals/:id",
    requireLogin,
    async (req, res) => {

        const goalId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                goalId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "ID d'objectif invalide."

            });

        }


        const {
            type,
            nom,
            valeur_cible,
            valeur_actuelle,
            unite,
            date_cible,
            statut
        } = req.body;


        const allowedStatuses = [
            "actif",
            "atteint",
            "abandonne"
        ];


        if (
            statut &&
            !allowedStatuses.includes(
                statut
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Statut d'objectif invalide."

            });

        }


        try {

            const [result] =
                await db.execute(

                    `UPDATE goals
                     SET
                         type = ?,
                         nom = ?,
                         valeur_cible = ?,
                         valeur_actuelle = ?,
                         unite = ?,
                         date_cible = ?,
                         statut = ?
                     WHERE id = ?
                     AND user_id = ?`,

                    [
                        type,
                        nom,
                        valeur_cible !== undefined
                            ? valeur_cible
                            : null,
                        valeur_actuelle !== undefined
                            ? valeur_actuelle
                            : null,
                        unite || null,
                        date_cible || null,
                        statut || "actif",
                        goalId,
                        req.session.userId
                    ]

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Objectif introuvable."

                });

            }


            res.json({

                success: true,

                message:
                    "Objectif mis à jour."

            });

        } catch (error) {

            console.error(
                "Erreur modification objectif :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la modification de l'objectif."

            });

        }

    }
);


/* =========================================================
   17.4 SUPPRIMER UN OBJECTIF
   ========================================================= */

app.delete(
    "/api/goals/:id",
    requireLogin,
    async (req, res) => {

        const goalId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                goalId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "ID d'objectif invalide."

            });

        }


        try {

            const [result] =
                await db.execute(

                    `DELETE FROM goals
                     WHERE id = ?
                     AND user_id = ?`,

                    [
                        goalId,
                        req.session.userId
                    ]

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Objectif introuvable."

                });

            }


            res.json({

                success: true,

                message:
                    "Objectif supprimé."

            });

        } catch (error) {

            console.error(
                "Erreur suppression objectif :",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Erreur lors de la suppression de l'objectif."

            });

        }

    }
);

/* =========================================================
   17.5 QUESTIONNAIRE COMPLET
   ========================================================= */

app.post(
    "/api/questionnaire",
    requireLogin,
    async (req, res) => {

        const userId = req.session.userId;
        let connection;

        const {
            date_naissance,
            sexe,
            taille,
            niveau,
            objectif_principal,

            poids,
            tour_taille,
            tour_bras,
            tour_cuisse,
            tour_mollet,
            tour_hanche,
            tour_torse,

            bench_actuel,
            squat_actuel,
            deadlift_actuel,

            course_5km,
            course_10km,
            course_21km,
            course_42km,
            course_km_semaine,

            hyrox_solo_open_homme,
            hyrox_solo_pro_homme,
            hyrox_solo_open_femme,
            hyrox_solo_pro_femme,
            hyrox_mixte,
            hyrox_homme_homme,
            hyrox_femme_femme,

            date
        } = req.body;


        try {

            connection =
                await db.getConnection();

            await connection.beginTransaction();

            const validationError =
                message => {
                    const error =
                        new Error(message);

                    error.statusCode =
                        400;

                    return error;
                };

            /* =================================================
               1. PROFIL
               ================================================= */

            const allowedSexes = [
                "homme",
                "femme",
                "autre"
            ];

            const allowedLevels = [
                "debutant",
                "intermediaire",
                "avance"
            ];


            if (
                sexe &&
                !allowedSexes.includes(sexe)
            ) {

                throw validationError(
                    "Sexe invalide."
                );

            }


            if (
                niveau &&
                !allowedLevels.includes(niveau)
            ) {

                throw validationError(
                    "Niveau invalide."
                );

            }


            let cleanTaille = null;


            if (
                taille !== undefined &&
                taille !== null &&
                taille !== ""
            ) {

                cleanTaille = Number(taille);

                if (
                    !Number.isFinite(cleanTaille) ||
                    cleanTaille <= 0
                ) {

                    throw validationError(
                        "Taille invalide."
                    );

                }

            }


            await connection.execute(

                `INSERT INTO profiles
                 (
                     user_id,
                     date_naissance,
                     sexe,
                     taille,
                     niveau,
                     objectif_principal
                 )
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                     date_naissance = VALUES(date_naissance),
                     sexe = VALUES(sexe),
                     taille = VALUES(taille),
                     niveau = VALUES(niveau),
                     objectif_principal = VALUES(objectif_principal)`,

                [
                    userId,
                    date_naissance || null,
                    sexe || null,
                    cleanTaille,
                    niveau || null,
                    objectif_principal || null
                ]

            );


            /* =================================================
               2. MENSURATIONS
               ================================================= */

            const bodyValues = {

                poids,
                tour_taille,
                tour_bras,
                tour_cuisse,
                tour_mollet,
                tour_hanche,
                tour_torse

            };


            const cleanBodyValues = {};


            for (
                const [key, value]
                of Object.entries(bodyValues)
            ) {

                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {

                    cleanBodyValues[key] = null;

                    continue;

                }


                const numberValue =
                    Number(value);


                if (
                    !Number.isFinite(numberValue) ||
                    numberValue < 0
                ) {

                    throw validationError(
                        `Valeur invalide pour ${key}.`
                    );

                }


                cleanBodyValues[key] =
                    numberValue;

            }


            const hasBodyMeasurement =
                Object.values(
                    cleanBodyValues
                ).some(
                    value =>
                        value !== null
                );


            if (
                hasBodyMeasurement
            ) {

                await connection.execute(

                    `INSERT INTO body_measurements
                     (
                         user_id,
                         date,
                         poids,
                         tour_taille,
                         tour_bras,
                         tour_cuisse,
                         tour_mollet,
                         tour_hanche,
                         tour_torse
                     )
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                    [
                        userId,
                        date || new Date()
                            .toISOString()
                            .slice(0, 10),

                        cleanBodyValues.poids,
                        cleanBodyValues.tour_taille,
                        cleanBodyValues.tour_bras,
                        cleanBodyValues.tour_cuisse,
                        cleanBodyValues.tour_mollet,
                        cleanBodyValues.tour_hanche,
                        cleanBodyValues.tour_torse
                    ]

                );

            }


            /* =================================================
               3. PERFORMANCES
               ================================================= */

            const performances = [

                {
                    type: "bench_actuel",
                    value: bench_actuel
                },

                {
                    type: "squat_actuel",
                    value: squat_actuel
                },

                {
                    type: "deadlift_actuel",
                    value: deadlift_actuel
                },

                {
                    type: "course_5km",
                    value: course_5km
                },

                {
                    type: "course_10km",
                    value: course_10km
                },

                {
                    type: "course_21km",
                    value: course_21km
                },

                {
                    type: "course_42km",
                    value: course_42km
                },

                {
                    type: "course_km_semaine",
                    value: course_km_semaine
                },

                {
                    type: "hyrox solo open homme",
                    value: hyrox_solo_open_homme
                },

                {
                    type: "hyrox solo pro homme",
                    value: hyrox_solo_pro_homme
                },

                {
                    type: "hyrox solo open femme",
                    value: hyrox_solo_open_femme
                },

                {
                    type: "hyrox solo pro femme",
                    value: hyrox_solo_pro_femme
                },

                {
                    type: "hyrox mixte",
                    value: hyrox_mixte
                },

                {
                    type: "hyrox homme/homme",
                    value: hyrox_homme_homme
                },

                {
                    type: "hyrox femme/femme",
                    value: hyrox_femme_femme
                }

            ];


            for (
                const performance
                of performances
            ) {

                if (
                    performance.value === undefined ||
                    performance.value === null ||
                    performance.value === ""
                ) {

                    continue;

                }


                const numericValue =
                    Number(
                        performance.value
                    );


                if (
                    !Number.isFinite(
                        numericValue
                    )
                ) {

                    throw validationError(
                        `Valeur invalide pour ${performance.type}.`
                    );

                }


                const [
                    performanceTypes
                ] = await connection.execute(

                    `SELECT
                        id,
                        unite
                     FROM performance_types
                     WHERE nom = ?`,

                    [
                        performance.type
                    ]

                );


                if (
                    performanceTypes.length === 0
                ) {

                    throw new Error(
                        `Type de performance absent : ${performance.type}`
                    );

                }


                const performanceType =
                    performanceTypes[0];


                await connection.execute(

                    `INSERT INTO performances
                     (
                         user_id,
                         performance_type_id,
                         type,
                         value,
                         unit,
                         date
                     )
                     VALUES (?, ?, ?, ?, ?, ?)`,

                    [
                        userId,
                        performanceType.id,
                        performance.type,
                        numericValue,
                        performanceType.unite,
                        date ||
                            new Date()
                                .toISOString()
                                .slice(0, 10)
                    ]

                );

            }


            /* =================================================
               4. RÉPONSE
               ================================================= */

            await connection.commit();

            res.status(201).json({

                success: true,

                message:
                    "Questionnaire enregistré avec succès !"

            });


        } catch (error) {

            if (connection) {
                await connection.rollback();
            }

            console.error(
                "Erreur questionnaire :",
                error
            );


            const statusCode =
                Number.isInteger(
                    error.statusCode
                )
                    ? error.statusCode
                    : 500;

            res.status(statusCode).json({

                success: false,

                message:
                    statusCode === 400
                        ? error.message
                        : "Erreur lors de l'enregistrement du questionnaire."

            });

        } finally {

            if (connection) {
                connection.release();
            }

        }

    }
);
/* =========================================================
   18. ADMIN — VISUALISATION BDD
   ========================================================= */

app.get(
    "/admin/database",
    async (req, res) => {

        try {

            const [tables] =
                await db.query(
                    "SHOW TABLES"
                );


            const databaseName =
                process.env.DB_NAME ||
                "defaultdb";


            const tableKey =
                `Tables_in_${databaseName}`;


            let html = `

                <!DOCTYPE html>

                <html lang="fr">

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>
                        luxa_fit | Base de données
                    </title>

                    <style>

                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            padding: 40px;
                            font-family: Arial, sans-serif;
                            background: #111;
                            color: white;
                        }

                        h1 {
                            margin-bottom: 10px;
                        }

                        .database-name {
                            color: #aaa;
                            margin-bottom: 40px;
                        }

                        h2 {
                            margin-top: 40px;
                            margin-bottom: 15px;
                        }

                        .table-container {
                            overflow-x: auto;
                            background: #1b1b1b;
                            border-radius: 10px;
                            padding: 15px;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        th,
                        td {
                            border: 1px solid #444;
                            padding: 10px;
                            text-align: left;
                            white-space: nowrap;
                        }

                        th {
                            background: #292929;
                        }

                        tr:nth-child(even) {
                            background: #202020;
                        }

                        .empty {
                            color: #888;
                            padding: 15px 0;
                        }

                    </style>

                </head>

                <body>

                    <h1>
                        luxa_fit — Base de données
                    </h1>

                    <div class="database-name">
                        Base : ${databaseName}
                    </div>

            `;


            for (
                const table of tables
            ) {

                const tableName =
                    table[tableKey];


                const [rows] =
                    await db.query(
                        `SELECT * FROM \`${tableName}\``
                    );


                html += `

                    <h2>
                        ${tableName}
                    </h2>

                `;


                if (
                    rows.length === 0
                ) {

                    html += `

                        <div class="empty">
                            Cette table est vide.
                        </div>

                    `;

                    continue;
                }


                html += `

                    <div class="table-container">

                        <table>

                            <thead>

                                <tr>

                `;


                Object.keys(
                    rows[0]
                ).forEach(
                    column => {

                        html += `

                            <th>
                                ${column}
                            </th>

                        `;

                    }
                );


                html += `

                                </tr>

                            </thead>

                            <tbody>

                `;


                rows.forEach(
                    row => {

                        html += `

                            <tr>

                        `;


                        Object.values(
                            row
                        ).forEach(
                            value => {

                                html += `

                                    <td>
                                        ${value ?? ""}
                                    </td>

                                `;

                            }
                        );


                        html += `

                            </tr>

                        `;

                    }
                );


                html += `

                            </tbody>

                        </table>

                    </div>

                `;

            }


            html += `

                </body>

                </html>

            `;


            res.send(
                html
            );

        } catch (error) {

            console.error(
                "Erreur lecture BDD :",
                error
            );

            res.status(500).send(`

                <h1>
                    Erreur lors de la lecture de la BDD
                </h1>

                <pre>
                    ${error.message}
                </pre>

            `);

        }

    }
);


/* =========================================================
   19. ROUTES API INEXISTANTES
   ========================================================= */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route API introuvable."

        });

    }
);


/* =========================================================
   20. GESTION GLOBALE DES ERREURS
   ========================================================= */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Erreur serveur :",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Une erreur serveur est survenue."

        });

    }
);


/* =========================================================
   21. DÉMARRAGE
   ========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "          LUXA_FIT - SERVEUR"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Serveur lancé sur le port ${PORT}`
        );

        console.log(
            `Environnement : ${
                isProduction
                    ? "production"
                    : "développement"
            }`
        );

        console.log(
            "========================================"
        );

    }
);