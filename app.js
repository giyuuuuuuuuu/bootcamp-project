const taskForm = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const categorySelect = document.getElementById("category-select");
const taskList = document.getElementById("task-list");
const taskTemplate = document.getElementById("task-template").content;
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");
const completeAllBtn = document.getElementById("complete-all-btn");
const clearCompleteBtn = document.getElementById("clear-completed-btn");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const totalTasksElement = document.getElementById("total-tasks");
const completedTasksElement = document.getElementById("completed-tasks");
const pendingTasksElement = document.getElementById("pending-tasks");
const toastContainer = document.getElementById("toast-container");

const STORAGE_KEYS = {
  tasks: "myTasks",
  theme: "theme",
};
const DEFAULT_CATEGORY = "personal";
const DELETE_ANIMATION_MS = 400;
const TASK_INPUT_DEFAULT_BORDER = "#ddd";
const TASK_INPUT_ERROR_BORDER = "#ef4444";

const CATEGORY_LABELS = {
  personal: "Personal",
  work: "Trabajo",
  study: "Estudio",
  health: "Salud",
};

const savedJson = localStorage.getItem(STORAGE_KEYS.tasks);
const initialTasks = savedJson ? JSON.parse(savedJson) : [];
let tasks = initialTasks.map(normalizeTask);
let taskToEdit = null;
let currentFilter = "all";
let searchQuery = "";
let currentCategoryFilter = "all";
let currentSort = "recent";

if (savedJson) {
  saveToLocalStorage();
}

const savedTheme =
  localStorage.getItem(STORAGE_KEYS.theme) ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

applyTheme(savedTheme);
renderTasks();
registerKeyboardShortcuts();

completeAllBtn.addEventListener("click", () => {
  tasks.forEach((task) => {
    task.completed = true;
  });
  commitStateChange();
  showToast("Todas las tareas fueron marcadas como completadas.");
});

clearCompleteBtn.addEventListener("click", () => {
  const before = tasks.length;
  tasks = tasks.filter((task) => !task.completed);
  commitStateChange();
  if (before !== tasks.length) {
    showToast("Se eliminaron las tareas completadas.");
  }
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  const category = getSafeCategory(categorySelect.value);

  if (title === "") {
    taskInput.placeholder = "Debe introducir una tarea";
    taskInput.style.borderColor = TASK_INPUT_ERROR_BORDER;
    taskInput.focus();
    return;
  }

  tasks.push({
    id: Date.now(),
    title,
    completed: false,
    category,
  });

  taskInput.value = "";
  categorySelect.value = DEFAULT_CATEGORY;
  commitStateChange();
  showToast("Tarea creada correctamente.");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

taskInput.addEventListener("input", () => {
  if (taskInput.value.trim() !== "") {
    taskInput.style.borderColor = TASK_INPUT_DEFAULT_BORDER;
    taskInput.placeholder = "Escriba una tarea";
  }
});

searchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value.toLowerCase();
  renderTasks();
});

categoryFilter.addEventListener("change", (event) => {
  currentCategoryFilter = event.target.value;
  renderTasks();
});

sortSelect.addEventListener("change", (event) => {
  currentSort = event.target.value;
  renderTasks();
});

themeToggleBtn.addEventListener("click", () => {
  const isDarkTheme = document.documentElement.classList.contains("dark");
  const newTheme = isDarkTheme ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem(STORAGE_KEYS.theme, newTheme);
});

taskList.addEventListener("click", (event) => {
  const target = event.target;

  if (target.classList.contains("edit-btn")) {
    openEditModal(parseTaskId(target.dataset.id));
    return;
  }

  if (target.classList.contains("delete-btn")) {
    deleteTaskWithAnimation(target);
    return;
  }

  if (target.classList.contains("task-checkbox")) {
    toggleTaskState(parseTaskId(target.dataset.id));
  }
});

