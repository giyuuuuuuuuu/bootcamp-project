import {
  clearCompletedTasks,
  completeAllTasks,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./src/api/client.js";

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

const DEFAULT_CATEGORY = "personal";
const TASK_INPUT_DEFAULT_BORDER = "#ddd";
const TASK_INPUT_ERROR_BORDER = "#ef4444";

const CATEGORY_LABELS = {
  personal: "Personal",
  work: "Trabajo",
  study: "Estudio",
  health: "Salud",
};

let tasks = [];
let taskToEdit = null;
let currentFilter = "all";
let searchQuery = "";
let currentCategoryFilter = "all";
let currentSort = "recent";
let networkState = "idle";
let networkMessage = "";

const networkStatus = document.createElement("div");
networkStatus.id = "network-status";
networkStatus.className =
  "hidden mb-4 rounded-lg border px-4 py-3 text-sm font-medium";
taskList.parentElement.prepend(networkStatus);

applyTheme("light");
renderTasks();
registerKeyboardShortcuts();
loadTasks();

completeAllBtn.addEventListener("click", () => {
  completeAllTasksFromApi();
});

clearCompleteBtn.addEventListener("click", () => {
  clearCompletedTasksFromApi();
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearNetworkMessage();

  const title = taskInput.value.trim();
  if (title === "") {
    taskInput.placeholder = "Debe introducir una tarea";
    taskInput.style.borderColor = TASK_INPUT_ERROR_BORDER;
    taskInput.focus();
    return;
  }

  const category = getSafeCategory(categorySelect.value);
  setNetworkState("loading", "Creando tarea...");

  try {
    await createTask({ title, category });
    taskInput.value = "";
    categorySelect.value = DEFAULT_CATEGORY;
    await loadTasks("Tarea creada correctamente.");
  } catch (error) {
    handleNetworkError(error);
  }
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
  applyTheme(isDarkTheme ? "light" : "dark");
});

taskList.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("edit-btn")) {
    openEditModalById(target.dataset.id);
    return;
  }

  if (target.classList.contains("delete-btn")) {
    await deleteTaskById(target.dataset.id);
    return;
  }

  if (target.classList.contains("task-checkbox")) {
    await toggleTaskState(target.dataset.id);
  }
});

saveEditBtn.addEventListener("click", async () => {
  if (!taskToEdit) return;

  const newTitle = editInput.value.trim();
  if (newTitle === "") {
    showToast("El título no puede estar vacío.");
    return;
  }

  setNetworkState("loading", "Actualizando tarea...");

  try {
    await updateTask(taskToEdit.id, { title: newTitle });
    closeEditModal();
    await loadTasks("Tarea actualizada.");
  } catch (error) {
    handleNetworkError(error);
  }
});

cancelEditBtn.addEventListener("click", closeEditModal);

async function loadTasks(successMessage = "") {
  setNetworkState("loading", "Cargando tareas...");

  try {
    const remoteTasks = await getTasks();
    tasks = remoteTasks.map(normalizeTask);
    setNetworkState("success", successMessage || "Datos sincronizados con API.");
    renderTasks();
  } catch (error) {
    handleNetworkError(error);
  }
}

async function deleteTaskById(taskId) {
  if (!taskId) return;

  const taskToDelete = tasks.find((task) => String(task.id) === String(taskId));
  const taskTitle =
    taskToDelete && taskToDelete.title ? `: "${taskToDelete.title}"` : "";
  const shouldDelete = confirm(`¿Quieres borrar la tarea${taskTitle}?`);

  if (!shouldDelete) return;

  setNetworkState("loading", "Eliminando tarea...");

  try {
    await deleteTask(taskId);
    await loadTasks("Tarea eliminada.");
  } catch (error) {
    handleNetworkError(error);
  }
}

async function toggleTaskState(taskId) {
  if (!taskId) return;

  const task = tasks.find((item) => String(item.id) === String(taskId));
  if (!task) return;

  setNetworkState("loading", "Actualizando estado...");

  try {
    await updateTask(task.id, { completed: !task.completed });
    await loadTasks("Estado actualizado.");
  } catch (error) {
    handleNetworkError(error);
  }
}

