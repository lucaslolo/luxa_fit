/* =========================================================
   LUXA_FIT
   DASHBOARD.JS
   ========================================================= */


/* =========================================================
   1. VARIABLES GLOBALES
   ========================================================= */

let currentUser = null;

let profile = null;

let bodyMeasurements = [];

let performances = [];

let goals = [];


/* =========================================================
   2. OUTILS
   ========================================================= */

function dashboardFormatTime(seconds) {

    seconds = Number(seconds);

    if (!Number.isFinite(seconds)) {
        return "--:--";
    }

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const secs =
        Math.floor(seconds % 60);


    if (hours > 0) {

        return (
            String(hours).padStart(2, "0") +
            ":" +
            String(minutes).padStart(2, "0") +
            ":" +
            String(secs).padStart(2, "0")
        );

    }


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}


function dashboardTimeToSeconds(value) {

    if (!value) {
        return NaN;
    }

    const parts =
        value
            .trim()
            .split(":")
            .map(Number);


    if (
        parts.some(
            number =>
                !Number.isFinite(number)
        )
    ) {

        return NaN;

    }


    if (parts.length === 2) {

        const minutes = parts[0];

        const seconds = parts[1];


        if (
            minutes < 0 ||
            seconds < 0 ||
            seconds >= 60
        ) {

            return NaN;

        }


        return (
            minutes * 60 +
            seconds
        );

    }


    if (parts.length === 3) {

        const hours = parts[0];

        const minutes = parts[1];

        const seconds = parts[2];


        if (
            hours < 0 ||
            minutes < 0 ||
            seconds < 0 ||
            minutes >= 60 ||
            seconds >= 60
        ) {

            return NaN;

        }


        return (
            hours * 3600 +
            minutes * 60 +
            seconds
        );

    }


    return NaN;

}


function dashboardFormatDate(date) {

    if (!date) {
        return "-";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return date;

    }


    return parsed.toLocaleDateString(
        "fr-BE"
    );

}


function todayString() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


function setupDashboardQuickNavigation() {

    const navigation =
        document.querySelector(
            ".dashboard-quick-nav"
        );

    if (!navigation) {
        return;
    }

    const links =
        Array.from(
            navigation.querySelectorAll(
                "a[href^='#']"
            )
        );

    const sections =
        links
            .map(link =>
                document.getElementById(
                    link.getAttribute("href").slice(1)
                )
            )
            .filter(Boolean);

    if (!sections.length) {
        return;
    }

    const setActiveLink = sectionId => {
        links.forEach(link => {
            const isActive =
                link.getAttribute("href") ===
                `#${sectionId}`;

            if (isActive) {
                link.setAttribute(
                    "aria-current",
                    "true"
                );
            } else {
                link.removeAttribute(
                    "aria-current"
                );
            }
        });
    };

    setActiveLink(sections[0].id);

    if ("IntersectionObserver" in window) {
        const observer =
            new IntersectionObserver(
                entries => {
                    const visibleSections =
                        entries
                            .filter(entry =>
                                entry.isIntersecting
                            )
                            .sort(
                                (first, second) =>
                                    second.intersectionRatio -
                                    first.intersectionRatio
                            );

                    if (visibleSections.length) {
                        setActiveLink(
                            visibleSections[0].target.id
                        );
                    }
                },
                {
                    rootMargin: "-84px 0px -55% 0px",
                    threshold: [0, .25, .5, .75, 1]
                }
            );

        sections.forEach(section =>
            observer.observe(section)
        );
    }

}


/* =========================================================
   3. NOMS DES PERFORMANCES
   ========================================================= */

const PERFORMANCE_NAMES = {

    bench_actuel:
        "🏋️ Bench press",

    squat_actuel:
        "🏋️ Squat",

    deadlift_actuel:
        "🏋️ Deadlift",


    course_5km:
        "🏃 Course 5 km",

    course_10km:
        "🏃 Course 10 km",

    course_21km:
        "🏃 Semi-marathon",

    course_42km:
        "🏃 Marathon",

    course_km_semaine:
        "🏃 Volume hebdomadaire",


    "hyrox solo open homme":
        "🔥 HYROX Solo Open Homme",

    "hyrox solo pro homme":
        "🔥 HYROX Solo Pro Homme",

    "hyrox solo open femme":
        "🔥 HYROX Solo Open Femme",

    "hyrox solo pro femme":
        "🔥 HYROX Solo Pro Femme",

    "hyrox mixte":
        "🔥 HYROX Mixte",

    "hyrox homme/homme":
        "🔥 HYROX Homme / Homme",

    "hyrox femme/femme":
        "🔥 HYROX Femme / Femme"

};


