# Tutorial TaskFlow — Índice general

Este directorio (`/tuto`) contiene una guía **muy detallada** pensada para un estudiante universitario con poca experiencia. Los documentos **01–08** se han ido **ampliando** con secciones adicionales (marcadas como “Parte II”, FAQ, profundización): no pasa nada si no los lees de una sentada; están pensados para **volver** cuando tengas el código abierto al lado.

El proyecto **TaskFlow** es una aplicación de tareas (to-do) con:

- **Frontend**: HTML, CSS propio, Tailwind por CDN, JavaScript modular (`app.js` + `src/api/client.js`).
- **Backend**: Node.js + **Express** (API REST), datos en **memoria** (sin base de datos en el código actual).
- **Despliegue opcional**: Vercel con rutas que envían el tráfico `/api/*` al mismo servidor Express empaquetado como función serverless.

## Cómo leer estos documentos

| Orden | Archivo | Contenido |
|------|---------|-----------|
| 1 | [01-glosario-y-conceptos.md](./01-glosario-y-conceptos.md) | Términos + **ampliación**: URL, preflight CORS, promesas, regex Unicode, delegación de eventos, serverless, etc. |
| 2 | [02-frontend-html-css.md](./02-frontend-html-css.md) | HTML/CSS + **ampliación**: `<head>`, flex/grid Tailwind, template, `<dialog>`, especificidad CSS |
| 3 | [03-javascript-frontend-funciones.md](./03-javascript-frontend-funciones.md) | Funciones de `app.js` + **Parte II**: DOM, mutex, Promises del modal, RAF, closures en selects, depuración |
| 4 | [04-cliente-api-fetch.md](./04-cliente-api-fetch.md) | `client.js` + **ampliación**: `AbortController`, flujo de decisión post-`fetch`, mixed content |
| 5 | [05-backend-express.md](./05-backend-express.md) | Express + **ampliación**: `req.params` vs `body`, middleware de errores, `hasUnknownFields`, arranque local |
| 6 | [06-integracion-completa.md](./06-integracion-completa.md) | Integración + **ampliación**: `vercel.json`, capas lógicas, checklist manual |
| 7 | [07-proyectos-para-practicar.md](./07-proyectos-para-practicar.md) | 3 proyectos + **Parte II**: historias de usuario, criterios, tablas de autoevaluación |
| 8 | [08-preguntas-frecuentes-y-ejercicios.md](./08-preguntas-frecuentes-y-ejercicios.md) | FAQ, mini-ejercicios, “qué leer si…”, ritmo de estudio sugerido |

## Archivos clave del repositorio (referencia rápida)

```
booptcamp-project/
├── index.html              # Interfaz
├── style.css               # Estilos adicionales
├── app.js                  # Lógica de la UI + eventos
├── src/api/client.js       # Cliente HTTP hacia la API
├── api/[[...path]].js      # Puente Vercel → Express
├── vercel.json             # Rutas en despliegue
└── server/
    ├── src/index.js        # Arranque (puerto)
    ├── src/app.js          # Express + CORS + middleware
    ├── src/routes/task.routes.js
    ├── src/controllers/task.controller.js
    ├── src/services/task.service.js
    └── src/config/env.js
```

Empieza por el glosario si algún término te resulta extraño; luego sigue el orden numérico.
