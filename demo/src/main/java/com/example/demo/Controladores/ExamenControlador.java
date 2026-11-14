package com.example.demo.Controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Clases.Examen;
import com.example.demo.Rep_Interfaces.IExamen;

/**
 * Clase que se encarga de recibir las peticiones y realizar las acciones sobre Profesores
 * ProfesorControlador
 */
@RestController
@RequestMapping("/examenes")
public class ExamenControlador {
    
    /*Se agrega la propiedad que hará uso del crud repository*/
	@Autowired
	private IExamen iexamen;

    // POST /examenes -> crear examen
    @PostMapping
    public ResponseEntity<Examen> crearExamen(@RequestBody Examen nuevo) {
        nuevo.setId_examen(null);   // fuerza un INSERT aunque el cliente envíe un id
        Examen guardado = iexamen.save(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    // GET /examenes -> todos los examenes 
    @GetMapping
    public Iterable<Examen> listarExamenes() {
        return iexamen.findAll();
    }

    // GET /examenes/3 -> examen especifico
    @GetMapping("/{id}")
    public ResponseEntity<Examen> obtenerPorId(@PathVariable Integer id) {
        return iexamen.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /examenes/grupo/5  -> recupera los examenes de un grupo en especifico
    @GetMapping("/grupo/{idGrupo}")
    public List<Examen> listarPorGrupo(@PathVariable Integer idGrupo) {
        return iexamen.buscarPorGrupo(idGrupo);
    }
}
