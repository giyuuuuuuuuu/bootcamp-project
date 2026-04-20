# 3. JavaScript del frontend: `app.js` función por función

Archivo: `app.js`. Se carga como **módulo ES** e importa funciones desde `./src/api/client.js`.

Al inicio se obtienen **referencias al DOM** (`getElementById`, `querySelector`, etc.) para no repetir búsquedas costosas cada vez.

---

## 3.1. Imports (líneas 1–8)

```javascript
import {
  clearCompletedTasks,
  completeAllTasks,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./src/api/client.js";
```

| Símbolo importado | Rol |
|-------------------|-----|
| `getTasks` | `GET` → lista de tareas |
| `createTask` | `POST` → crear tarea |
| `updateTask` | `PUT` → actualizar una tarea |
| `deleteTask` | `DELETE` → borrar una tarea |
| `completeAllTasks` | `POST` acción masiva: marcar todas completadas |
| `clearCompletedTasks` | `DELETE` acción masiva: borrar completadas |

---

## 3.2. Constantes y estado global (aprox. líneas 41–71)

| Nombre | Qué guarda |
|--------|------------|
| `DEFAULT_CATEGORY` | Categoría por defecto al resetear el formulario (`"personal"`). |
| `TASK_INPUT_DEFAULT_BORDER` / `TASK_INPUT_ERROR_BORDER` | Colores de borde del input título (normal vs error). |
| `THEME_STORAGE_KEY` | Clave en `localStorage` para el tema. |
| `SEARCH_THROTTLE_MS` | Retraso antes de volver a filtrar al escribir en búsqueda (evita renderizar a cada tecla). |
| `MAX_VISIBLE_TOASTS` | Máximo de toasts simultáneos. |
| `CATEGORY_LABELS` | Mapa código → etiqueta visible en español. |

Variables `let`:

| Variable | Rol |
|----------|-----|
| `tasks` | Copia local de todas las tareas (sincronizada con el servidor al cargar y tras cada operación). |
| `taskToEdit` | Tarea que se está editando en el modal, o `null`. |
| `currentFilter` | `"all"` \| `"completed"` \| `"pending"`. |
| `searchQuery` | Texto de búsqueda en minúsculas. |
| `currentCategoryFilter` | Categoría seleccionada en el filtro o `"all"`. |
| `currentSort` | Criterio de orden (`recent`, `oldest`, etc.). |
| `networkState` / `networkMessage` | Estado de red (poco visible en UI; toasts sustituyen banner). |
| `highlightedTaskId` | Id de tarea recién creada para animación de entrada. |
| `searchThrottleTimeout` | Id del temporizador de debounce de búsqueda. |
| `renderFrameId` | Id de `requestAnimationFrame` para agrupar repintados. |
| `inFlightTaskIds` | Conjunto de ids con petición en curso (evita doble clic). |
| `confirmModalOpen` | Evita abrir dos modales de confirmación a la vez. |
| `activeCustomSelectClose` / `activeCustomSelectWrap` | Control del desplegable personalizado abierto. |

---

## 3.3. Arranque (líneas 73–77)

```javascript
initCustomSelects();
initializeTheme();
renderTasks();
registerKeyboardShortcuts();
loadTasks();
```

| Llamada | Efecto |
|---------|--------|
| `initCustomSelects()` | Convierte cada `<select class="task-select">` en UI personalizada. |
| `initializeTheme()` | Lee `localStorage` o preferencia del sistema y aplica tema **sin** animación. |
| `renderTasks()` | Pinta la lista (vacía al inicio hasta que lleguen datos). |
| `registerKeyboardShortcuts()` | Atajos `/`, `n`, `Escape`. |
| `loadTasks()` | **Async**: pide tareas al servidor y rellena `tasks`. |

**Orden**: primero UI y tema; luego datos remotos.

---

## 3.4. Manejadores de eventos (resumen)

| Evento | Elemento | Acción principal |
|--------|----------|------------------|
| `click` | `#complete-all-btn` | `completeAllTasksFromApi()` |
| `click` | `#clear-completed-btn` | `clearCompletedTasksFromApi()` |
| `submit` | `#todo-form` | Validar título, `createTask`, actualizar lista |
| `click` | cada `.filter-btn` | Actualizar `currentFilter`, `renderTasks` |
| `input` | `#task-input` | Restaurar borde si había error |
| `input` | `#search-input` | Debounce → `searchQuery` → `renderTasks` |
| `click` | `#clear-search-btn` | Limpiar búsqueda |
| `change` | `#category-filter`, `#sort-select` | Actualizar filtros/orden (select oculto sigue disparando `change`) |
| `click` | `#theme-toggle` | `applyTheme` con opción de fade |
| `click` | `#task-list` (delegación) | Editar, borrar o toggle según clase del objetivo |
| `submit` | `#edit-modal` form | `updateTask` |
| `click` | `#cancel-edit` | `closeEditModal` |

