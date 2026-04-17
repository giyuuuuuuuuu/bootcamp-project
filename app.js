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
const taskDescriptionInput = document.getElementById("task-description");
const categorySelect = document.getElementById("category-select");
const addTaskSubmitBtn = taskForm.querySelector("button[type='submit']");
const taskList = document.getElementById("task-list");
const taskTemplate = document.getElementById("task-template").content;
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const editDescriptionInput = document.getElementById("edit-description");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");
const confirmDeleteModal = document.getElementById("confirm-delete-modal");
const confirmDeleteTitle = document.getElementById("confirm-delete-title");
const confirmDeleteMessage = document.getElementById("confirm-delete-message");
const confirmDeleteCancelBtn = document.getElementById("confirm-delete-cancel");
const confirmDeleteAcceptBtn = document.getElementById("confirm-delete-accept");
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
const SEARCH_THROTTLE_MS = 140;
const MAX_VISIBLE_TOASTS = 3;

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
let searchThrottleTimeout = null;
let renderFrameId = null;
const inFlightTaskIds = new Set();
let confirmModalOpen = false;

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
  if (!isMeaningfulTitle(title)) {
    taskInput.placeholder = "Escribe un título real";
    taskInput.style.borderColor = TASK_INPUT_ERROR_BORDER;
    taskInput.focus();
    showToast("El título debe contener letras o números.", "info");
    return;
  }

  const category = getSafeCategory(categorySelect.value);
  const description = normalizeDescription(taskDescriptionInput.value);
  setButtonLoading(addTaskSubmitBtn, true, "Añadiendo...");

  try {
    const createdTask = await createTask({ title, category, description });
    const normalizedTask = normalizeTask(createdTask);
    tasks.unshift(normalizedTask);
    highlightedTaskId = normalizedTask.id;
    taskInput.value = "";
    taskDescriptionInput.value = "";
    categorySelect.value = DEFAULT_CATEGORY;
    setNetworkState("success", "Tarea creada correctamente.");
    renderTasks();
    showToast("Tarea creada correctamente.", "success");
  } catch (error) {
    handleNetworkError(error);
  } finally {
    setButtonLoading(addTaskSubmitBtn, false);
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
  if (searchThrottleTimeout) {
    clearTimeout(searchThrottleTimeout);
  }

  searchThrottleTimeout = setTimeout(() => {
    renderTasks();
  }, SEARCH_THROTTLE_MS);
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
    await deleteTaskById(target.dataset.id, target);
    return;
  }

  if (target.classList.contains("task-checkbox")) {
    await toggleTaskState(target.dataset.id);
  }
});

editModal.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!taskToEdit) return;
  if (inFlightTaskIds.has(String(taskToEdit.id))) return;

  const newTitle = editInput.value.trim();
  if (!isMeaningfulTitle(newTitle)) {
    showToast("El título debe contener letras o números.", "info");
    return;
  }
  const newDescription = normalizeDescription(editDescriptionInput.value);
  const editTaskId = String(taskToEdit.id);
  inFlightTaskIds.add(editTaskId);
  setButtonLoading(saveEditBtn, true, "Guardando...");

  try {
    const updatedTask = await updateTask(taskToEdit.id, {
      title: newTitle,
      description: newDescription,
    });
    upsertTaskInMemory(normalizeTask(updatedTask));
    closeEditModal();
    renderTasks();
    showToast("Tarea actualizada.", "success");
  } catch (error) {
    handleNetworkError(error);
  } finally {
    inFlightTaskIds.delete(editTaskId);
    setButtonLoading(saveEditBtn, false);
  }
});

cancelEditBtn.addEventListener("click", closeEditModal);

