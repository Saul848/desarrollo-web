package com.example.demo.Controladores;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.example.demo.Clases.Usuario;
import com.example.demo.Rep_Interfaces.IUsuario;
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
    private IUsuario iusuario;

    @Autowired
    private IMensaje imensaje;

    // Enviar/Crear un nuevo mensaje
    @PostMapping("/enviarMensaje")
    public ResponseEntity<?> enviarMensaje(@RequestBody Mensaje nuevoMensaje) {

        // Validar que se haya proporcionado un correo
        if (nuevoMensaje.getIdDestinatario() == null ||
                nuevoMensaje.getIdDestinatario().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Debes ingresar el correo institucional del destinatario.");
        }

        // Buscar al usuario mediante su correo institucional
        String correoDestinatario = nuevoMensaje.getIdDestinatario()
                .trim();

        Optional<Usuario> usuarioDestinatario =
                iusuario.findByCorreo(correoDestinatario);

        // Si no existe, no se guarda el mensaje
        if (usuarioDestinatario.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("El correo institucional no está registrado. Ingresa un correo que exista.");
        }

        // Obtener la matrícula del usuario encontrado
        String matriculaDestinatario =
                usuarioDestinatario.get().getMatricula();

        // Validar el cuerpo del mensaje
        if (nuevoMensaje.getCuerpo() == null ||
                nuevoMensaje.getCuerpo().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("El cuerpo del mensaje no puede estar vacío.");
        }

        // Mantener la matrícula del remitente
        if (nuevoMensaje.getRemitente() != null) {
            nuevoMensaje.setRemitente(nuevoMensaje.getRemitente().trim());
        }

        // Guardar la matrícula, NO el correo
        nuevoMensaje.setIdDestinatario(matriculaDestinatario);

        nuevoMensaje.setFecha(LocalDateTime.now());

        nuevoMensaje.setLeido(false);

        // Guardar mensaje
        Mensaje mensajeGuardado = imensaje.save(nuevoMensaje);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mensajeGuardado);
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
    public List<Map<String, Object>> obtenerMensajePorDestinatario(
            @RequestParam String idDestinatario) {

        List<Mensaje> mensajes =
                imensaje.findByIdDestinatario(idDestinatario);

        return mensajes.stream().map(msg -> {

            Map<String, Object> mensaje = new HashMap<>();

            String nombreRemitente = iusuario
                    .findById(msg.getRemitente())
                    .map(Usuario::getNombre)
                    .orElse("Usuario desconocido");

            mensaje.put("id", msg.getId());
            mensaje.put("fecha", msg.getFecha());
            mensaje.put("remitente", nombreRemitente);
            mensaje.put("asunto", msg.getAsunto());
            mensaje.put("cuerpo", msg.getCuerpo());
            mensaje.put("leido", msg.getLeido());

            return mensaje;

        }).collect(Collectors.toList());
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

    // Buscar mensajes por asunto, únicamente del usuario logueado
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarMensajes(
            @RequestParam String asunto,
            @RequestParam String idDestinatario) {

        if (asunto == null || asunto.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Debes ingresar una palabra clave para buscar.");
        }

        List<Mensaje> resultados =
                imensaje.findByIdDestinatarioAndAsuntoContainingIgnoreCase(
                        idDestinatario, asunto.trim());

        return ResponseEntity.ok(
            resultados.stream().map(msg -> {

                Map<String, Object> mensaje = new HashMap<>();

                String nombreRemitente = iusuario
                        .findById(msg.getRemitente())
                        .map(Usuario::getNombre)
                        .orElse("Usuario desconocido");

                mensaje.put("id", msg.getId());
                mensaje.put("fecha", msg.getFecha());
                mensaje.put("remitente", nombreRemitente);
                mensaje.put("asunto", msg.getAsunto());
                mensaje.put("cuerpo", msg.getCuerpo());
                mensaje.put("leido", msg.getLeido());

                return mensaje;

            }).collect(Collectors.toList())
        );
    }


}