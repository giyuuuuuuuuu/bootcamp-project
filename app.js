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

let taskToEdit = null;
let currentFilter = "all";
let searchQuery = "";
let tasks = savedJson ? JSON.parse(savedJson) : [];

completeAllBtn.addEventListener('click', () =>{
    tasks.forEach(task =>{
        task.completed = true;
    });
    renderTasks();
    saveToLocalStorage();
});

clearCompleteBtn.addEventListener('click', () =>{
    tasks = tasks.filter(task => !task.completed);
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
    filterButtons.forEach(b => b.classList.remove("active"));
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
  taskList.innerHTML = ""; // Limpiamos la lista para no duplicar todo
  // Recorremos la lista de tareas, y aplicamos el filtro de una vez
  let filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "pending" && !task.completed) ||
      (currentFilter === "completed" && task.completed);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery);
    // SOLO si cumple las dos condiciones, la tarea se guarda en filteredTasks
    return matchesFilter && matchesSearch;
  });

  filteredTasks.forEach((task) => {
    // Clonamos el contenido del template
    const clone = taskTemplate.cloneNode(true);
    clone.querySelector(".task-text").textContent = task.title;

    if (task.completed) {
      clone.querySelector(".task-text").style.textDecoration = "line-through";
      clone.querySelector(".task-checkbox").checked = true;
    }

    clone.querySelector(".delete-btn").dataset.id = task.id;
    clone.querySelector(".task-checkbox").dataset.id = task.id;
    clone.querySelector(".edit-btn").dataset.id = task.id;
    taskList.appendChild(clone);
  });

  updateStats(); // Cada vez que dibujamos, actualizamos los números
}

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
    // Si clickeo en eliminar: filtramos la lista para quitar esa tarea
    tasks = tasks.filter((task) => task.id !== parseInt(id));
    renderTasks();
    saveToLocalStorage(); // Guardamos el cambio
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
