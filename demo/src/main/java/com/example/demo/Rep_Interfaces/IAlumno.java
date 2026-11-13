package com.example.demo.Rep_Interfaces;

import com.example.demo.Clases.Alumno;
import org.springframework.data.repository.CrudRepository;

/**
 * Interfaz para el repositorio de Alumno
 */
public interface IAlumno extends CrudRepository<Alumno, Integer> {

    Alumno findByNombre(String nombre);
    
}
