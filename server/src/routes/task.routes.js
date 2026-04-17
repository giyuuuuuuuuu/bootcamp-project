const express = require("express");
const taskController = require("../controllers/task.controller");

const router = express.Router();

router.get("/", taskController.obtenerTareas);
router.post("/", taskController.crearTarea);
router.post("/actions/complete-all", taskController.completarTodas);
router.patch("/actions/complete-all", taskController.completarTodas);
router.put("/actions/complete-all", taskController.completarTodas);
router.delete("/actions/completed", taskController.limpiarCompletadas);
router.put("/:id", taskController.actualizarTarea);
router.patch("/:id", taskController.actualizarTarea);
router.delete("/:id", taskController.eliminarTarea);

module.exports = router;
