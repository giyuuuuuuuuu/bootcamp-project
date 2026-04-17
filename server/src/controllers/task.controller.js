const taskService = require("../services/task.service");
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 280;
const ALLOWED_CREATE_FIELDS = new Set(["title", "description", "category"]);
const ALLOWED_UPDATE_FIELDS = new Set(["title", "description", "category", "completed"]);

function hasUnknownFields(payload, allowedFields) {
  return Object.keys(payload).some((field) => !allowedFields.has(field));
}

function obtenerTareas(_req, res) {
  const tasks = taskService.obtenerTodas();
  return res.status(200).json(tasks);
}

function crearTarea(req, res) {
  const data = req.body;

  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Body inválido" });
  }
  if (hasUnknownFields(data, ALLOWED_CREATE_FIELDS)) {
    return res.status(400).json({ error: "El body contiene campos no permitidos" });
  }

  if (typeof data.title !== "string" || data.title.trim() === "") {
    return res.status(400).json({ error: "El campo title es obligatorio" });
  }
  const normalizedTitle = data.title.trim();
  if (!/[\p{L}\p{N}]/u.test(normalizedTitle)) {
    return res.status(400).json({ error: "El title debe contener letras o números" });
  }
  if (normalizedTitle.length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: `El title no puede superar ${MAX_TITLE_LENGTH} caracteres` });
  }
  if (data.description !== undefined && typeof data.description !== "string") {
    return res.status(400).json({ error: "El campo description es inválido" });
  }
  const normalizedDescription = typeof data.description === "string" ? data.description.trim() : "";
  if (normalizedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return res
      .status(400)
      .json({ error: `El description no puede superar ${MAX_DESCRIPTION_LENGTH} caracteres` });
  }

  const nuevaTarea = taskService.crearTarea({
    title: normalizedTitle,
    category: typeof data.category === "string" ? data.category.trim() : "personal",
    description: normalizedDescription,
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
  if (hasUnknownFields(data, ALLOWED_UPDATE_FIELDS)) {
    return res.status(400).json({ error: "El body contiene campos no permitidos" });
  }

  if (
    data.title !== undefined &&
    (typeof data.title !== "string" || data.title.trim() === "")
  ) {
    return res.status(400).json({ error: "El campo title es inválido" });
  }
  if (data.title !== undefined && !/[\p{L}\p{N}]/u.test(data.title.trim())) {
    return res.status(400).json({ error: "El title debe contener letras o números" });
  }
  if (typeof data.title === "string" && data.title.trim().length > MAX_TITLE_LENGTH) {
    return res.status(400).json({ error: `El title no puede superar ${MAX_TITLE_LENGTH} caracteres` });
  }

  if (data.completed !== undefined && typeof data.completed !== "boolean") {
    return res.status(400).json({ error: "El campo completed es inválido" });
  }
  if (data.description !== undefined && typeof data.description !== "string") {
    return res.status(400).json({ error: "El campo description es inválido" });
  }
  if (typeof data.description === "string" && data.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    return res
      .status(400)
      .json({ error: `El description no puede superar ${MAX_DESCRIPTION_LENGTH} caracteres` });
  }

  try {
    const tareaActualizada = taskService.actualizarTarea(id, {
      title: typeof data.title === "string" ? data.title.trim() : undefined,
      completed: data.completed,
      category: typeof data.category === "string" ? data.category.trim() : undefined,
      description: typeof data.description === "string" ? data.description.trim() : undefined,
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
