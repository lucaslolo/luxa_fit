/* =========================================================
   LUXA_FIT — PROGRAMME HYROX PERSONNALISÉ
   ========================================================= */


/* =========================================================
   1. OUTILS
   ========================================================= */

function parseDuration(value) {
    if (!value) return 0;

    const parts = value.trim().split(":").map(Number);

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
}


function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
}


/* =========================================================
   2. CRÉATION DU QUESTIONNAIRE
   ========================================================= */

function createQuestionnaire() {

    const section = document.createElement("section");

    section.className = "section hyrox-questionnaire";

    section.innerHTML = `

        <div class="section-header">
            <h2>Ton profil HYROX</h2>
            <span class="home-label">PROGRAMME PERSONNALISÉ</span>
        </div>

        <form id="hyroxForm">

            <div class="form-group">
                <label>Objectif</label>

                <select id="goal" required>
                    <option value="">Choisir</option>
                    <option value="finish">Finir mon premier HYROX</option>
                    <option value="130">Sous 1h30</option>
                    <option value="120">Sous 1h20</option>
                    <option value="115">Sous 1h15</option>
                    <option value="110">Sous 1h10</option>
                    <option value="custom">Objectif personnalisé</option>
                </select>
            </div>


            <div class="form-group">
                <label>Nombre de séances par semaine</label>

                <select id="sessions" required>
                    <option value="">Choisir</option>
                    <option value="3">3 séances</option>
                    <option value="4">4 séances</option>
                    <option value="5">5 séances</option>
                    <option value="6">6 séances</option>
                </select>
            </div>


            <div class="form-group">
                <label>Temps récent sur 5 km</label>

                <input
                    type="text"
                    id="run5k"
                    placeholder="Exemple : 20:30"
                    required
                >
            </div>


            <div class="form-group">
                <label>Temps récent sur 10 km</label>

                <input
                    type="text"
                    id="run10k"
                    placeholder="Exemple : 43:30"
                >
            </div>


            <div class="form-group">
                <label>Kilomètres par semaine</label>

                <input
                    type="number"
                    id="weeklyKm"
                    min="0"
                    placeholder="Exemple : 30"
                    required
                >
            </div>


            <div class="form-group">
                <label>Séances de course par semaine</label>

                <select id="runningSessions">
                    <option value="1">1</option>
                    <option value="2" selected>2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                </select>
            </div>


            <div class="form-group">
                <label>Squat 1RM</label>

                <input
                    type="number"
                    id="squat"
                    min="0"
                    placeholder="kg — optionnel"
                >
            </div>


            <div class="form-group">
                <label>Deadlift 1RM</label>

                <input
                    type="number"
                    id="deadlift"
                    min="0"
                    placeholder="kg — optionnel"
                >
            </div>


            <div class="form-group">
                <label>Bench press 1RM</label>

                <input
                    type="number"
                    id="bench"
                    min="0"
                    placeholder="kg — optionnel"
                >
            </div>


            <div class="form-group">
                <label>Tractions strictes maximum</label>

                <input
                    type="number"
                    id="pullups"
                    min="0"
                    placeholder="Exemple : 12"
                >
            </div>


            <div class="form-group">
                <label>Expérience HYROX</label>

                <select id="hyroxExperience">
                    <option value="none">Jamais</option>
                    <option value="beginner">Débutant</option>
                    <option value="regular">Régulier</option>
                    <option value="advanced">Compétiteur</option>
                </select>
            </div>


            <div class="form-group">
                <label>Meilleur temps HYROX</label>

                <input
                    type="text"
                    id="hyroxTime"
                    placeholder="Exemple : 1:25:00 — optionnel"
                >
            </div>


            <div class="form-group">
                <label>Wall Balls</label>

                <select id="wallBalls">
                    <option value="weak">Moins de 20 unbroken</option>
                    <option value="medium">20–40 unbroken</option>
                    <option value="good">40–60 unbroken</option>
                    <option value="verygood">60–80 unbroken</option>
                    <option value="excellent">80+ unbroken</option>
                </select>
            </div>


            <div class="form-group">
                <label>Sled Push</label>

                <select id="sledPush">
                    <option value="weak">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="good">Bon</option>
                    <option value="verygood">Très bon</option>
                </select>
            </div>


            <div class="form-group">
                <label>Sled Pull</label>

                <select id="sledPull">
                    <option value="weak">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="good">Bon</option>
                    <option value="verygood">Très bon</option>
                </select>
            </div>


            <div class="form-group">
                <label>Burpee Broad Jumps</label>

                <select id="burpees">
                    <option value="weak">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="good">Bon</option>
                    <option value="verygood">Très bon</option>
                </select>
            </div>


            <div class="form-group">
                <label>Farmers Carry</label>

                <select id="farmers">
                    <option value="weak">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="good">Bon</option>
                    <option value="verygood">Très bon</option>
                </select>
            </div>


            <div class="form-group">
                <label>Sandbag Lunges</label>

                <select id="lunges">
                    <option value="weak">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="good">Bon</option>
                    <option value="verygood">Très bon</option>
                </select>
            </div>


            <button type="submit" class="week-btn">
                Générer mon programme
            </button>

        </form>


        <div id="athleteProfile"></div>

    `;

    const sectionSelector = document.querySelector(".section");

    if (sectionSelector) {
        sectionSelector.before(section);
    }

    document
        .getElementById("hyroxForm")
        .addEventListener("submit", generatePersonalizedProgram);
}


