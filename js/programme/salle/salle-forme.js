/*
 * =========================================================
   LUXA_FIT
   REMISE EN FORME
   QUESTIONNAIRE + PROGRAMME PERSONNALISÉ
========================================================= */


/* =========================================================
   ÉLÉMENTS HTML
========================================================= */

const form =
    document.getElementById("remiseFormeForm");

const programResult =
    document.getElementById("programResult");

const resultTitle =
    document.getElementById("resultTitle");

const resultDescription =
    document.getElementById("resultDescription");

const weeksContainer =
    document.getElementById("weeks");

const daysContainer =
    document.getElementById("days");

const weekNumber =
    document.getElementById("weekNumber");

const weekTitle =
    document.getElementById("weekTitle");

const phase =
    document.getElementById("phase");

const programNote =
    document.getElementById("programNote");


/* =========================================================
   PROGRAMME ACTUEL
========================================================= */

let selectedProgram = null;


/* =========================================================
   QUESTIONNAIRE
========================================================= */

if (form) {

    form.addEventListener("submit", function (event) {

        event.preventDefault();


        /* -------------------------------------------------
           RÉCUPÉRATION DES RÉPONSES
        ------------------------------------------------- */

        const niveau =
            document.getElementById("niveau").value;

        const jours =
            Number(
                document.getElementById("jours").value
            );

        const dureeSeance =
            document.getElementById("dureeSeance").value;

        const objectif =
            document.getElementById("objectif").value;

        const semaines =
            Number(
                document.getElementById("semaines").value
            );


        /* -------------------------------------------------
           VÉRIFICATION
        ------------------------------------------------- */

        if (
            !niveau ||
            !jours ||
            !dureeSeance ||
            !objectif ||
            !semaines
        ) {

            alert(
                "Merci de répondre à toutes les questions."
            );

            return;

        }


        /* -------------------------------------------------
           PROFIL UTILISATEUR
        ------------------------------------------------- */

        const userProfile = {

            niveau: niveau,

            jours: jours,

            dureeSeance: dureeSeance,

            objectif: objectif,

            semaines: semaines

        };


        console.log(
            "Profil sélectionné :",
            userProfile
        );


        /* -------------------------------------------------
           SAUVEGARDE
        ------------------------------------------------- */

        localStorage.setItem(
            "luxaFitRemiseFormeProfile",
            JSON.stringify(userProfile)
        );


        /* -------------------------------------------------
           RECHERCHE DU PROGRAMME DE BASE
        ------------------------------------------------- */

        const baseProgram =
            findProgram(userProfile);


        if (!baseProgram) {

            showProgramUnavailable(
                userProfile
            );

            return;

        }


        /* -------------------------------------------------
           CONSTRUCTION DE LA DURÉE DEMANDÉE
        ------------------------------------------------- */

        selectedProgram =
            buildProgramForDuration(
                baseProgram,
                semaines
            );


        /* -------------------------------------------------
           AFFICHAGE
        ------------------------------------------------- */

        showProgram(
            userProfile,
            selectedProgram
        );

    });

}


/* =========================================================
   RECHERCHER LE BON PROGRAMME
========================================================= */

function findProgram(profile) {

    if (!window.sallePrograms) {

        console.error(
            "La bibliothèque sallePrograms est introuvable."
        );

        return null;

    }


    const remiseForme =
        window.sallePrograms.remiseForme;


    if (!remiseForme) {

        console.error(
            "La catégorie remiseForme est introuvable."
        );

        return null;

    }


    const niveauPrograms =
        remiseForme[profile.niveau];


    if (!niveauPrograms) {

        return null;

    }


    const program =
        niveauPrograms[profile.jours];


    if (!program) {

        return null;

    }


    return program;

}


/* =========================================================
   CONSTRUIRE LE PROGRAMME SELON LA DURÉE
========================================================= */

/*
    IMPORTANT :

    salle-program.js contient actuellement
    4 semaines de base.

    Cette fonction permet de proposer :

        4 semaines
        8 semaines
        12 semaines
        16 semaines

    Les semaines supplémentaires sont construites
    à partir du cycle de base.

    Plus tard, nous pourrons remplacer ces cycles
    générés par des semaines entièrement écrites
    une par une.
*/