---

## 3.5. `loadTasks(successMessage = "")`

- Llama `await getTasks()`.
- Normaliza cada tarea con `normalizeTask`.
- Asigna `tasks`, opcionalmente muestra toast de éxito.
- Llama `renderTasks()`.
- En `catch`, `handleNetworkError(error)`.

---

## 3.6. `deleteTaskById(taskId, deleteButton)`

1. Evita reentrada con `inFlightTaskIds`.
2. Busca el título para el mensaje del modal.
3. `openConfirmModal({...})` devuelve una **Promesa** `true`/`false`.
4. Si el usuario cancela, termina.
5. Anima salida con `animateTaskRemoval`, luego `deleteTask(taskId)` en la API.
6. `removeTaskFromMemory`, `renderTasks`, toast.
7. Si falla la API, vuelve a renderizar y muestra error.

---

## 3.7. `toggleTaskState(taskId)`

- Encuentra la tarea, llama `updateTask(id, { completed: !task.completed })`.
- Actualiza memoria con `upsertTaskInMemory` y repinta.

---

## 3.8. `completeAllTasksFromApi()`

- `setButtonLoading` en el botón.
- `await completeAllTasks()` (servidor marca todas completadas).
- Actualiza todas las tareas en memoria a `completed: true` (coherencia con respuesta del patrón usado aquí).
- `renderTasks`, toast.

---

## 3.9. `clearCompletedTasksFromApi()`

- Si no hay completadas, toast informativo.
- Modal de confirmación.
- `animateTasksRemoval` sobre los ids completados.
- `await clearCompletedTasks()`, filtra `tasks`, `renderTasks`.

---

## 3.10. `openEditModalById(taskId)` / `closeEditModal()`

- `open`: localiza la tarea, rellena inputs, `editModal.showModal()`.
- `close`: `editModal.close()`, limpia variables e inputs.

---

## 3.11. `openConfirmModal({ title, message, acceptLabel, acceptVariant })`

Devuelve una **Promesa** que:

- Resuelve `true` si el usuario acepta.
- Resuelve `false` si cancela o cierra el diálogo.

Implementación: registra listeners **una vez** por apertura y los elimina en `cleanup` para no acumular memoria.

---

## 3.12. `setButtonLoading(button, isLoading, loadingText)`

- Si `isLoading`: guarda texto original en `dataset.originalText`, deshabilita, inserta spinner HTML.
- Si no: restaura texto, quita clases y anchos mínimos.

---

## 3.13. `normalizeTask(task)`

Convierte la respuesta del servidor a un **formato estable** en el cliente:

- `id` siempre string.
- `description` con `normalizeDescription`.
- `completed` como booleano.
- `category` con `getSafeCategory`.
- `createdAt` string ISO; si falta, intenta derivar del `id` numérico o usa fecha actual.

---

## 3.14. `getSafeCategory(category)`

Si la categoría no está en `CATEGORY_LABELS`, devuelve `DEFAULT_CATEGORY`.

---

## 3.15. `isMeaningfulTitle(title)`

Expresión regular Unicode: debe contener al menos una letra (`\p{L}`) o número (`\p{N}`). Evita títulos vacíos o solo espacios/símbolos sin contenido útil.

---

## 3.16. `normalizeDescription(description)`

Si no es string, `""`; si no, `trim()`.

---

## 3.17. `upsertTaskInMemory(taskToUpsert)`

- Si existe índice con mismo `id`, fusiona objetos.
- Si no, hace `unshift` (añade al principio).

---

## 3.18. `removeTaskFromMemory(taskId)`

Filtra quitando el id dado.

---

## 3.19. `matchesCurrentFilters(task)`

Combina tres condiciones:

1. Filtro de estado (todas / hechas / pendientes).
2. `searchQuery` contenido en `title` (minúsculas).
3. Categoría o “todas”.

---

