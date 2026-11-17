package com.example.demo.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Clases.Examen;
import com.example.demo.Clases.Usuario;
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

    //Métodos POST-----------------------------------------------------------
    // POST /examenes -> crear examen
    @PostMapping
    public ResponseEntity<Examen> crearExamen(@RequestBody Examen nuevo) {
        nuevo.setId_examen(null);   // fuerza un INSERT aunque el cliente envíe un id
        Examen guardado = iexamen.save(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    //Métodos GET-----------------------------------------------------------
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

    //Métodos PUT-----------------------------------------------------------
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

    //Métodos DELETE-----------------------------------------------------------
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
}
