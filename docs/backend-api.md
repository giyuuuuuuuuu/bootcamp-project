# Backend API Tooling Notes

Este documento resume herramientas comunes en ecosistemas backend y calidad API.

## Axios

Axios es un cliente HTTP para navegador y Node.js. Se usa para consumir APIs REST con una sintaxis consistente, interceptores, timeout y transformaciones de requests/responses.

Por que se usa:

- Manejo uniforme de errores HTTP.
- Interceptores para auth tokens y logging.
- API ergonomica para `GET/POST/PUT/DELETE`.

## Postman

Postman es una plataforma para probar, automatizar y documentar APIs.

Por que se usa:

- Permite crear colecciones reproducibles.
- Facilita pruebas de regresion para flujos felices y errores.
- Permite compartir requests entre equipos de backend/frontend/QA.

## Sentry

Sentry es una plataforma de monitoreo de errores y observabilidad de aplicaciones.

Por que se usa:

- Captura excepciones en tiempo real.
- Agrupa errores por fingerprint para priorizar incidentes.
- Da contexto tecnico (stack, entorno, usuario, release) para depurar rapido.

## Swagger (OpenAPI)

Swagger es el ecosistema de herramientas basado en la especificacion OpenAPI.

Por que se usa:

- Estandariza y versiona contratos API.
- Genera documentacion interactiva (`Swagger UI`).
- Puede generar SDKs y validaciones automáticas a partir del schema.

## Resumen operativo

- Axios: consumo de API desde cliente/servicios.
- Postman: pruebas manuales y colecciones de regresion.
- Sentry: monitoreo de errores en produccion.
- Swagger/OpenAPI: contrato formal y documentacion viva de la API.
