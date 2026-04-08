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


Puedes encontrar los esquemas detallados en la carpeta `docs/design`.

**ENTREGA VERCEL**
bootcamp-project-lemon.vercel.app
