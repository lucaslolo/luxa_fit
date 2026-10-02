require("dotenv").config();

const mysql = require("mysql2/promise");

/* =========================================================
   CONNEXION MYSQL
   ========================================================= */

async function createTables() {

    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,

        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log("Connexion MySQL réussie.");


    /* =========================================================
       1. TABLE USERS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,

            prenom VARCHAR(50) NOT NULL,

            nom VARCHAR(50) NOT NULL,

            email VARCHAR(255) NULL,

            password_hash VARCHAR(255) NOT NULL,

            date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            derniere_connexion TIMESTAMP NULL DEFAULT NULL,

            statut_compte ENUM(
                'actif',
                'suspendu',
                'supprime'
            ) DEFAULT 'actif'
        )
    `);

    console.log("✓ Table users");


    /* =========================================================
       MIGRATION DE TON ANCIEN USERS
       ========================================================= */

    await addColumnIfNotExists(
        db,
        "users",
        "email",
        "VARCHAR(255) NULL"
    );

    await addColumnIfNotExists(
        db,
        "users",
        "date_inscription",
        "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    );

    await addColumnIfNotExists(
        db,
        "users",
        "derniere_connexion",
        "TIMESTAMP NULL DEFAULT NULL"
    );

    await addColumnIfNotExists(
        db,
        "users",
        "statut_compte",
        "ENUM('actif','suspendu','supprime') DEFAULT 'actif'"
    );


    /* =========================================================
       2. TABLE PROFILES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL UNIQUE,

            date_naissance DATE NULL,

            sexe ENUM(
                'homme',
                'femme',
                'autre'
            ) NULL,

            taille DECIMAL(5,2) NULL,

            poids DECIMAL(5,2) NULL,

            niveau ENUM(
                'debutant',
                'intermediaire',
                'avance'
            ) NULL,

            objectif_principal VARCHAR(100) NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table profiles");


    /* =========================================================
       3. DISCIPLINES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS disciplines (
            id INT AUTO_INCREMENT PRIMARY KEY,

            nom VARCHAR(100) NOT NULL UNIQUE,

            description TEXT NULL
        )
    `);

    console.log("✓ Table disciplines");


    /* =========================================================
       4. TRAINING TYPES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS training_types (
            id INT AUTO_INCREMENT PRIMARY KEY,

            discipline_id INT NOT NULL,

            nom VARCHAR(100) NOT NULL,

            description TEXT NULL,

            UNIQUE KEY unique_training_type (
                discipline_id,
                nom
            ),

            FOREIGN KEY (discipline_id)
                REFERENCES disciplines(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table training_types");


    /* =========================================================
       5. PROGRAMS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS programs (
            id INT AUTO_INCREMENT PRIMARY KEY,

            training_type_id INT NOT NULL,

            nom VARCHAR(150) NOT NULL,

            description TEXT NULL,

            niveau ENUM(
                'debutant',
                'intermediaire',
                'avance',
                'tous'
            ) DEFAULT 'tous',

            duree_semaines INT NOT NULL DEFAULT 4,

            seances_semaine INT NULL,

            objectif VARCHAR(255) NULL,

            date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (training_type_id)
                REFERENCES training_types(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table programs");


    /* =========================================================
       6. PROGRAM WEEKS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS program_weeks (
            id INT AUTO_INCREMENT PRIMARY KEY,

            program_id INT NOT NULL,

            numero_semaine INT NOT NULL,

            objectif VARCHAR(255) NULL,

            deload BOOLEAN DEFAULT FALSE,

            UNIQUE KEY unique_program_week (
                program_id,
                numero_semaine
            ),

            FOREIGN KEY (program_id)
                REFERENCES programs(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table program_weeks");


    /* =========================================================
       7. SESSIONS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,

            program_week_id INT NOT NULL,

            nom VARCHAR(150) NOT NULL,

            type VARCHAR(100) NULL,

            duree INT NULL,

            description TEXT NULL,

            FOREIGN KEY (program_week_id)
                REFERENCES program_weeks(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table sessions");


    /* =========================================================
       8. EXERCISES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS exercises (
            id INT AUTO_INCREMENT PRIMARY KEY,

            nom VARCHAR(150) NOT NULL,

            categorie VARCHAR(100) NULL,

            description TEXT NULL,

            materiel VARCHAR(255) NULL,

            muscle_principal VARCHAR(100) NULL,

            niveau VARCHAR(50) NULL,

            video_url VARCHAR(500) NULL
        )
    `);

    console.log("✓ Table exercises");


    /* =========================================================
       9. SESSION EXERCISES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS session_exercises (
            id INT AUTO_INCREMENT PRIMARY KEY,

            session_id INT NOT NULL,

            exercise_id INT NOT NULL,

            ordre INT NOT NULL DEFAULT 1,

            series INT NULL,

            repetitions VARCHAR(50) NULL,

            charge DECIMAL(8,2) NULL,

            distance DECIMAL(10,2) NULL,

            duree INT NULL,

            repos INT NULL,

            rpe DECIMAL(3,1) NULL,

            FOREIGN KEY (session_id)
                REFERENCES sessions(id)
                ON DELETE CASCADE,

            FOREIGN KEY (exercise_id)
                REFERENCES exercises(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table session_exercises");


    /* =========================================================
       10. PROGRAM FOLLOWERS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS program_followers (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            program_id INT NOT NULL,

            date_debut DATE NOT NULL,

            date_fin DATE NULL,

            semaine_actuelle INT DEFAULT 1,

            progression DECIMAL(5,2) DEFAULT 0,

            statut ENUM(
                'actif',
                'termine',
                'abandonne'
            ) DEFAULT 'actif',

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (program_id)
                REFERENCES programs(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table program_followers");


    /* =========================================================
       11. PERFORMANCE TYPES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS performance_types (
            id INT AUTO_INCREMENT PRIMARY KEY,

            nom VARCHAR(100) NOT NULL UNIQUE,

            categorie VARCHAR(100) NULL,

            unite VARCHAR(50) NULL
        )
    `);

    console.log("✓ Table performance_types");


    /* =========================================================
       12. PERFORMANCES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS performances (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            performance_type_id INT NULL,

            type VARCHAR(100) NOT NULL,

            value DECIMAL(10,2) NOT NULL,

            unit VARCHAR(50) NULL,

            date DATE NOT NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            commentaire TEXT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table performances");


    /* =========================================================
       MIGRATION DE TON ANCIEN PERFORMANCES
       ========================================================= */

    await modifyColumnIfExists(
        db,
        "performances",
        "type",
        "VARCHAR(100) NOT NULL"
    );

    await addColumnIfNotExists(
        db,
        "performances",
        "performance_type_id",
        "INT NULL"
    );

    await addColumnIfNotExists(
        db,
        "performances",
        "unit",
        "VARCHAR(50) NULL"
    );

    await addColumnIfNotExists(
        db,
        "performances",
        "commentaire",
        "TEXT NULL"
    );


    /* =========================================================
       AJOUT DE LA FOREIGN KEY PERFORMANCE TYPE
       ========================================================= */

    await addForeignKeyIfNotExists(
        db,
        "performances",
        "fk_performances_type",
        "performance_type_id",
        "performance_types",
        "id"
    );


    /* =========================================================
       13. COMPLETED SESSIONS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS completed_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            session_id INT NOT NULL,

            date DATETIME DEFAULT CURRENT_TIMESTAMP,

            duree INT NULL,

            rpe DECIMAL(3,1) NULL,

            calories INT NULL,

            commentaire TEXT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (session_id)
                REFERENCES sessions(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table completed_sessions");


    /* =========================================================
       14. COMPLETED EXERCISES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS completed_exercises (
            id INT AUTO_INCREMENT PRIMARY KEY,

            completed_session_id INT NOT NULL,

            exercise_id INT NOT NULL,

            series INT NULL,

            repetitions INT NULL,

            charge DECIMAL(8,2) NULL,

            distance DECIMAL(10,2) NULL,

            duree INT NULL,

            commentaire TEXT NULL,

            FOREIGN KEY (completed_session_id)
                REFERENCES completed_sessions(id)
                ON DELETE CASCADE,

            FOREIGN KEY (exercise_id)
                REFERENCES exercises(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table completed_exercises");


    /* =========================================================
       15. RUNS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS runs (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            date DATETIME DEFAULT CURRENT_TIMESTAMP,

            type_course ENUM(
                'facile',
                'tempo',
                'fractionne',
                'longue',
                'competition',
                'hyrox',
                'autre'
            ) DEFAULT 'autre',

            distance DECIMAL(8,2) NOT NULL,

            duree INT NOT NULL,

            allure DECIMAL(6,2) NULL,

            vitesse DECIMAL(6,2) NULL,

            denivele INT NULL,

            frequence_cardiaque INT NULL,

            calories INT NULL,

            commentaire TEXT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table runs");


    /* =========================================================
       16. GOALS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS goals (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            type VARCHAR(100) NOT NULL,

            nom VARCHAR(150) NOT NULL,

            valeur_cible DECIMAL(10,2) NULL,

            valeur_actuelle DECIMAL(10,2) NULL,

            unite VARCHAR(50) NULL,

            date_cible DATE NULL,

            statut ENUM(
                'actif',
                'atteint',
                'abandonne'
            ) DEFAULT 'actif',

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table goals");


    /* =========================================================
       17. BODY MEASUREMENTS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS body_measurements (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            date DATE NOT NULL,

            poids DECIMAL(5,2) NULL,

            tour_taille DECIMAL(5,2) NULL,

            tour_bras DECIMAL(5,2) NULL,

            tour_cuisse DECIMAL(5,2) NULL,

            tour_mollet DECIMAL(5,2) NULL,

            tour_hanche DECIMAL(5,2) NULL,

            tour_torse DECIMAL(5,2) NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table body_measurements");


    /* =========================================================
       18. FOODS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS foods (
            id INT AUTO_INCREMENT PRIMARY KEY,

            nom VARCHAR(150) NOT NULL,

            calories_100g DECIMAL(8,2) NOT NULL DEFAULT 0,

            proteines_100g DECIMAL(8,2) NOT NULL DEFAULT 0,

            glucides_100g DECIMAL(8,2) NOT NULL DEFAULT 0,

            lipides_100g DECIMAL(8,2) NOT NULL DEFAULT 0,

            fibres_100g DECIMAL(8,2) NOT NULL DEFAULT 0
        )
    `);

    console.log("✓ Table foods");


    /* =========================================================
       19. MEALS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS meals (
            id INT AUTO_INCREMENT PRIMARY KEY,

            nom VARCHAR(150) NOT NULL,

            type_repas VARCHAR(100) NULL,

            description TEXT NULL
        )
    `);

    console.log("✓ Table meals");


    /* =========================================================
       20. MEAL FOODS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS meal_foods (
            id INT AUTO_INCREMENT PRIMARY KEY,

            meal_id INT NOT NULL,

            food_id INT NOT NULL,

            quantite DECIMAL(8,2) NOT NULL,

            UNIQUE KEY unique_meal_food (
                meal_id,
                food_id
            ),

            FOREIGN KEY (meal_id)
                REFERENCES meals(id)
                ON DELETE CASCADE,

            FOREIGN KEY (food_id)
                REFERENCES foods(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table meal_foods");


    /* =========================================================
       21. NUTRITION PLANS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS nutrition_plans (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            objectif VARCHAR(100) NULL,

            calories INT NULL,

            proteines DECIMAL(8,2) NULL,

            glucides DECIMAL(8,2) NULL,

            lipides DECIMAL(8,2) NULL,

            nombre_repas INT NULL,

            date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table nutrition_plans");


    /* =========================================================
       22. PLAN MEALS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS plan_meals (
            id INT AUTO_INCREMENT PRIMARY KEY,

            plan_id INT NOT NULL,

            meal_id INT NOT NULL,

            jour INT NULL,

            moment VARCHAR(100) NULL,

            quantite DECIMAL(8,2) NULL,

            FOREIGN KEY (plan_id)
                REFERENCES nutrition_plans(id)
                ON DELETE CASCADE,

            FOREIGN KEY (meal_id)
                REFERENCES meals(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table plan_meals");


    /* =========================================================
       23. SLEEP LOGS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS sleep_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            date DATE NOT NULL,

            heure_coucher TIME NULL,

            heure_lever TIME NULL,

            duree DECIMAL(4,2) NULL,

            qualite INT NULL,

            commentaire TEXT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table sleep_logs");


    /* =========================================================
       24. MINDSET LOGS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS mindset_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            date DATE NOT NULL,

            humeur INT NULL,

            motivation INT NULL,

            stress INT NULL,

            fatigue INT NULL,

            note TEXT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table mindset_logs");


    /* =========================================================
       25. EXTERNAL CONNECTIONS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS external_connections (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            plateforme VARCHAR(100) NOT NULL,

            external_user_id VARCHAR(255) NULL,

            access_token TEXT NULL,

            refresh_token TEXT NULL,

            date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE KEY unique_user_platform (
                user_id,
                plateforme
            ),

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table external_connections");


    /* =========================================================
       26. CHALLENGES
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS challenges (
            id INT AUTO_INCREMENT PRIMARY KEY,

            nom VARCHAR(150) NOT NULL,

            description TEXT NULL,

            objectif VARCHAR(255) NULL,

            date_debut DATE NULL,

            date_fin DATE NULL
        )
    `);

    console.log("✓ Table challenges");


    /* =========================================================
       27. CHALLENGE PARTICIPANTS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS challenge_participants (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            challenge_id INT NOT NULL,

            progression DECIMAL(10,2) DEFAULT 0,

            statut ENUM(
                'actif',
                'termine',
                'abandonne'
            ) DEFAULT 'actif',

            date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE KEY unique_challenge_user (
                user_id,
                challenge_id
            ),

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (challenge_id)
                REFERENCES challenges(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table challenge_participants");


    /* =========================================================
       28. NOTIFICATIONS
       ========================================================= */

    await db.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,

            user_id INT NOT NULL,

            titre VARCHAR(255) NOT NULL,

            message TEXT NOT NULL,

            type VARCHAR(100) NULL,

            lu BOOLEAN DEFAULT FALSE,

            date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("✓ Table notifications");


    /* =========================================================
       SEED — DISCIPLINES
       ========================================================= */

    await db.execute(`
        INSERT IGNORE INTO disciplines
            (nom, description)
        VALUES
            (
                'Musculation',
                'Programmes de musculation et développement de la force'
            ),
            (
                'Course à pied',
                'Programmes pour progresser en course à pied'
            ),
            (
                'HYROX',
                'Préparation spécifique aux compétitions HYROX'
            ),
            (
                'Entraînement hybride',
                'Combinaison de force, course et endurance'
            )
    `);

    console.log("✓ Disciplines ajoutées");


    /* =========================================================
       SEED — TRAINING TYPES
       ========================================================= */

    await db.execute(`
        INSERT IGNORE INTO training_types
            (discipline_id, nom, description)

        SELECT
            id,
            'Remise en forme',
            'Reprendre progressivement l entraînement et améliorer la condition physique'

        FROM disciplines
        WHERE nom = 'Musculation'
    `);

    await db.execute(`
        INSERT IGNORE INTO training_types
            (discipline_id, nom, description)

        SELECT
            id,
            'Bodybuilding',
            'Développement musculaire et hypertrophie'

        FROM disciplines
        WHERE nom = 'Musculation'
    `);

    await db.execute(`
        INSERT IGNORE INTO training_types
            (discipline_id, nom, description)

        SELECT
            id,
            'Powerlifting',
            'Développement de la force sur squat, bench et deadlift'

        FROM disciplines
        WHERE nom = 'Musculation'
    `);

    await db.execute(`
        INSERT IGNORE INTO training_types
            (discipline_id, nom, description)

        SELECT
            id,
            'Powerbuilding',
            'Combinaison de force et hypertrophie'

        FROM disciplines
        WHERE nom = 'Musculation'
    `);

    console.log("✓ Types de musculation ajoutés");


    /* =========================================================
       SEED — PERFORMANCE TYPES
       ========================================================= */

    const performanceTypes = [

        ["poids", "Mensurations", "kg"],
        ["taille", "Mensurations", "cm"],
        ["tour_de_taille", "Mensurations", "cm"],
        ["tour_de_hanche", "Mensurations", "cm"],
        ["tour_de_bras", "Mensurations", "cm"],
        ["tour_de_cuisse", "Mensurations", "cm"],
        ["tour_de_mollet", "Mensurations", "cm"],
        ["tour_de_torse", "Mensurations", "cm"],

        ["bench_actuel", "Powerlifting", "kg"],
        ["squat_actuel", "Powerlifting", "kg"],
        ["deadlift_actuel", "Powerlifting", "kg"],

        ["hyrox solo open homme", "HYROX", "min"],
        ["hyrox solo pro homme", "HYROX", "min"],
        ["hyrox solo open femme", "HYROX", "min"],
        ["hyrox solo pro femme", "HYROX", "min"],
        ["hyrox mixte", "HYROX", "min"],
        ["hyrox homme/homme", "HYROX", "min"],
        ["hyrox femme/femme", "HYROX", "min"],

        ["course_5km", "Course à pied", "min"],
        ["course_10km", "Course à pied", "min"],
        ["course_21km", "Course à pied", "min"],
        ["course_42km", "Course à pied", "min"],
        ["course_km_semaine", "Course à pied", "km"]
    ];


    for (const [nom, categorie, unite] of performanceTypes) {

        await db.execute(
            `
            INSERT IGNORE INTO performance_types
                (nom, categorie, unite)
            VALUES (?, ?, ?)
            `,
            [nom, categorie, unite]
        );

    }

    console.log("✓ Types de performances ajoutés");


    /* =========================================================
       FIN
       ========================================================= */

    console.log("");
    console.log("==========================================");
    console.log("   BASE DE DONNÉES LUXA_FIT TERMINÉE");
    console.log("==========================================");
    console.log("");
    console.log("Les tables existantes ont été conservées.");
    console.log("Les nouvelles tables ont été créées.");
    console.log("Les migrations nécessaires ont été appliquées.");
    console.log("");


    await db.end();
}


/* =========================================================
   FONCTION : AJOUTER UNE COLONNE SI ELLE N'EXISTE PAS
   ========================================================= */

async function addColumnIfNotExists(
    db,
    tableName,
    columnName,
    definition
) {

    const [rows] = await db.execute(
        `
        SELECT COUNT(*) AS count
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
        `,
        [
            process.env.DB_NAME,
            tableName,
            columnName
        ]
    );

    if (rows[0].count === 0) {

        await db.execute(`
            ALTER TABLE \`${tableName}\`
            ADD COLUMN \`${columnName}\` ${definition}
        `);

        console.log(
            `  + Colonne ${tableName}.${columnName} ajoutée`
        );
    }
}


/* =========================================================
   FONCTION : MODIFIER UNE COLONNE
   ========================================================= */

async function modifyColumnIfExists(
    db,
    tableName,
    columnName,
    definition
) {

    const [rows] = await db.execute(
        `
        SELECT COUNT(*) AS count
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
        `,
        [
            process.env.DB_NAME,
            tableName,
            columnName
        ]
    );

    if (rows[0].count > 0) {

        try {

            await db.execute(`
                ALTER TABLE \`${tableName}\`
                MODIFY COLUMN \`${columnName}\` ${definition}
            `);

            console.log(
                `  ✓ Colonne ${tableName}.${columnName} vérifiée`
            );

        } catch (error) {

            console.log(
                `  ! Impossible de modifier ${tableName}.${columnName} : ${error.message}`
            );

        }
    }
}


/* =========================================================
   FONCTION : AJOUTER UNE FOREIGN KEY SI ELLE N'EXISTE PAS
   ========================================================= */

async function addForeignKeyIfNotExists(
    db,
    tableName,
    constraintName,
    columnName,
    referencedTable,
    referencedColumn
) {

    const [rows] = await db.execute(
        `
        SELECT COUNT(*) AS count
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = ?
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
        `,
        [
            process.env.DB_NAME,
            tableName,
            constraintName
        ]
    );

    if (rows[0].count === 0) {

        try {

            await db.execute(`
                ALTER TABLE \`${tableName}\`
                ADD CONSTRAINT \`${constraintName}\`
                FOREIGN KEY (\`${columnName}\`)
                REFERENCES \`${referencedTable}\`(\`${referencedColumn}\`)
                ON DELETE SET NULL
            `);

            console.log(
                `  + Foreign key ${constraintName} ajoutée`
            );

        } catch (error) {

            console.log(
                `  ! Foreign key ${constraintName} non ajoutée : ${error.message}`
            );

        }
    }
}


/* =========================================================
   LANCEMENT
   ========================================================= */

createTables()
    .catch(error => {

        console.error("");
        console.error("==========================================");
        console.error("        ERREUR MYSQL");
        console.error("==========================================");
        console.error("");
        console.error(error);
        console.error("");

    });