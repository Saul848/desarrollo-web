# Reporte de Uso Documental en el Proyecto

**Fecha:**  16/11/2026
**Número de reporte:** 2  

---

# 1. Breve descripción de uso

Describir la intención general de las consultas.

---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| Día 8 | Gemini | [PROMPT 1](#prompt-1) | [RESPUESTA 1](#respuesta-a-prompt-1) |
| Día 8 | Gemini | [PROMPT 2](#prompt-2) | [RESPUESTA 2](#respuesta-a-prompt-2) |
| Día 8 | ChatGPT | [PROMPT 3](#prompt-3) | [RESPUESTA 3](#respuesta-a-prompt-3) |
| | | | |


> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

### Prompt-1
cómo se validan las peticiones http, si tengo este código?

    /**
     * Método que permite guardar un reactivo en la base de datos
     * @param reactivo
     * @return
     */
    @PostMapping 
    public Reactivo guardarReactivo(@RequestBody Reactivo reactivo) {
        return ireactivo.save(reactivo);
    }

### Respuesta a prompt 1
Para validar peticiones HTTP en ese método de Spring Boot, necesitas usar **Bean Validation** (Jakarta Validation) junto con la anotación `@Valid`.

Aquí tienes los 4 pasos exactos para implementarlo:

### 1. Agrega la dependencia de validación

Asegúrate de tener el starter de validación en tu proyecto (si aún no lo tienes).

En **Maven** (`pom.xml`):

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

```

En **Gradle** (`build.gradle`):

```groovy
implementation 'org.springframework.boot:spring-boot-starter-validation'

```

### 2. Agrega `@Valid` en tu controlador

Coloca `@Valid` justo antes de `@RequestBody` en tu método. Esto le indica a Spring que debe validar el objeto `Reactivo` antes de ejecutar el código del método:

```java
import jakarta.validation.Valid; // Usa javax.validation.Valid si tu Spring Boot es versión 2.x

@PostMapping 
public Reactivo guardarReactivo(@Valid @RequestBody Reactivo reactivo) {
    return ireactivo.save(reactivo);
}

```

### 3. Define las reglas en tu clase `Reactivo`

Añade las anotaciones de restricción sobre los atributos de tu entidad (o DTO) según lo que necesites validar:

```java
import jakarta.validation.constraints.*;

public class Reactivo {

    private Long id;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    @Email(message = "El formato del correo no es válido")
    private String correoProveedor;

    // Getters y Setters...
}

```

### 4. (Recomendado) Captura los errores de forma limpia

Si la validación falla, Spring lanzará una excepción `MethodArgumentNotValidException` y devolverá un error `400 Bad Request` muy extenso por defecto. Puedes crear un manejador global para devolver solo los campos y mensajes de error de forma ordenada:

```java
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> manejarErroresValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errores.put(error.getField(), error.getDefaultMessage())
        );
        
        return errores;
    }
}

```

Con esto, si envían un JSON inválido, la API responderá automáticamente con un código **400** y un JSON limpio como:

```json
{
  "nombre": "El nombre no puede estar vacío",
  "cantidad": "La cantidad debe ser mayor a 0"
}

```

### Prompt-2
cuál es la diferencia entre lo que me compartiste y este código:
@PostMapping("/usuarios")
public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {

    if (usuario.getNombre() == null ||
        usuario.getNombre().isBlank()) {

        return ResponseEntity
                .badRequest()
                .body("El nombre es obligatorio");
    }

    Usuario nuevoUsuario = servicio.guardar(usuario);

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(nuevoUsuario);
}?

### Respuesta a prompt 2
La diferencia principal es **dónde y cómo** se realiza la validación: el código que muestras usa **validación manual (imperativa)** dentro del controlador, mientras que el enfoque con `@Valid` usa **validación declarativa** gestionada por el framework.

Aquí tienes las diferencias clave entre ambos enfoques:

| Característica | Tu código (Validación Manual) | Enfoque anterior (`@Valid` + Bean Validation) |
| --- | --- | --- |
| **Ubicación de las reglas** | Mezcladas dentro de la lógica del controlador (`if/else`). | En la propia clase del modelo/DTO mediante anotaciones. |
| **Reutilización** | Si creas un método `actualizarUsuario` (`@PutMapping`), debes volver a escribir todos los `if`. | Las reglas se definen una sola vez en la clase y se reutilizan en cualquier endpoint con `@Valid`. |
| **Escalabilidad** | Si un objeto tiene 15 campos, el controlador se llena de decenas de líneas de `if`. | El controlador se mantiene limpio en 2 o 3 líneas, sin importar cuántos campos tenga el objeto. |
| **Respuesta de errores** | En tu ejemplo, devuelve un texto plano (`"El nombre es obligatorio"`) y se detiene en el primer error que encuentra. | Valida **todos** los campos a la vez y devuelve un objeto JSON estructurado con todos los errores juntos. |
| **Separación de responsabilidades** | El controlador tiene que saber cómo validar los datos, además de recibir la petición HTTP. | El controlador solo coordina la petición HTTP; Spring se encarga de validar antes de entrar al método. |

### Otra diferencia importante: `ResponseEntity`

Además de la validación, en tu nuevo código estás usando `ResponseEntity<?>` y devolviendo `HttpStatus.CREATED` (código **201**).

Eso sí es una excelente práctica:

* En tu primer código devolvías `Reactivo` directamente, lo que hace que Spring responda con un **200 OK**.
* En este segundo código devuelves **201 Created**, que es el estándar REST correcto cuando se crea un nuevo recurso en la base de datos.

### ¿Cómo combinar lo mejor de ambos mundos?

En un proyecto profesional de Spring Boot se combinan las dos ideas: usas `@Valid` para evitar llenar el código de `if`, y usas `ResponseEntity` para devolver el código HTTP `201 Created`:

```java
@PostMapping
public ResponseEntity<Reactivo> guardarReactivo(@Valid @RequestBody Reactivo reactivo) {
    Reactivo nuevoReactivo = ireactivo.save(reactivo);
    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(nuevoReactivo);
}

