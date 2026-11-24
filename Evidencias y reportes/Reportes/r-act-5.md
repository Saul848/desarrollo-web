# Reporte de Avance del Proyecto

**Equipo:**  8
**Fecha:**  22/11/2026
**Número de reporte:**  5
**Repositorio GitHub:**  https://github.com/Saul848/desarrollo-web

---

# 1. Actividades realizadas

Probar casos de exito y error
Corregir defectos
Completar README
Preparar evidencias
Verificar ejecución en entorno WSL

---

# 2. Evidencias de trabajo

| Actividad                                          | Integrante responsable | Enlace a commit                        |
|----------------------------------------------------|------------------------|----------------------------------------|
| Listado de tareas (profesor)                       | Saúl                   |https://github.com/Saul848/desarrollo-web/commit/a4caf375335a980034973eb9266f9d08f3fe7421|
| Modal y ajustes de filtros profesor                | Saúl                   |https://github.com/Saul848/desarrollo-web/commit/8bbf64cecdd411ce74d51156572b86c4f454d7a1|
| Ajustes generales a los controladores              |Saúl                    |https://github.com/Saul848/desarrollo-web/commit/9ef0f7bef25d31157977ecf4da60c83624940cb7|
| Listado de usuarios, expulsion e insercion de alumn|Saúl               |https://github.com/Saul848/desarrollo-web/commit/d853032ec533e5befc53a736d22087afc79bf836|
| Ajustes a listado de cursos, creación de grupos y filtros |Saúl              |https://github.com/Saul848/desarrollo-web/commit/01cc8d91b25ec5404178945f39bf5b9575b41889 |
| Endpoint de grupos del alumno (backend) y primera versión del listado de cursos como alumno | Montse | https://github.com/Saul848/desarrollo-web/commit/77dd053abbd4ef44ac00ada2e60b530d141ae99a |
| Ajustes al listado de cursos como alumno (HTML, CSS y JS) | Montse | https://github.com/Saul848/desarrollo-web/commit/7a694a2085dbb134619076967fafdeeccfd550b1 |
| Estructura de la pagina correo(HTML, CSS y JS) | Gabriel | https://github.com/Saul848/desarrollo-web/commit/e2eef6a5192715c65481bf1398cc22c7adb60082 |
| Crear exámenes | Tania | https://github.com/Saul848/desarrollo-web/commit/d67120893621471f1c6ecf5f08d35bcb107fbd50 |
| Resolución conflictos profesor | Tania | https://github.com/Saul848/desarrollo-web/commit/85bd858e2ad674aff747f92ea1f506319f204cf1 | 

---

# 3. Problemas encontrados

Errores en algunas politicas CORS por falta de declaración explicita de permitir en algunas clases. 

Errores 400 en algunas peticiones de los controladores que tuvieron que adaptarse para poder funcionar

Error 500 (PSQLException 42703) en /tareas/obtenerTareasGrupo/{idGrupo}: la entidad Tarea mapeaba la columna calificacion, que no existe en la tabla desweb.tarea. Se corrigió quitándola de la entidad y limpiando anotaciones duplicadas (@NotBlank y @Pattern en estado).

Error 500 (Bad value for type int : 00:35:00) en /examenes/grupo/{idGrupo}: el backend lee con getInt una columna de duración. Pendiente: cambiar el tipo en la entidad de examen (por ejemplo a LocalTime) y reiniciar Spring Boot.

---

# 4. Avance funcional

Ajustes en los métodos del backend para una correcta funcionalidad con el frontend, entre las cuales se incluyen las características usables de:
visualización de los grupos y tares como profesor; creación y eliminación física de tareas; listado de usuarios, inserción y eliminación de un grupo


---

# 5. Uso de IA generativa

Documentar el uso de herramientas de inteligencia artificial durante el desarrollo del proyecto.

- **Herramienta utilizada:** Claude, Gemini
- **Actividad para la que se utilizó:** Dudas sobre la estructura de una petición fetch, su estructura y comparaciones con los controladores utilizados
- **Código o contenido generado:**  Métodos corregidos de la clase REST y Entity. Corrección de bugs y sugerencias de mejoras o eficiencia sobre los métodos ya planteados
- **Modificaciones realizadas por el equipo:** Correción de nombres de variables, adaptaciones a las rutas del proyecto y reestructuración de peticiones, ayudas con los estilos css y etiquetas de algunos elementos html
- **Forma en que se verificó el resultado:** códificación en pares analizando los promts, verificación individual y en equipo durante los pull request además de votación por sugerencias que dió la herramienta sobre el proyecto.
- **Actividad para la que se utilizó:** Dudas sobre la estructura de los métodos GET y POST de algunas clases, qué validaciones y códigos HTTP usar, cómo probarlos con CURL y cómo interpretar errores de arranque en Maven/Spring.
- **Actividad para la que se utilizó:** Entender en qué capa (JS, controlador, interfaz o entidad) se integra cada parte de la conexión con la BD, crear la consulta y el endpoint de grupos por alumno, y depurar errores al ejecutar (conexión a la BD, puerto ocupado, nombres de tablas y campos). Ver el reporte de uso documental número 3.
- **Actividad para la que se utilizó:** Manejo de errores entre los controladores y base de datos


> Si no se utilizó IA, indicarlo expresamente.

---

# 6. Participación individual

Describir brevemente la contribución de cada integrante.

- **Saúl Ortiz Zarate:** Se implementaron peticiones Fetch en la clase Profesor para el listado de las tareas de un curso;listado de tareas, se implementó la creación y eliminación de tareas de un grupo; busqueda de alumnos dentro un grupo, su inserción o eliminación en un grupo; 
- **Montserrat Rojas Martinez:** Endpoint de grupos del alumno en el backend (consulta con JOIN sobre esta_en_grupo), listado de cursos como alumno (HTML, CSS y JS) con tarjetas estilo "gafete", y depuración de errores de configuración y de nombres de campos y tablas.
- **Tania Ketzel Gómez Velásquez:** Se modificó la vista de profesor para crear exámenes, también se corrigieron algunos métodos y atributos en las clases de Reactivo y Examen, para evitar errores de almacenado en la base de datos.
- **Gabriel maldonado :**  Se mejoro las funciones del correo como el enviar el mensaje se solicitara el correo y no la matricula del destinatario y validacion de que el correo existe dentro de la base de datos, tambien cargar de buena manera los correos.
---

# 7. Próximas actividades

Indicar las tareas que se realizarán antes del siguiente reporte.

- Actividad 1 - Saúl: correciones minimas de estilos y funcionamiento de algunas peticiones y sus errores
- Actividad 2 - Tania: Correciones de diseño y algúm error de filtrado en ambas vistas (profesor y alumno). 
- Actividad 3 - Montserrat: Correciones en funcionamiento y errores
- Actividad 4 - Gabriel:  Correcciones del css de la pagina correo, asegurar todo el funcionamiento completo de correo


---

## Observaciones adicionales

Agregar cualquier comentario, acuerdo, decisión técnica o evidencia complementaria relevante para el proyecto.
