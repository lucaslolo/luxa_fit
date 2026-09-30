    const programs = {
        1: {
            title: "Base",
            phase: "Phase 1 — Base",
            days: [
                { day: "Lundi", type: "EASY", title: "Footing facile", description: "7 à 8 km en aisance respiratoire.", exercises: ["7–8 km facile", "4 accélérations de 15 s", "Récupération complète"] },
                { day: "Mardi", type: "REPOS", title: "Récupération", description: "Le corps récupère et assimile la charge.", exercises: ["Repos", "Mobilité légère", "Marche optionnelle"] },
                { day: "Mercredi", type: "SPEED", title: "Vitesse 5 km", description: "Travailler la vitesse sans aller au bout de la capacité.", exercises: ["10 min d'échauffement", "8×400 m rapide", "200 m de récupération", "10 min retour au calme"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "La récupération est cruciale.", exercises: ["Repos complet", "Stretching 15 min"] },
                { day: "Vendredi", type: "TEMPO", title: "Travail au seuil", description: "Améliorer la capacité à tenir une allure plus rapide.", exercises: ["15 min facile", "3×8 min au seuil", "2 min de récupération", "10 min retour au calme"] },
                { day: "Samedi", type: "HYROX RUN", title: "Course spécifique", description: "Répéter des kilomètres à l’allure cible.", exercises: ["5 km facile", "3×1 km à l’allure cible", "2 min de récupération", "Station HYROX ou ski erg"] },
                { day: "Dimanche", type: "LONG", title: "Endurance longue", description: "Construire la base aérobie sans forcer.", exercises: ["10–12 km progressifs", "Allure conversationnelle", "Finir légèrement plus vite si le corps répond"] }
            ]
        },
        2: {
            title: "Volume",
            phase: "Phase 1 — Base",
            days: [
                { day: "Lundi", type: "EASY", title: "Footing facile", description: "Garder le volume tout en restant frais.", exercises: ["8 km facile", "4 accélérations de 15 s", "Récupération 90 s entre efforts"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Récupération et mobilité.", exercises: ["Repos", "Mobilité 15 min"] },
                { day: "Mercredi", type: "SPEED", title: "Vitesse 5 km", description: "Développer la vitesse de foulée et la cadence.", exercises: ["10 min d’échauffement", "7×400 m rapide", "200 m de récupération", "10 min retour au calme"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Récupération active.", exercises: ["Marche 25 min", "Mobilité 10 min"] },
                { day: "Vendredi", type: "TEMPO", title: "Seuil", description: "Travailler l’endurance de vitesse.", exercises: ["15 min facile", "4×6 min au seuil", "2 min de récupération"] },
                { day: "Samedi", type: "HYROX RUN", title: "Course spécifique", description: "Simuler le rythme de compétition.", exercises: ["2 km facile", "4×1 km à l’allure cible", "1 min de récupération", "Ski erg ou sled push"] },
                { day: "Dimanche", type: "LONG", title: "Endurance longue", description: "Développer le moteur aérobie.", exercises: ["12–14 km progressifs", "Allure conversationnelle"] }
            ]
        },
        3: {
            title: "Force",
            phase: "Phase 2 — Développement",
            days: [
                { day: "Lundi", type: "EASY", title: "Footing facile", description: "Maintenir le rythme et la qualité de foulée.", exercises: ["8 km facile", "4 accélérations de 15 s"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Récupération active.", exercises: ["Repos", "Marche légère"] },
                { day: "Mercredi", type: "SPEED", title: "Intervalles", description: "Progression sur les portions rapides.", exercises: ["12 min d’échauffement", "6×800 m @ dessus", "2 min de récupération"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Le corps se recharge.", exercises: ["Repos complet"] },
                { day: "Vendredi", type: "TEMPO", title: "Seuil", description: "Mieux tenir une allure de course plus rapide.", exercises: ["15 min facile", "3×10 min au seuil", "2 min de récupération"] },
                { day: "Samedi", type: "HYROX RUN", title: "Simulation", description: "Combiner course et stations.", exercises: ["1 km facile", "3×1 km à l’allure cible", "Station 2 min", "Retour au calme"] },
                { day: "Dimanche", type: "LONG", title: "Longue sortie", description: "Développer la capacité aérobie.", exercises: ["14–16 km progressifs", "Allure respiratoire"] }
            ]
        },
        4: {
            title: "Deload",
            phase: "Phase 2 — Récupération",
            days: [
                { day: "Lundi", type: "EASY", title: "Footing léger", description: "Réduire les intensités.", exercises: ["6 km facile", "3 accélérations de 10 s"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Récupération.", exercises: ["Repos complet"] },
                { day: "Mercredi", type: "SPEED", title: "Vitesse légère", description: "Conserver le mouvement sans fatigue excessive.", exercises: ["6×400 m @ 80%", "Récupération complète"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Vie normale ou petite marche.", exercises: ["Mobilité", "Marche 20 min"] },
                { day: "Vendredi", type: "TEMPO", title: "Seuil léger", description: "Maintenir la sensation tout en réduisant le volume.", exercises: ["15 min facile", "2×8 min au seuil", "2 min de récupération"] },
                { day: "Samedi", type: "HYROX RUN", title: "Technique", description: "Garder le schéma de course propre.", exercises: ["3 km facile", "3×800 m à l’allure cible", "Récupération courte"] },
                { day: "Dimanche", type: "LONG", title: "Sortie courte", description: "Récupération active.", exercises: ["10–12 km facile"] }
            ]
        },
        5: {
            title: "Seuil",
            phase: "Phase 3 — Intensité",
            days: [
                { day: "Lundi", type: "EASY", title: "Footing facilitant", description: "Maintenir l’endurance et la récupération.", exercises: ["8 km facile", "4×15 s accélérations"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Le corps se recharge.", exercises: ["Repos", "Stretching 15 min"] },
                { day: "Mercredi", type: "SPEED", title: "Vitesse spécifique", description: "Augmenter la vitesse sur des sections courtes.", exercises: ["12 min d’échauffement", "8×400 m @ vitesse", "200 m de récupération"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Récupération active.", exercises: ["Marche 25 min"] },
                { day: "Vendredi", type: "TEMPO", title: "Seuil progressif", description: "Maintenir une allure plus juste.", exercises: ["15 min facile", "4×8 min au seuil", "2 min de récupération"] },
                { day: "Samedi", type: "HYROX RUN", title: "Course spécifique", description: "Organisation du rythme et du travail en boucle.", exercises: ["3 km facile", "4×1 km cible", "1 min de récupération", "2 km retour au calme"] },
                { day: "Dimanche", type: "LONG", title: "Longue sortie", description: "Augmenter le volume linéaire.", exercises: ["16–18 km progressifs"] }
            ]
        },
        6: {
            title: "Compétition",
            phase: "Phase 3 — Performance",
            days: [
                { day: "Lundi", type: "EASY", title: "Footing facile", description: "Préparer le corps pour le travail plus intense.", exercises: ["7 km facile", "4 accélérations de 15 s"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Réduction de volume.", exercises: ["Repos complet"] },
                { day: "Mercredi", type: "SPEED", title: "Vitesse 5 km", description: "Commencer à viser la vitesse de course.", exercises: ["12 min d’échauffement", "6×800 m @ cadence ciblée", "2 min de récupération"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Le corps assimile le travail.", exercises: ["Mobilité 15 min", "Marche 20 min"] },
                { day: "Vendredi", type: "TEMPO", title: "Seuil race", description: "Garder la capacité de tenir la vitesse sur le long terme.", exercises: ["15 min facile", "3×10 min au seuil", "2 min de récupération"] },
                { day: "Samedi", type: "HYROX RUN", title: "Simulation", description: "Combiner vitesse et gestion de la fatigue.", exercises: ["2 km facile", "3×1 km rapide", "Fly 1 km lent", "2 km retour au calme"] },
                { day: "Dimanche", type: "LONG", title: "Longue sortie", description: "Travailler l’endurance sans s’éteindre.", exercises: ["18–20 km progressifs"] }
            ]
        }
    };

    const weeksContainer = document.getElementById("weeks");
    Object.keys(programs).forEach((week) => {
        const button = document.createElement("button");
        button.className = "week-btn";
        button.textContent = "Semaine " + week;
        button.addEventListener("click", () => showWeek(Number(week)));
        weeksContainer.appendChild(button);
    });

    function showWeek(number) {
        const program = programs[number];
        if (!program) return;

        document.getElementById("weekNumber").textContent = "SEMAINE " + number;
        document.getElementById("weekTitle").textContent = program.title;
        document.getElementById("phase").textContent = program.phase;

        const daysContainer = document.getElementById("days");
        daysContainer.innerHTML = "";

        program.days.forEach((day) => {
            const card = document.createElement("article");
            card.className = "day-card" + (day.type === "REPOS" ? " rest" : "");

            let exercisesHTML = "";
            day.exercises.forEach((exercise) => {
                exercisesHTML += `<li>${exercise}</li>`;
            });

            card.innerHTML = `
                <div class="day-top">
                    <span class="day-name">${day.day}</span>
                    <span class="badge">${day.type}</span>
                </div>
                <h3>${day.title}</h3>
                <p class="description">${day.description}</p>
                <ul class="exercise-list">${exercisesHTML}</ul>
            `;
            daysContainer.appendChild(card);
        });

        document.querySelectorAll(".week-btn").forEach((button) => {
            button.classList.toggle("active", Number(button.textContent.replace(/\D/g, "")) === number);
        });
    }

    showWeek(1);