async function completeAllTasksFromApi() {
  setNetworkState("loading", "Marcando todas como completadas...");

  try {
    await completeAllTasks();
    await loadTasks("Todas las tareas fueron completadas.");
  } catch (error) {
    handleNetworkError(error);
  }
}

async function clearCompletedTasksFromApi() {
  setNetworkState("loading", "Eliminando tareas completadas...");

  try {
    await clearCompletedTasks();
    await loadTasks("Se eliminaron las tareas completadas.");
  } catch (error) {
    handleNetworkError(error);
  }
}

function openEditModalById(taskId) {
  if (!taskId) return;

  taskToEdit = tasks.find((task) => String(task.id) === String(taskId));
  if (!taskToEdit) return;

  editInput.value = taskToEdit.title;
  editModal.showModal();
}

function closeEditModal() {
  editModal.close();
  taskToEdit = null;
}

function normalizeTask(task) {
  return {
    id: String(task.id),
    title: task.title,
    completed: Boolean(task.completed),
    category: getSafeCategory(task.category),
  };
}

function getSafeCategory(category) {
  return CATEGORY_LABELS[category] ? category : DEFAULT_CATEGORY;
}

function matchesCurrentFilters(task) {
  const matchesStateFilter =
    currentFilter === "all" ||
    (currentFilter === "pending" && !task.completed) ||
    (currentFilter === "completed" && task.completed);

  const matchesSearchFilter = task.title.toLowerCase().includes(searchQuery);
  const matchesCategoryFilter =
    currentCategoryFilter === "all" || task.category === currentCategoryFilter;

  return matchesStateFilter && matchesSearchFilter && matchesCategoryFilter;
}

function renderTasks() {
  taskList.innerHTML = "";

  if (networkState === "loading") {
    renderLoadingState();
    updateStats();
    return;
  }

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

function renderLoadingState() {
  const loadingItem = document.createElement("li");
  loadingItem.className =
    "bg-white dark:bg-gray-800 p-6 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 text-center text-blue-600 dark:text-blue-300";
  loadingItem.innerHTML = `
    <p class="font-semibold">Cargando desde el servidor...</p>
    <p class="text-sm mt-1">Esperando respuesta de Node.js</p>
  `;
  taskList.appendChild(loadingItem);
}

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

function sortTasks(list) {
  const sorted = [...list];

  if (currentSort === "oldest") {
    return sorted.sort((a, b) => Number(a.id) - Number(b.id));
  }

  if (currentSort === "alphabetical") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "es"));
  }

  if (currentSort === "status") {
    return sorted.sort((a, b) => Number(a.completed) - Number(b.completed));
  }

  return sorted.sort((a, b) => Number(b.id) - Number(a.id));
}

function setNetworkState(state, message = "") {
  networkState = state;
  networkMessage = message;
  renderNetworkStateBanner();
  renderTasks();
}

function clearNetworkMessage() {
  if (networkState !== "loading") {
    setNetworkState("idle", "");
  }
}

function renderNetworkStateBanner() {
  if (!networkMessage) {
    networkStatus.className = "hidden";
    networkStatus.textContent = "";
    return;
  }

  const classesByState = {
    loading:
      "mb-4 rounded-lg border px-4 py-3 text-sm font-medium bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200",
    success:
      "mb-4 rounded-lg border px-4 py-3 text-sm font-medium bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200",
    error:
      "mb-4 rounded-lg border px-4 py-3 text-sm font-medium bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200",
    idle: "hidden",
  };

  networkStatus.className = classesByState[networkState] || "hidden";
  networkStatus.textContent = networkMessage;
}

function handleNetworkError(error) {
  const status = error.status || 0;
  const statusLabel = status ? `HTTP ${status}` : "Sin respuesta";
  const message = error.message || "Error de conexión";
  setNetworkState("error", `${statusLabel}: ${message}`);
  showToast("Error de red. Revisa el estado del backend.");
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  themeIcon.textContent = isDark ? "☀️" : "🌙";
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalTasksElement.textContent = total;
  completedTasksElement.textContent = completed;
  pendingTasksElement.textContent = pending;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2200);
}

function registerKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    const targetTag = event.target.tagName;
    const isTypingContext =
      targetTag === "INPUT" || targetTag === "TEXTAREA" || targetTag === "SELECT";

    if (event.key === "Escape" && editModal.open) {
      editModal.close();
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
    }
  });
}
