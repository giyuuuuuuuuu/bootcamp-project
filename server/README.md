# Backend Task API (Node + Express)

Este backend expone una API REST para gestionar tareas y sirve como capa de negocio para el frontend.

## Arquitectura de carpetas

```text
server/
├── .env
├── .gitignore
├── package.json
├── postman/
│   └── tasks-api.collection.json
└── src/
    ├── config/
    │   └── env.js
    ├── controllers/
    │   └── task.controller.js
    ├── routes/
    │   └── task.routes.js
    ├── services/
    │   └── task.service.js
    └── index.js
```

## Capas y responsabilidades

- `services`: contiene la logica de dominio pura (`obtenerTodas`, `crearTarea`, `eliminarTarea`, `actualizarTarea`, operaciones masivas) y la persistencia simulada en memoria.
- `controllers`: traduce HTTP a casos de uso; valida `req.body`, decide codigos de respuesta y delega al servicio.
- `routes`: mapea verbos HTTP y paths a controladores.
- `config`: carga y valida variables de entorno antes de arrancar.
- `index.js`: compone middlewares, rutas y el manejador global de errores.

## Middlewares y flujo de peticion

1. `cors()` habilita consumo cross-origin desde frontend.
2. `express.json()` parsea cuerpos JSON.
3. `app.use("/api/v1/tasks", taskRoutes)` enruta peticiones de tareas.
4. Middleware global de errores `(err, req, res, next)`:
   - si `err.message === "NOT_FOUND"` responde `404`.
   - para errores no controlados ejecuta `console.error(err)` y responde `500` con mensaje generico.

Este diseno evita filtrar stack traces o detalles internos hacia el cliente.

## Variables de entorno

Archivo `.env` (ejemplo):

```env
PORT=3000
```

`src/config/env.js` valida que `PORT` exista. Si no existe, lanza:

```js
throw new Error("El puerto no está definido");
```

## Endpoints REST

Base URL por defecto: `http://localhost:3000`

### `GET /api/v1/tasks`

Devuelve todas las tareas.

Respuesta `200`:

```json
[
  {
    "id": "1",
    "title": "Primera tarea",
    "completed": false
  }
]
```

### `POST /api/v1/tasks`

Crea una nueva tarea.

Body:

```json
{
  "title": "Aprender middlewares"
}
```

Respuesta `201`:

```json
{
  "id": "2",
  "title": "Aprender middlewares",
  "completed": false
}
```

Error validacion `400` (ejemplo sin `title`):

```json
{
  "error": "El campo title es obligatorio"
}
```

### `DELETE /api/v1/tasks/:id`

Elimina una tarea por ID.

- Respuesta `204` cuando elimina correctamente.
- Respuesta `404` si no existe (`NOT_FOUND` mapeado por middleware global).

### `PUT /api/v1/tasks/:id`

Actualiza campos editables de una tarea (por ejemplo `title` o `completed`).

Body ejemplo:

```json
{
  "title": "Nuevo titulo",
  "completed": true
}
```

Respuesta `200` con la tarea actualizada.

### `POST /api/v1/tasks/actions/complete-all`

Marca todas las tareas como completadas.

Respuesta `200`:

```json
{
  "updated": 3
}
```

### `DELETE /api/v1/tasks/actions/completed`

Elimina todas las tareas completadas.

Respuesta `200`:

```json
{
  "deleted": 2
}
```

## Arranque y desarrollo

Instalacion:

```bash
npm install
```

Modo desarrollo:

```bash
npm run dev
```

## Pruebas de integracion

Coleccion Postman incluida:

- `postman/tasks-api.collection.json`

Casos recomendados:

1. `POST` valido -> confirmar `201`.
2. `POST` sin `title` -> confirmar `400`.
3. `DELETE` de ID inexistente -> confirmar `404`.
4. Forzar error inesperado en codigo y confirmar `500` + mensaje generico.
