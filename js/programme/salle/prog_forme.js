/*
 * =========================================================
 * LUXA_FIT
 * SALLE — REMISE EN FORME
 * BIBLIOTHÈQUE DES PROGRAMMES — 16 SEMAINES
 * =========================================================
 *
 * STRUCTURE :
 *
 * DÉBUTANT
 * ├── 2 séances
 * ├── 3 séances
 * ├── 4 séances
 * └── 5 séances
 *
 * REPRISE
 * ├── 2 séances
 * ├── 3 séances
 * ├── 4 séances
 * └── 5 séances
 *
 * RÉGULIER
 * ├── 2 séances
 * ├── 3 séances
 * ├── 4 séances
 * └── 5 séances
 *
 * PHASES :
 * 1-4   Adaptation / réactivation
 * 5-8   Progression
 * 9-12  Développement
 * 13-16 Consolidation
 *
 * =========================================================
 */


/* =========================================================
   OUTILS
========================================================= */

function makeDay(day, type, title, description, exercises) {
    return {
        day,
        type,
        title,
        description,
        exercises
    };
}


function phaseName(week) {

    if (week <= 4) {
        return "Phase 1 — Adaptation";
    }

    if (week <= 8) {
        return "Phase 2 — Progression";
    }

    if (week <= 12) {
        return "Phase 3 — Développement";
    }

    return "Phase 4 — Consolidation";
}


function phaseTitle(week) {

    if (week === 1) return "Mise en route";
    if (week === 2) return "Adaptation";
    if (week === 3) return "Progression";
    if (week === 4) return "Consolidation";

    if (week === 5) return "Nouveau cycle";
    if (week === 6) return "Montée en charge";
    if (week === 7) return "Progression";
    if (week === 8) return "Consolidation";

    if (week === 9) return "Développement";
    if (week === 10) return "Développement";
    if (week === 11) return "Intensification";
    if (week === 12) return "Consolidation";

    if (week === 13) return "Consolidation";
    if (week === 14) return "Maîtrise";
    if (week === 15) return "Préparation";
    if (week === 16) return "Bilan";

    return "Progression";
}


function progressionNote(level, week) {

    if (level === "debutant") {

        if (week <= 4) {
            return "Priorité à la technique. Garde environ 3 à 4 répétitions en réserve sur les séries.";
        }

        if (week <= 8) {
            return "Si toutes les séries sont propres, augmente légèrement la charge ou ajoute une répétition.";
        }

        if (week <= 12) {
            return "Les exercices principaux deviennent progressivement plus exigeants. Évite toujours l'échec.";
        }

        return "Consolide les performances acquises. La qualité d'exécution reste prioritaire sur la charge.";
    }


    if (level === "reprise") {

        if (week <= 4) {
            return "Reprise progressive. Garde 3 à 4 répétitions en réserve et évite toute série forcée.";
        }

        if (week <= 8) {
            return "Tu peux augmenter progressivement les charges si la récupération reste bonne.";
        }

        if (week <= 12) {
            return "Le volume et l'intensité augmentent. Garde généralement 2 à 3 répétitions en réserve.";
        }

        return "Consolide ton niveau retrouvé sans chercher à battre des records à chaque séance.";
    }


    if (week <= 4) {
        return "Travail contrôlé avec environ 2 à 3 répétitions en réserve.";
    }

    if (week <= 8) {
        return "Progression progressive des charges. Les dernières répétitions doivent rester propres.";
    }

    if (week <= 12) {
        return "Travail plus exigeant avec environ 1 à 3 répétitions en réserve sur les mouvements principaux.";
    }

    return "Consolidation des performances avec une gestion volontaire de la fatigue.";
}


/* =========================================================
   DÉBUTANT — 2 SÉANCES
========================================================= */

