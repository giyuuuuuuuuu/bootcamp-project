# 2. Frontend: HTML y CSS

Aquí se describe la **interfaz visible** (`index.html`) y los estilos (`style.css`), sin entrar todavía en la lógica JavaScript línea a línea (eso va en el documento 3).

---

## 2.1. Estructura general del HTML

El archivo `index.html` define:

1. **Cabecera (`<head>`)**: metadatos, enlace a `style.css`, Tailwind vía CDN, título.
2. **Cuerpo (`<body>`)** con clase `app-body`: fondo, tipografía base, modo oscuro con clase `dark` en `<html>`.
3. **Regiones principales**:
   - Contenedor de **toasts** (notificaciones flotantes).
   - **Header** con título TaskFlow y botón de tema.
   - **Layout** en columnas (responsive): `aside` (panel lateral) + `main` (contenido principal).
   - **Pie de página** simple.
   - **Diálogos** (`<dialog>`) para editar tarea y confirmar borrado.
4. **`<template id="task-template">`**: molde invisible para clonar cada ítem de la lista (evita escribir HTML enorme en JavaScript).

### Diagrama de zonas

```
┌─────────────────────────────────────────────────────────┐
│  Header: TaskFlow                    [tema 🌙/☀️]        │
├──────────────┬──────────────────────────────────────────┤
│   Aside      │  Main                                      │
│  Estadísticas│  ┌─ Nueva tarea (formulario) ─────────┐  │
│  Búsqueda    │  └────────────────────────────────────┘  │
│  Categoría   │  Mis Tareas: filtros, orden, lista <ul>   │
│  (select)    │                                            │
└──────────────┴──────────────────────────────────────────┘
```

---

## 2.2. Modo oscuro con Tailwind (`dark:`)

Tailwind está configurado con `darkMode: "class"`. Eso significa:

- No usa la preferencia del sistema automáticamente **para las clases** hasta que tú pongas la clase `dark` en un ancestro (aquí, en `<html>`).
- JavaScript hace `document.documentElement.classList.toggle("dark", isDark)`.

Ejemplo de utilidad:

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

De día: fondo blanco, texto oscuro. Con `class="dark"` en `<html>`: fondo gris oscuro, texto claro.

---

## 2.3. Formulario “Nueva tarea”

Elementos importantes:

| Elemento `id` | Rol |
|---------------|-----|
| `todo-form` | Formulario; JS cancela el envío por defecto y usa `fetch`. |
| `task-input` | Título obligatorio. |
| `task-description` | Opcional. |
| `category-select` | Categoría (`personal`, `work`, etc.). |

El botón “Añadir” es `type="submit"` dentro del formulario: al hacer clic se dispara el evento `submit` en el form, capturado en `app.js`.

---

## 2.4. Lista de tareas y template

- `<ul id="task-list">`: contenedor vacío rellenado por JavaScript.
- `<template id="task-template">` contiene un `<li class="task-item">` con:
  - Checkbox personalizado (clase `task-checkbox`).
  - Texto, descripción oculta por defecto, badge de categoría.
  - Botones Editar / Eliminar.

**Por qué template**: `document.getElementById("task-template").content` permite **clonar** el fragmento muchas veces sin duplicar HTML en strings largos.

---

## 2.5. Diálogos modales (`<dialog>`)

Dos bloques:

| `id` | Uso |
|------|-----|
| `edit-modal` | Formulario de edición; `showModal()` abre con overlay nativo. |
| `confirm-delete-modal` | Confirmación antes de borrar; mensaje dinámico desde JS. |

Clases `app-dialog` y `modal-panel` (en CSS) controlan borde, sombra y evitar recortes visuales.

---

## 2.6. Script modular

```html
<script type="module" src="app.js"></script>
```

`type="module"` permite `import`/`export` y carga el archivo como módulo ES (ámbito aislado, `"use strict"` implícito).

---

## 2.7. Hoja `style.css`: qué aporta

Además de Tailwind (clases en el HTML), `style.css` concentra:

| Bloque | Propósito |
|--------|-----------|
| `.app-body` | Fondos con gradientes radiales (claro / oscuro). |
| `.theme-switching` | Desactiva transiciones en hijos al cambiar tema (evita parpadeos); el `body` puede animar opacidad en el crossfade. |
| `.select-native-hidden` | Oculta el `<select>` real cuando hay desplegable personalizado. |
| `.custom-select*` | Botón disparador, panel, opciones, estados abiertos, modo oscuro. |
| `.task-checkbox` | Apariencia del checkbox circular (no el nativo). |
| `.task-item` | Animaciones de entrada/salida (`task-enter`, `task-removing`). |
| `.task-action-btn`, `.toolbar-filter-btn` | Botones del panel y filtros. |
| `dialog::backdrop` | Oscurece el fondo detrás del modal. |
| `.app-dialog`, `.modal-panel` | Estilo de ventanas modales (sombra tipo borde). |
| `.task-category-*` | Colores de badges por categoría. |
| `.toast*` | Notificaciones y animaciones. |
| `@keyframes` | `taskEnter`, `fadeInUp`, `toastIn/out`, `spinnerRotate`. |
| `@media (prefers-reduced-motion: reduce)` | Desactiva animaciones si el usuario lo pide en el sistema. |

### Mini-diagrama de capas CSS

```
Tailwind (utilidades en class="...")
        +
style.css (componentes y animaciones específicas)
        =
Aspecto final de TaskFlow
```

---

## 2.8. Accesibilidad (a11y) tocada en el proyecto

