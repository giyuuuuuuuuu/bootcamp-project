# 6. Integración completa: cómo se conecta todo

Este documento une **frontend**, **cliente HTTP**, **backend** y **despliegue**, con diagramas y ejemplos de punta a punta.

---

## 6.1. Vista de capas (de arriba abajo)

```
┌─────────────────────────────────────────────────────────────┐
│  Usuario (navegador)                                         │
│    HTML + CSS + app.js                                       │
└───────────────────────────┬─────────────────────────────────┘
                            │ fetch (HTTP)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  src/api/client.js                                           │
│    request() · timeout · JSON · errores con .status          │
└───────────────────────────┬─────────────────────────────────┘
                            │ TCP / TLS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Servidor Express (Node)                                     │
│    CORS → express.json() → routes → controller → service     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    [ array en RAM: tasks ]
```

**No hay base de datos** en el código actual: el “almacén” es el array `tasks` en `task.service.js`.

---

## 6.2. Desarrollo local vs producción

### Local típico

| Pieza | URL / puerto |
|-------|----------------|
| HTML abierto con Live Server | `http://127.0.0.1:5500/` (ejemplo) |
| API Express | `http://localhost:3000` |

`getBaseUrl()` en `client.js` detecta `hostname` localhost y usa **`http://localhost:3000/api/v1/tasks`** como base absoluta.

```
┌──────────────┐     GET      ┌──────────────────┐
│  :5500       │ ──────────► │  :3000           │
│  (frontend)  │   CORS OK   │  /api/v1/tasks   │
└──────────────┘ ◄────────── └──────────────────┘
                 JSON
```

**Importante**: el servidor debe estar **levantado** (`cd server && npm run dev` o equivalente). Si no, `fetch` falla con error de red.

### Producción (Vercel)

`vercel.json` define:

1. Rutas `/api/(.*)` y `/health` van al **serverless function** `api/[[...path]].js`.
2. Ese archivo **exporta la misma app Express** (`require("../server/src/app")`).
3. El resto de rutas cae en **archivos estáticos** y finalmente `index.html` (SPA fallback).

El frontend usa **`/api/v1/tasks`** como ruta relativa: el navegador resuelve contra el **mismo dominio** que sirve la página, así no hace falta `localhost:3000`.

```
https://tu-proyecto.vercel.app/index.html
https://tu-proyecto.vercel.app/api/v1/tasks   ← misma origen
```

---

## 6.3. Archivo `api/[[...path]].js` (raíz del repo)

```javascript
const app = require("../server/src/app");

module.exports = app;
```

En Vercel, las funciones en `/api` reciben peticiones; al **exportar** la app Express como manejador, cada invocación serverless delega en el mismo enrutado que en local.

**Nota**: el tiempo máximo de ejecución puede estar limitado (`maxDuration` en `vercel.json`).

---

## 6.4. Ejemplo completo: listar tareas

### 1) Usuario abre la página

`app.js` ejecuta `loadTasks()` → `getTasks()` en `client.js`.

### 2) Cliente

```http
GET http://localhost:3000/api/v1/tasks
Accept: */*
```

### 3) Express

- Pasa CORS.
- `GET /api/v1/tasks` → router → `obtenerTareas` → `taskService.obtenerTodas()` → devuelve array.

### 4) Respuesta

```http
HTTP/1.1 200 OK
Content-Type: application/json

[ { "id":"1", "title":"...", ... }, ... ]
```

### 5) Frontend

`request()` parsea JSON; `loadTasks` hace `tasks = remoteTasks.map(normalizeTask)` y `renderTasks()` pinta la lista.

---

## 6.5. Ejemplo: crear tarea (POST)

**Cliente** (`createTask`):

```http
POST /api/v1/tasks
Content-Type: application/json

{"title":"Leer","category":"study","description":""}
```

**Controlador** valida y llama al servicio → **201** con el objeto creado.

**Frontend** añade a `tasks` y repinta.

Diagrama de secuencia:

```
Usuario  →  app.js (submit)  →  createTask()
                                   ↓
                            fetch POST + JSON
                                   ↓
                            Express crearTarea
                                   ↓
                            taskService.crearTarea (push + id)
                                   ↓
                            201 + JSON tarea
                                   ↓
app.js  ←  normalizeTask  ←  unshift  ←  renderTasks + toast
```

---

## 6.6. Ejemplo: borrar (DELETE → 204)

`deleteTask(id)` en el cliente hace:

```http
DELETE /api/v1/tasks/3
```

El controlador llama `eliminarTarea` → servicio hace `splice` → **`204 No Content`** sin cuerpo.

En `client.js`, `response.status === 204` devuelve `null` (éxito). El frontend ya había animado la tarjeta y luego actualiza memoria.

---

## 6.7. CORS en la práctica

Si abres el HTML como **archivo** (`file://`), o desde un origen no listado, el navegador puede bloquear la respuesta aunque el servidor conteste.

**Buena práctica en desarrollo**: Live Server u otro servidor HTTP + API en localhost con política CORS como la de `app.js`.

---

## 6.8. Qué “hace falta” para que funcione el sistema