function getPerformanceName(type) {

    return (
        PERFORMANCE_NAMES[type] ||
        type
    );

}


/* =========================================================
   4. TYPES DE PERFORMANCE
   ========================================================= */

const MANUAL_PERFORMANCE_TYPES = [

    {
        value: "bench_actuel",
        label: "Bench press",
        unit: "kg",
        kind: "number"
    },

    {
        value: "squat_actuel",
        label: "Squat",
        unit: "kg",
        kind: "number"
    },

    {
        value: "deadlift_actuel",
        label: "Deadlift",
        unit: "kg",
        kind: "number"
    },

    {
        value: "course_5km",
        label: "Course 5 km",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "course_10km",
        label: "Course 10 km",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "course_21km",
        label: "Course 21 km",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "course_42km",
        label: "Marathon",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "course_km_semaine",
        label: "Kilomètres par semaine",
        unit: "km",
        kind: "number"
    },

    {
        value: "hyrox solo open homme",
        label: "HYROX Solo Open Homme",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "hyrox solo pro homme",
        label: "HYROX Solo Pro Homme",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "hyrox solo open femme",
        label: "HYROX Solo Open Femme",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "hyrox solo pro femme",
        label: "HYROX Solo Pro Femme",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "hyrox mixte",
        label: "HYROX Mixte",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "hyrox homme/homme",
        label: "HYROX Homme / Homme",
        unit: "chrono",
        kind: "time"
    },

    {
        value: "hyrox femme/femme",
        label: "HYROX Femme / Femme",
        unit: "chrono",
        kind: "time"
    }

];


/* =========================================================
   5. DOM
   ========================================================= */

const questionnaireForm =
    document.getElementById(
        "questionnaireForm"
    );

const performanceForm =
    document.getElementById(
        "performanceForm"
    );

const goalForm =
    document.getElementById(
        "goalForm"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================================================
   6. CHARGER L'UTILISATEUR
   ========================================================= */

async function loadDashboardUser() {

    try {

        const response =
            await fetch(
                "/api/me",
                {
                    credentials:
                        "same-origin"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            window.location.href =
                "connexion.html";

            return false;

        }


        currentUser =
            data.user;


        const userName =
            document.getElementById(
                "userName"
            );


        if (userName) {

            userName.textContent =
                currentUser.prenom +
                " " +
                currentUser.nom;

        }

        const dashboardUserDisplay =
            document.getElementById(
                "dashboardUserDisplay"
            );

        if (dashboardUserDisplay) {
            dashboardUserDisplay.textContent =
                `Bonjour ${currentUser.prenom}`;
        }


        const profilePrenom =
            document.getElementById(
                "profilePrenom"
            );


        const profileNom =
            document.getElementById(
                "profileNom"
            );


        const profileId =
            document.getElementById(
                "profileId"
            );


        if (profilePrenom) {
            profilePrenom.textContent =
                currentUser.prenom;
        }


        if (profileNom) {
            profileNom.textContent =
                currentUser.nom;
        }


        if (profileId) {
            profileId.textContent =
                currentUser.id;
        }


        return true;


    } catch (error) {

        console.error(
            "Erreur utilisateur :",
            error
        );


        window.location.href =
            "connexion.html";


        return false;

    }

}


/* =========================================================
   7. CHARGER LE PROFIL
   ========================================================= */

async function loadProfile() {

    try {

        const response =
            await fetch(
                "/api/profile",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "connexion.html";

            return;

        }


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                data.message
            );

            return;

        }


        profile =
            data.profile;


        displayProfile();


    } catch (error) {

        console.error(
            "Erreur profil :",
            error
        );

    }

}


/* =========================================================
   8. AFFICHER LE PROFIL
   ========================================================= */

