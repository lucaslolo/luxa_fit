/* =========================================================
   LUXA_FIT — ALIMENTATION
   ========================================================= */


/* =========================================================
   VARIABLES GLOBALES
   ========================================================= */

let nutritionPlan = null;

let selectedMeals = [];

let currentFilter = "all";


function nutritionHasValue(value) {

    return (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    );

}


function nutritionLockControl(control, locked) {

    if (!control) {
        return;
    }

    const wrapper =
        control.closest(
            ".form-group, .radio-card"
        );

    if (locked) {

        control.disabled = true;

        if (wrapper) {
            wrapper.classList.add(
                "nutrition-form-control-locked",
                "is-locked"
            );
        }

        return;
    }

    control.disabled = false;

    if (wrapper) {
        wrapper.classList.remove(
            "nutrition-form-control-locked",
            "is-locked"
        );
    }

}


function nutritionCalculateAge(dateValue) {

    if (!nutritionHasValue(dateValue)) {
        return null;
    }

    const birthDate = new Date(dateValue);

    if (Number.isNaN(birthDate.getTime())) {
        return null;
    }

    const today = new Date();
    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const birthdayNotReached =
        today.getMonth() < birthDate.getMonth() ||
        (
            today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate()
        );

    if (birthdayNotReached) {
        age -= 1;
    }

    return age > 0 ? age : null;

}


function nutritionSetRadio(name, value) {

    const radio =
        document.querySelector(
            `input[name="${name}"][value="${value}"]`
        );

    if (!radio) {
        return false;
    }

    radio.checked = true;
    nutritionLockControl(radio, true);

    return true;

}


function nutritionApplyProfile(profile, measurements) {

    const latestMeasurement =
        Array.isArray(measurements) ?
            measurements[0] :
            null;

    const weight =
        nutritionHasValue(profile.poids) ?
            profile.poids :
            latestMeasurement &&
            latestMeasurement.poids;

    const age =
        nutritionCalculateAge(
            profile.date_naissance
        );

    const filledFields = [];

    if (nutritionHasValue(age)) {
        const ageInput =
            document.getElementById("age");

        ageInput.value = age;
        nutritionLockControl(ageInput, true);
        filledFields.push("âge");
    }

    if (nutritionHasValue(profile.taille)) {
        const heightInput =
            document.getElementById("height");

        heightInput.value = profile.taille;
        nutritionLockControl(heightInput, true);
        filledFields.push("taille");
    }

    if (nutritionHasValue(weight)) {
        const weightInput =
            document.getElementById("weight");

        weightInput.value = weight;
        nutritionLockControl(weightInput, true);
        filledFields.push("poids");
    }

    const sex =
        String(profile.sexe || "").toLowerCase();

    const normalizedSex =
        sex === "homme" || sex === "male" ?
            "male" :
            sex === "femme" || sex === "female" ?
                "female" :
                null;

    if (
        normalizedSex &&
        nutritionSetRadio("sex", normalizedSex)
    ) {
        filledFields.push("sexe");
    }

    const objective =
        String(
            profile.objectif_principal || ""
        ).toLowerCase();

    const normalizedObjective =
        objective.includes("perte") ||
        objective.includes("cut") ?
            "cut" :
            objective.includes("prise") ||
            objective.includes("bulk") ||
            objective.includes("muscle") ?
                "bulk" :
                null;

    if (
        normalizedObjective &&
        nutritionSetRadio("goal", normalizedObjective)
    ) {
        filledFields.push("objectif");
    }

    const notice =
        document.getElementById(
            "nutritionProfileNotice"
        );

    if (!notice) {
        return;
    }

    if (filledFields.length) {
        notice.innerHTML =
            `Informations enregistrées verrouillées : ` +
            `${filledFields.join(", ")}. ` +
            `<a href="dashboard.html#dashboard-profile">` +
            `Modifier depuis le dashboard</a>. ` +
            `Les champs manquants restent éditables.`;
    } else {
        notice.innerHTML =
            `Aucune information personnelle enregistrée. ` +
            `Complète les champs puis retrouve-les dans le ` +
            `<a href="dashboard.html#dashboard-profile">dashboard</a>.`;
    }

}


