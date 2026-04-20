# 7. Tres proyectos para practicar (dificultad un poco menor que TaskFlow)

TaskFlow combina: **CRUD** completo, **filtros**, **búsqueda**, **ordenación**, **categorías**, **acciones masivas**, **modales**, **toasts**, **tema claro/oscuro**, **selects personalizados**, **cliente HTTP centralizado**, **Express en capas**, **CORS**, y **despliegue opcional**.

Los proyectos siguientes recortan alcance pero **repiten el mismo tipo de aprendizaje**: REST + JSON, Express, `fetch`, DOM y CSS.

**Dificultad relativa (estimada):**

| Proyecto | Menos que TaskFlow porque… |
|----------|----------------------------|
| A. Lista de enlaces favoritos | Sin categorías múltiples ni orden complejo; un solo recurso simple. |
| B. Notas rápidas (sticky notes) | Sin checkbox de “completado” ni acciones masivas; foco en CRUD + UI. |
| C. Inventario mínimo de productos | Introduce “cantidad” y búsqueda simple; aún sin tanto filtro/UX. |

---

## Proyecto A — “LinkVault”: lista de enlaces favoritos

### Idea

Guardar **título + URL** (y opcionalmente una nota corta). El usuario puede añadir, editar y borrar enlaces. Una sola vista con lista ordenada por fecha de creación (más reciente primero).

### Qué practicas

| Tema | Cómo se simplifica respecto a TaskFlow |
|------|----------------------------------------|
| Modelo de datos | Campos: `id`, `title`, `url`, `note?`, `createdAt`. Sin `completed`, sin categorías con colores. |
| API | `GET/POST /api/v1/links`, `PUT/DELETE /api/v1/links/:id` |
| Frontend | Un formulario, una lista; validación de URL con `new URL(...)` en try/catch |
| UX | Un modal de confirmación para borrar (reutiliza el patrón de `openConfirmModal`) |

### Mini diagrama de entidades

```
Link
├── id: string
├── title: string
├── url: string
├── note: string (opcional)
└── createdAt: ISO string
```

### Extensión opcional (si te aburres)

- Abrir el enlace en nueva pestaña con `target="_blank"` y `rel="noopener noreferrer"`.
- Detectar duplicados de URL en el cliente antes de enviar.

---

## Proyecto B — “StickyBoard”: notas rápidas en columnas o cuadrícula

### Idea

Crear **notas de texto** como tarjetas (título + cuerpo). Solo CRUD: crear, leer lista, editar en modal, borrar. **No** marcar como completadas; **no** borrar masivo.

### Qué practicas

| Tema | Detalle |
|------|---------|
| Backend | Misma estructura Express: `routes` → `controller` → `service` con array en memoria. |
| Frontend | `template` para cada nota; animación suave al añadir (como `task-enter`). |
| Diseño | CSS Grid o flex para una cuadrícula responsive; tema claro/oscuro opcional con una sola variable CSS. |

### Rutas sugeridas

```
GET    /api/v1/notes
POST   /api/v1/notes
PUT    /api/v1/notes/:id
DELETE /api/v1/notes/:id
```

### Por qué es más fácil que TaskFlow

- No hay filtros “todas / hechas / pendientes”.
- No hay `completeAll` ni `clearCompleted`.
- Menos estados en el cliente (`currentFilter`, etc.).

### Diagrama de flujo de datos

```
[ Form nueva nota ] ──POST──► API ──► array notes
                ▲                    │
                └──────GET list──────┘
                         │
                    [ Render grid ]
```

---

## Proyecto C — “MiniStock”: inventario de productos (nombre + cantidad)

### Idea

Cada ítem tiene **nombre**, **cantidad** (entero ≥ 0) y opcionalmente **ubicación** (string). Operaciones: listar, crear, actualizar cantidad con `PUT`, borrar. Búsqueda por **nombre** en el cliente (un solo `input` que filtra al escribir).

### Qué practicas

