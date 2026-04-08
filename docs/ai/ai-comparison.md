# Ai Comparision

# ¿Qué se documentará aquí?

Se documentaran varias comparaciones entre diferentes Inteligencias Artificiales, tales como Claude y ChatGPT.
Se compararán factores como:

* **Conceptos técnicos**
* **Claridad y profundidad**
* **Resolución de errores en código**
* **Calidad del codigo generado por la IA**

Se intentará ser lo más neutral posible para así dar un buen veredicto y reflexión final.


# Comparación Conceptos básicos:

Se le hizo una pregunta a Chat GPT (5.4) y a Claude (opus-4-6) en la cual se le pidió lo siguiente:

* **Explica estos conceptos básicos:c Closures, Event Loop, DOM, hoisting o prototipos. Se claro, conciso, explicalo con el mayor detalle posible**

Y estos fueron los resultados:

# Claridad

En cuanto a claridad, he de decir que ChatGPT fue más claro al no usar terminología o esquemas complejos, facilitando así la comprensión para personas un poco menos experimentadas en este mundillo. Por el contrario, Claude si es más técnica, lo cual no es necesariamente malo, pero, si no conoces terminología básica pues se te pueda complicar entender (yo).

# Profundidad

Claude abarca muchos más terminos, explica de manera mas extendida, lo cual nos permite ver realmente como funciona el código desde dentro, ChatGPT por su parte peca de simpleza, puede que al inicio sea claro y se entienda, pero después se queda bastante corto.


# Conclusión

Queriendo llegar a una conclusión rápida, si buscas una explicación rápida, recordar algún término en específico, o simplemente copiar por copiar, ChatGPT es tu opción. Por el contrario, si deseas aprender realmente, entender como funciona todo "Detrás de escenas" y saber explicar las cosas de manera adecuada, Claude debería ser tu opción.


--------------------------------------------------------------------------------------------------------------------------------------------------

# Solución de errores

# Caso 1:

```javascript
function aplicarDescuentoACatalogo(catalogo, porcentajeDescuento) {
// Intentamos hacer una copia del array para no modificar el original
const nuevoCatalogo = [...catalogo];

nuevoCatalogo.forEach(producto => {
if (producto.detalles.enOferta) {
// Aplicamos el descuento
producto.precio = producto.precio * (1 - porcentajeDescuento / 100);
}
});

return nuevoCatalogo;
}

// Ejemplo de uso:
const tienda = [
{ nombre: "Teclado", precio: 100, detalles: { enOferta: true } },
{ nombre: "Ratón", precio: 50, detalles: { enOferta: false } }
];

const rebajados = aplicarDescuentoACatalogo(tienda, 20);
```
El error se encuentra en el spread [...] el cual solo hace una copia superficial. Así que al modificar el nuevo array, 
también estaremos modificando el array original, lo cual puede generar errores no deseados.

# Como lo solucionan

Ambos encontraron de manera correcta el error y ofrecieron una buena solución, pero claramente hay diferencias en cuanto a la profundidad del análisis, lo cual veremos a continuación:

# Chat GPT:

Nos ofrece una solución luego de una breve explicación de el error, los efectos que podría tener. Aunque si nos lo explica de manera clara, es cierto que peca de simplicidad
a la hora de dar ejemplos:

# Ejemplo de el error:


```javascript

const tienda = [
  { nombre: "Teclado", precio: 100, detalles: { enOferta: true } },
  { nombre: "Ratón", precio: 50, detalles: { enOferta: false } }
];

const rebajados = aplicarDescuentoACatalogo(tienda, 20);

// Despues de ejecutar la función


console.log(rebajados);
    [
        { nombre: "Teclado", precio: 80, detalles: { enOferta: true } },
        { nombre: "Ratón", precio: 50, detalles: { enOferta: false } }
    ]

console.log(tienda);
//También queda modificado:
    [
        { nombre: "Teclado", precio: 80, detalles: { enOferta: true } },
        { nombre: "Ratón", precio: 50, detalles: { enOferta: false } }
    ]
```

Y en tema de solución, solo nos brinda 1 solución y una recomendación, lo cual, aunque resuelve el problema, no incentiva a probar diferentes opciones que también
podrían funcionar en este caso.