/* =========================================================
   3. CALCUL DU NIVEAU RUNNING
   ========================================================= */

function calculateRunningLevel(seconds5k) {

    if (!seconds5k) {
        return "intermediaire";
    }

    if (seconds5k < 1140) {
        return "avance";
    }

    if (seconds5k < 1320) {
        return "intermediaire";
    }

    return "debutant";
}


/* =========================================================
   4. CALCUL DE L'ALLURE 5 KM
   ========================================================= */

function calculatePace(seconds5k) {

    if (!seconds5k) {
        return 300;
    }

    return seconds5k / 5;
}


function paceToString(secondsPerKm) {

    const minutes = Math.floor(secondsPerKm / 60);

    const seconds = Math.round(secondsPerKm % 60);

    return `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}/km`;
}


/* =========================================================
   5. CALCUL DU NIVEAU FORCE
   ========================================================= */

function calculateStrengthLevel(squat, deadlift) {

    if (!squat || !deadlift) {
        return "inconnu";
    }

    const total = squat + deadlift;

    if (total >= 350) {
        return "avance";
    }

    if (total >= 250) {
        return "intermediaire";
    }

    return "debutant";
}


/* =========================================================
   6. IDENTIFICATION DES POINTS FAIBLES
   ========================================================= */

function findWeakPoints(profile) {

    const weaknesses = [];

    if (profile.wallBalls === "weak") {
        weaknesses.push("Wall Balls");
    }

    if (profile.sledPush === "weak") {
        weaknesses.push("Sled Push");
    }

    if (profile.sledPull === "weak") {
        weaknesses.push("Sled Pull");
    }

    if (profile.burpees === "weak") {
        weaknesses.push("Burpee Broad Jumps");
    }

    if (profile.farmers === "weak") {
        weaknesses.push("Farmers Carry");
    }

    if (profile.lunges === "weak") {
        weaknesses.push("Sandbag Lunges");
    }

    return weaknesses;
}


/* =========================================================
   7. CONSTRUCTION DU PROFIL
   ========================================================= */

