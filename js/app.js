/* =========================================================
   LUXA_FIT - APP.JS
   ========================================================= */


/* =========================================================
   TYPES DE PERFORMANCE
   ========================================================= */

const PERFORMANCE_TYPES = {

    poids: {
        label: "Poids",
        icon: "⚖️",
        format: "number",
        category: "Mesures"
    },

    taille: {
        label: "Taille",
        icon: "📏",
        format: "number",
        category: "Mesures"
    },

    tour_de_taille: {
        label: "Tour de taille",
        icon: "📐",
        format: "number",
        category: "Mensurations"
    },

    tour_de_hanche: {
        label: "Tour de hanche",
        icon: "📐",
        format: "number",
        category: "Mensurations"
    },

    tour_de_bras: {
        label: "Tour de bras",
        icon: "📐",
        format: "number",
        category: "Mensurations"
    },

    tour_de_cuisse: {
        label: "Tour de cuisse",
        icon: "📐",
        format: "number",
        category: "Mensurations"
    },

    tour_de_mollet: {
        label: "Tour de mollet",
        icon: "📐",
        format: "number",
        category: "Mensurations"
    },

    tour_de_torse: {
        label: "Tour de torse",
        icon: "📐",
        format: "number",
        category: "Mensurations"
    },

    bench_actuel: {
        label: "Développé couché actuel",
        icon: "🏋️",
        format: "number",
        category: "Musculation"
    },
    squat_actuel: {
        label: "Squat actuel",
        icon: "🏋️",
        format: "number",
        category: "Musculation"
    },

    deadlift_actuel: {
        label: "Soulevé de terre actuel",
        icon: "🏋️",
        format: "number",
        category: "Musculation"
    },
    "hyrox solo open homme": {
        label: "HYROX solo open homme",
        icon: "🔥",
        format: "time",
        category: "HYROX"
    },

    "hyrox solo pro homme": {
        label: "HYROX solo pro homme",
        icon: "🔥",
        format: "time",
        category: "HYROX"
    },

    "hyrox solo open femme": {
        label: "HYROX solo open femme",
        icon: "🔥",
        format: "time",
        category: "HYROX"
    },

    "hyrox solo pro femme": {
        label: "HYROX solo pro femme",
        icon: "🔥",
        format: "time",
        category: "HYROX"
    },

    "hyrox mixte": {
        label: "HYROX mixte",
        icon: "🔥",
        format: "time",
        category: "HYROX"
    },

    "hyrox homme/homme": {
        label: "HYROX homme / homme",
        icon: "🔥",
        format: "time",
        category: "HYROX"
    },

    "hyrox femme/femme": {
        label: "HYROX femme / femme",
        icon: "🔥",
        format: "time",
        category: "HYROX"
    },

    course_5km: {
        label: "Course 5 km",
        icon: "🏃",
        format: "time",
        category: "Course"
    },

    course_10km: {
        label: "Course 10 km",
        icon: "🏃",
        format: "time",
        category: "Course"
    },

    course_21km: {
        label: "Course 21 km",
        icon: "🏃",
        format: "time",
        category: "Course"
    },

    course_42km: {
        label: "Course 42 km",
        icon: "🏃",
        format: "time",
        category: "Course"
    },

    course_km_semaine: {
        label: "Kilomètres par semaine",
        icon: "🏃",
        format: "number",
        category: "Course"
    }
};


const PERFORMANCE_GROUPS = {

    force: {
        label: "Force",
        categories: ["Musculation"],
        description: "Bench, squat et deadlift regroupés au même endroit."
    },

    endurance: {
        label: "Endurance",
        categories: ["Course", "HYROX"],
        description: "Course, volume hebdomadaire et chronos HYROX."
    }
};


/* =========================================================
   OUTILS
   ========================================================= */

