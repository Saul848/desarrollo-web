package com.example.demo.Rep_Interfaces;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.Clases.Mensaje;

public interface IMensaje extends JpaRepository<Mensaje, Integer> {

    // Devuelve los mensajes enviados por un remitente específico (correo o identificador)
    List<Mensaje> findByRemitente(String remitente);

    // Devuelve una lista con los mensajes filtrados por su estado de lectura (ej. no leídos = false)
    List<Mensaje> findByLeido(Boolean leido);

    // Búsqueda de mensajes que contengan una palabra clave en el asunto
    List<Mensaje> findByAsuntoContainingIgnoreCase(String asunto);
}