async function nutritionLoadProfile() {

    const notice =
        document.getElementById(
            "nutritionProfileNotice"
        );

    try {

        const profileResponse =
            await fetch(
                "/api/profile",
                {
                    credentials: "same-origin"
                }
            );

        if (profileResponse.status === 401) {
            notice.textContent =
                "Connecte-toi pour récupérer tes informations. " +
                "Les champs restent éditables.";
            return;
        }

        if (!profileResponse.ok) {
            throw new Error(
                `Profil indisponible (${profileResponse.status}).`
            );
        }

        const profileData =
            await profileResponse.json();

        let measurements = [];

        const measurementsResponse =
            await fetch(
                "/api/body-measurements",
                {
                    credentials: "same-origin"
                }
            );

        if (measurementsResponse.ok) {
            const measurementsData =
                await measurementsResponse.json();

            measurements =
                measurementsData.measurements || [];
        }

        nutritionApplyProfile(
            profileData.profile || {},
            measurements
        );

    } catch (error) {

        console.error(
            "Erreur chargement profil nutrition :",
            error
        );

        if (notice) {
            notice.classList.add("is-error");
            notice.textContent =
                "Impossible de charger tes informations. " +
                "Les champs restent éditables.";
        }

    }

}


/* =========================================================
   CATALOGUE DES REPAS
   ========================================================= */

const mealTemplates = [

    {
        id: "oatmeal",
        name: "Porridge banane & beurre de cacahuète",
        categories: ["breakfast"],
        calories: 620,
        protein: 31,
        carbs: 78,
        fat: 22,

        ingredients: [
            ["Flocons d'avoine", 80, "g"],
            ["Lait", 250, "ml"],
            ["Banane", 120, "g"],
            ["Beurre de cacahuète", 20, "g"],
            ["Whey", 25, "g"]
        ]
    },

    {
        id: "eggs_toast",
        name: "Œufs, pain complet & avocat",
        categories: ["breakfast"],
        calories: 590,
        protein: 31,
        carbs: 48,
        fat: 30,

        ingredients: [
            ["Œufs", 3, "pièces"],
            ["Pain complet", 100, "g"],
            ["Avocat", 70, "g"],
            ["Tomates", 100, "g"]
        ]
    },

    {
        id: "skyr_granola",
        name: "Skyr, granola & fruits rouges",
        categories: ["breakfast", "snack"],
        calories: 450,
        protein: 35,
        carbs: 55,
        fat: 10,

        ingredients: [
            ["Skyr", 300, "g"],
            ["Granola", 60, "g"],
            ["Fruits rouges", 150, "g"],
            ["Miel", 15, "g"]
        ]
    },

    {
        id: "chicken_rice",
        name: "Poulet, riz & légumes",
        categories: ["lunch", "dinner"],
        calories: 690,
        protein: 55,
        carbs: 82,
        fat: 15,

        ingredients: [
            ["Poulet", 180, "g"],
            ["Riz cuit", 250, "g"],
            ["Brocoli", 150, "g"],
            ["Huile d'olive", 10, "g"]
        ]
    },

    {
        id: "beef_rice",
        name: "Bœuf, riz & légumes",
        categories: ["lunch", "dinner"],
        calories: 760,
        protein: 50,
        carbs: 78,
        fat: 27,

        ingredients: [
            ["Bœuf 5%", 180, "g"],
            ["Riz cuit", 230, "g"],
            ["Courgettes", 150, "g"],
            ["Huile d'olive", 10, "g"]
        ]
    },

    {
        id: "salmon_potato",
        name: "Saumon, pommes de terre & légumes",
        categories: ["lunch", "dinner"],
        calories: 720,
        protein: 43,
        carbs: 60,
        fat: 32,

        ingredients: [
            ["Saumon", 170, "g"],
            ["Pommes de terre", 300, "g"],
            ["Haricots verts", 150, "g"],
            ["Huile d'olive", 5, "g"]
        ]
    },

    {
        id: "turkey_pasta",
        name: "Pâtes, dinde & sauce tomate",
        categories: ["lunch", "dinner"],
        calories: 700,
        protein: 53,
        carbs: 86,
        fat: 15,

        ingredients: [
            ["Pâtes cuites", 280, "g"],
            ["Dinde", 180, "g"],
            ["Sauce tomate", 150, "g"],
            ["Parmesan", 15, "g"],
            ["Huile d'olive", 5, "g"]
        ]
    },

    {
        id: "tuna_pasta",
        name: "Pâtes au thon",
        categories: ["lunch", "dinner"],
        calories: 650,
        protein: 48,
        carbs: 82,
        fat: 12,

        ingredients: [
            ["Pâtes cuites", 270, "g"],
            ["Thon au naturel", 140, "g"],
            ["Tomates", 150, "g"],
            ["Fromage frais", 40, "g"],
            ["Huile d'olive", 5, "g"]
        ]
    },

    {
        id: "wrap_chicken",
        name: "Wrap poulet & crudités",
        categories: ["lunch", "dinner"],
        calories: 610,
        protein: 48,
        carbs: 58,
        fat: 20,

        ingredients: [
            ["Tortillas", 2, "pièces"],
            ["Poulet", 150, "g"],
            ["Avocat", 50, "g"],
            ["Salade", 50, "g"],
            ["Tomates", 100, "g"],
            ["Sauce yaourt", 50, "g"]
        ]
    },

    {
        id: "burger",
        name: "Burger maison & pommes de terre",
        categories: ["lunch", "dinner"],
        calories: 800,
        protein: 48,
        carbs: 80,
        fat: 32,

        ingredients: [
            ["Pain burger", 1, "pièce"],
            ["Steak haché 5%", 150, "g"],
            ["Fromage", 25, "g"],
            ["Pommes de terre", 250, "g"],
            ["Salade", 50, "g"]
        ]
    },

    {
        id: "rice_eggs",
        name: "Riz, œufs & légumes",
        categories: ["lunch", "dinner"],
        calories: 610,
        protein: 29,
        carbs: 76,
        fat: 20,

        ingredients: [
            ["Riz cuit", 250, "g"],
            ["Œufs", 3, "pièces"],
            ["Légumes", 200, "g"],
            ["Huile d'olive", 10, "g"]
        ]
    },

    {
        id: "pancakes",
        name: "Pancakes protéinés",
        categories: ["breakfast"],
        calories: 520,
        protein: 38,
        carbs: 65,
        fat: 12,

        ingredients: [
            ["Flocons d'avoine", 70, "g"],
            ["Œufs", 2, "pièces"],
            ["Banane", 100, "g"],
            ["Whey", 25, "g"],
            ["Sirop d'érable", 15, "g"]
        ]
    },

    {
        id: "yogurt_banana",
        name: "Yaourt, banane & noix",
        categories: ["snack"],
        calories: 390,
        protein: 24,
        carbs: 43,
        fat: 14,

        ingredients: [
            ["Skyr", 250, "g"],
            ["Banane", 120, "g"],
            ["Noix", 20, "g"],
            ["Miel", 10, "g"]
        ]
    },

    {
        id: "shake",
        name: "Shake protéiné banane",
        categories: ["snack"],
        calories: 380,
        protein: 32,
        carbs: 48,
        fat: 8,

        ingredients: [
            ["Lait", 300, "ml"],
            ["Whey", 30, "g"],
            ["Banane", 120, "g"],
            ["Flocons d'avoine", 30, "g"]
        ]
    },

    {
        id: "toast_tuna",
        name: "Toast thon & fromage frais",
        categories: ["snack"],
        calories: 430,
        protein: 34,
        carbs: 43,
        fat: 13,

        ingredients: [
            ["Pain complet", 100, "g"],
            ["Thon", 100, "g"],
            ["Fromage frais", 40, "g"],
            ["Tomates", 100, "g"]
        ]
    },

    {
        id: "rice_pudding",
        name: "Riz au lait protéiné",
        categories: ["snack", "breakfast"],
        calories: 440,
        protein: 30,
        carbs: 66,
        fat: 7,

        ingredients: [
            ["Riz cuit", 200, "g"],
            ["Lait", 200, "ml"],
            ["Whey", 25, "g"],
            ["Fruits rouges", 100, "g"]
        ]
    },

    {
        id: "cottage_fruit",
        name: "Cottage cheese & fruits",
        categories: ["snack"],
        calories: 350,
        protein: 30,
        carbs: 34,
        fat: 9,

        ingredients: [
            ["Cottage cheese", 250, "g"],
            ["Pomme", 150, "g"],
            ["Amandes", 15, "g"]
        ]
    }

];