function getProfile() {

    const seconds5k = parseDuration(
        document.getElementById("run5k").value
    );

    const seconds10k = parseDuration(
        document.getElementById("run10k").value
    );

    const profile = {

        goal:
            document.getElementById("goal").value,

        sessions:
            Number(document.getElementById("sessions").value),

        run5k:
            seconds5k,

        run10k:
            seconds10k,

        weeklyKm:
            Number(document.getElementById("weeklyKm").value),

        runningSessions:
            Number(document.getElementById("runningSessions").value),

        squat:
            Number(document.getElementById("squat").value) || 0,

        deadlift:
            Number(document.getElementById("deadlift").value) || 0,

        bench:
            Number(document.getElementById("bench").value) || 0,

        pullups:
            Number(document.getElementById("pullups").value) || 0,

        hyroxExperience:
            document.getElementById("hyroxExperience").value,

        hyroxTime:
            parseDuration(
                document.getElementById("hyroxTime").value
            ),

        wallBalls:
            document.getElementById("wallBalls").value,

        sledPush:
            document.getElementById("sledPush").value,

        sledPull:
            document.getElementById("sledPull").value,

        burpees:
            document.getElementById("burpees").value,

        farmers:
            document.getElementById("farmers").value,

        lunges:
            document.getElementById("lunges").value
    };


    profile.runningLevel =
        calculateRunningLevel(profile.run5k);

    profile.strengthLevel =
        calculateStrengthLevel(
            profile.squat,
            profile.deadlift
        );

    profile.runningPace =
        calculatePace(profile.run5k);

    profile.weakPoints =
        findWeakPoints(profile);


    return profile;
}


/* =========================================================
   8. AFFICHAGE DU PROFIL
   ========================================================= */

function displayProfile(profile) {

    const container =
        document.getElementById("athleteProfile");

    if (!container) return;

    const weaknesses =
        profile.weakPoints.length > 0
            ? profile.weakPoints.join(", ")
            : "Aucun point faible majeur détecté";


    container.innerHTML = `

        <div class="program-stat">
            <span>Niveau running</span>
            <strong>${profile.runningLevel}</strong>
        </div>

        <div class="program-stat">
            <span>Niveau force</span>
            <strong>${profile.strengthLevel}</strong>
        </div>

        <div class="program-stat">
            <span>Allure de référence</span>
            <strong>${paceToString(profile.runningPace)}</strong>
        </div>

        <div class="program-stat">
            <span>Points faibles</span>
            <strong>${weaknesses}</strong>
        </div>

    `;
}


/* =========================================================
   9. GÉNÉRATION DU PROGRAMME
   ========================================================= */

function generatePersonalizedProgram(event) {

    event.preventDefault();

    const profile = getProfile();

    displayProfile(profile);

    window.hyroxProfile = profile;

    buildPrograms(profile);

    showWeek(1);
}


/* =========================================================
   10. PROGRAMME PERSONNALISÉ
   ========================================================= */

let programs = {};


function buildPrograms(profile) {

    programs = {};

    for (let week = 1; week <= 18; week++) {

        const phase = getPhase(week);

        programs[week] =
            createWeek(profile, week, phase);
    }

    createWeekButtons();
}


/* =========================================================
   11. PHASES
   ========================================================= */

function getPhase(week) {

    if (week <= 4) {
        return "Phase 1 — Base";
    }

    if (week <= 8) {
        return "Phase 2 — Développement";
    }

    if (week <= 13) {
        return "Phase 3 — Spécifique HYROX";
    }

    if (week <= 16) {
        return "Phase 4 — Performance";
    }

    if (week === 17) {
        return "Phase 5 — Peak";
    }

    return "Phase 6 — Taper";
}


/* =========================================================
   12. CRÉATION D'UNE SEMAINE
   ========================================================= */

