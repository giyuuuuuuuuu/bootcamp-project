const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/task.routes");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "TaskFlow Backend API",
    status: "ok",
    docs: "/api/v1/tasks",
    health: "/health",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/v1/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  if (err && err.message === "NOT_FOUND") {
    return res.status(404).json({ error: "Recurso no encontrado" });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
