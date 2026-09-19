const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
const PORT = 3000;

// Permet de recevoir les données JSON
app.use(express.json());

// Permet de servir les fichiers HTML, CSS et JS
app.use(express.static(__dirname));

// Page principale
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ========================================
// TEST DE LA CONNEXION MYSQL
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

    const { prenom, nom, password } = req.body;

    // Vérifier que les champs sont remplis
    if (!prenom || !nom || !password) {

        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires."
        });

    }

    try {

        // Vérifier si le prénom + nom existe déjà
        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE prenom = ? AND nom = ?",
            [prenom, nom]
        );

        if (existingUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Cet utilisateur existe déjà."
            });

        }

        // Sécuriser le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

        // Ajouter l'utilisateur dans MySQL
        await db.execute(
            "INSERT INTO users (prenom, nom, password_hash) VALUES (?, ?, ?)",
            [prenom, nom, passwordHash]
        );

        res.json({
            success: true,
            message: "Compte créé avec succès !"
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

    const { prenom, nom, password } = req.body;

    // Vérifier les champs
    if (!prenom || !nom || !password) {

        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires."
        });

    }

    try {

        // Chercher l'utilisateur dans MySQL
        const [users] = await db.execute(
            "SELECT * FROM users WHERE prenom = ? AND nom = ?",
            [prenom, nom]
        );

        // Utilisateur inexistant
        if (users.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Nom ou mot de passe incorrect."
            });

        }

        const user = users[0];

        // Vérifier le mot de passe avec bcrypt
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

        // Connexion réussie
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
// LANCEMENT DU SERVEUR
// ========================================

app.listen(PORT, () => {

    console.log(`Serveur lancé sur http://localhost:${PORT}`);

});