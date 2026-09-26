const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./js/database"); // Importer la connexion à la base de données

const app = express();
const PORT = process.env.PORT || 3000;
// ========================================
// CONFIGURATION
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "luxa_fit_secret_2026",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    })
);

// ========================================
// FICHIERS DU SITE
// ========================================

app.use(express.static(__dirname));

// ========================================
// PAGE PRINCIPALE
// ========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ========================================
// TEST MYSQL
// ========================================

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS test");

        res.json({
            success: true,
            message: "Connexion MySQL réussie !",
            result: rows
        });
    } catch (error) {
        console.error("Erreur MySQL :", error);

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
    const { prenom, nom, password } = req.body;

    // Vérification des champs
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
        // Vérifier si l'utilisateur existe déjà
        const [existingUsers] = await db.execute(
            `SELECT id
             FROM users
             WHERE prenom = ?
             AND nom = ?`,
            [prenom.trim(), nom.trim()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Cet utilisateur existe déjà."
            });
        }

        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

        // Créer le compte
        const [result] = await db.execute(
            `INSERT INTO users
             (prenom, nom, password_hash)
             VALUES (?, ?, ?)`,
            [
                prenom.trim(),
                nom.trim(),
                passwordHash
            ]
        );

        res.status(201).json({
            success: true,
            message: "Compte créé avec succès !",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Erreur inscription :", error);

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
    const { prenom, nom, password } = req.body;

    if (!prenom || !nom || !password) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires."
        });
    }

    try {
        const [users] = await db.execute(
            `SELECT id, prenom, nom, password_hash
             FROM users
             WHERE prenom = ?
             AND nom = ?`,
            [
                prenom.trim(),
                nom.trim()
            ]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Nom ou mot de passe incorrect."
            });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const passwordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Nom ou mot de passe incorrect."
            });
        }

        // Régénérer la session pour éviter les problèmes de session
        req.session.regenerate((error) => {
            if (error) {
                console.error("Erreur session :", error);

                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la création de la session."
                });
            }

            // Enregistrer l'utilisateur dans la session
            req.session.userId = user.id;

            req.session.user = {
                id: user.id,
                prenom: user.prenom,
                nom: user.nom
            };

            req.session.save((error) => {
                if (error) {
                    console.error("Erreur sauvegarde session :", error);

                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la sauvegarde de la session."
                    });
                }

                res.json({
                    success: true,
                    message: "Connexion réussie !",
                    user: {
                        id: user.id,
                        prenom: user.prenom,
                        nom: user.nom
                    }
                });
            });
        });

    } catch (error) {
        console.error("Erreur connexion :", error);

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
    if (!req.session || !req.session.userId) {
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
    req.session.destroy((error) => {
        if (error) {
            console.error("Erreur déconnexion :", error);

            return res.status(500).json({
                success: false,
                message: "Erreur lors de la déconnexion."
            });
        }

        res.clearCookie("connect.sid");

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
    if (!req.session || !req.session.userId) {
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
            const [performances] = await db.execute(
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
            console.error("Erreur performances :", error);

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
        const { type, value, date } = req.body;

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

        const allowedTypes = [
            "poids",
            "taille",
            "tour_de_taille",
            "tour_de_hanche",
            "tour_de_bras",
            "tour_de_cuisse",
            "tour_de_mollet",
            "tour_de_torse",
            "bench_actuel",
            "bench_max",
            "squat_actuel",
            "squat_max",
            "deadlift_actuel",
            "deadlift_max",
            "hyrox solo open homme",
            "hyrox solo pro homme",
            "hyrox solo open femme",
            "hyrox solo pro femme",
            "hyrox mixte",
            "hyrox homme/homme",
            "hyrox femme/femme",
            "course_5km",
            "course_10km",
            "course_21km",
            "course_42km",
            "course_km_semaine"
        ];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Type de performance invalide."
            });
        }

        const numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
            return res.status(400).json({
                success: false,
                message: "La valeur doit être numérique."
            });
        }

        try {
            const [result] = await db.execute(
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

            res.status(201).json({
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
            console.error("Erreur ajout performance :", error);

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
        const performanceId = Number(req.params.id);

        if (!Number.isInteger(performanceId)) {
            return res.status(400).json({
                success: false,
                message: "ID de performance invalide."
            });
        }

        try {
            // Vérifier que la performance appartient
            // bien à l'utilisateur connecté
            const [performances] = await db.execute(
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

            // Supprimer la performance
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
            console.error("Erreur suppression :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression."
            });
        }
    }
);

// ========================================
// GESTION DES ERREURS JSON
// ========================================

app.use((error, req, res, next) => {
    console.error("Erreur serveur :", error);

    res.status(500).json({
        success: false,
        message: "Une erreur serveur est survenue."
    });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

app.listen(PORT, () => {
    console.log("========================================");
    console.log("       LUXA_FIT - SERVEUR");
    console.log("========================================");
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
    console.log("========================================");
});