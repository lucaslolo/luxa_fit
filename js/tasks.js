/* LUXA_FIT — calendrier des tâches */
"use strict";

let tasks = [];
let selectedTaskDate = toLocalDateString(new Date());
let displayedTaskMonth = monthStart(selectedTaskDate);

function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function monthStart(dateString) {
    const date = parseLocalDate(dateString);
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatTaskDate(dateString) {
    return parseLocalDate(dateString).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
}

function showTaskMessage(message, isError = false) {
    const node = document.getElementById("taskMessage");
    if (!node) return;
    node.textContent = message;
    node.classList.toggle("is-error", isError);
}

async function loadTasks() {
    try {
        const data = await LuxaAPI.get("/api/tasks");
        if (!data?.success || !Array.isArray(data.tasks)) {
            throw new Error(data?.message || "Réponse invalide du serveur.");
        }
        tasks = data.tasks;
        renderTaskCalendar();
        renderSelectedTasks();
    } catch (error) {
        if (error.status === 401) {
            window.location.assign("connexion.html");
            return;
        }
        console.error("Erreur tâches :", error);
        const list = document.getElementById("tasksList");
        if (list) list.textContent = "Impossible de charger les tâches.";
    }
}

function renderTaskCalendar() {
    const grid = document.getElementById("taskCalendarGrid");
    const title = document.getElementById("taskCalendarTitle");
    if (!grid || !title) return;

    grid.replaceChildren();
    title.textContent = displayedTaskMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    const year = displayedTaskMonth.getFullYear();
    const month = displayedTaskMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const today = toLocalDateString(new Date());
    const taskDates = new Set(tasks.map(task => String(task.date_tache).slice(0, 10)));

    for (let index = 0; index < 42; index += 1) {
        let date;
        let isOtherMonth = false;
        if (index < mondayOffset) {
            date = new Date(year, month - 1, previousMonthDays - mondayOffset + index + 1);
            isOtherMonth = true;
        } else if (index >= mondayOffset + daysInMonth) {
            date = new Date(year, month + 1, index - mondayOffset - daysInMonth + 1);
            isOtherMonth = true;
        } else {
            date = new Date(year, month, index - mondayOffset + 1);
        }

        const dateValue = toLocalDateString(date);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(date.getDate());
        button.setAttribute("aria-label", formatTaskDate(dateValue));
        if (isOtherMonth) button.classList.add("is-other-month");
        if (dateValue === today) button.classList.add("is-today");
        if (dateValue === selectedTaskDate) button.classList.add("is-selected");
        if (taskDates.has(dateValue)) button.classList.add("has-tasks");
        button.addEventListener("click", () => {
            selectedTaskDate = dateValue;
            displayedTaskMonth = monthStart(dateValue);
            const dateInput = document.getElementById("taskDate");
            if (dateInput) dateInput.value = dateValue;
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
    if (!list || !dateLabel || !count) return;

    const selectedTasks = tasks.filter(task => String(task.date_tache).slice(0, 10) === selectedTaskDate);
    dateLabel.textContent = formatTaskDate(selectedTaskDate);
    count.textContent = `${selectedTasks.length} tâche${selectedTasks.length > 1 ? "s" : ""}`;
    list.replaceChildren();

    if (selectedTasks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "Aucune tâche pour cette journée.";
        list.appendChild(empty);
        return;
    }

    selectedTasks.forEach(task => {
        const article = document.createElement("article");
        article.className = `task-item${task.termine ? " is-completed" : ""}`;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(task.termine);
        checkbox.setAttribute("aria-label", "Marquer la tâche comme terminée");
        checkbox.addEventListener("change", () => updateTaskStatus(task.id, checkbox.checked));

        const content = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = task.titre || "Tâche sans titre";
        content.appendChild(title);
        if (task.description) {
            const description = document.createElement("p");
            description.textContent = task.description;
            content.appendChild(description);
        }

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "task-delete";
        remove.textContent = "Supprimer";
        remove.addEventListener("click", () => deleteTask(task.id));
        article.append(checkbox, content, remove);
        list.appendChild(article);
    });
}

async function addTask(event) {
    event.preventDefault();
    const form = document.getElementById("taskForm");
    const submit = form?.querySelector('[type="submit"]');
    const date = document.getElementById("taskDate")?.value || "";
    const titre = document.getElementById("taskTitle")?.value.trim() || "";
    const description = document.getElementById("taskDescription")?.value.trim() || "";
    if (!titre || !date) {
        showTaskMessage("Indique un titre et une date.", true);
        return;
    }
    if (submit) submit.disabled = true;
    try {
        const data = await LuxaAPI.post("/api/tasks", { titre, date_tache: date, description });
        if (!data?.success) throw new Error(data?.message || "Impossible d'ajouter la tâche.");
        showTaskMessage("Tâche ajoutée.");
        form.reset();
        selectedTaskDate = date;
        displayedTaskMonth = monthStart(date);
        document.getElementById("taskDate").value = date;
        await loadTasks();
    } catch (error) {
        if (error.status === 401) return window.location.assign("connexion.html");
        showTaskMessage(error.message || "Impossible d'ajouter la tâche.", true);
    } finally {
        if (submit) submit.disabled = false;
    }
}

async function updateTaskStatus(id, termine) {
    try {
        await LuxaAPI.put(`/api/tasks/${encodeURIComponent(id)}`, { termine });
        await loadTasks();
    } catch (error) {
        if (error.status === 401) return window.location.assign("connexion.html");
        console.error("Erreur statut tâche :", error);
        showTaskMessage(error.message || "Impossible de modifier la tâche.", true);
        await loadTasks();
    }
}

async function deleteTask(id) {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try {
        await LuxaAPI.delete(`/api/tasks/${encodeURIComponent(id)}`);
        await loadTasks();
    } catch (error) {
        if (error.status === 401) return window.location.assign("connexion.html");
        showTaskMessage(error.message || "Impossible de supprimer la tâche.", true);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("taskDate");
    if (dateInput) dateInput.value = selectedTaskDate;
    document.getElementById("previousMonth")?.addEventListener("click", () => {
        displayedTaskMonth = new Date(displayedTaskMonth.getFullYear(), displayedTaskMonth.getMonth() - 1, 1);
        renderTaskCalendar();
    });
    document.getElementById("nextMonth")?.addEventListener("click", () => {
        displayedTaskMonth = new Date(displayedTaskMonth.getFullYear(), displayedTaskMonth.getMonth() + 1, 1);
        renderTaskCalendar();
    });
    document.getElementById("taskForm")?.addEventListener("submit", addTask);
    loadTasks();
});
