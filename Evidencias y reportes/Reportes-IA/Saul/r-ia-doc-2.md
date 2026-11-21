# Reporte de Uso Documental en el Proyecto

**Fecha:**
20/11/2026
**Número de reporte:**  
2
---

# 1. Breve descripción de uso

Describir la intención general de las consultas.
aclarar dudas sobre inserciones y modificaciones en la base de datos o dudas buscadas en el navegador de la cual se tomo la información 
ofrecida por la IA de google

---

# 2. Evidencias de uso

| Fecha      | Herramienta | Enlace a prompt       | Enlace a respuesta                            |
|------------|-------------|-----------------------|-----------------------------------------------|
| 12/11/2026 | Claude      | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Respuesta-a-prompt-1) |
| 12/11/2026 | Claude      | [PROMPT 2](#Prompt-2) | [RESPUESTA A PROMPT 2](#Respuesta-a-prompt-2) |
| 13/11/2026 | Claude      | [PROMPT 3](#Prompt-3) | [RESPUESTA A PROMPT 3](#Respuesta-a-prompt-3) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
Este es como tal el primer reporte del miembro Saul Ortiz Zarate, para la primera entrega solo se utilizó IA para cuestiones triviales no muy relevantes.


#### Prompt-1
añadir una columna a una tabla en postgres que además sirva como llave foranea a un atributo de otra tabla

#### Respuesta a prompt 1
Para agregar una columna que a la vez sea llave foránea, se combina `ADD COLUMN` con `REFERENCES`:

```sql
ALTER TABLE nombre_tabla
ADD COLUMN nombre_columna tipo_de_dato REFERENCES tabla_referenciada(columna_referenciada);
```

## Ejemplo
Si quisieras agregar una columna `id_profesor` a una tabla `tarea`, que referencie al `id` de la tabla `usuario`:

```sql
ALTER TABLE tarea
ADD COLUMN id_profesor INTEGER REFERENCES usuario(id);
```

## Si quieres que sea obligatoria (`NOT NULL`)

```sql
ALTER TABLE tarea
ADD COLUMN id_profesor INTEGER NOT NULL REFERENCES usuario(id);
```

**Importante:** esto solo funciona directamente si la tabla está vacía. Si ya tiene filas, PostgreSQL rechazará el `ALTER TABLE`, porque las filas existentes quedarían con `id_profesor = NULL`, violando la restricción recién creada. En ese caso, el proceso es en tres pasos:

```sql
-- 1. Agregar la columna sin NOT NULL
ALTER TABLE tarea
ADD COLUMN id_profesor INTEGER REFERENCES usuario(id);

-- 2. Actualizar las filas existentes con un valor válido
UPDATE tarea
SET id_profesor = 1  -- el id que corresponda
WHERE id_profesor IS NULL;

-- 3. Ahora sí, agregar la restricción NOT NULL
ALTER TABLE tarea
ALTER COLUMN id_profesor SET NOT NULL;
```

## Si quieres ponerle un nombre explícito a la restricción
Por defecto, PostgreSQL genera un nombre automático para la restricción `FOREIGN KEY`. Si prefieres nombrarla tú mismo (útil para identificarla después, por ejemplo si necesitas eliminarla):

```sql
ALTER TABLE tarea
ADD COLUMN id_profesor INTEGER,
ADD CONSTRAINT fk_tarea_profesor FOREIGN KEY (id_profesor) REFERENCES usuario(id);
```

## Verificar que se agregó correctamente

```sql
\d tarea
```

Esto te muestra la estructura completa de la tabla, incluyendo la nueva columna y su restricción de llave foránea.

¿Es para tu proyecto de administración de tareas en Spring (relacionando tareas con profesores o alumnos), o es para otra de tus tablas?

#### Prompt 2
iniciar servidor spring en consola wsl

#### Respuesta a prompt 2
Para iniciar un proyecto de Spring Boot desde la consola de WSL, navega hasta la carpeta raíz de tu proyecto y ejecuta ./mvnw spring-boot:run si usas Maven, o ./gradlew bootRun si usas Gradle.

Pasos para iniciarlo

1. Abre tu terminal de WSL (Ubuntu, Debian, etc.).
2. Ve a la carpeta del proyecto (donde está el archivo pom.xml o build.gradle):bash
cd /ruta/de/tu/proyecto
Usa el código con precaución.
(Si el proyecto está en tu disco de Windows, la ruta suele empezar con /mnt/c/Users/..., aunque por rendimiento se recomienda tenerlo dentro del sistema de archivos de Linux, como ~/proyectos/).
3. Ejecuta el comando según tu gestor de dependencias:
	• Para Maven:bash
./mvnw spring-boot:run
Usa el código con precaución.
	• Para Gradle:bash
./gradlew bootRun
Usa el código con precaución.

Posibles problemas comunes en WSL

• Error de permisos (Permission denied): Si es la primera vez que corres el wrapper en Linux, dale permisos de ejecución antes de iniciarlo:bash
chmod +x mvnw   # O chmod +x gradlew
Usa el código con precaución.
• Java no instalado en WSL: WSL no comparte el Java de Windows por defecto. Si te marca que no encuentra Java (JAVA_HOME not found), instálalo en WSL (por ejemplo, Java 17 o 21):bash
sudo apt update && sudo apt install openjdk-21-jdk -y
Usa el código con precaución.
• Detener el servidor: Presiona Ctrl + C en la consola.
Si te arroja algún error al ejecutarlo, dime:
• El mensaje de error exacto (o comparte una captura de tu terminal)
• Si usas Maven o Gradle
Con eso te ayudo a solucionarlo rápido.

#### Prompt 3
Me ayudarías a abrir la página con Live server

#### Respuesta a prompt 3
Estos son los pasos en VS Code:

1. **Instala la extensión.** En el panel de extensiones (`Ctrl + Shift + X`) busca **Live Server** (autor: Ritwick Dey) y presiona *Install*. Si trabajas con VS Code conectado a WSL, el botón dirá *Install in WSL*; usa ese.
2. **Abre la carpeta del proyecto, no un archivo suelto.** Con *File → Open Folder* elige la carpeta que contiene `frontend`. Live Server sirve lo que esté dentro de la carpeta abierta, y eso permite que el HTML encuentre `../css/lakoa.css` y el JavaScript.
3. **Inicia el servidor.** Haz clic derecho sobre `PaginaProfesor.html` en el explorador y elige **Open with Live Server**. También puedes abrir el archivo y presionar **Go Live** en la esquina inferior derecha.
4. **Revisa la dirección.** La página debe abrirse en el navegador con una URL como:

```
http://127.0.0.1:3000/frontend/html/PaginaProfesor.html
```

Es la misma que usabas antes, con el puerto `3000`. Si en la barra de direcciones ves `file:///...` o la consola dice `origin 'null'`, la abriste con doble clic y no con Live Server.

Para detener el servidor, haz clic en **Port: 3000** en la barra inferior.

**Si algo no sale**

- **No aparece "Go Live" ni la opción del clic derecho:** la extensión no está instalada en el lugar correcto (WSL, si usas esa conexión) o abriste un archivo en vez de una carpeta.
- **Se abre una página en blanco o sin estilos:** abre el HTML desde la carpeta correcta. Si Live Server toma otra carpeta como raíz, `../css/lakoa.css` apunta a un lugar que no existe, y la URL no incluiría `/frontend/html/`.
- **El puerto no es 3000:** el predeterminado de la extensión es 5500. El tuyo ya estaba en 3000, pero se cambia en los ajustes de la extensión (`liveServer.settings.port`) y no afecta al funcionamiento.

Recuerda que el backend de Spring debe estar corriendo en el puerto `9999`, porque Live Server solo sirve el frontend. Con eso, la lista de usuarios del modal debería cargar una vez que reinicies el backend con la configuración de CORS.