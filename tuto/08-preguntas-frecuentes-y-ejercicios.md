# Preguntas frecuentes, mini-ejercicios y “qué leer cuando…”

Este documento **no sustituye** los demás capítulos; sirve como **índice de dudas** y práctica activa. Está pensado para releer después de haber ejecutado el proyecto al menos una vez.

---

## A. Preguntas frecuentes (FAQ)

### A1. ¿Por qué mi `fetch` funciona en Postman pero no en el navegador?

Postman **no aplica CORS** igual que un navegador. Si la API responde 200 en Postman pero el navegador muestra error de CORS, el problema está en las **cabeceras de respuesta** vistas desde un origen web. Revisa `cors` en `server/src/app.js` y el origen exacto de tu página (incluido puerto).

### A2. ¿Qué diferencia hay entre `localhost` y `127.0.0.1`?

Ambos apuntan a tu máquina, pero para el navegador son **hosts distintos** en la política de mismo origen. Si el HTML sale de `127.0.0.1:5500` y configuras CORS solo para `localhost`, fallará. TaskFlow intenta cubrir varios patrones; al depurar, **unifica** y usa siempre el mismo host en la barra de direcciones.

### A3. ¿Por qué `async` en el `addEventListener("submit", ...)`?

Porque dentro necesitas `await createTask(...)`. Solo las funciones `async` pueden usar `await`. El manejador devuelve una Promesa; si lanzas error sin `try/catch`, verás “Unhandled promise rejection” en consola.

### A4. ¿Es malo usar `innerHTML`?

En contenido **controlado por ti** (plantillas fijas) el riesgo es bajo. Si algún día insertaras texto que viene del usuario **sin escapar**, podrías abrir una brecha **XSS** (Cross-Site Scripting). TaskFlow usa `textContent` en muchos sitios precisamente para títulos y descripciones. Si amplías el proyecto, aprende sobre sanitización.

### A5. ¿Qué es un “middleware” en una frase?

Una función que recibe la petición, puede modificarla o responder, y llama a `next()` para pasar el turno a la siguiente capa. `express.json()` es middleware; `cors()` es middleware.

### A6. ¿Por qué el DELETE devuelve 204 y no JSON?

Por convención, “borrado exitoso, nada que devolver”. El cliente en TaskFlow interpreta 204 como éxito y devuelve `null`. Otros equipos devuelven 200 con `{ success: true }`; lo importante es **coherencia** entre cliente y servidor.

### A7. ¿Puedo usar TypeScript en lugar de JavaScript?

Sí, pero añade compilación (`tsc`) o bundler. Fuera del alcance del repo actual, pero el siguiente paso natural en muchos equipos.

---

## B. Mini-ejercicios (sin solución completa: piensa primero)

### B1. Contador de caracteres

Añade bajo el textarea de descripción un texto “0 / 280” que se actualice en cada `input`.  
**Pista**: escucha `input` en `task-description`; lee `.value.length`.

### B2. Deshabilitar “Marcar todas” si no hay pendientes

En `renderTasksNow` o `updateStats`, si `pending === 0`, pon `completeAllBtn.disabled = true`; si no, `false`.  
**Pista**: cuidado con el estado de loading del botón.

### B3. Endpoint de salud en el cliente

Llama a `GET /health` desde la consola del navegador o añade un botón oculto de debug que muestre el JSON.  
**Objetivo**: practicar leer otra ruta que no es `/tasks`.

### B4. Orden inverso en el servicio

Sin cambiar la API, ordena en el **cliente** las tareas por título Z→A cuando el usuario elija una opción nueva en `sort-select`.  
**Pista**: nuevo `value` en `<option>` y rama en `sortTasks`.

### B5. Log estructurado

Crea una función `logApi(action, payload)` que haga `console.info` con timestamp. Llámala antes de cada `await` a la API.  
**Objetivo**: ver el orden temporal real de las operaciones.

---

## C. “¿Qué documento leo si…?”

| Situación | Documento |
|-----------|-----------|
| No entiendo palabras como REST o CORS | `01-glosario-y-conceptos.md` |
| Me pierdo en el HTML | `02-frontend-html-css.md` |
| No sé qué hace una función en `app.js` | `03-javascript-frontend-funciones.md` |
| Entiendo la UI pero falla la red | `04-cliente-api-fetch.md` + pestaña Network |
| Error en Express o rutas | `05-backend-express.md` |
| No veo cómo encaja Vercel | `06-integracion-completa.md` |
| Quiero practicar otro proyecto | `07-proyectos-para-practicar.md` |

---

## D. Ritmo de estudio sugerido (2 semanas relajadas)

| Día | Actividad |
|-----|-----------|
| 1–2 | Lee glosario + ejecuta el proyecto local siguiendo README |
| 3–4 | Recorre `index.html` y `style.css` con DevTools abierto |
| 5–7 | Lee `app.js` con búsqueda de `function`; traza un flujo (crear tarea) |
| 8–9 | Lee `client.js` y reproduce una petición con Thunder Client |
| 10–11 | Lee backend: rutas → controlador → servicio |
| 12–14 | Mini-ejercicio B1 o B2 + empieza un proyecto de `07` |

Ajusta según tu carga universitaria; lo importante es **tocar código**, no solo leer.

---

## E. Cómo usar este tutorial en un trabajo en equipo

Si explicas el proyecto a un compañero:

1. Dibuja el diagrama de **06-integracion-completa** en pizarra.
2. En vivo, muestra **Network** al crear una tarea.
3. Cambia una validación en el **controlador** (p. ej. longitud máxima) y muestra el **400** en el cliente.

Enseñar obliga a ordenar ideas; si te trabas, anota la pregunta exacta y vuelve al apartado correspondiente del glosario.
