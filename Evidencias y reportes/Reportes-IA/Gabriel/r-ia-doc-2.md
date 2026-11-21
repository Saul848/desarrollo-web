# Reporte de Uso Documental en el Proyecto

**Fecha:**  
20/11/2026
**Número de reporte:**  
2
---

# 1. Breve descripción de uso

Utilizacion para solucionar problemas con la conexion en las peticiones a la base de datos
---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| 20/11/2026 | gemini | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Prompt-1) |
| 20/11/2026 | Gemini | [PROMPT 2](#Prompt-2) | [RESPUESTA A PROMPT 2](#Prompt-2) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
En el segundo reporte de ia de gabriel se uso la IA para solucionar los problemas con la comunicacion de la base de datos

#### Prompt-1
Estoy desarrollando un sistema escolar con Spring Boot y JPA. tengo creada la clase mensaje en java y la entidad mensajes en mi base de datos pero al resolver la peticiones me marca error y no se insertan los datos

#### Respuesta a promt 1
Utiliza la anotación @Column de JPA, que permite que el nombre del atributo en Java sea diferente al nombre de la columna en PostgreSQL.

En nuestro caso, tenemos esta diferencia:
Java (Mensaje.java)	PostgreSQL (desweb.mensajes)
idDestinatario	-> destinatario
id	-> id_mensaje
remitente	-> remitente
asunto	-> asunto
cuerpo	-> cuerpo
leido ->	leido
fecha	-> fecha

#### Prompt-2
Ayudame a actualizar el estado del mensaje a leido despues de abrirlo.

#### Respuesta a promt 2
Implementa un método en el controlador para cambiar el atributo leido del mensaje a true cuando el usuario abre un correo que todavía no ha sido leído.

utiliza:

PUT /mensajes/{id}/leido

Los mensajes se marcan automáticamente como leídos al abrirlos, permitiendo distinguir entre los mensajes pendientes de lectura y los que ya fueron revisados.