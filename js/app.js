/* =========================================================
   LUXA_FIT - APP.JS
   ========================================================= */


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


    let value;


    /* =========================
       POIDS
       ========================= */

    if (type === "weight") {

        value = Number(
            rawValue.replace(",", ".")
        );


        if (!Number.isFinite(value) || value <= 0) {

            message.textContent =
                "Entre un poids valide.";

            return;
        }

    }


    /* =========================
       RUN / HYROX
       ========================= */

    else if (
        type === "run" ||
        type === "hyrox"
    ) {

        value = timeToSeconds(rawValue);


        if (!Number.isFinite(value) || value <= 0) {

            message.textContent =
                "Entre un chrono valide, par exemple 20:23.";

            return;
        }

    }


    /* =========================
       KILOMÈTRES
       ========================= */

    else if (type === "km") {

        value = Number(
            rawValue.replace(",", ".")
        );


        if (!Number.isFinite(value) || value <= 0) {

            message.textContent =
                "Entre un nombre de kilomètres valide.";

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


    if (performances.length === 0) {

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


    performances.forEach(function (performance) {

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


/* =========================================================
   NOM DES TYPES
   ========================================================= */

function getTypeName(type) {

    const names = {

        weight: "⚖️ Poids",

        run: "🏃 5 KM",

        hyrox: "🔥 HYROX",

        km: "🏃‍♂️ Running"

    };


    return names[type] || type;

}


/* =========================================================
   FORMAT PERFORMANCE
   ========================================================= */

function formatPerformance(type, value) {

    if (type === "weight") {

        return Number(value).toFixed(1) + " kg";

    }


    if (type === "km") {

        return Number(value).toFixed(1) + " km";

    }


    if (
        type === "run" ||
        type === "hyrox"
    ) {

        return formatTime(value);

    }


    return value;

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
            performance => performance.type === "weight"
        );


    const runData =
        performances.filter(
            performance => performance.type === "run"
        );


    const hyroxData =
        performances.filter(
            performance => performance.type === "hyrox"
        );


    const kmData =
        performances.filter(
            performance => performance.type === "km"
        );


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
                    performance.type === "weight"
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
                    performance.type === "run"
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

const typeSelect =
    document.getElementById("type");


const valueHelp =
    document.getElementById("valueHelp");


if (typeSelect && valueHelp) {

    typeSelect.addEventListener(
        "change",
        function () {

            switch (typeSelect.value) {

                case "weight":

                    valueHelp.textContent =
                        "Exemple : 73.5";

                    break;


                case "run":

                    valueHelp.textContent =
                        "Format : minutes:secondes — exemple : 20:23";

                    break;


                case "hyrox":

                    valueHelp.textContent =
                        "Format : heures:minutes:secondes — exemple : 1:20:00";

                    break;


                case "km":

                    valueHelp.textContent =
                        "Exemple : 10 ou 12.5";

                    break;


                default:

                    valueHelp.textContent =
                        "Sélectionne d'abord un type.";

            }

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
                        "connexion.html";

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