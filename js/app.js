// -------------------------
// DONNÉES
// -------------------------

let data = JSON.parse(localStorage.getItem("hyroxData")) || {
    weight: [
        { date: "2026-09-19", value: 73 }
    ],
    run: [
        { date: "2026-09-19", value: 20 * 60 + 23 }
    ],
    hyrox: [
        { date: "2026-09-19", value: 1 * 60 + 32 }
    ],
    km: [
        { date: "2026-09-19", value: 30 }
    ]
};

// -------------------------
// UTILITAIRES
// -------------------------

function save() {
    localStorage.setItem("hyroxData", JSON.stringify(data));
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.round(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function parseTime(value) {
    let parts = value.split(":");
    if (parts.length !== 2) {
        return Number(value);
    }
    return Number(parts[0]) * 60 + Number(parts[1]);
}

function typeName(type) {
    const names = {
        weight: "Poids",
        run: "5 KM",
        hyrox: "HYROX",
        km: "Running"
    };
    return names[type];
}

function displayValue(type, value) {
    if (type === "weight") return value + " kg";
    if (type === "km") return value + " km";
    if (type === "run" || type === "hyrox") {
        return formatTime(value);
    }
    return value;
}

// -------------------------
// AJOUT
// -------------------------

function addPerformance() {
    const type = document.getElementById("type").value;
    const valueInput = document.getElementById("value").value;
    const date = document.getElementById("date").value;

    if (!valueInput || !date) {
        alert("Remplis la date et la performance.");
        return;
    }

    let value;
    if (type === "run" || type === "hyrox") {
        value = parseTime(valueInput);
    } else {
        value = Number(valueInput);
    }

    data[type].push({ date: date, value: value });
    save();
    document.getElementById("value").value = "";
    update();
}

// -------------------------
// HISTORIQUE
// -------------------------

function renderHistory() {
    const history = document.getElementById("history");
    history.innerHTML = "";
    let all = [];

    Object.keys(data).forEach(type => {
        data[type].forEach((item, index) => {
            all.push({ type, index, ...item });
        });
    });

    all.sort((a, b) => new Date(b.date) - new Date(a.date));

    all.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${typeName(item.type)}</td>
            <td>${displayValue(item.type, item.value)}</td>
            <td>
                <button class="delete"
                onclick="deletePerformance('${item.type}', ${item.index})">
                ×
                </button>
            </td>
        `;
        history.appendChild(row);
    });
}

function deletePerformance(type, index) {
    data[type].splice(index, 1);
    save();
    update();
}

function clearData() {
    if (!confirm("Supprimer toutes les données ?")) return;
    localStorage.removeItem("hyroxData");
    location.reload();
}

// -------------------------
// DASHBOARD
// -------------------------

function updateDashboard() {
    const latestWeight = data.weight[data.weight.length - 1];
    const latestRun = data.run[data.run.length - 1];
    const latestHyrox = data.hyrox[data.hyrox.length - 1];
    const latestKm = data.km[data.km.length - 1];

    if (latestWeight) document.getElementById("weight").textContent = latestWeight.value + " kg";
    if (latestRun) document.getElementById("run5k").textContent = formatTime(latestRun.value);
    if (latestHyrox) document.getElementById("hyrox").textContent = formatTime(latestHyrox.value);
    if (latestKm) document.getElementById("weeklyKm").textContent = latestKm.value + " km";
    updateProgress();
}

// -------------------------
// PROGRESSION
// -------------------------

function updateProgress() {
    const weight = data.weight[data.weight.length - 1]?.value || 73;
    const run = data.run[data.run.length - 1]?.value || 1223;
    const hyrox = data.hyrox[data.hyrox.length - 1]?.value || 5520;

    let weightProgress = ((weight - 73) / (78 - 73)) * 100;
    weightProgress = Math.max(0, Math.min(100, weightProgress));
    document.getElementById("weightProgress").style.width = weightProgress + "%";

    let runProgress = ((1223 - run) / (1223 - 1139)) * 100;
    runProgress = Math.max(0, Math.min(100, runProgress));
    document.getElementById("runProgress").style.width = runProgress + "%";

    let hyroxProgress = ((5520 - hyrox) / (5520 - 4200)) * 100;
    hyroxProgress = Math.max(0, Math.min(100, hyroxProgress));
    document.getElementById("hyroxProgress").style.width = hyroxProgress + "%";
}

// -------------------------
// GRAPHIQUES
// -------------------------

function drawChart(canvasId, values, labels, invert = false) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = 220 * 2;
    ctx.scale(2, 2);

    const w = width / 2;
    const h = height / 2;
    ctx.clearRect(0, 0, w, h);
    if (values.length < 1) return;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    ctx.beginPath();

    values.forEach((value, index) => {
        const x = 25 + (index / Math.max(values.length - 1, 1)) * (w - 50);
        let normalized = (value - min) / range;
        if (invert) normalized = 1 - normalized;
        const y = h - 30 - normalized * (h - 60);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "#ff3b30";
    ctx.lineWidth = 3;
    ctx.stroke();

    values.forEach((value, index) => {
        const x = 25 + (index / Math.max(values.length - 1, 1)) * (w - 50);
        let normalized = (value - min) / range;
        if (invert) normalized = 1 - normalized;
        const y = h - 30 - normalized * (h - 60);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ff3b30";
        ctx.fill();
    });
}

function drawCharts() {
    const weights = data.weight.map(x => x.value);
    const runs = data.run.map(x => x.value);

    drawChart("weightChart", weights, data.weight.map(x => x.date));
    drawChart("runChart", runs, data.run.map(x => x.date), true);
}

// -------------------------
// COUNTDOWN
// -------------------------

function countdown() {
    const target = new Date("2027-01-28T00:00:00");
    const now = new Date();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    document.getElementById("countdown").textContent = days > 0
        ? `${days} jours`
        : "C'est aujourd'hui 🔥";
}

// -------------------------
// UPDATE GLOBAL
// -------------------------

function update() {
    updateDashboard();
    renderHistory();
    drawCharts();
    countdown();
}

document.getElementById("date").value = new Date().toISOString().split("T")[0];
update();
