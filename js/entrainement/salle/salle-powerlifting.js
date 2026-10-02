/* =========================================================
   LUXA_FIT
   POWERLIFTING
   GÉNÉRATEUR DE PROGRAMME
   ========================================================= */


/* =========================================================
   VARIABLES
   ========================================================= */

let currentProgram = null;

let currentWeek = 1;

let userPR = {

    squat: 0,
    bench: 0,
    deadlift: 0

};

let trainingMax = {

    squat: 0,
    bench: 0,
    deadlift: 0

};

let totalWeeks = 4;


/* =========================================================
   ARRONDIR LES CHARGES
   ========================================================= */

function roundWeight(weight) {

    return Math.round(weight / 2.5) * 2.5;

}


/* =========================================================
   CALCUL DU TRAINING MAX
   ========================================================= */

function calculateTrainingMax() {

    trainingMax.squat =
        roundWeight(userPR.squat * 0.90);

    trainingMax.bench =
        roundWeight(userPR.bench * 0.90);

    trainingMax.deadlift =
        roundWeight(userPR.deadlift * 0.90);

}


/* =========================================================
   CALCUL D'UNE CHARGE
   ========================================================= */

function calculateWeight(type, percentage, week) {

    let tm = trainingMax[type];

    if (!tm) {
        return null;
    }


    /*
       Progression du Training Max
       à chaque nouveau bloc de 4 semaines
    */

    const block = Math.floor((week - 1) / 4);


    let progression = 0;


    /*
       +5 kg pour squat / deadlift
       +2.5 kg pour bench
       par bloc de 4 semaines
    */

    if (type === "bench") {

        progression = block * 2.5;

    } else {

        progression = block * 5;

    }


    const adjustedTM = tm + progression;


    return roundWeight(
        adjustedTM * percentage
    );

}


/* =========================================================
   PHASE DE LA SEMAINE
   ========================================================= */

function getWeekPhase(week) {

    const weekInBlock =
        ((week - 1) % 4) + 1;


    if (weekInBlock === 1) {

        return {
            name: "Accumulation",
            description:
                "Volume de travail contrôlé."
        };

    }


    if (weekInBlock === 2) {

        return {
            name: "Progression",
            description:
                "Augmentation progressive de l'intensité."
        };

    }


    if (weekInBlock === 3) {

        return {
            name: "Intensification",
            description:
                "Travail plus lourd avec réduction du volume."
        };

    }


    return {
        name: "Deload",
        description:
            "Réduction de la fatigue avant le prochain bloc."
    };

}


/* =========================================================
   AJUSTEMENT DE LA SEMAINE
   ========================================================= */

function getWeekMultiplier(week) {

    const weekInBlock =
        ((week - 1) % 4) + 1;


    /*
       Pour le moment les exercices
       utilisent déjà leurs pourcentages.

       On modifie légèrement le volume/intensité
       au fil du bloc.
    */

    if (weekInBlock === 1) {

        return {
            percentage: 1,
            volume: 1
        };

    }


    if (weekInBlock === 2) {

        return {
            percentage: 1.025,
            volume: 1
        };

    }


    if (weekInBlock === 3) {

        return {
            percentage: 1.05,
            volume: 0.85
        };

    }


    return {
        percentage: 0.85,
        volume: 0.70
    };

}


/* =========================================================
   FORMATAGE
   ========================================================= */

function formatWeight(weight) {

    if (weight === null || weight === undefined) {

        return "";

    }


    if (weight % 1 === 0) {

        return `${weight} kg`;

    }


    return `${weight.toFixed(1)} kg`;

}


/* =========================================================
   AFFICHER UNE SEMAINE
   ========================================================= */

function displayWeek(week) {

    currentWeek = week;


    const phase =
        getWeekPhase(week);


    const multiplier =
        getWeekMultiplier(week);


    document.getElementById("weekNumber").textContent =
        `SEMAINE ${week}`;


    document.getElementById("weekTitle").textContent =
        phase.name;


    document.getElementById("phase").textContent =
        phase.description;


    const daysContainer =
        document.getElementById("days");


    daysContainer.innerHTML = "";


    currentProgram.days.forEach(day => {


        const dayElement =
            document.createElement("article");


        dayElement.className =
            "program-day";


        let exercisesHTML = "";


        day.exercises.forEach(exercise => {


            /*
               EXERCICES PRINCIPAUX
            */

            if (
                exercise.type === "squat" ||
                exercise.type === "bench" ||
                exercise.type === "deadlift"
            ) {


                let percentage =
                    exercise.percentage *
                    multiplier.percentage;


                /*
                   On évite de dépasser 100 %
                */

                percentage =
                    Math.min(percentage, 1);


                const weight =
                    calculateWeight(
                        exercise.type,
                        percentage,
                        week
                    );


                let sets =
                    exercise.sets;


                let reps =
                    exercise.reps;


                /*
                   Deload
                */

                if (
                    ((week - 1) % 4) + 1 === 4
                ) {

                    sets =
                        Math.max(
                            2,
                            Math.round(
                                sets * multiplier.volume
                            )
                        );

                }


                exercisesHTML += `

                    <div class="program-exercise">

                        <div class="exercise-main">

                            <strong>
                                ${exercise.name}
                            </strong>

                            <span>
                                ${sets} × ${reps}
                            </span>

                        </div>

                        <div class="exercise-load">

                            ${formatWeight(weight)}

                            <small>
                                ${Math.round(percentage * 100)} %
                            </small>

                        </div>

                    </div>

                `;

            }


            /*
               EXERCICES ACCESSOIRES
            */

            else {


                let sets =
                    exercise.sets;


                if (
                    ((week - 1) % 4) + 1 === 4
                ) {

                    sets =
                        Math.max(
                            2,
                            Math.round(
                                sets * multiplier.volume
                            )
                        );

                }


                exercisesHTML += `

                    <div class="program-exercise">

                        <div class="exercise-main">

                            <strong>
                                ${exercise.name}
                            </strong>

                            <span>
                                ${sets} × ${exercise.reps}
                            </span>

                        </div>

                        <div class="exercise-load">

                            RIR 2–3

                        </div>

                    </div>

                `;

            }

        });


        dayElement.innerHTML = `

            <div class="program-day-header">

                <span>
                    ${day.day}
                </span>

                <h3>
                    ${day.title}
                </h3>

            </div>

            <div class="program-exercises">

                ${exercisesHTML}

            </div>

        `;


        daysContainer.appendChild(dayElement);

    });


    /*
       NOTE
    */

    document.getElementById("programNote").textContent =
        `Training Max : Squat ${trainingMax.squat} kg · Bench ${trainingMax.bench} kg · Deadlift ${trainingMax.deadlift} kg. Les charges sont arrondies au 2,5 kg le plus proche. Garde environ 2 répétitions en réserve sur les exercices principaux.`;


    /*
       Boutons semaines
    */

    document
        .querySelectorAll(".week-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                Number(button.dataset.week) === week
            );

        });

}


