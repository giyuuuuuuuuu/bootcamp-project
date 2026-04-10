# Bootcamp Project
-----

# 🚀 TaskFlow Pro

**TaskFlow** es una aplicación de gestión de tareas (To-Do List) moderna, rápida y accesible, diseñada para maximizar la productividad personal con una interfaz limpia y minimalista.

## ✨ Características Principales

  * **Gestión de Tareas Completa**: Crea, edita, marca como completada y elimina tareas de forma intuitiva.
  * **Sistema de Categorías**: Cada tarea puede clasificarse como `Personal`, `Trabajo`, `Estudio` o `Salud`, con etiqueta visual por color.
  * **Acciones Masivas**: Botones dedicados para marcar todas las tareas como hechas o limpiar la lista de tareas completadas en un segundo.
  * **Sistema de Filtros**: Clasifica tus tareas en "Todas", "Pendientes" o "Completadas" para mantener el enfoque.
  * **Búsqueda en Tiempo Real**: Encuentra cualquier tarea al instante mediante el filtro de texto.
  * **Modo Oscuro/Claro**: Cambio de tema fluido con persistencia de preferencia del usuario.
  * **Persistencia de Datos**: Gracias al uso de `LocalStorage`, tus tareas no se borran al cerrar el navegador.
  * **Alta Accesibilidad**: Puntuación de **95/100 en Lighthouse**, garantizando que sea usable mediante teclado y lectores de pantalla.
  * **Diseño Responsive**: Optimizado para su uso en dispositivos móviles, tablets y escritorio.

## 🛠️ Tecnologías Utilizadas

  * **HTML5**: Estructura semántica avanzada (incluyendo el uso de `<template>` y `<dialog>`).
  * **Tailwind CSS**: Framework de utilidades para un diseño moderno, coherente y con soporte nativo de modo oscuro.
  * **JavaScript (ES6+)**: Lógica reactiva, manipulación del DOM y gestión de arrays (`filter`, `map`, `forEach`).
  * **LocalStorage API**: Para el almacenamiento local de datos sin necesidad de una base de datos externa.

## 📥 Instalación y Uso

No requiere instalación compleja ni servidores. Para ejecutar el proyecto localmente:

1.  Clona este repositorio o descarga los archivos.
2.  Abre el archivo `index.html` en cualquier navegador moderno.
3.  *(Opcional)* Si usas VS Code, se recomienda usar la extensión **Live Server** para una mejor experiencia de desarrollo.

## 🧩 Estructura del Proyecto

```text
├── index.html                     # Estructura de la app, formulario, filtros y template de tarea
├── style.css                      # Estilos personalizados (animaciones, backdrop y badges de categoría)
├── app.js                         # Lógica principal: CRUD, categorías, filtros, búsqueda y tema
├── docs/
│   ├── ai/
│   │   └── cursor-workflow.md     # Registro técnico de cambios realizados con apoyo de IA
│   └── design/                    # Esquemas de diseño
└── README.md                      # Documentación principal del proyecto
```

## 📝 Cambios Recientes

### 1) Sistema de categorías completo
- Se añadió un selector de categoría en el formulario de alta de tareas.
- Cada tarea ahora guarda la propiedad `category` y se renderiza con una etiqueta visual.
- Categorías disponibles: `personal`, `work`, `study`, `health`.
- Se incorporó mapeo interno para mostrar etiquetas legibles (`Personal`, `Trabajo`, `Estudio`, `Salud`).

### 2) Persistencia y compatibilidad de datos
- La estructura guardada en `localStorage` (`myTasks`) ahora incluye `category`.
- Se implementó normalización de tareas antiguas sin categoría, asignando `personal` por defecto.
- Esta migración es automática y mantiene compatibilidad con datos ya existentes.

### 3) Mejoras visuales en CSS
- Se crearon badges de categoría con colores diferenciados.
- Se añadieron variantes para modo oscuro para conservar contraste y legibilidad.
- Se mantuvieron las animaciones existentes de entrada/salida de tareas.

