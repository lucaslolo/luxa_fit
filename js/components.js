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

        // Prévenir app.js que le header est chargé
        document.dispatchEvent(
            new Event("headerLoaded")
        );

    } catch (error) {

        console.error("Erreur header :", error);

    }

});