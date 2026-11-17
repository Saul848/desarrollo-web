# Reporte de IA Desarrollo en el Proyecto

**Fecha:**  16/11/2026
**Número de reporte:** 2  

---

# 1. Breve descripción de uso

Describir la intención general del desarrollo.
Implementar correctamente los métodos PUT y DELETE

---

# 2. Evidencias de uso

| Evidencia | Formato | 
|------------|------------------------|
Herramienta | Claude
Modelo/temperatura | Sonnet 5.5
Prompt original | Sí, la solución que me diste funcionó para poder ver a ese usuario que no aparecía. Ahora quiero implementar las peticiones PUT y DELETE tanto en la Profesor como en Examen
Respuesta de IA | [Respuesta](#Respuesta-de-IA)
Código anterior | Commit (48d2b5d)
Código posterior | Commit (0897eef)
Diferencias entre versiones | git diff --numstat 48d2b5d 0897eez (copiar la salida)
Prueba de funcionamiento | CURL o captura imagen del resultado
Código de uso | Generación / Modificación / Depuración / Explicación / Diseño / Revisión / Documentación / Pruebas
Reflexión del estudiante | Texto breve que describe lo obtenido u ocurrido y lo aprendido por parte del estudiante


> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales

Agregar cualquier comentario explicativo relevante.

#### Respuesta de IA

Como `Profesor` ahora es `Usuario`, los métodos de profesores van en `UsuarioControlador` y cubren también a los alumnos. Si todavía conservas un `ProfesorControlador` aparte, el código es el mismo cambiando los nombres.

**1. `UsuarioControlador`: agrega estos dos métodos**

```java
import org.springframework.dao.DataIntegrityViolationException;

// PUT /usuarios/P001
@PutMapping("/{matricula}")
public ResponseEntity<?> actualizarUsuario(@PathVariable String matricula,
                                           @Valid @RequestBody Usuario datos) {
    Optional<Usuario> buscado = iusuario.findById(matricula);
    if (buscado.isEmpty()) {
        return ResponseEntity.notFound().build();
    }
    Usuario existente = buscado.get();

    // El correo no puede pertenecer a otro usuario
    Optional<Usuario> conMismoCorreo = iusuario.findByCorreo(datos.getCorreo());
    if (conMismoCorreo.isPresent()
            && !conMismoCorreo.get().getMatricula().equals(matricula)) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Ese correo ya pertenece a otro usuario");
    }

    existente.setNombre(datos.getNombre());
    existente.setCorreo(datos.getCorreo());
    existente.setRol(datos.getRol());

    // Solo se cambia el password si el cliente envía uno nuevo
    if (datos.getPassword() != null && !datos.getPassword().isBlank()) {
        existente.setPassword(encoder.encode(datos.getPassword()));
    }
    return ResponseEntity.ok(iusuario.save(existente));
}

// DELETE /usuarios/P001
@DeleteMapping("/{matricula}")
public ResponseEntity<?> eliminarUsuario(@PathVariable String matricula) {
    if (!iusuario.existsById(matricula)) {
        return ResponseEntity.notFound().build();
    }
    try {
        iusuario.deleteById(matricula);
    } catch (DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("No se puede eliminar: el usuario tiene registros relacionados");
    }
    return ResponseEntity.noContent().build();
}
```

Decisiones del `PUT`:

- **La matrícula no se modifica.** Es la llave primaria y viene en la URL; si el cuerpo trae otra, se ignora.
- **El password es opcional.** Como se oculta en las respuestas, un cliente que edita un usuario normalmente no lo tiene. Si no lo envía, se conserva el hash actual.
- **Validación del correo.** Sin la comparación de matrículas, un usuario no podría guardar sus propios datos sin cambiar el correo, porque `findByCorreo` lo encontraría a él mismo.

**2. `ExamenControlador`: agrega estos dos métodos**

```java
import org.springframework.dao.DataIntegrityViolationException;

// PUT /examenes/3
@PutMapping("/{id}")
public ResponseEntity<Examen> actualizarExamen(@PathVariable Integer id,
                                               @RequestBody Examen datos) {
    return iexamen.findById(id)
            .map(existente -> {
                existente.setId_grupo(datos.getId_grupo());
                existente.setTitulo(datos.getTitulo());
                existente.setCalificacion(datos.getCalificacion());
                existente.setFecha_limite(datos.getFecha_limite());
                existente.setIntentos(datos.getIntentos());
                existente.setTiempo_limite(datos.getTiempo_limite());
                return ResponseEntity.ok(iexamen.save(existente));
            })
            .orElse(ResponseEntity.notFound().build());
}

// DELETE /examenes/3
@DeleteMapping("/{id}")
public ResponseEntity<?> eliminarExamen(@PathVariable Integer id) {
    if (!iexamen.existsById(id)) {
        return ResponseEntity.notFound().build();
    }
    try {
        iexamen.deleteById(id);
    } catch (DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("No se puede eliminar: el examen tiene registros relacionados");
    }
    return ResponseEntity.noContent().build();
}
```

Ajusta los nombres de los setters a los que tengan tus clases. Ambos `DELETE` devuelven **204** si se elimina, **404** si no existe y **409** si otra tabla lo referencia con una llave foránea. Sin ese `try/catch`, ese último caso termina en un error 500.

**3. Un detalle que puede fallar**

Hibernate también ejecuta las validaciones de la entidad al actualizar. Si tu `@Pattern(regexp = "\\d{8}")` sigue en `matricula`, un `PUT` sobre `P001` fallará aunque no cambies la matrícula, porque `P001` no cumple el patrón. Ajústalo al formato real o quítalo.

**4. Pruebas con curl en WSL**

```bash
BASE=http://localhost:9999

# Actualizar un profesor -> 200 (sin password: se conserva)
curl -i -X PUT $BASE/usuarios/P001 -H "Content-Type: application/json" \
  -d '{"nombre":"Dr. Carlos Pérez G.","correo":"cperez@uv.mx","rol":"profesor"}'

# Actualizar con password nuevo -> 200 (se guarda cifrado)
curl -i -X PUT $BASE/usuarios/P001 -H "Content-Type: application/json" \
  -d '{"nombre":"Dr. Carlos Pérez G.","correo":"cperez@uv.mx","password":"nueva123","rol":"profesor"}'

# Correo de otro usuario -> 409
curl -i -X PUT $BASE/usuarios/P001 -H "Content-Type: application/json" \
  -d '{"nombre":"Dr. Carlos Pérez","correo":"mgomez@uv.mx","rol":"profesor"}'

# Usuario inexistente -> 404
curl -i -X PUT $BASE/usuarios/X999 -H "Content-Type: application/json" \
  -d '{"nombre":"Nadie","correo":"n@uv.mx","rol":"alumno"}'

# Eliminar -> 204; repetirlo -> 404
curl -i -X DELETE $BASE/usuarios/S21008

# Examen: actualizar y eliminar
curl -i -X PUT $BASE/examenes/1 -H "Content-Type: application/json" \
  -d '{"id_grupo":5,"titulo":"Examen parcial 1 (revisado)","calificacion":0,"fecha_limite":"2026-12-05","intentos":3,"tiempo_limite":90}'

curl -i -X DELETE $BASE/examenes/1
```

El rol va en minúsculas (`"profesor"`, `"alumno"`) por el enum que ajustamos para coincidir con tu base. Prueba el `DELETE` con un usuario de prueba, como uno que hayas creado tú, para no borrar los datos de ejemplo de la tabla.