function formatTime(seconds) {

    seconds = Number(seconds);

    if (!Number.isFinite(seconds)) {
        return "--:--";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

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


function timeToSeconds(value) {

    const parts = value.split(":").map(Number);

    if (parts.some(number => !Number.isFinite(number))) {
        return NaN;
    }

    if (parts.length === 2) {

        const minutes = parts[0];
        const seconds = parts[1];

        if (seconds >= 60) {
            return NaN;
        }

        return minutes * 60 + seconds;
    }

    if (parts.length === 3) {

        const hours = parts[0];
        const minutes = parts[1];
        const seconds = parts[2];

        if (minutes >= 60 || seconds >= 60) {
            return NaN;
        }

        return hours * 3600 + minutes * 60 + seconds;
    }

    return NaN;
}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    return d.toLocaleDateString("fr-BE");
}


/* =========================================================
   CONNEXION / INSCRIPTION
   ========================================================= */

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");


if (showRegister && loginSection && registerSection) {

    showRegister.addEventListener("click", function () {

        loginSection.style.display = "none";
        registerSection.style.display = "block";

    });

}


if (showLogin && loginSection && registerSection) {

    showLogin.addEventListener("click", function () {

        registerSection.style.display = "none";
        loginSection.style.display = "block";

    });

}


/* =========================================================
   INSCRIPTION
   ========================================================= */

const registerForm = document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const prenom =
            document.getElementById("registerPrenom").value.trim();

        const nom =
            document.getElementById("registerNom").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const passwordConfirm =
            document.getElementById("registerPasswordConfirm").value;

        const message =
            document.getElementById("registerMessage");


        if (password !== passwordConfirm) {

            message.textContent =
                "Les mots de passe ne correspondent pas.";

            return;
        }


        try {

            const response = await fetch("/api/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    prenom: prenom,
                    nom: nom,
                    password: password
                })

            });


            const data = await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message || "Erreur lors de l'inscription.";

                return;
            }


            message.textContent =
                "Compte créé ! Connexion en cours...";


            setTimeout(function () {

                window.location.href = "connexion.html";

            }, 1000);


        } catch (error) {

            console.error(error);

            message.textContent =
                "Impossible de contacter le serveur.";

        }

    });

}


/* =========================================================
   CONNEXION
   ========================================================= */

const loginForm = document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const prenom =
            document.getElementById("loginPrenom").value.trim();

        const nom =
            document.getElementById("loginNom").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");


        try {

            const response = await fetch("/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "same-origin",

                body: JSON.stringify({
                    prenom: prenom,
                    nom: nom,
                    password: password
                })

            });


            const data = await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message || "Identifiants incorrects.";

                return;
            }


            /*
                On garde les informations de base
                côté navigateur uniquement pour
                l'affichage rapide.

                La vraie authentification est assurée
                par la session Express.
            */

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            message.textContent =
                "Connexion réussie !";


            setTimeout(function () {

                window.location.href = "dashboard.html";

            }, 500);


        } catch (error) {

            console.error(error);

            message.textContent =
                "Impossible de contacter le serveur.";

        }

    });

}


/* =========================================================
   DASHBOARD
   ========================================================= */

const performanceForm =
    document.getElementById("performanceForm");


const historyElement =
    document.getElementById("history");


const categoryFilter =
    document.getElementById("categoryFilter");


const historyCount =
    document.getElementById("historyCount");


const categorySummary =
    document.getElementById("categorySummary");


const categoryDescription =
    document.getElementById("categoryDescription");


const questionnaireModal =
    document.getElementById("questionnaireModal");


const questionnaireForm =
    document.getElementById("questionnaireForm");


const questionnaireDate =
    document.getElementById("questionnaireDate");


const questionnaireMessage =
    document.getElementById("questionnaireMessage");


const userNameElement =
    document.getElementById("userName");


const logoutButton =
    document.getElementById("logoutButton");


let performances = [];


/* =========================================================
   CHARGER L'UTILISATEUR
   ========================================================= */

async function loadUser() {

    try {

        const response = await fetch("/api/me", {
            method: "GET",
            credentials: "same-origin"
        });

        const data = await response.json();


        if (!data.success) {

            window.location.href = "connexion.html";

            return null;
        }


        const user = data.user;


        if (userNameElement) {

            userNameElement.textContent =
                user.prenom + " " + user.nom;

        }


        const profilePrenom =
            document.getElementById("profilePrenom");


        const profileNom =
            document.getElementById("profileNom");


        const profileId =
            document.getElementById("profileId");


        if (profilePrenom) {
            profilePrenom.textContent = user.prenom;
        }


        if (profileNom) {
            profileNom.textContent = user.nom;
        }


        if (profileId) {
            profileId.textContent = user.id;
        }


        return user;


    } catch (error) {

        console.error(error);


        if (historyElement) {

            historyElement.innerHTML = `
                <tr>
                    <td colspan="4">
                        Erreur de connexion au serveur.
                    </td>
                </tr>
            `;

        }


        return null;
    }

}


/* =========================================================
   CHARGER LES PERFORMANCES MYSQL
   ========================================================= */

