/* =========================================================
   LUXA_FIT — CALCULATEUR ALIMENTATION
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const form =
    document.getElementById("nutritionForm");

const results =
    document.getElementById("results");

const resetButton =
    document.getElementById("reset");

const adjustmentField =
    document.getElementById("adjustmentField");

const goalInputs =
    document.querySelectorAll(
        'input[name="goal"]'
    );

const trainingTypeInput =
    document.getElementById("trainingType");

const trainingFields =
    [
        document.getElementById("sessions"),
        document.getElementById("duration"),
        document.getElementById("intensity")
    ];


/* =========================================================
   OBJECTIF
   ========================================================= */

goalInputs.forEach(input => {

    input.addEventListener(
        "change",
        updateGoalInterface
    );

});


function updateGoalInterface() {

    const goal =
        document.querySelector(
            'input[name="goal"]:checked'
        ).value;


    if (goal === "maintain") {

        adjustmentField.style.display =
            "none";

    } else {

        adjustmentField.style.display =
            "block";

    }

}

function updateTrainingInterface() {

    const isRestDay =
        trainingTypeInput.value === "none";

    trainingFields.forEach(field => {
        field.disabled = isRestDay;
    });

}


/* =========================================================
   BMR — MIFFLIN ST JEOR
   ========================================================= */

function calculateMifflin(
    sex,
    age,
    height,
    weight
) {

    if (sex === "male") {

        return (
            10 * weight +
            6.25 * height -
            5 * age +
            5
        );

    }


    return (
        10 * weight +
        6.25 * height -
        5 * age -
        161
    );

}


/* =========================================================
   BMR — KATCH-MCARDLE
   ========================================================= */

function calculateKatchMcArdle(
    weight,
    bodyFat
) {

    const leanMass =
        weight *
        (1 - bodyFat / 100);


    return (
        370 +
        21.6 * leanMass
    );

}


/* =========================================================
   CALORIES SPORT
   ========================================================= */

function calculateTrainingCalories(
    type,
    sessions,
    duration,
    intensity,
    weight
) {

    if (
        type === "none" ||
        sessions <= 0 ||
        duration <= 0
    ) {

        return 0;

    }


    /*
     * Valeurs MET approximatives.
     */

    const MET = {

        strength: 5.5,

        running: 8.5,

        hyrox: 9,

        hybrid: 7

    };


    const met =
        MET[type] || 5;


    /*
     * kcal/min =
     *
     * MET × 3.5 × poids / 200
     */

    const caloriesSession =
        (
            met *
            3.5 *
            weight /
            200
        ) *
        duration;


    const caloriesWeek =
        caloriesSession *
        sessions *
        intensity;


    /*
     * Moyenne quotidienne.
     */

    return caloriesWeek / 7;

}


/* =========================================================
   PAS
   ========================================================= */

function calculateStepsCalories(
    steps,
    weight
) {

    if (!steps) {

        return 0;

    }


    /*
     * Estimation simplifiée.
     */

    const result =
        steps *
        weight *
        0.00004;


    /*
     * Limite volontaire.
     */

    return Math.min(
        result,
        350
    );

}


/* =========================================================
   ARRONDI CALORIES
   ========================================================= */

function roundCalories(
    calories
) {

    return Math.round(
        calories / 10
    ) * 10;

}


/* =========================================================
   FORMAT
   ========================================================= */

function formatNumber(
    number
) {

    return new Intl.NumberFormat(
        "fr-FR"
    ).format(
        Math.round(number)
    );

}


/* =========================================================
   MACROS
   ========================================================= */

