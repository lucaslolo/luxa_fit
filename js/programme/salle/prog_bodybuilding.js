window.salleProgram = {
    title: "Bodybuilding",
    kicker: "SALLE / HYPERTROPHIE",
    description: "Construire du muscle avec du volume, une exécution contrôlée et une progression mesurable.",
    note: "Objectif : accumuler du volume de qualité. Garde 1 à 2 répétitions en réserve sur les exercices principaux et note tes charges.",
    weeks: {
        1: { title: "Volume de base", phase: "Phase 1 — Accumulation", days: [
            { day: "Lundi", type: "PUSH", title: "Pectoraux & triceps", description: "Installer un volume solide sur les mouvements de poussée.", exercises: ["Développé couché — 4×8", "Développé incliné — 3×10", "Élévations latérales — 4×12", "Extension triceps — 3×12"] },
            { day: "Mardi", type: "PULL", title: "Dos & biceps", description: "Créer de la tension sur toute la chaîne de tirage.", exercises: ["Tirage vertical — 4×8", "Rowing — 4×10", "Face pull — 3×15", "Curl incliné — 3×12"] },
            { day: "Jeudi", type: "LEGS", title: "Jambes", description: "Développer les jambes avec une amplitude constante.", exercises: ["Squat — 4×8", "Presse — 3×12", "Leg curl — 4×10", "Mollets — 4×15"] },
            { day: "Vendredi", type: "UPPER", title: "Rappel haut", description: "Compléter le volume hebdomadaire.", exercises: ["Bench incliné — 3×10", "Row poulie — 3×10", "OHP — 3×8", "Bras — 3×12"] }
        ] },
        2: { title: "Surcharge", phase: "Phase 1 — Accumulation", days: [
            { day: "Lundi", type: "PUSH", title: "Pectoraux & triceps", description: "Ajouter une répétition sur les séries stables.", exercises: ["Développé couché — 4×9", "Développé incliné — 3×10", "Élévations latérales — 4×14", "Extension triceps — 3×12"] },
            { day: "Mardi", type: "PULL", title: "Dos & biceps", description: "Augmenter le volume sans perdre le contrôle.", exercises: ["Tirage vertical — 4×9", "Rowing — 4×10", "Face pull — 3×15", "Curl incliné — 3×12"] },
            { day: "Jeudi", type: "LEGS", title: "Jambes", description: "Garder une amplitude complète.", exercises: ["Squat — 4×9", "Presse — 3×12", "Leg curl — 4×12", "Mollets — 4×15"] },
            { day: "Vendredi", type: "UPPER", title: "Rappel haut", description: "Stimuler sans créer de fatigue inutile.", exercises: ["Bench incliné — 3×10", "Row poulie — 3×12", "OHP — 3×10", "Bras — 3×12"] }
        ] },
        3: { title: "Intensification", phase: "Phase 2 — Développement", days: [
            { day: "Lundi", type: "PUSH", title: "Pectoraux & triceps", description: "Conserver le volume avec des charges plus ambitieuses.", exercises: ["Développé couché — 5×6", "Développé incliné — 4×8", "Élévations latérales — 4×12", "Extension triceps — 4×10"] },
            { day: "Mardi", type: "PULL", title: "Dos & biceps", description: "Renforcer les mouvements de tirage.", exercises: ["Tractions — 4×6", "Rowing — 4×8", "Face pull — 3×15", "Curl barre — 4×10"] },
            { day: "Jeudi", type: "LEGS", title: "Jambes", description: "Mettre l'accent sur les mouvements composés.", exercises: ["Squat — 5×6", "Presse — 4×10", "Leg curl — 4×10", "Mollets — 4×12"] },
            { day: "Vendredi", type: "UPPER", title: "Rappel haut", description: "Finir la semaine avec une bonne qualité d'exécution.", exercises: ["Bench incliné — 4×8", "Row poulie — 4×8", "OHP — 3×8", "Bras — 3×10"] }
        ] },
        4: { title: "Deload", phase: "Phase 2 — Récupération", days: [
            { day: "Lundi", type: "PUSH", title: "Poussée légère", description: "Réduire le volume pour assimiler le cycle.", exercises: ["Développé couché — 3×8", "Développé incliné — 2×10", "Élévations latérales — 3×12"] },
            { day: "Mardi", type: "PULL", title: "Tirage léger", description: "Bouger proprement sans forcer.", exercises: ["Tirage vertical — 3×8", "Rowing — 3×10", "Face pull — 2×15"] },
            { day: "Jeudi", type: "LEGS", title: "Jambes légères", description: "Maintenir les sensations.", exercises: ["Squat — 3×6", "Presse — 2×10", "Leg curl — 2×10"] },
            { day: "Vendredi", type: "UPPER", title: "Rappel facile", description: "Sortir frais de la semaine.", exercises: ["Bench incliné — 2×10", "Row poulie — 2×10", "Mobilité — 15 min"] }
        ] }
    }
};
