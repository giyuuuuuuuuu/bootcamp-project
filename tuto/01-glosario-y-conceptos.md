# 1. Glosario y conceptos fundamentales

Este documento define **vocabulario** y **ideas base** que aparecen en todo el proyecto. Si algo aquí no te cuadra, vuelve a leerlo cuando veas el término en el código.

---

## 1.1. Cliente y servidor

```
┌──────────────┐         red (HTTP)         ┌──────────────┐
│   Navegador   │  ─────────────────────►  │   Servidor    │
│  (frontend)  │  ◄─────────────────────  │  (backend)    │
└──────────────┘      JSON / HTML / etc.   └──────────────┘
```

- **Cliente**: normalmente el **navegador** (Chrome, Firefox, Edge) donde el usuario abre `index.html` y se ejecuta JavaScript.
- **Servidor**: un programa que **escucha peticiones** en un puerto (por ejemplo `3000`) y **responde** con datos o errores.

En desarrollo local sueles tener **dos procesos**: uno sirve o abre el HTML (por ejemplo Live Server en el puerto 5500) y otro es la API en el puerto 3000.

---

## 1.2. HTTP (HyperText Transfer Protocol)

Es el **idioma** que usa el navegador para pedir recursos al servidor.

| Concepto | Qué es |
|----------|--------|
| **Método (verbo)** | Tipo de intención: `GET` (leer), `POST` (crear), `PUT`/`PATCH` (actualizar), `DELETE` (borrar). |
| **URL** | Dirección del recurso, p. ej. `http://localhost:3000/api/v1/tasks`. |
| **Cabeceras (headers)** | Metadatos: tipo de contenido (`Content-Type: application/json`), autorización, etc. |
| **Cuerpo (body)** | Datos enviados (típicamente JSON en APIs modernas). |
| **Código de estado** | Número que resume el resultado: `200` OK, `201` creado, `400` error del cliente, `404` no encontrado, `500` error del servidor. |

**Ejemplo mental**: “Quiero la lista de tareas” → `GET /api/v1/tasks` → servidor devuelve `200` y un array JSON.

---

## 1.3. API y REST

- **API (Application Programming Interface)**: contrato formal de **cómo** pedir datos y **qué** recibes. Aquí es una **API HTTP** (no una librería de escritorio).
- **REST**: estilo muy habitual: recursos con URLs claras, métodos HTTP bien usados, respuestas en JSON.

En TaskFlow el recurso principal es **tareas** bajo el prefijo `/api/v1/tasks`.

---

## 1.4. JSON (JavaScript Object Notation)

Formato de texto para intercambiar datos. Parece objetos de JavaScript.

```json
{
  "id": "1",
  "title": "Comprar leche",
  "completed": false,
  "category": "personal",
  "createdAt": "2025-04-20T10:00:00.000Z"
}
```

- En **JavaScript**, `JSON.stringify(objeto)` convierte un objeto a **string** JSON.
- `JSON.parse(string)` hace lo contrario.

---

## 1.5. CORS (Cross-Origin Resource Sharing)

Cuando el HTML se abre desde un **origen** (p. ej. `http://127.0.0.1:5500`) y la API está en **otro** (`http://localhost:3000`), el navegador aplica la **política de mismo origen**. Sin cabeceras CORS adecuadas, el navegador **bloquea** la respuesta aunque el servidor haya contestado.

**Solución en el proyecto**: el servidor usa el middleware `cors` de Express y define qué orígenes pueden llamar a la API.

---

## 1.6. Puerto

Número que identifica un **servicio** dentro de la máquina. Ejemplos:

- `3000`: API Express (por defecto en este proyecto).
- `5500`: Live Server u otro servidor estático para el HTML.

URL típica: `http://localhost:3000` = “máquina local, puerto 3000”.

---

## 1.7. Node.js y npm

- **Node.js**: entorno para ejecutar JavaScript **fuera del navegador**, ideal para servidores y herramientas.
- **npm**: gestor de paquetes; instala librerías listadas en `package.json` (`express`, `cors`, etc.).

