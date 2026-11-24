package com.example.demo.Rep_Interfaces;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.Clases.Mensaje;

public interface IMensaje extends JpaRepository<Mensaje, Integer> {

    // Devuelve los mensajes enviados por un remitente específico 
    List<Mensaje> findByRemitente(String remitente);

    // Mensajes recibidos por un destinatario (bandeja de entrada)
    List<Mensaje> findByIdDestinatario(String idDestinatario);

    // Devuelve una lista con los mensajes filtrados por su estado de lectura 
    List<Mensaje> findByLeido(Boolean leido);

    // Búsqueda de mensajes que contengan una palabra clave en el asunto
    List<Mensaje> findByAsuntoContainingIgnoreCase(String asunto);

    // busqueda de mesnaje por usuario logueado
    List<Mensaje> findByIdDestinatarioAndAsuntoContainingIgnoreCase(String idDestinatario, String asunto);

    // Mensajes no leidoss
    List<Mensaje> findByIdDestinatarioAndLeido(String idDestinatario, Boolean leido);
}