## 3.20. `renderTasks()` y `renderTasksNow()`

- `renderTasks` usa `requestAnimationFrame` para **colapsar** múltiples llamadas en un solo frame (rendimiento).
- `renderTasksNow`:
  - Filtra con `matchesCurrentFilters`.
  - Ordena con `sortTasks`.
  - Si vacío: `renderEmptyState` + `updateStats`.
  - Si no: clona `task-template` por cada tarea, rellena texto, dataset ids, clases completado, animación `task-enter` si es la destacada.
  - `replaceChildren` del `ul` con un `DocumentFragment`.
  - `updateStats`, resetea `highlightedTaskId`.

---

## 3.21. `animateTaskRemoval` / `animateTasksRemoval`

- Añade clase `task-removing` (transición CSS a opacidad 0 / movimiento).
- Si `prefers-reduced-motion`, aplica clase sin esperar animación larga.
- Usa `transitionend` + timeout de seguridad por cada ítem.
- Devuelve `Promise` para poder `await` antes del `DELETE` en red.

---

## 3.22. `renderEmptyState()`

Crea un `<li>` con mensaje de lista vacía (filtros demasiado estrictos o sin tareas).

---

## 3.23. `sortTasks(list)`

Según `currentSort`:

| Valor | Comportamiento |
|-------|----------------|
| `oldest` | Por fecha `createdAt` ascendente |
| `alphabetical` | `localeCompare` en español |
| `status` | Pendientes antes (comparando `completed`) |
| default (`recent`) | Por fecha descendente |

`toTimestamp` parsea `createdAt` o usa el número del `id` como fallback.

---

## 3.24. `setNetworkState` / `clearNetworkMessage`

Gestión ligera de estado de red (el banner detallado está comentado en favor de toasts).

---

## 3.25. `handleNetworkError(error)`

Lee `error.status` y `error.message` (definidos en `client.js`), muestra toast de error y actualiza estado.

---

## 3.26. `applyTheme(theme, withFade = false)`

- **`withFade === false`** (carga inicial): clase `theme-switching`, cambia clase `dark` en `<html>`, icono, `localStorage`, quita `theme-switching` a los 140 ms.
- **`withFade === true`**: secuencia de opacidad del `body` (fade out → cambio de tema con `theme-fade-hold` → fade in), respeta `prefers-reduced-motion` desde el **llamador** (el botón no pasa fade si el usuario pidió reducir movimiento).

Funciones internas: `persist`, `commitTheme`.

---

## 3.27. `initializeTheme()`

Lee `getStoredTheme()`; si hay valor guardado, lo aplica; si no, usa `prefers-color-scheme: dark`.

---

## 3.28. `getStoredTheme()`

`localStorage.getItem` con validación `"dark"` o `"light"`; si falla (modo privado), devuelve `null`.

---

## 3.29. `updateStats()`

Cuenta total, completadas y pendientes; escribe en los `span` del aside.

---

## 3.30. `showToast(message, type)`

- Crea un `div` con clase `toast toast-success|error|info`.
- Limita cantidad con `MAX_VISIBLE_TOASTS`.
- Tras 2 s añade `toast-leaving` y luego elimina el nodo.

---

## 3.31. `registerKeyboardShortcuts()`

- `Escape`: cierra desplegable personalizado o modal de edición.
- `/`: enfoca búsqueda (si no estás escribiendo en input).
- `n`: enfoca campo de nueva tarea (misma condición).

---

## 3.32. `initCustomSelects()`

- Una sola vez: listener global de `click` para cerrar el desplegable al pulsar fuera.
- Recorre `select.task-select` y llama `enhanceTaskSelect` en cada uno.

---

## 3.33. `enhanceTaskSelect(selectEl)`

Transforma un `<select>` en:

1. Un `div.custom-select` envolvente.
2. Un `button.custom-select-trigger` con el valor visible.
3. Un `div.custom-select-panel` con botones por opción.
4. El `<select>` original pasa a `select-native-hidden` pero mantiene el `value` y dispara `change` para reutilizar los mismos listeners de `app.js`.

Funciones internas:

| Función | Rol |
|---------|-----|
| `syncFromSelect` | Actualiza texto del trigger y estado `is-selected` en opciones. |
| `close` | Cierra panel y limpia referencias globales. |
| `open` | Cierra otro desplegable si hacía falta, abre el actual. |

También reasigna `label[for="id"]` al `id` del botón para accesibilidad.

