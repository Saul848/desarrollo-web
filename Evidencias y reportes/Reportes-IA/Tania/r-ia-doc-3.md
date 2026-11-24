# Reporte de Uso Documental en el Proyecto

**Fecha:**  20/11/2026
**Número de reporte:** 3  

---

# 1. Breve descripción de uso

Se investigó cómo conectar el backend con el frontend.

---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| Día 11 | Gemini | [PROMPT 1](#prompt-1) | [RESPUESTA 1](#respuesta-a-prompt-1) |
| Día 11 | Gemini | [PROMPT 2](#prompt-2) | [RESPUESTA 2](#respuesta-a-prompt-2) |


> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---
### Prompt-1
si tengo un proyecto local, pero el backend lo estoy trabajando en java con spring, cómo puedo hacer que se conecte?

### Respuesta a prompt 1
Para conectar tu proyecto local (por ejemplo, un frontend en HTML/CSS/JS, React, Vue o un cliente de escritorio) con un backend en **Spring Boot**, necesitas dos cosas: **exponer endpoints HTTP desde Spring** y **permitir peticiones desde el origen de tu proyecto local (CORS)**.

---

### 1. Crea un controlador REST en Spring Boot

Asegúrate de que tu aplicación Spring Boot tenga la dependencia `spring-boot-starter-web` y define tus rutas con `@RestController`:

```java
package com.ejemplo.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EstadoController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("mensaje", "Conexión exitosa desde Spring Boot");
    }
}

```

Por defecto, Spring Boot levanta el servidor en `http://localhost:8080` (puedes cambiarlo en `src/main/resources/application.properties` con `server.port=8081`).

---

### 2. Configura CORS en Spring Boot

Si tu frontend corre en otro puerto o protocolo (por ejemplo, `http://localhost:5173`, `http://localhost:3000`, o se abre directo como `file://`), el navegador bloqueará la petición a menos que habilites **CORS** (Cross-Origin Resource Sharing).

Puedes configurarlo de forma global en una clase de configuración:

```java
package com.ejemplo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5500")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}

```

---

### 3. Llama al backend desde tu proyecto local

Desde tu código frontend (por ejemplo, en JavaScript con `fetch`), apunta a la URL completa de tu servidor local:

```javascript
async function probarConexion() {
  try {
    const respuesta = await fetch("http://localhost:8080/api/ping");
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    console.log(datos);
  } catch (error) {
    console.error("No se pudo conectar con Spring Boot:", error);
  }
}

probarConexion();

```

---

### 4. Checklist rápido si algo falla

| Situación | Causa habitual | Cómo resolverlo |
| --- | --- | --- |
| **Error de CORS en consola** | El puerto o dominio del frontend no está en `allowedOrigins` | Agrega la URL exacta (incluyendo puerto) o usa `allowedOriginPatterns("*")` solo en desarrollo local. |
| **`ERR_CONNECTION_REFUSED`** | El servidor Spring Boot no está corriendo o usa otro puerto | Verifica la consola de tu IDE/terminal y confirma el puerto en `application.properties`. |
| **Error `404 Not Found**` | La ruta no coincide con `@RequestMapping` + `@GetMapping` | Revisa mayúsculas, prefijos (`/api/ping`) y que el controlador esté dentro del paquete principal o subpaquete de `@SpringBootApplication`. |
| **Error `401` / `403**` | Tienes Spring Security activo sin configurar rutas públicas | Permite las rutas o configura autenticación según corresponda en tu `SecurityFilterChain`. |

Si me indicas qué tecnología usa tu proyecto local (por ejemplo, HTML/JS puro, React, Angular, etc.) y si ya tienes Spring Security o base de datos conectada, te muestro el ajuste exacto para tu caso.
### Prompt-2
qué diferencia hay entre hacer un controlador y agregarlo en una clase como CrossOrigin()?

### Respuesta a prompt 2
Son dos piezas distintas y complementarias en Spring Boot: el **controlador** define qué URLs existen y qué responden, mientras que la configuración **CORS** (`@CrossOrigin` o `CorsRegistry`) le dice al navegador qué orígenes externos tienen permiso para llamar a esas URLs.

---

### 1. El controlador (`@RestController`)

Define la **lógica de entrada y salida HTTP** de tu API:

* Qué ruta atiende (`@RequestMapping`, `@GetMapping`, `@PostMapping`, etc.).
* Qué datos recibe (parámetros, cuerpo JSON, headers) y qué devuelve (objetos, listas, códigos HTTP).
* Delega el trabajo pesado a servicios o repositorios.

Sin controlador, **no existe el endpoint** (el servidor respondería `404 Not Found`).

---

### 2. CORS (`@CrossOrigin` o configuración global)

Resuelve una **política de seguridad del navegador** (Same-Origin Policy) cuando tu frontend está en un origen distinto al del backend (por ejemplo, frontend en `http://localhost:5173` y backend en `http://localhost:8080`, o en dominios distintos en producción).

* El servidor sí recibe la petición y puede procesarla, pero el navegador **bloquea la lectura de la respuesta** en el frontend si el backend no envía los encabezados `Access-Control-Allow-*` correspondientes.
* `@CrossOrigin` aplica CORS a nivel de controlador o método específico; una clase con `WebMvcConfigurer` (`addCorsMappings`) lo aplica de forma global a varias rutas.

Sin CORS habilitado (cuando hay distinto origen), **el endpoint sí existe**, pero el navegador rechaza el acceso desde el script del frontend.

---

### Resumen de diferencias

| Aspecto | Controlador (`@RestController`) | CORS (`@CrossOrigin` / `WebMvcConfigurer`) |
| --- | --- | --- |
| **Propósito** | Exponer rutas y manejar peticiones/respuestas HTTP | Autorizar orígenes externos en el navegador |
| **Dónde actúa** | En el servidor al enrutar y procesar la petición | En las cabeceras HTTP que guían al navegador |
| **Si falta...** | Obtienes `404 Not Found` (la ruta no existe) | El navegador bloquea la respuesta por origen cruzado |
| **Alcance típico** | Por recurso/dominio (`UsuarioController`, `TareaController`) | Por ruta o método (anotación) o global (`addCorsMappings`) |

### ¿Cuándo usar cada enfoque de CORS?

* **`@CrossOrigin` en controlador/método:** práctico si solo un controlador o un endpoint puntual necesita un origen especial.
* **Clase global con `WebMvcConfigurer`:** más limpio y mantenible cuando toda tu API (`/api/**`) es consumida por uno o varios frontends conocidos.
* **Nota importante:** CORS **no** es un mecanismo de autenticación ni bloquea peticiones directas desde herramientas como `curl` o Postman; solo instruye a los navegadores web. Si también tienes Spring Security, asegúrate de que el orden de filtros permita las peticiones `OPTIONS` (preflight) y tus rutas públicas/protegidas.