function beginner2(week) {

    const sets = week <= 2 ? 3 : 3;
    const reps = week === 1 ? "10" :
                 week === 2 ? "12" :
                 week === 3 ? "8-10" :
                 week === 4 ? "10" :
                 week === 5 ? "10" :
                 week === 6 ? "8-10" :
                 week === 7 ? "8" :
                 week === 8 ? "10" :
                 week === 9 ? "8-10" :
                 week === 10 ? "8" :
                 week === 11 ? "8" :
                 week === 12 ? "10" :
                 week === 13 ? "8" :
                 week === 14 ? "8" :
                 week === 15 ? "6-8" :
                 "10";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "FULL BODY",
                "Full Body A",
                "Séance complète avec priorité aux mouvements fondamentaux.",
                [
                    `Presse à cuisses — ${sets}×${reps}`,
                    `Chest press machine — ${sets}×${reps}`,
                    `Tirage horizontal — ${sets}×10-12`,
                    `Leg curl — 2×12`,
                    "Gainage — 3×20-45 s"
                ]
            ),

            makeDay(
                "Vendredi",
                "FULL BODY",
                "Full Body B",
                "Deuxième séance complète avec des mouvements complémentaires.",
                [
                    `Goblet squat — ${sets}×${reps}`,
                    `Développé épaules machine — ${sets}×10`,
                    `Tirage vertical — ${sets}×10-12`,
                    `Hip thrust machine — 2×10-12`,
                    "Dead bug — 3×8-12 par côté"
                ]
            )

        ]
    };
}


/* =========================================================
   DÉBUTANT — 3 SÉANCES
========================================================= */

function beginner3(week) {

    const main =
        week <= 4 ? "3×10-12" :
        week <= 8 ? "3×8-10" :
        week <= 12 ? "4×8-10" :
        "3×8";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "FULL BODY",
                "Full Body A",
                "Travail général avec priorité aux jambes et à la poussée.",
                [
                    `Presse à cuisses — ${main}`,
                    `Développé couché machine — ${main}`,
                    "Tirage horizontal — 3×10-12",
                    "Leg curl — 2×12",
                    "Gainage — 3×30-45 s"
                ]
            ),

            makeDay(
                "Mercredi",
                "FULL BODY",
                "Full Body B",
                "Accent sur le dos, les hanches et les épaules.",
                [
                    "Goblet squat — 3×10-12",
                    `Tirage vertical — ${main}`,
                    `Développé incliné haltères — ${main}`,
                    "Hip thrust — 3×10-12",
                    "Élévations latérales — 2×15"
                ]
            ),

            makeDay(
                "Vendredi",
                "FULL BODY",
                "Full Body C",
                "Séance équilibrée pour terminer la semaine.",
                [
                    "Hack squat ou presse — 3×10",
                    "Chest press — 3×10",
                    "Tirage horizontal — 3×10",
                    "Leg curl — 2×12",
                    "Dead bug — 3×10 par côté"
                ]
            )

        ]
    };
}


/* =========================================================
   DÉBUTANT — 4 SÉANCES
========================================================= */

function beginner4(week) {

    const main =
        week <= 4 ? "3×10-12" :
        week <= 8 ? "3×8-10" :
        week <= 12 ? "4×8-10" :
        "3×8";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "UPPER",
                "Upper A",
                "Haut du corps avec mouvements simples et contrôlés.",
                [
                    `Développé couché machine — ${main}`,
                    `Tirage horizontal — ${main}`,
                    "Développé épaules machine — 2×10",
                    "Tirage vertical — 2×10-12",
                    "Élévations latérales — 2×15"
                ]
            ),

            makeDay(
                "Mardi",
                "LOWER",
                "Lower A",
                "Travail des quadriceps et du tronc.",
                [
                    `Presse à cuisses — ${main}`,
                    "Leg curl — 3×12",
                    "Leg extension — 2×12",
                    "Mollets — 3×15",
                    "Gainage — 3×30-45 s"
                ]
            ),

            makeDay(
                "Jeudi",
                "UPPER",
                "Upper B",
                "Deuxième stimulation du haut du corps.",
                [
                    "Développé incliné haltères — 3×10",
                    "Tirage vertical — 3×10",
                    "Chest press — 2×12",
                    "Tirage horizontal — 2×12",
                    "Curl — 2×12"
                ]
            ),

            makeDay(
                "Samedi",
                "LOWER",
                "Lower B",
                "Accent sur les hanches et la chaîne postérieure.",
                [
                    "Goblet squat — 3×10",
                    "Hip thrust — 3×10",
                    "Soulevé de terre roumain léger — 2×10",
                    "Leg curl — 2×12",
                    "Dead bug — 3×10 par côté"
                ]
            )

        ]
    };
}