function buildProgramForDuration(
    baseProgram,
    requestedWeeks
) {


    /* -------------------------------------------------
       COPIE DU PROGRAMME
    ------------------------------------------------- */

    const program =
        deepClone(baseProgram);


    const baseWeeks =
        Object.keys(
            baseProgram.weeks
        )
        .map(Number)
        .sort(function (a, b) {
            return a - b;
        });


    if (!baseWeeks.length) {

        console.error(
            "Aucune semaine disponible dans le programme."
        );

        return program;

    }


    /* -------------------------------------------------
       NOMBRE DE SEMAINES AUTORISÉ
    ------------------------------------------------- */

    const allowedDurations =
        [4, 8, 12, 16];


    if (
        !allowedDurations.includes(
            requestedWeeks
        )
    ) {

        requestedWeeks = 4;

    }


    /* -------------------------------------------------
       NOUVELLE LISTE DE SEMAINES
    ------------------------------------------------- */

    const generatedWeeks = {};


    for (
        let week = 1;
        week <= requestedWeeks;
        week++
    ) {


        /* ---------------------------------------------
           SEMAINE DE BASE CORRESPONDANTE
        --------------------------------------------- */

        const baseWeekNumber =
            baseWeeks[
                (week - 1) %
                baseWeeks.length
            ];


        const originalWeek =
            baseProgram.weeks[
                baseWeekNumber
            ];


        const newWeek =
            deepClone(
                originalWeek
            );


        /* ---------------------------------------------
           CYCLE
        --------------------------------------------- */

        const cycle =
            Math.floor(
                (week - 1) /
                baseWeeks.length
            ) + 1;


        /* ---------------------------------------------
           PHASE
        --------------------------------------------- */

        const phaseData =
            getPhaseData(
                week
            );


        /* ---------------------------------------------
           TITRE
        --------------------------------------------- */

        if (cycle === 1) {

            newWeek.title =
                originalWeek.title;

        } else {

            newWeek.title =
                originalWeek.title +
                " — Cycle " +
                cycle;

        }


        /* ---------------------------------------------
           PHASE
        --------------------------------------------- */

        newWeek.phase =
            phaseData.label;


        /* ---------------------------------------------
           DESCRIPTION DES SÉANCES
        --------------------------------------------- */

        if (cycle > 1) {

            newWeek.days =
                newWeek.days.map(
                    function (day) {

                        if (
                            day.type === "REPOS"
                        ) {

                            return day;

                        }


                        const progression =
                            getProgressionInstruction(
                                cycle
                            );


                        day.description =
                            day.description +
                            " " +
                            progression;


                        return day;

                    }
                );

        }


        /* ---------------------------------------------
           ENREGISTREMENT
        --------------------------------------------- */

        generatedWeeks[week] =
            newWeek;

    }


    /* -------------------------------------------------
       REMPLACER LES SEMAINES
    ------------------------------------------------- */

    program.weeks =
        generatedWeeks;


    /* -------------------------------------------------
       NOTE GÉNÉRALE
    ------------------------------------------------- */

    program.note =
        createProgramNote(
            requestedWeeks
        );


    return program;

}


/* =========================================================
   DONNÉES DES PHASES
========================================================= */

function getPhaseData(week) {


    if (week <= 4) {

        return {

            label:
                "PHASE 1 — ADAPTATION"

        };

    }


    if (week <= 8) {

        return {

            label:
                "PHASE 2 — PROGRESSION"

        };

    }


    if (week <= 12) {

        return {

            label:
                "PHASE 3 — DÉVELOPPEMENT"

        };

    }


    return {

        label:
            "PHASE 4 — CONSOLIDATION"

    };

}


/* =========================================================
   CONSIGNES DE PROGRESSION
========================================================= */

function getProgressionInstruction(cycle) {


    if (cycle === 2) {

        return `
            Progression : cherche à ajouter
            1 répétition sur certaines séries
            ou une légère augmentation de charge
            lorsque toutes les séries sont réalisées
            avec une technique propre.
        `;

    }


    if (cycle === 3) {

        return `
            Progression : augmente progressivement
            la charge ou le nombre de répétitions.
            Garde environ 2 répétitions en réserve
            sur la majorité des séries.
        `;

    }


    if (cycle === 4) {

        return `
            Consolidation : conserve les charges
            acquises, améliore la qualité d'exécution
            et cherche une progression uniquement
            lorsque la récupération est bonne.
        `;

    }


    return "";

}


/* =========================================================
   NOTE DU PROGRAMME
========================================================= */