/* =========================================================
   REPARTITION DES CALORIES
   ========================================================= */

const mealDistributions = {

    2: [0.45, 0.55],

    3: [0.30, 0.40, 0.30],

    4: [0.25, 0.35, 0.30, 0.10],

    5: [0.25, 0.30, 0.25, 0.10, 0.10],

    6: [0.20, 0.25, 0.25, 0.10, 0.10, 0.10]

};


/* =========================================================
   TYPES DE REPAS
   ========================================================= */

const mealTypes = {

    2: [
        "lunch",
        "dinner"
    ],

    3: [
        "breakfast",
        "lunch",
        "dinner"
    ],

    4: [
        "breakfast",
        "lunch",
        "dinner",
        "snack"
    ],

    5: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "snack"
    ],

    6: [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "snack",
        "snack"
    ]

};


/* =========================================================
   LABELS
   ========================================================= */

const mealTypeLabels = {

    breakfast: "Petit-déjeuner",

    lunch: "Déjeuner",

    dinner: "Dîner",

    snack: "Collation"

};


/* =========================================================
   DOM
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("nutritionForm");

    const resetButton = document.getElementById("reset");

    const mealCount = document.getElementById("mealCount");

    const goalInputs =
        document.querySelectorAll('input[name="goal"]');


    /* -----------------------------------------------------
       FORMULAIRE
       ----------------------------------------------------- */

    form.addEventListener("submit", calculateNutrition);


    /* -----------------------------------------------------
       NOMBRE DE REPAS
       ----------------------------------------------------- */

    mealCount.addEventListener("change", () => {

        if (!nutritionPlan) {
            return;
        }

        nutritionPlan.mealCount =
            Number(mealCount.value);

        selectedMeals = [];

        updateMealPlanner();

    });


    /* -----------------------------------------------------
       OBJECTIF
       ----------------------------------------------------- */

    goalInputs.forEach(input => {

        input.addEventListener("change", () => {

            updateGoalCards();

            updateAdjustmentVisibility();

        });

    });


    /* -----------------------------------------------------
       FILTRES
       ----------------------------------------------------- */

    document.querySelectorAll(".filter-button")
        .forEach(button => {

            button.addEventListener("click", () => {

                document.querySelectorAll(".filter-button")
                    .forEach(btn => {
                        btn.classList.remove("active");
                    });

                button.classList.add("active");

                currentFilter =
                    button.dataset.filter;

                renderMealCatalog();

            });

        });


    /* -----------------------------------------------------
       RESET
       ----------------------------------------------------- */

    resetButton.addEventListener("click", resetPlanner);


    updateGoalCards();
    updateAdjustmentVisibility();
    nutritionLoadProfile();

});


