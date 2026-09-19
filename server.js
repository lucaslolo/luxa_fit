const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./database");

const app = express();
const PORT = 3000;

// ========================================
// CONFIGURATION
// ========================================

app.use(express.json());

app.use(
    session({
        secret: "luxa_fit_secret_2026",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

const publicPages = new Set([
    "/",
    "/index.html",
    "/connexion.html"
]);

app.use((req, res, next) => {

    if (
        req.method === "GET" &&
        req.path.endsWith(".html") &&
        !publicPages.has(req.path) &&
        !req.session.siteAccess
    ) {
        return res.redirect("/index.html");
    }

    next();
});

app.use(express.static(__dirname));


// ========================================
// PAGE PRINCIPALE
// ========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ========================================
// ACCES AU SITE
// ========================================

app.post("/api/site-access", (req, res) => {

    const { username, password } = req.body;

    if (username !== "luxa" || password !== "luxa") {
        return res.status(401).json({
            success: false,
            message: "Identifiant ou mot de passe incorrect."
        });
    }

    req.session.siteAccess = true;

    res.json({
        success: true,
        message: "Accès autorisé."
    });
});


// ========================================
// TEST MYSQL
// ========================================

app.get("/api/test-db", async (req, res) => {

    try {

        const [rows] =
            await db.query("SELECT 1 AS test");

        res.json({
            success: true,
            message: "Connexion MySQL réussie !",
            result: rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erreur de connexion à MySQL"
        });

    }

});


// ========================================
// INSCRIPTION
// ========================================

app.post("/api/register", async (req, res) => {

    const {
        prenom,
        nom,
        password
    } = req.body;


    if (!prenom || !nom || !password) {

        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires."
        });

    }


    if (password.length < 6) {

        return res.status(400).json({
            success: false,
            message: "Le mot de passe doit contenir au moins 6 caractères."
        });

    }


    try {

        const [existingUsers] =
            await db.execute(
                `SELECT id
                 FROM users
                 WHERE prenom = ?
                 AND nom = ?`,
                [prenom, nom]
            );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Cet utilisateur existe déjà."
            });

        }


        const passwordHash =
            await bcrypt.hash(password, 10);


        const [result] =
            await db.execute(
                `INSERT INTO users
                (prenom, nom, password_hash)
                VALUES (?, ?, ?)`,
                [
                    prenom,
                    nom,
                    passwordHash
                ]
            );


        res.json({
            success: true,
            message: "Compte créé avec succès !",
            userId: result.insertId
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erreur lors de la création du compte."
        });

    }

});


// ========================================
// CONNEXION
// ========================================

app.post("/api/login", async (req, res) => {

    const {
        prenom,
        nom,
        password
    } = req.body;


    if (!prenom || !nom || !password) {

        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires."
        });

    }


    try {

        const [users] =
            await db.execute(
                `SELECT *
                 FROM users
                 WHERE prenom = ?
                 AND nom = ?`,
                [
                    prenom,
                    nom
                ]
            );


        if (users.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Nom ou mot de passe incorrect."
            });

        }


        const user = users[0];


        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Nom ou mot de passe incorrect."
            });

        }


        // Création de la session

        req.session.userId = user.id;

        req.session.user = {
            id: user.id,
            prenom: user.prenom,
            nom: user.nom
        };


        res.json({
            success: true,
            message: "Connexion réussie !",
            user: {
                id: user.id,
                prenom: user.prenom,
                nom: user.nom
            }
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erreur lors de la connexion."
        });

    }

});


// ========================================
// UTILISATEUR CONNECTÉ
// ========================================

app.get("/api/me", (req, res) => {

    if (!req.session.userId) {

        return res.json({
            success: false,
            message: "Aucun utilisateur connecté."
        });

    }


    res.json({
        success: true,
        user: req.session.user
    });

});


// ========================================
// DÉCONNEXION
// ========================================

app.post("/api/logout", (req, res) => {

    req.session.destroy(error => {

        if (error) {

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Erreur lors de la déconnexion."
            });

        }


        res.json({
            success: true,
            message: "Déconnexion réussie."
        });

    });

});


// ========================================
// VÉRIFICATION SESSION
// ========================================

function requireLogin(req, res, next) {

    if (!req.session.userId) {

        return res.status(401).json({
            success: false,
            message: "Tu dois être connecté."
        });

    }

    next();
}


// ========================================
// RÉCUPÉRER LES PERFORMANCES
// ========================================

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
                    [req.session.userId]
                );


            res.json({
                success: true,
                performances: performances
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des performances."
            });

        }

    }
);


// ========================================
// AJOUTER UNE PERFORMANCE
// ========================================

app.post(
    "/api/performances",
    requireLogin,
    async (req, res) => {

        const {
            type,
            value,
            date
        } = req.body;


        // Vérification

        if (
            !type ||
            value === undefined ||
            value === null ||
            !date
        ) {

            return res.status(400).json({
                success: false,
                message: "Le type, la valeur et la date sont obligatoires."
            });

        }


        // Types autorisés

        const allowedTypes = [
            "weight",
            "run",
            "hyrox",
            "km"
        ];


        if (!allowedTypes.includes(type)) {

            return res.status(400).json({
                success: false,
                message: "Type de performance invalide."
            });

        }


        // Vérifier que la valeur est bien numérique

        const numericValue =
            Number(value);


        if (!Number.isFinite(numericValue)) {

            return res.status(400).json({
                success: false,
                message: "La valeur doit être numérique."
            });

        }


        try {

            const [result] =
                await db.execute(
                    `INSERT INTO performances
                    (user_id, type, value, date)
                    VALUES (?, ?, ?, ?)`,
                    [
                        req.session.userId,
                        type,
                        numericValue,
                        date
                    ]
                );


            res.json({
                success: true,
                message: "Performance ajoutée !",
                performance: {
                    id: result.insertId,
                    user_id: req.session.userId,
                    type: type,
                    value: numericValue,
                    date: date
                }
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de l'ajout de la performance."
            });

        }

    }
);


// ========================================
// SUPPRIMER UNE PERFORMANCE
// ========================================

app.delete(
    "/api/performances/:id",
    requireLogin,
    async (req, res) => {

        const performanceId =
            Number(req.params.id);


        if (!Number.isInteger(performanceId)) {

            return res.status(400).json({
                success: false,
                message: "ID de performance invalide."
            });

        }


        try {

            // On vérifie que la performance
            // appartient bien à l'utilisateur connecté

            const [performances] =
                await db.execute(
                    `SELECT id
                     FROM performances
                     WHERE id = ?
                     AND user_id = ?`,
                    [
                        performanceId,
                        req.session.userId
                    ]
                );


            if (performances.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Performance introuvable."
                });

            }


            await db.execute(
                `DELETE FROM performances
                 WHERE id = ?
                 AND user_id = ?`,
                [
                    performanceId,
                    req.session.userId
                ]
            );


            res.json({
                success: true,
                message: "Performance supprimée."
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression."
            });

        }

    }
);


// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

app.listen(PORT, () => {

    console.log(
        `Serveur lancé sur http://localhost:${PORT}`
    );

});