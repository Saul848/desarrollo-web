package com.example.demo.Rep_Interfaces;

import com.example.demo.Clases.Alumno;
import org.springframework.data.repository.CrudRepository;

/**
 * Interfaz para el repositorio de Alumno
 */
public interface IAlumno extends CrudRepository<Alumno, Integer> {

    /**
     * Método para encontrar un Alumno por su nombre
     * @param nombre Nombre del Alumno a buscar
     * @return Alumno encontrado o null si no se encuentra
     */
    Alumno findByNombre(String nombre);
    
}
