# 5. Backend: Node.js + Express

Carpeta principal: `server/`. El **punto de entrada** al ejecutar `npm run dev` dentro de `server/` es `server/src/index.js`.

---

## 5.1. `server/src/index.js`

```javascript
const { port } = require("./config/env");
const app = require("./app");

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

| Pieza | Función |
|-------|---------|
| `require("./config/env")` | Carga variables de entorno (puerto). |
| `require("./app")` | Obtiene la aplicación Express ya configurada (sin escuchar aún). |
| `app.listen(port, callback)` | Abre el socket TCP y empieza a aceptar conexiones HTTP. |

---

## 5.2. `server/src/config/env.js`

```javascript
require("dotenv").config();

const isVercelRuntime = process.env.VERCEL === "1";

if (!isVercelRuntime && !process.env.PORT) {
  throw new Error("El puerto no está definido");
}

module.exports = {
  port: process.env.PORT || 3000,
};
```

| Detalle | Explicación |
|---------|-------------|
| `dotenv` | Lee un archivo `.env` (si existe) y rellena `process.env`. |
| `VERCEL === "1"` | En Vercel el runtime inyecta variables; no se fuerza `.env` local. |
| `PORT` | En local, si no hay `.env`, puede fallar salvo que definas `PORT` — el fallback `3000` en `exports` cubre el valor usado, pero la comprobación estricta pide `PORT` en entorno no-Vercel. (Si tu proyecto usa solo `3000` por defecto, asegúrate de tener `.env` con `PORT=3000` o ajusta la lógica según tu entorno.) |
| Export | Objeto `{ port }` usado en `index.js`. |

---

## 5.3. `server/src/app.js` — aplicación Express

### 5.3.1. Creación y middleware global

```javascript
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/task.routes");

const app = express();
```

- **`express()`**: crea la app.
- **`cors(...)`**: middleware que añade cabeceras `Access-Control-*` según el origen de la petición.
- **`express.json()`**: parsea cuerpos `Content-Type: application/json` y rellena `req.body`.

### 5.3.2. Política CORS (resumen)

Lista `allowedOrigins` incluye `FRONTEND_URL`, URL de Vercel, y localhost en 5500. Además:

- Sin cabecera `Origin` (p. ej. Postman): se permite.
- Localhost con cualquier puerto: patrón `LOCAL_ORIGIN_PATTERN`.
- Subdominios `*.vercel.app`: patrón `VERCEL_ORIGIN_PATTERN`.
- En producción, otros `https://` pueden aceptarse.

Si ninguna regla coincide → error `CORS_NOT_ALLOWED` (el manejador de errores responde 403 JSON).

### 5.3.3. Rutas informativas

| Método + ruta | Respuesta |
|---------------|-----------|
| GET `/` | JSON con nombre del servicio, enlaces lógicos a API y health |
| GET `/health` y GET `/api/health` | `{ ok, mode, volatileStore }` |

### 5.3.4. Montaje del router de tareas

```javascript
app.use("/api/v1/tasks", taskRoutes);
```

Todo lo definido en `task.routes.js` queda prefijado: p. ej. `router.get("/")` → **`GET /api/v1/tasks`**.

### 5.3.5. Catch-all `/api`

```javascript
app.use("/api", (_req, _res, next) => next(new Error("NOT_FOUND")));
```

Cualquier otra ruta bajo `/api` que no haya coincidido antes devuelve 404 JSON.

### 5.3.6. Middleware de errores (4 argumentos)

Express distingue manejadores de error si la firma es `(err, req, res, next)`.

Casos:

| Condición | Respuesta |
|-----------|-----------|
| Error de parseo JSON (`entity.parse.failed`) | 400, mensaje en español |
| `CORS_NOT_ALLOWED` | 403 |
| `NOT_FOUND` | 404 |
| Otro | 500, log en consola, mensaje genérico |

Los controladores pueden hacer `next(error)` para llegar aquí (p. ej. tarea no encontrada).

---

## 5.4. `server/src/routes/task.routes.js`

```javascript
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
```

**Orden importante**: las rutas **fijas** (`actions/...`) van **antes** que `/:id`. Si pusieras `/:id` primero, Express podría interpretar `"actions"` como un `id`.

Tabla de rutas HTTP completas (prefijo `/api/v1/tasks`):

