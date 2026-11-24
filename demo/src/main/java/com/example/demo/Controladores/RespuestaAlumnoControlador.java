package com.example.demo.Controladores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Clases.RespuestaAlumno;
import com.example.demo.Rep_Interfaces.IRespuestaAlumno;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/respuestas-alumno")
public class RespuestaAlumnoControlador {

    @Autowired
    private IRespuestaAlumno irespuestaAlumno;

    // POST /respuestas-alumno -> guardar una respuesta de un alumno
    @PostMapping
    public ResponseEntity<RespuestaAlumno> guardarRespuesta(@RequestBody RespuestaAlumno nueva) {
        nueva.setId_ra(null);
        RespuestaAlumno guardada = irespuestaAlumno.save(nueva);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    // POST /respuestas-alumno/lote -> guardar varias respuestas de un envío de examen
    @PostMapping("/lote")
    public ResponseEntity<List<RespuestaAlumno>> guardarLote(@RequestBody List<RespuestaAlumno> respuestas) {
        respuestas.forEach(r -> r.setId_ra(null));
        List<RespuestaAlumno> guardadas = (List<RespuestaAlumno>) irespuestaAlumno.saveAll(respuestas);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardadas);
    }

    // GET /respuestas-alumno -> todas las respuestas
    @GetMapping
    public Iterable<RespuestaAlumno> listarTodas() {
        return irespuestaAlumno.findAll();
    }

    // GET /respuestas-alumno/reactivo/{idReactivo}
    @GetMapping("/reactivo/{idReactivo}")
    public List<RespuestaAlumno> listarPorReactivo(@PathVariable Integer idReactivo) {
        return irespuestaAlumno.buscarPorReactivo(idReactivo);
    }

    // GET /respuestas-alumno/alumno/{idAlumno}
    @GetMapping("/alumno/{idAlumno}")
    public List<RespuestaAlumno> listarPorAlumno(@PathVariable String idAlumno) {
        return irespuestaAlumno.buscarPorAlumno(idAlumno);
    }

    // PUT /respuestas-alumno/{id} -> actualizar calificación/respuesta (útil para preguntas abiertas)
    @PutMapping("/{id}")
    public ResponseEntity<RespuestaAlumno> actualizarRespuesta(@PathVariable Integer id,
                                                               @RequestBody RespuestaAlumno datos) {
        return irespuestaAlumno.findById(id)
                .map(existente -> {
                    if (datos.getOpcion_elegida() != null) {
                        existente.setOpcion_elegida(datos.getOpcion_elegida());
                    }
                    if (datos.getRespuesta_texto() != null) {
                        existente.setRespuesta_texto(datos.getRespuesta_texto());
                    }
                    if (datos.getEs_correcta() != null) {
                        existente.setEs_correcta(datos.getEs_correcta());
                    }
                    return ResponseEntity.ok(irespuestaAlumno.save(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /respuestas-alumno/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRespuesta(@PathVariable Integer id) {
        if (!irespuestaAlumno.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        irespuestaAlumno.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}