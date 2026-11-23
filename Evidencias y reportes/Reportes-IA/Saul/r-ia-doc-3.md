# Reporte de Uso Documental en el Proyecto

**Fecha:**
22/11/2026
**Número de reporte:**  
3
---

# 1. Breve descripción de uso

Aclarar dudas sobre respuestas HTTP

---

# 2. Evidencias de uso

| Fecha      | Herramienta | Enlace a prompt       | Enlace a respuesta                            |
|------------|-------------|-----------------------|-----------------------------------------------|
| 22/11/2026 | Gemini      | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Respuesta-a-prompt-1) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
Este es como tal el primer reporte del miembro Saul Ortiz Zarate, para la primera entrega solo se utilizó IA para cuestiones triviales no muy relevantes.


#### Prompt-1
Hola, estoy trabajando en el inicio de sesión de mi página. Me aparece el error ERR_CONNECTION_REFUSE en consola y por ende me aparece un error en el fetch, ¿a qué se debe este error y cómo lo soluciono?

#### Respuesta a prompt 1
El error `net::ERR_CONNECTION_REFUSED` al intentar hacer `fetch` a `http://localhost:8080/usuarios/login` significa que **ningún proceso está escuchando en el puerto `8080` de tu máquina en el momento de la petición** (el sistema operativo rechaza activamente la conexión). El `TypeError: Failed to fetch` en `Login.js:33` es la consecuencia directa de que la petición de red ni siquiera logró establecer conexión con el servidor.

### Causas más comunes en desarrollo local

* **El backend no está iniciado o falló al arrancar:** El servidor (por ejemplo, Spring Boot, Node/Express, etc.) está detenido o se cerró por un error de compilación, base de datos o configuración.
* **Puerto o interfaz incorrectos:** El backend está corriendo en otro puerto (por ejemplo, `3000`, `5000`, `8000`) o está enlazado a una dirección distinta. Si usas WSL y Windows mezclados, `localhost` en un entorno puede no apuntar al mismo socket que en el otro.
* **Firewall o bloqueo de red local:** Alguna regla de firewall o contenedor está bloqueando el puerto `8080`.

### Cómo diagnosticarlo y solucionarlo

1. **Verifica si el backend está corriendo y escucha en el puerto 8080:** Revisa la terminal o consola de tu servidor.
Abre la terminal donde ejecutas tu backend y comprueba que esté activo sin errores de inicio. En terminal puedes revisar si el puerto `8080` está en estado `LISTEN` (en Linux/WSL: `ss -tulpn | grep 8080` o `lsof -i :8080`; en Windows PowerShell: `Get-NetTCPConnection -LocalPort 8080`).
*Verification:* El comando o log del servidor muestra que el proceso está activo y escuchando en el puerto `8080`.


2. **Inicia o reinicia el servicio del backend:** Si no está escuchando, arráncalo.
Si el puerto no aparece en escucha, inicia tu servidor backend desde su carpeta del proyecto y revisa los logs en busca de excepciones (como credenciales inválidas, puerto ya ocupado o fallo al conectar a la base de datos). Si ya estaba abierto, reinícialo para asegurar que cargó los cambios recientes.
*Verification:* La consola del backend imprime su mensaje de arranque completado (por ejemplo, *Started Application* o *Server listening on port 8080*) sin detenerse.


3. **Confirma la URL y el puerto en Login.js:** Revisa la línea 33 de Login.js.
Comprueba que la URL pasada a `fetch` coincida exactamente con el protocolo (`http` vs `https`), host y puerto real del servidor (`http://localhost:8080/usuarios/login`), y que la ruta `/usuarios/login` exista en tu controlador o router.
*Verification:* Al enviar el formulario en el navegador, la pestaña **Red (Network)** de DevTools muestra la petición a `localhost:8080/usuarios/login` con un código de estado HTTP (como `200`, `401` o `404`) en lugar de `(failed) net::ERR_CONNECTION_REFUSED`.


> Nota: Si el servidor sí responde con un código HTTP (por ejemplo `401` o `200`), pero en consola aparece un error de **CORS**, significa que el backend ya está levantado pero falta permitir el origen de tu frontend en las cabeceras CORS.
