/* =========================================================
   LUXA_FIT — PROFIL DES FORMULAIRES D'ENTRAÎNEMENT
   ========================================================= */

function trainingHasValue(value) {
    return (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    );
}

function trainingLatestPerformances(performances) {
    const latest = {};

    performances.forEach(performance => {
        if (
            !latest[performance.type] &&
            trainingHasValue(performance.value)
        ) {
            latest[performance.type] = performance;
        }
    });

    return latest;
}

function trainingSetPerformance(
    performance,
    inputId,
    statId
) {
    if (!performance) {
        return false;
    }

    const input =
        document.getElementById(inputId);

    if (input) {
        input.value = performance.value;
    }

    const stat =
        document.getElementById(statId);

    if (stat) {
        stat.textContent =
            `${performance.value} ${performance.unit || "kg"}`;
    }

    return true;
}

function trainingSetProfileSelect(
    selectId,
    value,
    aliases
) {
    const select =
        document.getElementById(selectId);

    if (!select || !trainingHasValue(value)) {
        return false;
    }

    const normalized =
        String(value).toLowerCase();

    const option =
        Array.from(select.options)
            .find(item =>
                item.value === normalized ||
                aliases[item.value]?.some(alias =>
                    normalized.includes(alias)
                )
            );

    if (!option) {
        return false;
    }

    select.value = option.value;
    return true;
}

function trainingShowProfileNotice(message, isError = false) {
    const notice =
        document.getElementById(
            "trainingProfileNotice"
        );

    if (!notice) {
        return;
    }

    notice.classList.toggle(
        "is-error",
        isError
    );
    notice.innerHTML = message;
}

async function trainingLoadSavedData() {
    try {
        const [
            performancesResponse,
            profileResponse
        ] = await Promise.all([
            fetch(
                "/api/performances",
                {
                    credentials: "same-origin"
                }
            ),
            fetch(
                "/api/profile",
                {
                    credentials: "same-origin"
                }
            )
        ]);

        if (
            performancesResponse.status === 401 ||
            profileResponse.status === 401
        ) {
            trainingShowProfileNotice(
                "Connecte-toi pour récupérer tes données. " +
                "Les champs restent éditables."
            );
            return;
        }

        if (!performancesResponse.ok) {
            throw new Error(
                `Performances indisponibles ` +
                `(${performancesResponse.status}).`
            );
        }

        const data =
            await performancesResponse.json();

        const profileData =
            profileResponse.ok ?
                await profileResponse.json() :
                { profile: {} };

        const latest =
            trainingLatestPerformances(
                data.performances || []
            );

        const filled = [];

        if (
            trainingSetProfileSelect(
                "niveau",
                profileData.profile?.niveau,
                {
                    debutant: ["debutant"],
                    reprise: ["reprise"],
                    regulier: [
                        "regulier",
                        "avance",
                        "intermediaire"
                    ]
                }
            )
        ) {
            filled.push("niveau");
        }

        if (
            trainingSetProfileSelect(
                "objectif",
                profileData.profile?.objectif_principal,
                {
                    cut: ["perte", "cut"],
                    bulk: ["prise", "bulk", "muscle"],
                    muscle: ["muscle"],
                    perte: ["perte", "cut"],
                    esthetique: ["esthetique", "physique"],
                    force: ["force"],
                    mixte: ["mixte"]
                }
            )
        ) {
            filled.push("objectif");
        }

        if (
            trainingSetPerformance(
                latest.squat_actuel,
                "squatPR",
                "powerliftingSquatCurrent"
            )
        ) {
            filled.push("squat");
        }

        if (
            trainingSetPerformance(
                latest.bench_actuel,
                "benchPR",
                "powerliftingBenchCurrent"
            )
        ) {
            filled.push("bench");
        }

        if (
            trainingSetPerformance(
                latest.deadlift_actuel,
                "deadliftPR",
                "powerliftingDeadliftCurrent"
            )
        ) {
            filled.push("deadlift");
        }

        trainingShowProfileNotice(
            filled.length ?
                `Données enregistrées préremplies : ` +
                `${filled.join(", ")}. ` +
                `<a href="dashboard.html#dashboard-performances">` +
                `Modifier depuis le dashboard</a>. ` +
                `Les données absentes restent éditables.` :
                `Aucune performance enregistrée. ` +
                `Complète les champs puis retrouve-les dans le ` +
                `<a href="dashboard.html#dashboard-performances">` +
                `dashboard</a>.`
        );

        document.dispatchEvent(
            new CustomEvent(
                "luxa:training-data-ready",
                {
                    detail: latest
                }
            )
        );
    } catch (error) {
        console.error(
            "Erreur chargement performances entraînement :",
            error
        );

        trainingShowProfileNotice(
            "Impossible de charger tes performances. " +
            "Les champs restent éditables.",
            true
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    trainingLoadSavedData
);
