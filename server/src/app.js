const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/task.routes");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5500",
  "http://127.0.0.1:5500",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS_NOT_ALLOWED"));
    },
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
  res.json({ ok: true, mode: isProduction ? "production" : "development", volatileStore: true });
});
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: isProduction ? "production" : "development", volatileStore: true });
});

app.use("/api/v1/tasks", taskRoutes);
app.use("/api", (_req, _res, next) => next(new Error("NOT_FOUND")));

app.use((err, _req, res, _next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido en el cuerpo de la petición" });
  }
  if (err && err.message === "CORS_NOT_ALLOWED") {
    return res.status(403).json({ error: "Origen no permitido por CORS" });
  }
  if (err && err.message === "NOT_FOUND") {
    return res.status(404).json({ error: "Recurso no encontrado" });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
