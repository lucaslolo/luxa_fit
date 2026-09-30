window.salleProgram = {
    title: "Powerlifting",
    kicker: "SALLE / FORCE MAXIMALE",
    description: "Faire progresser le squat, le bench press et le deadlift avec une technique solide et une intensité maîtrisée.",
    note: "Objectif : construire la force sans sacrifier la technique. Les séries principales restent propres et les accessoires soutiennent les trois mouvements.",
    weeks: {
        1: { title: "Base technique", phase: "Phase 1 — Accumulation", days: [
            { day: "Lundi", type: "SQUAT", title: "Squat principal", description: "Répéter un mouvement stable et profond.", exercises: ["Squat — 5×5", "Pause squat — 3×4", "Leg curl — 3×10", "Gainage — 3×40 s"] },
            { day: "Mercredi", type: "BENCH", title: "Bench press", description: "Construire une trajectoire régulière.", exercises: ["Bench press — 5×5", "Bench pause — 3×4", "Rowing — 4×8", "Triceps — 3×10"] },
            { day: "Vendredi", type: "DEADLIFT", title: "Deadlift", description: "Développer la force depuis le sol.", exercises: ["Deadlift — 4×4", "RDL — 3×8", "Tractions — 3×8", "Abdos — 3×12"] }
        ] },
        2: { title: "Accumulation", phase: "Phase 1 — Accumulation", days: [
            { day: "Lundi", type: "SQUAT", title: "Squat principal", description: "Ajouter progressivement de la charge.", exercises: ["Squat — 5×5", "Front squat — 3×5", "Leg curl — 3×10", "Gainage — 3×45 s"] },
            { day: "Mercredi", type: "BENCH", title: "Bench press", description: "Renforcer la poussée et le haut du dos.", exercises: ["Bench press — 5×5", "Bench prise serrée — 3×6", "Rowing — 4×8", "Triceps — 3×10"] },
            { day: "Vendredi", type: "DEADLIFT", title: "Deadlift", description: "Maintenir la position et la vitesse.", exercises: ["Deadlift — 5×3", "RDL — 3×8", "Tractions — 4×6", "Abdos — 3×12"] }
        ] },
        3: { title: "Intensité", phase: "Phase 2 — Intensification", days: [
            { day: "Lundi", type: "SQUAT", title: "Squat lourd", description: "Approcher l'intensité cible avec réserve.", exercises: ["Squat — 5×3", "Pause squat — 3×3", "Leg press — 3×8", "Gainage — 3×45 s"] },
            { day: "Mercredi", type: "BENCH", title: "Bench lourd", description: "Stabiliser chaque répétition.", exercises: ["Bench press — 6×3", "Bench pause — 3×3", "Rowing — 4×8", "Triceps — 3×8"] },
            { day: "Vendredi", type: "DEADLIFT", title: "Deadlift lourd", description: "Produire de la force sans dégrader la position.", exercises: ["Deadlift — 5×2", "RDL — 3×6", "Tractions lestées — 3×5", "Abdos — 3×10"] }
        ] },
        4: { title: "Deload", phase: "Phase 2 — Récupération", days: [
            { day: "Lundi", type: "SQUAT", title: "Squat léger", description: "Réduire la fatigue et garder le geste.", exercises: ["Squat — 3×5", "Pause squat — 2×3", "Mobilité — 10 min"] },
            { day: "Mercredi", type: "BENCH", title: "Bench léger", description: "Conserver le rythme sans forcer.", exercises: ["Bench press — 3×5", "Bench pause — 2×3", "Rowing — 3×8"] },
            { day: "Vendredi", type: "DEADLIFT", title: "Deadlift léger", description: "Sortir du cycle frais et confiant.", exercises: ["Deadlift — 3×3", "RDL — 2×6", "Marche — 20 min"] }
        ] }
    }
};
