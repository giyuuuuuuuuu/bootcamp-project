# 4. Cliente HTTP: `src/api/client.js`

Este archivo es el **único lugar** donde el frontend habla con la API usando `fetch`. Centralizar aquí tiene ventajas:

- Un solo sitio para timeouts, parseo JSON y errores.
- Las funciones de `app.js` no conocen URLs largas ni detalles HTTP.

---

## 4.1. Constantes

```javascript
const LOCAL_API_ORIGIN = "http://localhost:3000";
const PRODUCTION_API_BASE_PATH = "/api/v1/tasks";
const REQUEST_TIMEOUT_MS = 15000;
```

| Constante | Significado |
|-----------|-------------|
| `LOCAL_API_ORIGIN` | Base del servidor Express en desarrollo. |
| `PRODUCTION_API_BASE_PATH` | Ruta **relativa** en producción (mismo dominio que el HTML en Vercel). |
| `REQUEST_TIMEOUT_MS` | Si la respuesta tarda más de 15 s, se cancela la petición. |

---

## 4.2. `getBaseUrl()`

```javascript
function getBaseUrl() {
  const hostname = window.location.hostname;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  if (isLocalhost) {
    return `${LOCAL_API_ORIGIN}/api/v1/tasks`;
  }

  return PRODUCTION_API_BASE_PATH;
}
```

**Idea**: en local el frontend y la API suelen estar en **orígenes distintos** (p. ej. puerto 5500 vs 3000), así que hace falta la URL absoluta `http://localhost:3000/api/v1/tasks`.

En **producción** (Vercel), el HTML y la API suelen servirse del **mismo host**; basta la ruta relativa `/api/v1/tasks` (el navegador completa el dominio).

```
Desarrollo:
  Página: http://127.0.0.1:5500/index.html
  API:    http://localhost:3000/api/v1/tasks

Producción (ejemplo):
  Página: https://mi-app.vercel.app/
  API:    https://mi-app.vercel.app/api/v1/tasks
```

`BASE_URL` se calcula **una vez** al cargar el módulo.

---

## 4.3. `request(url, options = {})` — núcleo

Pasos:

1. **`AbortController`**: permite cancelar la petición manualmente.
2. **`setTimeout`**: al cumplirse `REQUEST_TIMEOUT_MS`, llama `controller.abort()`.
3. **`fetch(url, { ...options, signal })`**: petición HTTP.
4. **`catch`**: si el error es `AbortError`, lanza un `Error` con mensaje de timeout y `status = 408`.
5. Lee el cuerpo como **texto** primero (`response.text()`), no asume JSON.
6. Decide si puede ser JSON mirando `Content-Type` o si el texto empieza por `{` o `[`.
7. **`response.ok`**: si es `false`, construye un `Error` con mensaje del servidor (`payload.error`) o genérico, y adjunta `error.status = response.status`.
8. **`204 No Content`**: respuesta válida sin cuerpo → devuelve `null` (típico en DELETE exitoso).
9. Si había JSON parseable, lo devuelve.
10. Si el servidor respondió OK pero no hay JSON útil, lanza error de respuesta inesperada.

### Por qué leer primero como texto

A veces un proxy o un error de despliegue devuelve **HTML** (página de error) con código 200. Parsear eso como JSON fallaría de formas confusas; el código intenta ser explícito en el mensaje de error.

---

## 4.4. Funciones exportadas (API pública del módulo)

Todas son `async` y devuelven lo que devuelve `request`.

| Función | HTTP | Ruta efectiva |
|---------|------|----------------|
| `getTasks()` | GET | `BASE_URL` |
| `createTask(data)` | POST | `BASE_URL` con `body: JSON.stringify(data)` |
| `deleteTask(id)` | DELETE | `BASE_URL/${encodeURIComponent(id)}` |
| `updateTask(id, data)` | PUT | `BASE_URL/${id}` con JSON |
| `completeAllTasks()` | POST | `BASE_URL/actions/complete-all` |
| `clearCompletedTasks()` | DELETE | `BASE_URL/actions/completed` |

**`encodeURIComponent(id)`** evita que caracteres especiales en el id rompan la URL.

### Ejemplo de cuerpo en `createTask`

```javascript
await createTask({
  title: "Estudiar",
  category: "study",
  description: "Capítulo 3",
});
```

Equivale a enviar un JSON con esos tres campos en el **body** del POST.

### Ejemplo de `updateTask`

```javascript
await updateTask("5", { completed: true });
await updateTask("5", { title: "Nuevo título", description: "" });
```

El backend solo actualiza campos presentes en el objeto (ver controlador).

---

## 4.5. Diagrama: una llamada desde el botón hasta el servidor

```
app.js  →  createTask(payload)
              ↓
client.js  →  request(BASE_URL, { method: "POST", body: JSON.stringify(payload), headers: {...} })
              ↓
         fetch → red → Express → task.controller → task.service
              ↓
         JSON de la tarea creada
              ↓
app.js  →  normalizeTask → tasks.unshift → renderTasks
```