/* =========================================================
   DÉBUTANT — 5 SÉANCES
========================================================= */

function beginner5(week) {

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "UPPER",
                "Upper A",
                "Haut du corps avec volume modéré.",
                [
                    `Développé couché machine — ${week <= 4 ? "3×10-12" : "3×8-10"}`,
                    "Tirage horizontal — 3×10-12",
                    "Développé épaules — 2×10",
                    "Tirage vertical — 2×12",
                    "Élévations latérales — 2×15"
                ]
            ),

            makeDay(
                "Mardi",
                "LOWER",
                "Lower A",
                "Travail général des jambes.",
                [
                    `Presse à cuisses — ${week <= 4 ? "3×10-12" : "3×8-10"}`,
                    "Leg curl — 3×12",
                    "Leg extension — 2×12",
                    "Mollets — 3×15",
                    "Gainage — 3×30-45 s"
                ]
            ),

            makeDay(
                "Mercredi",
                "CONDITIONING",
                "Condition physique",
                "Séance volontairement légère afin de faciliter la récupération.",
                [
                    week <= 4
                        ? "15-20 min vélo ou marche inclinée"
                        : "20-25 min cardio à intensité modérée",
                    "Circuit 3 tours :",
                    "10 squats poids du corps",
                    "8 pompes inclinées",
                    "10 tirages poulie",
                    "1 min marche",
                    "Retour au calme 5 min"
                ]
            ),

            makeDay(
                "Jeudi",
                "UPPER",
                "Upper B",
                "Deuxième stimulation du haut du corps.",
                [
                    "Développé incliné haltères — 3×10",
                    "Tirage vertical — 3×10",
                    "Chest press — 2×12",
                    "Tirage horizontal — 2×12",
                    "Curl ou extension triceps — 2×12"
                ]
            ),

            makeDay(
                "Samedi",
                "LOWER",
                "Lower B",
                "Deuxième séance jambes avec volume maîtrisé.",
                [
                    "Goblet squat — 3×10",
                    "Hip thrust — 3×10",
                    "Soulevé de terre roumain léger — 2×10",
                    "Leg curl — 2×12",
                    "Dead bug — 3×10 par côté"
                ]
            )

        ]
    };
}


/* =========================================================
   REPRISE — 2 SÉANCES
========================================================= */

function reprise2(week) {

    const intensity =
        week <= 4 ? "3×10-12" :
        week <= 8 ? "3×8-10" :
        week <= 12 ? "4×8-10" :
        "3×8";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "FULL BODY",
                "Full Body A",
                "Réactivation progressive de l'ensemble du corps.",
                [
                    `Presse à cuisses — ${intensity}`,
                    `Développé couché haltères — ${intensity}`,
                    `Tirage horizontal — ${intensity}`,
                    "Soulevé de terre roumain — 2-3×10",
                    "Élévations latérales — 2×15",
                    "Gainage — 3×30-45 s"
                ]
            ),

            makeDay(
                "Vendredi",
                "FULL BODY",
                "Full Body B",
                "Deuxième séance avec accent sur les hanches et le dos.",
                [
                    `Goblet squat — ${intensity}`,
                    "Développé incliné haltères — 3×10",
                    "Tirage vertical — 3×10-12",
                    "Hip thrust — 3×10",
                    "Leg curl — 2×12",
                    "Dead bug — 3×10 par côté"
                ]
            )

        ]
    };
}


