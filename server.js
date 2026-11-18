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
const crypto = require("crypto");

const db = require("./js/database");
const { isValidDateOnly } = require("./shared/validation");
const { shouldSyncProfileWeight } = require("./shared/fitness-metrics");

// Store MySQL persistant : les sessions ne disparaissent pas au redémarrage
// du serveur (contrairement au MemoryStore fourni par défaut).
class MySQLSessionStore extends session.Store {
    constructor(pool) {
        super();
        this.pool = pool;
        this.ready = pool.execute(`
            CREATE TABLE IF NOT EXISTS web_sessions (
                session_id VARCHAR(128) NOT NULL PRIMARY KEY,
                expires BIGINT UNSIGNED NOT NULL,
                data MEDIUMTEXT NOT NULL,
                INDEX idx_web_sessions_expires (expires)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        this.ready.catch(() => {});
        this.writeCount = 0;
    }

    getExpiry(sess) {
        const expires = sess?.cookie?.expires
            ? new Date(sess.cookie.expires).getTime()
            : Date.now() + Number(sess?.cookie?.maxAge || 86400000);
        return Number.isFinite(expires) ? expires : Date.now() + 86400000;
    }

    get(sessionId, callback) {
        this.ready
            .then(() => this.pool.execute(
                `SELECT data FROM web_sessions WHERE session_id = ? AND expires > ?`,
                [sessionId, Date.now()]
            ))
            .then(([rows]) => callback(null, rows.length ? JSON.parse(rows[0].data) : null))
            .catch(callback);
    }

    set(sessionId, sess, callback = () => {}) {
        this.ready
            .then(() => this.pool.execute(
                `INSERT INTO web_sessions (session_id, expires, data) VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE expires = VALUES(expires), data = VALUES(data)`,
                [sessionId, this.getExpiry(sess), JSON.stringify(sess)]
            ))
            .then(() => {
                this.writeCount += 1;
                if (this.writeCount % 100 === 0) {
                    this.pool.execute(`DELETE FROM web_sessions WHERE expires <= ? LIMIT 500`, [Date.now()]).catch(() => {});
                }
                callback(null);
            })
            .catch(callback);
    }

    touch(sessionId, sess, callback = () => {}) {
        this.ready
            .then(() => this.pool.execute(
                `UPDATE web_sessions SET expires = ? WHERE session_id = ?`,
                [this.getExpiry(sess), sessionId]
            ))
            .then(() => callback(null))
            .catch(callback);
    }

    destroy(sessionId, callback = () => {}) {
        this.ready
            .then(() => this.pool.execute(`DELETE FROM web_sessions WHERE session_id = ?`, [sessionId]))
            .then(() => callback(null))
            .catch(callback);
    }
}


/* =========================================================
   2. CONFIGURATION
   ========================================================= */

const app = express();

const PORT = process.env.PORT || 3000;

const isProduction =
    process.env.NODE_ENV === "production";

if (isProduction && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
    throw new Error("SESSION_SECRET doit être défini en production avec au moins 32 caractères.");
}


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

// Limite la taille des payloads pour éviter les requêtes démesurées.
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb" }));
app.use((req, res, next) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) req.body = {};
    next();
});

// En-têtes de sécurité de base et absence de cache pour les réponses privées.
app.use((req, res, next) => {
    res.set({
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    });
    if (req.path.startsWith("/api/") || req.path.startsWith("/admin/")) {
        res.set("Cache-Control", "no-store");
    }
    next();
});

// Limiteur simple par adresse IP pour les routes sensibles.
// Pour plusieurs instances, remplacer ce stockage mémoire par Redis.
function createRateLimiter({ windowMs, max, message }) {
    const attempts = new Map();
    return (req, res, next) => {
        const now = Date.now();
        const key = req.ip || req.socket.remoteAddress || "unknown";
        const entry = attempts.get(key);
        if (attempts.size > 5000) {
            for (const [address, record] of attempts) {
                if (record.resetAt <= now) attempts.delete(address);
            }
        }
        if (!entry || entry.resetAt <= now) {
            attempts.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }
        entry.count += 1;
        if (entry.count > max) {
            res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
            return res.status(429).json({ success: false, message });
        }
        next();
    };
}

const loginRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Trop de tentatives de connexion. Réessaie dans quelques minutes."
});
const registerRateLimit = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Trop de créations de comptes depuis cette connexion. Réessaie plus tard."
});

// Le dossier du projet contient aussi le backend : ne jamais servir ces fichiers au navigateur.
const PRIVATE_STATIC_PATHS = new Set([
    "/server.js",
    "/package.json",
    "/package-lock.json",
    "/js/database.js",
    "/js/create-tables.js"
]);

app.use((req, res, next) => {
    if (PRIVATE_STATIC_PATHS.has(req.path)) return res.sendStatus(404);
    next();
});

app.use(express.static(__dirname, { dotfiles: "ignore", index: false }));


/* =========================================================
   6. SESSION
   ========================================================= */

app.use(
    session({

        store: new MySQLSessionStore(db),

        secret:
            process.env.SESSION_SECRET ||
            crypto.randomBytes(48).toString("hex"),

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

function requireAdmin(req, res, next) {
    const expected = process.env.ADMIN_DATABASE_TOKEN;
    const authorization = req.get("authorization") || "";

    if (!expected) {
        return res.sendStatus(404);
    }
    if (isProduction && !req.secure) {
        return res.status(403).send("HTTPS est obligatoire pour cette page.");
    }
    if (!authorization.startsWith("Basic ")) {
        res.set("WWW-Authenticate", 'Basic realm="LuxaFit admin", charset="UTF-8"');
        return res.status(401).send("Authentification administrateur requise.");
    }

    let supplied = "";
    try {
        const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
        const separator = decoded.indexOf(":");
        if (separator >= 0 && decoded.slice(0, separator) === "admin") {
            supplied = decoded.slice(separator + 1);
        }
    } catch (_) {
        return res.sendStatus(404);
    }

    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);
    if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
        return res.sendStatus(404);
    }

    next();
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

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

app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ success: true, status: "ok" });
    } catch (error) {
        console.error("Health check MySQL échoué :", error.message);
        res.status(503).json({ success: false, status: "unavailable" });
    }
});

/*
 * Synthèse du dashboard : les agrégats sont calculés côté serveur,
 * toujours à partir de l'identifiant de session (jamais depuis le client).
 * Fenêtre d'activité : 30 jours glissants selon l'heure MySQL.
 */
app.get("/api/dashboard/summary", requireLogin, async (req, res) => {
    const userId = Number(req.session.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({ success: false, message: "Session invalide." });
    }

    try {
        const [
            [performanceRows],
            [goalRows],
            [sessionRows],
            [runRows],
            [challengeRows],
            [weightRows]
        ] = await Promise.all([
            db.execute(
                "SELECT COUNT(*) AS total FROM performances WHERE user_id = ?",
                [userId]
            ),
            db.execute(
                "SELECT COUNT(*) AS total, SUM(statut = 'actif') AS active FROM goals WHERE user_id = ?",
                [userId]
            ),
            db.execute(
                `SELECT COUNT(*) AS total
                 FROM completed_sessions
                 WHERE user_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
                [userId]
            ),
            db.execute(
                `SELECT COUNT(*) AS total,
                        COALESCE(SUM(distance), 0) AS distance_km,
                        COALESCE(SUM(duree), 0) AS duration_seconds
                 FROM runs
                 WHERE user_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
                [userId]
            ),
            db.execute(
                `SELECT COUNT(*) AS total
                 FROM challenge_participants
                 WHERE user_id = ? AND statut = 'actif'`,
                [userId]
            ),
            db.execute(
                `SELECT poids, date
                 FROM body_measurements
                 WHERE user_id = ? AND poids IS NOT NULL AND poids > 0
                 ORDER BY date DESC, id DESC
                 LIMIT 1`,
                [userId]
            )
        ]);

        const number = value => Number(value || 0);
        res.set("Cache-Control", "no-store");
        return res.json({
            success: true,
            periodDays: 30,
            summary: {
                performances: number(performanceRows[0]?.total),
                goals: {
                    total: number(goalRows[0]?.total),
                    active: number(goalRows[0]?.active)
                },
                completedSessions30d: number(sessionRows[0]?.total),
                running30d: {
                    sessions: number(runRows[0]?.total),
                    distanceKm: Number(number(runRows[0]?.distance_km).toFixed(2)),
                    durationSeconds: number(runRows[0]?.duration_seconds)
                },
                activeChallenges: number(challengeRows[0]?.total),
                latestWeight: weightRows[0] ? {
                    value: Number(weightRows[0].poids),
                    date: weightRows[0].date
                } : null
            }
        });
    } catch (error) {
        console.error("Erreur synthèse dashboard :", error.message);
        return res.status(500).json({
            success: false,
            message: "Impossible de charger les statistiques du dashboard."
        });
    }
});

app.get(
    "/api/test-db",
    requireAdmin,
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
    registerRateLimit,
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
            typeof prenom !== "string" ||
            typeof nom !== "string" ||
            typeof password !== "string" ||
            !prenom.trim() ||
            !nom.trim() ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Tous les champs sont obligatoires."

            });

        }


        if (
            password.length < 10 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Le mot de passe doit contenir au moins 10 caractères et ne pas dépasser 72 octets UTF-8."

            });

        }


        try {

            const cleanPrenom =
                prenom.trim().replace(/\s+/g, " ");

            const cleanNom =
                nom.trim().replace(/\s+/g, " ");

            if (cleanPrenom.length > 50 || cleanNom.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: "Le prénom et le nom ne peuvent pas dépasser 50 caractères."
                });
            }


            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                const [existingUsers] = await connection.execute(
                    `SELECT id FROM users WHERE LOWER(prenom) = LOWER(?) AND LOWER(nom) = LOWER(?) LIMIT 1`,
                    [cleanPrenom, cleanNom]
                );

                if (existingUsers.length > 0) {
                    await connection.rollback();
                    return res.status(409).json({
                        success: false,
                        message: "Cet utilisateur existe déjà."
                    });
                }

                const passwordHash = await bcrypt.hash(password, 12);
                const [result] = await connection.execute(
                    `INSERT INTO users (prenom, nom, password_hash) VALUES (?, ?, ?)`,
                    [cleanPrenom, cleanNom, passwordHash]
                );

                await connection.execute(
                    `INSERT INTO profiles (user_id) VALUES (?)`,
                    [result.insertId]
                );

                await connection.commit();
                return res.status(201).json({
                    success: true,
                    message: "Compte créé avec succès !",
                    userId: result.insertId
                });
            } catch (transactionError) {
                await connection.rollback();
                throw transactionError;
            } finally {
                connection.release();
            }

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
    loginRateLimit,
    async (req, res) => {

        const {
            prenom,
            nom,
            password
        } = req.body;


        if (
            typeof prenom !== "string" ||
            typeof nom !== "string" ||
            typeof password !== "string" ||
            !prenom.trim() ||
            !nom.trim() ||
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
                        password_hash,
                        statut_compte
                     FROM users
                     WHERE LOWER(TRIM(prenom)) = LOWER(?)
                     AND LOWER(TRIM(nom)) = LOWER(?)`,

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

            if (user.statut_compte && user.statut_compte !== "actif") {
                return res.status(403).json({
                    success: false,
                    message: "Ce compte est désactivé. Contacte l'administrateur."
                });
            }

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


        if (date_naissance && !isValidDateOnly(date_naissance)) {
            return res.status(400).json({
                success: false,
                message: "La date de naissance est invalide."
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


        if (!isValidDateOnly(date)) {

            return res.status(400).json({

                success: false,

                message:
                    "Une date valide au format AAAA-MM-JJ est obligatoire."

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

            const connection = await db.getConnection();
            let result;
            try {
                await connection.beginTransaction();
                [result] = await connection.execute(
                    `INSERT INTO body_measurements
                     (user_id, date, poids, tour_taille, tour_bras, tour_cuisse, tour_mollet, tour_hanche, tour_torse)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        req.session.userId, date, cleanValues.poids,
                        cleanValues.tour_taille, cleanValues.tour_bras,
                        cleanValues.tour_cuisse, cleanValues.tour_mollet,
                        cleanValues.tour_hanche, cleanValues.tour_torse
                    ]
                );

                // Le profil reflète la dernière mesure de poids connue, pas
                // simplement la dernière mesure ajoutée. Une saisie rétroactive
                // ne doit donc jamais écraser un poids plus récent.
                if (cleanValues.poids !== null) {
                    const [latestWeightRows] = await connection.execute(
                        `SELECT date, id
                         FROM body_measurements
                         WHERE user_id = ? AND poids IS NOT NULL
                         ORDER BY date DESC, id DESC
                         LIMIT 1`,
                        [req.session.userId]
                    );
                    const shouldUpdateProfile = shouldSyncProfileWeight(
                        { date, id: result.insertId, poids: cleanValues.poids },
                        latestWeightRows[0] || null
                    );

                    if (shouldUpdateProfile) {
                        await connection.execute(
                            `INSERT INTO profiles (user_id, poids) VALUES (?, ?)
                             ON DUPLICATE KEY UPDATE poids = VALUES(poids)`,
                            [req.session.userId, cleanValues.poids]
                        );
                    }
                }
                await connection.commit();
            } catch (transactionError) {
                await connection.rollback();
                throw transactionError;
            } finally {
                connection.release();
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
            !isValidDateOnly(date)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Le type, la valeur et une date valide (AAAA-MM-JJ) sont obligatoires."

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
            !Number.isInteger(performanceId) || performanceId <= 0
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

        if (date_cible && !isValidDateOnly(date_cible)) {
            return res.status(400).json({
                success: false,
                message: "La date cible est invalide."
            });
        }


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
            !Number.isInteger(goalId) || goalId <= 0
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
            !Number.isInteger(goalId) || goalId <= 0
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
   17.5 TÂCHES DU CALENDRIER
   ========================================================= */

app.get(
    "/api/tasks",
    requireLogin,
    async (req, res) => {

        try {

            const [tasks] =
                await db.execute(
                    `SELECT
                        id,
                        titre,
                        description,
                        DATE_FORMAT(date_tache, '%Y-%m-%d') AS date_tache,
                        termine,
                        date_creation
                     FROM tasks
                     WHERE user_id = ?
                     ORDER BY date_tache ASC, id ASC`,
                    [req.session.userId]
                );

            res.json({
                success: true,
                tasks
            });

        } catch (error) {

            console.error("Erreur récupération tâches :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des tâches."
            });

        }

    }
);


app.post(
    "/api/tasks",
    requireLogin,
    async (req, res) => {

        const titre =
            typeof req.body.titre === "string"
                ? req.body.titre.trim()
                : "";

        const description =
            typeof req.body.description === "string"
                ? req.body.description.trim()
                : "";

        const dateTache =
            typeof req.body.date_tache === "string"
                ? req.body.date_tache
                : "";

        const parsedDate =
            /^\d{4}-\d{2}-\d{2}$/.test(dateTache)
                ? new Date(dateTache + "T00:00:00Z")
                : null;

        if (
            !titre ||
            titre.length > 180 ||
            !parsedDate ||
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== dateTache
        ) {

            return res.status(400).json({
                success: false,
                message: "Le titre et une date valide sont obligatoires."
            });

        }

        try {

            const [result] =
                await db.execute(
                    `INSERT INTO tasks
                        (user_id, titre, description, date_tache)
                     VALUES (?, ?, ?, ?)`,
                    [
                        req.session.userId,
                        titre,
                        description || null,
                        dateTache
                    ]
                );

            res.status(201).json({
                success: true,
                message: "Tâche ajoutée.",
                taskId: result.insertId
            });

        } catch (error) {

            console.error("Erreur ajout tâche :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de l'ajout de la tâche."
            });

        }

    }
);


app.put(
    "/api/tasks/:id",
    requireLogin,
    async (req, res) => {

        const taskId = Number(req.params.id);
        const termine = req.body.termine;

        if (typeof termine !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "Le statut de la tâche doit être un booléen."
            });
        }

        if (!Number.isInteger(taskId) || taskId <= 0) {

            return res.status(400).json({
                success: false,
                message: "ID de tâche invalide."
            });

        }

        try {

            const [result] =
                await db.execute(
                    `UPDATE tasks
                     SET termine = ?
                     WHERE id = ? AND user_id = ?`,
                    [
                        termine,
                        taskId,
                        req.session.userId
                    ]
                );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Tâche introuvable."
                });

            }

            res.json({
                success: true,
                message: termine
                    ? "Tâche terminée."
                    : "Tâche réouverte."
            });

        } catch (error) {

            console.error("Erreur modification tâche :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la modification de la tâche."
            });

        }

    }
);


app.delete(
    "/api/tasks/:id",
    requireLogin,
    async (req, res) => {

        const taskId = Number(req.params.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {

            return res.status(400).json({
                success: false,
                message: "ID de tâche invalide."
            });

        }

        try {

            const [result] =
                await db.execute(
                    `DELETE FROM tasks
                     WHERE id = ? AND user_id = ?`,
                    [
                        taskId,
                        req.session.userId
                    ]
                );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Tâche introuvable."
                });

            }

            res.json({
                success: true,
                message: "Tâche supprimée."
            });

        } catch (error) {

            console.error("Erreur suppression tâche :", error);

            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression de la tâche."
            });

        }

    }
);

/* =========================================================
   17.6 QUESTIONNAIRE COMPLET
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

            if (date && !isValidDateOnly(date)) {
                throw validationError("La date du questionnaire est invalide.");
            }
            if (date_naissance && !isValidDateOnly(date_naissance)) {
                throw validationError("La date de naissance est invalide.");
            }

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


            if (cleanBodyValues.poids !== null) {
                await connection.execute(
                    `INSERT INTO profiles (user_id, poids) VALUES (?, ?)
                     ON DUPLICATE KEY UPDATE poids = VALUES(poids)`,
                    [userId, cleanBodyValues.poids]
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
    requireAdmin,
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
                        `SELECT * FROM \`${tableName}\` LIMIT 100`
                    );

                const hiddenColumns = new Set([
                    "password_hash", "mot_de_passe", "access_token", "refresh_token",
                    "token", "secret", "session_id", "api_key", "private_key",
                    "client_secret", "authorization", "cookie"
                ]);
                const safeRows = rows.map(row => {
                    const safe = {};
                    for (const [key, value] of Object.entries(row)) {
                        if (!hiddenColumns.has(key.toLowerCase())) safe[key] = value;
                    }
                    return safe;
                });


                html += `

                    <h2>
                        ${escapeHtml(tableName)}
                    </h2>

                `;


                if (
                    safeRows.length === 0
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
                    safeRows[0]
                ).forEach(
                    column => {

                        html += `

                            <th>
                                ${escapeHtml(column)}
                            </th>

                        `;

                    }
                );


                html += `

                                </tr>

                            </thead>

                            <tbody>

                `;


                safeRows.forEach(
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
                                        ${escapeHtml(value instanceof Date ? value.toISOString() : value)}
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


            res.set({
                "Cache-Control": "no-store, private",
                "X-Content-Type-Options": "nosniff",
                "Referrer-Policy": "no-referrer"
            });
            res.send(html);

        } catch (error) {

            console.error(
                "Erreur lecture BDD :",
                error
            );

            res.status(500).send(`
                <h1>Erreur lors de la lecture de la BDD</h1>
                <p>Une erreur interne est survenue. Consulte les journaux du serveur.</p>
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

        console.error("Erreur serveur :", error);
        const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
            ? error.status
            : 500;
        res.status(status).json({
            success: false,
            message: status === 413
                ? "La requête est trop volumineuse."
                : status === 400
                    ? "La requête envoyée est invalide."
                    : "Une erreur serveur est survenue."
        });

    }
);


/* =========================================================
   21. DÉMARRAGE
   ========================================================= */

const server = app.listen(
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

// Arrêt propre : termine les requêtes HTTP en cours puis ferme le pool MySQL.
async function shutdown(signal) {
    console.log(`${signal} reçu : arrêt de LUXA_FIT...`);
    server.close(async () => {
        try {
            await db.end();
            process.exit(0);
        } catch (error) {
            console.error("Erreur fermeture MySQL :", error.message);
            process.exit(1);
        }
    });
    setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
