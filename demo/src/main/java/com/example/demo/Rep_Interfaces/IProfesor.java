package com.example.demo.Rep_Interfaces;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.Clases.Profesor;

public interface IProfesor extends JpaRepository<Profesor, Integer>{
    //Devuelve una lista de profesores. En caso de encontrar a alguno con un nombre repetido, lo devuelve también
    List<Profesor> findByNombreContainingIgnoreCase(String nombre);

    //Devuelve una lista de profesores. En caso de encontrar a alguno con un nombre repetido, lo devuelve también
    Optional<Profesor> findByCorreo(String correo);

    //Comprueba si existe un profesor con un correo especifico
    boolean existsByCorreo(String correo);
}