/* =========================================================
   REPRISE — 3 SÉANCES
========================================================= */

function reprise3(week) {

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "FULL BODY",
                "Full Body A",
                "Réactivation des mouvements fondamentaux.",
                [
                    `Presse à cuisses — ${week <= 4 ? "3×10-12" : "3×8-10"}`,
                    "Développé couché haltères — 3×10",
                    "Tirage horizontal — 3×10-12",
                    "Leg curl — 2×12",
                    "Gainage — 3×30-45 s"
                ]
            ),

            makeDay(
                "Mercredi",
                "FULL BODY",
                "Full Body B",
                "Travail contrôlé de la chaîne postérieure.",
                [
                    "Goblet squat — 3×10",
                    "Développé incliné haltères — 3×10",
                    "Tirage vertical — 3×10",
                    "Hip thrust — 3×10",
                    "Élévations latérales — 2×15"
                ]
            ),

            makeDay(
                "Vendredi",
                "FULL BODY",
                "Full Body C",
                "Séance équilibrée avec progression contrôlée.",
                [
                    "Presse à cuisses — 3×10",
                    "Chest press — 3×10",
                    "Tirage horizontal — 3×10",
                    "Leg curl — 2×12",
                    "Curl + triceps — 2×12",
                    "Dead bug — 3×10"
                ]
            )

        ]
    };
}


/* =========================================================
   REPRISE — 4 SÉANCES
========================================================= */

function reprise4(week) {

    const main =
        week <= 4 ? "3×10-12" :
        week <= 8 ? "3×8-10" :
        week <= 12 ? "4×8-10" :
        "3×8";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "UPPER",
                "Upper A",
                "Réactivation du haut du corps.",
                [
                    `Développé couché haltères — ${main}`,
                    `Tirage horizontal — ${main}`,
                    "Développé épaules — 2×10",
                    "Tirage vertical — 2×10",
                    "Curl — 2×12"
                ]
            ),

            makeDay(
                "Mardi",
                "LOWER",
                "Lower A",
                "Réactivation des jambes.",
                [
                    `Presse à cuisses — ${main}`,
                    "Soulevé de terre roumain — 3×10",
                    "Leg curl — 2×12",
                    "Mollets — 3×15",
                    "Gainage — 3×30-45 s"
                ]
            ),

            makeDay(
                "Jeudi",
                "UPPER",
                "Upper B",
                "Deuxième stimulation du haut du corps.",
                [
                    "Développé incliné haltères — 3×10",
                    "Tirage vertical — 3×10",
                    "Chest press — 2×12",
                    "Tirage horizontal — 2×12",
                    "Élévations latérales — 2×15"
                ]
            ),

            makeDay(
                "Samedi",
                "LOWER",
                "Lower B",
                "Accent sur la chaîne postérieure.",
                [
                    "Goblet squat — 3×10",
                    "Hip thrust — 3×10",
                    "Leg extension — 2×12",
                    "Leg curl — 2×12",
                    "Dead bug — 3×10 par côté"
                ]
            )

        ]
    };
}


/* =========================================================
   REPRISE — 5 SÉANCES
========================================================= */