### 4) Refactorización de `app.js` sin cambiar comportamiento
- Se reorganizó el código en funciones auxiliares para mayor legibilidad y mantenimiento.
- Se estandarizaron nombres de variables y constantes.
- Se eliminaron repeticiones en lógica de eventos y utilidades de tareas.
- Se cachearon nodos del DOM usados frecuentemente para simplificar `updateStats`.

### 5) Simplificación adicional y documentación JSDoc en `app.js`

En la última mejora se trabajó específicamente en reducir repetición y dejar documentación técnica embebida en el código para facilitar mantenimiento.

**Objetivo**
- Mantener exactamente la misma lógica funcional.
- Hacer el archivo más claro para lectura, depuración y escalabilidad.

**Cambios técnicos aplicados**
- Se añadió `commitStateChange()` para centralizar operaciones repetidas:
  - `renderTasks()`
  - `saveToLocalStorage()`
- Se reemplazaron llamadas duplicadas a esas dos funciones en flujos de:
  - crear tarea,
  - editar tarea,
  - completar tareas,
  - limpiar tareas completadas,
  - eliminar tarea con animación,
  - cambiar estado de una tarea.

**JSDoc incorporado**
- Se añadieron comentarios JSDoc en funciones clave para documentar:
  - propósito de cada función,
  - parámetros esperados,
  - valores de retorno (cuando aplica).
- Funciones documentadas:
  - `commitStateChange`
  - `normalizeTask`
  - `getSafeCategory`
  - `parseTaskId`
  - `getTaskById`
  - `matchesCurrentFilters`
  - `renderTasks`
  - `applyTheme`
  - `openEditModal`
  - `closeEditModal`
  - `deleteTaskWithAnimation`
  - `toggleTaskState`
  - `updateStats`
  - `saveToLocalStorage`

**Impacto**
- Misma experiencia para el usuario final (sin cambios de comportamiento).
- Menor duplicación de código.
- Mayor claridad para futuras contribuciones o refactors.

**Verificación**
- Se revisaron errores de linter tras la refactorización: sin errores detectados.

### 6) Accesibilidad y semántica
- Se mejoró la asociación de labels en formulario (`for="task-input"`).
- Se conservaron atributos `aria-label` de acciones principales.

### 7) Documentación técnica
- Se documentaron los cambios en `docs/ai/cursor-workflow.md` con:
  - objetivo técnico,
  - archivos modificados,
  - detalles por archivo,
  - persistencia/compatibilidad,
  - validación manual,
  - próximos pasos.

## 📋 Próximos Pasos (Roadmap)

  - [x] Implementar categorías o "tags" por colores para las tareas.
  - [ ] Añadir filtro específico por categoría.
  - [ ] Permitir editar la categoría desde el modal de edición.
  - [ ] Añadir fechas de vencimiento y recordatorios.
  - [ ] Exportar la lista de tareas a formato PDF o CSV.
  - [ ] Sincronización con Firebase para guardado en la nube.

-----

## Registro de mejoras UI/UX (Senior Frontend)

### 1) Ordenamiento de tareas (commit individual)

**Objetivo**
- Permitir ordenar la vista de tareas sin modificar la estructura de datos ni la logica principal.

**Implementacion**
- Se agrego un selector visual `sort-select` en la seccion de lista.
- Se introdujo el estado `currentSort` en `app.js`.
- Se incorporo la funcion `sortTasks(list)` que ordena una copia filtrada antes de renderizar.
- Criterios disponibles:
  - `recent` (mas recientes)
  - `oldest` (mas antiguas)
  - `alphabetical` (A-Z)
  - `status` (pendientes primero)

**Impacto**
- No cambia CRUD, persistencia ni filtros existentes.
- Mejora lectura y control cuando hay muchas tareas.

### 2) Filtro por categoria (commit individual)

**Objetivo**
- Permitir segmentar tareas por tipo (`Personal`, `Trabajo`, `Estudio`, `Salud`) sin alterar el modelo ni almacenamiento.

