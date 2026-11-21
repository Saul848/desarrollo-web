# Reporte de Avance del Proyecto

**Equipo:**  8
**Fecha:**  20/11/2026
**Número de reporte:**  4
**Repositorio GitHub:**  https://github.com/Saul848/desarrollo-web

---

# 1. Actividades realizadas

Crear formularios
Construir tablas
Implementar funciones fetch
Mostrar errores y confirmaciones
Integrar frontend y backend - avance

---

# 2. Evidencias de trabajo

| Actividad                                          | Integrante responsable | Enlace a commit                        |
|----------------------------------------------------|------------------------|----------------------------------------|
| Estructura inicial de las paginas profesor y alumno| Saúl                   |https://github.com/Saul848/desarrollo-web/commit/123cac44a2b4318178356f52043347b0989e81e4|
| Avance en las paginas de profesor y alumno         | Saúl                   |https://github.com/Saul848/desarrollo-web/commit/f3fc7e3f4791cae5b80ba764e25ece52d55c3d19|
| Ajustes generales a los controladores              |Saúl                    |https://github.com/Saul848/desarrollo-web/commit/f2a5bb1f9f37bdc2385ca82d4f1aea8e96aa8e03 |
| Listado de cursos y avance de creación de grupos   |Saúl                    |https://github.com/Saul848/desarrollo-web/commit/7cfc2beac9a250d4c691a8bdd71101a51777b6bf |
| Ajustes a listado de cursos, creación de grupos y filtros |Saúl              |https://github.com/Saul848/desarrollo-web/commit/01cc8d91b25ec5404178945f39bf5b9575b41889 |
| Login y creación de cuenta | Tania | https://github.com/Saul848/desarrollo-web/commit/b705c051ed7daf0bbfb8e4b2acad325ad038c051 |
| Endpoint de grupos del alumno (backend) y primera versión del listado de cursos como alumno | Montse | https://github.com/Saul848/desarrollo-web/commit/77dd053abbd4ef44ac00ada2e60b530d141ae99a |
| Ajustes al listado de cursos como alumno (HTML, CSS y JS) | Montse | https://github.com/Saul848/desarrollo-web/commit/7a694a2085dbb134619076967fafdeeccfd550b1 |
---

# 3. Problemas encontrados

Errores en las rutas de algunos métodos del backend que no coincididan y resultaban en errores 404. 

Errores en los datos que se enviaban en algunas peticiones; no eran los datos correctos, y resultaban en errores 400.

Conflicto de puerto al probar el backend: otro servicio local (eXist-db) ocupaba el puerto 8080 y devolvía un 404 que no provenía de Spring Boot. Además, el método de inscripción de alumnos usaba una columna (`rol`) que no existe en la tabla `esta_en_grupo`, y hubo que ajustar los nombres de campos del JSON a los de la clase `Grupo`.

---

# 4. Avance funcional

Métodos faltantes en las clases backend
Interfaz gráfica para profesor y alumno con algunas de sus funciones activas.

Ya se puede iniciar sesión, en caso de no tener una cuenta existente, se puede crear una. Una vez iniciada la sesión, se redirige a la página correspondiete al rol.

En la pantalla de alumno ya se listan los grupos a los que pertenece, obtenidos de la base de datos mediante el endpoint `GET /grupos/alumno/{matricula}` y mostrados como tarjetas con búsqueda por nombre.

---

# 5. Uso de IA generativa

Documentar el uso de herramientas de inteligencia artificial durante el desarrollo del proyecto.

- **Herramienta utilizada:** Claude, Gemini
- **Actividad para la que se utilizó:** Dudas sobre la estructura de una petición fetch.
- **Código o contenido generado:**  Métodos corregidos de la clase REST. corrección de bugs y sugerencias de mejoras o eficiencia sobre los métodos ya planteados
- **Modificaciones realizadas por el equipo:** Correción de nombres de variables, adaptaciones a las rutas del proyecto y reestructuración de peticiones
- **Forma en que se verificó el resultado:** códificación en pares analizando los promts, verificación individual y en equipo durante los pull request además de votación por sugerencias que dió la herramienta sobre el proyecto.
- **Actividad para la que se utilizó:** Dudas sobre la estructura de los métodos GET y POST de algunas clases, qué validaciones y códigos HTTP usar, cómo probarlos con CURL y cómo interpretar errores de arranque en Maven/Spring.
- **Actividad para la que se utilizó:** Entender en qué capa (JS, controlador, interfaz o entidad) se integra cada parte de la conexión con la BD, crear la consulta y el endpoint de grupos por alumno, y depurar errores al ejecutar (conexión a la BD, puerto ocupado, nombres de tablas y campos). Ver el reporte de uso documental número 3.


> Si no se utilizó IA, indicarlo expresamente.

---

# 6. Participación individual

Describir brevemente la contribución de cada integrante.

- **Saúl Ortiz Zarate:** Se construyeron las interfaces de Profesor y Alumno y sus estilos. Se implementaron peticiones Fetch en la clase Profesor para el listado de los cursos actuales, se implementó la busqueda de grupos; busqueda de alumnos al crear un grupo y visualización del panel de tareas (aún a trabajar)
- **Montserrat Rojas Martinez:** Se integró la pantalla de alumno para visualizar los grupos a los que pertenece. En el backend se agregó la consulta en la interfaz `IGrupo` (JOIN con la tabla `esta_en_grupo`) y el endpoint `GET /grupos/alumno/{matricula}` en `GrupoControlador`, y se corrigió el método de inscripción de alumnos para que coincida con la tabla. En el frontend se implementó en `PaginaAlumno.js` la petición fetch que carga los grupos, el dibujado de las tarjetas con sus estilos, la búsqueda por nombre y la apertura de un grupo. También se corrigieron detalles del HTML de alumno y se resolvieron problemas de ejecución local.
- **Integrante 3:**
- **Tania Ketzel Gómez Velásquez:** Se creó la página para iniciar sesión lo más fiel al prototipo, en caso de no tener una cuenta existente, se podrá crear una. El login redirecciona a la página de acuerdo al rol del usuario, se implementó en el método de crear usuario que se genere una matrícula aleatoria.

---

# 7. Próximas actividades

Indicar las tareas que se realizarán antes del siguiente reporte.

- Actividad 1 - Saúl: seguir construyendo las peticiones fetch para el llenado de las tareas en la seccion de grupos para profesor, creación de tareas y examenes
- Actividad 2 - Tania: implementación de métodos faltantes, además de corrección de errores en los métodos de backend.
- Actividad 3 - Montserrat: integrar la vista dentro de un grupo como alumno: listado de tareas y exámenes del grupo, y la resolución de tareas y exámenes.
- Actividad 4 - 
- Actividad 5

---

## Observaciones adicionales

Agregar cualquier comentario, acuerdo, decisión técnica o evidencia complementaria relevante para el proyecto.