El backend del proyecto usa **CommonJS**: `require()` y `module.exports`.

---

## 1.8. Express

Framework minimalista para crear un **servidor HTTP** en Node.js. Encapsula:

- Rutas: “si llega `GET /ruta`, ejecuta esta función”.
- Middleware: funciones que procesan la petición antes del controlador (JSON body, CORS, manejo de errores).

---

## 1.9. Módulos ES (frontend) vs CommonJS (backend)

| Lugar | Sintaxis | Ejemplo |
|-------|----------|---------|
| `app.js` (navegador) | ES Modules | `import { getTasks } from "./src/api/client.js";` |
| Servidor Express | CommonJS | `const express = require("express");` |

El navegador necesce `<script type="module">` en el HTML para permitir `import`/`export`.

---

## 1.10. `export` e `import`

- **export**: hace que una función u objeto sea usable desde otro archivo.
- **import**: lo trae.

En `client.js` las funciones `getTasks`, `createTask`, etc. están **exportadas**; `app.js` las **importa** al inicio.

---

## 1.11. Promesas, `async` y `await`

Operaciones de red son **asíncronas**: no sabes cuándo terminan.

- Una función que devuelve una **Promesa** puede usarse con `.then()` o con **`async`/`await`**.
- `await` **pausa** la función `async` hasta que la promesa se resuelve o falla.

```javascript
async function ejemplo() {
  const datos = await getTasks(); // espera la respuesta de la red
  console.log(datos);
}
```

Si algo falla, se usa **`try { ... } catch (error) { ... }`**.

---

## 1.12. `fetch`

API del navegador para hacer peticiones HTTP. Devuelve una **Promesa** que se resuelve con un objeto `Response`.

En el proyecto, `client.js` envuelve `fetch` en la función `request()` para:

- Añadir **timeout** con `AbortController`.
- Parsear JSON o detectar errores.
- Lanzar errores con `.status` para el resto de la app.

---

## 1.13. DOM (Document Object Model)

Representación en memoria del HTML. JavaScript puede:

- **Seleccionar** nodos: `document.getElementById("task-list")`.
- **Crear** elementos: `document.createElement("li")`.
- **Escuchar eventos**: `button.addEventListener("click", handler)`.
- **Modificar** clases, texto, atributos.

---

## 1.14. Eventos

El usuario (o el navegador) **dispara** eventos: `click`, `input`, `submit`, `keydown`, etc.

- `event.preventDefault()` evita el comportamiento por defecto (p. ej. enviar un formulario y recargar la página).
- `event.stopPropagation()` evita que el evento “suba” a elementos padre.

---

## 1.15. `localStorage`

Almacén **persistente** en el navegador (clave → string). En TaskFlow guarda si el tema es `"dark"` o `"light"`.

---

## 1.16. Tailwind CSS (CDN)

Framework de clases utilitarias (`flex`, `p-4`, `dark:bg-gray-900`). En `index.html` se carga por script CDN; no requiere build de CSS en desarrollo.

---

## 1.17. Patrón MVC (simplificado en el backend)

| Capa | Rol en TaskFlow |
|------|------------------|
| **Rutas** | Asocian URL + método HTTP con una función del controlador. |
| **Controlador** | Valida entrada HTTP, llama al servicio, envía JSON o códigos de error. |
| **Servicio** | Lógica de negocio y acceso a datos (aquí: array en memoria). |

Separar capas facilita **probar** y **cambiar** la fuente de datos (mañana podrías sustituir el array por una base de datos sin reescribir las rutas).

---

## 1.18. Códigos HTTP usados en el proyecto

| Código | Significado típico |
|--------|---------------------|
| 200 | OK, lectura o actualización correcta |
| 201 | Recurso creado |
| 204 | Éxito sin cuerpo (p. ej. DELETE) |
| 400 | Petición mal formada |
| 403 | Prohibido (p. ej. CORS rechazado) |
| 404 | No encontrado |
| 408 | Timeout (definido en el cliente ante `AbortError`) |
| 500 | Error interno del servidor |

---

## 1.19. Volatile store (almacenamiento volátil)