```

**¿Cuándo usarías validación manual (`if`)?**
Solo para **reglas de negocio complejas** que las anotaciones no pueden resolver por sí solas (por ejemplo: consultar la base de datos para verificar si el correo del usuario ya está registrado antes de guardarlo).


### Prompt-3
En backend cómo se validan respuestas HTTP?
### Respuesta a prompt 3
En backend, las **respuestas HTTP se validan revisando el código de estado (status code), los encabezados (headers) y el contenido del cuerpo (body)** que devuelve el servidor después de recibir una petición.

Te explico cómo funciona y cómo puedes implementarlo.

## **1. Validar el código de estado HTTP**

Cada respuesta HTTP contiene un código que indica qué sucedió con la petición.

Los más comunes son:

| Código | Significado           | ¿Qué indica?                        |
| ------ | --------------------- | ----------------------------------- |
| `200`  | OK                    | Petición exitosa                    |
| `201`  | Created               | Recurso creado correctamente        |
| `204`  | No Content            | Éxito, pero sin contenido           |
| `400`  | Bad Request           | Petición incorrecta                 |
| `401`  | Unauthorized          | No autenticado                      |
| `403`  | Forbidden             | Sin permisos                        |
| `404`  | Not Found             | Recurso no encontrado               |
| `409`  | Conflict              | Conflicto con el estado del recurso |
| `422`  | Unprocessable Entity  | Datos inválidos                     |
| `500`  | Internal Server Error | Error interno del servidor          |

Por ejemplo, si tienes un endpoint para registrar usuarios:

```
POST /api/usuarios
```

Podrías recibir:

```
HTTP/1.1 201 Created
Content-Type: application/json
```

Esto indica que el usuario se creó correctamente.

## **2. Validar las respuestas desde el backend**

Supongamos que utilizas Node.js con Express.

Puedes comprobar que los datos sean correctos antes de enviar una respuesta:

```
app.post('/usuarios', (req, res) => {

    const { nombre, correo } = req.body;

    if (!nombre || !correo) {
        return res.status(400).json({
            success: false,
            mensaje: "Faltan datos obligatorios"
        });
    }

    return res.status(201).json({
        success: true,
        mensaje: "Usuario creado correctamente"
    });

});
```

Aquí el backend valida los datos recibidos y devuelve un código HTTP dependiendo del resultado.

## **3. Validar respuestas de otros servicios (APIs)**

También puedes tener un backend que consuma otra API.

Por ejemplo, utilizando `fetch`:

```
async function obtenerUsuarios() {

    try {

        const response = await fetch(
            'https://api.ejemplo.com/usuarios'
        );

        if (!response.ok) {
            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const datos = await response.json();

        return datos;

    } catch (error) {

        console.error(error.message);

    }

}
```

Aquí se comprueba:

- `response.ok`: determina si el código HTTP está en el rango 200-299.
- `response.status`: obtiene el código HTTP.
- `response.json()`: convierte el cuerpo de la respuesta a JSON.

**Importante:** que una respuesta tenga código `200` no significa necesariamente que los datos sean correctos. También debes validar su estructura y contenido.

## **4. ¿Qué aspectos se deben validar?**

En un backend normalmente tenemos estas validaciones:

| Elemento       | ¿Qué se comprueba?                                           |
| -------------- | ------------------------------------------------------------ |
| Status code    | Que el código corresponda al resultado esperado.             |
| Headers        | Que el tipo de contenido sea correcto, por ejemplo JSON.     |
| Body           | Que los datos tengan la estructura esperada.                 |
| Tipos de datos | Que un ID sea numérico, un correo tenga formato válido, etc. |
| Errores        | Que los errores se controlen y se devuelvan apropiadamente.  |
| Seguridad      | Que no se exponga información sensible.                      |

## **Una distinción importante**

Hay dos cosas que suelen confundirse:

- **Validar peticiones HTTP:** comprobar que los datos que llegan al backend sean correctos antes de procesarlos.
- **Validar respuestas HTTP:** comprobar que lo que devuelve el backend, o un servicio externo, sea correcto y corresponda al resultado esperado.

Por ejemplo, si estás desarrollando una API REST, ambas validaciones son importantes.

**Para explicártelo con un ejemplo más cercano a lo que estás estudiando:** ¿estás trabajando con backend en Java (Spring Boot), JavaScript (Node.js/Express), Python (Django/FastAPI) o algún otro lenguaje? Así puedo mostrarte cómo se validan las respuestas HTTP en ese entorno.


## Observaciones adicionales

Agregar cualquier comentario explicativo relevante.