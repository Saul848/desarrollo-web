# Reporte de Uso Documental en el Proyecto

**Fecha:**  
22/11/2026
**Número de reporte:**  
4
---

# 1. Breve descripción de uso

Describir la intención general de las consultas.

Lo utilicé para revisar el estado de las vistas de Alumno y Profesor (HTML, CSS y JS), diagnosticar errores 500 del backend causados por diferencias entre las entidades de Java y las tablas reales de PostgreSQL (esquema desweb), y decidir cómo hacer el diseño responsivo (computadora y celular) sin perder funcionalidad.
---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| 22/11/2026 | Gemini | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Prompt-1) |
| 22/11/2026 | Gemini | [PROMPT 2](#Prompt-2) | [RESPUESTA A PROMPT 2](#Prompt-2) |
| 22/11/2026 | Gemini | [PROMPT 3](#Prompt-3) | [RESPUESTA A PROMPT 3](#Prompt-3) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
Cuarto reporte de uso documental. Se usó la IA para revisar el estado de las vistas, depurar errores 500 entre las entidades y la base de datos, y evaluar el enfoque responsivo. Las respuestas se contrastaron con las tablas reales (information_schema.columns), con las clases Tarea y de examen, y con el comportamiento en el navegador (F12, Network y Console).

#### Prompt-1
Me sale error 500 en /tareas/obtenerTareasGrupo/{idGrupo} con PSQLException 42703. Comparto el error de consola y mi clase Tarea.java. A algunos compañeros les funciona y a otros no, ¿por qué?

#### Respuesta a promt 1
La entidad Tarea mapeaba la columna calificacion, que no existe en la tabla desweb.tarea; quitarla alinea la entidad con la tabla y resuelve la consulta.
Detectó anotaciones duplicadas (@NotBlank y @Pattern repetidas en estado) para limpiar.

#### Prompt-2
Al consultar /examenes/grupo/7 me sale error 500: PSQLException: Bad value for type int : 00:35:00. ¿Qué lo causa?

#### Respuesta a promt 2
El backend intenta leer con getInt una columna que guarda una hora o duración en formato 00:35:00.
Hay que revisar la entidad de examen y el tipo de la columna en PostgreSQL; si representa una duración HH:mm:ss, el campo debe ser LocalTime y no int/Integer.

#### Prompt-3
Necesito que el sitio funcione en computadora y celular sin perder funcionalidad. ¿Conviene un CSS general (responsivo.css / comun.css) o dejar reglas @media en cada CSS?

#### Respuesta a promt 3
Comparó ambas opciones: un CSS común reduce repetición, pero las vistas tienen estructuras muy distintas.
Se decidió conservar bloques @media dentro de PaginaAlumno.css, PaginaProfesor.css, correo.css y login.css, cuidando que los componentes no se desborden ni queden apretados en pantallas angostas.

