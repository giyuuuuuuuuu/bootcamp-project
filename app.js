const taskForm = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskTemplate = document.getElementById("task-template").content;
const savedJson = localStorage.getItem("myTasks");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");
const editModal = document.getElementById("edit-modal");
const editInput = document.getElementById("edit-input");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");
const completeAllBtn = document.getElementById("complete-all-btn");
const clearCompleteBtn = document.getElementById("clear-completed-btn");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

let taskToEdit = null;
let currentFilter = "all";
let searchQuery = "";
let tasks = savedJson ? JSON.parse(savedJson) : [];

const savedTheme =
  localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

applyTheme(savedTheme);

completeAllBtn.addEventListener("click", () => {
  tasks.forEach((task) => {
    task.completed = true;
  });
  renderTasks();
  saveToLocalStorage();
});

clearCompleteBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  renderTasks();
  saveToLocalStorage();
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text !== "") {
    const newTask = {
      id: Date.now(),
      title: text,
      completed: false,
    };
    tasks.push(newTask);
    taskInput.value = "";
    renderTasks();
    saveToLocalStorage(); // Guardamos la nueva tarea
  } else {
    // Si el texto está vacío, manda un aviso
    taskInput.placeholder = "Debe introducir una tarea";
    taskInput.style.borderColor = "var(--danger)";
    taskInput.focus();
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Mejoramos un poco la experiencia del usuario
taskInput.addEventListener("input", () => {
  if (taskInput.value.trim() != "") {
    taskInput.style.borderColor = "#ddd";
    taskInput.placeholder = "Escriba una tarea";
  }
});

searchInput.addEventListener("input", (e) => {
  // Una vez teniendo registrado lo que el usuario escribió, lo pasamos a
  // minusculas para poder trabajar mejor con ello.
  searchQuery = e.target.value.toLowerCase();
  // Imprimimos lo que el usuario buscó.
  renderTasks();
});

function renderTasks() {
  taskList.innerHTML = ""; // Limpieza simple y directa

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "pending" && !task.completed) ||
      (currentFilter === "completed" && task.completed);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  filteredTasks.forEach((task) => {
    const clone = taskTemplate.cloneNode(true);
    const li = clone.querySelector("li");
    const span = li.querySelector(".task-text");
    const checkbox = li.querySelector(".task-checkbox");

    span.textContent = task.title;

    // Dataset IDs para saber a qué tarea le damos click luego
    li.dataset.id = task.id;
    li.querySelector(".delete-btn").dataset.id = task.id;
    li.querySelector(".edit-btn").dataset.id = task.id;
    checkbox.dataset.id = task.id;

    if (task.completed) {
      span.classList.add("line-through", "opacity-50");
      checkbox.checked = true;
    }

    taskList.appendChild(clone);
  });

  updateStats();
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    themeIcon.textContent = "☀️"; // Sol para volver al claro
  } else {
    document.documentElement.classList.remove("dark");
    themeIcon.textContent = "🌙"; // Luna para volver al oscuro
  }
}

themeToggleBtn.addEventListener("click", () => {
  const currentTheme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(newTheme);
  localStorage.setItem("theme", newTheme); // Guardar preferencia
});

taskList.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return; // Si no hay ID (clic fuera de botones), no hacemos nada

  // Si clickeo en editar: abrimos el modal
  if (e.target.classList.contains("edit-btn")) {
    taskToEdit = tasks.find((t) => t.id === parseInt(id));
    if (taskToEdit) {
      editInput.value = taskToEdit.title;
      editModal.showModal();
    }
  }

  if (e.target.classList.contains("delete-btn")) {
    // 1. Capturamos el ID de forma segura (por si acaso el clic da en el borde)
    const idToDelete =
      e.target.dataset.id || e.target.closest("button").dataset.id;
    const li = e.target.closest("li");

    // 2. Aplicamos la animación de salida (0.4s para que coincida con el CSS)
    li.style.transition = "all 0.4s ease";
    li.classList.add("opacity-0", "scale-95");

    // 3. Esperamos exactamente 400 milisegundos (0.4 segundos)
    setTimeout(() => {
      // 4. Lógica de borrado: filtramos usando el idToDelete que guardamos arriba
      tasks = tasks.filter((task) => task.id !== parseInt(idToDelete));

      // 5. Actualizamos todo
      saveToLocalStorage();
      renderTasks();
    }, 400);
  }

  if (e.target.classList.contains("task-checkbox")) {
    // Si clickeo en el checkbox: buscamos la tarea y cambiamos su estado
    const task = tasks.find((t) => t.id === parseInt(id));
    if (task) {
      task.completed = !task.completed;
      renderTasks();
      saveToLocalStorage(); // Guardamos el cambio
    }
  }
});

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  document.getElementById("total-tasks").textContent = total;
  document.getElementById("completed-tasks").textContent = completed;
  document.getElementById("pending-tasks").textContent = pending;
}

function saveToLocalStorage() {
  // localStorage.setItem guarda ese texto bajo la etiqueta 'myTasks'
  localStorage.setItem("myTasks", JSON.stringify(tasks));
}

// Botón para guardar la edición del modal
saveEditBtn.addEventListener("click", () => {
  const newTitle = editInput.value.trim();

  if (newTitle != "" && taskToEdit) {
    taskToEdit.title = newTitle;
    renderTasks();
    saveToLocalStorage(); // Guardamos la edición
    editModal.close();
    taskToEdit = null; // Limpiamos la tarea seleccionada
  }
});

// Botón para cancelar la edición
cancelEditBtn.addEventListener("click", () => {
  editModal.close();
  taskToEdit = null;
});

// Llamada inicial para pintar los datos que ya existan
renderTasks();
