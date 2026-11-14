package com.example.demo.Controladores;

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

import com.example.demo.Clases.Equipo;
import com.example.demo.Rep_Interfaces.IEquipo;

/**
 * Clase que se encarga de recibir las peticiones y realizar las acciones sobre Equipos
 * EquipoControlador
 */
@RestController 
@RequestMapping("/equipos")
public class EquipoControlador {
    @Autowired
    private IEquipo iequipo;

    //POST /equipos -> crear un equipo
    @PostMapping
    public ResponseEntity<?> crearEquipo(@RequestBody Equipo newEquipo) {
        //Validaciones básicas de los campos obligatorios
        if (newEquipo.getIdTarea() == null
                || newEquipo.getNombreEquipo() == null
                || newEquipo.getNombreEquipo().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Se requiere el id de la tarea y el nombre del equipo");
        }

        //Validamos que el número de integrantes sea válido (al menos 1, sin límite máximo)
        if (newEquipo.getIntegrantes() == null || newEquipo.getIntegrantes() < 1) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("El número de integrantes debe ser mayor a 0");
        }

        //No puede haber dos equipos con el mismo nombre en la misma tarea
        if (iequipo.existsByIdTareaAndNombreEquipo(newEquipo.getIdTarea(), newEquipo.getNombreEquipo())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Ya existe un equipo con ese nombre en esta tarea");
        }

        Equipo equipoGuardado = iequipo.save(newEquipo);
        return ResponseEntity.status(HttpStatus.CREATED).body(equipoGuardado);
    }

    //GET /equipos -> listar todos
    @GetMapping
    public Iterable<Equipo> obtenerEquipos() {
        return iequipo.findAll();
    }

    //GET /equipos/{id} -> obtener un equipo por su id
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerEquipo(@PathVariable Integer id) {
        Optional<Equipo> equipo = iequipo.findById(id);
        if (equipo.isPresent()) {
            return ResponseEntity.ok(equipo.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró el equipo con id " + id);
    }

    //GET /equipos/tarea?idTarea=1 -> equipos de una tarea
    @GetMapping("/tarea")
    public List<Equipo> obtenerPorTarea(@RequestParam Integer idTarea) {
        return iequipo.findByIdTarea(idTarea);
    }

    //GET /equipos/buscar?nombre="" -> busqueda de equipos con alguna similitud en su nombre
    @GetMapping("/buscar")
    public List<Equipo> buscarPorNombre(@RequestParam String nombre) {
        return iequipo.findByNombreEquipoContainingIgnoreCase(nombre);
    }
}
