# Cursor Workflow

Se pondrán a prueba las funcionalidades de la IA Cursor como IDE, tendremos en cuenta las siguientes:

* **Interfaz**
* **Autocompletado**
* **Que tan bien explica código**
* **Edición inline**
* **Composer**

Una vez hayamos visto todo lo que este IDE nos ofrece, documentaremos cambios reales que hayan sucedido en nuestro proyecto gracias a esta IA.

## Cambios tecnicos aplicados en TaskFlow

### 2026-04-08 - Sistema de categorias para tareas

**Objetivo**  
Agregar categorias a cada tarea con soporte visual y persistencia en `localStorage`.

**Archivos modificados**
- `index.html`
- `style.css`
- `app.js`

**Cambios por archivo**

- **`index.html`**
  - Se anadio un selector de categoria (`#category-select`) en el formulario de creacion.
  - Opciones incorporadas: `personal`, `work`, `study`, `health`.
  - Se actualizo el template de tarea para incluir una etiqueta visual (`.task-category-badge`) debajo del texto.

- **`style.css`**
  - Se creo el estilo base de la etiqueta `.task-category-badge`.
  - Se agregaron clases de color por categoria:
    - `.task-category-personal`
    - `.task-category-work`
    - `.task-category-study`
    - `.task-category-health`
  - Se anadieron variantes para modo oscuro con `.dark`.

- **`app.js`**
  - Se incorporo `categorySelect` para leer la categoria elegida al crear tareas.
  - Cada nueva tarea ahora incluye la propiedad `category`.
  - En `renderTasks()`, se pinta la etiqueta de categoria con texto y color segun su valor.
  - Se anadio `CATEGORY_LABELS` para mapear clave interna a nombre visible.
  - Se implemento normalizacion de tareas antiguas (sin categoria), asignando `personal` por defecto.
  - Despues de normalizar, se reescribe `myTasks` en `localStorage` para dejar los datos consistentes.

**Persistencia**
- Se mantiene la clave `myTasks` en `localStorage`.
- Estructura de tarea actual:
  - `id: number`
  - `title: string`
  - `completed: boolean`
  - `category: "personal" | "work" | "study" | "health"`

**Compatibilidad**
- Las tareas previas sin `category` no se rompen.
- Se migran automaticamente a `category: "personal"` al cargar.

**Validacion manual**
1. Crear tareas seleccionando distintas categorias.
2. Recargar la pagina.
3. Verificar que categoria y colores se mantienen.
4. Marcar/completar, editar y borrar tareas para confirmar que no afecta el render de etiquetas.
5. Probar en modo claro/oscuro para validar contraste de badges.

**Pendientes recomendados**
- Agregar filtro por categoria en la interfaz.
- Permitir editar categoria desde el modal de edicion.
- Definir categorias personalizadas por usuario.


## Aclaraciones

Este docuemnto fue generado por Cursor, para así también probar su capacidad de generación de documentación.

Se conoce que no todo lo que ha hecho esta IA es perfecto y yo personalmente mejoraré algún posible error en el código y/o en el diseño de el sistema creado por esta misma.