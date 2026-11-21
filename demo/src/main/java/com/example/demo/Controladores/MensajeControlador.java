package com.example.demo.Controladores;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


import org.springframework.web.bind.annotation.CrossOrigin;

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

import com.example.demo.Clases.Mensaje;
import com.example.demo.Rep_Interfaces.IMensaje;

/**
 * Clase para gestionar Mensajes
 * MensajeControlador
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/mensajes")
public class MensajeControlador {

    @Autowired
    private IMensaje imensaje;

    // Enviar/Crear un nuevo mensaje
    @PostMapping("/enviarMensaje")
    public ResponseEntity<?> enviarMensaje(@RequestBody Mensaje nuevoMensaje) {
        if (nuevoMensaje.getIdDestinatario() == null || nuevoMensaje.getIdDestinatario().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("El destinatario no puede estar vacío.");
        }
        if (nuevoMensaje.getCuerpo() == null || nuevoMensaje.getCuerpo().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("El cuerpo del mensaje no puede estar vacío.");
        }

        if (nuevoMensaje.getRemitente() != null) {
            nuevoMensaje.setRemitente(nuevoMensaje.getRemitente().trim());
        }
        nuevoMensaje.setIdDestinatario(nuevoMensaje.getIdDestinatario().trim());
        nuevoMensaje.setFecha(LocalDateTime.now());
        if (nuevoMensaje.getLeido() == null) {
            nuevoMensaje.setLeido(false);
        }

        Mensaje mensajeGuardado = imensaje.save(nuevoMensaje);
        return ResponseEntity.status(HttpStatus.CREATED).body(mensajeGuardado);
    }

    // Lista de todos los mensajes
    @GetMapping
    public Iterable<Mensaje> obtenerMensajes() {
        return imensaje.findAll();
    }

    // Consultar un mensaje específico por su ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerMensajePorId(@PathVariable Integer id) {
        Optional<Mensaje> mensaje = imensaje.findById(id);
        if (mensaje.isPresent()) {
            return ResponseEntity.ok(mensaje.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No se encontró el mensaje con el ID especificado.");
    }

    // Buscar mensajes por remitente
    @GetMapping("/remitente")
    public List<Mensaje> obtenerMensajesPorRemitente(@RequestParam String correo) {
        return imensaje.findByRemitente(correo);
    }

    // Buscar mensajes recibidos por un destinatario
    @GetMapping("/destinatario")
    public List<Mensaje>obtenerMensajePorDestinatario(@RequestParam String idDestinatario) {
        return imensaje.findByIdDestinatario(idDestinatario);
    }

    // Marcar un mensaje como leído
    @PutMapping("/{id}/leido")
    public ResponseEntity<?> marcarComoLeido(@PathVariable Integer id) {
        Optional<Mensaje> mensajeExistente = imensaje.findById(id);
        if (mensajeExistente.isPresent()) {
            Mensaje mensaje = mensajeExistente.get();
            mensaje.setLeido(true);
            Mensaje actualizado = imensaje.save(mensaje);
            return ResponseEntity.ok(actualizado);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Mensaje no encontrado para actualizar estado.");
    }

    // Eliminar un mensaje
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMensaje(@PathVariable Integer id) {
        if (imensaje.existsById(id)) {
            imensaje.deleteById(id);
            return ResponseEntity.ok("Mensaje eliminado correctamente.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("No se encontró el mensaje que deseas eliminar.");
    }

    // Buscar mensajes por palabra clave en el asunto
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarMensajes(@RequestParam(required = false) String asunto) {
        if (asunto == null || asunto.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Debes ingresar una palabra clave para buscar.");
        }
        List<Mensaje> resultados = imensaje.findByAsuntoContainingIgnoreCase(asunto.trim());
        return ResponseEntity.ok(resultados);
    }


}