- `aria-label` en botones icónicos (tema, acciones).
- `aria-live="polite"` en el contenedor de toasts (lectores de pantalla pueden anunciar mensajes).
- `sr-only` en etiquetas de filtros/orden (texto solo para lectores).
- Selects personalizados: `role="listbox"`, `role="option"`, `aria-expanded`, `aria-controls`; la etiqueta `<label for>` se reasigna al botón disparador vía JS.

---

## 2.9. Ejercicio mental

Imagina que quitas `class="dark"` del `<html>` manualmente en las herramientas de desarrollador: toda la UI debería volver al tema claro **sin recargar**, porque las clases `dark:` dejan de aplicarse.

---

## 2.10. El `<head>` línea por línea (conceptualmente)

| Elemento típico | Para qué sirve |
|-----------------|----------------|
| `<meta charset="UTF-8">` | Codificación de caracteres; sin esto, tildes y emojis pueden romperse. |
| `<meta name="viewport" ...>` | En móviles, evita que la página se vea “miniatura”; escala correctamente. |
| `<link rel="stylesheet" href="style.css">` | Tu CSS personal; se carga **antes** de pintar si el navegador respeta el orden. |
| Tailwind CDN | Inyecta un script que genera estilos según las clases que encuentra (en desarrollo es cómodo; en producción “seria” a veces se compila Tailwind). |
| `<title>` | Texto de la pestaña del navegador y marcador por defecto. |

---

## 2.11. HTML semántico: por qué importa un poco

Aunque visualmente puedas hacer todo con `<div>`, usar `<header>`, `<main>`, `<aside>`, `<footer>`, `<section>` ayuda a:

- Lectores de pantalla (accesibilidad).
- SEO (los buscadores entienden mejor la jerarquía).
- Tu yo del futuro al leer el HTML.

TaskFlow usa `header`, `aside`, `main`, `section`, `footer` de forma razonable.

---

## 2.12. Flexbox y grid en Tailwind (mapa mental)

Clases que verás mucho:

| Clase | Efecto |
|-------|--------|
| `flex` | Contenedor flex; hijos en fila o columna según `flex-col` / `flex-row`. |
| `gap-3`, `gap-6` | Espacio **entre** hijos sin márgenes manuales. |
| `items-center` | Alineación en el eje **transversal** (ej.: centrar verticalmente en fila). |
| `justify-between` | Reparte espacio en el eje principal (ej.: título a la izquierda, botón a la derecha). |
| `min-w-0` | Truco habitual en flex: permite que un hijo **encoja** y no desborde el layout (lo usa `main`). |
| `md:flex-row` | A partir del breakpoint `md`, cambia de columna a fila (responsive). |

**Ejemplo** del propio proyecto: la barra de filtros en móvil puede apilarse y en escritorio alinearse en fila.

---

## 2.13. El `<template>` por dentro

El contenido de `<template>` **no se muestra** en pantalla ni se comporta como hijos normales del DOM hasta que lo clonas:

```javascript
const tpl = document.getElementById("task-template");
const clone = tpl.content.cloneNode(true); // copia profunda del fragmento
```

`cloneNode(true)` significa “incluye descendientes”. Luego `querySelector` sobre `clone` rellena textos y `data-*` antes de insertar en el `<ul>`.

**Ventaja pedagógica**: el diseñador puede editar el HTML del ítem en un solo sitio; el JS solo rellona datos.

---

## 2.14. `<dialog>` frente a un `<div>` posicionado

El elemento nativo `<dialog>` trae:

- **Semántica** de ventana modal.
- Métodos `showModal()` (bloquea interacción con el fondo con “backdrop” nativo) y `close()`.
- Evento `cancel` al pulsar Escape (según configuración del navegador).

Antes de `<dialog>`, muchas apps montaban modales con `div` fijos a pantalla completa y mucho CSS. TaskFlow aprovecha la API moderna.

---

## 2.15. `style.css`: orden de lectura sugerido

Si abres `style.css` de arriba abajo, verás primero **fondos globales**, luego **componentes** (select, checkbox, botones), luego **estados** (dark), luego **modales**, **toasts**, **keyframes**, y al final **accesibilidad de movimiento**.

Ese orden no es obligatorio en CSS, pero ayuda a encontrar cosas: **de lo general a lo concreto**.

---

## 2.16. Especificidad y Tailwind (conflictos)

Si una regla en `style.css` y una clase de Tailwind compiten, gana la **especificidad** y el **orden** en la cascada. Por eso a veces en `style.css` se usan selectores más largos (`.dark .custom-select-trigger`) para ganar a utilidades genéricas.

**Regla práctica**: si un estilo “no aplica”, abre DevTools → pestaña **Computed** y mira qué regla lo tachó.

---

## 2.17. Pseudo-elementos `::before` y `::after`

En el checkbox personalizado, `::before` dibuja el “punto” interior cuando está marcado. Los pseudo-elementos son hijos imaginarios del elemento; requieren `content: ""` aunque sea vacío para mostrarse.

---

## 2.18. `prefers-reduced-motion`

Bloque `@media (prefers-reduced-motion: reduce)` en `style.css` desactiva animaciones para usuarios que en el sistema operativo eligieron **reducir movimiento** (motivos de accesibilidad o mareos). El JavaScript del tema también consulta esto antes de animar el fade.

---

## 2.19. Checklist: entender la UI sin leer JS

1. Abre `index.html` y localiza los `id` que empiezan por `task-`, `todo-`, `confirm-`.
2. Para cada `id`, pregunta: “¿qué elemento del mundo real representa?” (lista, formulario, modal).
3. Abre `style.css` y busca la clase del elemento (p. ej. `task-item`).
4. Solo entonces abre `app.js` y busca `getElementById` con ese id.

Ese orden reduce la sensación de “magia”: primero estructura, luego apariencia, luego comportamiento.

---

En el siguiente documento se listan **función por función** los archivos JavaScript del frontend.
