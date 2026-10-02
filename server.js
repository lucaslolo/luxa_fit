/* =========================================================
   LUXA_FIT
   SERVEUR EXPRESS + MYSQL
   ========================================================= */


/* =========================================================
   IMPORTS
   ========================================================= */

const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");

const db = require("./js/database");


/* =========================================================
   CONFIGURATION
   ========================================================= */

const app = express();

const PORT = process.env.PORT || 3000;

const isProduction =
    process.env.NODE_ENV === "production";


/* =========================================================
   TYPES DE PERFORMANCES AUTORISÉS
   =========================================================

   Cette liste est utilisée lorsque l'utilisateur ajoute
   une nouvelle performance.

   Cela empêche d'envoyer n'importe quel type depuis
   le frontend.
   ========================================================= */

const ALLOWED_PERFORMANCE_TYPES = [

    // Mesures corporelles
    "poids",
    "taille",
    "tour_de_taille",
    "tour_de_hanche",
    "tour_de_bras",
    "tour_de_cuisse",
    "tour_de_mollet",
    "tour_de_torse",

    // Powerlifting
    "bench_actuel",
    "squat_actuel",
    "deadlift_actuel",

    // HYROX
    "hyrox solo open homme",
    "hyrox solo pro homme",
    "hyrox solo open femme",
    "hyrox solo pro femme",
    "hyrox mixte",
    "hyrox homme/homme",
    "hyrox femme/femme",

    // Course
    "course_5km",
    "course_10km",
    "course_21km",
    "course_42km",
    "course_km_semaine"

];


/* =========================================================
   MIDDLEWARES
   ========================================================= */


/*
   Permet à Express de comprendre les données JSON
   envoyées par le frontend.
*/

app.use(express.json());


/*
   Permet également de recevoir les formulaires HTML.
*/

app.use(
    express.urlencoded({
        extended: true
    })
);


/*
   Permet de servir les fichiers HTML, CSS et JS
   présents dans le dossier du projet.
*/

app.use(
    express.static(__dirname)
);


/* =========================================================
   SESSION
   =========================================================

   La session permet de savoir quel utilisateur est connecté.

   Exemple :

   req.session.userId

   contient l'ID de l'utilisateur connecté.
   ========================================================= */

app.use(
    session({

        /*
           En production, le secret doit venir
           d'une variable d'environnement.
        */

        secret:
            process.env.SESSION_SECRET ||
            "luxa_fit_dev_secret",


        /*
           Ne pas sauvegarder une session
           si elle n'a pas été modifiée.
        */

        resave: false,


        /*
           Ne pas créer une session vide
           pour chaque visiteur.
        */

        saveUninitialized: false,


        cookie: {

            /*
               Empêche JavaScript côté navigateur
               d'accéder directement au cookie.
            */

            httpOnly: true,


            /*
               Protection contre certaines attaques CSRF.
            */

            sameSite: "lax",


            /*
               En HTTPS, le cookie doit être sécurisé.

               En local HTTP :
               false

               Sur Render HTTPS :
               true
            */

            secure: isProduction,


            /*
               Session valable 7 jours.
            */

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
   PAGE D'ACCUEIL
   ========================================================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


/* =========================================================
   MIDDLEWARE : UTILISATEUR CONNECTÉ
   =========================================================

   Les routes protégées utilisent cette fonction.

   Exemple :

   app.get(
       "/api/performances",
       requireLogin,
       ...
   );

   Si l'utilisateur n'est pas connecté,
   la route est bloquée.
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
   TEST MYSQL
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

                result: rows

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
   INSCRIPTION
   ========================================================= */

app.post(
    "/api/register",
    async (req, res) => {

        const {
            prenom,
            nom,
            password
        } = req.body;


        /* -----------------------------------------
           Vérification des champs
        ----------------------------------------- */

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


        /* -----------------------------------------
           Vérification du mot de passe
        ----------------------------------------- */

        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Le mot de passe doit contenir au moins 6 caractères."

            });

        }


        try {

            /*
               Nettoyage des données utilisateur.
            */

            const cleanPrenom =
                prenom.trim();

            const cleanNom =
                nom.trim();


            /* -------------------------------------
               Vérifier si le compte existe
            ------------------------------------- */

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


            /* -------------------------------------
               Hasher le mot de passe
            ------------------------------------- */

            const passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );


            /* -------------------------------------
               Créer le compte
            ------------------------------------- */

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


            res.status(201).json({

                success: true,

                message:
                    "Compte créé avec succès !",

                userId:
                    result.insertId

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
   CONNEXION
   ========================================================= */

app.post(
    "/api/login",
    async (req, res) => {

        const {
            prenom,
            nom,
            password
        } = req.body;


        /* -----------------------------------------
           Vérification des champs
        ----------------------------------------- */

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


            /* -------------------------------------
               Rechercher l'utilisateur
            ------------------------------------- */

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


            if (users.length === 0) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Nom ou mot de passe incorrect."

                });

            }


            const user =
                users[0];


            /* -------------------------------------
               Vérifier le mot de passe
            ------------------------------------- */

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


            /* -------------------------------------
               Nouvelle session
            ------------------------------------- */

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


                    /*
                       On stocke uniquement les informations
                       nécessaires dans la session.
                    */

                    req.session.userId =
                        user.id;


                    req.session.user = {

                        id: user.id,

                        prenom:
                            user.prenom,

                        nom:
                            user.nom

                    };


                    /* ---------------------------------
                       Sauvegarder la session
                    --------------------------------- */

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
   UTILISATEUR CONNECTÉ
   =========================================================

   Cette route est utilisée par app.js pour savoir
   si l'utilisateur est connecté.
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
   DÉCONNEXION
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


                /*
                   Supprimer le cookie de session
                   dans le navigateur.
                */

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
   RÉCUPÉRER LES PERFORMANCES
   ========================================================= */

app.get(
    "/api/performances",
    requireLogin,
    async (req, res) => {

        try {

            const [performances] =
                await db.execute(

                    `SELECT
                        id,
                        type,
                        value,
                        date,
                        created_at
                     FROM performances
                     WHERE user_id = ?
                     ORDER BY date DESC, id DESC`,

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
   AJOUTER UNE PERFORMANCE
   ========================================================= */

app.post(
    "/api/performances",
    requireLogin,
    async (req, res) => {

        const {
            type,
            value,
            date
        } = req.body;


        /* -----------------------------------------
           Vérification des champs
        ----------------------------------------- */

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


        /* -----------------------------------------
           Vérifier le type
        ----------------------------------------- */

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


        /* -----------------------------------------
           Vérifier la valeur numérique
        ----------------------------------------- */

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

            const [result] =
                await db.execute(

                    `INSERT INTO performances
                     (
                         user_id,
                         type,
                         value,
                         date
                     )
                     VALUES (?, ?, ?, ?)`,

                    [
                        req.session.userId,
                        type,
                        numericValue,
                        date
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
   SUPPRIMER UNE PERFORMANCE
   ========================================================= */

app.delete(
    "/api/performances/:id",
    requireLogin,
    async (req, res) => {

        const performanceId =
            Number(
                req.params.id
            );


        /* -----------------------------------------
           Vérifier l'ID
        ----------------------------------------- */

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

            /*
               On supprime uniquement une performance
               appartenant à l'utilisateur connecté.

               Cela évite qu'un utilisateur puisse
               supprimer la performance d'un autre.
            */

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
   ROUTES API INEXISTANTES
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
   GESTION DES ERREURS
   ========================================================= */

app.use(
    (error, req, res, next) => {

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
   DÉMARRAGE
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