function calculateMacros(
    calories,
    weight,
    goal,
    trainingType
) {

    let proteinPerKg;


    /*
     * Point de départ :
     */

    if (goal === "cut") {

        proteinPerKg = 2.0;

    } else {

        proteinPerKg = 1.8;

    }


    /*
     * Sport hybride / HYROX :
     * on conserve une quantité élevée
     * de protéines.
     */

    if (
        trainingType === "hyrox" ||
        trainingType === "hybrid"
    ) {

        proteinPerKg =
            Math.max(
                proteinPerKg,
                1.8
            );

    }


    const protein =
        weight *
        proteinPerKg;


    /*
     * Lipides.
     */

    const fat =
        weight *
        0.9;


    /*
     * Conversion calorique.
     */

    const proteinCalories =
        protein * 4;


    const fatCalories =
        fat * 9;


    /*
     * Le reste est attribué aux glucides.
     */

    let carbCalories =
        calories -
        proteinCalories -
        fatCalories;


    if (carbCalories < 0) {

        carbCalories = 0;

    }


    const carbs =
        carbCalories / 4;


    return {

        protein:
            Math.round(protein),

        fat:
            Math.round(fat),

        carbs:
            Math.round(carbs),

        proteinCalories:
            Math.round(proteinCalories),

        fatCalories:
            Math.round(fatCalories),

        carbCalories:
            Math.round(carbCalories)

    };

}


/* =========================================================
   MESSAGE
   ========================================================= */

function createMessage(
    goal
) {

    if (goal === "cut") {

        return `
            Ton objectif correspond à un apport inférieur
            à ton maintien estimé. Utilise cette valeur comme
            point de départ et observe ton évolution avant
            d'effectuer de nouveaux ajustements.
        `;

    }


    if (goal === "bulk") {

        return `
            Ton objectif correspond à un apport supérieur
            à ton maintien estimé. L'évolution du poids,
            des performances et de la récupération permettra
            ensuite d'ajuster progressivement cet apport.
        `;

    }


    return `
        Ton objectif correspond à ton maintien estimé.
        Cette valeur constitue une estimation de départ :
        tes besoins réels peuvent évoluer avec ton activité,
        ton poids et ton niveau d'entraînement.
    `;

}