El **servicio** guarda tareas en un **array en RAM**. Si reinicias el servidor, **se pierden** las tareas. Es normal en proyectos de aprendizaje; en producción se usaría una base de datos.

---

## 1.20. Anatomía de una URL (profundidad)

Una URL completa tiene piezas que conviene nombrar:

```
https://localhost:3000/api/v1/tasks/42?sort=asc#comentario
└─┬─┘ └──┬──┘ └────┬────┘ └─┬─┘ └──────┬──────┘ └──┬──┘
 esquema  host   puerto    ruta      query    fragmento
```

| Parte | Ejemplo | Rol |
|-------|---------|-----|
| **Esquema** | `http` o `https` | Protocolo; en desarrollo local casi siempre `http`. |
| **Host** | `localhost`, `127.0.0.1`, `mi-app.vercel.app` | Dónde vive el servidor. |
| **Puerto** | `:3000`, `:5500` | Si se omite, `http` usa 80 y `https` 443. |
| **Ruta (path)** | `/api/v1/tasks` | Recurso dentro del servidor; en Express se “montan” prefijos. |
| **Query string** | `?foo=bar` | Parámetros opcionales (TaskFlow casi no los usa en la API). |
| **Fragmento** | `#seccion` | Lo usa el navegador en la página; **no** se envía al servidor en `fetch`. |

**Origen (origin)** en CORS = esquema + host + puerto (el puerto importa: `http://localhost:3000` y `http://localhost:5500` son orígenes distintos).

---

## 1.21. Petición HTTP “en crudo” (mental model)

Cuando haces `fetch("http://localhost:3000/api/v1/tasks")`, el navegador envía algo conceptualmente así:

```http
GET /api/v1/tasks HTTP/1.1
Host: localhost:3000
Accept: */*
Origin: http://127.0.0.1:5500
```

Si es `POST` con JSON, añade:

```http
Content-Type: application/json
Content-Length: 45

{"title":"Hola","category":"personal"}
```

Entender esto ayuda cuando lees errores en la pestaña **Network** de las herramientas de desarrollador.

---

## 1.22. CORS en dos fases: preflight

Para ciertos métodos o cabeceras “no simples”, el navegador envía antes una petición **`OPTIONS`** (preflight) para preguntar al servidor si el origen está permitido. El paquete `cors` en Express responde con las cabeceras adecuadas (`Access-Control-Allow-Origin`, etc.).

Si ves en Network una línea `OPTIONS` seguida de `POST`, es normal: no es que tu código llame `OPTIONS` dos veces manualmente; es el navegador cumpliendo seguridad.

---

## 1.23. Promesas: más allá de `await`

Una **Promesa** es un objeto que representa “un valor que llegará en el futuro o un fallo”.

Formas equivalentes de usar `getTasks()`:

```javascript
// Estilo async/await (el del proyecto)
async function a() {
  try {
    const data = await getTasks();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

// Estilo .then / .catch (mismo significado)
function b() {
  getTasks()
    .then((data) => console.log(data))
    .catch((e) => console.error(e));
}
```

**Regla**: dentro de una función `async`, puedes usar `await`. Fuera, no (salvo en módulos top-level await en entornos que lo permitan).

---

## 1.24. Cola de tareas y `setTimeout`

JavaScript en el navegador tiene un **hilo** principal. Operaciones largas bloquean la UI. Por eso:

- `setTimeout(fn, 140)` **no** garantiza que `fn` se ejecute exactamente a los 140 ms; garantiza “no antes de 140 ms”, cuando el hilo esté libre.
- `requestAnimationFrame` programa trabajo **antes del siguiente repintado**, ideal para animaciones y para agrupar renders (`renderTasks` en TaskFlow).

---

## 1.25. `Set` y `Map` (estructuras usadas en el proyecto)

- **`Set`**: colección de valores **únicos**. `inFlightTaskIds` es un `Set` de strings para saber qué tareas tienen una petición en curso sin duplicar ids.
- **`Object.keys` / `Set` de campos permitidos**: en el backend, `ALLOWED_CREATE_FIELDS` es un `Set` para comprobar rápido si el body trae campos extra.