| Método | Ruta relativa al router | Controlador |
|--------|-------------------------|-------------|
| GET | `/` | `obtenerTareas` |
| POST | `/` | `crearTarea` |
| POST/PATCH/PUT | `/actions/complete-all` | `completarTodas` |
| DELETE | `/actions/completed` | `limpiarCompletadas` |
| PUT/PATCH | `/:id` | `actualizarTarea` |
| DELETE | `/:id` | `eliminarTarea` |

---

## 5.5. `server/src/controllers/task.controller.js`

### Funciones auxiliares

**`hasUnknownFields(payload, allowedFields)`**

- Recorre `Object.keys(payload)`.
- Si alguna clave no está en el `Set` permitido → el cuerpo se rechaza (evita campos extra como `isAdmin`).

### `obtenerTareas(_req, res)`

- Ignora el cuerpo de la petición (`_req`).
- `taskService.obtenerTodas()` devuelve el array.
- Responde `200` y JSON del array.

### `crearTarea(req, res)`

Validaciones (resumen):

- `req.body` debe ser objeto.
- Solo campos `title`, `description`, `category`.
- `title`: string no vacío, con letras/números (regex Unicode), longitud ≤ 120.
- `description`: opcional, string, trim, ≤ 280.
- Construye objeto normalizado y llama `taskService.crearTarea`.
- Respuesta **`201 Created`** con la tarea nueva.

### `actualizarTarea(req, res, next)`

- Lee `req.params.id` y `req.body`.
- Valida campos permitidos y tipos (`title`, `completed`, `description`, `category`).
- Llama `taskService.actualizarTarea(id, {...})` dentro de `try/catch`.
- Si el servicio lanza error (p. ej. no encontrado), `next(error)` → middleware global.
- Éxito: `200` y JSON de la tarea actualizada.

### `completarTodas(req, res)`

- `taskService.completarTodas()` devuelve el número de tareas (en el servicio es `tasks.length` tras mapear).
- Responde `200` con `{ updated }` (nombre del campo según retorno del servicio).

### `limpiarCompletadas(req, res)`

- `deleted = taskService.limpiarCompletadas()` (número de tareas eliminadas).
- `200` y `{ deleted }`.

### `eliminarTarea(req, res, next)`

- Valida `id`.
- `try`: `taskService.eliminarTarea(id)` → **`204`** sin cuerpo (`res.status(204).send()`).
- `catch`: `next(error)` si no existe.

### Export

```javascript
module.exports = {
  obtenerTareas,
  crearTarea,
  eliminarTarea,
  actualizarTarea,
  completarTodas,
  limpiarCompletadas,
};
```

---

## 5.6. `server/src/services/task.service.js` — datos en memoria

Estado del módulo:

```javascript
let tasks = [];
let nextId = 1;
```

| Función | Qué hace |
|---------|----------|
| `obtenerTodas()` | Devuelve la referencia al array `tasks` (en una app más grande convendría copia inmutable). |
| `crearTarea(data)` | Crea objeto con `id` string incremental, `completed: false`, `createdAt` ISO, `push` al array, devuelve la tarea. |
| `eliminarTarea(id)` | `findIndex`; si no hay, lanza `Error("NOT_FOUND")`; si hay, `splice`. |
| `actualizarTarea(id, data)` | Busca por id; actualiza solo campos definidos y válidos; devuelve la tarea. |
| `completarTodas()` | Sustituye `tasks` por un mapa con todas `completed: true`; devuelve `tasks.length`. |
| `limpiarCompletadas()` | Filtra quitando completadas; devuelve **cuántas** se eliminaron (`before - after`). |

### Export

Objeto con las mismas claves en inglés para `require` desde el controlador.

---

## 5.7. Diagrama de capas (backend)

```
   HTTP request
        ↓
   app.js (Express + CORS + json)
        ↓
   task.routes.js  →  coincide método + path
        ↓
   task.controller.js  →  valida req.body / req.params
        ↓
   task.service.js  →  muta el array `tasks`
        ↓
   res.json(...) / res.status(204).send()
```

---

## 5.8. `server/api/index.js` (variante de export)

Algunos despliegues re-exportan `app` desde una carpeta `api/` dentro de `server/`. En tu repo raíz, **`api/[[...path]].js`** importa `../server/src/app` para Vercel (ver documento de integración).

---

## 5.9. Relación con el frontend

Las rutas y métodos del controlador están **alineados** con `src/api/client.js`:

