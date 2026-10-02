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

    options.forEach(option => {

        option.addEventListener("click", () => {

            const question =
                option.dataset.question;

            const value =
                option.dataset.value;


            // Enregistrer la réponse
            formationAnswers[question] = value;


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

                currentStep.classList.remove("active");

                nextStep.classList.add("active");

            } else {

                // Dernière question
                showFormationResult();

            }

        });

    });

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