**Implementacion**
- Se agrego un selector `category-filter` en el panel lateral.
- Se introdujo el estado de vista `currentCategoryFilter`.
- Se extendio `matchesCurrentFilters(task)` para incluir coincidencia por categoria.

**Impacto**
- Mantiene intacta la logica de alta/edicion/eliminacion.
- Mejora enfoque y navegacion en listas extensas.

### 3) Estado vacio guiado (commit individual)

**Objetivo**
- Evitar una lista vacia sin contexto y guiar al usuario cuando no hay resultados.

**Implementacion**
- Se agrego la funcion `renderEmptyState()` en `app.js`.
- `renderTasks()` ahora muestra una tarjeta informativa cuando no hay tareas visibles por filtros o por lista vacia.
- Se añadieron estilos leves de entrada en `style.css`.

**Impacto**
- No altera datos ni flujos de negocio.
- Mejora onboarding y claridad visual.

### 4) Notificaciones toast no bloqueantes (commit individual)

**Objetivo**
- Entregar feedback de acciones clave sin interrumpir al usuario con modales bloqueantes.

**Implementacion**
- Se agrego el contenedor `toast-container` en `index.html`.
- Se incorporo la funcion `showToast(message)` en `app.js`.
- Se añadieron notificaciones para:
  - crear tarea,
  - editar tarea,
  - eliminar tarea,
  - completar todas,
  - limpiar completadas.
- Se definieron estilos y animacion en `style.css`.

**Impacto**
- No modifica la logica de negocio existente.
- Mejora visibilidad de acciones y sensacion de fluidez.

### 5) Atajos de teclado de productividad (commit individual)

**Objetivo**
- Reducir friccion en interacciones frecuentes sin cambiar el comportamiento funcional de la app.

**Implementacion**
- Se agrego `registerKeyboardShortcuts()` en `app.js` y se ejecuta al iniciar.
- Atajos incluidos:
  - `/` enfoca la busqueda.
  - `N` enfoca el campo de nueva tarea.
  - `Esc` cierra el modal de edicion.
  - `Ctrl + Enter` guarda edicion cuando el foco esta en `edit-input`.
- Se evita disparar atajos globales cuando el usuario ya esta escribiendo en inputs/selects.

**Impacto**
- Mantiene la misma logica CRUD y persistencia.
- Mejora velocidad de uso para teclado-first users.


Puedes encontrar los esquemas detallados en la carpeta `docs/design`.

**ENTREGA VERCEL**
bootcamp-project-lemon.vercel.app

## MCP en Cursor (Fetch, GitHub y Filesystem)

En esta fase se configuraron y validaron los servidores MCP necesarios para trabajar desde Cursor con acceso a web, GitHub y archivos del proyecto.

### Objetivo

- Integrar `fetch`, `github` y `filesystem` en Cursor.
- Dejar configuración por proyecto (versionable y reproducible).
- Documentar instalación, pruebas y resolución de errores comunes en Windows + PowerShell.

### Configuración aplicada

Se creó el archivo `.cursor/mcp.json` con la siguiente estructura:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "GITHUB_PAT"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\-----\\Desktop\\booptcamp-project"
      ]
    }
  }
}
```

### Qué se hizo exactamente

1. Se añadió `fetch` para consultas HTTP/HTTPS desde el chat de Cursor.
2. Se añadió `github` con variable `GITHUB_PERSONAL_ACCESS_TOKEN` para operar sobre repositorios/issues/PRs.
3. Se añadió `filesystem` limitado a la carpeta de este proyecto para mantener el alcance controlado.
4. Se dejó documentación de uso y validación en este README.

### Requisitos previos

- `Node.js` LTS instalado (incluye `npm` y `npx`).
- `GitHub CLI (gh)` instalado y autenticado.
- Token PAT de GitHub vigente y con permisos adecuados.

### Guía resumida de instalación en Windows

#### 1) Instalar Node.js

- Descargar LTS desde `https://nodejs.org/` o instalar con:
  - `winget install OpenJS.NodeJS.LTS`
