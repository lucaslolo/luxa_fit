/* =========================================================
   LUXA_FIT
   APP.JS
   ========================================================= */


/* =========================================================
   01 — CONNEXION / INSCRIPTION
   ========================================================= */


/* ---------------------------------------------------------
   RÉFÉRENCES CONNEXION / INSCRIPTION
--------------------------------------------------------- */

const loginSection =
    document.getElementById("loginSection");

const registerSection =
    document.getElementById("registerSection");

const showRegister =
    document.getElementById("showRegister");

const showLogin =
    document.getElementById("showLogin");


/* ---------------------------------------------------------
   AFFICHER INSCRIPTION
--------------------------------------------------------- */

if (
    showRegister &&
    loginSection &&
    registerSection
) {

    showRegister.addEventListener(
        "click",
        function () {

            loginSection.style.display = "none";

            registerSection.style.display = "block";

        }
    );

}


/* ---------------------------------------------------------
   AFFICHER CONNEXION
--------------------------------------------------------- */

if (
    showLogin &&
    loginSection &&
    registerSection
) {

    showLogin.addEventListener(
        "click",
        function () {

            registerSection.style.display = "none";

            loginSection.style.display = "block";

        }
    );

}


/* =========================================================
   02 — INSCRIPTION
   ========================================================= */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const prenom =
                document
                    .getElementById("registerPrenom")
                    ?.value
                    .trim();


            const nom =
                document
                    .getElementById("registerNom")
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById("registerPassword")
                    ?.value;


            const passwordConfirm =
                document
                    .getElementById("registerPasswordConfirm")
                    ?.value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            if (!message) {
                return;
            }


            /* -------------------------------------------------
               VALIDATION
            ------------------------------------------------- */

            if (
                !prenom ||
                !nom ||
                !password ||
                !passwordConfirm
            ) {

                message.textContent =
                    "Remplis tous les champs.";

                return;

            }


            if (password !== passwordConfirm) {

                message.textContent =
                    "Les mots de passe ne correspondent pas.";

                return;

            }


            if (password.length < 6) {

                message.textContent =
                    "Le mot de passe doit contenir au moins 6 caractères.";

                return;

            }


            message.textContent =
                "Création du compte...";


            try {

                const response =
                    await fetch(
                        "/api/register",
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
                                    prenom,
                                    nom,
                                    password
                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Erreur lors de l'inscription.";

                    return;

                }


                message.textContent =
                    "Compte créé ! Connexion en cours...";


                /*
                   Le serveur crée le compte.
                   On redirige ensuite vers la connexion.
                */

                setTimeout(
                    function () {

                        window.location.href =
                            "connexion.html";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "Erreur inscription :",
                    error
                );


                message.textContent =
                    "Impossible de contacter le serveur.";

            }

        }
    );

}


/* =========================================================
   03 — CONNEXION
   ========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const prenom =
                document
                    .getElementById("loginPrenom")
                    ?.value
                    .trim();


            const nom =
                document
                    .getElementById("loginNom")
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    ?.value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            if (!message) {
                return;
            }


            /* -------------------------------------------------
               VALIDATION
            ------------------------------------------------- */

            if (
                !prenom ||
                !nom ||
                !password
            ) {

                message.textContent =
                    "Remplis tous les champs.";

                return;

            }


            message.textContent =
                "Connexion...";


            try {

                const response =
                    await fetch(
                        "/api/login",
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
                                    prenom,
                                    nom,
                                    password
                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Identifiants incorrects.";

                    return;

                }


                /*
                   La session Express est créée côté serveur.

                   On garde également l'utilisateur
                   dans localStorage pour les éléments
                   purement visuels du site.
                */

                if (data.user) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );

                }


                message.textContent =
                    "Connexion réussie !";


                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Erreur connexion :",
                    error
                );


                message.textContent =
                    "Impossible de contacter le serveur.";

            }

        }
    );

}


/* =========================================================
   04 — NAVIGATION SELON LA SESSION
   ========================================================= */