saveEditBtn.addEventListener("click", () => {
  const newTitle = editInput.value.trim();
  if (newTitle === "" || !taskToEdit) return;

  taskToEdit.title = newTitle;
  commitStateChange();
  closeEditModal();
  showToast("Tarea actualizada.");
});

cancelEditBtn.addEventListener("click", closeEditModal);

/**
 * Persiste y renderiza el estado actual en un solo paso.
 * Evita repetir `renderTasks()` + `saveToLocalStorage()` por todo el archivo.
 */
function commitStateChange() {
  renderTasks();
  saveToLocalStorage();
}

/**
 * Normaliza una tarea cargada para garantizar forma y defaults.
 * @param {{ id:number, title:string, completed:boolean, category?:string }} task
 * @returns {{ id:number, title:string, completed:boolean, category:string }}
 */
function normalizeTask(task) {
  return {
    ...task,
    category: getSafeCategory(task.category),
  };
}

/**
 * Devuelve una categoría válida; si no existe, usa la categoría por defecto.
 * @param {string | undefined} category
 * @returns {string}
 */
function getSafeCategory(category) {
  return CATEGORY_LABELS[category] ? category : DEFAULT_CATEGORY;
}

/**
 * Convierte un id string de dataset a número entero base 10.
 * @param {string | undefined} id
 * @returns {number}
 */
function parseTaskId(id) {
  return Number.parseInt(id, 10);
}

/**
 * Busca una tarea por id en el estado actual.
 * @param {number} id
 * @returns {{ id:number, title:string, completed:boolean, category:string } | undefined}
 */
function getTaskById(id) {
  return tasks.find((task) => task.id === id);
}

/**
 * Evalúa si una tarea pasa el filtro de estado y de búsqueda.
 * @param {{ title:string, completed:boolean }} task
 * @returns {boolean}
 */
function matchesCurrentFilters(task) {
  const matchesStateFilter =
    currentFilter === "all" ||
    (currentFilter === "pending" && !task.completed) ||
    (currentFilter === "completed" && task.completed);

  const matchesSearchFilter = task.title
    .toLowerCase()
    .includes(searchQuery);

  const matchesCategoryFilter =
    currentCategoryFilter === "all" || task.category === currentCategoryFilter;

  return matchesStateFilter && matchesSearchFilter && matchesCategoryFilter;
}

/**
 * Renderiza la lista visible de tareas y actualiza estadísticas.
 * Usa un template HTML para mantener una estructura consistente por ítem.
 */
function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter(matchesCurrentFilters);
  const sortedTasks = sortTasks(filteredTasks);

  if (sortedTasks.length === 0) {
    renderEmptyState();
    updateStats();
    return;
  }

  sortedTasks.forEach((task) => {
    const clone = taskTemplate.cloneNode(true);
    const listItem = clone.querySelector("li");
    const textElement = listItem.querySelector(".task-text");
    const checkbox = listItem.querySelector(".task-checkbox");
    const categoryBadge = listItem.querySelector(".task-category-badge");
    const category = getSafeCategory(task.category);

    textElement.textContent = task.title;
    categoryBadge.textContent = CATEGORY_LABELS[category];
    categoryBadge.className = `task-category-badge task-category-${category}`;

    listItem.dataset.id = task.id;
    listItem.querySelector(".delete-btn").dataset.id = task.id;
    listItem.querySelector(".edit-btn").dataset.id = task.id;
    checkbox.dataset.id = task.id;

    if (task.completed) {
      textElement.classList.add("line-through", "opacity-50");
      checkbox.checked = true;
    }

    taskList.appendChild(clone);
  });

  updateStats();
}

/**
 * Renderiza un estado vacio cuando no hay tareas visibles.
 */
function renderEmptyState() {
  const emptyItem = document.createElement("li");
  emptyItem.className =
    "empty-state-card bg-white dark:bg-gray-800 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-500 dark:text-gray-300";
  emptyItem.innerHTML = `
    <p class="font-semibold">No hay tareas para mostrar</p>
    <p class="text-sm mt-1">Prueba otro filtro o crea una nueva tarea.</p>
  `;
  taskList.appendChild(emptyItem);
}