function reprise5(week) {

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "UPPER",
                "Haut du corps A",
                "Reprise générale du haut du corps.",
                [
                    `Développé couché haltères — ${week <= 4 ? "3×10" : "3×8-10"}`,
                    "Tirage horizontal — 3×10-12",
                    "Développé épaules — 2-3×10",
                    "Tirage vertical — 2-3×10-12",
                    "Curl — 2×12"
                ]
            ),

            makeDay(
                "Mardi",
                "LOWER",
                "Bas du corps A",
                "Reprise progressive des jambes.",
                [
                    `Presse à cuisses — ${week <= 4 ? "3×10-12" : "3×8-10"}`,
                    "Soulevé de terre roumain — 3×10",
                    "Leg curl — 2-3×12",
                    "Mollets — 3×15",
                    "Gainage — 3×30-45 s"
                ]
            ),

            makeDay(
                "Mercredi",
                "CONDITIONING",
                "Condition physique",
                "Travail cardio léger à modéré.",
                [
                    week <= 4
                        ? "15-20 min vélo ou marche inclinée"
                        : "20-25 min cardio modéré",
                    "3-4 tours :",
                    "10 squats poids du corps",
                    "8-10 pompes inclinées",
                    "10 tirages poulie",
                    "45-60 s marche rapide",
                    "5 min retour au calme"
                ]
            ),

            makeDay(
                "Jeudi",
                "UPPER",
                "Haut du corps B",
                "Deuxième stimulation du haut du corps.",
                [
                    "Développé incliné haltères — 3×8-10",
                    "Tirage vertical — 3×10",
                    "Chest press — 3×10-12",
                    "Tirage horizontal — 3×10",
                    "Élévations latérales — 3×15"
                ]
            ),

            makeDay(
                "Samedi",
                "LOWER",
                "Bas du corps B",
                "Deuxième séance jambes avec un volume maîtrisé.",
                [
                    "Goblet squat — 3×10",
                    "Hip thrust — 3×10",
                    "Leg extension — 2-3×12",
                    "Leg curl — 2-3×12",
                    "Dead bug — 3×10 par côté"
                ]
            )

        ]
    };
}


/* =========================================================
   RÉGULIER — 2 SÉANCES
========================================================= */

function regular2(week) {

    const main =
        week <= 4 ? "4×6-8" :
        week <= 8 ? "4×6-8" :
        week <= 12 ? "4×5-7" :
        "3×6-8";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "FULL BODY",
                "Full Body A",
                "Séance orientée force générale et hypertrophie.",
                [
                    `Squat ou hack squat — ${main}`,
                    `Développé couché — ${main}`,
                    "Tirage horizontal — 4×8-10",
                    "Soulevé de terre roumain — 3×8-10",
                    "Élévations latérales — 3×12-15",
                    "Gainage — 3×45-60 s"
                ]
            ),

            makeDay(
                "Jeudi",
                "FULL BODY",
                "Full Body B",
                "Deuxième séance complète avec accent sur la chaîne postérieure.",
                [
                    "Presse à cuisses — 4×8-10",
                    "Développé incliné haltères — 4×8-10",
                    "Tirage vertical — 4×8-10",
                    "Hip thrust — 3×8-10",
                    "Curl barre — 3×10-12",
                    "Extension triceps — 3×10-12"
                ]
            )

        ]
    };
}


/* =========================================================
   RÉGULIER — 3 SÉANCES
========================================================= */

function regular3(week) {

    const compound =
        week <= 4 ? "4×6-8" :
        week <= 8 ? "4×6-8" :
        week <= 12 ? "4×5-7" :
        "3×6-8";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "FULL BODY",
                "Full Body A",
                "Accent sur les quadriceps et la poussée.",
                [
                    `Squat — ${compound}`,
                    `Développé couché — ${compound}`,
                    "Tirage horizontal — 3-4×8-10",
                    "Leg curl — 3×10-12",
                    "Élévations latérales — 3×12-15",
                    "Abdominaux — 3×12-15"
                ]
            ),

            makeDay(
                "Mercredi",
                "FULL BODY",
                "Full Body B",
                "Accent sur la chaîne postérieure et le dos.",
                [
                    `Soulevé de terre roumain — ${compound}`,
                    "Développé incliné haltères — 3-4×8-10",
                    "Tirage vertical — 4×8-10",
                    "Presse à cuisses — 3×10",
                    "Curl barre — 3×10-12",
                    "Extension triceps — 3×10-12"
                ]
            ),

            makeDay(
                "Vendredi",
                "FULL BODY",
                "Full Body C",
                "Séance équilibrée avec volume complémentaire.",
                [
                    "Hack squat — 3-4×8-10",
                    "Développé épaules — 3×8-10",
                    "Tirage horizontal — 3-4×8-10",
                    "Hip thrust — 3×8-10",
                    "Élévations latérales — 3×15",
                    "Gainage — 3×45-60 s"
                ]
            )

        ]
    };
}


