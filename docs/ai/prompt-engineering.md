# Prompt Engineering: 10 Experimentos Aplicados

Esta guia presenta 10 experimentos de Prompt Engineering orientados a tareas reales de desarrollo de software.  
Cada experimento incluye:

- Titulo del experimento
- Tecnica utilizada
- Prompt listo para usar
- Explicacion tecnica de por que supera un prompt simple

---

## Tabla Resumen

| # | Experimento | Tecnica principal | Objetivo |
|---|---|---|---|
| 1 | Definicion de Rol (Senior Dev) | Role Prompting | Disenar un servicio de autenticacion robusto |
| 2 | Conversion `snake_case` a `camelCase` | Few-shot | Estandarizar nombres de variables |
| 3 | Debug de async en loop | Chain of Thought guiado | Identificar causa raiz y correccion |
| 4 | UI con CSS puro | Constraint Prompting | Forzar cumplimiento tecnico estricto |
| 5 | Refactor con Early Returns | Refactoring Constraints | Reducir anidamiento y complejidad |
| 6 | JSDoc centrado en el por que | Documentation Prompting | Mejorar mantenibilidad y decisiones |
| 7 | Unit Tests con edge cases | Test-case Forcing | Aumentar cobertura de errores reales |
| 8 | Closures para perfil Junior | Audience Targeting | Mejorar comprension didactica |
| 9 | Auditoria SQL Injection | Security Prompting | Detectar vulnerabilidades en consultas |
| 10 | Boilerplate Hexagonal API | Architecture Prompting | Definir base limpia y escalable |

---

## 1) Definicion de Rol (Senior Dev) para Autenticacion

**Tecnica utilizada:** Role Prompting

### Prompt de ejemplo (listo para usar)

```text
Actua como un Senior Backend Developer especializado en Node.js y seguridad.
Necesito un servicio de autenticacion para una API REST con:
1) registro de usuarios con hash de password usando bcrypt
2) login con JWT (access + refresh tokens)
3) middleware de autorizacion por roles (admin, user)
4) manejo de errores sin filtrar informacion sensible
5) buenas practicas de estructura en capas (controller, service, repository)

Entrega:
- Estructura de carpetas
- Codigo de ejemplo para authService.js, authController.js y authMiddleware.js
- Consideraciones de seguridad (rate limit, expiracion, rotacion refresh token)
```

### Explicacion tecnica

Un prompt simple como "crea login en Node.js" produce respuestas genericas e incompletas.  
Al definir un rol experto y requisitos concretos, el modelo activa patrones de salida mas especializados: arquitectura por capas, seguridad y manejo de tokens.  
El formato de entrega tambien reduce ambiguedad y mejora la utilidad directa del resultado.

---

## 2) Few-shot para convertir `snake_case` a `camelCase`

**Tecnica utilizada:** Few-shot Prompting

### Prompt de ejemplo (listo para usar)

```text
Convierte variables de snake_case a camelCase.
Sigue exactamente el patron de los ejemplos:

Ejemplos:
- user_name -> userName
- total_price -> totalPrice
- is_active -> isActive
- created_at -> createdAt

Ahora convierte:
- first_name
- last_login_date
- profile_image_url
- order_total_amount
```

### Explicacion tecnica

Sin ejemplos, el modelo puede mezclar estilos (`camelCase`, `PascalCase`, o incluso conservar guiones bajos).  
Con few-shot, se establece un patron explicito de transformacion y consistencia.  
Esto reduce variabilidad y aumenta precision en tareas de formato o naming conventions.

---

## 3) Chain of Thought para debugear "Asynchronous call in a loop"

**Tecnica utilizada:** Chain of Thought guiado

### Prompt de ejemplo (listo para usar)

```text
Analiza este codigo y razona paso a paso para encontrar el bug:

async function processUsers(users) {
  users.forEach(async (user) => {
    await saveUser(user);
  });
  console.log("Proceso terminado");
}

Quiero:
1) Identificar por que falla el flujo asincrono
2) Explicar el impacto real en produccion
3) Proponer 2 soluciones correctas (for...of y Promise.all)
4) Mostrar el codigo final de ambas opciones
```

### Explicacion tecnica

Un prompt simple de "arregla este codigo" puede devolver una correccion sin diagnostico.  
La estructura paso a paso obliga al modelo a justificar causa raiz (por ejemplo, `forEach` no espera promesas), impacto y alternativas.  
Esto incrementa confiabilidad y transferibilidad del aprendizaje para casos futuros.

---

## 4) Restricciones claras para UI con CSS puro

**Tecnica utilizada:** Constraint Prompting

### Prompt de ejemplo (listo para usar)

```text
Genera un componente UI de tarjeta de perfil con:
- HTML semantico
- CSS puro (prohibido Bootstrap, Tailwind, Material UI y cualquier framework)
- Diseno responsive
- Modo hover y foco accesible

Requisitos:
1) Entrega solo 2 bloques: index.html y style.css
2) No usar JavaScript
3) Usar variables CSS para colores
4) Incluir estados :hover y :focus-visible
```

### Explicacion tecnica

Las restricciones explicitas reducen respuestas fuera de alcance (por ejemplo, incluir librerias no permitidas).  
Al prohibir herramientas y definir salida esperada, se limita el espacio de solucion y se mejora cumplimiento tecnico.  
Es especialmente util en entornos con stack fijo o politicas de frontend estrictas.

---

## 5) Refactorizacion con Early Returns

**Tecnica utilizada:** Refactoring Prompt + Reglas de estilo

### Prompt de ejemplo (listo para usar)

