window.salleProgram = {
    title: "Powerbuilding",
    kicker: "SALLE / FORCE + HYPERTROPHIE",
    description: "Mélanger la force sur les mouvements de base et le volume nécessaire pour bâtir un physique complet.",
    note: "Objectif : garder les mouvements principaux lourds et utiliser les exercices d'assistance pour développer chaque groupe musculaire sans épuiser la récupération.",
    weeks: {
        1: { title: "Construction", phase: "Phase 1 — Base", days: [
            { day: "Lundi", type: "LOWER", title: "Squat & jambes", description: "Commencer la semaine avec la force des jambes.", exercises: ["Squat — 5×5", "Presse — 3×10", "Leg curl — 3×12", "Mollets — 4×15"] },
            { day: "Mardi", type: "UPPER", title: "Bench & haut", description: "Associer force et volume sur le haut du corps.", exercises: ["Bench press — 5×5", "Rowing — 4×8", "Développé incliné — 3×10", "Élévations latérales — 3×15"] },
            { day: "Jeudi", type: "PULL", title: "Deadlift & dos", description: "Construire la chaîne postérieure et le dos.", exercises: ["Deadlift — 4×4", "Tractions — 4×6", "Row poulie — 3×10", "Curl — 3×12"] },
            { day: "Vendredi", type: "PUSH", title: "Poussée volume", description: "Ajouter du travail ciblé sans nuire à la récupération.", exercises: ["OHP — 4×6", "Dips — 3×8", "Élévations latérales — 4×12", "Triceps — 3×12"] },
            { day: "Samedi", type: "LEGS", title: "Jambes volume", description: "Finir la semaine avec un volume contrôlé.", exercises: ["Front squat — 4×8", "Fentes — 3×10", "Leg extension — 3×12", "Abdos — 3×12"] }
        ] },
        2: { title: "Surcharge", phase: "Phase 1 — Base", days: [
            { day: "Lundi", type: "LOWER", title: "Squat & jambes", description: "Augmenter légèrement la charge principale.", exercises: ["Squat — 5×5", "Presse — 4×10", "Leg curl — 3×12", "Mollets — 4×15"] },
            { day: "Mardi", type: "UPPER", title: "Bench & haut", description: "Accumuler du travail de qualité.", exercises: ["Bench press — 5×5", "Rowing — 4×10", "Développé incliné — 3×10", "Élévations latérales — 4×15"] },
            { day: "Jeudi", type: "PULL", title: "Deadlift & dos", description: "Renforcer le tirage sans perdre la vitesse.", exercises: ["Deadlift — 5×3", "Tractions — 4×7", "Row poulie — 3×12", "Curl — 3×12"] },
            { day: "Vendredi", type: "PUSH", title: "Poussée volume", description: "Développer les épaules et les bras.", exercises: ["OHP — 4×6", "Dips — 4×8", "Élévations latérales — 4×15", "Triceps — 3×12"] },
            { day: "Samedi", type: "LEGS", title: "Jambes volume", description: "Conserver une bonne amplitude.", exercises: ["Front squat — 4×8", "Fentes — 3×12", "Leg extension — 3×15", "Abdos — 3×15"] }
        ] },
        3: { title: "Intensité", phase: "Phase 2 — Développement", days: [
            { day: "Lundi", type: "LOWER", title: "Squat & jambes", description: "Prioriser la force puis compléter avec du volume.", exercises: ["Squat — 5×3", "Presse — 3×8", "Leg curl — 3×10", "Mollets — 4×12"] },
            { day: "Mardi", type: "UPPER", title: "Bench & haut", description: "Faire monter l'intensité du mouvement principal.", exercises: ["Bench press — 6×3", "Rowing — 4×8", "Développé incliné — 3×8", "Élévations latérales — 3×12"] },
            { day: "Jeudi", type: "PULL", title: "Deadlift & dos", description: "Maintenir une technique précise sous charge.", exercises: ["Deadlift — 5×2", "Tractions lestées — 4×5", "Row poulie — 3×10", "Curl — 3×10"] },
            { day: "Vendredi", type: "PUSH", title: "Poussée volume", description: "Stimuler les épaules sans échec inutile.", exercises: ["OHP — 4×5", "Dips lestés — 3×6", "Élévations latérales — 4×12", "Triceps — 3×10"] },
            { day: "Samedi", type: "LEGS", title: "Jambes volume", description: "Finir le cycle avec contrôle.", exercises: ["Front squat — 4×6", "Fentes — 3×8", "Leg extension — 3×12", "Abdos — 3×12"] }
        ] },
        4: { title: "Deload", phase: "Phase 2 — Récupération", days: [
            { day: "Lundi", type: "LOWER", title: "Bas du corps léger", description: "Diminuer le volume et garder les sensations.", exercises: ["Squat — 3×5", "Presse — 2×10", "Leg curl — 2×10"] },
            { day: "Mardi", type: "UPPER", title: "Haut du corps léger", description: "Récupérer sans perdre le geste.", exercises: ["Bench press — 3×5", "Rowing — 3×8", "Incliné — 2×10"] },
            { day: "Jeudi", type: "PULL", title: "Tirage léger", description: "Entretenir la chaîne postérieure.", exercises: ["Deadlift — 3×3", "Tractions — 3×5", "Row poulie — 2×10"] },
            { day: "Vendredi", type: "PUSH", title: "Poussée légère", description: "Garder de la fraîcheur.", exercises: ["OHP — 3×5", "Dips — 2×8", "Mobilité — 10 min"] },
            { day: "Samedi", type: "LEGS", title: "Jambes légères", description: "Terminer le cycle sans fatigue résiduelle.", exercises: ["Front squat — 3×6", "Fentes — 2×10", "Marche — 20 min"] }
        ] }
    }
};