- Verificar:
  - `node -v`
  - `npm -v`
  - `npx -v`

#### 2) Resolver error de PowerShell con `npm`/`npx`

Si aparece `PSSecurityException` por scripts `.ps1`:

- Ejecutar:
  - `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
- Cerrar y abrir terminal.
- Verificar de nuevo `npm -v` y `npx -v`.

Alternativa puntual:

- `npm.cmd -v`
- `npx.cmd -v`

#### 3) Instalar GitHub CLI

- Con winget:
  - `winget install --id GitHub.cli -e`
- Verificar:
  - `gh --version`
- Login:
  - `gh auth login`
  - `gh auth status`

Si `gh` no se reconoce en terminal aunque esté instalado, añadir al `PATH` de usuario:

- `C:\Program Files\GitHub CLI`

### Token PAT (GitHub)

El PAT (Personal Access Token) es una credencial personal para que Cursor/MCP opere en GitHub sin usar contraseña.

Recomendado:

- Tipo `Fine-grained token`.
- Expiración (30-90 días).
- Acceso sólo a repos necesarios.
- Permisos mínimos:
  - `Contents: Read`
  - `Pull requests: Read and write` (o `Read`)
  - `Issues: Read and write` (o `Read`)

### Pruebas realizadas

#### 1) Prueba `fetch`

- Se consultó una URL pública de Apple Store.
- Resultado esperado y obtenido: lectura correcta del título y primer encabezado de la página.

#### 2) Prueba `filesystem`

- Se listaron los archivos del proyecto.
- Resultado esperado y obtenido: acceso correcto al árbol de archivos dentro del directorio permitido.

#### 3) Prueba `github`

- Se validó autenticación de GitHub CLI.
- Se listaron repositorios de la cuenta.
- Se comprobó estado de issues en repositorios principales (sin issues abiertos en los revisados).

### Incidencias detectadas y solución

- **Error `npm.ps1` / `npx.ps1` bloqueado (ExecutionPolicy):**
  - Solución: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.
- **`gh` no reconocido en PATH:**
  - Solución: ejecutar por ruta completa temporalmente y añadir `C:\Program Files\GitHub CLI` al PATH de usuario.
- **Acceso a repo por URL web con 404 (caso puntual):**
  - Verificar remoto con `git remote -v` y confirmar owner/repo correcto.

### Checklist de validación rápida

- [x] `node -v` responde
- [x] `npm -v` y `npx -v` responden sin error de policy
- [x] `gh --version` responde
- [x] `gh auth status` muestra sesión activa
- [x] `.cursor/mcp.json` existe y tiene JSON válido
- [x] `GITHUB_PERSONAL_ACCESS_TOKEN` está configurado y no es placeholder
- [x] Cursor reiniciado tras cambios

### Seguridad y buenas prácticas

- No subir tokens al repositorio.
- Rotar/revocar el PAT si se expone.
- Mantener `filesystem` acotado al proyecto.
- Usar permisos mínimos necesarios en GitHub.

### Cuándo MCP es útil en proyectos grandes

MCP aporta más valor cuando el proyecto tiene muchos repos, equipos o fuentes de datos, y se necesita reducir cambios de contexto entre herramientas.

Casos típicos:

- **Monorepos y multi-repo:** consultar código, documentación y scripts desde un solo flujo de trabajo.
- **Gestión de incidencias y PRs a escala:** leer/crear issues, revisar PRs y automatizar tareas repetitivas en GitHub.
- **Debugging con contexto real:** combinar logs, archivos y datos externos para diagnosticar problemas más rápido.
- **Documentación viva:** validar enlaces, extraer fuentes y mantener documentación técnica actualizada.
- **Onboarding de equipos:** nuevos miembros entienden arquitectura y estado del proyecto sin saltar entre muchas plataformas.
- **Automatización segura:** ejecutar flujos con permisos controlados (scopes mínimos y acceso acotado por servidor).

En resumen, MCP es especialmente útil cuando la complejidad del entorno crece y se necesita velocidad sin perder trazabilidad ni seguridad.