function displayProfile() {

    if (!profile) {
        return;
    }


    const profileDate =
        document.getElementById(
            "profileDateNaissance"
        );


    const profileSexe =
        document.getElementById(
            "profileSexe"
        );


    const profileTaille =
        document.getElementById(
            "profileTaille"
        );


    const profileNiveau =
        document.getElementById(
            "profileNiveau"
        );


    const profileObjectif =
        document.getElementById(
            "profileObjectif"
        );


    if (profileDate) {

        profileDate.textContent =
            profile.date_naissance
                ? dashboardFormatDate(
                    profile.date_naissance
                )
                : "--";

    }


    if (profileSexe) {

        const sexes = {

            homme: "Homme",

            femme: "Femme",

            autre: "Autre"

        };


        profileSexe.textContent =
            sexes[profile.sexe] ||
            "--";

    }


    if (profileTaille) {

        profileTaille.textContent =
            profile.taille
                ? Number(
                    profile.taille
                ).toFixed(0) + " cm"
                : "--";

    }


    if (profileNiveau) {

        const levels = {

            debutant: "Débutant",

            intermediaire:
                "Intermédiaire",

            avance:
                "Avancé"

        };


        profileNiveau.textContent =
            levels[profile.niveau] ||
            "--";

    }


    if (profileObjectif) {

        profileObjectif.textContent =
            profile.objectif_principal ||
            "--";

    }


    /* Pré-remplir le questionnaire */

    const dateNaissance =
        document.getElementById(
            "date_naissance"
        );

    const sexe =
        document.getElementById(
            "sexe"
        );

    const taille =
        document.getElementById(
            "taille"
        );

    const niveau =
        document.getElementById(
            "niveau"
        );

    const objectif =
        document.getElementById(
            "objectif_principal"
        );


    if (dateNaissance) {
        dateNaissance.value =
            profile.date_naissance
                ? String(
                    profile.date_naissance
                ).slice(0, 10)
                : "";
    }


    if (sexe) {
        sexe.value =
            profile.sexe || "";
    }


    if (taille) {
        taille.value =
            profile.taille || "";
    }


    if (niveau) {
        niveau.value =
            profile.niveau || "";
    }


    if (objectif) {
        objectif.value =
            profile.objectif_principal ||
            "";
    }

}


/* =========================================================
   9. CHARGER LES MENSURATIONS
   ========================================================= */

async function loadBodyMeasurements() {

    try {

        const response =
            await fetch(
                "/api/body-measurements",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "connexion.html";

            return;

        }


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                data.message
            );

            return;

        }


        bodyMeasurements =
            data.measurements || [];


        displayBodyMeasurements();


    } catch (error) {

        console.error(
            "Erreur mensurations :",
            error
        );

    }

}


/* =========================================================
   10. AFFICHER LES MENSURATIONS
   ========================================================= */

function displayBodyMeasurements() {

    const latest =
        bodyMeasurements[0];


    const elements = {

        bodyWeight:
            latest?.poids,

        bodyWaist:
            latest?.tour_taille,

        bodyHip:
            latest?.tour_hanche,

        bodyArm:
            latest?.tour_bras,

        bodyThigh:
            latest?.tour_cuisse,

        bodyCalf:
            latest?.tour_mollet,

        bodyChest:
            latest?.tour_torse

    };


    Object.entries(
        elements
    ).forEach(
        function ([id, value]) {

            const element =
                document.getElementById(id);


            if (!element) {
                return;
            }


            element.textContent =
                value !== null &&
                value !== undefined
                    ? Number(value)
                        .toFixed(1)
                    : "--";

        }
    );


    /* Pré-remplir le questionnaire */

    if (!latest) {
        return;
    }


    const fields = [

        "poids",
        "tour_taille",
        "tour_hanche",
        "tour_bras",
        "tour_cuisse",
        "tour_mollet",
        "tour_torse"

    ];


    fields.forEach(
        function (field) {

            const input =
                document.getElementById(
                    field
                );


            if (!input) {
                return;
            }


            const dbField =
                field === "tour_taille"
                    ? "tour_taille"
                    : field === "tour_hanche"
                        ? "tour_hanche"
                        : field === "tour_bras"
                            ? "tour_bras"
                            : field === "tour_cuisse"
                                ? "tour_cuisse"
                                : field === "tour_mollet"
                                    ? "tour_mollet"
                                    : field === "tour_torse"
                                        ? "tour_torse"
                                        : field;


            if (
                latest[dbField] !== null &&
                latest[dbField] !== undefined
            ) {

                input.value =
                    latest[dbField];

            }

        }
    );

}


/* =========================================================
   11. CHARGER LES PERFORMANCES
   ========================================================= */

async function loadPerformances() {

    try {

        const response =
            await fetch(
                "/api/performances",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "connexion.html";

            return;

        }


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                data.message
            );

            return;

        }


        performances =
            data.performances || [];


        updatePerformanceCards();

        renderPerformanceHistory();

        drawCharts();

    } catch (error) {

        console.error(
            "Erreur performances :",
            error
        );

    }

}


/* =========================================================
   12. PERFORMANCE ACTUELLE PAR TYPE
   ========================================================= */

function latestPerformance(type) {

    return performances.find(
        performance =>
            performance.type === type
    );

}


/* =========================================================
   13. AFFICHER LES CARTES PERFORMANCE
   ========================================================= */

