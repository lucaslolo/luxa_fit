    const programs = {
        1: {
            title: "Reprise",
            phase: "Phase 1 — Base",
            days: [
                {
                    day: "Lundi",
                    type: "PULL",
                    title: "Dos & biceps",
                    description: "Reprendre progressivement la force de tirage.",
                    exercises: ["Tractions — 4×8", "Rowing — 4×8", "Tirage poulie unilatéral — 4×12", "Pull-over poulie — 3×12", "Face Pull — 3×15"]
                },
                {
                    day: "Mardi",
                    type: "LEGS",
                    title: "Jambes",
                    description: "Reconstruire la force des jambes.",
                    exercises: ["Squat — 4×6–8", "Leg press — 3×10", "Fentes bulgares — 3×10", "Leg extension — 3×10", "Abducteurs — 3×8"]
                },
                {
                    day: "Mercredi",
                    type: "PUSH",
                    title: "Pectoraux & épaules",
                    description: "Développer le haut du corps sans accumuler trop de fatigue.",
                    exercises: ["Développé couché — 5×5", "Élévations latérales — 4×8", "Élévations frontales — 4×12", "Triceps — 3×10", "Biceps — 3×10"]
                },
                {
                    day: "Jeudi",
                    type: "REPOS",
                    title: "Récupération",
                    description: "Le repos fait partie du programme.",
                    exercises: ["Repos complet", "Mobilité légère", "Marche optionnelle"]
                },
                {
                    day: "Vendredi",
                    type: "UPPER",
                    title: "Rappel haut du corps",
                    description: "Travailler les points faibles sans aller à l'échec sur chaque série.",
                    exercises: ["Bench incliné — 3×8", "OHP — 3×8", "Élévations latérales — 3×12", "Tirage poulie — 3×10"]
                },
                {
                    day: "Samedi",
                    type: "LOWER",
                    title: "Rappel bas du corps",
                    description: "Renforcer la chaîne postérieure et les jambes.",
                    exercises: ["Squat goblet — 3×8", "RDL — 3×8", "Leg curl — 3×10", "Mollets — 4×12"]
                },
                {
                    day: "Dimanche",
                    type: "REPOS",
                    title: "Repos",
                    description: "Repos complet pour repartir sur une nouvelle semaine.",
                    exercises: ["Repos complet", "Mobilité légère"]
                }
            ]
        },
        2: {
            title: "Volume",
            phase: "Phase 1 — Base",
            days: [
                {
                    day: "Lundi",
                    type: "PULL",
                    title: "Dos & triceps",
                    description: "Augmenter le volume de traction.",
                    exercises: ["Tractions — 4×6–8", "Rowing — 4×8", "Tirage vertical — 3×10", "Pulldown — 3×10", "Face Pull — 3×15"]
                },
                {
                    day: "Mardi",
                    type: "LEGS",
                    title: "Jambes",
                    description: "Augmenter le volume sans excès de fatigue.",
                    exercises: ["Squat — 4×6", "Leg press — 3×10", "Fentes bulgares — 3×10", "Leg curl — 3×12", "Mollets — 4×12"]
                },
                {
                    day: "Mercredi",
                    type: "PUSH",
                    title: "Pecs & épaules",
                    description: "Maintenir un bon volume de travail sur le haut du corps.",
                    exercises: ["Bench — 4×6", "Incliné haltères — 3×8", "OHP — 3×8", "Élévations latérales — 4×12", "Triceps — 3×10"]
                },
                {
                    day: "Jeudi",
                    type: "REPOS",
                    title: "Récupération",
                    description: "Absorber la charge.",
                    exercises: ["Repos", "Marche 20–30 min"]
                },
                {
                    day: "Vendredi",
                    type: "UPPER",
                    title: "Rappel haut du corps",
                    description: "Travailler la force du haut sans aller trop loin.",
                    exercises: ["Bench incliné — 4×6", "Row poulie — 4×10", "Élévations frontales — 3×12", "Biceps — 3×10"]
                },
                {
                    day: "Samedi",
                    type: "LOWER",
                    title: "Rappel bas du corps",
                    description: "Faire progresser la force des jambes et du dos.",
                    exercises: ["Squat — 3×5", "RDL — 3×8", "Leg curl — 3×10", "Abducteurs — 3×8"]
                },
                {
                    day: "Dimanche",
                    type: "REPOS",
                    title: "Repos",
                    description: "Repos complet pour repartir sur une nouvelle semaine.",
                    exercises: ["Repos complet"]
                }
            ]
        },
        3: {
            title: "Force",
            phase: "Phase 2 — Développement",
            days: [
                {
                    day: "Lundi",
                    type: "PULL",
                    title: "Dos & force",
                    description: "Développer la force de tirage.",
                    exercises: ["Tractions — 4×6", "Row barre — 4×6", "Tirage vertical — 3×8", "Row poulie — 3×10", "Face Pull — 3×15"]
                },
                {
                    day: "Mardi",
                    type: "LEGS",
                    title: "Force jambes",
                    description: "Construire la puissance et la capacité de charge.",
                    exercises: ["Squat — 5×5", "RDL — 4×6", "Fentes bulgares — 3×8", "Leg curl — 3×10", "Mollets — 4×12"]
                },
                {
                    day: "Mercredi",
                    type: "PUSH",
                    title: "Haut du corps",
                    description: "Travail de force avec un bon niveau de tension.",
                    exercises: ["Bench — 4×6", "Incliné — 3×8", "OHP — 3×8", "Élévations latérales — 4×12", "Triceps — 3×10"]
                },
                {
                    day: "Jeudi",
                    type: "REPOS",
                    title: "Repos",
                    description: "Récupération et recharge.",
                    exercises: ["Repos complet", "Mobilité légère"]
                },
                {
                    day: "Vendredi",
                    type: "UPPER",
                    title: "Rappel haut du corps",
                    description: "Maitenir la force du haut sans trop de fatigue.",
                    exercises: ["Bench incliné — 4×5", "Row poulie — 4×8", "Élévations frontales — 3×12", "Biceps — 3×10"]
                },
                {
                    day: "Samedi",
                    type: "LOWER",
                    title: "Rappel bas du corps",
                    description: "Améliorer la force de la chaîne postérieure.",
                    exercises: ["Squat — 4×5", "RDL — 4×6", "Leg extension — 3×10", "Abducteurs — 3×8"]
                },
                {
                    day: "Dimanche",
                    type: "REPOS",
                    title: "Repos",
                    description: "Récupération complète.",
                    exercises: ["Repos complet"]
                }
            ]
        },
        4: {
            title: "Deload",
            phase: "Phase 2 — Récupération",
            days: [
                {
                    day: "Lundi",
                    type: "PULL",
                    title: "Dos léger",
                    description: "Réduire le volume pour récupérer.",
                    exercises: ["Tractions — 3×6", "Rowing — 3×8", "Pull-over — 2×12"]
                },
                {
                    day: "Mardi",
                    type: "LEGS",
                    title: "Jambes légère",
                    description: "Maintenir le mouvement sans fatigue excessive.",
                    exercises: ["Squat — 3×5", "RDL — 3×6", "Lunges — 2×10", "Leg curl — 2×10"]
                },
                {
                    day: "Mercredi",
                    type: "PUSH",
                    title: "Haut du corps",
                    description: "Volume réduit et exécution propre.",
                    exercises: ["Bench — 3×6", "Incliné — 2×8", "OHP — 2×8"]
                },
                {
                    day: "Jeudi",
                    type: "REPOS",
                    title: "Repos",
                    description: "Absorber les trois semaines précédentes.",
                    exercises: ["Repos", "Mobilité légère"]
                },
                {
                    day: "Vendredi",
                    type: "UPPER",
                    title: "Force légère",
                    description: "Conserver le tonus sans charger trop.",
                    exercises: ["Row poulie — 3×8", "Élévations latérales — 2×12", "Biceps — 2×10"]
                },
                {
                    day: "Samedi",
                    type: "LOWER",
                    title: "Bas du corps léger",
                    description: "Maintenir les sensations.",
                    exercises: ["Squat — 3×5", "Leg curl — 2×10", "Mollets — 3×12"]
                },
                {
                    day: "Dimanche",
                    type: "REPOS",
                    title: "Repos",
                    description: "Repos complet.",
                    exercises: ["Repos complet"]
                }
            ]
        },
        5: {
            title: "Consolidation",
            phase: "Phase 3 — Intensité",
            days: [
                {
                    day: "Lundi",
                    type: "PULL",
                    title: "Dos + triceps",
                    description: "Reprendre l’intensité avec précision.",
                    exercises: ["Tractions — 4×5", "Row barre — 4×6", "Tirage vertical — 3×8", "Face Pull — 3×15"]
                },
                {
                    day: "Mardi",
                    type: "LEGS",
                    title: "Jambes",
                    description: "Développer la force de base et la stabilité.",
                    exercises: ["Squat — 5×5", "RDL — 4×6", "Fentes bulgares — 3×8", "Leg curl — 3×10"]
                },
                {
                    day: "Mercredi",
                    type: "PUSH",
                    title: "Pecs & épaules",
                    description: "Garder un volume solide sans surcharge.",
                    exercises: ["Bench — 5×5", "Incliné — 3×8", "OHP — 3×8", "Élévations latérales — 4×12"]
                },
                {
                    day: "Jeudi",
                    type: "REPOS",
                    title: "Repos",
                    description: "Récupération active.",
                    exercises: ["Repos", "Marche 20–30 min"]
                },
                {
                    day: "Vendredi",
                    type: "UPPER",
                    title: "Rappel haut du corps",
                    description: "Renforcer les points faibles du haut.",
                    exercises: ["Bench incliné — 4×6", "Row poulie — 4×8", "Élévations frontales — 3×12", "Triceps — 3×10"]
                },
                {
                    day: "Samedi",
                    type: "LOWER",
                    title: "Rappel bas du corps",
                    description: "Maintenir la densité de travail.",
                    exercises: ["Squat — 4×6", "RDL — 3×8", "Leg extension — 3×10", "Mollets — 4×12"]
                },
                {
                    day: "Dimanche",
                    type: "REPOS",
                    title: "Repos",
                    description: "Repos complet.",
                    exercises: ["Repos complet"]
                }
            ]
        },
        6: {
            title: "Masse",
            phase: "Phase 3 — Volume",
            days: [
                {
                    day: "Lundi",
                    type: "PULL",
                    title: "Dos & taille",
                    description: "Structurer le volume de traction.",
                    exercises: ["Tractions — 4×8", "Row barre — 4×8", "Tirage vertical — 4×10", "Face Pull — 3×15"]
                },
                {
                    day: "Mardi",
                    type: "LEGS",
                    title: "Jambes",
                    description: "Faire progresser le volume de la séance de jambes.",
                    exercises: ["Squat — 4×6–8", "Leg press — 3×10", "Fentes bulgares — 3×10", "Leg curl — 3×12", "Mollets — 4×12"]
                },
                {
                    day: "Mercredi",
                    type: "PUSH",
                    title: "Pecs & épaules",
                    description: "Conserver la qualité sur le haut du corps.",
                    exercises: ["Bench — 4×6", "Incliné — 3×8", "OHP — 3×8", "Élévations latérales — 4×12", "Triceps — 3×10"]
                },
                {
                    day: "Jeudi",
                    type: "REPOS",
                    title: "Récupération",
                    description: "Rester frais pour le week-end.",
                    exercises: ["Repos", "Marche 20–30 min"]
                },
                {
                    day: "Vendredi",
                    type: "UPPER",
                    title: "Rappel haut du corps",
                    description: "Renforcer les points faibles sans surcharge.",
                    exercises: ["Bench incliné — 4×6", "Row poulie — 4×8", "Élévations frontales — 3×12", "Biceps — 3×10"]
                },
                {
                    day: "Samedi",
                    type: "LOWER",
                    title: "Rappel bas du corps",
                    description: "Travailler le bas du corps avec régularité.",
                    exercises: ["Squat — 4×6", "RDL — 3×8", "Leg extension — 3×10", "Abducteurs — 3×8"]
                },
                {
                    day: "Dimanche",
                    type: "REPOS",
                    title: "Repos",
                    description: "Repos complet pour repartir frais.",
                    exercises: ["Repos complet"]
                }
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