- `GET /api/v1/tasks` ↔ `getTasks()`
- `POST /api/v1/tasks` ↔ `createTask`
- etc.

Si cambias una ruta en el servidor, **debes** cambiar el cliente o habrá 404.

---

## 5.10. `express.json()` y el cuerpo de la petición

`app.use(express.json())` analiza el cuerpo cuando la cabecera es `application/json` y rellena **`req.body`** con un objeto JavaScript.

Sin este middleware, `req.body` sería `undefined` y el controlador rechazaría todo con “Body inválido”.

**Límite de tamaño**: por defecto Express acepta cuerpos moderados; en APIs públicas se configura un límite explícito para evitar ataques de cuerpos enormes (no está tuneado en este proyecto educativo).

---

## 5.11. `req.params` vs `req.body`

| Objeto | De dónde sale | Ejemplo |
|--------|----------------|---------|
| `req.params` | Segmentos de la ruta definidos con `:` | Ruta `PUT /:id` + URL `.../tasks/7` → `req.params.id === "7"` |
| `req.body` | Cuerpo JSON (POST/PUT/PATCH) | `{ "completed": true }` |

En JavaScript todo llega como string desde la URL; el controlador convierte/valida tipos.

---

## 5.12. Middleware de errores: por qué cuatro argumentos

Express decide que una función es manejador de errores si tiene **cuatro** parámetros `(err, req, res, next)`. Si solo tuviera tres, Express lo trataría como middleware normal.

El orden importa: este bloque va **al final**, después de las rutas.

---

## 5.13. Qué pasa si el servicio lanza `Error("NOT_FOUND")`

`eliminarTarea` y `actualizarTarea` hacen `catch` y `next(error)`. El middleware global de errores en `app.js` incluye:

```javascript
if (err && err.message === "NOT_FOUND") {
  return res.status(404).json({ error: "Recurso no encontrado" });
}
```

Así que una tarea inexistente debe responder **404** con JSON, no 500. (Hay **otro** `NOT_FOUND` distinto: el de rutas `/api` no registradas, que también usa el mismo mensaje y por tanto 404.)

**Prueba**: `DELETE /api/v1/tasks/999` cuando no exista el id → 404.

---

## 5.14. `hasUnknownFields` en detalle

```javascript
return Object.keys(payload).some((field) => !allowedFields.has(field));
```

- `Object.keys(payload)` lista solo propiedades **enumerables propias**.
- `some` devuelve `true` al primer campo no permitido.

**Ejemplo**: si el cliente envía `{ title: "x", isAdmin: true }`, el Set de creación rechaza `isAdmin` → 400. Esto mitiga **mass assignment** accidental o malicioso.

---

## 5.15. Coherencia PUT/PATCH en las rutas

El router registra **tanto** `put` como `patch` para `/:id` y para `actions/complete-all`. El cliente usa `PUT` en `updateTask`; otros clientes podrían usar `PATCH` con el mismo controlador.

Semánticamente: `PUT` a veces se interpreta como “reemplazo total del recurso”; `PATCH` como “cambio parcial”. Aquí el controlador acepta **campos parciales**, más cercano a PATCH, pero el estándar del cliente es PUT.

---

## 5.16. `task.service`: por qué `throw` en lugar de códigos HTTP

El **servicio** no debería conocer HTTP. Solo dice “no encontré la tarea” lanzando error. El **controlador** traduce eso a 404 o 500. Esa separación mantiene el servicio reutilizable (mañana podría llamarse desde una cola de trabajos, tests unitarios, CLI).

---

## 5.17. `completarTodas` y `limpiarCompletadas`: valores de retorno

- `completarTodas` devuelve `tasks.length` (número de tareas tras marcarlas).
- `limpiarCompletadas` devuelve cuántas filas se eliminaron.

El frontend de TaskFlow **no** usa esos números en la respuesta de forma visible; podrías mostrarlos en un toast (“Se borraron N tareas”).

---

## 5.18. Arranque local paso a paso

1. Abre terminal en `server/`.
2. `npm install` (una vez).
3. Crea `.env` con `PORT=3000` si tu `env.js` lo exige en local.
4. `npm run dev` (nodemon recarga al guardar archivos).

Si el puerto está ocupado, cambia `PORT` o cierra el otro proceso.

---

Siguiente lectura recomendada: **06-integracion-completa.md** (flujo extremo a extremo y Vercel).
