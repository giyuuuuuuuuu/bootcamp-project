let tasks = [];
let nextId = 1;

function obtenerTodas() {
  return tasks;
}

function crearTarea(data) {
  const nuevaTarea = {
    id: String(nextId++),
    title: data.title,
    completed: false,
    category: data.category || "personal",
  };

  tasks.push(nuevaTarea);
  return nuevaTarea;
}

function eliminarTarea(id) {
  const index = tasks.findIndex((task) => task.id === String(id));

  if (index === -1) {
    throw new Error("NOT_FOUND");
  }

  tasks.splice(index, 1);
}

function actualizarTarea(id, data) {
  const task = tasks.find((item) => item.id === String(id));

  if (!task) {
    throw new Error("NOT_FOUND");
  }

  if (typeof data.title === "string") {
    task.title = data.title;
  }

  if (typeof data.completed === "boolean") {
    task.completed = data.completed;
  }

  if (typeof data.category === "string" && data.category.trim() !== "") {
    task.category = data.category;
  }

  return task;
}

function completarTodas() {
  tasks = tasks.map((task) => ({ ...task, completed: true }));
  return tasks.length;
}

function limpiarCompletadas() {
  const before = tasks.length;
  tasks = tasks.filter((task) => !task.completed);
  return before - tasks.length;
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
  actualizarTarea,
  completarTodas,
  limpiarCompletadas,
};
