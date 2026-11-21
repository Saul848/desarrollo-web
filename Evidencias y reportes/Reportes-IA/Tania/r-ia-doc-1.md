# Reporte de Uso Documental en el Proyecto

**Fecha:**  12/11/2026
**Número de reporte:**  1

---

# 1. Breve descripción de uso

Se realizaron consultas sobre la base de datos, para definir los tipos de datos, resolver algunas dudas generales, poblarla, etc.
---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| Día 1 | Gemini | [PROMPT 1](#prompt-1) | [RESPUESTA 1](#respuesta-a-prompt-1) |
| Día 1 | Gemini | [PROMPT 2](#prompt-2) | [RESPUESTA 2](#respuesta-a-prompt-2) |
| Día 1 | Gemini | [PROMPT 3](#prompt-3) | [RESPUESTA 3](#respuesta-a-prompt-3) |
| Día 1 | Gemini | [PROMPT 4](#prompt-4) | [RESPUESTA 4](#respuesta-a-prompt-4) |
| | | | |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales

Agregar cualquier comentario explicativo relevante.

### Prompt-1
oye, tengo una duda, puedo definir el formato de una matrícula y que vaya incrementando?, por ejemplo, si quiero que la matrículaa empiece con dos letras y de ahí quiero que tenga un número de 4 dígitos, por ejemplo: ab0000, se puede hacer o no?

### Respuesta a prompt 1
¡Sí se puede, pero con un pequeño truco!

Directamente en PostgreSQL, un campo autoincrementable tradicional (`SERIAL` o `IDENTITY`) **solo genera números** (1, 2, 3...), por lo que no puede insertar texto como `ab0001` por sí solo nativamente en una sola columna sin ayuda.

Sin embargo, para lograr exactamente lo que buscas (`ab0000`, `ab0001`, etc.), tienes **dos formas principales de resolverlo**:

---

### Opción 1: Desde el código de tu aplicación (La más fácil y recomendada)

La forma más práctica en la mayoría de proyectos escolares es manejar esa lógica en tu backend (Java, Node.js, PHP, Python, etc.) antes de hacer el `INSERT` a la base de datos:

1. Consultas cuál fue el último alumno registrado (o cuántos alumnos hay).
2. Tomas el número, lo incrementas en 1.
3. Lo formateas rellenando con ceros a la izquierda y le antepones las letras (por ejemplo, en código: `"ab" + String.format("%04d", siguienteNumero)`).
4. Guardas ese texto directamente en la columna `matricula` (que sería de tipo `VARCHAR` y PK).

---

### Opción 2: Automático en la Base de Datos con una Secuencia y una Función (El toque pro)

Si quieres que la base de datos se encargue solita de generar ese formato cada vez que registres un alumno sin ponerle matrícula, puedes usar una **Secuencia** combinada con una función de formato.

Aquí te muestro cómo podrías adaptarlo en PostgreSQL:

1. **Crear una secuencia numérica normal:**
```sql
CREATE SEQUENCE seq_matricula_numero START 1;

```


2. **Crear una función que tome el número de la secuencia, le ponga el "ab" y lo rellene con ceros:**
```sql
CREATE OR REPLACE FUNCTION generar_matricula() 
RETURNS TRIGGER AS $$
BEGIN
    -- Si no mandan matrícula, la genera automáticamente en formato ab0000
    IF NEW.matricula IS NULL OR NEW.matricula = '' THEN
        NEW.matricula := 'ab' || LPAD(nextval('seq_matricula_numero')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

```


3. **Crear un Trigger en tu tabla `alumno` para que se ejecute antes de cada inserción:**
```sql
CREATE TRIGGER trigger_crear_matricula
BEFORE INSERT ON alumno
FOR EACH ROW
EXECUTE FUNCTION generar_matricula();

```



### ¿Cómo funcionaría con este Trigger?

Cuando hagas un `INSERT` en tu tabla alumno **sin incluir el campo matrícula** (o mandándolo vacío), por ejemplo:

```sql
INSERT INTO alumno (nombre, correo_institucional, password) 
VALUES ('Juan Pérez', 'juan@uv.mx', '123456');

```

PostgreSQL automáticamente interceptará la inserción, consultará la secuencia y guardará en la base de datos la matrícula **`ab0001`** (y el siguiente será **`ab0002`**, y así sucesivamente).

¿Qué te parece? ¿Prefieres controlarlo desde tu código de programación o te gusta más la idea de hacerlo automático con el Trigger en la base de datos?

### Prompt-2
podrías darme los tipos de datos que pueden ser utilizados para fechas en postgresql?

### Respuesta a prompt 2
¡Claro que sí! En PostgreSQL existen varios tipos de datos diseñados específicamente para manejar fechas, horas y marcas de tiempo, dependiendo exactamente de lo que necesites almacenar.

Aquí te muestro los principales que puedes utilizar en tu base de datos:

---

### 1. Tipos de datos principales

| Tipo de Dato | Descripción / Formato | Rango de Años | Uso común en sistemas |
| --- | --- | --- | --- |
| **`DATE`** | Almacena solo la fecha (Año, Mes, Día). | 4713 a.C. hasta el 587489 d.C. | Fechas de nacimiento, días de inscripción, fechas límite sin hora exacta. |
| **`TIME`** | Almacena solo la hora (Horas, Minutos, Segundos). | `00:00:00` hasta `24:00:00` | Horarios de clases, horas de apertura o cierre. |
| **`TIMESTAMP`** | Almacena **fecha y hora juntas** (Sin zona horaria). | 4713 a.C. hasta el 587489 d.C. | Registro de entregas de tareas, marcas de tiempo en bitácoras (`logs`), fechas de creación. |
| **`TIMESTAMPTZ`** | Almacena fecha, hora **y la zona horaria** (Timestamp with time zone). | 4713 a.C. hasta el 587489 d.C. | Sistemas distribuidos o aplicaciones web donde los usuarios se conectan desde diferentes países/regiones. |
| **`INTERVAL`** | Almacena un **periodo o duración de tiempo** (ej. "3 horas", "5 días"). | -178 millones de años a 178 millones de años | Plazos de prórrogas, tiempos límite de exámenes (ej. calcular 60 minutos a partir de una hora de inicio). |

---

### ¿Cuál deberías usar para tu plataforma escolar?

* **Para las fechas límites de tareas y exámenes** (`fecha_termino`, `fecha_limite`):
Te conviene usar **`TIMESTAMP`** (o `TIMESTAMPTZ`), ya que una tarea o examen normalmente vence en una **fecha y hora exacta** (ej. el 30 de noviembre de 2026 a las 23:59 hrs).
* **Para el tiempo límite de un examen en minutos** (si prefieres guardarlo como intervalo en lugar de un número entero):
Podrías usar **`INTERVAL`** (aunque en tu esquema actual lo definiste como `INT` para guardar los minutos directamente, lo cual también es totalmente válido y muy práctico).
* **Para la bitácora o logs** (`fecha_hora`):
Definitivamente **`TIMESTAMP`** con un valor por defecto `DEFAULT CURRENT_TIMESTAMP`, para que la base de datos guarde el segundo exacto en el que ocurrió la acción de forma automática.

¿Te gustaría ver un ejemplo de cómo declarar estos tipos de datos al momento de hacer un `INSERT` o `SELECT` en tus tablas?

### Prompt-3
CREATE TABLE esta_en_grupo (
    id_grupo INT NOT NULL,
    matricula_alumno VARCHAR(15) NOT NULL,
    rol rol_usuario NOT NULL,
    PRIMARY KEY (id_grupo, matricula_alumno),
    CONSTRAINT fk_estagrupo_grupo 
		FOREIGN KEY (id_grupo) 
		REFERENCES grupo(id_grupo) 
		ON DELETE CASCADE,
    CONSTRAINT fk_estagrupo_alumno 
		FOREIGN KEY (matricula_alumno) 
		REFERENCES alumno(matricula) 
		ON DELETE CASCADE
);

en esta tabla, solamente estoy agregando alumnos, pero necesito un profesor también, si pongo matricula_alumno y matricula_profesor como nullable?, podría quitar el rol, pero mi duda es si puedo dejar una llave foranea como null?

### Respuesta a prompt 3
¡Sí, **absolutamente sí se puede** dejar una llave foránea como `NULL` en PostgreSQL (y en cualquier base de datos relacional estándar)!

Una columna que es llave foránea (`FOREIGN KEY`) puede aceptar valores `NULL` a menos que le agregues explícitamente la restricción `NOT NULL`.

Sin embargo, aplicando esto a tu tabla de relación con los grupos, **separarlo en dos columnas nulas (`matricula_alumno` y `id_profesor`) te va a traer un pequeño problema lógico**, y te explico por qué:

### El problema de tener dos columnas separadas en la misma tabla:

Si dejas las dos columnas permitiendo `NULL`:

* Registro 1: `id_grupo = 1`, `matricula_alumno = 'ab0001'`, `id_profesor = NULL` (Es un alumno).
* Registro 2: `id_grupo = 1`, `matricula_alumno = NULL`, `id_profesor = 'P001'` (Es un profesor).

Esto funciona técnicamente, pero rompe un poco las reglas limpias de diseño porque **un registro podría tener tanto al alumno como al profesor al mismo tiempo por error**, o peor aún, **ambos campos podrían quedar en `NULL**` y la tabla aceptaría la fila sin saber quién pertenece al grupo.

---

### Las 2 mejores formas de resolverlo:

#### Opción 1: Mantener la tabla `esta_en_grupo` solo para alumnos (y el profesor ya vive en la tabla `grupo`)

Recuerda que en tu tabla principal **`grupo`** ya tienes una columna llamada `id_profesor` que apunta directamente al maestro que imparte la clase.

* ¿Para qué querrías volver a meter al profesor en `esta_en_grupo`? Un grupo por lo一般 solo tiene **un** profesor principal asignado en la tabla `grupo`, y **muchos** alumnos inscritos en la tabla intermedia `esta_en_grupo`.
* Si esa era tu intención, ¡puedes dejar `esta_en_grupo` exclusivamente para alumnos y te ahorras complicaciones!

#### Opción 2: Si un grupo puede tener MÚLTIPLES profesores y alumnos (Enfoque Polimórfico)

Si realmente necesitas que tanto profes como alumnos compartan la misma tabla de asignación al grupo, la forma más limpia (evitando columnas nulas cruzadas) es usar un diseño similar al que vimos en los mensajes:

```sql
CREATE TABLE miembro_grupo (
    id_grupo INT NOT NULL,
    usuario_id VARCHAR(15) NOT NULL, -- Aquí guardas la matrícula del alumno o el ID del profesor
    tipo_usuario rol_usuario NOT NULL, -- 'alumno' o 'maestro'
    PRIMARY KEY (id_grupo, usuario_id),
    CONSTRAINT fk_miembro_grupo FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo) ON DELETE CASCADE
);

```

* **Ventaja:** Te ahorras tener columnas vacías (`NULL`), la tabla no crece a lo ancho, y con el campo `tipo_usuario` sabes exactamente quién es quién. *(Ojo: aquí aplica lo mismo que en los mensajes, la llave foránea directa hacia alumno/profesor no se puede hacer a nivel físico por ser polimórfico, pero se valida desde el código).*

### En resumen:

* **¿Se puede dejar una FK como NULL?** Sí, totalmente. Si defines `id_profesor INT NULL`, PostgreSQL lo aceptará sin problemas cuando esté vacío.
* Pero cuéntame, ¿el profesor que quieres agregar a `esta_en_grupo` es el profesor titular de la materia (que ya está en la tabla `grupo`), o son profesores invitados/adjuntos?

### Prompt-4
teniendo la siguiente base de datos, ¿podrías darme al menos 10 registros para poblar la bd?
(agregué archivo .sql)

### Respuesta a prompt 4
¡Claro que sí! Para poblar tu base de datos correctamente sin que te marquen error las llaves foráneas, el orden de inserción es fundamental (primero los usuarios, luego los grupos, tareas, exámenes, etc.).

Aquí tienes un conjunto de datos de prueba coherentes que cubren **todas las tablas** de tu esquema:

```sql
set search_path to desweb, public;

--------------------------------------------------
-- 1. USUARIOS (Profesores y Alumnos)
--------------------------------------------------
INSERT INTO usuario (matricula, nombre, correo_institucional, password, rol) VALUES
('P001', 'Dr. Carlos Pérez', 'cperez@uv.mx', 'hash_seguro_1', 'profesor'),
('P002', 'Dra. María Gómez', 'mgomez@uv.mx', 'hash_seguro_2', 'profesor'),
('S21001', 'Juan Pérez López', 'jperez@estudiantes.uv.mx', 'hash_seguro_3', 'alumno'),
('S21002', 'Ana María Torres', 'atorres@estudiantes.uv.mx', 'hash_seguro_4', 'alumno'),
('S21003', 'Luis Fernando Ruiz', 'lruiz@estudiantes.uv.mx', 'hash_seguro_5', 'alumno'),
('S21004', 'Sofía Morales', 'smorales@estudiantes.uv.mx', 'hash_seguro_6', 'alumno'),
('S21005', 'Diego Hernández', 'dhernandez@estudiantes.uv.mx', 'hash_seguro_7', 'alumno'),
('S21006', 'Valeria Castillo', 'vcastillo@estudiantes.uv.mx', 'hash_seguro_8', 'alumno'),
('S21007', 'Jorge Ramírez', 'jramirez@estudiantes.uv.mx', 'hash_seguro_9', 'alumno'),
('S21008', 'Carla Jimena Soto', 'csoto@estudiantes.uv.mx', 'hash_seguro_10', 'alumno');

--------------------------------------------------
-- 2. GRUPOS
--------------------------------------------------
INSERT INTO grupo (id_materia, matricula_profesor, fecha_inicio, fecha_fin, activo) VALUES
(101, 'P001', '2026-03-01 07:00:00', '2026-07-15 20:00:00', TRUE),
(102, 'P002', '2026-03-01 09:00:00', '2026-07-15 20:00:00', TRUE);

--------------------------------------------------
-- 3. ESTA_EN_GRUPO (Inscripciones de Alumnos)
--------------------------------------------------
INSERT INTO esta_en_grupo (id_grupo, matricula_alumno) VALUES
(1, 'S21001'),
(1, 'S21002'),
(1, 'S21003'),
(1, 'S21004'),
(1, 'S21005'),
(2, 'S21006'),
(2, 'S21007'),
(2, 'S21008');

--------------------------------------------------
-- 4. TAREAS
--------------------------------------------------
INSERT INTO tarea (id_grupo, titulo, descripcion, calificacion, fecha_inicio, fecha_termino, estado) VALUES
(1, 'Diagrama Entidad-Relación', 'Subir el diagrama DER en formato PDF con su diccionario de datos.', 10.00, '2026-03-10 08:00:00', '2026-03-20 23:59:59', 'activo'),
(1, 'Normalización de BD', 'Resolver los ejercicios de 1FN, 2FN y 3FN vistos en clase.', 10.00, '2026-03-21 08:00:00', '2026-03-30 23:59:59', 'activo'),
(2, 'Configuración de Nginx', 'Instalar y configurar un servidor web Nginx en Ubuntu Server.', 10.00, '2026-03-12 08:00:00', '2026-03-25 23:59:59', 'activo');

--------------------------------------------------
-- 5. EQUIPOS
--------------------------------------------------
INSERT INTO equipo (id_tarea, nombre_equipo, integrantes) VALUES
(1, 'Los Compiladores', 3),
(1, 'Query Masters', 2);

--------------------------------------------------
-- 6. INTEGRANTES_EQUIPO
--------------------------------------------------
INSERT INTO integrantes_equipo (id_equipo, id_alumno) VALUES
(1, 'S21001'),
(1, 'S21002'),
(1, 'S21003'),
(2, 'S21004'),
(2, 'S21005');

--------------------------------------------------
-- 7. ENTREGAS
--------------------------------------------------
INSERT INTO entrega (id_actividad, id_alumno, contenido, archivos, calificacion_obtenida, retroalimentacion, fecha_entrega) VALUES
(1, 'S21001', 'Adjunto el documento en PDF con el diagrama de nuestro equipo.', '/uploads/tareas/der_s21001.pdf', 9.50, 'Excelente trabajo y modelado correcto.', '2026-03-18 15:30:00'),
(1, 'S21002', 'Enviando la tarea asignada.', '/uploads/tareas/der_s21002.pdf', 9.00, 'Revisar las cardinalidades de la tabla intermedia.', '2026-03-19 18:20:00');

--------------------------------------------------
-- 8. EXAMENES
--------------------------------------------------
INSERT INTO examen (id_grupo, titulo, calificacion_asignada, fecha_limite, intentos_permitidos, tiempo_limite) VALUES
(1, 'Examen Parcial 1 - Base de Datos', 10.00, '2026-04-05 23:59:59', 2, INTERVAL '1 hour 30 minutes');

--------------------------------------------------
-- 9. REACTIVOS (Preguntas del examen)
--------------------------------------------------
INSERT INTO reactivo (id_examen, tipo, enunciado, opcion_1, opcion_2, opcion_3, opcion_4, respuesta_correcta, valor) VALUES
(1, 'opcion_multiple', '¿Qué comando de SQL se utiliza para eliminar una tabla por completo?', 'DELETE TABLE', 'DROP TABLE', 'REMOVE TABLE', 'CLEAR TABLE', 2, 5.00),
(1, 'verdadero_falso', '¿Una llave primaria (Primary Key) permite valores nulos en PostgreSQL?', 'Verdadero', 'Falso', NULL, NULL, 2, 5.00);

--------------------------------------------------
-- 10. RESPUESTAS_ALUMNO
--------------------------------------------------
INSERT INTO respuestas_alumno (id_reactivo, id_alumno, opcion_elegida, respuesta_texto, es_correcta) VALUES
(1, 'S21001', 2, NULL, TRUE),
(2, 'S21001', 2, NULL, TRUE);

--------------------------------------------------
-- 11. MENSAJES
--------------------------------------------------
INSERT INTO mensajes (remitente, asunto, cuerpo, leido, fecha) VALUES
('P001', 'Bienvenida al curso', 'Estimados alumnos, bienvenidos a la experiencia educativa. Revisen el apartado de tareas.', FALSE, '2026-03-01 08:00:00');

```

Puedes copiar y pegar este bloque directamente en tu consola de PostgreSQL, DBeaver o pgAdmin y se poblará de manera limpia y sin conflictos de llaves foráneas. ¡Mucho éxito con tu plataforma!