function createProgramNote(weeks) {


    if (weeks === 4) {

        return `
            Cycle de 4 semaines consacré à l'adaptation,
            à l'apprentissage des mouvements et à la
            construction d'une première base d'entraînement.
        `;

    }


    if (weeks === 8) {

        return `
            Programme de 8 semaines organisé en deux cycles :
            adaptation puis progression.
            Le deuxième cycle reprend la structure de base
            avec une progression progressive des charges
            ou des répétitions.
        `;

    }


    if (weeks === 12) {

        return `
            Programme de 12 semaines organisé en trois phases :
            adaptation, progression puis développement.
            La progression doit rester progressive et adaptée
            à la récupération.
        `;

    }


    if (weeks === 16) {

        return `
            Programme complet de 16 semaines organisé en
            quatre phases : adaptation, progression,
            développement et consolidation.
            L'objectif est de construire progressivement
            une base physique durable.
        `;

    }


    return "";

}


/* =========================================================
   COPIE PROFONDE
========================================================= */

function deepClone(object) {

    /*
        structuredClone permet de créer une copie profonde
        de l'objet sans modifier le programme original.
    */

    if (
        typeof structuredClone === "function"
    ) {

        return structuredClone(
            object
        );

    }


    /*
        Solution de secours pour les navigateurs
        qui ne disposent pas de structuredClone.
    */

    return JSON.parse(
        JSON.stringify(object)
    );

}


/* =========================================================
   AFFICHER LE PROGRAMME
========================================================= */

function showProgram(
    profile,
    program
) {


    /* -------------------------------------------------
       TITRE
    ------------------------------------------------- */

    resultTitle.textContent =
        program.title;


    /* -------------------------------------------------
       DESCRIPTION
    ------------------------------------------------- */

    resultDescription.innerHTML =
        createProfileDescription(
            profile
        );


    /* -------------------------------------------------
       NOTE
    ------------------------------------------------- */

    programNote.textContent =
        program.note;


    /* -------------------------------------------------
       AFFICHER LE BLOC
    ------------------------------------------------- */

    programResult.hidden =
        false;


    /* -------------------------------------------------
       CRÉER LES SEMAINES
    ------------------------------------------------- */

    createWeekButtons(
        program
    );


    /* -------------------------------------------------
       AFFICHER LA PREMIÈRE SEMAINE
    ------------------------------------------------- */

    const firstWeek =
        Object.keys(
            program.weeks
        )[0];


    showWeek(
        Number(firstWeek),
        program
    );


    /* -------------------------------------------------
       SCROLL
    ------------------------------------------------- */

    setTimeout(
        function () {

            programResult.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        },
        100
    );

}


/* =========================================================
   PROGRAMME NON DISPONIBLE
========================================================= */

function showProgramUnavailable(
    profile
) {

    programResult.hidden =
        false;


    resultTitle.textContent =
        "Programme bientôt disponible";


    resultDescription.innerHTML = `

        Ton profil a bien été enregistré :

        <strong>
            ${formatLevel(profile.niveau)}
        </strong>,

        <strong>
            ${profile.jours} séances
        </strong>
        par semaine,

        <strong>
            ${formatDuration(profile.dureeSeance)}
        </strong>,

        pendant

        <strong>
            ${profile.semaines} semaines
        </strong>.

        <br><br>

        Cette combinaison de programme est actuellement
        en cours de création.

    `;


    weeksContainer.innerHTML =
        "";


    daysContainer.innerHTML =
        "";


    weekNumber.textContent =
        "";


    weekTitle.textContent =
        "";


    phase.textContent =
        "";


    programNote.textContent =

        "Ton profil est sauvegardé. " +
        "Le programme correspondant pourra être ajouté " +
        "à la bibliothèque luxa_fit.";


    setTimeout(
        function () {

            programResult.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        },
        100
    );

}


/* =========================================================
   DESCRIPTION DU PROFIL
========================================================= */

function createProfileDescription(
    profile
) {

    const niveau =
        formatLevel(
            profile.niveau
        );


    const objectif =
        formatObjective(
            profile.objectif
        );


    return `

        Programme construit pour un profil

        <strong>
            ${niveau}
        </strong>,

        avec

        <strong>
            ${profile.jours}
            séance${profile.jours > 1 ? "s" : ""}
        </strong>

        par semaine,

        des séances de

        <strong>
            ${formatDuration(
                profile.dureeSeance
            )}
        </strong>,

        pendant

        <strong>
            ${profile.semaines} semaines
        </strong>,

        avec comme objectif :

        <strong>
            ${objectif}
        </strong>.

    `;

}


/* =========================================================
   FORMATER LE NIVEAU
========================================================= */