/* =========================================================
   CRÉER LES BOUTONS DE SEMAINES
   ========================================================= */

function createWeekButtons() {

    const container =
        document.getElementById("weeks");


    container.innerHTML = "";


    for (
        let week = 1;
        week <= totalWeeks;
        week++
    ) {


        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "week-button";


        button.dataset.week =
            week;


        button.textContent =
            `S${week}`;


        button.addEventListener(
            "click",
            () => {

                displayWeek(week);

            }
        );


        container.appendChild(button);

    }

}


/* =========================================================
   AFFICHER LES PR
   ========================================================= */

function updatePowerliftingStats() {

    const squat =
        document.getElementById(
            "powerliftingSquatCurrent"
        );

    const bench =
        document.getElementById(
            "powerliftingBenchCurrent"
        );

    const deadlift =
        document.getElementById(
            "powerliftingDeadliftCurrent"
        );


    if (squat) {

        squat.textContent =
            `${userPR.squat} kg`;

    }


    if (bench) {

        bench.textContent =
            `${userPR.bench} kg`;

    }


    if (deadlift) {

        deadlift.textContent =
            `${userPR.deadlift} kg`;

    }


    /*
       Estimation simple après formation
    */

    const squatFuture =
        document.getElementById(
            "powerliftingSquatMax"
        );

    const benchFuture =
        document.getElementById(
            "powerliftingBenchMax"
        );

    const deadliftFuture =
        document.getElementById(
            "powerliftingDeadliftMax"
        );


    if (squatFuture) {

        squatFuture.textContent =
            `${userPR.squat + 5} kg`;

    }


    if (benchFuture) {

        benchFuture.textContent =
            `${userPR.bench + 2.5} kg`;

    }


    if (deadliftFuture) {

        deadliftFuture.textContent =
            `${userPR.deadlift + 5} kg`;

    }

}


/* =========================================================
   FORMULAIRE
   ========================================================= */

document
    .getElementById("powerliftingForm")
    .addEventListener("submit", function(event) {


        event.preventDefault();


        /*
           RÉCUPÉRATION DES DONNÉES
        */

        const squat =
            Number(
                document.getElementById("squatPR").value
            );


        const bench =
            Number(
                document.getElementById("benchPR").value
            );


        const deadlift =
            Number(
                document.getElementById("deadliftPR").value
            );


        const sessions =
            Number(
                document.getElementById("jours").value
            );


        totalWeeks =
            Number(
                document.getElementById("duree").value
            );


        /*
           VALIDATION
        */

        if (
            !squat ||
            !bench ||
            !deadlift ||
            !sessions ||
            !totalWeeks
        ) {

            return;

        }


        /*
           ENREGISTRER LES PR
        */

        userPR = {

            squat,
            bench,
            deadlift

        };


        /*
           CALCUL TRAINING MAX
        */

        calculateTrainingMax();


        /*
           RÉCUPÉRER LE PROGRAMME
        */

        currentProgram =
            powerliftingPrograms[sessions];


        if (!currentProgram) {

            alert(
                "Impossible de trouver le programme."
            );

            return;

        }


        /*
           TITRE
        */

        document.getElementById(
            "resultTitle"
        ).textContent =
            currentProgram.title;


        document.getElementById(
            "resultDescription"
        ).textContent =
            `${currentProgram.description} Programme personnalisé sur ${totalWeeks} semaines.`;


        /*
           AFFICHER LES STATS
        */

        updatePowerliftingStats();


        /*
           CRÉER LES SEMAINES
        */

        createWeekButtons();


        /*
           AFFICHER SEMAINE 1
        */

        displayWeek(1);


        /*
           AFFICHER LE RÉSULTAT
        */

        document.getElementById(
            "programResult"
        ).hidden = false;


        /*
           DESCENDRE VERS LE PROGRAMME
        */

        document.getElementById(
            "programResult"
        ).scrollIntoView({
            behavior: "smooth"
        });

    });