/* =========================================================
   CALCUL NUTRITION
   ========================================================= */

function calculateNutrition(event) {

    event.preventDefault();


    const sex =
        document.querySelector(
            'input[name="sex"]:checked'
        ).value;

    const age =
        Number(document.getElementById("age").value);

    const height =
        Number(document.getElementById("height").value);

    const weight =
        Number(document.getElementById("weight").value);

    const bodyFat =
        Number(document.getElementById("bodyFat").value) || null;

    const activity =
        Number(document.getElementById("activity").value);

    const steps =
        Number(document.getElementById("steps").value) || 0;

    const trainingType =
        document.getElementById("trainingType").value;

    const sessions =
        Number(document.getElementById("sessions").value) || 0;

    const duration =
        Number(document.getElementById("duration").value) || 0;

    const intensity =
        Number(document.getElementById("intensity").value);

    const goal =
        document.querySelector(
            'input[name="goal"]:checked'
        ).value;

    const adjustment =
        Number(document.getElementById("adjustment").value);

    const mealCount =
        Number(document.getElementById("mealCount").value);


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (
        age <= 0 ||
        height <= 0 ||
        weight <= 0
    ) {

        alert(
            "Vérifie ton âge, ta taille et ton poids."
        );

        return;
    }


    /* -----------------------------------------------------
       BMR — MIFFLIN ST-JEOR
       ----------------------------------------------------- */

    let bmr;

    if (sex === "male") {

        bmr =
            (10 * weight) +
            (6.25 * height) -
            (5 * age) +
            5;

    } else {

        bmr =
            (10 * weight) +
            (6.25 * height) -
            (5 * age) -
            161;

    }


    /* -----------------------------------------------------
       KATCH-MCARDLE SI MASSE GRASSE
       ----------------------------------------------------- */

    let finalBmr = bmr;

    if (
        bodyFat &&
        bodyFat > 2 &&
        bodyFat < 70
    ) {

        const leanMass =
            weight * (1 - bodyFat / 100);

        const katchBmr =
            370 + (21.6 * leanMass);

        /*
         * On fait une moyenne légère entre les deux
         * estimations afin de ne pas dépendre entièrement
         * d'une masse grasse potentiellement imprécise.
         */

        finalBmr =
            (bmr + katchBmr) / 2;

    }


    /* -----------------------------------------------------
       ACTIVITE
       ----------------------------------------------------- */

    const baseTdee =
        finalBmr * activity;


    /* -----------------------------------------------------
       DEPENSE ENTRAINEMENT
       ----------------------------------------------------- */

    let trainingCalories = 0;

    if (
        trainingType !== "none" &&
        sessions > 0 &&
        duration > 0
    ) {

        let met = 5;

        if (trainingType === "strength") {
            met = 5.5;
        }

        if (trainingType === "running") {
            met = 9;
        }

        if (trainingType === "hyrox") {
            met = 9;
        }

        if (trainingType === "hybrid") {
            met = 8;
        }

        trainingCalories =
            (
                met *
                weight *
                (duration / 60) *
                1.05
            ) *
            intensity *
            sessions /
            7;

    }


    /* -----------------------------------------------------
       PAS
       ----------------------------------------------------- */

    const stepCalories =
        steps *
        weight *
        0.0005;


    /*
     * On évite de compter 100 % de l'entraînement
     * en plus du facteur d'activité.
     */

    const tdee =
        baseTdee +
        (trainingCalories * 0.5) +
        stepCalories;


    /* -----------------------------------------------------
       SCENARIOS
       ----------------------------------------------------- */

    const cutCalories =
        Math.round(
            tdee * (1 - adjustment)
        );

    const maintainCalories =
        Math.round(tdee);

    const bulkCalories =
        Math.round(
            tdee * (1 + adjustment)
        );


    /* -----------------------------------------------------
       OBJECTIF FINAL
       ----------------------------------------------------- */

    let targetCalories;

    if (goal === "cut") {
        targetCalories = cutCalories;
    }

    else if (goal === "bulk") {
        targetCalories = bulkCalories;
    }

    else {
        targetCalories = maintainCalories;
    }


    /* -----------------------------------------------------
       PROTEINES
       ----------------------------------------------------- */

    let proteinPerKg;

    if (goal === "cut") {
        proteinPerKg = 2;
    } else {
        proteinPerKg = 1.8;
    }

    const protein =
        weight * proteinPerKg;


    /* -----------------------------------------------------
       LIPIDES
       ----------------------------------------------------- */

    const fat =
        weight * 0.9;


    /* -----------------------------------------------------
       GLUCIDES
       ----------------------------------------------------- */

    const proteinCalories =
        protein * 4;

    const fatCalories =
        fat * 9;

    const carbs =
        Math.max(
            0,
            (
                targetCalories -
                proteinCalories -
                fatCalories
            ) / 4
        );


    /* -----------------------------------------------------
       EAU
       ----------------------------------------------------- */

    let water =
        weight * 0.035;


    if (sessions >= 4) {
        water += 0.4;
    }

    if (
        trainingType === "running" ||
        trainingType === "hyrox" ||
        trainingType === "hybrid"
    ) {
        water += 0.3;
    }


    /* -----------------------------------------------------
       PLAN
       ----------------------------------------------------- */

    nutritionPlan = {

        sex,

        age,

        height,

        weight,

        bodyFat,

        activity,

        steps,

        trainingType,

        sessions,

        duration,

        intensity,

        goal,

        adjustment,

        mealCount,

        bmr: finalBmr,

        tdee,

        cutCalories,

        maintainCalories,

        bulkCalories,

        targetCalories,

        protein,

        carbs,

        fat,

        water

    };


    selectedMeals = [];


    displayResults();

    updateMealPlanner();


    document
        .getElementById("results")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   AFFICHAGE RESULTATS
   ========================================================= */

function displayResults() {

    const plan = nutritionPlan;


    document.getElementById("results")
        .classList.remove("hidden");


    document.getElementById("mealPlanner")
        .classList.remove("hidden");


    document.getElementById("targetCalories")
        .textContent =
        Math.round(plan.targetCalories);


    document.getElementById("bmr")
        .textContent =
        Math.round(plan.bmr);


    document.getElementById("tdee")
        .textContent =
        Math.round(plan.tdee);


    document.getElementById("cutCalories")
        .textContent =
        Math.round(plan.cutCalories);


    document.getElementById("maintainCalories")
        .textContent =
        Math.round(plan.maintainCalories);


    document.getElementById("bulkCalories")
        .textContent =
        Math.round(plan.bulkCalories);


    document.getElementById("protein")
        .textContent =
        Math.round(plan.protein);


    document.getElementById("carbs")
        .textContent =
        Math.round(plan.carbs);


    document.getElementById("fat")
        .textContent =
        Math.round(plan.fat);


    document.getElementById("proteinKcal")
        .textContent =
        Math.round(plan.protein * 4);


    document.getElementById("carbsKcal")
        .textContent =
        Math.round(plan.carbs * 4);


    document.getElementById("fatKcal")
        .textContent =
        Math.round(plan.fat * 9);


    document.getElementById("water")
        .textContent =
        plan.water.toFixed(1);


    let goalLabel = "Maintien";

    if (plan.goal === "cut") {
        goalLabel = "Perte de poids";
    }

    if (plan.goal === "bulk") {
        goalLabel = "Prise de poids";
    }


    document.getElementById("goalLabel")
        .textContent =
        goalLabel;


    const message =
        document.getElementById("message");


    message.textContent =
        "Ces valeurs sont des estimations de départ. " +
        "Le niveau d'activité, les pas et les calories réellement " +
        "dépensées peuvent varier d'une personne à l'autre. " +
        "Observe ton évolution sur plusieurs semaines et ajuste " +
        "progressivement si nécessaire.";


    updateGoalCards();

}


/* =========================================================
   OBJECTIFS — AFFICHAGE
   ========================================================= */

function updateGoalCards() {

    const cards =
        document.querySelectorAll(".goal-card");

    cards.forEach(card => {

        const input =
            card.querySelector("input");

        card.classList.toggle(
            "active",
            input.checked
        );

    });

}


/* =========================================================
   VISIBILITE AJUSTEMENT
   ========================================================= */

function updateAdjustmentVisibility() {

    const goal =
        document.querySelector(
            'input[name="goal"]:checked'
        );

    const field =
        document.getElementById("adjustmentField");

    if (!goal || !field) {
        return;
    }

    if (goal.value === "maintain") {

        field.style.opacity = "0.45";

        const select =
            document.getElementById("adjustment");

        select.disabled = true;

    } else {

        field.style.opacity = "1";

        const select =
            document.getElementById("adjustment");

        select.disabled = false;

    }

}


/* =========================================================
   PLANNER
   ========================================================= */

function updateMealPlanner() {

    if (!nutritionPlan) {
        return;
    }


    const count =
        nutritionPlan.mealCount;


    document.getElementById("mealCountDisplay")
        .textContent =
        `${count} repas / jour`;


    document.getElementById("selectedMealCount")
        .textContent =
        `${selectedMeals.length} / ${count}`;


    updateMealTargetDisplay();

    renderMealCatalog();

    renderSelectedMeals();

    updateDaySummary();

}


/* =========================================================
   TARGET DU PROCHAIN REPAS
   ========================================================= */

function getMealTarget(index) {

    const count =
        nutritionPlan.mealCount;

    const distribution =
        mealDistributions[count];

    const percentage =
        distribution[index] || 0;


    return {

        calories:
            nutritionPlan.targetCalories *
            percentage,

        protein:
            nutritionPlan.protein *
            percentage,

        carbs:
            nutritionPlan.carbs *
            percentage,

        fat:
            nutritionPlan.fat *
            percentage

    };

}


/* =========================================================
   AFFICHAGE TARGET REPAS
   ========================================================= */

function updateMealTargetDisplay() {

    if (!nutritionPlan) {
        return;
    }


    const index =
        selectedMeals.length;


    if (
        index >= nutritionPlan.mealCount
    ) {

        document.getElementById(
            "mealTargetCalories"
        ).textContent = "Journée complète";

        document.getElementById(
            "mealTargetProtein"
        ).textContent = "";

        document.getElementById(
            "mealTargetCarbs"
        ).textContent = "";

        document.getElementById(
            "mealTargetFat"
        ).textContent = "";

        return;
    }


    const target =
        getMealTarget(index);


    document.getElementById(
        "mealTargetCalories"
    ).textContent =
        `${Math.round(target.calories)}`;


    document.getElementById(
        "mealTargetProtein"
    ).textContent =
        `${Math.round(target.protein)} g`;


    document.getElementById(
        "mealTargetCarbs"
    ).textContent =
        `${Math.round(target.carbs)} g`;


    document.getElementById(
        "mealTargetFat"
    ).textContent =
        `${Math.round(target.fat)} g`;

}


/* =========================================================
   ADAPTATION AUTOMATIQUE
   ========================================================= */

function adaptMealToTarget(meal, target) {

    /*
     * On part de la calorie de base du repas.
     */

    let scale =
        target.calories /
        meal.calories;


    /*
     * On évite des portions absurdes.
     */

    scale =
        Math.max(
            0.60,
            Math.min(1.50, scale)
        );


    const adapted = {

        ...meal,

        calories:
            meal.calories * scale,

        protein:
            meal.protein * scale,

        carbs:
            meal.carbs * scale,

        fat:
            meal.fat * scale,

        ingredients:
            meal.ingredients.map(
                ingredient => {

                    return [

                        ingredient[0],

                        ingredient[1] * scale,

                        ingredient[2]

                    ];

                }
            )

    };


    return adapted;

}


/* =========================================================
   SCORE REPAS
   ========================================================= */

function getMealScore(meal, target) {

    const calorieDifference =
        Math.abs(
            meal.calories -
            target.calories
        ) /
        target.calories;


    const proteinDifference =
        Math.abs(
            meal.protein -
            target.protein
        ) /
        Math.max(
            1,
            target.protein
        );


    const carbsDifference =
        Math.abs(
            meal.carbs -
            target.carbs
        ) /
        Math.max(
            1,
            target.carbs
        );


    const fatDifference =
        Math.abs(
            meal.fat -
            target.fat
        ) /
        Math.max(
            1,
            target.fat
        );


    return (
        calorieDifference * 0.45 +
        proteinDifference * 0.30 +
        carbsDifference * 0.15 +
        fatDifference * 0.10
    );

}


/* =========================================================
   REPAS COMPATIBLES
   ========================================================= */

function getMealsForCategory(
    category,
    target
) {

    let meals =
        mealTemplates.filter(
            meal =>
                meal.categories.includes(category)
        );


    /*
     * On place les repas qui correspondent
     * le mieux aux objectifs en premier.
     */

    meals.sort(
        (a, b) =>
            getMealScore(a, target) -
            getMealScore(b, target)
    );


    return meals;

}


/* =========================================================
   CATALOGUE
   ========================================================= */

function renderMealCatalog() {

    const catalog =
        document.getElementById(
            "mealCatalog"
        );


    if (!nutritionPlan) {
        catalog.innerHTML = "";
        return;
    }


    const nextIndex =
        selectedMeals.length;


    if (
        nextIndex >=
        nutritionPlan.mealCount
    ) {

        catalog.innerHTML = `
            <div class="catalog-complete">
                <h3>Journée complète ✓</h3>
                <p>
                    Tu as sélectionné ${nutritionPlan.mealCount}
                    repas. Retire un repas si tu souhaites
                    modifier ta journée.
                </p>
            </div>
        `;

        return;
    }


    const category =
        mealTypes[
            nutritionPlan.mealCount
        ][nextIndex];


    const target =
        getMealTarget(nextIndex);


    let meals =
        getMealsForCategory(
            category,
            target
        );


    if (currentFilter !== "all") {

        meals =
            meals.filter(
                meal =>
                    meal.categories.includes(
                        currentFilter
                    )
            );

    }


    /*
     * On montre les 6 meilleures propositions.
     */

    meals =
        meals.slice(0, 6);


    catalog.innerHTML = "";


    if (meals.length === 0) {

        catalog.innerHTML = `
            <div class="catalog-empty">
                Aucun repas disponible pour ce filtre.
            </div>
        `;

        return;
    }


    meals.forEach(meal => {

        const adapted =
            adaptMealToTarget(
                meal,
                target
            );


        const card =
            createMealCard(
                adapted,
                category
            );


        catalog.appendChild(card);

    });

}


/* =========================================================
   CREATION CARTE REPAS
   ========================================================= */

function createMealCard(
    meal,
    category
) {

    const article =
        document.createElement("article");


    article.className =
        "meal-card";


    const ingredients =
        meal.ingredients
            .map(
                ingredient => {

                    let quantity =
                        ingredient[1];


                    /*
                     * Arrondi intelligent
                     */

                    if (quantity >= 100) {

                        quantity =
                            Math.round(
                                quantity / 5
                            ) * 5;

                    }

                    else if (quantity >= 10) {

                        quantity =
                            Math.round(
                                quantity
                            );

                    }

                    else {

                        quantity =
                            Math.round(
                                quantity * 10
                            ) / 10;

                    }


                    return `
                        <li>
                            <span>
                                ${ingredient[0]}
                            </span>

                            <span>
                                ${quantity}
                                ${ingredient[2]}
                            </span>
                        </li>
                    `;

                }
            )
            .join("");


    article.innerHTML = `

        <div class="meal-card-header">

            <span class="meal-card-category">
                ${mealTypeLabels[category]}
            </span>

            <h4>
                ${meal.name}
            </h4>

        </div>


        <div class="meal-card-body">

            <div class="meal-macros">

                <div>
                    <span>KCAL</span>
                    <strong>
                        ${Math.round(meal.calories)}
                    </strong>
                </div>

                <div>
                    <span>PROT</span>
                    <strong>
                        ${Math.round(meal.protein)}g
                    </strong>
                </div>

                <div>
                    <span>GLUC</span>
                    <strong>
                        ${Math.round(meal.carbs)}g
                    </strong>
                </div>

                <div>
                    <span>LIP</span>
                    <strong>
                        ${Math.round(meal.fat)}g
                    </strong>
                </div>

            </div>


            <ul class="ingredients">
                ${ingredients}
            </ul>


            <button
                type="button"
                class="add-meal-button"
            >
                Ajouter à ma journée →
            </button>

        </div>

    `;


    article
        .querySelector(".add-meal-button")
        .addEventListener(
            "click",
            () => {

                addMeal(
                    meal,
                    category
                );

            }
        );


    return article;

}


/* =========================================================
   AJOUTER UN REPAS
   ========================================================= */

function addMeal(
    meal,
    category
) {

    if (!nutritionPlan) {
        return;
    }


    if (
        selectedMeals.length >=
        nutritionPlan.mealCount
    ) {

        return;
    }


    const index =
        selectedMeals.length;


    const target =
        getMealTarget(index);


    /*
     * Le repas reçu est déjà adapté.
     */

    const finalMeal = {

        ...meal,

        position: index,

        category,

        targetCalories:
            target.calories

    };


    selectedMeals.push(
        finalMeal
    );


    updateMealPlanner();

}


/* =========================================================
   SUPPRIMER REPAS
   ========================================================= */

function removeMeal(index) {

    selectedMeals.splice(
        index,
        1
    );


    /*
     * On recalcule toutes les portions
     * des repas restants en fonction
     * de leur nouvelle position.
     */

    selectedMeals =
        selectedMeals.map(
            (meal, newIndex) => {

                const original =
                    mealTemplates.find(
                        template =>
                            template.id ===
                            meal.id
                    );


                const target =
                    getMealTarget(
                        newIndex
                    );


                const adapted =
                    adaptMealToTarget(
                        original,
                        target
                    );


                return {

                    ...adapted,

                    position:
                        newIndex,

                    category:
                        meal.category,

                    targetCalories:
                        target.calories

                };

            }
        );


    updateMealPlanner();

}


/* =========================================================
   REPAS SELECTIONNES
   ========================================================= */

function renderSelectedMeals() {

    const container =
        document.getElementById(
            "selectedMeals"
        );


    container.innerHTML = "";


    if (
        selectedMeals.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-selected">
                Aucun repas sélectionné pour le moment.
                Choisis un repas dans le catalogue ci-dessus.
            </div>
        `;

        return;
    }


    selectedMeals.forEach(
        (meal, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "selected-meal";


            item.innerHTML = `

                <div class="selected-meal-number">
                    ${index + 1}
                </div>


                <div class="selected-meal-info">

                    <h4>
                        ${meal.name}
                    </h4>

                    <span>
                        ${mealTypeLabels[meal.category]}
                        ·
                        ${Math.round(meal.protein)}g prot
                        ·
                        ${Math.round(meal.carbs)}g gluc
                        ·
                        ${Math.round(meal.fat)}g lip
                    </span>

                </div>


                <div class="selected-meal-calories">
                    ${Math.round(meal.calories)} kcal
                </div>


                <button
                    type="button"
                    class="remove-meal"
                >
                    RETIRER
                </button>

            `;


            item
                .querySelector(".remove-meal")
                .addEventListener(
                    "click",
                    () => {

                        removeMeal(index);

                    }
                );


            container.appendChild(item);

        }
    );

}


/* =========================================================
   RESUME JOURNEE
   ========================================================= */

function updateDaySummary() {

    if (!nutritionPlan) {
        return;
    }


    let calories = 0;

    let protein = 0;

    let carbs = 0;

    let fat = 0;


    selectedMeals.forEach(meal => {

        calories += meal.calories;

        protein += meal.protein;

        carbs += meal.carbs;

        fat += meal.fat;

    });


    const remainingCalories =
        nutritionPlan.targetCalories -
        calories;

    const remainingProtein =
        nutritionPlan.protein -
        protein;

    const remainingCarbs =
        nutritionPlan.carbs -
        carbs;

    const remainingFat =
        nutritionPlan.fat -
        fat;


    document.getElementById(
        "summaryTargetCalories"
    ).textContent =
        `${Math.round(
            nutritionPlan.targetCalories
        )} kcal`;


    document.getElementById(
        "summaryTargetProtein"
    ).textContent =
        Math.round(
            nutritionPlan.protein
        );


    document.getElementById(
        "summaryTargetCarbs"
    ).textContent =
        Math.round(
            nutritionPlan.carbs
        );


    document.getElementById(
        "summaryTargetFat"
    ).textContent =
        Math.round(
            nutritionPlan.fat
        );


    document.getElementById(
        "selectedCalories"
    ).textContent =
        `${Math.round(calories)} kcal`;


    document.getElementById(
        "remainingCalories"
    ).textContent =
        `${Math.round(
            remainingCalories
        )} kcal`;


    document.getElementById(
        "remainingProtein"
    ).textContent =
        `${Math.round(
            remainingProtein
        )} g prot`;


    document.getElementById(
        "remainingCarbs"
    ).textContent =
        `${Math.round(
            remainingCarbs
        )} g gluc`;


    document.getElementById(
        "remainingFat"
    ).textContent =
        `${Math.round(
            remainingFat
        )} g lip`;


    document.getElementById(
        "selectedMealCount"
    ).textContent =
        `${selectedMeals.length} / ${nutritionPlan.mealCount}`;

}


/* =========================================================
   RESET
   ========================================================= */

function resetPlanner() {

    selectedMeals = [];

    nutritionPlan = null;


    document.getElementById("results")
        .classList.add("hidden");


    document.getElementById("mealPlanner")
        .classList.add("hidden");


    document.getElementById("nutritionForm")
        .reset();


    document.getElementById("mealCount").value = "3";

    document.getElementById("activity").value = "1.55";

    document.getElementById("steps").value = "7000";

    document.getElementById("sessions").value = "4";

    document.getElementById("duration").value = "60";

    document.getElementById("intensity").value = "1";

    document.querySelector(
        'input[name="goal"][value="maintain"]'
    ).checked = true;


    updateGoalCards();

    updateAdjustmentVisibility();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}