function formatLevel(level) {

    const levels = {

        debutant:
            "Débutant",

        reprise:
            "Reprise",

        regulier:
            "Pratiquant régulier"

    };


    return (
        levels[level] ||
        level
    );

}


/* =========================================================
   FORMATER L'OBJECTIF
========================================================= */

function formatObjective(
    objective
) {

    const objectives = {

        reprise:
            "reprendre une activité physique",

        muscle:
            "construire du muscle",

        perte:
            "perdre du gras",

        force:
            "devenir plus fort",

        condition:
            "améliorer ma condition physique"

    };


    return (

        objectives[objective] ||
        objective

    );

}


/* =========================================================
   FORMATER LA DURÉE
========================================================= */

function formatDuration(
    duration
) {

    const durations = {

        "30-45":
            "30 à 45 minutes",

        "45-60":
            "45 à 60 minutes",

        "60-90":
            "60 à 90 minutes"

    };


    return (

        durations[duration] ||
        duration

    );

}


/* =========================================================
   CRÉER LES BOUTONS DE SEMAINES
========================================================= */

function createWeekButtons(
    program
) {

    weeksContainer.innerHTML =
        "";


    const weeks =
        Object.keys(
            program.weeks
        );


    weeks.forEach(
        function (week) {


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "week-btn";


            button.textContent =
                "Semaine " +
                week;


            button.addEventListener(
                "click",
                function () {

                    showWeek(
                        Number(week),
                        program
                    );

                }
            );


            weeksContainer.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   AFFICHER UNE SEMAINE
========================================================= */

function showWeek(
    number,
    program
) {

    const selectedWeek =
        program.weeks[number];


    if (!selectedWeek) {

        console.error(
            "Semaine introuvable :",
            number
        );

        return;

    }


    /* -------------------------------------------------
       INFORMATIONS DE LA SEMAINE
    ------------------------------------------------- */

    weekNumber.textContent =
        "SEMAINE " +
        number;


    weekTitle.textContent =
        selectedWeek.title;


    phase.textContent =
        selectedWeek.phase;


    /* -------------------------------------------------
       VIDER LES ANCIENNES SÉANCES
    ------------------------------------------------- */

    daysContainer.innerHTML =
        "";


    /* -------------------------------------------------
       CRÉER LES CARTES
    ------------------------------------------------- */

    selectedWeek.days.forEach(
        function (day) {


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "day-card" +
                (
                    day.type === "REPOS"
                        ? " rest"
                        : ""
                );


            /* -----------------------------------------
               EXERCICES
            ----------------------------------------- */

            const exercisesHTML =
                day.exercises
                    .map(
                        function (exercise) {

                            return `

                                <li>
                                    ${exercise}
                                </li>

                            `;

                        }
                    )
                    .join("");


            /* -----------------------------------------
               HTML DE LA CARTE
            ----------------------------------------- */

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


            daysContainer.appendChild(
                card
            );

        }
    );


    /* -------------------------------------------------
       BOUTON ACTIF
    ------------------------------------------------- */

    const weekButtons =
        document.querySelectorAll(
            ".week-btn"
        );


    weekButtons.forEach(
        function (button) {


            const buttonWeek =
                Number(
                    button.textContent.replace(
                        /\D/g,
                        ""
                    )
                );


            button.classList.toggle(

                "active",

                buttonWeek === number

            );

        }
    );

}


/* =========================================================
   RESTAURER LE PROFIL
========================================================= */

function restoreProfile() {

    const savedProfile =
        localStorage.getItem(
            "luxaFitRemiseFormeProfile"
        );


    if (!savedProfile) {

        return;

    }


    try {

        const profile =
            JSON.parse(
                savedProfile
            );


        document.getElementById(
            "niveau"
        ).value =
            profile.niveau;


        document.getElementById(
            "jours"
        ).value =
            profile.jours;


        document.getElementById(
            "dureeSeance"
        ).value =
            profile.dureeSeance;


        document.getElementById(
            "objectif"
        ).value =
            profile.objectif;


        document.getElementById(
            "semaines"
        ).value =
            profile.semaines;


        console.log(
            "Profil précédent restauré :",
            profile
        );


    } catch (error) {

        console.error(

            "Erreur lors de la restauration " +
            "du profil :",

            error

        );

    }

}


/* =========================================================
   INITIALISATION
========================================================= */

restoreProfile();


/* =========================================================
   TITRE DE LA PAGE
========================================================= */

document.title =
    "luxa_fit | Remise en forme";