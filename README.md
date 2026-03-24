# Bootcamp Project
-----

# 🚀 TaskFlow Pro

**TaskFlow** es una aplicación de gestión de tareas (To-Do List) moderna, rápida y accesible, diseñada para maximizar la productividad personal con una interfaz limpia y minimalista.

 \#\# ✨ Características Principales

  * **Gestión de Tareas Completa**: Crea, edita, marca como completada y elimina tareas de forma intuitiva.
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
├── index.html      # Estructura de la app y clases de Tailwind
├── style.css       # Estilos personalizados mínimos (backdrops y transiciones)
├── app.js         # Lógica principal: CRUD de tareas, filtros y modo oscuro
└── README.md       # Documentación del proyecto
```

## 📋 Próximos Pasos (Roadmap)

  - [ ] Implementar categorías o "tags" por colores para las tareas.
  - [ ] Añadir fechas de vencimiento y recordatorios.
  - [ ] Exportar la lista de tareas a formato PDF o CSV.
  - [ ] Sincronización con Firebase para guardado en la nube.

-----


Puedes encontrar los esquemas detallados en la carpeta `docs/design`.

**ENTREGA VERCEL**
bootcamp-project-lemon.vercel.app