# Posible solución ofrecida:

```javascript

function aplicarDescuentoACatalogo(catalogo, porcentajeDescuento) {
  return catalogo.map(producto => ({
    ...producto,
    detalles: { ...producto.detalles },
    precio: producto.detalles.enOferta
      ? producto.precio * (1 - porcentajeDescuento / 100)
      : producto.precio
  }));
}

```

# Resultado esperado 

```javascript
const tienda = [
  { nombre: "Teclado", precio: 100, detalles: { enOferta: true } },
  { nombre: "Ratón", precio: 50, detalles: { enOferta: false } }
];

const rebajados = aplicarDescuentoACatalogo(tienda, 20);

console.log(rebajados);
// [
//   { nombre: "Teclado", precio: 80, detalles: { enOferta: true } },
//   { nombre: "Ratón", precio: 50, detalles: { enOferta: false } }
// ]

console.log(tienda);
// Se mantiene intacto:
// [
//   { nombre: "Teclado", precio: 100, detalles: { enOferta: true } },
//   { nombre: "Ratón", precio: 50, detalles: { enOferta: false } }
// ]
```

Con esta solución nos ofrece utilizar la función map, la cual crea un nuevo array desde 0, así evitando editar el original, pudiendo evitar todos los errores anteriormente
planteados por la IA.

# Claude

Propocionandole la misma información, ya Claude nos ofrece una visión un poco más "Profunda" de que es lo que realmente está pasando dentro de la memoria:

```text
ANTES:
tienda -----> [referencia_al_objeto_1]
                         ↓
                   {nombre: "Teclado", precio: 100, detalles: {...}}

DESPUÉS del spread:
tienda -----> [referencia_al_objeto_1]
                         ↓
                   {nombre: "Teclado", precio: 100, detalles: {...}}
                         ↑
rebajados --> [referencia_al_objeto_1]  ← ¡Mismo objeto!
```

Y aparte nos ofrece 3 soluciones (2 más que ChatGPT), pudiendo así "Experimentar" un poco para saber cual podría ser la más adecuada para nuestro caso:

# Solución 1
# Map (La misma que la de ChatGTP):

```javascript
function aplicarDescuentoACatalogo(catalogo, porcentajeDescuento) {
  return catalogo.map(producto => {
    // Creamos un nuevo objeto para cada producto
    if (producto.detalles.enOferta) {
      return {
        ...producto,
        precio: producto.precio * (1 - porcentajeDescuento / 100),
        detalles: { ...producto.detalles } // También copiamos detalles
      };
    }
    // Si no está en oferta, también devolvemos una copia
    return {
      ...producto,
      detalles: { ...producto.detalles }
    };
  });
}
```

# Solución 2
# StructuredClone (Un poco más moderno):

```javascript
function aplicarDescuentoACatalogo(catalogo, porcentajeDescuento) {
  const nuevoCatalogo = structuredClone(catalogo); // Copia profunda real
  
  nuevoCatalogo.forEach(producto => {
    if (producto.detalles.enOferta) {
      producto.precio = producto.precio * (1 - porcentajeDescuento / 100);
    }
  });
  
  return nuevoCatalogo;
}
```

# Solución 3
# JSON(Para estructuras simples):

```javascript
function aplicarDescuentoACatalogo(catalogo, porcentajeDescuento) {
  const nuevoCatalogo = JSON.parse(JSON.stringify(catalogo));
  
  nuevoCatalogo.forEach(producto => {
    if (producto.detalles.enOferta) {
      producto.precio = producto.precio * (1 - porcentajeDescuento / 100);
    }
  });
  
  return nuevoCatalogo;
}
```

# Que nos ofrece cada una de las soluciones:

```text
Método	        Nivel	            Ventajas	                Desventajas
[...array]	    Superficial	        Rápido, simple	            Solo copia el array, no los objetos
map + spread    Profunda*	        Control total, funcional	Requiere copiar cada nivel manualmente
structuredClone	Profunda	        Verdadera copia profunda	No soportado en navegadores antiguos
JSON.parse   	Profunda	        Compatible	                Pierde funciones, fechas, undefined
```

# Creación de funciones

# Función 1 (Básica):