async function loadPerformances() {

    try {

        const response =
            await fetch("/api/performances", {
                credentials: "same-origin"
            });


        if (response.status === 401) {

            window.location.href = "connexion.html";

            return;
        }


        const data = await response.json();


        if (!data.success) {

            console.error(data.message);

            return;
        }


        performances = data.performances || [];


        updateDashboard();

        renderHistory();

        drawCharts();


    } catch (error) {

        console.error(error);


        if (historyElement) {

            historyElement.innerHTML = `
                <tr>
                    <td colspan="4">
                        Impossible de charger les performances.
                    </td>
                </tr>
            `;

        }

    }

}


/* =========================================================
   CHARGER LES RECORDS DE MUSCULATION
   ========================================================= */

async function loadStrengthStats() {

    const strengthElements =
        document.querySelectorAll("[data-performance-type]");

    if (strengthElements.length === 0) {
        return;
    }

    try {

        const response =
            await fetch("/api/performances", {
                credentials: "same-origin"
            });

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        const strengthPerformances = data.performances || [];

        strengthElements.forEach(function (element) {

            const type = element.dataset.performanceType;
            const entries = strengthPerformances.filter(
                performance => performance.type === type
            );

            if (entries.length === 0) {
                return;
            }

            const latest = entries
                .slice()
                .sort((first, second) =>
                    new Date(second.date) - new Date(first.date)
                )[0];

            const add = Number(element.dataset.add || 0);

            element.textContent =
                (Number(latest.value) + add).toFixed(1) + " kg";
        });

    } catch (error) {

        console.error("Erreur records musculation :", error);

    }

}


/* =========================================================
   QUESTIONNAIRE ATHLÈTE
   ========================================================= */

function closeQuestionnaire() {

    if (!questionnaireModal) {
        return;
    }

    questionnaireModal.hidden = true;
    document.body.classList.remove("questionnaire-open");

}


function openQuestionnaire() {

    if (!questionnaireModal) {
        return;
    }

    questionnaireModal.hidden = false;
    document.body.classList.add("questionnaire-open");

    const firstField =
        questionnaireModal.querySelector("input");

    if (firstField) {
        firstField.focus();
    }

}


async function submitQuestionnaire(event) {

    event.preventDefault();

    if (!questionnaireForm || !questionnaireMessage) {
        return;
    }

    const date = questionnaireDate.value;
    const fields = [...questionnaireForm.querySelectorAll(
        "[data-questionnaire-type]"
    )];
    const answers = [];

    if (!date) {
        questionnaireMessage.textContent =
            "Choisis une date de mesure.";
        return;
    }

    for (const field of fields) {

        const rawValue = field.value.trim();

        if (!rawValue) {
            continue;
        }

        const type = field.dataset.questionnaireType;
        const typeConfig = PERFORMANCE_TYPES[type];
        const value = typeConfig && typeConfig.format === "time"
            ? timeToSeconds(rawValue)
            : Number(rawValue.replace(",", "."));

        if (!Number.isFinite(value) || value <= 0) {
            questionnaireMessage.textContent =
                "Vérifie la valeur : " +
                (typeConfig ? typeConfig.label : type) + ".";
            return;
        }

        answers.push({
            type: type,
            value: value,
            date: date
        });
    }

    if (answers.length === 0) {
        questionnaireMessage.textContent =
            "Renseigne au moins une réponse.";
        return;
    }

    questionnaireMessage.textContent =
        "Enregistrement en cours...";

    try {

        for (const answer of answers) {

            const response = await fetch("/api/performances", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify(answer)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Impossible d'enregistrer une réponse."
                );
            }
        }

        questionnaireMessage.textContent =
            "Questionnaire enregistré.";

        questionnaireForm.reset();
        questionnaireDate.value = date;
        await loadPerformances();

        setTimeout(closeQuestionnaire, 700);

    } catch (error) {

        console.error(error);
        questionnaireMessage.textContent =
            error.message || "Impossible de contacter le serveur.";
    }

}


/* =========================================================
   AJOUTER UNE PERFORMANCE
   ========================================================= */

if (performanceForm) {

    performanceForm.addEventListener(
        "submit",
        addPerformance
    );

}