---

## 3.34. Flujo simplificado: crear una tarea

```
Usuario rellena formulario → submit
    → preventDefault
    → validación isMeaningfulTitle
    → createTask({ title, category, description })  [red]
    ← tarea creada
    → normalizeTask, unshift en tasks
    → renderTasks, toast
```

(“[red]” = petición de red asíncrona.)

---

# Parte II — Profundización (léelo cuando ya hayas recorrido el código una vez)

## 3.35. Por qué se guardan referencias al DOM al inicio

Patrón:

```javascript
const taskList = document.getElementById("task-list");
```

**Motivos**:

1. **Coste**: `getElementById` recorre o indexa el árbol; hacerlo en cada render sería desperdicio.
2. **Claridad**: al leer el archivo, ves un “índice” de todos los elementos con los que interactúa el script.
3. **Invariante**: esos nodos existen porque el `<script>` va al final del `body` (después del HTML que los define).

Si movieras el script al `<head>` sin `defer`, esas llamadas fallarían porque el DOM aún no existiría.

---

## 3.36. El objeto `event` en los listeners

Cuando escribes `addEventListener("submit", async (event) => { ... })`, el navegador pasa un objeto **`event`** con propiedades útiles:

| Propiedad | Ejemplo de uso en TaskFlow |
|-----------|----------------------------|
| `event.preventDefault()` | Evita el envío clásico del formulario (recarga de página). |
| `event.target` | En búsqueda, `event.target.value` es el texto del input. |
| `event.key` | Atajos de teclado (`Escape`, `/`, `n`). |

En la lista de tareas, el listener está en el **padre**; `event.target` puede ser el botón, el texto del botón, etc. Por eso se usa `classList.contains` en el target (o `closest` en variantes más robustas).

---

## 3.37. `dataset` y por qué los ids van como strings

Los atributos HTML `data-id="5"` se leen en JS como `element.dataset.id` (siempre **string**). El código compara con `String(task.id)` para no mezclar tipos (`5` número vs `"5"` string) al comparar con `===`.

**Bug típico de principiante**: `dataset.id === task.id` falla si uno es número y otro string.

---

## 3.38. `inFlightTaskIds`: patrón “mutex” ligero

Antes de llamar a la API para la tarea `id`, se hace:

```javascript
if (inFlightTaskIds.has(normalizedTaskId)) return;
inFlightTaskIds.add(normalizedTaskId);
// ... await ...
finally {
  inFlightTaskIds.delete(normalizedTaskId);
}
```

Esto evita **doble envío** si el usuario hace doble clic muy rápido o el checkbox dispara dos eventos raros. Es un “cerrojo” por tarea.

---

## 3.39. `openConfirmModal` y el patrón Promise + cleanup

La función devuelve `new Promise((resolve) => { ... })`. Dentro se registran listeners **locales** a cada apertura:

- Si el usuario pulsa Aceptar → `resolve(true)` y se limpian listeners.
- Si pulsa Cancelar o cierra el diálogo → `resolve(false)`.

**Por qué importa el cleanup**: si no quitaras los listeners al cerrar, cada nueva confirmación acumularía manejadores y el modal se volvería impredecible (memory leak + múltiples `resolve`).

`confirmModalOpen` evita abrir un segundo modal si ya hay uno activo y en ese caso devuelve `Promise.resolve(false)` de inmediato.

---

## 3.40. `setButtonLoading`: detalle del `minWidth`

Al poner un spinner, el botón cambia de ancho. Guardar `offsetWidth` en `minWidth` evita que el layout “salte” visualmente mientras está en estado de carga.

---

## 3.41. `normalizeTask`: por qué tantos “parches”

La API debería devolver siempre el mismo formato, pero en la práctica:

- `id` puede venir como número o string según cómo se serialice.
- `createdAt` podría faltar en datos viejos o de prueba.
- `description` podría ser `null`.

`normalizeTask` **centraliza** esas decisiones para que el resto del código asuma un solo shape de objeto.

---

## 3.42. `renderTasks` + `requestAnimationFrame`: anti-thrash

Si diez llamadas seguidas hicieran `renderTasksNow()` síncronamente, repintarías diez veces en el mismo frame. En su lugar:

```javascript
function renderTasks() {
  if (renderFrameId !== null) return;
  renderFrameId = window.requestAnimationFrame(() => {
    renderFrameId = null;
    renderTasksNow();
  });
}
```

