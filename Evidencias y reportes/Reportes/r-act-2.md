# Reporte de Avance del Proyecto

**Equipo:** 8
**Fecha:**  13/11/2026
**Número de reporte:** 2  
**Repositorio GitHub:** https://github.com/Saul848/desarrollo-web 

---

# 1. Actividades realizadas

Describir las actividades desarrolladas desde el último reporte.
Se configuró la conexión a la base de datos en el proyecto: PostgreSQL
Creación de entidades (@Entity) y repositorios (CrudRepository)
Implementación de métodos POST y GET en los controladores (@Rest)
Pruebas mediante CURL

---

# 2. Evidencias de trabajo

| Actividad                                                                   |Integrante responsable| Enlace a commit                          |
|-----------------------------------------------------------------------------|----------------------|------------------------------------------|
| Conexión con base de datos remota y Entidades Profesor (actualmente usuario)| Saul                 | 13d55ac93e7a5a71903e47dca7a5d89060cd11c3 |
| Entidades Usuario completa y Examen                                         | Saul                 | 60cbed50582b70ee5d36e6a59499d841224a3940 |
| creacion de clases, controladores, interfaces y clases de Equipo y Entrega | Montserrat | https://github.com/Saul848/desarrollo-web/commit/1eb9caa9423aedc62e2f438e1a72fafeda3d2e4d |
|Creacion de clases, controladores e interfaces de Grupo y Mensaje |Gabriel |https://github.com/Saul848/desarrollo-web/commit/9b1bcb22077d33d97de323eb2d82aacf7ace2449 |
| | | |

---

# 3. Problemas encontrados

Describir los problemas técnicos encontrados y cómo fueron solucionados.
SAUL-------------
Las tablas Profesor y Alumno en la base de datos se convirtieron en una única tabla llamada Usuario, por lo que sus Entidades, repositorios y controladores del 
sistema se tuvieron que adaptar a estos cambios en sus nombres, métodos, etc.
La solución fue revisar estos mismos nombres y que, asímismo, los atributos tuvieran los nombres correctos
Montse------------
Hubo un conflicto mientras se subían mis cambios en git, ya que mi compañero hizo cambios y yo no había hecho pull, para solucionarlo se compararon ambos códigos hasta determinar el correcto.
Gabriel-------
Como tal problemas no solo dudas por que mas metodos tenia que desarrollar 

---

# 4. Avance funcional

Indicar qué funcionalidades ya se encuentran operativas y cuáles están pendientes.
Saul------------
*Funciones operativas*
Entidades, repositorios y controladores de: Usuario y Examen
*Funciones pendientes*
Montse------------
*Funciones operativas*
clases, interfaces y controladores de: Entrega y Equipo
Gabriel -------
*Funciones operativas*
clases, interfaces y controladores de: Grupo y Mensaje

---

# 5. Uso de IA generativa

Documentar el uso de herramientas de inteligencia artificial durante el desarrollo del proyecto.

- **Herramienta utilizada:** Claude
- **Actividad para la que se utilizó:** corecciones de código y pruebas curl; llenado de la base de datos con datos ficticios y correciones de llaves entre las tablas; apoyo con sugerencias de librerías para el encriptado, filtrado o vaciado de datos.
- **Código o contenido generado:** Métodos corregidos de las clases controladores REST; comentarios en el código y señalizaciones; 
- **Modificaciones realizadas por el equipo:** Correción de nombres de variables, adaptaciones a las rutas del proyecto, optar por librerías más o menos complejas o necesarias
- **Forma en que se verificó el resultado:** códificación en pares analizando los promts, verificación individual y en equipo durante los pull request además de votación por sugerencias que dió la herramienta sobre el proyecto.

> Si no se utilizó IA, indicarlo expresamente.

---

# 6. Participación individual

Describir brevemente la contribución de cada integrante.

- **Saúl Ortiz Zarate:** delegación de responsabilidades, creación y conexión con la base de datos remota, creación de Entity, repositorios y controladores de algunas de las tablas, deciciones de diseño de la base de datos y del flujo del proyecto
- **Montserrat Rojas Martinez:** Creación de las clases, controladores e interfaces para las entidades Entrega y Equipo
- **Gabriel Maldonado López:** Creacion de las clases con sus controladores e interfaces de mensaje y grupo.
- **Integrante 4:**

---

# 7. Próximas actividades

Indicar las tareas que se realizarán antes del siguiente reporte.

- Actividad 1 - Saul : trabajar las entidades previas con sus métodos PUT y DELETE y pruebas con solicitudes http
- Actividad 2 - Montse : integrar los métodos faltantes PUT y DELETE para las entidades Entrega y Equipo
- Actividad 3 - Gabriel : Integrar metodos faltantes y pruebas con las peticiones http
- Actividad 4
- Actividad 5

---

## Observaciones adicionales

Agregar cualquier comentario, acuerdo, decisión técnica o evidencia complementaria relevante para el proyecto.

La base de datos sigue sufriendo cambios en su estructura así que algunos datos, prompts o avances puedes no ser los finales, se menciona solo para tenerlo en 
cuenta. son ligeros errores y correciones que nos hemos ido dando cuenta a lo largo del desarrollo y de las pruebas
