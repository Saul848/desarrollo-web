# Reporte de Uso Documental en el Proyecto

**Fecha:**  
16/11/2026
**Número de reporte:**  
2
---

# 1. Breve descripción de uso

Describir la intención general de las consultas.

Lo utilicé para aclarar dudas sobre los métodos PUT y DELETE que quería agregar a los controladores de Entrega y Equipo, para entender qué operaciones tienen sentido, qué validaciones hacer y qué códigos HTTP devolver.
---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| 12/11/2026 | Claude | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Prompt-1) |
| 12/11/2026 | Claude | [PROMPT 2](#Prompt-2) | [RESPUESTA A PROMPT 2](#Prompt-2) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
Segundo reporte de Montserrat Rojas Martinez. Se hizo uso de la IA para aclarar dudas sobre los métodos PUT y DELETE, entender qué validaciones y códigos HTTP corresponden a cada uno.

#### Prompt-1
Estoy desarrollando un sistema escolar con Spring Boot y JPA. Mi controlador de Entrega ya tiene métodos GET y POST. Quiero agregar un PUT y un DELETE, dame ideas de algunos métodos que podría integrar.

#### Respuesta a promt 1
- PUT `/entregas/{id}/calificar`: el profesor asigna la calificación y la retroalimentación. Busca la entrega (404 si no existe), valida que la calificación sea válida (400) y actualiza solo esos dos campos, de modo que no se modifique el contenido, el alumno ni la fecha. Responde 200.
- DELETE `/entregas/{id}`: verifica que exista con existsById (404 si no) y la elimina con deleteById, respondiendo 200 con un mensaje.
- Consideraciones: no hay control de roles, la calificación máxima depende de la actividad y el borrado es físico (definitivo).

#### Prompt-2
Ahora necesito que me des ideas de métodos que pueda implementar en EquipoControlador: un PUT y un DELETE. Comparto cómo está mi controlador actualmente (con POST y varios GET).

#### Respuesta a promt 2
- PUT `/equipos/{id}`: busca el equipo (404), valida nombre e integrantes (400), verifica que el nuevo nombre no esté repetido en la misma tarea (409) y actualiza solo nombre e integrantes; el idTarea no se modifica.
- DELETE `/equipos/{id}`: verifica existencia (404) y elimina con
  deleteById.
- No es necesario modificar IEquipo ni Equipo, porque CrudRepository ya incluye findById, existsById, save y deleteById. Solo se agregan los imports de PutMapping y DeleteMapping.
- Advertencia: si la tabla de integrantes tiene llave foránea hacia equipo, el DELETE puede fallar mientras existan integrantes asociados.