| Tema | Detalle |
|------|---------|
| Validación servidor | Rechazar cantidad negativa o no numérica; nombre no vacío. |
| Cliente | `input type="number"` o parseo con `Number()` y comprobación `Number.isFinite`. |
| UX | Mostrar total de unidades en el encabezado (suma de cantidades). |

### Modelo

```
Product
├── id
├── name
├── quantity: number
├── location?: string
└── createdAt
```

### Por qué es un poco más fácil que TaskFlow

- Menos vistas (sin ordenar por cuatro criterios; puedes usar solo “nombre A-Z”).
- Sin categorías múltiples ni badges de color (puedes añadir un solo color por defecto).

### Idea de endpoint extra (opcional)

`POST /api/v1/products/:id/adjust` con `{ delta: +1 | -1 }` para botones +/- en la tarjeta (practica validación y reglas de negocio).

---

## Tabla comparativa rápida

| | TaskFlow (tu proyecto) | A LinkVault | B StickyBoard | C MiniStock |
|---|------------------------|-------------|---------------|-------------|
| Recurso principal | Tareas con estado + categoría | Enlaces | Notas | Productos |
| Complejidad UI | Alta | Media | Media | Media |
| Lógica servidor | Media-alta (acciones masivas) | Baja | Baja | Media (números) |

---

## Cómo abordar cualquiera de estos proyectos (pasos sugeridos)

1. **Define el JSON** de un recurso en papel (campos y tipos).
2. **Implementa el servicio** en memoria (array + `nextId`).
3. **Añade rutas y controlador** con validación mínima.
4. **Prueba con Thunder Client / Postman / curl** antes del frontend.
5. **Escribe `client.js`** con `request()` copiando el patrón de TaskFlow.
6. **Monta la UI** estática, luego conecta eventos.
7. **Refina**: errores, loading en botones, un solo estilo de toast.

---

## Recursos que ya dominas gracias a TaskFlow

- Separar **`client.js`** de **`app.js`**.
- Usar **`async/await`** y **`try/catch`** en operaciones de red.
- Mantener una copia local **`tasks`** (o equivalente) sincronizada con el servidor.
- Entender **204** en DELETE y **201** en POST.

Si completas uno de los tres proyectos de principio a fin, habrás **reforzado** el mismo mapa mental sin la sobrecarga de todas las funciones avanzadas de TaskFlow a la vez.

---

# Parte II — Guías ampliadas por proyecto

Cada proyecto incluye: **historias de usuario**, **criterios de aceptación mínimos**, **borrador de API**, **tareas de implementación** y **ideas de mejora**.

---

## Proyecto A — LinkVault (ampliado)

### Historias de usuario

1. Como usuario, quiero **añadir un enlace** con título y URL para encontrarlo después sin buscar en el historial del navegador.
2. Como usuario, quiero **editar** el título o la URL si me equivoqué.
3. Como usuario, quiero **borrar** un enlace con confirmación para no borrar por accidente.
4. Como usuario, quiero ver los enlaces **del más reciente al más antiguo** para ver primero lo que acabo de guardar.

### Criterios de aceptación (mínimo viable)

- [ ] Al recargar la página, los datos persisten **mientras el servidor siga en marcha** (memoria en servidor, igual que TaskFlow).
- [ ] Si la URL no es válida, el **frontend** muestra un mensaje claro antes de llamar a la API (validación con `try { new URL(str); } catch { ... }`).
- [ ] El servidor rechaza títulos vacíos con **400** y JSON `{ error: "..." }`.
- [ ] Lista vacía muestra un mensaje amable, no un error roto.

### Borrador de contrato API (REST)

| Método | Ruta | Cuerpo | Respuesta |
|--------|------|--------|-----------|
| GET | `/api/v1/links` | — | `200` + array |
| POST | `/api/v1/links` | `{ title, url, note? }` | `201` + objeto |
| PUT | `/api/v1/links/:id` | campos parciales | `200` + objeto |
| DELETE | `/api/v1/links/:id` | — | `204` |

### Tareas de implementación (orden sugerido)

