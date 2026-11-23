package com.example.demo.Controladores;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Clases.Entrega;
import com.example.demo.Rep_Interfaces.IEntrega;

/**
 * Clase que se encarga de recibir las peticiones y realizar las acciones sobre Entregas
 * EntregaControlador 
 */
@CrossOrigin(origins = "*")
@RestController 
@RequestMapping("/entregas")
public class EntregaControlador {
    @Autowired 
    private IEntrega ientrega;

    //POST /entregas -> crear una entrega
    @PostMapping
    public ResponseEntity<?> crearEntrega(@RequestBody Entrega newEntrega) {
        //Validaciones básicas de los campos obligatorios
        if (newEntrega.getIdActividad() == null || newEntrega.getIdAlumno() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Se requiere el id de la actividad y el id del alumno");
        }

        //Un alumno solo puede entregar una vez la misma actividad
        if (ientrega.existsByIdActividadAndIdAlumno(newEntrega.getIdActividad(), newEntrega.getIdAlumno())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Este alumno ya realizó una entrega para esta actividad");
        }

        //La fecha la asigna el servidor, no el cliente, es la fecha en la que se subió la entrega
        newEntrega.setFechaEntrega(LocalDateTime.now());

        //La calificación y retroalimentación las asigna el profesor después, no al entregar
        newEntrega.setCalificacionObtenida(null);
        newEntrega.setRetroalimentacion(null);

        Entrega entregaGuardada = ientrega.save(newEntrega);
        return ResponseEntity.status(HttpStatus.CREATED).body(entregaGuardada);
    }

    //GET /entregas -> listar todas
    @GetMapping
    public Iterable<Entrega> obtenerEntregas() {
        return ientrega.findAll();
    }

    //GET /entregas/{id} -> obtener una entrega por su id
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerEntrega(@PathVariable Integer id) {
        Optional<Entrega> entrega = ientrega.findById(id);
        if (entrega.isPresent()) {
            return ResponseEntity.ok(entrega.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró la entrega con id " + id);
    }

    //GET /entregas/actividad/1 -> entregas de una actividad
    @GetMapping("/actividad/{idActividad}")
    public List<Entrega> obtenerPorActividad(@PathVariable Integer idActividad) {
        return ientrega.findByIdActividad(idActividad);
    }


    //GET /entregas/alumno?idAlumno=abc -> entregas de un alumno
    @GetMapping("/alumno")
    public List<Entrega> obtenerPorAlumno(@RequestParam String idAlumno) {
        return ientrega.findByIdAlumno(idAlumno);
    }

    //métodos put

    // PUT /entregas/2/calificacion
    @PutMapping("/{idEntrega}/calificacion")
    public ResponseEntity<?> calificarEntrega(@PathVariable Integer idEntrega, @RequestBody CalificacionRequest datos) {
        BigDecimal nota = datos.calificacion();
        if (nota == null
                || nota.compareTo(BigDecimal.ZERO) < 0
                || nota.compareTo(BigDecimal.TEN) > 0) {
            return ResponseEntity.badRequest().body("La calificación debe estar entre 0 y 10.");
        }

        String retro = datos.retroalimentacion() == null ? "" : datos.retroalimentacion().trim();
        if (retro.length() > 255) {
            return ResponseEntity.badRequest()
                    .body("La retroalimentación no puede pasar de 255 caracteres.");
        }

        Optional<Entrega> buscada = ientrega.findById(idEntrega);
        if (buscada.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró la entrega.");
        }

        Entrega entrega = buscada.get();
        entrega.setCalificacionObtenida(nota.setScale(2, RoundingMode.HALF_UP));
        entrega.setRetroalimentacion(retro.isEmpty() ? null : retro);
        return ResponseEntity.ok(ientrega.save(entrega));
    }

    // Datos que llegan en el cuerpo del PUT
    public record CalificacionRequest(BigDecimal calificacion, String retroalimentacion) {}

    //PUT /entregas/{id} -> el alumno actualiza contenido y/o archivos antes de ser calificada
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEntrega(@PathVariable Integer id, @RequestBody Entrega datos) {
        Optional<Entrega> entregaOpt = ientrega.findById(id);
        if (entregaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontró la entrega con id " + id);
        }

        Entrega entrega = entregaOpt.get();

        // Si ya fue calificada, no se permite modificarla desde este endpoint
        if (entrega.getCalificacionObtenida() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede modificar una entrega que ya fue calificada");
        }

        if (datos.getContenido() != null) {
            entrega.setContenido(datos.getContenido());
        }
        if (datos.getArchivos() != null) {
            entrega.setArchivos(datos.getArchivos());
        }

        entrega.setFechaEntrega(LocalDateTime.now());
        Entrega actualizada = ientrega.save(entrega);
        return ResponseEntity.ok(actualizada);
    }

    //métodos delete
    
    //DELETE /entregas/{id} -> eliminar una entrega
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEntrega(@PathVariable Integer id) {
        if (!ientrega.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No se encontró la entrega con id " + id);
        }

        ientrega.deleteById(id);
        return ResponseEntity.ok("Entrega con id " + id + " eliminada correctamente");
    }
}