function createWeek(profile, week, phase) {

    const days = [];

    const isDeload =
        week === 4 ||
        week === 8 ||
        week === 13 ||
        week === 16;

    const isTaper =
        week === 18;


    /*
       3 SÉANCES
    */

    if (profile.sessions === 3) {

        days.push(
            createRunningDay(profile, week)
        );

        days.push(
            createHyroxDay(profile, week)
        );

        days.push(
            createStrengthHyroxDay(
                profile,
                week,
                isDeload,
                isTaper
            )
        );
    }


    /*
       4 SÉANCES
    */

    else if (profile.sessions === 4) {

        days.push(
            createStrengthDay(
                profile,
                week,
                isDeload,
                isTaper
            )
        );

        days.push(
            createRunningDay(profile, week)
        );

        days.push(
            createHyroxDay(profile, week)
        );

        days.push(
            createSimulationDay(
                profile,
                week,
                isDeload,
                isTaper
            )
        );
    }


    /*
       5 SÉANCES
    */

    else if (profile.sessions === 5) {

        days.push(
            createStrengthDay(
                profile,
                week,
                isDeload,
                isTaper
            )
        );

        days.push(
            createRunningDay(profile, week)
        );

        days.push(
            createHyroxDay(profile, week)
        );

        days.push(
            createWeakPointDay(
                profile,
                week
            )
        );

        days.push(
            createSimulationDay(
                profile,
                week,
                isDeload,
                isTaper
            )
        );
    }


    /*
       6 SÉANCES
    */

    else {

        days.push(
            createStrengthDay(
                profile,
                week,
                isDeload,
                isTaper
            )
        );

        days.push(
            createRunningDay(profile, week)
        );

        days.push(
            createHyroxDay(profile, week)
        );

        days.push(
            createWeakPointDay(
                profile,
                week
            )
        );

        days.push(
            createSimulationDay(
                profile,
                week,
                isDeload,
                isTaper
            )
        );

        days.push(
            createLongRunDay(
                profile,
                week,
                isDeload,
                isTaper
            )
        );
    }


    return {

        title:
            getWeekTitle(week),

        phase,

        days
    };
}


/* =========================================================
   13. TITRE DE SEMAINE
   ========================================================= */

function getWeekTitle(week) {

    const titles = {

        1: "Base",
        2: "Volume",
        3: "Développement",
        4: "Deload",

        5: "Intensification",
        6: "Force",
        7: "Volume spécifique",
        8: "Deload",

        9: "Spécifique HYROX",
        10: "Stations",
        11: "Fatigue",
        12: "Simulation",
        13: "Deload",

        14: "Performance",
        15: "Race Pace",
        16: "Deload",

        17: "Peak",
        18: "Taper"
    };

    return titles[week] || "Progression";
}


/* =========================================================
   14. COURSE
   ========================================================= */

function createRunningDay(profile, week) {

    const pace =
        profile.runningPace;


    let intervalPace =
        pace * 0.92;

    let distance = 800;

    let repetitions = 5;


    if (profile.runningLevel === "debutant") {

        intervalPace =
            pace * 0.96;

        distance = 600;
        repetitions = 4;
    }


    if (profile.runningLevel === "avance") {

        intervalPace =
            pace * 0.88;

        distance = 1000;
        repetitions = 5;
    }


    if (week >= 9) {

        return {

            day: "Mardi",

            type: "ENGINE",

            title: "Running spécifique HYROX",

            description:
                "Développer la capacité à courir rapidement après un effort.",

            exercises: [

                "10 min échauffement",

                `${repetitions} × ${distance} m à ${paceToString(intervalPace)}`,

                "500 m de course après chaque station",

                "Récupération : 90 sec",

                "10 min retour au calme"
            ]
        };
    }


    return {

        day: "Mardi",

        type: "ENGINE",

        title: "Intervalles course",

        description:
            "Développer la vitesse et la capacité aérobie.",

        exercises: [

            "10 min échauffement",

            `${repetitions} × ${distance} m à ${paceToString(intervalPace)}`,

            "Récupération : 90 sec à 2 min",

            "10 min retour au calme"
        ]
    };
}


/* =========================================================
   15. HYROX STATIONS
   ========================================================= */