function updatePerformanceCards() {

    const bench =
        latestPerformance(
            "bench_actuel"
        );

    const squat =
        latestPerformance(
            "squat_actuel"
        );

    const deadlift =
        latestPerformance(
            "deadlift_actuel"
        );

    const run5k =
        latestPerformance(
            "course_5km"
        );

    const run10k =
        latestPerformance(
            "course_10km"
        );

    const hyrox =
        performances.find(
            performance =>
                performance.type.startsWith(
                    "hyrox "
                )
        );

    const weeklyKm =
        latestPerformance(
            "course_km_semaine"
        );


    setText(
        "bench",
        bench
            ? Number(bench.value).toFixed(1)
            : "--"
    );


    setText(
        "squat",
        squat
            ? Number(squat.value).toFixed(1)
            : "--"
    );


    setText(
        "deadlift",
        deadlift
            ? Number(deadlift.value).toFixed(1)
            : "--"
    );


    setText(
        "run5k",
        run5k
            ? dashboardFormatTime(
                run5k.value
            )
            : "--:--"
    );


    setText(
        "run10k",
        run10k
            ? dashboardFormatTime(
                run10k.value
            )
            : "--:--"
    );


    setText(
        "hyrox",
        hyrox
            ? dashboardFormatTime(
                hyrox.value
            )
            : "--:--:--"
    );


    setText(
        "weeklyKm",
        weeklyKm
            ? Number(
                weeklyKm.value
            ).toFixed(1)
            : "--"
    );

}


/* =========================================================
   14. UTILITAIRE TEXTE
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   15. HISTORIQUE PERFORMANCE
   ========================================================= */

