document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("header-container");

    if (!container) return;

    try {

        const response = await fetch("components/header.html");

        if (!response.ok) {
            throw new Error("Impossible de charger le header");
        }

        const header = await response.text();

        container.innerHTML = header;

        const toggle =
            container.querySelector(
                ".nav-toggle"
            );

        const navigation =
            container.querySelector(
                ".site-nav"
            );

        if (toggle && navigation) {

            toggle.addEventListener(
                "click",
                function () {

                    const isOpen =
                        toggle.getAttribute(
                            "aria-expanded"
                        ) === "true";

                    toggle.setAttribute(
                        "aria-expanded",
                        String(!isOpen)
                    );

                    toggle.setAttribute(
                        "aria-label",
                        isOpen
                            ? "Ouvrir le menu"
                            : "Fermer le menu"
                    );

                    navigation.classList.toggle(
                        "is-open",
                        !isOpen
                    );

                }
            );

            navigation.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target.closest(
                            "a"
                        )
                    ) {

                        toggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        toggle.setAttribute(
                            "aria-label",
                            "Ouvrir le menu"
                        );

                        navigation.classList.remove(
                            "is-open"
                        );

                    }

                }
            );

        }

        // Prévenir app.js que le header est chargé
        document.dispatchEvent(
            new Event("headerLoaded")
        );

    } catch (error) {

        console.error("Erreur header :", error);

    }

});