async function addPerformance(event) {

    event.preventDefault();


    const type =
        document.getElementById("type").value;


    const rawValue =
        document.getElementById("value").value.trim();


    const date =
        document.getElementById("date").value;


    const message =
        document.getElementById("performanceMessage");


    if (!type || !rawValue || !date) {

        message.textContent =
            "Remplis tous les champs.";

        return;
    }


    const typeConfig = PERFORMANCE_TYPES[type];

    if (!typeConfig) {

        message.textContent =
            "Sélectionne un type de performance valide.";

        return;
    }


    let value;

    if (typeConfig.format === "time") {

        value = timeToSeconds(rawValue);

        if (!Number.isFinite(value) || value <= 0) {

            message.textContent =
                "Entre un chrono valide, par exemple 20:23.";

            return;
        }

    } else {

        value = Number(
            rawValue.replace(",", ".")
        );

        if (!Number.isFinite(value) || value <= 0) {

            message.textContent =
                "Entre une valeur positive et valide.";

            return;
        }

    }


    try {

        const response =
            await fetch("/api/performances", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "same-origin",

                body: JSON.stringify({
                    type: type,
                    value: value,
                    date: date
                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Erreur lors de l'ajout.";

            return;
        }


        message.textContent =
            "✅ Performance enregistrée dans MySQL !";


        document.getElementById("value").value = "";


        await loadPerformances();


    } catch (error) {

        console.error(error);

        message.textContent =
            "Impossible de contacter le serveur.";

    }

}


/* =========================================================
   HISTORIQUE
   ========================================================= */

function renderHistory() {

    if (!historyElement) {
        return;
    }


    const selectedCategory =
        categoryFilter ? categoryFilter.value : "";

    const selectedCategories =
        getSelectedCategories(selectedCategory);

    const visiblePerformances = performances.filter(
        performance => {
            const typeConfig = PERFORMANCE_TYPES[performance.type];

            return selectedCategories.length === 0 ||
                typeConfig && selectedCategories.includes(typeConfig.category);
        }
    );

    if (historyCount) {
        historyCount.textContent =
            visiblePerformances.length +
            (visiblePerformances.length === 1
                ? " performance"
                : " performances");
    }

    if (visiblePerformances.length === 0) {

        historyElement.innerHTML = `
            <tr>
                <td colspan="4">
                    Aucune performance enregistrée.
                </td>
            </tr>
        `;

        return;
    }


    historyElement.innerHTML = "";


    visiblePerformances.forEach(function (performance) {

        const row =
            document.createElement("tr");


        const dateCell =
            document.createElement("td");


        dateCell.textContent =
            formatDate(performance.date);


        const typeCell =
            document.createElement("td");


        typeCell.textContent =
            getTypeName(performance.type);

        const typeConfig =
            PERFORMANCE_TYPES[performance.type];

        if (typeConfig) {

            const categoryLabel =
                document.createElement("small");

            categoryLabel.className =
                "history-category";

            categoryLabel.textContent =
                typeConfig.category;

            typeCell.appendChild(categoryLabel);
        }


        const valueCell =
            document.createElement("td");


        valueCell.textContent =
            formatPerformance(
                performance.type,
                performance.value
            );


        const actionCell =
            document.createElement("td");


        const deleteButton =
            document.createElement("button");


        deleteButton.textContent =
            "🗑️ Supprimer";


        deleteButton.className =
            "delete-button";


        deleteButton.addEventListener(
            "click",
            function () {

                deletePerformance(
                    performance.id
                );

            }
        );


        actionCell.appendChild(deleteButton);


        row.appendChild(dateCell);
        row.appendChild(typeCell);
        row.appendChild(valueCell);
        row.appendChild(actionCell);


        historyElement.appendChild(row);

    });

}


function populateCategoryFilter() {

    if (!categoryFilter) {
        return;
    }

    const categories = [...new Set(
        Object.values(PERFORMANCE_TYPES)
            .map(typeConfig => typeConfig.category)
    )];

    const groupOptions =
        document.createElement("optgroup");

    groupOptions.label = "Ensembles";

    Object.entries(PERFORMANCE_GROUPS).forEach(
        function ([value, group]) {

            const option =
                document.createElement("option");

            option.value = value;
            option.textContent = group.label;
            groupOptions.appendChild(option);
        }
    );

    categoryFilter.appendChild(groupOptions);

    const categoryOptions =
        document.createElement("optgroup");

    categoryOptions.label = "Détails";

    categories.forEach(function (category) {

        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;
        categoryOptions.appendChild(option);
    });

    categoryFilter.appendChild(categoryOptions);

    categoryFilter.addEventListener(
        "change",
        function () {
            renderCategorySummary();
            renderHistory();
        }
    );

    renderCategorySummary();

}


function getSelectedCategories(selection) {

    if (!selection) {
        return [];
    }

    if (PERFORMANCE_GROUPS[selection]) {
        return PERFORMANCE_GROUPS[selection].categories;
    }

    return [selection];

}


function renderCategorySummary() {

    if (!categorySummary) {
        return;
    }

    const selection =
        categoryFilter ? categoryFilter.value : "";

    const selectedCategories =
        getSelectedCategories(selection);

    const visiblePerformances = performances.filter(
        performance => {
            const typeConfig = PERFORMANCE_TYPES[performance.type];

            return selectedCategories.length === 0 ||
                typeConfig && selectedCategories.includes(typeConfig.category);
        }
    );

    if (categoryDescription) {
        categoryDescription.textContent = PERFORMANCE_GROUPS[selection]
            ? PERFORMANCE_GROUPS[selection].description
            : selection
                ? "Toutes les données de cette sous-catégorie."
                : "Toutes les données disponibles, regroupées par type.";
    }

    categorySummary.innerHTML = "";

    const groupedPerformances = {};

    visiblePerformances.forEach(function (performance) {

        if (!groupedPerformances[performance.type]) {
            groupedPerformances[performance.type] = [];
        }

        groupedPerformances[performance.type].push(performance);
    });

    const types = Object.keys(groupedPerformances);

    if (types.length === 0) {

        categorySummary.innerHTML =
            "<p class=\"category-empty\">Aucune donnée enregistrée dans cette catégorie.</p>";

        return;
    }

    types.forEach(function (type) {

        const entries =
            groupedPerformances[type]
                .slice()
                .sort((first, second) =>
                    new Date(second.date) - new Date(first.date)
                );

        const latest = entries[0];
        const typeConfig = PERFORMANCE_TYPES[type];
        const card = document.createElement("article");
        const entryList = document.createElement("ul");

        card.className = "category-summary-card";
        card.innerHTML = `
            <span>${typeConfig ? typeConfig.icon : "•"} ${typeConfig ? typeConfig.category : "Autre"}</span>
            <h3>${getTypeName(type)}</h3>
            <strong>${formatPerformance(type, latest.value)}</strong>
            <small>${entries.length} donnée${entries.length > 1 ? "s" : ""}</small>
        `;

        entryList.className = "category-data-list";

        entries.forEach(function (entry) {

            const entryItem =
                document.createElement("li");

            entryItem.innerHTML = `
                <span>${formatDate(entry.date)}</span>
                <strong>${formatPerformance(type, entry.value)}</strong>
            `;

            entryList.appendChild(entryItem);
        });

        card.appendChild(entryList);

        categorySummary.appendChild(card);
    });

}


/* =========================================================
   NOM DES TYPES
   ========================================================= */

function getTypeName(type) {

    const typeConfig = PERFORMANCE_TYPES[type];

    if (!typeConfig) {
        return type;
    }

    return typeConfig.icon + " " + typeConfig.label;

}


/* =========================================================
   FORMAT PERFORMANCE
   ========================================================= */

function formatPerformance(type, value) {

    const typeConfig = PERFORMANCE_TYPES[type];

    if (!typeConfig) {
        return value;
    }

    if (typeConfig.format === "time") {
        return formatTime(value);
    }

    const measurementTypes = [
        "taille",
        "tour_de_taille",
        "tour_de_hanche",
        "tour_de_bras",
        "tour_de_cuisse",
        "tour_de_mollet",
        "tour_de_torse"
    ];

    const suffix = type === "poids" ||
        type === "course_km_semaine" ||
        type === "bench_actuel" ||
        type === "squat_actuel" ||
        type === "deadlift_actuel" 
        ? type === "course_km_semaine" ? " km" : " kg"
        : measurementTypes.includes(type) ? " cm" : "";

    return Number(value).toFixed(1) + suffix;

}


/* =========================================================
   SUPPRIMER UNE PERFORMANCE
   ========================================================= */

async function deletePerformance(id) {

    const confirmation =
        confirm(
            "Supprimer cette performance ?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/performances/" + id,
                {
                    method: "DELETE",
                    credentials: "same-origin"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Impossible de supprimer la performance."
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
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const weightData =
        performances.filter(
            performance => performance.type === "poids"
        );


    const runData =
        performances.filter(
            performance => performance.type === "course_5km"
        );


    const hyroxData =
        performances.filter(
            performance => performance.type.startsWith("hyrox ")
        );


    const kmData =
        performances.filter(
            performance => performance.type === "course_km_semaine"
        );


    updateStrengthDashboard();


    /* =========================
       POIDS
       ========================= */

    const weightElement =
        document.getElementById("weight");


    if (weightElement) {

        if (weightData.length > 0) {

            weightElement.textContent =
                Number(weightData[0].value).toFixed(1);

        } else {

            weightElement.textContent =
                "--";

        }

    }


    /* =========================
       5 KM
       ========================= */

    const runElement =
        document.getElementById("run5k");


    if (runElement) {

        if (runData.length > 0) {

            runElement.textContent =
                formatTime(runData[0].value);

        } else {

            runElement.textContent =
                "--:--";

        }

    }


    /* =========================
       HYROX
       ========================= */

    const hyroxElement =
        document.getElementById("hyrox");


    if (hyroxElement) {

        if (hyroxData.length > 0) {

            hyroxElement.textContent =
                formatTime(hyroxData[0].value);

        } else {

            hyroxElement.textContent =
                "--:--:--";

        }

    }


    /* =========================
       RUNNING
       ========================= */

    const weeklyKmElement =
        document.getElementById("weeklyKm");


    if (weeklyKmElement) {

        const totalKm =
            kmData.reduce(
                function (total, performance) {

                    return total +
                        Number(performance.value);

                },
                0
            );


        weeklyKmElement.textContent =
            totalKm.toFixed(1);

    }


    updateProgress(
        weightData,
        runData,
        hyroxData
    );

}


function updateStrengthDashboard() {

    const strengthTypes = [
        ["bench_actuel","benchCurrent", "--"],
        ["squat_actuel", "squatCurrent", "--"],
        ["deadlift_actuel", "deadliftCurrent", "--"],
    ];

    strengthTypes.forEach(function ([type, elementId, emptyValue]) {

        const element =
            document.getElementById(elementId);

        if (!element) {
            return;
        }

        const entries = performances
            .filter(performance => performance.type === type)
            .slice()
            .sort((first, second) =>
                new Date(second.date) - new Date(first.date)
            );

        if (entries.length === 0) {
            element.textContent = emptyValue;
            return;
        }

        const formattedValue =
            Number(entries[0].value).toFixed(1);

        element.textContent = elementId.endsWith("Current")
            ? formattedValue
            : formattedValue + " kg";
    });

}


/* =========================================================
   PROGRESSION
   ========================================================= */

function updateProgress(
    weightData,
    runData,
    hyroxData
) {


    /* =========================
       5 KM → OBJECTIF 20 MIN
       ========================= */

    const runProgress =
        document.getElementById("runProgress");


    if (
        runProgress &&
        runData.length > 0
    ) {

        const current =
            Number(runData[0].value);


        const goal =
            20 * 60;


        let percentage =
            (goal / current) * 100;


        percentage =
            Math.min(
                Math.max(percentage, 0),
                100
            );


        runProgress.style.width =
            percentage + "%";

    }


    /* =========================
       HYROX → OBJECTIF 1H10
       ========================= */

    const hyroxProgress =
        document.getElementById(
            "hyroxProgress"
        );


    if (
        hyroxProgress &&
        hyroxData.length > 0
    ) {

        const current =
            Number(hyroxData[0].value);


        const goal =
            70 * 60;


        let percentage =
            (goal / current) * 100;


        percentage =
            Math.min(
                Math.max(percentage, 0),
                100
            );


        hyroxProgress.style.width =
            percentage + "%";

    }


    /* =========================
       POIDS
       ========================= */

    const weightProgress =
        document.getElementById(
            "weightProgress"
        );


    if (
        weightProgress &&
        weightData.length > 0
    ) {

        /*
            Pour l'instant on affiche
            simplement une progression
            basée sur la présence de données.
        */

        weightProgress.style.width =
            "100%";

    }

}


/* =========================================================
   GRAPHIQUES
   ========================================================= */

function drawCharts() {

    drawWeightChart();

    drawRunChart();

}


/* =========================================================
   GRAPHIQUE POIDS
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
        canvas.getContext("2d");


    const data =
        performances
            .filter(
                performance =>
                    performance.type === "poids"
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
        data.map(item => item.value),
        data.map(item =>
            formatDate(item.date)
        ),
        "kg"
    );

}


/* =========================================================
   GRAPHIQUE 5 KM
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
        canvas.getContext("2d");


    const data =
        performances
            .filter(
                performance =>
                    performance.type === "course_5km"
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
            "Aucune donnée de 5 KM"
        );

        return;
    }


    drawLineChart(
        ctx,
        canvas,
        data.map(item => item.value),
        data.map(item =>
            formatDate(item.date)
        ),
        "time"
    );

}


/* =========================================================
   DESSIN GRAPHIQUE
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
        50;


    const max =
        Math.max(...values);


    const min =
        Math.min(...values);


    const range =
        max - min || 1;


    /* AXES */

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


    /* LIGNE */

    ctx.beginPath();


    values.forEach(
        function (value, index) {

            let x;


            if (values.length === 1) {

                x =
                    width / 2;

            } else {

                x =
                    padding +
                    (
                        index /
                        (values.length - 1)
                    ) *
                    (
                        width -
                        padding -
                        30
                    );

            }


            const y =
                height -
                padding -
                (
                    (
                        value -
                        min
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


    /* POINTS */

    values.forEach(
        function (value, index) {

            let x;


            if (values.length === 1) {

                x =
                    width / 2;

            } else {

                x =
                    padding +
                    (
                        index /
                        (values.length - 1)
                    ) *
                    (
                        width -
                        padding -
                        30
                    );

            }


            const y =
                height -
                padding -
                (
                    (
                        value -
                        min
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


            ctx.fillText(
                unit === "time"
                    ? formatTime(value)
                    : Number(value).toFixed(1),
                x - 20,
                y - 10
            );

        }
    );


    /* LABELS */

    if (labels.length > 0) {

        ctx.fillText(
            labels[0],
            padding,
            height - 20
        );


        if (labels.length > 1) {

            ctx.fillText(
                labels[labels.length - 1],
                width - 80,
                height - 20
            );

        }

    }

}


/* =========================================================
   GRAPHIQUE VIDE
   ========================================================= */

function drawEmptyChart(
    ctx,
    canvas,
    text
) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.textAlign = "center";


    ctx.fillText(
        text,
        canvas.width / 2,
        canvas.height / 2
    );


    ctx.textAlign = "start";

}


/* =========================================================
   AIDE POUR LE CHAMP VALEUR
   ========================================================= */

function populatePerformanceTypes() {

    const typeSelect =
        document.getElementById("type");

    if (!typeSelect) {
        return;
    }

    typeSelect.innerHTML = "";

    const placeholder =
        document.createElement("option");

    placeholder.value = "";
    placeholder.textContent = "Sélectionner";
    placeholder.selected = true;
    placeholder.disabled = true;
    typeSelect.appendChild(placeholder);

    const groups = {};

    Object.entries(PERFORMANCE_TYPES).forEach(
        function ([value, typeConfig]) {

            if (!groups[typeConfig.category]) {

                groups[typeConfig.category] =
                    document.createElement("optgroup");

                groups[typeConfig.category].label =
                    typeConfig.category;

                typeSelect.appendChild(
                    groups[typeConfig.category]
                );
            }

            const option =
                document.createElement("option");

            option.value = value;
            option.textContent =
                typeConfig.icon + " " + typeConfig.label;

            groups[typeConfig.category].appendChild(option);
        }
    );

}


populatePerformanceTypes();
populateCategoryFilter();


const typeSelect =
    document.getElementById("type");


const valueHelp =
    document.getElementById("valueHelp");


if (typeSelect && valueHelp) {

    typeSelect.addEventListener(
        "change",
        function () {

            const typeConfig =
                PERFORMANCE_TYPES[typeSelect.value];

            if (!typeConfig) {

                valueHelp.textContent =
                    "Sélectionne d'abord un type.";

                return;
            }

            valueHelp.textContent = typeConfig.format === "time"
                ? "Format : minutes:secondes ou heures:minutes:secondes"
                : typeSelect.value === "course_km_semaine"
                    ? "Exemple : 10 ou 12.5"
                    : "Entre une valeur positive";

        }
    );

}


/* =========================================================
   DATE AUTOMATIQUE
   ========================================================= */

const dateInput =
    document.getElementById("date");


if (dateInput) {

    dateInput.value =
        new Date()
            .toISOString()
            .split("T")[0];

}


if (questionnaireDate) {

    questionnaireDate.value =
        new Date()
            .toISOString()
            .split("T")[0];

}


const openQuestionnaireButton =
    document.getElementById("openQuestionnaire");


const closeQuestionnaireButton =
    document.getElementById("closeQuestionnaire");


if (openQuestionnaireButton) {
    openQuestionnaireButton.addEventListener(
        "click",
        openQuestionnaire
    );
}


if (closeQuestionnaireButton) {
    closeQuestionnaireButton.addEventListener(
        "click",
        closeQuestionnaire
    );
}


if (questionnaireModal) {

    questionnaireModal.addEventListener(
        "click",
        function (event) {

            if (event.target.matches("[data-close-questionnaire]")) {
                closeQuestionnaire();
            }
        }
    );
}


if (questionnaireForm) {
    questionnaireForm.addEventListener(
        "submit",
        submitQuestionnaire
    );
}


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {
            closeQuestionnaire();
        }
    }
);


/* =========================================================
   DÉCONNEXION
   ========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                const response =
                    await fetch(
                        "/api/logout",
                        {
                            method: "POST",
                            credentials: "same-origin"
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    localStorage.removeItem(
                        "user"
                    );


                    document.body.classList.remove(
                        "authenticated"
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


/* =========================================================
   COMPTE À REBOURS HYROX
   ========================================================= */

function countdown() {

    const countdownElement =
        document.getElementById(
            "countdown"
        );


    if (!countdownElement) {
        return;
    }


    const target =
        new Date(
            "2027-01-28T00:00:00"
        );


    function updateCountdown() {

        const now =
            new Date();


        const difference =
            target - now;


        if (difference <= 0) {

            countdownElement.textContent =
                "🔥 Objectif atteint !";

            return;
        }


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (
                    difference /
                    (1000 * 60 * 60)
                ) % 24
            );


        const minutes =
            Math.floor(
                (
                    difference /
                    (1000 * 60)
                ) % 60
            );


        const seconds =
            Math.floor(
                (
                    difference /
                    1000
                ) % 60
            );


        countdownElement.textContent =
            `${days}j ${hours}h ${minutes}m ${seconds}s`;

    }


    updateCountdown();


    setInterval(
        updateCountdown,
        1000
    );

}


/* =========================================================
   INITIALISATION DU DASHBOARD
   ========================================================= */

if (historyElement) {

    loadUser()
        .then(function (user) {

            if (user) {

                loadPerformances();

                countdown();

            }

        });

}


loadStrengthStats();

/* =========================================================
   NAVIGATION SELON LA SESSION
   ========================================================= */

async function updateAuthenticatedNavigation() {

    const authLinks = document.querySelectorAll(".auth-only");
    const dashboardUser = document.querySelector(".dashboard-user");
    const userName = document.getElementById("userName");
    const loginLink = document.getElementById("login-link");

    // État par défaut : utilisateur non connecté
    authLinks.forEach(link => {
        link.style.display = "none";
    });

    if (dashboardUser) {
        dashboardUser.style.display = "none";
    }

    if (loginLink) {
        loginLink.style.display = "inline-flex";
    }

    try {

        const response = await fetch("/api/me", {
            method: "GET",
            credentials: "same-origin"
        });

        const data = await response.json();

        if (data.success === true && data.user) {

            // ========================================
            // UTILISATEUR CONNECTÉ
            // ========================================

            authLinks.forEach(link => {
                link.style.display = "inline-flex";
            });

            if (dashboardUser) {
                dashboardUser.style.display = "flex";
            }

            if (loginLink) {
                loginLink.style.display = "none";
            }

            if (userName) {
                userName.textContent =
                    data.user.prenom + " " + data.user.nom;
            }

            document.body.classList.add("authenticated");

        } else {

            // ========================================
            // UTILISATEUR NON CONNECTÉ
            // ========================================

            authLinks.forEach(link => {
                link.style.display = "none";
            });

            if (dashboardUser) {
                dashboardUser.style.display = "none";
            }

            if (loginLink) {
                loginLink.style.display = "inline-flex";
            }

            document.body.classList.remove("authenticated");
        }

    } catch (error) {

        console.error(
            "Erreur vérification session :",
            error
        );

        authLinks.forEach(link => {
            link.style.display = "none";
        });

        if (dashboardUser) {
            dashboardUser.style.display = "none";
        }

        if (loginLink) {
            loginLink.style.display = "inline-flex";
        }

        document.body.classList.remove("authenticated");
    }
}


/* =========================================================
   LANCEMENT
   ========================================================= */

updateAuthenticatedNavigation();