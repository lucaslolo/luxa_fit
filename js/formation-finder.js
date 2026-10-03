/* =========================================================
   LUXA_FIT — FORMATION FINDER
   ========================================================= */


/* =========================================================
   RÉPONSES
   ========================================================= */

const formationAnswers = {
    alimentation: null,
    entrainement: null,
    sessions: null,
    duree: null
};


/* =========================================================
   NOMS AFFICHÉS
   ========================================================= */

const formationLabels = {

    alimentation: {
        "seche": "Sèche",
        "maintien": "Maintien calorique",
        "prise-masse": "Prise de masse"
    },

    entrainement: {
        "remise-forme": "Remise en forme",
        "bodybuilding": "Bodybuilding",
        "powerlifting": "Powerlifting",
        "powerbuilding": "Powerbuilding",
        "course": "Course à pied",
        "hyrox": "HYROX",
        "hybride": "Hybride"
    }

};


/* =========================================================
   URL DES FORMATIONS
   ========================================================= */

const formationPages = {

    "remise-forme": "salle-forme.html",
    "bodybuilding": "salle-bodybuilding.html",
    "powerlifting": "salle-powerlifting.html",
    "powerbuilding": "salle-powerbuilding.html",
    "course": "course.html",
    "hyrox": "hyrox.html",
    "hybride": "hybride.html"

};


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const options =
        document.querySelectorAll(".quiz-option");

    const steps =
        document.querySelectorAll(".quiz-step");

    const result =
        document.getElementById("quizResult");

    const progressLabel =
        document.getElementById("quizProgressLabel");

    const progressPercent =
        document.getElementById("quizProgressPercent");

    const progressBar =
        document.getElementById("quizProgressBar");

    const resetButton =
        document.getElementById("quizReset");

    function updateProgress(stepNumber) {

        const total =
            steps.length;

        const percent =
            Math.round(
                (stepNumber / total) * 100
            );

        if (progressLabel) {
            progressLabel.textContent =
                `QUESTION ${stepNumber} SUR ${total}`;
        }

        if (progressPercent) {
            progressPercent.textContent =
                `${percent}%`;
        }

        if (progressBar) {
            progressBar.style.width =
                `${percent}%`;
        }

    }

    function showStep(step) {

        steps.forEach(
            currentStep => {
                currentStep.classList.toggle(
                    "active",
                    currentStep === step
                );
            }
        );

        if (step) {
            updateProgress(
                Number(step.dataset.step)
            );

            step.querySelector(
                ".quiz-option"
            )?.focus();
        }

    }

    updateProgress(1);

    options.forEach(option => {

        option.addEventListener("click", () => {

            const question =
                option.dataset.question;

            const value =
                option.dataset.value;


            // Enregistrer la réponse
            formationAnswers[question] = value;

            const currentOptions =
                currentStepOptions(option);

            currentOptions.forEach(
                currentOption => {
                    const selected =
                        currentOption === option;

                    currentOption.classList.toggle(
                        "selected",
                        selected
                    );

                    currentOption.setAttribute(
                        "aria-pressed",
                        String(selected)
                    );
                }
            );


            // Trouver l'étape actuelle
            const currentStep =
                option.closest(".quiz-step");


            if (!currentStep) {
                return;
            }


            // Trouver le numéro de l'étape
            const currentNumber =
                Number(currentStep.dataset.step);


            // Passer à la question suivante
            const nextStep =
                document.querySelector(
                    `.quiz-step[data-step="${currentNumber + 1}"]`
                );


            if (nextStep) {

                showStep(nextStep);

            } else {

                // Dernière question
                showFormationResult();

            }

        });

    });

    function currentStepOptions(option) {
        const step =
            option.closest(".quiz-step");

        return step
            ? step.querySelectorAll(".quiz-option")
            : [];
    }

    options.forEach(
        option => {
            option.setAttribute(
                "aria-pressed",
                "false"
            );
        }
    );

    if (resetButton) {
        resetButton.addEventListener(
            "click",
            () => {

                Object.keys(
                    formationAnswers
                ).forEach(
                    key => {
                        formationAnswers[key] =
                            null;
                    }
                );

                options.forEach(
                    option => {
                        option.classList.remove(
                            "selected"
                        );

                        option.setAttribute(
                            "aria-pressed",
                            "false"
                        );
                    }
                );

                result?.classList.remove(
                    "active"
                );

                showStep(
                    steps[0]
                );

                document.getElementById(
                    "formationQuiz"
                )?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );
    }

});


/* =========================================================
   AFFICHER LE RÉSULTAT
   ========================================================= */

function showFormationResult() {

    const result =
        document.getElementById("quizResult");

    if (!result) {
        return;
    }


    /*
        Afficher les réponses
    */

    document.getElementById(
        "resultAlimentation"
    ).textContent =
        formationLabels.alimentation[
            formationAnswers.alimentation
        ];


    document.getElementById(
        "resultEntrainement"
    ).textContent =
        formationLabels.entrainement[
            formationAnswers.entrainement
        ];


    document.getElementById(
        "resultSessions"
    ).textContent =
        `${formationAnswers.sessions} séances / semaine`;


    document.getElementById(
        "resultDuree"
    ).textContent =
        `${formationAnswers.duree} semaines`;


    /*
        Titre
    */

    document.getElementById(
        "resultTitle"
    ).textContent =
        `${formationLabels.alimentation[formationAnswers.alimentation]} × ${formationLabels.entrainement[formationAnswers.entrainement]}`;


    /*
        Lien vers la formation
    */

    const resultButton =
        document.getElementById("resultButton");


    const page =
        formationPages[
            formationAnswers.entrainement
        ];


    if (page) {

        resultButton.href = page;

    }


    /*
        Afficher le résultat
    */

    result.classList.add("active");

}