/**
 * Ordena una copia de tareas segun el criterio activo.
 * @param {{ id:number, title:string, completed:boolean, category:string }[]} list
 * @returns {{ id:number, title:string, completed:boolean, category:string }[]}
 */
function sortTasks(list) {
  const sorted = [...list];

  if (currentSort === "oldest") {
    return sorted.sort((a, b) => a.id - b.id);
  }

  if (currentSort === "alphabetical") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "es"));
  }

  if (currentSort === "status") {
    return sorted.sort((a, b) => Number(a.completed) - Number(b.completed));
  }

  return sorted.sort((a, b) => b.id - a.id);
}

/**
 * Aplica el tema visual (claro/oscuro) y actualiza el icono.
 * @param {"light" | "dark"} theme
 */
function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  themeIcon.textContent = isDark ? "☀️" : "🌙";
}

/**
 * Abre el modal de edición para una tarea concreta.
 * @param {number} taskId
 */
function openEditModal(taskId) {
  if (Number.isNaN(taskId)) return;
  taskToEdit = getTaskById(taskId);
  if (!taskToEdit) return;

  editInput.value = taskToEdit.title;
  editModal.showModal();
}

/**
 * Cierra el modal y limpia la referencia de la tarea en edición.
 */
function closeEditModal() {
  editModal.close();
  taskToEdit = null;
}

/**
 * Elimina una tarea con confirmación y animación previa al borrado.
 * @param {HTMLElement} deleteButton
 */
function deleteTaskWithAnimation(deleteButton) {
  const taskId = parseTaskId(deleteButton.dataset.id);
  if (Number.isNaN(taskId)) return;

  const listItem = deleteButton.closest("li");
  const taskToDelete = getTaskById(taskId);
  const taskTitle =
    taskToDelete && taskToDelete.title ? `: "${taskToDelete.title}"` : "";
  const shouldDelete = confirm(`¿Quieres borrar la tarea${taskTitle}?`);

  if (!shouldDelete) return;

  listItem.style.transition = "all 0.4s ease";
  listItem.classList.add("opacity-0", "scale-95");

  setTimeout(() => {
    tasks = tasks.filter((task) => task.id !== taskId);
    commitStateChange();
    showToast("Tarea eliminada.");
  }, DELETE_ANIMATION_MS);
}

/**
 * Alterna el estado completada/pendiente de una tarea.
 * @param {number} taskId
 */
function toggleTaskState(taskId) {
  if (Number.isNaN(taskId)) return;

  const task = getTaskById(taskId);
  if (!task) return;

  task.completed = !task.completed;
  commitStateChange();
}

/**
 * Recalcula y pinta los contadores del panel lateral.
 */
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalTasksElement.textContent = total;
  completedTasksElement.textContent = completed;
  pendingTasksElement.textContent = pending;
}

/**
 * Guarda el arreglo de tareas actual en localStorage.
 */
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

/**
 * Muestra una notificacion temporal sin bloquear la interaccion.
 * @param {string} message
 */
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2200);
}

/**
 * Registra atajos de teclado para acelerar acciones frecuentes.
 */
function registerKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    const targetTag = event.target.tagName;
    const isTypingContext =
      targetTag === "INPUT" || targetTag === "TEXTAREA" || targetTag === "SELECT";

    if (event.key === "Escape" && editModal.open) {
      closeEditModal();
      return;
    }

    if (event.key === "/" && !isTypingContext) {
      event.preventDefault();
      searchInput.focus();
      return;
    }

    if (event.key.toLowerCase() === "n" && !isTypingContext) {
      event.preventDefault();
      taskInput.focus();
      return;
    }

    if (
      event.key === "Enter" &&
      event.ctrlKey &&
      editModal.open &&
      document.activeElement === editInput
    ) {
      event.preventDefault();
      saveEditBtn.click();
    }
  });
}