function createHyroxDay(profile, week) {

    const exercises = [

        "SkiErg — 500 m"
    ];


    if (profile.sledPush === "weak") {

        exercises.push(
            "Sled Push — 4 × 25 m — priorité technique"
        );

    } else {

        exercises.push(
            "Sled Push — 3 × 25 m"
        );
    }


    if (profile.sledPull === "weak") {

        exercises.push(
            "Sled Pull — 4 × 25 m — priorité technique"
        );

    } else {

        exercises.push(
            "Sled Pull — 3 × 25 m"
        );
    }


    if (profile.burpees === "weak") {

        exercises.push(
            "Burpee Broad Jumps — 4 × 10"
        );

    } else {

        exercises.push(
            "Burpee Broad Jumps — 3 × 12"
        );
    }


    exercises.push(
        "Row — 500 m"
    );


    if (profile.farmers === "weak") {

        exercises.push(
            "Farmers Carry — 4 × 50 m"
        );

    } else {

        exercises.push(
            "Farmers Carry — 3 × 50 m"
        );
    }


    exercises.push(
        "Travail des transitions"
    );


    return {

        day: "Jeudi",

        type: "STATIONS",

        title: "Stations HYROX",

        description:
            "Développer les stations qui limitent la performance.",

        exercises
    };
}


/* =========================================================
   16. FORCE
   ========================================================= */

function createStrengthDay(
    profile,
    week,
    isDeload,
    isTaper
) {

    if (isTaper) {

        return {

            day: "Lundi",

            type: "STRENGTH",

            title: "Activation",

            description:
                "Maintenir les sensations sans créer de fatigue.",

            exercises: [

                "Squat — 2 × 5 léger",

                "RDL — 2 × 6 léger",

                "Gainage — 3 × 30 sec",

                "Mobilité"
            ]
        };
    }


    if (isDeload) {

        return {

            day: "Lundi",

            type: "STRENGTH",

            title: "Force légère",

            description:
                "Réduire le volume pour récupérer.",

            exercises: [

                "Squat — 3 × 5 à ~60–65%",

                "RDL — 3 × 6",

                "Gainage — 3 × 30 sec"
            ]
        };
    }


    let squatSets = 4;

    if (week >= 9) {
        squatSets = 3;
    }


    return {

        day: "Lundi",

        type: "STRENGTH",

        title: "Force utile",

        description:
            "Développer la force nécessaire aux stations HYROX.",

        exercises: [

            `Squat — ${squatSets} × 5`,

            "RDL — 3 × 6–8",

            "Fentes — 3 × 10 / jambe",

            "Tractions — 3 × 6–10",

            "Core — 3 séries"
        ]
    };
}


/* =========================================================
   17. WEAK POINTS
   ========================================================= */

function createWeakPointDay(profile, week) {

    const exercises = [];


    if (profile.wallBalls === "weak") {

        exercises.push(
            "Wall Balls — 5 × 15",
            "Wall Balls — 3 × 10 sous fatigue"
        );

    } else {

        exercises.push(
            "Wall Balls — 4 × 20"
        );
    }


    if (profile.sledPush === "weak") {

        exercises.push(
            "Sled Push — 5 × 20 m"
        );
    }


    if (profile.sledPull === "weak") {

        exercises.push(
            "Sled Pull — 5 × 20 m"
        );
    }


    if (profile.lunges === "weak") {

        exercises.push(
            "Sandbag Lunges — 4 × 20 m"
        );
    }


    exercises.push(
        "Transitions — 10 à 15 min"
    );


    return {

        day: "Vendredi",

        type: "WEAK POINT",

        title: "Points faibles",

        description:
            "Travail supplémentaire ciblé selon ton profil.",

        exercises
    };
}


/* =========================================================
   18. SIMULATION
   ========================================================= */

function createSimulationDay(
    profile,
    week,
    isDeload,
    isTaper
) {

    if (isTaper) {

        return {

            day: "Samedi",

            type: "FLOW",

            title: "Race Flow léger",

            description:
                "Entretenir les sensations avant la compétition.",

            exercises: [

                "3 × 1 km à allure contrôlée",

                "Wall Balls — 15",

                "Farmers Carry — 50 m",

                "Mobilité"
            ]
        };
    }


    if (isDeload) {

        return {

            day: "Samedi",

            type: "FLOW",

            title: "Flow léger",

            description:
                "Réduire la fatigue tout en gardant les mouvements.",

            exercises: [

                "3 × 800 m",

                "Wall Balls — 15",

                "Farmers Carry — 50 m",

                "Retour au calme"
            ]
        };
    }


    let runs = 3;

    if (week >= 12) {
        runs = 5;
    }


    return {

        day: "Samedi",

        type: "FLOW",

        title: "Race Flow",

        description:
            "Combiner course et stations sous fatigue.",

        exercises: [

            `${runs} × 1 km run`,

            "Wall Balls — 20",

            "Sandbag Lunges — 20 m",

            "Farmers Carry — 100 m",

            "Burpee Broad Jumps — 10",

            "Transitions rapides"
        ]
    };
}


