# TaskFlow — Bootcamp Project

**Estado del proyecto:** cerrado (versión final de bootcamp).  
Aplicación **full-stack** de gestión de tareas: frontend estático con JavaScript modular, backend **Node.js + Express** (API REST), datos en **memoria** en el servidor, y despliegue opcional en **Vercel**.

---

## Características entregadas

- **CRUD completo** de tareas vía API: crear, listar, actualizar (título, descripción, completado, categoría), eliminar.
- **Categorías** (`personal`, `work`, `study`, `health`) con badges de color y **filtro por categoría** en el panel lateral.
- **Filtros de estado**: todas / pendientes / completadas.
- **Búsqueda** por título con debounce para no saturar el renderizado.
- **Ordenación**: más recientes, más antiguas, A-Z, pendientes primero.
- **Acciones masivas**: marcar todas como completadas; eliminar todas las completadas (con confirmación).
- **Modales** nativos (`<dialog>`): edición de título/descripción; confirmación antes de borrados masivos o eliminar una tarea.
- **Toasts** no bloqueantes para feedback de acciones.
- **Tema claro / oscuro** con persistencia en `localStorage` y **animación de transición** (fade) al alternar, respetando `prefers-reduced-motion`.
- **Selects personalizados** (categoría y orden) para unificar bordes y radios con la UI.
- **Atajos de teclado**: `/` (búsqueda), `n` (nueva tarea), `Escape` (cerrar desplegable activo o modal de edición).
- **Cliente HTTP centralizado** (`src/api/client.js`): `fetch`, timeout, manejo de errores y JSON.
- **CORS** configurado en Express para desarrollo local y despliegue.
- **Documentación extensa** para estudiantes en la carpeta [`tuto/`](./tuto/).

---

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| Frontend | HTML5, CSS (`style.css`), **Tailwind CSS** (CDN), **JavaScript ES modules** (`app.js`, `src/api/client.js`) |
| Backend | **Node.js**, **Express 5**, `cors`, `dotenv` |
| Despliegue | **Vercel** (`vercel.json`, función serverless `api/[[...path]].js` que reutiliza la app Express) |

**Nota:** las tareas **no** se guardan en `localStorage` del navegador; viven en el **servidor** (array en RAM). Si reinicias el proceso del servidor, se pierden los datos. Solo el **tema** (claro/oscuro) usa `localStorage`.

---

## Documentación (`/tuto`)

Guía detallada pensada para quien empieza: glosario, HTML/CSS, **funciones de `app.js`**, cliente `fetch`, backend Express, integración, proyectos de práctica y FAQ.

| Documento | Contenido |
|-----------|-----------|
| [`tuto/INDICE.md`](./tuto/INDICE.md) | Índice general y mapa de lectura |
| [`tuto/01-glosario-y-conceptos.md`](./tuto/01-glosario-y-conceptos.md) | HTTP, REST, JSON, CORS, async/await, DOM, etc. |
| [`tuto/02-frontend-html-css.md`](./tuto/02-frontend-html-css.md) | `index.html`, Tailwind, `style.css` |
| [`tuto/03-javascript-frontend-funciones.md`](./tuto/03-javascript-frontend-funciones.md) | Lógica de `app.js` |
| [`tuto/04-cliente-api-fetch.md`](./tuto/04-cliente-api-fetch.md) | `src/api/client.js` |
| [`tuto/05-backend-express.md`](./tuto/05-backend-express.md) | Servidor, rutas, controlador, servicio |
| [`tuto/06-integracion-completa.md`](./tuto/06-integracion-completa.md) | Flujo cliente ↔ servidor, Vercel |
| [`tuto/07-proyectos-para-practicar.md`](./tuto/07-proyectos-para-practicar.md) | Ideas de proyectos similares |
| [`tuto/08-preguntas-frecuentes-y-ejercicios.md`](./tuto/08-preguntas-frecuentes-y-ejercicios.md) | FAQ y mini-ejercicios |

---

## Estructura del repositorio

```text
booptcamp-project/
├── index.html                 # Interfaz principal
├── style.css                  # Estilos propios (componentes, tema, toasts, selects…)
├── app.js                     # Lógica de UI, eventos, renderizado
├── src/api/client.js          # Cliente HTTP (fetch) hacia la API
├── api/[[...path]].js         # Entrada serverless Vercel → Express
├── vercel.json                # Rutas y configuración de despliegue
├── package.json               # Dependencias raíz (p. ej. integración Vercel)
├── README.md                  # Este archivo
├── tuto/                      # Documentación pedagógica
├── docs/                      # Notas adicionales (p. ej. ai/, design/)
└── server/
    ├── package.json
    └── src/
        ├── index.js           # Arranque del servidor (puerto)
        ├── app.js             # Express: CORS, JSON, rutas, errores
        ├── config/env.js      # Puerto y dotenv
        ├── routes/task.routes.js
        ├── controllers/task.controller.js
        └── services/task.service.js   # Almacenamiento en memoria
```

