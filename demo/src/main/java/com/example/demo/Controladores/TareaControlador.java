package com.example.demo.Controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Clases.Tarea;
import com.example.demo.Rep_Interfaces.ITarea;

import jakarta.validation.Valid;

/**
 * Controlador de Tarea
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/tareas")
public class TareaControlador {
    
    @Autowired 
    private ITarea itarea;

    /**
     * Método para crear una nueva tarea
     * @param newTarea Tarea a crear
     * @return Tarea creada
     */
    @PostMapping ("/crearTarea")
    public ResponseEntity<?> crearTarea(@Valid @RequestBody Tarea newTarea){
        if(newTarea.getFechaTermino().isBefore(newTarea.getFechaInicio())){
            return ResponseEntity.badRequest()
            .body("La fecha de inicio no puede ser posterior a la fecha de término");
        }
        newTarea.setId(null);
        Tarea tareaCreada = itarea.save(newTarea);
        return ResponseEntity.status((HttpStatus.CREATED)).body(tareaCreada);
    }

    /**
     * Método para obtener todas las tareas
     * @return Iterable de tareas
     */
    @GetMapping ("/obtenerTareas")
    public ResponseEntity<Iterable<Tarea>> obtenerTareas() {
        Iterable<Tarea> tareas = itarea.findAll();
        return ResponseEntity.ok(tareas);
    }

    @GetMapping("/obtenerTareasGrupo/{idGrupo}")
    public ResponseEntity<List<Tarea>> obtenerTareasGrupo(@PathVariable Integer idGrupo) {
        return ResponseEntity.ok(itarea.findByIdGrupo(idGrupo));
    }


    /**
     * Método para obtener una tarea por su título
     * @param titulo Título de la tarea a obtener
     * @return Tarea encontrada o null si no se encuentra
     */
    @GetMapping ("/obtenerTarea")
    public ResponseEntity<Tarea> obtenerTarea(@RequestParam String titulo){
        Tarea tarea = itarea.findByTitulo(titulo);

        if(tarea == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(tarea);
    }   

    /**
     * Método para obtener una tarea por su ID
     * @param id ID de la tarea a obtener
     * @return Tarea encontrada o 404 si no se encuentra
     */
    @GetMapping("/{id}")
    public ResponseEntity<Tarea> obtenerTareaPorId(@PathVariable Integer id) {
        return itarea.findById(id)
                .map(tarea -> ResponseEntity.ok(tarea)) 
                .orElseGet(() -> ResponseEntity.notFound().build()); 
    }

    /**
     * Método para actualizar una tarea existente
     * @param id ID de la tarea a actualizar
     * @param tareaActualizada Tarea con los datos actualizados
     * @return Tarea actualizada o 404 si no se encuentra
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarTarea(
            @PathVariable Integer id, 
            @Valid @RequestBody Tarea tareaActualizada) {

        if (tareaActualizada.getFechaTermino().isBefore(tareaActualizada.getFechaInicio())) {
            return ResponseEntity
                    .badRequest()
                    .body("La fecha de término no puede ser anterior a la fecha de inicio");
        }

        return itarea.findById(id)
                .map(tareaExistente -> {
                    tareaExistente.setIdGrupo(tareaActualizada.getIdGrupo());
                    tareaExistente.setTitulo(tareaActualizada.getTitulo());
                    tareaExistente.setDescripcion(tareaActualizada.getDescripcion());
                    tareaExistente.setFechaInicio(tareaActualizada.getFechaInicio());
                    tareaExistente.setFechaTermino(tareaActualizada.getFechaTermino());
                    tareaExistente.setEstado(tareaActualizada.getEstado());

                    Tarea guardada = itarea.save(tareaExistente);
                    return ResponseEntity.ok(guardada);
                })
                .orElseGet(() -> ResponseEntity.notFound().build()); 
    }

    /**
     * Método para eliminar una tarea por su ID
     * @param id ID de la tarea a eliminar
     * @return 204 No Content si se elimina, 404 Not Found si no se encuentra
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTarea(@PathVariable Integer id) {
        if (!itarea.existsById(id)) {
            return ResponseEntity.notFound().build(); 
        }

        itarea.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
