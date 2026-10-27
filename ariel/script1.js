
const STORAGE_KEY = "organizae-tarefas-v1";

const taskForm = document.querySelector("#taskForm");
const taskTitle = document.querySelector("#taskTitle");
const taskType = document.querySelector("#taskType");
const taskDate = document.querySelector("#taskDate");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const filterTasks = document.querySelector("#filterTasks");
const deadlineList = document.querySelector("#deadlineList");

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

let tasks = loadTasks();

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(value) {
  if (!value) return "Sem data definida";

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  }).replace(".", "");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function updateStats() {
  document.querySelector("#totalCount").textContent = tasks.length;

  document.querySelector("#pendingCount").textContent =
    tasks.filter(task => !task.done).length;

  document.querySelector("#doneCount").textContent =
    tasks.filter(task => task.done).length;
}

function renderTasks() {
  const filter = filterTasks.value;

  const shown = tasks.filter(task =>
    filter === "all" ||
    (filter === "done" ? task.done : !task.done)
  );

  taskList.innerHTML = shown.map(task => `
    <article class="task-item ${task.done ? "completed" : ""}">
      <input
        class="task-check"
        type="checkbox"
        aria-label="Marcar como concluída"
        data-action="toggle"
        data-id="${escapeHTML(task.id)}"
        ${task.done ? "checked" : ""}
      >

      <div class="task-info">
        <div class="task-title">${escapeHTML(task.title)}</div>

        <div class="task-meta">
          <span class="type-tag">${escapeHTML(task.type)}</span>
          <span class="task-date">
            ${task.date
              ? "Entrega: " + formatDate(task.date)
              : "Sem data definida"}
          </span>
        </div>
      </div>

      <button
        class="delete-button"
        type="button"
        data-action="delete"
        data-id="${escapeHTML(task.id)}"
        aria-label="Excluir tarefa"
      >×</button>
    </article>
  `).join("");

  emptyState.hidden = shown.length > 0;

  if (shown.length === 0 && tasks.length > 0) {
    emptyState.textContent = filter === "done"
      ? "✨ Nenhuma tarefa concluída ainda."
      : "🎉 Você não tem tarefas pendentes!";
  } else {
    emptyState.textContent =
      "🌱 Ainda não há tarefas por aqui. Adicione a primeira!";
  }

  updateStats();
  renderDeadlines();
}

function renderDeadlines() {
  const upcoming = tasks
    .filter(task => !task.done && task.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  if (upcoming.length === 0) {
    deadlineList.innerHTML = `
      <p class="no-deadlines">
        Nenhum prazo próximo. Adicione uma data às suas tarefas
        para acompanhar por aqui. 🌷
      </p>
    `;
    return;
  }

  deadlineList.innerHTML = upcoming.map(task => {
    const [year, month, day] = task.date.split("-");

    const monthName = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("pt-BR", {
      month: "short"
    }).replace(".", "");

    return `
      <div class="deadline-item">
        <div class="deadline-date">
          <strong>${day}</strong>
          <span>${monthName}</span>
        </div>

        <div class="deadline-info">
          <strong>${escapeHTML(task.title)}</strong>
          <small>
            ${escapeHTML(task.type)} · ${formatDate(task.date)}
          </small>
        </div>
      </div>
    `;
  }).join("");
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskTitle.value.trim();

  if (!title) return;

  tasks.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: title,
    type: taskType.value,
    date: taskDate.value,
    done: false
  });

  saveTasks();
  taskForm.reset();
  renderTasks();
  taskTitle.focus();
});

taskList.addEventListener("change", event => {
  const control = event.target.closest('[data-action="toggle"]');

  if (!control) return;

  const task = tasks.find(item => item.id === control.dataset.id);

  if (task) {
    task.done = control.checked;
  }

  saveTasks();
  renderTasks();
});

taskList.addEventListener("click", event => {
  const button = event.target.closest('[data-action="delete"]');

  if (!button) return;

  tasks = tasks.filter(task => task.id !== button.dataset.id);

  saveTasks();
  renderTasks();
});

filterTasks.addEventListener("change", renderTasks);

const now = new Date();

document.querySelector("#todayDate").textContent =
  now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

document.querySelector("#todayLabel").textContent =
  now.toLocaleDateString("pt-BR", {
    weekday: "long"
  }).toUpperCase() + " · SEU ESPAÇO DE ESTUDOS";

taskDate.min = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0")
].join("-");

renderTasks();