/* =========================================================
   CALCUL PRINCIPAL
   ========================================================= */

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        /* -------------------------------------------------
           PROFIL
           ------------------------------------------------- */

        const sex =
            document.querySelector(
                'input[name="sex"]:checked'
            ).value;


        const age =
            Number(
                document.getElementById(
                    "age"
                ).value
            );


        const height =
            Number(
                document.getElementById(
                    "height"
                ).value
            );


        const weight =
            Number(
                document.getElementById(
                    "weight"
                ).value
            );


        const bodyFat =
            Number(
                document.getElementById(
                    "bodyFat"
                ).value
            );


        /* -------------------------------------------------
           ACTIVITE
           ------------------------------------------------- */

        const activity =
            Number(
                document.getElementById(
                    "activity"
                ).value
            );


        const steps =
            Number(
                document.getElementById(
                    "steps"
                ).value
            ) || 0;


        /* -------------------------------------------------
           SPORT
           ------------------------------------------------- */

        const trainingType =
            document.getElementById(
                "trainingType"
            ).value;


        const sessions =
            Number(
                document.getElementById(
                    "sessions"
                ).value
            ) || 0;


        const duration =
            Number(
                document.getElementById(
                    "duration"
                ).value
            ) || 0;


        const intensity =
            Number(
                document.getElementById(
                    "intensity"
                ).value
            );


        /* -------------------------------------------------
           OBJECTIF
           ------------------------------------------------- */

        const goal =
            document.querySelector(
                'input[name="goal"]:checked'
            ).value;


        const adjustment =
            Number(
                document.getElementById(
                    "adjustment"
                ).value
            );


        /* -------------------------------------------------
           VALIDATION
           ------------------------------------------------- */

        if (
            !age ||
            !height ||
            !weight
        ) {

            alert(
                "Remplis ton âge, ta taille et ton poids."
            );

            return;

        }


        /* -------------------------------------------------
           BMR
           ------------------------------------------------- */

        let bmr;


        if (
            bodyFat >= 3 &&
            bodyFat <= 60
        ) {

            bmr =
                calculateKatchMcArdle(
                    weight,
                    bodyFat
                );

        } else {

            bmr =
                calculateMifflin(
                    sex,
                    age,
                    height,
                    weight
                );

        }


        /* -------------------------------------------------
           TDEE
           ------------------------------------------------- */

        let tdee =
            bmr *
            activity;


        /* -------------------------------------------------
           SPORT
           ------------------------------------------------- */

        const trainingCalories =
            calculateTrainingCalories(
                trainingType,
                sessions,
                duration,
                intensity,
                weight
            );


        /*
         * Le facteur d'activité prend déjà en compte
         * une partie du mouvement quotidien.
         *
         * On ajoute donc une fraction de la dépense
         * d'entraînement pour limiter le double comptage.
         */

        tdee +=
            trainingCalories * 0.5;


        /* -------------------------------------------------
           PAS
           ------------------------------------------------- */

        tdee +=
            calculateStepsCalories(
                steps,
                weight
            );


        tdee =
            roundCalories(tdee);


        /* -------------------------------------------------
           SCENARIOS
           ------------------------------------------------- */

        const maintainCalories =
            tdee;


        const cutCalories =
            roundCalories(
                tdee * 0.85
            );


        const bulkCalories =
            roundCalories(
                tdee * 1.10
            );


        /* -------------------------------------------------
           OBJECTIF SELECTIONNE
           ------------------------------------------------- */

        let targetCalories;


        if (goal === "cut") {

            targetCalories =
                roundCalories(
                    tdee *
                    (1 - adjustment)
                );

        }


        else if (goal === "bulk") {

            targetCalories =
                roundCalories(
                    tdee *
                    (1 + adjustment)
                );

        }


        else {

            targetCalories =
                tdee;

        }


        /* -------------------------------------------------
           MACROS
           ------------------------------------------------- */

        const macros =
            calculateMacros(
                targetCalories,
                weight,
                goal,
                trainingType
            );


        /* -------------------------------------------------
           HYDRATATION
           ------------------------------------------------- */

        let water =
            weight *
            0.035;


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


        water =
            Math.round(
                water * 10
            ) / 10;


        /* =================================================
           AFFICHAGE
           ================================================= */


        document.getElementById(
            "targetCalories"
        ).textContent =
            formatNumber(
                targetCalories
            );


        document.getElementById(
            "bmr"
        ).textContent =
            `${formatNumber(bmr)} kcal`;


        document.getElementById(
            "tdee"
        ).textContent =
            `${formatNumber(tdee)} kcal`;


        /* -------------------------------------------------
           SCENARIOS
           ------------------------------------------------- */

        document.getElementById(
            "cutCalories"
        ).textContent =
            formatNumber(
                cutCalories
            );


        document.getElementById(
            "maintainCalories"
        ).textContent =
            formatNumber(
                maintainCalories
            );


        document.getElementById(
            "bulkCalories"
        ).textContent =
            formatNumber(
                bulkCalories
            );


        /* -------------------------------------------------
           MACROS
           ------------------------------------------------- */

        document.getElementById(
            "protein"
        ).textContent =
            `${macros.protein} g`;


        document.getElementById(
            "fat"
        ).textContent =
            `${macros.fat} g`;


        document.getElementById(
            "carbs"
        ).textContent =
            `${macros.carbs} g`;


        document.getElementById(
            "proteinKcal"
        ).textContent =
            `${macros.proteinCalories} kcal`;


        document.getElementById(
            "fatKcal"
        ).textContent =
            `${macros.fatCalories} kcal`;


        document.getElementById(
            "carbsKcal"
        ).textContent =
            `${macros.carbCalories} kcal`;


        /* -------------------------------------------------
           EAU
           ------------------------------------------------- */

        document.getElementById(
            "water"
        ).textContent =
            `${water.toFixed(1).replace(".", ",")} L / jour`;


        /* -------------------------------------------------
           MESSAGE
           ------------------------------------------------- */

        document.getElementById(
            "message"
        ).textContent =
            createMessage(
                goal
            );


        /* -------------------------------------------------
           RESULTATS
           ------------------------------------------------- */

        results.classList.remove(
            "hidden"
        );


        setTimeout(
            () => {

                results.scrollIntoView({
                    behavior: "smooth"
                });

            },
            100
        );

    }
);


/* =========================================================
   RESET
   ========================================================= */

resetButton.addEventListener(
    "click",
    function() {

        form.reset();
        updateGoalInterface();
        updateTrainingInterface();
        results.classList.add(
            "hidden"
        );


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);


/* =========================================================
   INITIALISATION
   ========================================================= */

updateGoalInterface();
trainingTypeInput.addEventListener(
    "change",
    updateTrainingInterface
);
updateTrainingInterface();