/* =========================================================
   RÉGULIER — 4 SÉANCES
========================================================= */

function regular4(week) {

    const upperMain =
        week <= 4 ? "4×6-8" :
        week <= 8 ? "4×6-8" :
        week <= 12 ? "4×5-7" :
        "3×6-8";

    const lowerMain =
        week <= 4 ? "4×6-8" :
        week <= 8 ? "4×6-8" :
        week <= 12 ? "4×5-7" :
        "3×6-8";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "UPPER",
                "Upper A",
                "Poussée horizontale et tirages.",
                [
                    `Développé couché — ${upperMain}`,
                    "Tirage horizontal — 4×8-10",
                    "Développé incliné haltères — 3×8-10",
                    "Tirage vertical — 3×8-10",
                    "Élévations latérales — 3×12-15",
                    "Curl barre — 3×10"
                ]
            ),

            makeDay(
                "Mardi",
                "LOWER",
                "Lower A",
                "Accent quadriceps.",
                [
                    `Squat — ${lowerMain}`,
                    "Presse à cuisses — 3×8-10",
                    "Leg curl — 3×10-12",
                    "Mollets — 4×12-15",
                    "Gainage — 3×45-60 s"
                ]
            ),

            makeDay(
                "Jeudi",
                "UPPER",
                "Upper B",
                "Accent épaules, dos et bras.",
                [
                    `Développé épaules — ${upperMain}`,
                    "Tirage vertical — 4×8-10",
                    "Développé incliné — 3×8-10",
                    "Tirage horizontal — 3×8-10",
                    "Élévations latérales — 3×15",
                    "Extension triceps — 3×10"
                ]
            ),

            makeDay(
                "Samedi",
                "LOWER",
                "Lower B",
                "Accent chaîne postérieure.",
                [
                    `Soulevé de terre roumain — ${lowerMain}`,
                    "Hack squat — 3×8-10",
                    "Hip thrust — 3×8-10",
                    "Leg curl — 3×10",
                    "Mollets — 4×15",
                    "Abdominaux — 3×15"
                ]
            )

        ]
    };
}


/* =========================================================
   RÉGULIER — 5 SÉANCES
========================================================= */

function regular5(week) {

    const main =
        week <= 4 ? "4×6-8" :
        week <= 8 ? "4×6-8" :
        week <= 12 ? "4×5-7" :
        "3×6-8";

    const conditioningRounds =
        week <= 4 ? "3 tours" :
        week <= 8 ? "4 tours" :
        week <= 12 ? "5 tours" :
        "4 tours";

    return {
        title: phaseTitle(week),
        phase: phaseName(week),

        days: [

            makeDay(
                "Lundi",
                "UPPER",
                "Upper A",
                "Pectoraux, dos et épaules.",
                [
                    `Développé couché — ${main}`,
                    "Tirage horizontal — 4×8-10",
                    "Développé incliné — 3×8-10",
                    "Tirage vertical — 3×8-10",
                    "Élévations latérales — 3×15",
                    "Curl — 3×10"
                ]
            ),

            makeDay(
                "Mardi",
                "LOWER",
                "Lower A",
                "Quadriceps et chaîne postérieure.",
                [
                    `Squat — ${main}`,
                    "Presse à cuisses — 3×8-10",
                    "Leg curl — 3×10",
                    "Mollets — 4×15",
                    "Gainage — 3×45-60 s"
                ]
            ),

            makeDay(
                "Mercredi",
                "CONDITIONING",
                "Conditionnement",
                "Séance cardio/conditionnement contrôlée afin de limiter la fatigue cumulée.",
                [
                    "10 min cardio progressif",
                    `${conditioningRounds} :`,
                    week <= 8 ? "500 m rameur" : "400 m rameur",
                    "10-12 kettlebell swings",
                    "10 pompes",
                    "12-15 squats poids du corps",
                    week <= 8 ? "90 s récupération" : "2 min récupération",
                    "5 min retour au calme"
                ]
            ),

            makeDay(
                "Jeudi",
                "UPPER",
                "Upper B",
                "Accent épaules, dos et bras.",
                [
                    `Développé épaules — ${main}`,
                    "Tirage vertical — 4×8",
                    "Développé incliné haltères — 3×8-10",
                    "Tirage horizontal — 3×8-10",
                    "Élévations latérales — 3×15",
                    "Extension triceps — 3×10"
                ]
            ),

            makeDay(
                "Samedi",
                "LOWER",
                "Lower B",
                "Accent chaîne postérieure.",
                [
                    `Soulevé de terre roumain — ${main}`,
                    "Hack squat — 3×8-10",
                    "Hip thrust — 3×8-10",
                    "Leg curl — 3×10",
                    "Mollets — 4×15",
                    "Abdominaux — 3×15"
                ]
            )

        ]
    };
}