Crea una función llamada calcularPrecioFinal que reciba dos parámetros: precioBase y descuento (un número del 1 al 100). 
La función debe restar el porcentaje de descuento al precio base y devolver el resultado redondeado 
a dos decimales. Si el descuento es mayor a 100 o menor a 0, debe devolver un mensaje de error.

# Claude

Aquí honestamente claude hizo 7 versiones del mismo código para al final darnos el que mejor le parece, aunque peca de no explicar directamente cada uno de los códigos,
pero en cuestión de profundidad es un claro vencedor. Aquí pondré los que mejor me parecieron:

# Versión básica (cumple todos los requisitos)
```javascript
function calcularPrecioFinal(precioBase, descuento) {
  // Validar que el descuento esté en el rango correcto
  if (descuento < 0 || descuento > 100) {
    return "Error: El descuento debe estar entre 0 y 100";
  }
  
  // Calcular el precio final
  const precioFinal = precioBase - (precioBase * descuento / 100);
  
  // Redondear a dos decimales
  return Math.round(precioFinal * 100) / 100;
}

// Ejemplos de uso
console.log(calcularPrecioFinal(100, 20));    // 80
console.log(calcularPrecioFinal(50.50, 10));  // 45.45
console.log(calcularPrecioFinal(200, 150));   // "Error: El descuento debe estar entre 0 y 100"
console.log(calcularPrecioFinal(75, -5));     // "Error: El descuento debe estar entre 0 y 100"
```

# Versión con objeto de retorno (más profesional)
```javascript
function calcularPrecioFinal(precioBase, descuento) {
  // Validaciones
  if (typeof precioBase !== 'number' || typeof descuento !== 'number') {
    return {
      exito: false,
      error: "Ambos parámetros deben ser números",
      precioFinal: null
    };
  }
  
  if (precioBase < 0) {
    return {
      exito: false,
      error: "El precio base no puede ser negativo",
      precioFinal: null
    };
  }
  
  if (descuento < 0 || descuento > 100) {
    return {
      exito: false,
      error: "El descuento debe estar entre 0 y 100",
      precioFinal: null
    };
  }
  
  if (!isFinite(precioBase) || !isFinite(descuento)) {
    return {
      exito: false,
      error: "Los valores deben ser números finitos",
      precioFinal: null
    };
  }
  
  // Cálculo
  const montoDescuento = precioBase * descuento / 100;
  const precioFinal = precioBase - montoDescuento;
  const precioRedondeado = Math.round(precioFinal * 100) / 100;
  
  return {
    exito: true,
    error: null,
    precioBase: precioBase,
    descuento: descuento,
    montoDescuento: Math.round(montoDescuento * 100) / 100,
    precioFinal: precioRedondeado
  };
}

// Uso
const resultado1 = calcularPrecioFinal(100, 20);
console.log(resultado1);
/*
{
  exito: true,
  error: null,
  precioBase: 100,
  descuento: 20,
  montoDescuento: 20,
  precioFinal: 80
}
*/

const resultado2 = calcularPrecioFinal(100, 150);
console.log(resultado2);
/*
{
  exito: false,
  error: "El descuento debe estar entre 0 y 100",
  precioFinal: null
}
*/

// Uso condicional
if (resultado1.exito) {
  console.log(`Precio final: $${resultado1.precioFinal}`);
} else {
  console.log(`Error: ${resultado1.error}`);
}
```

# Versión alternativa con toFixed (más simple)

```javascript
function calcularPrecioFinal(precioBase, descuento) {
  // Validación del descuento
  if (descuento < 0 || descuento > 100) {
    return "Error: El descuento debe estar entre 0 y 100";
  }
  
  // Cálculo y redondeo
  const precioFinal = precioBase - (precioBase * descuento / 100);
  
  // toFixed devuelve string, parseFloat lo convierte a número
  return parseFloat(precioFinal.toFixed(2));
}

console.log(calcularPrecioFinal(100, 20));     // 80
console.log(calcularPrecioFinal(99.99, 10));   // 89.99
console.log(calcularPrecioFinal(50, 33.33));   // 33.33
```
# Versión con arrow function (más moderna)
```javascript
const calcularPrecioFinal = (precioBase, descuento) => {
  if (descuento < 0 || descuento > 100) {
    return "Error: El descuento debe estar entre 0 y 100";
  }
  
  const precioFinal = precioBase * (1 - descuento / 100);
  return Math.round(precioFinal * 100) / 100;
};

// O en una sola línea (sin validaciones complejas)
const calcularPrecioFinalCorto = (precio, desc) => 
  desc < 0 || desc > 100 
    ? "Error: El descuento debe estar entre 0 y 100"
    : Math.round(precio * (1 - desc / 100) * 100) / 100;
```