async function loadTasks(successMessage = "") {
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

async function deleteTaskById(taskId, deleteButton = null) {
  if (!taskId) return;
  const normalizedTaskId = String(taskId);
  if (inFlightTaskIds.has(normalizedTaskId)) return;

  const taskToDelete = tasks.find((task) => String(task.id) === String(taskId));
  const taskTitle =
    taskToDelete && taskToDelete.title ? `: "${taskToDelete.title}"` : "";
  const shouldDelete = await openConfirmModal({
    title: "Eliminar tarea",
    message: `¿Quieres borrar la tarea${taskTitle}?`,
    acceptLabel: "Eliminar",
    acceptVariant: "danger",
  });

  if (!shouldDelete) return;

  inFlightTaskIds.add(normalizedTaskId);
  setButtonLoading(deleteButton, true, "Eliminando...");
  await animateTaskRemoval(taskId);

  try {
    await deleteTask(taskId);
    removeTaskFromMemory(taskId);
    renderTasks();
    showToast("Tarea eliminada.", "success");
  } catch (error) {
    renderTasks();
    handleNetworkError(error);
  } finally {
    inFlightTaskIds.delete(normalizedTaskId);
    setButtonLoading(deleteButton, false);
  }
}

async function toggleTaskState(taskId) {
  if (!taskId) return;
  const normalizedTaskId = String(taskId);
  if (inFlightTaskIds.has(normalizedTaskId)) return;

  const task = tasks.find((item) => String(item.id) === String(taskId));
  if (!task) return;

  inFlightTaskIds.add(normalizedTaskId);
  try {
    const updatedTask = await updateTask(task.id, { completed: !task.completed });
    upsertTaskInMemory(normalizeTask(updatedTask));
    renderTasks();
  } catch (error) {
    handleNetworkError(error);
  } finally {
    inFlightTaskIds.delete(normalizedTaskId);
  }
}

async function completeAllTasksFromApi() {
  setButtonLoading(completeAllBtn, true, "Completando...");

  try {
    await completeAllTasks();
    tasks = tasks.map((task) => ({ ...task, completed: true }));
    renderTasks();
    showToast("Todas las tareas fueron completadas.", "success");
  } catch (error) {
    handleNetworkError(error);
  } finally {
    setButtonLoading(completeAllBtn, false);
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

  const shouldDeleteCompleted = await openConfirmModal({
    title: "Borrar completadas",
    message: "¿Quieres borrar todas las tareas completadas?",
    acceptLabel: "Borrar",
    acceptVariant: "danger",
  });

  if (!shouldDeleteCompleted) return;

  setButtonLoading(clearCompleteBtn, true, "Borrando...");
  await animateTasksRemoval(completedTaskIds);

  try {
    await clearCompletedTasks();
    tasks = tasks.filter((task) => !task.completed);
    renderTasks();
    showToast("Se eliminaron las tareas completadas.", "success");
  } catch (error) {
    renderTasks();
    handleNetworkError(error);
  } finally {
    setButtonLoading(clearCompleteBtn, false);
  }
}

function openEditModalById(taskId) {
  if (!taskId) return;

  taskToEdit = tasks.find((task) => String(task.id) === String(taskId));
  if (!taskToEdit) return;

  editInput.value = taskToEdit.title;
  editDescriptionInput.value = taskToEdit.description || "";
  editModal.showModal();
}

function closeEditModal() {
  editModal.close();
  taskToEdit = null;
  editInput.value = "";
  editDescriptionInput.value = "";
}

function openConfirmModal({
  title = "Confirmar acción",
  message = "¿Seguro que quieres continuar?",
  acceptLabel = "Aceptar",
  acceptVariant = "danger",
}) {
  if (confirmModalOpen) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    confirmModalOpen = true;
    confirmDeleteTitle.textContent = title;
    confirmDeleteMessage.textContent = message;
    confirmDeleteAcceptBtn.textContent = acceptLabel;
    confirmDeleteAcceptBtn.classList.toggle("is-danger", acceptVariant === "danger");
    confirmDeleteAcceptBtn.classList.toggle("is-primary", acceptVariant !== "danger");
    confirmDeleteModal.showModal();

    const cleanup = () => {
      confirmModalOpen = false;
      confirmDeleteAcceptBtn.removeEventListener("click", handleAccept);
      confirmDeleteCancelBtn.removeEventListener("click", handleCancel);
      confirmDeleteModal.removeEventListener("cancel", handleCancel);
      confirmDeleteModal.removeEventListener("close", handleClose);
    };

    const handleAccept = () => {
      cleanup();
      confirmDeleteModal.close();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      confirmDeleteModal.close();
      resolve(false);
    };

    const handleClose = () => {
      cleanup();
      resolve(false);
    };

    confirmDeleteAcceptBtn.addEventListener("click", handleAccept);
    confirmDeleteCancelBtn.addEventListener("click", handleCancel);
    confirmDeleteModal.addEventListener("cancel", handleCancel);
    confirmDeleteModal.addEventListener("close", handleClose);
  });
}

