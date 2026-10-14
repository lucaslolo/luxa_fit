let tasks = [];
let selectedTaskDate = new Date().toISOString().split("T")[0];
let displayedTaskMonth = new Date(selectedTaskDate + "T00:00:00");

function taskDateString(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function escapeTaskHTML(value) {
    const element = document.createElement("div");
    element.textContent = value === null || value === undefined ? "" : String(value);
    return element.innerHTML;
}

function formatTaskDate(dateString) {
    return new Date(dateString + "T00:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

async function loadTasks() {
    try {
        const response = await fetch("/api/tasks", { credentials: "same-origin" });

        if (response.status === 401) {
            window.location.href = "connexion.html";
            return;
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || "Impossible de charger les tâches.");
        }

        tasks = data.tasks || [];
        renderTaskCalendar();
        renderSelectedTasks();
    } catch (error) {
        console.error("Erreur tâches :", error);
        document.getElementById("tasksList").innerHTML =
            '<div class="empty-state">Impossible de charger les tâches.</div>';
    }
}

function renderTaskCalendar() {
    const grid = document.getElementById("taskCalendarGrid");
    const title = document.getElementById("taskCalendarTitle");
    grid.innerHTML = "";
    title.textContent = displayedTaskMonth.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(displayedTaskMonth.getFullYear(), displayedTaskMonth.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(displayedTaskMonth.getFullYear(), displayedTaskMonth.getMonth() + 1, 0).getDate();
    const previousMonthDays = new Date(displayedTaskMonth.getFullYear(), displayedTaskMonth.getMonth(), 0).getDate();
    const today = new Date().toISOString().split("T")[0];

    for (let index = 0; index < 42; index += 1) {
        let date;
        let dayNumber;
        let isOtherMonth = false;

        if (index < mondayOffset) {
            dayNumber = previousMonthDays - mondayOffset + index + 1;
            date = new Date(displayedTaskMonth.getFullYear(), displayedTaskMonth.getMonth() - 1, dayNumber);
            isOtherMonth = true;
        } else if (index >= mondayOffset + daysInMonth) {
            dayNumber = index - mondayOffset - daysInMonth + 1;
            date = new Date(displayedTaskMonth.getFullYear(), displayedTaskMonth.getMonth() + 1, dayNumber);
            isOtherMonth = true;
        } else {
            dayNumber = index - mondayOffset + 1;
            date = new Date(displayedTaskMonth.getFullYear(), displayedTaskMonth.getMonth(), dayNumber);
        }

        const dateValue = taskDateString(date);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = dayNumber;
        button.setAttribute("aria-label", formatTaskDate(dateValue));

        if (isOtherMonth) button.classList.add("is-other-month");
        if (dateValue === today) button.classList.add("is-today");
        if (dateValue === selectedTaskDate) button.classList.add("is-selected");
        if (tasks.some(task => task.date_tache === dateValue)) button.classList.add("has-tasks");

        button.addEventListener("click", () => {
            selectedTaskDate = dateValue;
            displayedTaskMonth = new Date(dateValue + "T00:00:00");
            document.getElementById("taskDate").value = dateValue;
            renderTaskCalendar();
            renderSelectedTasks();
        });

        grid.appendChild(button);
    }
}

function renderSelectedTasks() {
    const list = document.getElementById("tasksList");
    const dateLabel = document.getElementById("selectedTaskDate");
    const count = document.getElementById("taskCount");
    const selectedTasks = tasks.filter(task => task.date_tache === selectedTaskDate);

    dateLabel.textContent = formatTaskDate(selectedTaskDate);
    count.textContent = `${selectedTasks.length} tâche${selectedTasks.length > 1 ? "s" : ""}`;

    if (selectedTasks.length === 0) {
        list.innerHTML = '<div class="empty-state">Aucune tâche pour cette journée.</div>';
        return;
    }

    list.innerHTML = "";

    selectedTasks.forEach(task => {
        const article = document.createElement("article");
        article.className = "task-item" + (task.termine ? " is-completed" : "");
        article.innerHTML = `
            <input type="checkbox" ${task.termine ? "checked" : ""} aria-label="Marquer la tâche comme terminée">
            <div>
                <strong>${escapeTaskHTML(task.titre)}</strong>
                ${task.description ? `<p>${escapeTaskHTML(task.description)}</p>` : ""}
            </div>
            <button type="button" class="task-delete">Supprimer</button>
        `;
        article.querySelector("input").addEventListener("change", event =>
            updateTaskStatus(task.id, event.target.checked)
        );
        article.querySelector(".task-delete").addEventListener("click", () => deleteTask(task.id));
        list.appendChild(article);
    });
}

async function addTask(event) {
    event.preventDefault();
    const message = document.getElementById("taskMessage");
    const date = document.getElementById("taskDate").value;

    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({
                titre: document.getElementById("taskTitle").value.trim(),
                date_tache: date,
                description: document.getElementById("taskDescription").value
            })
        });
        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Impossible d'ajouter la tâche.";
            return;
        }

        message.textContent = "Tâche ajoutée.";
        document.getElementById("taskForm").reset();
        selectedTaskDate = date;
        displayedTaskMonth = new Date(date + "T00:00:00");
        await loadTasks();
    } catch (error) {
        console.error("Erreur ajout tâche :", error);
        message.textContent = "Impossible de contacter le serveur.";
    }
}

async function updateTaskStatus(id, termine) {
    try {
        const response = await fetch("/api/tasks/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ termine })
        });
        if (!response.ok) throw new Error("Impossible de modifier la tâche.");
        await loadTasks();
    } catch (error) {
        console.error("Erreur statut tâche :", error);
        await loadTasks();
    }
}

async function deleteTask(id) {
    if (!confirm("Supprimer cette tâche ?")) return;

    try {
        const response = await fetch("/api/tasks/" + id, {
            method: "DELETE",
            credentials: "same-origin"
        });
        if (!response.ok) throw new Error("Impossible de supprimer la tâche.");
        await loadTasks();
    } catch (error) {
        console.error("Erreur suppression tâche :", error);
        alert(error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("taskDate").value = selectedTaskDate;
    document.getElementById("previousMonth").addEventListener("click", () => {
        displayedTaskMonth.setMonth(displayedTaskMonth.getMonth() - 1);
        renderTaskCalendar();
    });
    document.getElementById("nextMonth").addEventListener("click", () => {
        displayedTaskMonth.setMonth(displayedTaskMonth.getMonth() + 1);
        renderTaskCalendar();
    });
    document.getElementById("taskForm").addEventListener("submit", addTask);
    loadTasks();
});
