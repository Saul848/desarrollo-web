package com.example.demo.Rep_Interfaces;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.example.demo.Clases.Equipo;

public interface IEquipo extends CrudRepository<Equipo, Integer> {
    //Devuelve todos los equipos de una tarea
    List<Equipo> findByIdTarea(Integer idTarea);

    //Devuelve los equipos cuyo nombre sea el buscado
    List<Equipo> findByNombreEquipoContainingIgnoreCase(String nombreEquipo);

    //Comprueba si ya existe un equipo con ese nombre dentro de una tarea
    boolean existsByIdTareaAndNombreEquipo(Integer idTarea, String nombreEquipo);
}