Ejemplo mínimo:

```javascript
const s = new Set();
s.add("1");
s.add("1"); // sigue habiendo un solo "1"
console.log(s.has("1")); // true
```

---

## 1.26. Expresiones regulares (regex) en el proyecto

- `isMeaningfulTitle` usa `/[\p{L}\p{N}]/u`:
  - `\p{L}` = cualquier letra Unicode (incluye acentos, ñ, etc.).
  - `\p{N}` = cualquier cifra numérica.
  - La bandera `u` habilita esas clases Unicode.

Esto es más robusto que `[a-zA-Z0-9]` para textos en español.

---

## 1.27. Delegación de eventos

En lugar de poner un listener en **cada** botón “Eliminar” de cada tarea (cientos de listeners si la lista crece), se pone **un solo** listener en el padre `#task-list` y se mira `event.target` con `classList.contains("delete-btn")`.

Ventajas: menos memoria, menos trabajo al re-renderizar la lista.

---

## 1.28. `DocumentFragment` y `replaceChildren`

`renderTasksNow` construye un **fragmento** en memoria y luego hace `taskList.replaceChildren(fragment)` (o equivalente). Así el navegador **no** repinta el DOM en cada `appendChild` intermedio al documento visible; hace un solo batido de actualización.

---

## 1.29. `localStorage` vs `sessionStorage` vs cookies

| API | Persistencia | Se envía al servidor en cada petición |
|-----|--------------|--------------------------------------|
| `localStorage` | Hasta que el usuario borre datos del sitio | No |
| `sessionStorage` | Solo la pestaña actual | No |
| Cookies | Configurable | Sí (si no se marca HttpOnly) |

TaskFlow solo necesita persistir el **tema** entre visitas → `localStorage`.

---

## 1.30. Qué es “strict mode” y módulos ES

Los módulos ES (`import`/`export`) se ejecutan en **modo estricto** automáticamente: por ejemplo, asignar a una variable no declarada lanza error (en modo no estricto podría crear una global accidental).

---

## 1.31. Errores personalizados en el cliente

En `client.js`, cuando la respuesta HTTP no es OK, se hace:

```javascript
const error = new Error(mensaje);
error.status = response.status;
throw error;
```

Añadir `.status` al objeto `Error` **no** es estándar de JavaScript, pero es un patrón habitual para que `handleNetworkError(error)` pueda mostrar “HTTP 404” vs “HTTP 500”.

---

## 1.32. Idempotencia (idea avanzada, opcional)

Una operación **idempotente** produce el mismo efecto si la repites. En REST, `GET` y `PUT` “completos” suelen diseñarse idempotentes; `POST` crear suele **no** serlo (cada llamada crea otra fila). En TaskFlow, `POST /actions/complete-all` pone todas en completado: llamarlo dos veces seguidas deja el mismo estado final (efecto idempotente en la práctica).

---

## 1.33. Variables de entorno (`process.env`)

En Node, `process.env.PORT` lee el puerto desde el entorno (archivo `.env` cargado por `dotenv`, o variables que inyecta el hosting). Así el mismo código puede correr en puerto 3000 en tu PC y en otro puerto en la nube sin cambiar el código fuente.

---

## 1.34. Serverless (Vercel) en una frase

En lugar de un proceso Node **siempre encendido**, la plataforma **arranca** tu función al llegar una petición a `/api/...`, ejecuta Express y puede **congelar** o destruir el contenedor después. Por eso **no** debes confiar en variables globales en memoria para datos críticos en producción serverless (cada invocación puede ser un proceso fresco). TaskFlow en memoria es didáctico; en serverless real los datos en RAM no se comparten entre invocaciones de forma fiable.

---

## 1.35. Dónde seguir leyendo

Los documentos **02** en adelante aplican estos conceptos archivo por archivo. Si algo aquí fue denso, no pasa nada: vuelve después de haber tocado el código un rato; la segunda lectura suele encajar mejor.

---

Con estos conceptos, los siguientes documentos recorren **cada archivo** con más detalle y ejemplos.
