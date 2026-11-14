package com.example.demo.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Clases.Grupo;
import com.example.demo.Rep_Interfaces.IGrupo; 

/**
 * Clase que se encarga de recibir las peticiones y realizar las acciones sobre Grupos
 * GrupoControlador
 */
@RestController
@RequestMapping("/grupos")
public class GrupoControlador {

    @Autowired
    private IGrupo igrupo;

    // Crear grupos Post
    @PostMapping
    public ResponseEntity<?> crearGrupo(@RequestBody Grupo nuevoGrupo) {
        if (nuevoGrupo.getFechaInicio() == null || nuevoGrupo.getFechaFin() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Las fechas de inicio y fin son obligatorias.");
        }
        
        if (nuevoGrupo.getActivo() == null) {
            nuevoGrupo.setActivo(true);
        }

        Grupo grupoGuardado = igrupo.save(nuevoGrupo);
        return ResponseEntity.status(HttpStatus.CREATED).body(grupoGuardado);
    }

    //Listar todos los grupos registrados
    @GetMapping
    public Iterable<Grupo> obtenerGrupos() {
        return igrupo.findAll();
    }
    // Buscar un grupo en específico por su ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerGrupoPorId(@PathVariable Integer id) {
        Optional<Grupo> grupo = igrupo.findById(id);
        if (grupo.isPresent()) {
            return ResponseEntity.ok(grupo.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No se encontró el grupo con el ID especificado.");
    }
    // Listar los grupos impartidos por un profesor específico
    @GetMapping("/profesor/{idProfesor}")
    public List<Grupo> obtenerGruposPorProfesor(@PathVariable Integer idProfesor) {
        return igrupo.findByIdProfesor(idProfesor);
    }

    // Actualizar datos de un grupo existente
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarGrupo(@PathVariable Integer id, @RequestBody Grupo datosActualizados) {
        Optional<Grupo> grupoExistente = igrupo.findById(id);
        
        if (grupoExistente.isPresent()) {
            Grupo grupo = grupoExistente.get();
            grupo.setIdMateria(datosActualizados.getIdMateria());
            grupo.setIdProfesor(datosActualizados.getIdProfesor());
            grupo.setFechaInicio(datosActualizados.getFechaInicio());
            grupo.setFechaFin(datosActualizados.getFechaFin());
            grupo.setActivo(datosActualizados.getActivo());
            
            Grupo grupoActualizado = igrupo.save(grupo);
            return ResponseEntity.ok(grupoActualizado);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No se pudo actualizar: Grupo no encontrado.");
    }

    // Eliminar un grupo
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarGrupo(@PathVariable Integer id) {
        if (igrupo.existsById(id)) {
            igrupo.deleteById(id);
            return ResponseEntity.ok("Grupo eliminado correctamente.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No se encontró el grupo que deseas eliminar.");
    }

    // Inscribe a un alumno al grupo 
    @PostMapping("/{idGrupo}/inscribir")
    public ResponseEntity<?> inscribirAlumno(
            @PathVariable Integer idGrupo, 
            @RequestParam String matriculaAlumno, 
            @RequestParam String rol) {
        
        try {
            if (!igrupo.existsById(idGrupo)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No se encontró el grupo especificado.");
            }
            igrupo.inscribirAlumnoEnGrupo(idGrupo, matriculaAlumno, rol);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Alumno inscrito en el grupo exitosamente.");
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error al inscribir al alumno: " + e.getMessage());
        }
    }
}