```text
Refactoriza esta funcion usando Early Returns para reducir anidacion:

function checkout(user, cart) {
  if (user) {
    if (user.isActive) {
      if (cart && cart.items.length > 0) {
        if (cart.total > 0) {
          return "Procesando pago";
        } else {
          return "Total invalido";
        }
      } else {
        return "Carrito vacio";
      }
    } else {
      return "Usuario inactivo";
    }
  } else {
    return "Usuario no existe";
  }
}

Reglas:
- Mantener la logica original
- Reducir profundidad de ifs
- Mejorar legibilidad
- Incluir una breve explicacion de cambios
```

### Explicacion tecnica

Un prompt vago puede "limpiar codigo" sin criterio claro.  
Al exigir early returns y preservar logica, el modelo aplica una estrategia concreta de refactorizacion con menor riesgo de regresion.  
El resultado suele tener mejor mantenibilidad y menor complejidad ciclomatica.

---

## 6) JSDoc enfocado en el "Por que"

**Tecnica utilizada:** Documentation Prompting orientado a intencion

### Prompt de ejemplo (listo para usar)

```text
Genera JSDoc para esta funcion de ordenamiento, enfocandote en el "por que" de las decisiones:

function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}

Incluye:
- Complejidad temporal esperada y peor caso
- Trade-off de memoria
- Cuando conviene y cuando no conviene usar este enfoque
```

### Explicacion tecnica

La documentacion comun suele describir "que hace" la funcion, pero no "por que se eligio".  
Pedir intencion, trade-offs y escenarios de uso produce comentarios mas utiles para mantenimiento, code reviews y decisiones de arquitectura.

---

## 7) Tests Unitarios con cobertura forzada de errores

**Tecnica utilizada:** Test-case Forcing

### Prompt de ejemplo (listo para usar)

```text
Genera tests unitarios con Jest para:

function divide(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Ambos valores deben ser numericos");
  }
  if (b === 0) throw new Error("No se puede dividir entre cero");
  return a / b;
}

Requisitos obligatorios:
1) Caso feliz
2) b = 0
3) parametros no numericos
4) valores NaN
5) numeros negativos
6) incluir describe + it con nombres claros
```

### Explicacion tecnica

Si solo se pide "haz tests", el modelo suele priorizar happy paths.  
Al forzar edge cases especificos, se cubren fallos frecuentes en produccion y se incrementa robustez.  
Tambien mejora la calidad del contrato de la funcion frente a entradas invalidas.

---

## 8) Explicacion didactica de Closures para Junior

**Tecnica utilizada:** Audience Targeting + Pedagogical Prompting

### Prompt de ejemplo (listo para usar)

```text
Explica que es un closure en JavaScript para una persona Junior.
Condiciones:
- Usa lenguaje simple y analogia cotidiana
- Incluye ejemplo basico y luego uno practico
- Cierra con 3 errores comunes a evitar

Ejemplo practico sugerido:
una funcion createCounter() que retenga estado privado.
```

### Explicacion tecnica

El mismo contenido tecnico debe adaptarse al nivel de audiencia.  
Este prompt fuerza progresion didactica (simple -> practico -> errores comunes), mejorando comprension y retencion.  
Tambien evita respuestas demasiado academicas para perfiles iniciales.

---

## 9) Auditoria de Seguridad para SQL Injection

**Tecnica utilizada:** Security-focused Prompting

### Prompt de ejemplo (listo para usar)

```text
Actua como AppSec Engineer. Audita este codigo buscando SQL Injection:

function getUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  return db.execute(query);
}

Entrega:
1) Vulnerabilidad detectada y nivel de riesgo
2) Ejemplo de payload malicioso
3) Version segura con query parametrizada
4) Recomendaciones extra (validacion, principio de minimo privilegio, logs)
```

### Explicacion tecnica

Un prompt de seguridad sin estructura puede omitir evidencia o mitigacion concreta.  
La plantilla obliga a diagnostico, explotacion conceptual y remediacion inmediata con buenas practicas complementarias.  
Esto acelera tareas de secure code review.

---

## 10) Boilerplate de arquitectura Hexagonal para API sencilla

**Tecnica utilizada:** Architecture Prompting

### Prompt de ejemplo (listo para usar)

```text
Genera boilerplate de arquitectura hexagonal para una API de tareas (Todo API) en Node.js.

Requisitos:
- Capas: domain, application, infrastructure
- Entidad: Task { id, title, completed }
- Caso de uso: createTask y listTasks
- Puerto de repositorio (interface)
- Adaptador en memoria para persistencia
- Endpoint HTTP basico (Express)

Entrega:
1) Arbol de carpetas
2) Codigo minimo por archivo
3) Explicacion de como cambiar adaptador en memoria por base de datos real
```

### Explicacion tecnica

Un prompt generico de "crea API" mezcla responsabilidades y dificulta evolucion.  
Al pedir arquitectura hexagonal y puertos/adaptadores, se separa dominio de infraestructura y se facilita testing, mantenimiento y escalabilidad.

---

## Conclusiones Practicas

- **Mayor especificidad = mejores resultados:** rol, restricciones y formato reducen ambiguedad.
- **Ejemplos guian estilo y precision:** few-shot es ideal para transformaciones repetitivas.
- **Estructura de salida importa:** pedir pasos, entregables y criterios de calidad incrementa utilidad.
- **Seguridad y testing deben forzarse:** si no se piden explicitamente, suelen quedar incompletos.
- **Contexto de audiencia mejora comunicacion:** ajustar profundidad evita respuestas no accionables.