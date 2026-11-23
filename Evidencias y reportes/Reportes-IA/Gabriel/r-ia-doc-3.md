# Reporte de Uso Documental en el Proyecto

**Fecha:**  
22/11/2026
**Número de reporte:**  
3
---

# 1. Breve descripción de uso

Describir la intención general de las consultas.

Se utilizó la IA para mostrar el nombre del remitente en los correos recibidos, evitando que la interfaz mostrara únicamente su matrícula.
Se utilizó la IA para modificar el formato de las fechas de los mensajes, buscando que fueran más fáciles de leer en la bandeja de entrada y en el detalle del correo.
---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| 21/11/2026 | ChatGPT | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Prompt-1) |
| 21/11/2026 | ChatGPT | [PROMPT 2](#Prompt-2) | [RESPUESTA A PROMPT 2](#Prompt-2) |
| 21/11/2026 | ChatGPT | [PROMPT 3](#Prompt-3) | [RESPUESTA A PROMPT 3](#Prompt-3) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
Se trabajó con la consulta de usuarios desde el controlador y la transformación de los mensajes antes de enviarlos al frontend

#### Prompt-1
¿Cómo puedo mostrar el nombre del remitente en lugar de su matrícula en la bandeja de entrada?

#### Respuesta a promt 1
Para mostrar el nombre del remitente en lugar de su matrícula, modifica el método obtenerMensajePorDestinatario() del archivo MensajeControlador.java. Agrega una consulta al repositorio de usuarios para buscar al remitente mediante su matrícula y obtener su nombre. 
[codigo]
ajusta la respuesta del método para devolver el nombre junto con los datos del mensaje, sin modificar la estructura de la tabla en la base de datos.

#### Prompt-2
¿Cómo implementar la búsqueda de correos por una palabra del asunto, pero solamente para el usuario que inició sesión?

#### Respuesta a promt 2
En IMensaje.java: agregar un método que permita buscar mensajes por asunto y por matrícula del destinatario:
List<Mensaje> findByIdDestinatarioAndAsuntoContainingIgnoreCase(
    String idDestinatario, String asunto);

2. En MensajeControlador.java: crear el endpoint GET /mensajes/buscar, recibir los parámetros asunto e idDestinatario, validar que la palabra de búsqueda no esté vacía y ejecutar el método del repositorio para obtener únicamente los mensajes del destinatario indicado.
3. En correo.js: crear la función buscarCorreos(), obtener la palabra escrita en el buscador y la matrícula del usuario que inició sesión. Después, enviar ambos datos al endpoint mediante fetch() y mostrar los resultados utilizando renderizarTabla(mensajes).

#### Prompt-3
¿Cómo puedo cambiar el formato de fecha que aparece en los correos para que sea más legible? pase una imagen de lo que me mostraba el correo 

#### Respuesta a promt 3
agregar una función llamada formatearFecha(fecha). Esta función recibe la fecha enviada por el backend, separa sus componentes (día, mes, año, hora y minutos) y los reorganiza para mostrarlos en un formato más sencillo de interpretar.

1. En renderizarTabla(mensajes), para mostrar la fecha con un formato legible en cada correo de la bandeja de entrada.
2. En abrirCorreo(msg), para presentar la fecha correctamente cuando se abre un mensaje y se muestra su panel de detalles.
De esta manera, se buscaba mantener el mismo formato de fecha tanto en la bandeja de entrada como al consultar el contenido de un correo.