async function updateAuthenticatedNavigation() {

    const authLinks =
        document.querySelectorAll(
            ".auth-only"
        );


    const dashboardUser =
        document.querySelector(
            ".dashboard-user"
        );


    const loginLink =
        document.getElementById(
            "login-link"
        );


    /* -------------------------------------------------------
       ÉTAT PAR DÉFAUT
    ------------------------------------------------------- */

    authLinks.forEach(
        element => {

            element.style.display =
                "none";

        }
    );


    if (dashboardUser) {

        dashboardUser.style.display =
            "none";

    }


    if (loginLink) {

        loginLink.style.display =
            "inline-flex";

    }


    try {

        const response =
            await fetch(
                "/api/me",
                {

                    method: "GET",

                    credentials:
                        "same-origin"

                }
            );


        const data =
            await response.json();


        /* ---------------------------------------------------
           UTILISATEUR CONNECTÉ
        --------------------------------------------------- */

        if (
            response.ok &&
            data.success &&
            data.user
        ) {

            authLinks.forEach(
                element => {

                    element.style.display =
                        "inline-flex";

                }
            );


            if (dashboardUser) {

                dashboardUser.style.display =
                    "flex";

            }


            if (loginLink) {

                loginLink.style.display =
                    "none";

            }


            document.body.classList.add(
                "authenticated"
            );


            /*
               Mise à jour éventuelle du nom
               dans le header.
            */

            const headerUserName =
                document.getElementById(
                    "userName"
                );


            if (headerUserName) {

                headerUserName.textContent =
                    `${data.user.prenom || ""} ${data.user.nom || ""}`.trim();

            }


            return;

        }


        /* ---------------------------------------------------
           UTILISATEUR NON CONNECTÉ
        --------------------------------------------------- */

        document.body.classList.remove(
            "authenticated"
        );


    } catch (error) {

        console.error(
            "Erreur vérification session :",
            error
        );


        document.body.classList.remove(
            "authenticated"
        );

    }

}


/* =========================================================
   05 — HEADER CHARGÉ
   ========================================================= */

document.addEventListener(
    "headerLoaded",
    function () {

        updateAuthenticatedNavigation();

    }
);


/* =========================================================
   06 — VÉRIFICATION SESSION AU CHARGEMENT
   ========================================================= */

/*
   Certaines pages peuvent charger app.js
   sans utiliser le système headerLoaded.

   On vérifie donc aussi la navigation
   une fois que le DOM est prêt.
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Si le header est déjà présent,
           on peut vérifier immédiatement.
        */

        if (
            document.querySelector(
                ".auth-only"
            ) ||
            document.querySelector(
                ".dashboard-user"
            ) ||
            document.getElementById(
                "login-link"
            )
        ) {

            updateAuthenticatedNavigation();

        }

    }
);


/* =========================================================
   07 — DÉCONNEXION GLOBALE
   ========================================================= */

/*
   La déconnexion est volontairement ici
   et non dans dashboard.js.

   Pourquoi ?

   Parce que le bouton de déconnexion
   peut exister sur plusieurs pages.
*/

async function logoutUser(button = null) {

    if (button) {

        button.disabled =
            true;

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


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Impossible de se déconnecter."
            );

        }


        localStorage.removeItem(
            "user"
        );


        document.body.classList.remove(
            "authenticated"
        );


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Erreur déconnexion :",
            error
        );


        if (button) {

            button.disabled =
                false;

        }

        alert(
            error.message ||
            "Impossible de contacter le serveur."
        );

    }

}


/* ---------------------------------------------------------
   BOUTON DÉCONNEXION
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (!logoutButton) {
            return;
        }


        /*
           Évite de créer plusieurs listeners
           si un autre composant a déjà initialisé
           le bouton.
        */

        if (
            logoutButton.dataset.logoutReady ===
            "true"
        ) {

            return;

        }


        logoutButton.dataset.logoutReady =
            "true";


        logoutButton.addEventListener(
            "click",
            function () {

                logoutUser(
                    logoutButton
                );

            }
        );

    }
);


/* =========================================================
   08 — UTILITAIRES GLOBAUX
   ========================================================= */

/*
   Ces fonctions sont volontairement simples
   et peuvent être utilisées par d'autres pages.
*/


function getToday() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


function formatDate(date) {

    if (!date) {

        return "-";

    }


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {

        return date;

    }


    return d.toLocaleDateString(
        "fr-BE"
    );

}


/* =========================================================
   09 — FIN APP.JS
   ========================================================= */