---

## 4.6. Errores que puede “ver” el usuario

| Situación | Comportamiento en `client.js` | Qué hace `app.js` |
|-----------|------------------------------|-------------------|
| Red caída | `fetch` lanza; puede no tener `status` | `handleNetworkError` |
| Timeout | Error con mensaje de tiempo agotado, `status 408` | Toast con mensaje |
| 400/404/500 con JSON `{ error: "..." }` | Lanza `Error` con ese texto y `status` | Toast |

---

## 4.7. `AbortController` explicado con manos

`AbortController` es un objeto con:

- `signal`: lo pasas a `fetch` como `{ signal: controller.signal }`.
- `abort()`: al llamarlo, la petición en curso se **cancela** y `fetch` rechaza con `AbortError`.

En TaskFlow, un `setTimeout` llama a `abort()` a los 15 s:

```text
tiempo 0ms     → fetch empieza
tiempo 15000ms → abort() si aún no hay respuesta
```

**Por qué importa**: sin timeout, un servidor colgado podría dejar al usuario esperando indefinidamente.

---

## 4.8. Lectura del cuerpo: `response.text()` antes que `.json()`

El código hace:

```javascript
const responseText = response.status === 204 ? "" : await response.text();
```

**Motivos**:

1. **Un solo parseo**: decides tú si aplica `JSON.parse` o no.
2. **Errores legibles**: si el servidor devolvió HTML de error, el texto sigue disponible para mensajes.
3. **204**: no hay cuerpo; evitas parsear.

Tras tener `responseText`, se decide si parece JSON (`content-type` o empieza por `{` / `[`).

---

## 4.9. Tabla de decisión después de `fetch`

```
                    ┌─ response.ok? ─┐
                    │                │
                   sí               no
                    │                │
                    ▼                ▼
              ¿status 204?     Construir Error
                    │          con payload?.error
                   sí/no              │
                    │                 throw
                    ▼
              ¿payload JSON?
                    │
                    ▼
              return objeto o null
```

Si `!response.ok`, **no** devuelves el JSON al resto de la app: lanzas error para que `app.js` entre en `catch`.

---

## 4.10. Ejemplo de traza mental: `updateTask("2", { completed: true })`

1. URL final: `BASE_URL + "/2"` → ojo, en el código es `` `${BASE_URL}/${id}` ``; si `BASE_URL` ya termina sin slash y `id` es `2`, queda bien.
2. Método `PUT`, cabecera `Content-Type: application/json`.
3. Cuerpo: `{"completed":true}` (solo el campo que quieres cambiar).
4. Servidor valida y devuelve 200 + tarea completa actualizada.
5. `request` devuelve el objeto parseado; `app.js` hace `normalizeTask` y actualiza memoria.

---

## 4.11. `encodeURIComponent` en `deleteTask`

Si el `id` tuviera caracteres raros (espacio, `/`, unicode), la URL podría romperse. `encodeURIComponent` los escapa según reglas de URL.

Para ids simples `"1"`, `"2"`, no cambia nada visible; es **defensa en profundidad**.

---

## 4.12. Por qué `BASE_URL` se calcula una sola vez

```javascript
const BASE_URL = getBaseUrl();
```

`getBaseUrl()` solo depende de `window.location` al **cargar la página**. No cambia mientras el usuario usa la app en la misma pestaña. Calcularlo una vez evita trabajo repetido (micro-optimización, pero también claridad: “la base es fija en esta sesión”).

---

## 4.13. Qué ocurre si mezclas HTTP y HTTPS (mixed content)

Si la página se sirve por **HTTPS** y tu `LOCAL_API_ORIGIN` fuera `http://localhost`, el navegador puede bloquear la petición (contenido mixto). En desarrollo local sueles tener todo en HTTP o usar proxies. En TaskFlow, la rama de producción usa rutas relativas `/api/...` bajo el mismo esquema que la página → evita ese problema.

---

## 4.14. Extender el cliente: añadir un header de autenticación (ejemplo futuro)

Patrón habitual:

```javascript
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};
return request(url, { ...options, headers: { ...options.headers, ...headers } });
```

TaskFlow **no** usa tokens; el ejemplo es para cuando pases a APIs protegidas.

---

## 4.15. Relación con `handleNetworkError` en `app.js`

`client.js` garantiza que los errores “típicos” tengan `.message` y a menudo `.status`. `handleNetworkError` lee:

```javascript
const status = error.status || 0;
const message = error.message || "Error de conexión";
```

Si en el futuro añadieras más campos (`error.code`), podrías ramificar la UI sin tocar cada llamada individual si todas pasan por `request`.

---

Con esto ya sabes **qué hace cada función** del cliente y **por qué** está escrita así. El backend que responde a estas rutas está en `server/` y se explica en **05-backend-express.md**.
