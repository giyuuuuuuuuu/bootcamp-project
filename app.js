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
const clearSearchBtn = document.getElementById("clear-search-btn");
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
const THEME_STORAGE_KEY = "taskflow-theme";

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
let highlightedTaskId = null;

initializeTheme();
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
    const createdTask = await createTask({ title, category });
    highlightedTaskId = createdTask?.id ? String(createdTask.id) : null;
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

clearSearchBtn.addEventListener("click", () => {
  if (!searchInput.value) return;
  searchInput.value = "";
  searchQuery = "";
  renderTasks();
  showToast("Búsqueda limpiada.", "info");
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
    showToast("El título no puede estar vacío.", "info");
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
    if (successMessage) {
      showToast(successMessage, "success");
    }
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
  await animateTaskRemoval(taskId);

  try {
    await deleteTask(taskId);
    await loadTasks("Tarea eliminada.");
  } catch (error) {
    renderTasks();
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
  const completedTaskIds = tasks
    .filter((task) => task.completed)
    .map((task) => String(task.id));

  if (completedTaskIds.length === 0) {
    showToast("No hay tareas completadas para borrar.", "info");
    return;
  }

  setNetworkState("loading", "Eliminando tareas completadas...");
  await animateTasksRemoval(completedTaskIds);

  try {
    await clearCompletedTasks();
    await loadTasks("Se eliminaron las tareas completadas.");
  } catch (error) {
    renderTasks();
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

    if (highlightedTaskId && highlightedTaskId === task.id) {
      listItem.classList.add("task-enter");
    }

    if (task.completed) {
      textElement.classList.add("line-through", "opacity-50");
      checkbox.checked = true;
    }

    taskList.appendChild(clone);
  });

  updateStats();
  highlightedTaskId = null;
}

function animateTaskRemoval(taskId) {
  return animateTasksRemoval([String(taskId)]);
}

function animateTasksRemoval(taskIds) {
  const idsToRemove = new Set(taskIds.map((id) => String(id)));
  const itemsToAnimate = [...taskList.querySelectorAll("li[data-id]")].filter((item) =>
    idsToRemove.has(item.dataset.id),
  );

  if (itemsToAnimate.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let finishedAnimations = 0;

    const markAnimationDone = () => {
      finishedAnimations += 1;
      if (finishedAnimations >= itemsToAnimate.length) {
        resolve();
      }
    };

    itemsToAnimate.forEach((item, index) => {
      const delayMs = index * 45;

      setTimeout(() => {
        let resolved = false;
        const finish = () => {
          if (resolved) return;
          resolved = true;
          markAnimationDone();
        };

        item.classList.add("task-removing");
        item.addEventListener("transitionend", finish, { once: true });
        setTimeout(finish, 420);
      }, delayMs);
    });
  });
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
}

function clearNetworkMessage() {
  if (networkState !== "loading") {
    networkState = "idle";
    networkMessage = "";
  }
}

function renderNetworkStateBanner() {
  // Banner de estado oculto por UX: usamos toasts para feedback al usuario.
}

function handleNetworkError(error) {
  const status = error.status || 0;
  const statusLabel = status ? `HTTP ${status}` : "Sin respuesta";
  const message = error.message || "Error de conexión";
  setNetworkState("error", `${statusLabel}: ${message}`);
  showToast("Error de red. Revisa el estado del backend.", "error");
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  themeIcon.textContent = isDark ? "☀️" : "🌙";

  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  } catch (_error) {
    // Ignore storage failures (private mode, blocked storage, etc.).
  }
}

function initializeTheme() {
  const storedTheme = getStoredTheme();

  if (storedTheme) {
    applyTheme(storedTheme);
    return;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function getStoredTheme() {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
  } catch (_error) {
    return null;
  }
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  totalTasksElement.textContent = total;
  completedTasksElement.textContent = completed;
  pendingTasksElement.textContent = pending;
}

function showToast(message, type = "info") {
  const validType = ["success", "error", "info"].includes(type) ? type : "info";
  const toast = document.createElement("div");
  toast.className = `toast toast-${validType}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-leaving");
    setTimeout(() => {
      toast.remove();
    }, 220);
  }, 2000);
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