---

## Cómo ejecutarlo en local

### 1) Backend (API)

```bash
cd server
npm install
```

Crea un archivo `server/.env` con al menos:

```env
PORT=3000
```

Arranca el servidor:

```bash
npm run dev
```

Deberías ver algo como `Server running on port 3000`. La API queda en `http://localhost:3000/api/v1/tasks` (y rutas bajo ese prefijo).

### 2) Frontend

Abre `index.html` con un servidor estático (no uses `file://` si quieres evitar problemas con módulos ES y CORS). Por ejemplo, con **Live Server** en VS Code, suele servir en `http://127.0.0.1:5500`.

El cliente usa `http://localhost:3000` como origen de la API cuando el hostname es localhost (ver `getBaseUrl()` en `src/api/client.js`).

### 3) Comprobar salud del backend

```http
GET http://localhost:3000/health
```

---

## API (resumen)

Prefijo base: `/api/v1/tasks`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar tareas |
| `POST` | `/` | Crear tarea (body JSON: `title`, `category`, `description`) |
| `PUT` | `/:id` | Actualizar tarea |
| `DELETE` | `/:id` | Eliminar tarea (`204` sin cuerpo) |
| `POST` | `/actions/complete-all` | Marcar todas completadas |
| `DELETE` | `/actions/completed` | Eliminar todas las completadas |

Colección Postman de referencia: `server/postman/tasks-api.collection.json`.

---

## Roadmap — estado final del proyecto (cierre bootcamp)

Todos los ítems siguientes forman el **alcance alcanzado** en esta versión final:

- [x] **Modelo de tareas** con título, descripción opcional, categoría, estado completado y fecha de creación.
- [x] **API REST** con Express, validación de entrada y códigos HTTP coherentes (`200`, `201`, `204`, `400`, `404`, etc.).
- [x] **Categorías** con etiquetas visuales y colores (claro/oscuro).
- [x] **Filtro por categoría** en el panel lateral.
- [x] **Filtros** todas / pendientes / completadas.
- [x] **Búsqueda** en tiempo real (con debounce).
- [x] **Ordenación** múltiple (reciente, antigua, A-Z, pendientes primero).
- [x] **Acciones masivas** (completar todas, borrar completadas) con confirmación cuando aplica.
- [x] **Cliente HTTP único** (`src/api/client.js`) con timeout y manejo de errores.
- [x] **Modales** de edición y confirmación; toasts de feedback.
- [x] **Tema** claro/oscuro persistente + animación al cambiar.
- [x] **Selects** de categoría y orden con UI personalizada alineada al diseño.
- [x] **CORS** para desarrollo y producción.
- [x] **Despliegue** documentado (Vercel + rutas `/api`).
- [x] **Documentación pedagógica** en `/tuto` (glosario, frontend, backend, integración, prácticas, FAQ).

### Extensiones no incluidas en este cierre (posible evolución futura)

No forman parte de la entrega final; se listan solo como orientación:

- Edición de **categoría** desde el modal de edición (hoy solo título y descripción; la categoría se define al crear).
- **Fechas de vencimiento** y recordatorios.
- **Exportación** PDF/CSV desde el cliente.
- **Firebase** u otro backend en la nube (sustituir o complementar la API actual).
- **Persistencia durable** (base de datos) en lugar del array en RAM.

---

## Despliegue (referencia)

Ejemplo de despliegue en Vercel (ajusta al dominio real de tu proyecto):

**`https://bootcamp-project-lemon.vercel.app`**.

Tras el deploy, el frontend debe usar rutas relativas `/api/v1/tasks` (mismo origen), tal como resuelve `getBaseUrl()` fuera de localhost.

---

## Notas adicionales

- **Lighthouse / accesibilidad:** el README histórico citaba una puntuación concreta; conviene volver a ejecutar Lighthouse en tu entorno actual para un número vigente.
- **MCP en Cursor:** si usas servidores MCP (`fetch`, `github`, `filesystem`), la configuración suele vivir en `.cursor/mcp.json`; no subas tokens al repositorio. Los detalles largos de instalación en Windows pueden mantenerse en documentación interna o en `docs/` si lo necesitas.

---

## Licencia y uso educativo

Proyecto con fines de **aprendizaje** (bootcamp). Reutiliza y adapta el código según las condiciones de tu curso o equipo.

---

*Fin del desarrollo planificado para este repositorio. Para profundizar en cada parte del código, empieza por [`tuto/INDICE.md`](./tuto/INDICE.md).*
