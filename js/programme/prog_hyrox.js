    const programs = {
        1: {
            title: "Base",
            phase: "Phase 1 — Base",
            days: [
                { day: "Lundi", type: "ENGINE", title: "Course + technique", description: "Régler le rythme de course et la technique de foulée.", exercises: ["10 min facile", "6×800 m à allure soutenue", "2 min de récupération", "10 min retour au calme"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Le corps récupère.", exercises: ["Repos complet", "Mobility 15 min"] },
                { day: "Mercredi", type: "STATIONS", title: "Technique HYROX", description: "Apprendre à bien enchaîner les mouvements.", exercises: ["SkiErg — 500 m", "Sled Push — 25 m", "Sled Pull — 25 m", "Burpees — 10", "Row — 500 m", "Transitions rapides"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Récupération active.", exercises: ["Marche 20 min", "Mobilité légère"] },
                { day: "Vendredi", type: "FLOW", title: "Race flow", description: "Prendre le rythme d’une vraie course.", exercises: ["4×1 km run", "Wall Balls — 20", "Farmer Carry — 100 m", "Récupération courte"] },
                { day: "Samedi", type: "STRENGTH", title: "Puissance", description: "Créer la base de force utile.", exercises: ["Squat — 4×5", "RDL — 3×8", "Sled Push — 20 m", "Burpees — 10"] },
                { day: "Dimanche", type: "LONG", title: "Endurance", description: "Construire le moteur aérobie.", exercises: ["10–12 km facile", "Allure conversationnelle"] }
            ]
        },
        2: {
            title: "Volume",
            phase: "Phase 1 — Base",
            days: [
                { day: "Lundi", type: "ENGINE", title: "Course qualité", description: "Maintenir le rythme sur des blocs plus longs.", exercises: ["10 min facile", "5×1 km @ 4:30–4:40/km", "2 min de récupération"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Absorber la charge.", exercises: ["Repos complet"] },
                { day: "Mercredi", type: "STATIONS", title: "Technique HYROX", description: "Faire les transitions à un bon rythme.", exercises: ["SkiErg — 500 m", "Sled Push — 25 m", "Sled Pull — 25 m", "Burpees — 12", "Row — 500 m"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Récupération active.", exercises: ["Marche 25 min"] },
                { day: "Vendredi", type: "FLOW", title: "Race flow", description: "Garder le rythme et le mouvement propre.", exercises: ["3×1 km course", "Wall Balls — 20", "Farmer Carry — 100 m", "2 km retour au calme"] },
                { day: "Samedi", type: "STRENGTH", title: "Force utile", description: "Créer de la base de force pour la course.", exercises: ["Squat — 5×5", "RDL — 3×8", "Sled Push — 25 m", "Burpees — 12"] },
                { day: "Dimanche", type: "LONG", title: "Endurance", description: "Sortie longue et régulière.", exercises: ["12–14 km facile"] }
            ]
        },
        3: {
            title: "Force",
            phase: "Phase 2 — Développement",
            days: [
                { day: "Lundi", type: "ENGINE", title: "Intervalles", description: "Accroitre le développement aérobie.", exercises: ["10 min facile", "6×800 m au seuil", "2 min récupération", "10 min retour au calme"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Récupération et mobilité.", exercises: ["Repos complet", "Stretching 15 min"] },
                { day: "Mercredi", type: "STATIONS", title: "Technique spécifique", description: "Améliorer la qualité de chaque station.", exercises: ["SkiErg — 500 m", "Sled Push — 25 m", "Sled Pull — 25 m", "Burpees — 15", "Row — 500 m", "Farmer Carry — 50 m"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Récupération active.", exercises: ["Marche 20 min"] },
                { day: "Vendredi", type: "FLOW", title: "Simulation", description: "Gérer le rythme complet sur une boucle.", exercises: ["4×1 km run", "Wall Balls — 20", "Lunges — 20 m", "2 km retour au calme"] },
                { day: "Samedi", type: "STRENGTH", title: "Puissance", description: "Créer de la résistance en force utile.", exercises: ["Squat — 4×5", "RDL — 4×6", "Sled Push — 25 m", "Burpees — 15"] },
                { day: "Dimanche", type: "LONG", title: "Course longue", description: "Développer la capacité à tenir sur la distance.", exercises: ["14–16 km facile"] }
            ]
        },
        4: {
            title: "Deload",
            phase: "Phase 2 — Récupération",
            days: [
                { day: "Lundi", type: "ENGINE", title: "Course légère", description: "Réduire l’intensité.", exercises: ["6 km facile", "3×200 m rapides"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Absorber la charge.", exercises: ["Repos complet"] },
                { day: "Mercredi", type: "STATIONS", title: "Technique légère", description: "Garder les mouvements sans fatigue.", exercises: ["SkiErg — 500 m", "Sled Push — 25 m", "Sled Pull — 25 m", "Burpees — 8"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Récupération active.", exercises: ["Marche 20 min"] },
                { day: "Vendredi", type: "FLOW", title: "Flow léger", description: "Maintenir le schéma global.", exercises: ["3×1 km course", "Wall Balls — 15", "Farmer Carry — 50 m"] },
                { day: "Samedi", type: "STRENGTH", title: "Force légère", description: "Réduire le volume mais garder la qualité.", exercises: ["Squat — 3×5", "RDL — 3×6", "Sled Push — 20 m"] },
                { day: "Dimanche", type: "LONG", title: "Endurance", description: "Sortie courte pour récupérer.", exercises: ["10–12 km facile"] }
            ]
        },
        5: {
            title: "Consolidation",
            phase: "Phase 3 — Intensité",
            days: [
                { day: "Lundi", type: "ENGINE", title: "Intervalles", description: "Développer la capacité à tenir un bon rythme.", exercises: ["10 min facile", "5×1 km @ seuil", "2 min récupération"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Récupération complète.", exercises: ["Repos complet"] },
                { day: "Mercredi", type: "STATIONS", title: "Technique HYROX", description: "Fluidité et transitions rapides.", exercises: ["SkiErg — 500 m", "Sled Push — 25 m", "Sled Pull — 25 m", "Burpees — 15", "Row — 500 m", "Farmers — 50 m"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Récupération active.", exercises: ["Marche 20 min"] },
                { day: "Vendredi", type: "FLOW", title: "Simulation", description: "Combiner puissance et endurance.", exercises: ["4×1 km run", "Wall Balls — 20", "Lunges — 20 m", "2 km retour au calme"] },
                { day: "Samedi", type: "STRENGTH", title: "Force utile", description: "Construire la puissance de mouvement.", exercises: ["Squat — 5×5", "RDL — 4×6", "Sled Push — 25 m", "Burpees — 12"] },
                { day: "Dimanche", type: "LONG", title: "Endurance", description: "Développer la capacité aérobie.", exercises: ["16–18 km progressifs"] }
            ]
        },
        6: {
            title: "Compétition",
            phase: "Phase 3 — Performance",
            days: [
                { day: "Lundi", type: "ENGINE", title: "Course spécifique", description: "Travailler la vitesse aérobie tout en restant propre.", exercises: ["10 min facile", "5×800 m en dessous de seuil", "2 min récupération"] },
                { day: "Mardi", type: "REPOS", title: "Repos", description: "Récupération.", exercises: ["Repos complet", "Mobility 15 min"] },
                { day: "Mercredi", type: "STATIONS", title: "Pré-compétition", description: "Tester le bon enchaînement.", exercises: ["SkiErg — 500 m", "Sled Push — 25 m", "Sled Pull — 25 m", "Burpees — 15", "Row — 500 m", "Farmers — 50 m"] },
                { day: "Jeudi", type: "REPOS", title: "Repos", description: "Très peu d’intensité.", exercises: ["Marche 20 min"] },
                { day: "Vendredi", type: "FLOW", title: "Race flow", description: "Préparer le jour J.", exercises: ["3×1 km run", "Wall Balls — 20", "Farmer Carry — 100 m", "Retour au calme"] },
                { day: "Samedi", type: "STRENGTH", title: "Force utile", description: "Maintenir la puissance et la mécanique.", exercises: ["Squat — 3×5", "RDL — 3×6", "Sled Push — 25 m", "Burpees — 10"] },
                { day: "Dimanche", type: "LONG", title: "Endurance", description: "Sortie confortable et propre.", exercises: ["12–14 km facile"] }
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