1. Carpeta `server` duplicando la estructura de TaskFlow pero con `link.routes`, `link.controller`, `link.service`.
2. Copia `client.js` y renombra funciones (`getLinks`, `createLink`, …).
3. HTML mínimo: formulario + `<ul>`; sin Tailwind al principio si quieres reducir ruido.
4. Conecta eventos; solo al final añade estilos y toasts.

### Mejoras opcionales (subir dificultad)

- Extraer **favicon** automáticamente (petición a un servicio externo o `<img>` con URL de icono conocida) — cuidado con CORS.
- Etiquetas tipo `#trabajo` en el título parseadas a chips.

---

## Proyecto B — StickyBoard (ampliado)

### Historias de usuario

1. Quiero crear **notas cortas** con título y texto largo.
2. Quiero **editar** una nota en un modal o panel lateral.
3. Quiero **borrar** con confirmación.
4. Quiero que la cuadrícula se **adapte al móvil** (una columna) y al escritorio (varias).

### Modelo de datos sugerido

```json
{
  "id": "1",
  "title": "Ideas examen",
  "body": "Repasar capítulos 3 y 4...",
  "createdAt": "2026-04-20T12:00:00.000Z",
  "color": "yellow"
}
```

El campo `color` puede ser opcional (enum de 3–4 colores pastel) para practicar validación en servidor.

### Criterios de aceptación

- [ ] No existe estado “completado”; no copies el checkbox de TaskFlow.
- [ ] Límite de longitud del cuerpo en servidor (como `MAX_DESCRIPTION_LENGTH` en TaskFlow).
- [ ] Animación de entrada suave al crear (reutiliza idea de `task-enter`).

### Retos de UI (sin añadir librerías)

- **CSS Grid**: `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));`
- **Dark mode** con una variable CSS `--card-bg` que cambia con clase en `<html>`.

### Riesgo pedagógico

Es fácil caer en “demasiado CSS bonito, poco REST”. Prioriza: **API estable primero**, pulido visual después.

---

## Proyecto C — MiniStock (ampliado)

### Historias de usuario

1. Registrar **productos** con nombre y cantidad.
2. **Incrementar/decrementar** cantidad sin reescribir el número a mano (botones +1 / −1 en UI que llaman `PUT` con cantidad nueva o endpoint `adjust`).
3. **Buscar** por nombre en el cliente (filtrado al vuelo).
4. Ver **total de unidades** en el encabezado (suma de `quantity`).

### Validación numérica (servidor)

Ejemplos de reglas:

- `quantity` entero, `>= 0`.
- Si envías `delta` negativo que dejaría la cantidad `< 0`, responder **400** con mensaje claro.

### Ejemplo de prueba manual (curl)

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Cuaderno\",\"quantity\":3}"
```

(Adapta ruta/puerto a tu implementación.)

### Extensión “casi TaskFlow”

- Exportar inventario a **CSV** en el cliente (`Blob` + enlace de descarga) — practica strings sin tocar el servidor.

---

## Tabla de autoevaluación (útil para portfolio)

| Habilidad | LinkVault | StickyBoard | MiniStock |
|-----------|-----------|-------------|-----------|
| Diseño REST | ★★☆ | ★★☆ | ★★★ (números) |
| Validación cliente | ★★★ (URL) | ★★☆ | ★★★ |
| DOM dinámico | ★★☆ | ★★★ | ★★☆ |
| CSS layout | ★☆☆ | ★★★ | ★★☆ |

Marca con honestidad qué te costó; repetir ese eje en otro proyecto acelera el aprendizaje.

---

## Proyectos “micro” si aún te saturan los tres

Si necesitas un peldaño **aún menor** antes:

1. **Solo API**: construye el backend de LinkVault y pruébalo con Thunder Client; sin HTML.
2. **Solo frontend falso**: lista estática en HTML + botones que modifican un array en JS **sin** servidor (luego sustituyes por `fetch`).

---

*Fin del tutorial en `/tuto`. Vuelve al [INDICE](./INDICE.md) si necesitas localizar un tema.*
