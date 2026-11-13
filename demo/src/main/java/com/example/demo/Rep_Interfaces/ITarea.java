package com.example.demo.Rep_Interfaces;

import com.example.demo.Clases.Tarea;
import org.springframework.data.repository.CrudRepository;

/**
 * Interfaz para el repositorio de Tarea
 */
public interface ITarea extends CrudRepository<Tarea, Integer> {

    /**
     * Método para encontrar una Tarea por su título
     * @param titulo Título de la Tarea a buscar
     * @return Tarea encontrada o null si no se encuentra
     */
    Tarea findByTitulo(String titulo);
}  