/* =========================================================
   LUXA_FIT — AFFICHAGE PROGRAMMES POWERLIFTING
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("powerliftingForm");
    const result = document.getElementById("programResult");

    if (!form || !result) return;

    const resultTitle = document.getElementById("resultTitle");
    const resultDescription = document.getElementById("resultDescription");
    const weeksContainer = document.getElementById("weeks");
    const weekNumber = document.getElementById("weekNumber");
    const weekTitle = document.getElementById("weekTitle");
    const phase = document.getElementById("phase");
    const daysContainer = document.getElementById("days");
    const programNote = document.getElementById("programNote");

    let currentProgram = null;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const niveau = document.getElementById("niveau").value;
        const jours = Number(document.getElementById("jours").value);
        const semaines = Number(document.getElementById("semaines").value);

        const baseProgram =
            window.sallePrograms?.powerlifting?.[niveau]?.[jours];

        if (!baseProgram) {
            alert("Impossible de trouver ce programme.");
            return;
        }

        currentProgram = buildProgramForDuration(baseProgram, semaines);

        result.hidden = false;
        resultTitle.textContent = currentProgram.title;
        resultDescription.textContent = currentProgram.description;
        programNote.textContent = currentProgram.note;

        renderWeekButtons(currentProgram);
        renderWeek(currentProgram, 1);

        result.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    function buildProgramForDuration(baseProgram, duration) {
        const availableWeeks = Object.keys(baseProgram.weeks)
            .map(Number)
            .sort((a, b) => a - b);

        const weeks = {};

        for (let weekNumber = 1; weekNumber <= duration; weekNumber++) {
            const templateNumber = availableWeeks[(weekNumber - 1) % availableWeeks.length];
            const template = baseProgram.weeks[templateNumber];
            const cycle = Math.floor((weekNumber - 1) / availableWeeks.length) + 1;

            weeks[weekNumber] = {
                ...template,
                title: cycle > 1
                    ? `Cycle ${cycle} — ${template.title}`
                    : template.title,
                phase: cycle > 1
                    ? `${template.phase} — Cycle ${cycle}`
                    : template.phase
            };
        }

        return {
            ...baseProgram,
            title: `${baseProgram.title} — ${duration} semaines`,
            note: `${baseProgram.note} Programme sélectionné sur ${duration} semaines. Les semaines 5 à 16 reprennent les blocs de 4 semaines du programme afin de prolonger le cycle sans modifier automatiquement les charges.` ,
            weeks
        };
    }

    function renderWeekButtons(program) {
        weeksContainer.innerHTML = "";

        Object.keys(program.weeks).forEach(number => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "week-button";
            button.textContent = `Semaine ${number}`;

            button.addEventListener("click", () => {
                document.querySelectorAll(".week-button")
                    .forEach(btn => btn.classList.remove("active"));

                button.classList.add("active");
                renderWeek(program, Number(number));
            });

            weeksContainer.appendChild(button);
        });

        const firstButton = weeksContainer.querySelector(".week-button");
        if (firstButton) firstButton.classList.add("active");
    }

    function renderWeek(program, number) {
        const week = program.weeks[number];
        if (!week) return;

        weekNumber.textContent = `SEMAINE ${number}`;
        weekTitle.textContent = week.title;
        phase.textContent = week.phase;
        daysContainer.innerHTML = "";

        week.days.forEach(day => {
            const article = document.createElement("article");
            article.className = "day-card";

            const exercisesHTML = day.exercises
                .map(exercise => `<li>${escapeHTML(exercise)}</li>`)
                .join("");

            article.innerHTML = `
                <div class="day-card-top">
                    <span class="day-label">${escapeHTML(day.day)}</span>
                    <span class="day-type">${escapeHTML(day.type)}</span>
                </div>
                <h3>${escapeHTML(day.title)}</h3>
                <p class="day-description">${escapeHTML(day.description)}</p>
                <ul class="exercise-list">${exercisesHTML}</ul>
            `;

            daysContainer.appendChild(article);
        });
    }

    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
});
