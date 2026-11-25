package com.example.demo.Rep_Interfaces;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.example.demo.Clases.RespuestaAlumno;

public interface IRespuestaAlumno extends CrudRepository<RespuestaAlumno, Integer> {

    @Query("SELECT r FROM RespuestaAlumno r WHERE r.id_reactivo = :idReactivo")
    List<RespuestaAlumno> buscarPorReactivo(@Param("idReactivo") Integer idReactivo);

    @Query("SELECT r FROM RespuestaAlumno r WHERE r.id_alumno = :idAlumno")
    List<RespuestaAlumno> buscarPorAlumno(@Param("idAlumno") String idAlumno);

    @Query("SELECT r FROM RespuestaAlumno r WHERE r.id_reactivo = :idReactivo AND r.id_alumno = :idAlumno")
    List<RespuestaAlumno> buscarPorReactivoYAlumno(@Param("idReactivo") Integer idReactivo,
                                                    @Param("idAlumno") String idAlumno);
}