| Requisito | Para qué |
|-----------|----------|
| Node instalado | Ejecutar el servidor |
| `npm install` en `server/` | Dependencias Express, cors, dotenv |
| Servidor escuchando | Responder `fetch` del navegador |
| Origen permitido por CORS | El navegador no bloquea la respuesta |
| Misma versión de rutas en cliente y servidor | Evitar 404 por path distinto |

---

## 6.9. Fallos habituales (troubleshooting)

| Síntoma | Posible causa |
|---------|----------------|
| `Failed to fetch` | API apagada, URL mal, firewall |
| HTML en vez de JSON | Ruta incorrecta en producción; revisar `vercel.json` y rutas |
| 403 CORS | Origen no permitido; revisar `allowedOrigins` y patrones |
| Lista vacía tras reiniciar servidor | Memoria volátil: es el comportamiento esperado |
| Timeout 15 s | Servidor colgado o red muy lenta |

---

## 6.10. Resumen en una frase

El **navegador** solo ejecuta `app.js` y `client.js`; **Express** es el programa que mantiene las tareas en RAM y responde JSON; **Vercel** puede empaquetar esa misma app para servir `/api/*` junto al HTML estático.

---

## 6.11. `vercel.json` ruta por ruta

Fragmento conceptual:

```json
"routes": [
  { "src": "/health", "dest": "/api/[[...path]].js" },
  { "src": "/api/(.*)", "dest": "/api/[[...path]].js" },
  { "handle": "filesystem" },
  { "src": "/(.*)", "dest": "/index.html" }
]
```

| Entrada | Efecto |
|---------|--------|
| Petición a `/api/v1/tasks` | Va al handler serverless que exporta Express. |
| Petición a un archivo estático existente | `filesystem` lo sirve si está en el deploy. |
| Cualquier otra ruta | SPA fallback → `index.html` (la app de una sola página). |

**Consecuencia**: rutas “bonitas” del frontend que no existen como archivos siguen mostrando la misma `index.html`; el enrutamiento adicional tendría que ser en JS del cliente (no es el caso de TaskFlow, que es una sola página).

---

## 6.12. Misma base de código, dos “modos de vida”

| Modo | Quién mantiene el proceso Node vivo |
|------|--------------------------------------|
| Local `node` / `nodemon` | Tu máquina; el array `tasks` vive mientras el proceso viva. |
| Vercel serverless | La nube; instancias efímeras; memoria RAM **no** es fuente de verdad fiable entre usuarios o invocaciones. |

Por eso el tutorial insiste: TaskFlow en memoria es **pedagógico**. Un producto real conectaría una base de datos o al menos un almacén externo.

---

## 6.13. Diagrama: capas lógicas extremo a extremo

```
┌─────────────────────────────────────────────────────────────┐
│ CAPA PRESENTACIÓN (vista)                                    │
│  HTML + CSS + animaciones                                    │
└────────────────────────────┬────────────────────────────────┘
                             │ eventos DOM
┌────────────────────────────▼────────────────────────────────┐
│ CAPA APLICACIÓN CLIENTE (app.js)                             │
│  estado local, validación UX, orquestación                   │
└────────────────────────────┬────────────────────────────────┘
                             │ llamadas a funciones importadas
┌────────────────────────────▼────────────────────────────────┐
│ CAPA TRANSPORTE / CLIENTE HTTP (client.js)                   │
│  fetch, timeouts, parseo de errores                          │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP por la red
┌────────────────────────────▼────────────────────────────────┐
│ CAPA HTTP SERVIDOR (Express)                                 │
│  CORS, JSON body, enrutado                                   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ CAPA CONTROL (controller)                                    │
│  validación de entrada, códigos HTTP                         │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│ CAPA DOMINIO / DATOS (service + array)                       │
│  reglas de negocio mínimas, persistencia en RAM              │
└─────────────────────────────────────────────────────────────┘
```

No hace falta memorizar nombres de capas; sí entender que **cada capa tiene una responsabilidad** y mezclarlas todo en un solo archivo de 5000 líneas escala mal.

---

## 6.14. Prueba manual integrada (checklist)

1. Arranca API en `3000`.
2. Abre frontend en `5500` (o similar).
3. Crea una tarea → debe aparecer sin recargar.
4. Recarga la página → la tarea sigue si el servidor no se reinició.
5. Reinicia solo el servidor → las tareas desaparecen (memoria volátil).
6. Abre consola: no debería haber errores rojos en flujo feliz.

---

## 6.15. Diferencia entre “estado en cliente” y “estado en servidor”

- **Servidor**: la lista “oficial” para cualquier otro cliente que conecte (otro navegador, otro dispositivo).
- **Cliente**: copia para pintar rápido y filtrar sin ir al servidor a cada tecla.

TaskFlow **re-sincroniza** al cargar con `getTasks()` y tras operaciones que modifican datos. Si implementaras edición colaborativa en tiempo real, añadirías WebSockets o polling; aquí no aplica.

---

Continúa con **07-proyectos-para-practicar.md** para ideas de práctica guiada (ampliado con historias de usuario y criterios).
