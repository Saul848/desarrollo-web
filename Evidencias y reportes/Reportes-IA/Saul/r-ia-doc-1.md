# Reporte de Uso Documental en el Proyecto

**Fecha:**
13/11/2026
**Número de reporte:**  
1
---

# 1. Breve descripción de uso

Describir la intención general de las consultas.
A medida que fuí trabajando en el programa con los métodos que vimos en clase me surgieron dudas acerca de consultas más completas, manejo de contraseñas y 
situaciones con la base de datos como: ¿qué si la llave primaria de una clase es un String en lugar de Integer? Entre otras dudas por el estilo.
El propósito de la consulta es complementar el trabajo realizado por mi, además de quizá potenciarlo o señalar consideraciones que no había considerado por mi cuenta

---

# 2. Evidencias de uso

| Fecha      | Herramienta | Enlace a prompt       | Enlace a respuesta                            |
|------------|-------------|-----------------------|-----------------------------------------------|
| 12/11/2026 | Claude      | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Respuesta-a-prompt-1) |
| 12/11/2026 | Claude      | [PROMPT 2](#Prompt-2) | [RESPUESTA A PROMPT 2](#Respuesta-a-prompt-2) |
| 13/11/2026 | Claude      | [PROMPT 3](#Prompt-3) | [RESPUESTA A PROMPT 3](#Respuesta-a-prompt-3) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
Este es como tal el primer reporte del miembro Saul Ortiz Zarate, para la primera entrega solo se utilizó IA para cuestiones triviales no muy relevantes.

Hubo cambios de entidades en la base de datos: Profesor y alumno pasaron a ser solo Usuario. Se añadieron llaves foraneas de respuestas-alumno a Reactivo.
Por lo que algunos prompts más recientes que otros pueden incluir datos que no parecen coincidir pero se deben a estos cambios.

#### Prompt-1
Podrías decirme la librería de la que proviene: "private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();" y para qué sirve
#### Respuesta a prompt 1
Sirve para **guardar contraseñas de forma segura**. En lugar de almacenar el texto original (`"1234"`), guarda un *hash*: una cadena que se calcula a partir de la contraseña y que no se puede revertir. Si alguien accede a tu base de datos, no obtiene las contraseñas reales.

BCrypt tiene dos características que lo hacen adecuado para esto:

- **Salt aleatorio:** cada vez que cifras la misma contraseña, el resultado es distinto. Dos profesores con la contraseña `"1234"` tendrán hashes diferentes en la base de datos.
- **Costo ajustable:** es deliberadamente lento, lo que dificulta los ataques de fuerza bruta.

Adecuaciones en el programa:
Se utilizó la librería recomenadada para el hasheo de contraseñas en el programa con su uso en el método crearUsuario del controlador de Usuario.

#### Prompt 2
por qué colocaste la etiqueta "@JsonProperty(access = JsonProperty.Access.WRITE_ONLY) private String password;", ¿para qué sirve?
#### Respuesta a prompt 2
Va en tu clase entidad `Profesor` (la que tiene `id`, `nombre`, `correo` y `password`), no en el controlador. La anotación le dice a Jackson, que convierte los objetos a JSON, cómo tratar ese campo.

Con esto:

- **Al recibir** un POST con `{"nombre": "Ana", "correo": "ana@uv.mx", "password": "1234"}`, el campo `password` se lee normalmente.
- **Al responder**, el JSON ya no incluye `password`, aunque el objeto sí lo tenga en memoria y en la base de datos.

El import es `com.fasterxml.jackson.annotation.JsonProperty`. Viene incluido con `spring-boot-starter-web`, así que no necesitas agregar ninguna dependencia.


#### Prompt 3
Ok tengo una pequeña modificación en mi clase Profesor, cambié el ID. Ahora se llama matricula, sigue siendo su llave primaria pero la idea es que sea una secuencia de 8 numeros, en la base de datos se guarda como Varchar()
#### Respuesta a prompt 3
Al cambiar la llave primaria a un `String`, hay que ajustar la entidad, el repositorio y el controlador. Supongo que la matrícula la asigna la universidad y la envías tú en el JSON, no que la genere la base de datos. Por eso ya no va `@GeneratedValue`.

**1. Entidad**
El import de `@Pattern` es `jakarta.validation.constraints.Pattern`. Usa `String` y no `Integer` porque una matrícula puede empezar con ceros (`00123456`) y un entero los perdería. `@Column(length = 8)` hace que JPA cree la columna como `VARCHAR(8)`.

**2. Repositorio:** el tipo de la llave pasa a `String`.

**3. Controlador:** cambia `crearProfesor` y `obtenerPorId`.

**Por qué agregué `existsById`**

Cuando el `id` lo genera la base de datos, `save()` siempre inserta. Ahora que tú asignas la matrícula, `save()` hace un *upsert*: si ya existe un profesor con esa matrícula, lo **sobrescribe** en lugar de dar error. Sin esa comprobación, un POST repetido podría reemplazar los datos de otro profesor.

**Para que `@Valid` funcione**

Necesitas esta dependencia en el `pom.xml`, porque no viene incluida en `spring-boot-starter-web`:

Sin ella, `@Pattern` se ignora. Si la matrícula no cumple el formato, Spring responde automáticamente con **400 Bad Request**.

Si en cambio quieres que el sistema genere la matrícula de 8 dígitos (por ejemplo, de forma consecutiva), el enfoque es distinto: se hace con una secuencia o con lógica propia, y entraría mejor en un `@Service`. Dime si es ese el caso.