/* =========================================================
   CRÉATION DES 16 SEMAINES
========================================================= */

function buildWeeks(generator, level) {

    const weeks = {};

    for (let week = 1; week <= 16; week++) {

        weeks[week] = generator(week);

    }

    return weeks;
}


/* =========================================================
   PROGRAMMES
========================================================= */

window.sallePrograms = {

    remiseForme: {

        /* =====================================================
           DÉBUTANT
        ===================================================== */

        debutant: {

            2: {
                title: "Remise en forme — Débutant — 2 séances",
                kicker: "SALLE / DÉBUTANT",
                description:
                    "Deux séances full body pour apprendre les mouvements fondamentaux et construire progressivement une base physique.",
                note:
                    "Deux séances bien réalisées chaque semaine suffisent pour progresser. La régularité est prioritaire.",
                weeks: buildWeeks(beginner2, "debutant")
            },

            3: {
                title: "Remise en forme — Débutant — 3 séances",
                kicker: "SALLE / DÉBUTANT",
                description:
                    "Trois séances full body permettant de pratiquer régulièrement les mouvements fondamentaux.",
                note:
                    "Les séances restent volontairement accessibles. Ne cherche pas l'échec musculaire.",
                weeks: buildWeeks(beginner3, "debutant")
            },

            4: {
                title: "Remise en forme — Débutant — 4 séances",
                kicker: "SALLE / DÉBUTANT",
                description:
                    "Un split haut/bas permettant d'augmenter progressivement la fréquence d'entraînement.",
                note:
                    "La quatrième séance augmente la fréquence mais pas nécessairement l'intensité.",
                weeks: buildWeeks(beginner4, "debutant")
            },

            5: {
                title: "Remise en forme — Débutant — 5 séances",
                kicker: "SALLE / DÉBUTANT",
                description:
                    "Cinq séances avec un volume contrôlé et une séance de conditionnement légère.",
                note:
                    "Cinq séances ne signifient pas cinq séances difficiles. La récupération fait partie du programme.",
                weeks: buildWeeks(beginner5, "debutant")
            }

        },


        /* =====================================================
           REPRISE
        ===================================================== */

        reprise: {

            2: {
                title: "Remise en forme — Reprise — 2 séances",
                kicker: "SALLE / REPRISE",
                description:
                    "Deux séances full body destinées à retrouver progressivement les sensations et la régularité.",
                note:
                    "Après une période d'arrêt, la progression doit rester progressive même si les sensations reviennent rapidement.",
                weeks: buildWeeks(reprise2, "reprise")
            },

            3: {
                title: "Remise en forme — Reprise — 3 séances",
                kicker: "SALLE / REPRISE",
                description:
                    "Trois séances full body pour reconstruire progressivement le volume d'entraînement.",
                note:
                    "La récupération entre les séances reste une priorité.",
                weeks: buildWeeks(reprise3, "reprise")
            },

            4: {
                title: "Remise en forme — Reprise — 4 séances",
                kicker: "SALLE / REPRISE",
                description:
                    "Un split haut/bas permettant de retrouver progressivement une fréquence régulière.",
                note:
                    "Les charges augmentent seulement si la technique et la récupération restent bonnes.",
                weeks: buildWeeks(reprise4, "reprise")
            },

            5: {
                title: "Remise en forme — Reprise — 5 séances",
                kicker: "SALLE / REPRISE",
                description:
                    "Cinq séances avec un volume contrôlé pour les personnes qui reprennent l'entraînement.",
                note:
                    "La cinquième séance apporte du conditionnement léger. Toutes les séances ne doivent pas être difficiles.",
                weeks: buildWeeks(reprise5, "reprise")
            }

        },


        /* =====================================================
           RÉGULIER
        ===================================================== */

        regulier: {

            2: {
                title: "Remise en forme — Régulier — 2 séances",
                kicker: "SALLE / RÉGULIER",
                description:
                    "Deux séances full body destinées aux pratiquants déjà habitués à l'entraînement.",
                note:
                    "Les mouvements principaux peuvent être travaillés avec environ 1 à 3 répétitions en réserve.",
                weeks: buildWeeks(regular2, "regulier")
            },

            3: {
                title: "Remise en forme — Régulier — 3 séances",
                kicker: "SALLE / RÉGULIER",
                description:
                    "Trois séances structurées pour développer force générale, masse musculaire et condition physique.",
                note:
                    "La progression des charges doit rester compatible avec la récupération.",
                weeks: buildWeeks(regular3, "regulier")
            },

            4: {
                title: "Remise en forme — Régulier — 4 séances",
                kicker: "SALLE / RÉGULIER",
                description:
                    "Un split haut/bas permettant de travailler chaque groupe musculaire deux fois par semaine.",
                note:
                    "Les charges progressent progressivement sans sacrifier la technique.",
                weeks: buildWeeks(regular4, "regulier")
            },

            5: {
                title: "Remise en forme — Régulier — 5 séances",
                kicker: "SALLE / RÉGULIER",
                description:
                    "Cinq séances combinant hypertrophie, force générale et condition physique.",
                note:
                    "La séance de conditionnement est volontairement contrôlée afin de limiter la fatigue cumulée.",
                weeks: buildWeeks(regular5, "regulier")
            }

        }

    }

};