function setButtonLoading(button, isLoading, loadingText = "Procesando...") {
  if (!button) return;

  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent.trim();
    }

    button.style.minWidth = `${button.offsetWidth}px`;
    button.disabled = true;
    button.classList.add("is-loading");
    button.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span><span>${loadingText}</span>`;
    return;
  }

  button.disabled = false;
  button.classList.remove("is-loading");
  button.style.minWidth = "";

  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

function normalizeTask(task) {
  const fallbackTimestamp = Number.parseInt(String(task.id), 10);
  return {
    id: String(task.id),
    title: task.title,
    description: normalizeDescription(task.description),
    completed: Boolean(task.completed),
    category: getSafeCategory(task.category),
    createdAt:
      typeof task.createdAt === "string"
        ? task.createdAt
        : Number.isFinite(fallbackTimestamp)
          ? new Date(fallbackTimestamp).toISOString()
          : new Date().toISOString(),
  };
}

function getSafeCategory(category) {
  return CATEGORY_LABELS[category] ? category : DEFAULT_CATEGORY;
}

function isMeaningfulTitle(title) {
  return /[\p{L}\p{N}]/u.test(title);
}

function normalizeDescription(description) {
  if (typeof description !== "string") return "";
  return description.trim();
}

function upsertTaskInMemory(taskToUpsert) {
  const taskIndex = tasks.findIndex((task) => String(task.id) === String(taskToUpsert.id));

  if (taskIndex === -1) {
    tasks.unshift(taskToUpsert);
    return;
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...taskToUpsert };
}

function removeTaskFromMemory(taskId) {
  tasks = tasks.filter((task) => String(task.id) !== String(taskId));
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
  if (renderFrameId !== null) return;

  renderFrameId = window.requestAnimationFrame(() => {
    renderFrameId = null;
    renderTasksNow();
  });
}

function renderTasksNow() {
  const filteredTasks = tasks.filter(matchesCurrentFilters);
  const sortedTasks = sortTasks(filteredTasks);

  if (sortedTasks.length === 0) {
    taskList.replaceChildren();
    renderEmptyState();
    updateStats();
    return;
  }

  const fragment = document.createDocumentFragment();

  sortedTasks.forEach((task) => {
    const clone = taskTemplate.cloneNode(true);
    const listItem = clone.querySelector("li");
    const textElement = listItem.querySelector(".task-text");
    const descriptionElement = listItem.querySelector(".task-description");
    const checkbox = listItem.querySelector(".task-checkbox");
    const categoryBadge = listItem.querySelector(".task-category-badge");
    const category = getSafeCategory(task.category);

    textElement.textContent = task.title;
    if (task.description) {
      descriptionElement.textContent = task.description;
      descriptionElement.classList.remove("hidden");
    } else {
      descriptionElement.textContent = "";
      descriptionElement.classList.add("hidden");
    }
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

    fragment.appendChild(clone);
  });

  taskList.replaceChildren(fragment);

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

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    itemsToAnimate.forEach((item) => item.classList.add("task-removing"));
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let finishedAnimations = 0;
    const onAnimationFinished = () => {
      finishedAnimations += 1;
      if (finishedAnimations >= itemsToAnimate.length) {
        resolve();
      }
    };

    itemsToAnimate.forEach((item, index) => {
      item.style.transitionDelay = `${index * 36}ms`;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        item.style.transitionDelay = "";
        onAnimationFinished();
      };
      item.addEventListener("transitionend", finish, { once: true });
      item.classList.add("task-removing");
      window.setTimeout(finish, 260 + index * 36);
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
  const toTimestamp = (task) => {
    const parsed = Date.parse(task.createdAt);
    if (Number.isFinite(parsed)) return parsed;
    const fromId = Number.parseInt(String(task.id), 10);
    return Number.isFinite(fromId) ? fromId : 0;
  };

  if (currentSort === "oldest") {
    return sorted.sort((a, b) => toTimestamp(a) - toTimestamp(b));
  }

  if (currentSort === "alphabetical") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "es"));
  }

  if (currentSort === "status") {
    return sorted.sort((a, b) => Number(a.completed) - Number(b.completed));
  }

  return sorted.sort((a, b) => toTimestamp(b) - toTimestamp(a));
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
  document.documentElement.classList.add("theme-switching");
  document.documentElement.classList.toggle("dark", isDark);
  themeIcon.textContent = isDark ? "☀️" : "🌙";
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-switching");
  }, 140);

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
  let completed = 0;
  for (const task of tasks) {
    if (task.completed) completed += 1;
  }
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

  while (toastContainer.children.length >= MAX_VISIBLE_TOASTS) {
    toastContainer.firstElementChild?.remove();
  }
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
    }
  });
}
