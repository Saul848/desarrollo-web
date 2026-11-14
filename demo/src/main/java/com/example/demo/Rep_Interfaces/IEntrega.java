package com.example.demo.Rep_Interfaces;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.example.demo.Clases.Entrega;

public interface IEntrega extends CrudRepository<Entrega, Integer> {
    //Devuelve todas las entregas de una actividad
    List<Entrega> findByIdActividad(Integer idActividad);

    //Devuelve todas las entregas de un alumno
    List<Entrega> findByIdAlumno(String idAlumno);

    //Comprueba si un alumno ya entregó una actividad
    boolean existsByIdActividadAndIdAlumno(Integer idActividad, String idAlumno);
}
