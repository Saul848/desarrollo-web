package com.example.demo.Controladores;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    //GET /entregas/actividad?idActividad=1 -> entregas de una actividad
    @GetMapping("/actividad")
    public List<Entrega> obtenerPorActividad(@RequestParam Integer idActividad) {
        return ientrega.findByIdActividad(idActividad);
    }

    //GET /entregas/alumno?idAlumno=abc -> entregas de un alumno
    @GetMapping("/alumno")
    public List<Entrega> obtenerPorAlumno(@RequestParam String idAlumno) {
        return ientrega.findByIdAlumno(idAlumno);
    }
}