La primera llamada programa un frame; las siguientes **no encolan otro** hasta que el primero se ejecutó (`renderFrameId` vuelve a `null`). Es una forma simple de **coalescer** actualizaciones.

---

## 3.43. `sortTasks` y `localeCompare`

```javascript
a.title.localeCompare(b.title, "es")
```

El segundo argumento (`"es"`) pide reglas de ordenación del español (ñ, acentos). Sin eso, el orden alfabético podría no coincidir con lo que espera un usuario hispanohablante.

---

## 3.44. `animateTasksRemoval`: Promesa + `transitionend`

La función devuelve una `Promise` que se resuelve cuando **todas** las tarjetas han terminado su animación de salida (o timeout de seguridad). Así `deleteTaskById` puede:

1. Animar salida.
2. **Solo después** llamar `DELETE` en la red.

**Orden importante**: si borraras en el servidor antes de animar, un fallo de red dejaría la UI incoherente; aquí la animación es primero UX, luego persistencia (y si el DELETE falla, se vuelve a `renderTasks()` para restaurar).

---

## 3.45. `applyTheme`: máquina de estados en palabras

Con `withFade === true`, el `<html>` pasa por clases como `theme-crossfade`, `theme-fade-step-out`, `theme-fade-hold`, `theme-fade-step-in`. La secuencia garantiza:

1. Opacidad del `body` baja (fade out).
2. Se cambia la clase `dark` **cuando** la pantalla está oscurecida (menos flash visual).
3. Opacidad sube (fade in).

`theme-switching` durante el commit desactiva transiciones en hijos para que los colores no “animen” de forma extraña.

---

## 3.46. `enhanceTaskSelect` y **closures** (cierre léxico)

Las funciones internas `open`, `close`, `syncFromSelect` “recuerdan” las variables `selectEl`, `trigger`, `panel`, `wrap` del ámbito de `enhanceTaskSelect` aunque se ejecuten más tarde en respuesta a clics. Eso es un **closure**: el estándar de JavaScript para asociar estado a UI sin crear clases.

Cada select del HTML obtiene **su propio** cierre con sus propias variables; no se mezclan entre sí.

---

## 3.47. Por qué el `<select>` sigue existiendo oculto

Ventajas de mantener el `<select>` real:

1. Los listeners en `app.js` siguen siendo `categoryFilter.addEventListener("change", ...)`.
2. El valor se puede leer con `.value` igual que antes.
3. Si un día quitas el JS de mejora, el select nativo sigue funcionando (degradación elegante).

El coste es mantener sincronizados trigger visual y select oculto (`syncFromSelect`).

---

## 3.48. Flujo: editar tarea (secuencia)

```
Clic Editar → openEditModalById
    → rellena inputs, showModal
Usuario edita → Guardar (submit)
    → updateTask en API
    → upsertTaskInMemory, closeEditModal, renderTasks
```

`inFlightTaskIds` también protege el guardado si el usuario reintenta rápido.

---

## 3.49. Flujo: marcar todas completadas

```
Clic → completeAllTasksFromApi
    → POST actions/complete-all
    → en memoria local: todas completed true
    → renderTasks
```

**Nota**: la lista en cliente se fuerza a completada para alinearse rápido; en un sistema crítico podrías volver a `getTasks()` para confirmar el estado del servidor.

---

## 3.50. Errores comunes al modificar `app.js`

| Síntoma | Posible causa |
|---------|----------------|
| “Cannot read property X of null” | Un `getElementById` no encontró el id (typo o DOM no listo). |
| Listas que no actualizan | Olvidaste `renderTasks()` tras mutar `tasks`. |
| Doble toast o doble DELETE | Listener duplicado por pegar código dos veces sin quitar el anterior. |
| Tema que no persiste | `localStorage` bloqueado o modo privado con restricciones. |

---

## 3.51. Cómo depurar paso a paso (sin herramientas caras)

1. Pon `console.log` **solo** en el handler del evento (p. ej. al inicio del `submit`).
2. Confirma que el handler se ejecuta (si no, el selector o el elemento están mal).
3. Pon `console.log` justo **antes** y **después** del `await` a la API.
4. En la pestaña **Network**, mira status, URL y cuerpo de respuesta.

---

El cliente HTTP (`src/api/client.js`) se documenta en el archivo **04-cliente-api-fetch.md**, ahora ampliado con más detalle línea a línea.