function renderPerformanceHistory() {

    const tbody =
        document.getElementById(
            "performanceHistory"
        );


    if (!tbody) {
        return;
    }


    if (
        performances.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4">

                    Aucune performance enregistrée.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML = "";


    performances.forEach(
        function (performance) {

            const row =
                document.createElement(
                    "tr"
                );


            const dateCell =
                document.createElement(
                    "td"
                );


            dateCell.textContent =
                dashboardFormatDate(
                    performance.date
                );


            const typeCell =
                document.createElement(
                    "td"
                );


            typeCell.textContent =
                getPerformanceName(
                    performance.type
                );


            const valueCell =
                document.createElement(
                    "td"
                );


            valueCell.textContent =
                formatPerformanceValue(
                    performance
                );


            const actionCell =
                document.createElement(
                    "td"
                );


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";

            button.className =
                "delete-button";

            button.textContent =
                "Supprimer";


            button.addEventListener(
                "click",
                function () {

                    deletePerformance(
                        performance.id
                    );

                }
            );


            actionCell.appendChild(
                button
            );


            row.appendChild(
                dateCell
            );

            row.appendChild(
                typeCell
            );

            row.appendChild(
                valueCell
            );

            row.appendChild(
                actionCell
            );


            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   16. FORMAT PERFORMANCE
   ========================================================= */

function formatPerformanceValue(
    performance
) {

    const type =
        performance.type;

    const value =
        performance.value;


    if (
        type === "bench_actuel" ||
        type === "squat_actuel" ||
        type === "deadlift_actuel"
    ) {

        return (
            Number(value)
                .toFixed(1) +
            " kg"
        );

    }


    if (
        type === "course_km_semaine"
    ) {

        return (
            Number(value)
                .toFixed(1) +
            " km"
        );

    }


    if (
        type.startsWith(
            "course_"
        ) ||
        type.startsWith(
            "hyrox "
        )
    ) {

        return dashboardFormatTime(
            value
        );

    }


    return value;

}


/* =========================================================
   17. SUPPRIMER UNE PERFORMANCE
   ========================================================= */

async function deletePerformance(
    id
) {

    if (
        !confirm(
            "Supprimer cette performance ?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/performances/" +
                id,
                {
                    method: "DELETE",
                    credentials:
                        "same-origin"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Impossible de supprimer."
            );

            return;

        }


        await loadPerformances();


    } catch (error) {

        console.error(error);

        alert(
            "Impossible de contacter le serveur."
        );

    }

}


/* =========================================================
   18. GRAPHIQUES
   ========================================================= */

function drawCharts() {

    drawWeightChart();

    drawRunChart();

}


/* =========================================================
   19. GRAPHIQUE POIDS
   ========================================================= */

function drawWeightChart() {

    const canvas =
        document.getElementById(
            "weightChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    const data =
        bodyMeasurements
            .filter(
                item =>
                    item.poids !== null &&
                    item.poids !== undefined
            )
            .slice()
            .reverse();


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (data.length === 0) {

        drawEmptyChart(
            ctx,
            canvas,
            "Aucune donnée de poids"
        );

        return;

    }


    drawLineChart(
        ctx,
        canvas,
        data.map(
            item =>
                Number(item.poids)
        ),
        data.map(
            item =>
                dashboardFormatDate(
                    item.date
                )
        ),
        "kg"
    );

}


/* =========================================================
   20. GRAPHIQUE 5 KM
   ========================================================= */

function drawRunChart() {

    const canvas =
        document.getElementById(
            "runChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    const data =
        performances
            .filter(
                item =>
                    item.type ===
                    "course_5km"
            )
            .slice()
            .reverse();


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (data.length === 0) {

        drawEmptyChart(
            ctx,
            canvas,
            "Aucune donnée de 5 km"
        );

        return;

    }


    drawLineChart(
        ctx,
        canvas,
        data.map(
            item =>
                Number(item.value)
        ),
        data.map(
            item =>
                dashboardFormatDate(
                    item.date
                )
        ),
        "time"
    );

}


/* =========================================================
   21. GRAPHIQUE VIDE
   ========================================================= */

function drawEmptyChart(
    ctx,
    canvas,
    message
) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.font =
        "14px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        message,
        canvas.width / 2,
        canvas.height / 2
    );

}


/* =========================================================
   22. DESSIN GRAPHIQUE
   ========================================================= */

function drawLineChart(
    ctx,
    canvas,
    values,
    labels,
    unit
) {

    const width =
        canvas.width;

    const height =
        canvas.height;

    const padding =
        45;


    const max =
        Math.max(
            ...values
        );

    const min =
        Math.min(
            ...values
        );


    const range =
        max - min || 1;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* Axes */

    ctx.beginPath();

    ctx.moveTo(
        padding,
        20
    );

    ctx.lineTo(
        padding,
        height - padding
    );

    ctx.lineTo(
        width - 20,
        height - padding
    );

    ctx.stroke();


    /* Ligne */

    ctx.beginPath();


    values.forEach(
        function (
            value,
            index
        ) {

            const x =
                values.length === 1
                    ? width / 2
                    : padding +
                      (
                        index /
                        (values.length - 1)
                      ) *
                      (
                        width -
                        padding -
                        30
                      );


            const y =
                height -
                padding -
                (
                    (
                        value - min
                    ) /
                    range
                ) *
                (
                    height -
                    padding -
                    40
                );


            if (index === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );


    ctx.stroke();


    /* Points */

    values.forEach(
        function (
            value,
            index
        ) {

            const x =
                values.length === 1
                    ? width / 2
                    : padding +
                      (
                        index /
                        (values.length - 1)
                      ) *
                      (
                        width -
                        padding -
                        30
                      );


            const y =
                height -
                padding -
                (
                    (
                        value - min
                    ) /
                    range
                ) *
                (
                    height -
                    padding -
                    40
                );


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );


    /* Unité */

    ctx.font =
        "12px Arial";

    ctx.textAlign =
        "left";

    ctx.fillText(
        unit,
        10,
        15
    );

}


/* =========================================================
   23. QUESTIONNAIRE
   ========================================================= */

if (questionnaireForm) {

    questionnaireForm.addEventListener(
        "submit",
        submitQuestionnaire
    );

}


async function submitQuestionnaire(
    event
) {

    event.preventDefault();


    const message =
        document.getElementById(
            "questionnaireMessage"
        );


    const getValue =
        id => {

            const element =
                document.getElementById(id);

            return element
                ? element.value
                : "";

        };


    const payload = {

        date_naissance:
            getValue(
                "date_naissance"
            ),

        sexe:
            getValue(
                "sexe"
            ),

        taille:
            getValue(
                "taille"
            ),

        niveau:
            getValue(
                "niveau"
            ),

        objectif_principal:
            getValue(
                "objectif_principal"
            ),


        poids:
            getValue(
                "poids"
            ),

        tour_taille:
            getValue(
                "tour_taille"
            ),

        tour_hanche:
            getValue(
                "tour_hanche"
            ),

        tour_bras:
            getValue(
                "tour_bras"
            ),

        tour_cuisse:
            getValue(
                "tour_cuisse"
            ),

        tour_mollet:
            getValue(
                "tour_mollet"
            ),

        tour_torse:
            getValue(
                "tour_torse"
            ),


        bench_actuel:
            getValue(
                "bench_actuel"
            ),

        squat_actuel:
            getValue(
                "squat_actuel"
            ),

        deadlift_actuel:
            getValue(
                "deadlift_actuel"
            ),


        course_5km:
            convertQuestionnaireTime(
                getValue(
                    "course_5km"
                )
            ),

        course_10km:
            convertQuestionnaireTime(
                getValue(
                    "course_10km"
                )
            ),

        course_21km:
            convertQuestionnaireTime(
                getValue(
                    "course_21km"
                )
            ),

        course_42km:
            convertQuestionnaireTime(
                getValue(
                    "course_42km"
                )
            ),

        course_km_semaine:
            getValue(
                "course_km_semaine"
            ),


        hyrox_solo_open_homme:
            convertQuestionnaireTime(
                getValue(
                    "hyrox_solo_open_homme"
                )
            ),

        hyrox_solo_pro_homme:
            convertQuestionnaireTime(
                getValue(
                    "hyrox_solo_pro_homme"
                )
            ),

        hyrox_solo_open_femme:
            convertQuestionnaireTime(
                getValue(
                    "hyrox_solo_open_femme"
                )
            ),

        hyrox_solo_pro_femme:
            convertQuestionnaireTime(
                getValue(
                    "hyrox_solo_pro_femme"
                )
            ),

        hyrox_mixte:
            convertQuestionnaireTime(
                getValue(
                    "hyrox_mixte"
                )
            ),

        hyrox_homme_homme:
            convertQuestionnaireTime(
                getValue(
                    "hyrox_homme_homme"
                )
            ),

        hyrox_femme_femme:
            convertQuestionnaireTime(
                getValue(
                    "hyrox_femme_femme"
                )
            ),


        date:
            todayString()

    };


    try {

        const response =
            await fetch(
                "/api/questionnaire",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Erreur lors de l'enregistrement.";

            return;

        }


        message.textContent =
            "✅ Questionnaire enregistré !";


        await Promise.all([

            loadProfile(),

            loadBodyMeasurements(),

            loadPerformances()

        ]);


    } catch (error) {

        console.error(error);


        message.textContent =
            "Impossible de contacter le serveur.";

    }

}


/* =========================================================
   24. CONVERSION CHRONO QUESTIONNAIRE
   ========================================================= */

function convertQuestionnaireTime(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "";

    }


    const seconds =
        dashboardTimeToSeconds(
            value
        );


    return Number.isFinite(
        seconds
    )
        ? seconds
        : value;

}


/* =========================================================
   25. OBJECTIFS
   ========================================================= */

async function loadGoals() {

    try {

        const response =
            await fetch(
                "/api/goals",
                {
                    credentials:
                        "same-origin"
                }
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "connexion.html";

            return;

        }


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                data.message
            );

            return;

        }


        goals =
            data.goals || [];


        renderGoals();


    } catch (error) {

        console.error(
            "Erreur objectifs :",
            error
        );

    }

}


/* =========================================================
   26. AFFICHER LES OBJECTIFS
   ========================================================= */

function renderGoals() {

    const container =
        document.getElementById(
            "goalsList"
        );


    if (!container) {
        return;
    }


    if (goals.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                Aucun objectif enregistré.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    goals.forEach(
        function (goal) {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "goal-card";


            article.innerHTML = `

                <div>

                    <small>
                        ${escapeHTML(
                            goal.type
                        )}
                    </small>

                    <h3>
                        ${escapeHTML(
                            goal.nom
                        )}
                    </h3>

                    <p>
                        ${
                            goal.valeur_cible !== null
                                ? escapeHTML(
                                    String(
                                        goal.valeur_cible
                                    )
                                ) +
                                  " " +
                                  escapeHTML(
                                    goal.unite || ""
                                  )
                                : "Objectif sans valeur"
                        }
                    </p>

                </div>

                <button
                    type="button"
                    class="delete-button"
                    data-goal-id="${goal.id}"
                >
                    Supprimer
                </button>

            `;


            const button =
                article.querySelector(
                    "[data-goal-id]"
                );


            button.addEventListener(
                "click",
                function () {

                    deleteGoal(
                        goal.id
                    );

                }
            );


            container.appendChild(
                article
            );

        }
    );

}


/* =========================================================
   27. AJOUT OBJECTIF
   ========================================================= */

if (goalForm) {

    goalForm.addEventListener(
        "submit",
        addGoal
    );

}


async function addGoal(
    event
) {

    event.preventDefault();


    const message =
        document.getElementById(
            "goalMessage"
        );


    const payload = {

        type:
            document.getElementById(
                "goalType"
            ).value,

        nom:
            document.getElementById(
                "goalName"
            ).value.trim(),

        valeur_cible:
            document.getElementById(
                "goalTarget"
            ).value,

        valeur_actuelle:
            document.getElementById(
                "goalCurrent"
            ).value,

        unite:
            document.getElementById(
                "goalUnit"
            ).value.trim(),

        date_cible:
            document.getElementById(
                "goalDate"
            ).value

    };


    try {

        const response =
            await fetch(
                "/api/goals",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Erreur.";

            return;

        }


        message.textContent =
            "✅ Objectif ajouté.";


        goalForm.reset();


        await loadGoals();


    } catch (error) {

        console.error(error);


        message.textContent =
            "Impossible de contacter le serveur.";

    }

}


/* =========================================================
   28. SUPPRIMER OBJECTIF
   ========================================================= */

async function deleteGoal(
    id
) {

    if (
        !confirm(
            "Supprimer cet objectif ?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/goals/" + id,
                {

                    method: "DELETE",

                    credentials:
                        "same-origin"

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Impossible de supprimer."
            );

            return;

        }


        await loadGoals();


    } catch (error) {

        console.error(error);

        alert(
            "Impossible de contacter le serveur."
        );

    }

}


/* =========================================================
   29. SÉLECTEUR PERFORMANCE
   ========================================================= */

function setupPerformanceSelector() {

    const select =
        document.getElementById(
            "performanceType"
        );

    const input =
        document.getElementById(
            "performanceValue"
        );

    const help =
        document.getElementById(
            "performanceHelp"
        );


    if (!select) {
        return;
    }


    MANUAL_PERFORMANCE_TYPES.forEach(
        function (item) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.value;

            option.textContent =
                item.label;


            select.appendChild(
                option
            );

        }
    );


    select.addEventListener(
        "change",
        function () {

            const selected =
                MANUAL_PERFORMANCE_TYPES.find(
                    item =>
                        item.value ===
                        select.value
                );


            if (!selected) {

                input.placeholder =
                    "Valeur";

                help.textContent =
                    "Sélectionne une performance.";

                return;

            }


            if (
                selected.kind ===
                "time"
            ) {

                input.placeholder =
                    selected.value ===
                    "hyrox"
                        ? "1:20:00"
                        : "20:23";


                help.textContent =
                    "Chrono : 20:23 ou 1:20:00";

            } else {

                input.placeholder =
                    "Exemple : 100";


                help.textContent =
                    selected.unit ===
                    "km"
                        ? "Exemple : 30"
                        : "Exemple : 100 kg";

            }

        }
    );

}


/* =========================================================
   30. AJOUT MANUEL PERFORMANCE
   ========================================================= */

if (performanceForm) {

    performanceForm.addEventListener(
        "submit",
        addManualPerformance
    );

}


async function addManualPerformance(
    event
) {

    event.preventDefault();


    const type =
        document.getElementById(
            "performanceType"
        ).value;


    const rawValue =
        document.getElementById(
            "performanceValue"
        ).value.trim();


    const date =
        document.getElementById(
            "performanceDate"
        ).value;


    const message =
        document.getElementById(
            "performanceMessage"
        );


    if (
        !type ||
        !rawValue ||
        !date
    ) {

        message.textContent =
            "Remplis tous les champs.";

        return;

    }


    const definition =
        MANUAL_PERFORMANCE_TYPES.find(
            item =>
                item.value ===
                type
        );


    if (!definition) {
        return;
    }


    let value;


    if (
        definition.kind ===
        "time"
    ) {

        value =
            dashboardTimeToSeconds(
                rawValue
            );


        if (
            !Number.isFinite(
                value
            ) ||
            value <= 0
        ) {

            message.textContent =
                "Chrono invalide.";

            return;

        }

    } else {

        value =
            Number(
                rawValue.replace(
                    ",",
                    "."
                )
            );


        if (
            !Number.isFinite(
                value
            ) ||
            value < 0
        ) {

            message.textContent =
                "Valeur numérique invalide.";

            return;

        }

    }


    try {

        const response =
            await fetch(
                "/api/performances",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "same-origin",

                    body:
                        JSON.stringify({

                            type,

                            value,

                            date

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Erreur.";

            return;

        }


        message.textContent =
            "✅ Performance enregistrée.";


        document.getElementById(
            "performanceValue"
        ).value = "";


        await loadPerformances();


    } catch (error) {

        console.error(error);


        message.textContent =
            "Impossible de contacter le serveur.";

    }

}


/* =========================================================
   31. DATE PAR DÉFAUT
   ========================================================= */

function setupDates() {

    const questionnaireDate =
        document.getElementById(
            "questionnaireDate"
        );


    const performanceDate =
        document.getElementById(
            "performanceDate"
        );


    const goalDate =
        document.getElementById(
            "goalDate"
        );


    if (questionnaireDate) {

        questionnaireDate.value =
            todayString();

    }


    if (performanceDate) {

        performanceDate.value =
            todayString();

    }


    if (goalDate) {

        goalDate.min =
            todayString();

    }

}


/* =========================================================
   32. COMPTE À REBOURS HYROX
   ========================================================= */

function startCountdown() {

    const element =
        document.getElementById(
            "countdown"
        );


    if (!element) {
        return;
    }


    const target =
        new Date(
            "2027-01-28T00:00:00"
        );


    function update() {

        const now =
            new Date();


        const difference =
            target - now;


        if (
            difference <= 0
        ) {

            element.textContent =
                "🔥 Objectif atteint !";

            return;

        }


        const days =
            Math.floor(
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        const hours =
            Math.floor(
                (
                    difference /
                    (
                        1000 *
                        60 *
                        60
                    )
                ) % 24
            );


        const minutes =
            Math.floor(
                (
                    difference /
                    (
                        1000 *
                        60
                    )
                ) % 60
            );


        const seconds =
            Math.floor(
                (
                    difference /
                    1000
                ) % 60
            );


        element.textContent =
            `${days}j ${hours}h ${minutes}m ${seconds}s`;

    }


    update();


    setInterval(
        update,
        1000
    );

}


/* =========================================================
   33. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   34. DÉCONNEXION
   ========================================================= */

function setupLogout() {

    document.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    "#logoutButton"
                );


            if (!button) {
                return;
            }


            try {

                const response =
                    await fetch(
                        "/api/logout",
                        {
                            method: "POST",
                            credentials:
                                "same-origin"
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    localStorage.removeItem(
                        "user"
                    );


                    window.location.href =
                        "index.html";

                }

            } catch (error) {

                console.error(error);

            }

        }
    );

}


function setupQuestionnaireSections() {

    const form =
        document.getElementById(
            "questionnaireForm"
        );


    if (!form) {
        return;
    }

    if (
        form.dataset.sectionsReady ===
        "true"
    ) {
        return;
    }


    const children =
        Array.from(
            form.children
        );

    const hasSections =
        children.some(
            child =>
                child.classList.contains(
                    "form-group-title"
                )
        );


    if (!hasSections) {
        return;
    }


    const formContent =
        document.createDocumentFragment();

    let currentPanel = null;
    let sectionIndex = 0;
    let actions = null;


    children.forEach(
        child => {

            if (
                child.classList.contains(
                    "form-group-title"
                )
            ) {

                const group =
                    document.createElement(
                        "section"
                    );

                group.className =
                    "questionnaire-group";

                sectionIndex += 1;

                const panelId =
                    `questionnaire-panel-${sectionIndex}`;

                const toggle =
                    document.createElement(
                        "button"
                    );

                toggle.type =
                    "button";

                toggle.className =
                    "questionnaire-toggle";

                toggle.textContent =
                    child.textContent.trim();

                toggle.id =
                    `questionnaire-toggle-${sectionIndex}`;

                toggle.setAttribute(
                    "aria-controls",
                    panelId
                );

                toggle.setAttribute(
                    "aria-expanded",
                    "false"
                );


                const panel =
                    document.createElement(
                        "div"
                    );

                panel.className =
                    "questionnaire-panel";

                panel.id =
                    panelId;

                panel.setAttribute(
                    "role",
                    "region"
                );

                panel.setAttribute(
                    "aria-labelledby",
                    toggle.id
                );

                panel.hidden =
                    true;


                toggle.addEventListener(
                    "click",
                    function () {

                        const expanded =
                            toggle.getAttribute(
                                "aria-expanded"
                            ) === "true";

                        toggle.setAttribute(
                            "aria-expanded",
                            String(!expanded)
                        );

                        panel.hidden =
                            expanded;

                    }
                );


                group.append(
                    toggle,
                    panel
                );

                formContent.append(
                    group
                );

                currentPanel =
                    panel;

                return;
            }


            if (
                child.id ===
                "questionnaireDate" ||
                child.classList.contains(
                    "form-message"
                ) ||
                child.classList.contains(
                    "form-submit"
                )
            ) {

                if (!actions) {

                    actions =
                        document.createElement(
                            "div"
                        );

                    actions.className =
                        "questionnaire-actions";

                    formContent.append(
                        actions
                    );

                }

                actions.append(
                    child
                );

                return;
            }


            if (currentPanel) {
                currentPanel.append(
                    child
                );
            }

        }
    );


    form.replaceChildren(
        formContent
    );

    form.dataset.sectionsReady =
        "true";

}


/* =========================================================
   35. INITIALISATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupDashboardQuickNavigation();

        setupQuestionnaireSections();

        setupPerformanceSelector();

        setupDates();

        setupLogout();

        startCountdown();


        const connected =
            await loadDashboardUser();


        if (!connected) {
            return;
        }


        await Promise.all([

            loadProfile(),

            loadBodyMeasurements(),

            loadPerformances(),

            loadGoals()

        ]);

    }
);