/* =========================================================
   AJOUT DES CONSIGNES DE PROGRESSION
========================================================= */

Object.entries(window.sallePrograms.remiseForme).forEach(
    ([level, frequencies]) => {

        Object.entries(frequencies).forEach(
            ([frequency, program]) => {

                for (let week = 1; week <= 16; week++) {

                    if (!program.weeks[week]) {
                        continue;
                    }

                    program.weeks[week].progression =
                        progressionNote(level, week);

                    program.weeks[week].weekNumber = week;

                    /*
                     * Les semaines 4, 8 et 12 servent de consolidation.
                     * La semaine 16 sert de bilan avant de recommencer
                     * un nouveau cycle ou de passer vers un autre programme.
                     */

                    if ([4, 8, 12].includes(week)) {

                        program.weeks[week].focus =
                            "Consolidation et gestion de la fatigue.";

                    }

                    if (week === 16) {

                        program.weeks[week].focus =
                            "Bilan du cycle et préparation du prochain programme.";

                    }

                }

            }
        );

    }
);


/* =========================================================
   COMPATIBILITÉ AVEC L'ANCIEN SYSTÈME
========================================================= */

/*
 * Ancien système :
 *
 * window.salleProgram
 *
 * On conserve cette variable pour éviter de casser
 * d'autres pages pendant la transition.
 */

window.salleProgram =
    window.sallePrograms.remiseForme.debutant[3];