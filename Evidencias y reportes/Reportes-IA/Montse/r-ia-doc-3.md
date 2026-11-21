# Reporte de Uso Documental en el Proyecto

**Fecha:**  
20/11/2026
**Número de reporte:**  
3
---

# 1. Breve descripción de uso

Describir la intención general de las consultas.

Lo utilicé para integrar la pantalla del alumno (listado de grupos) con el backend: entender en qué capa (JS, controlador, interfaz o entidad) se conecta cada parte con la base de datos, crear el endpoint que devuelve los grupos de un alumno, y resolver errores de configuración (conexión a la BD, puerto ocupado, estructura de tablas) al probar el sistema.
---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| 20/11/2026 | Claude | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Prompt-1) |
| 20/11/2026 | Claude | [PROMPT 2](#Prompt-2) | [RESPUESTA A PROMPT 2](#Prompt-2) |
| 20/11/2026 | Claude | [PROMPT 3](#Prompt-3) | [RESPUESTA A PROMPT 3](#Prompt-3) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
Tercer reporte de Montserrat Rojas Martinez. Se hizo uso de la IA para integrar la vista de grupos como alumno (HTML, CSS, JS y backend), entender el flujo entre las capas del proyecto y depurar errores al ejecutar la aplicación. Las respuestas se contrastaron con las tablas reales de la BD y con la clase Grupo, y se corrigieron los nombres de campos y columnas.

#### Prompt-1
Estoy haciendo un sistema escolar con HTML, CSS, JS, Java Spring Boot y MySQL/BD con Fetch. Necesito integrar la pantalla de alumno para visualizar los grupos a los que pertenece, tomando como referencia el HTML de mi compañero para profesor. No tengo claro dónde integrar la conexión a la BD: en el controlador, las clases, las interfaces o el JS. Comparto mi interfaz IGrupo, el HTML de alumno y las historias de usuario.

#### Respuesta a promt 1
- Flujo: JS (fetch) → Controlador → Interfaz (Repository) → BD; la clase (entidad) solo representa una fila de la tabla.
- Se agrega una consulta con JOIN sobre la tabla intermedia `esta_en_grupo` en `IGrupo`, un endpoint GET en el controlador y el fetch en el JS que dibuja las tarjetas.
- Correcciones al HTML de alumno: id `areaCursos` duplicado, script apuntando a `PaginaProfesor.js` e id `Examenes` con mayúscula.
- Se entregó un JS base y un CSS mínimo para las tarjetas.

#### Prompt-2
¿A qué te refieres con "usa el nombre con el que ya tengas inyectado IGrupo en tu controlador"? Comparto mi JS, mi CSS, IGrupo y mi GrupoControlador actuales.

#### Respuesta a promt 2
- En el controlador la interfaz se llama `igrupo`, no `grupoRepository`; el método no compilaba y le faltaba `@GetMapping`.
- La ruta correcta es `/alumno/{matricula}` porque la clase ya tiene `@RequestMapping("/grupos")`.
- Detectó que `botonesCurso` no estaba declarada en el JS y que faltaba el selector CSS `#barra-opciones-alumno`.
- Entregó el JS integrado y el CSS de las tarjetas.

#### Prompt-3
¿Cómo puedo consultar lo que se implementó, las vistas y eso? (después compartí capturas de pgAdmin y del error al correr `mvn spring-boot:run`)

#### Respuesta a promt 3
- Revisión por capas: datos en la BD, endpoint en el navegador y vista con Live Server o servida desde Spring; depuración con F12 (Network y Console).
- El error `Unable to determine Dialect` era un problema de conexión a la BD, no del código nuevo.
- Con las capturas detectó que `esta_en_grupo` no tiene columna `rol` (afectaba `inscribirAlumnoEnGrupo`) y que las matrículas son del tipo `20230002`.

