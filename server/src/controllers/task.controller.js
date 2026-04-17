const taskService = require("../services/task.service");

function obtenerTareas(_req, res) {
  const tasks = taskService.obtenerTodas();
  return res.status(200).json(tasks);
}

function crearTarea(req, res) {
  const data = req.body;

  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Body inválido" });
  }

  if (typeof data.title !== "string" || data.title.trim() === "") {
    return res.status(400).json({ error: "El campo title es obligatorio" });
  }

  const nuevaTarea = taskService.crearTarea({
    title: data.title.trim(),
    category: typeof data.category === "string" ? data.category.trim() : "personal",
  });

  return res.status(201).json(nuevaTarea);
}

function actualizarTarea(req, res, next) {
  const { id } = req.params;
  const data = req.body;

  if (!id || typeof id !== "string" || id.trim() === "") {
    return res.status(400).json({ error: "ID inválido" });
  }

  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Body inválido" });
  }

  if (
    data.title !== undefined &&
    (typeof data.title !== "string" || data.title.trim() === "")
  ) {
    return res.status(400).json({ error: "El campo title es inválido" });
  }

  if (data.completed !== undefined && typeof data.completed !== "boolean") {
    return res.status(400).json({ error: "El campo completed es inválido" });
  }

  try {
    const tareaActualizada = taskService.actualizarTarea(id, {
      title: typeof data.title === "string" ? data.title.trim() : undefined,
      completed: data.completed,
      category: typeof data.category === "string" ? data.category.trim() : undefined,
    });

    return res.status(200).json(tareaActualizada);
  } catch (error) {
    return next(error);
  }
}

function completarTodas(req, res) {
  const updated = taskService.completarTodas();
  return res.status(200).json({ updated });
}

function limpiarCompletadas(req, res) {
  const deleted = taskService.limpiarCompletadas();
  return res.status(200).json({ deleted });
}

function eliminarTarea(req, res, next) {
  const { id } = req.params;

  if (!id || typeof id !== "string" || id.trim() === "") {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    taskService.eliminarTarea(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  obtenerTareas,
  crearTarea,
  eliminarTarea,
  actualizarTarea,
  completarTodas,
  limpiarCompletadas,
};
