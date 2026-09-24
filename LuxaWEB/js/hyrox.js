function parseDuration(value) {
    const parts = value.trim().split(":").map(Number);

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
}

function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function enhanceRace(details) {
    if (details.dataset.enhanced === "true") return;

    details.dataset.enhanced = "true";
        const header = document.createElement("div");
        header.className = "split-head";
        header.innerHTML = "<span>Étape</span><span>Chrono</span><span>Cumulé</span>";
        details.prepend(header);

        let cumulative = 0;

        details.querySelectorAll(".split-row:not(.split-total)").forEach(row => {
            const time = row.querySelector("strong");
            if (!time) return;

            cumulative += parseDuration(time.textContent);
            row.classList.add("has-cumulative");
            row.innerHTML = `
                <span class="split-label">${row.querySelector("span").textContent}</span>
                <strong class="split-time">${time.textContent}</strong>
                <strong class="split-cumulative">${formatDuration(cumulative)}</strong>
            `;
        });

        const total = details.querySelector(".split-total");
        if (total) {
            const totalTime = total.querySelector("strong");
            const officialSeconds = parseDuration(totalTime.textContent);
            const difference = cumulative - officialSeconds;
            total.innerHTML = `
                <span class="split-label">Total officiel</span>
                <strong class="split-time">${totalTime.textContent}</strong>
                <strong class="split-cumulative">${formatDuration(cumulative)}</strong>
            `;

            const check = document.createElement("p");
            check.className = "race-check";
            check.textContent = difference === 0
                ? "Les splits correspondent au temps officiel."
                : `Écart entre les splits et l'officiel : ${difference > 0 ? "+" : "-"}${formatDuration(Math.abs(difference))}.`;
            details.appendChild(check);
        }
}

document.querySelectorAll(".race-card").forEach(card => {
    const details = card.querySelector(".race-details");
    enhanceRace(details);
    card.addEventListener("toggle", () => enhanceRace(details));
});