A parte de todas estas soluciones, nos ofrece una prueba con métodos de redondeo:

```javascript
const precioBase = 99.999;
const descuento = 10;
const precioFinal = precioBase * (1 - descuento / 100);

console.log(precioFinal);                              // 89.9991

// Método 1: Math.round
console.log(Math.round(precioFinal * 100) / 100);      // 90

// Método 2: toFixed (devuelve string)
console.log(precioFinal.toFixed(2));                   // "90.00"

// Método 3: toFixed + parseFloat
console.log(parseFloat(precioFinal.toFixed(2)));       // 90

// Método 4: Number + toFixed
console.log(Number(precioFinal.toFixed(2)));           // 90
```

Y casos de pruebas al completo

```javascript
function probarCalculadora() {
  const pruebas = [
    { precio: 100, desc: 20, esperado: 80 },
    { precio: 50, desc: 10, esperado: 45 },
    { precio: 200, desc: 0, esperado: 200 },
    { precio: 100, desc: 100, esperado: 0 },
    { precio: 99.99, desc: 15, esperado: 84.99 },
    { precio: 100, desc: 150, esperado: "Error" },
    { precio: 100, desc: -10, esperado: "Error" }
  ];
  
  pruebas.forEach(({ precio, desc, esperado }, index) => {
    const resultado = calcularPrecioFinal(precio, desc);
    const pasaPrueba = typeof esperado === 'string' 
      ? resultado.includes("Error")
      : resultado === esperado;
    
    console.log(`Prueba ${index + 1}: ${pasaPrueba ? '✅' : '❌'}`);
    console.log(`  Entrada: $${precio}, ${desc}%`);
    console.log(`  Resultado: ${resultado}`);
    console.log(`  Esperado: ${esperado}\n`);
  });
}

probarCalculadora();
```

Y al final, nos da su versión recomendada, para un uso estándar:

```javascript
/**
 * Calcula el precio final después de aplicar un descuento
 * @param {number} precioBase - Precio original del producto
 * @param {number} descuento - Porcentaje de descuento (0-100)
 * @returns {number|string} Precio final redondeado a 2 decimales o mensaje de error
 */
function calcularPrecioFinal(precioBase, descuento) {
  // Validar rango del descuento
  if (descuento < 0 || descuento > 100) {
    return "Error: El descuento debe estar entre 0 y 100";
  }
  
  // Calcular precio con descuento aplicado
  const precioFinal = precioBase * (1 - descuento / 100);
  
  // Redondear a 2 decimales
  return Math.round(precioFinal * 100) / 100;
}
```

La cálidad del código es excelente, la profundidad es muy buena, aunque peca de poca explicación, pero es solo pedirle que explique cada función y lo hace perfectamente.

# ChatGPT

Con el mismo prompt, ChatGPT fue muy claro, fue al grano y creó solamente un código, usando la versión más simple (con .toFixed) y dandome solamente un ejemplo, mucha claridad
poca profundidad y nula explicación:

```javascript
function calcularPrecioFinal(precioBase, descuento) {
  if (typeof precioBase !== "number" || typeof descuento !== "number") {
    return "Error: precioBase y descuento deben ser números.";
  }

  if (descuento < 0 || descuento > 100) {
    return "Error: el descuento debe estar entre 0 y 100.";
  }

  const precioFinal = precioBase * (1 - descuento / 100);
  return Number(precioFinal.toFixed(2));
}

// Con sus pruebas

calcularPrecioFinal(100, 20);   // 80.00 -> retorna 80
calcularPrecioFinal(59.9, 15);  // 50.92
calcularPrecioFinal(100, 110);  // "Error: el descuento debe estar entre 0 y 100."
```