/* =========================================================
   19. SÉANCE HYROX + FORCE
   ========================================================= */

function createStrengthHyroxDay(
    profile,
    week,
    isDeload,
    isTaper
) {

    return {

        day: "Samedi",

        type: "HYBRID",

        title: "Force + HYROX",

        description:
            "Une séance complète pour les athlètes disposant de trois séances.",

        exercises: [

            isTaper
                ? "Squat — 2 × 5 léger"
                : "Squat — 3 × 5",

            "RDL — 3 × 8",

            "Sled Push — 4 × 20 m",

            "Wall Balls — 4 × 15",

            "Burpee Broad Jumps — 3 × 10"
        ]
    };
}


/* =========================================================
   20. SORTIE LONGUE
   ========================================================= */

function createLongRunDay(
    profile,
    week,
    isDeload,
    isTaper
) {

    let distance = 12;


    if (profile.weeklyKm >= 40) {
        distance = 14;
    }

    if (profile.weeklyKm >= 60) {
        distance = 16;
    }


    if (isDeload) {
        distance = Math.max(8, distance - 4);
    }


    if (isTaper) {
        distance = 8;
    }


    return {

        day: "Dimanche",

        type: "LONG",

        title: "Endurance",

        description:
            "Développer le moteur aérobie sans chercher la vitesse.",

        exercises: [

            `${distance} km facile`,

            "Allure conversationnelle",

            "Retour au calme"
        ]
    };
}


/* =========================================================
   21. BOUTONS DES SEMAINES
   ========================================================= */

function createWeekButtons() {

    const weeksContainer =
        document.getElementById("weeks");

    if (!weeksContainer) return;

    weeksContainer.innerHTML = "";


    Object.keys(programs).forEach((week) => {

        const button =
            document.createElement("button");

        button.className = "week-btn";

        button.textContent =
            "Semaine " + week;

        button.addEventListener(
            "click",
            () => showWeek(Number(week))
        );

        weeksContainer.appendChild(button);
    });
}


/* =========================================================
   22. AFFICHAGE D'UNE SEMAINE
   ========================================================= */

function showWeek(number) {

    const program =
        programs[number];

    if (!program) return;


    document.getElementById(
        "weekNumber"
    ).textContent =
        "SEMAINE " + number;


    document.getElementById(
        "weekTitle"
    ).textContent =
        program.title;


    document.getElementById(
        "phase"
    ).textContent =
        program.phase;


    const daysContainer =
        document.getElementById("days");

    daysContainer.innerHTML = "";


    program.days.forEach((day) => {

        const card =
            document.createElement("article");

        card.className =
            "day-card";


        let exercisesHTML = "";


        day.exercises.forEach(
            (exercise) => {

                exercisesHTML +=
                    `<li>${exercise}</li>`;
            }
        );


        card.innerHTML = `

            <div class="day-top">

                <span class="day-name">
                    ${day.day}
                </span>

                <span class="badge">
                    ${day.type}
                </span>

            </div>


            <h3>
                ${day.title}
            </h3>


            <p class="description">
                ${day.description}
            </p>


            <ul class="exercise-list">
                ${exercisesHTML}
            </ul>

        `;


        daysContainer.appendChild(card);
    });


    document
        .querySelectorAll(".week-btn")
        .forEach((button) => {

            button.classList.toggle(
                "active",
                Number(
                    button.textContent
                        .replace(/\D/g, "")
                ) === number
            );
        });
}


/* =========================================================
   23. INITIALISATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createQuestionnaire();

    }
);