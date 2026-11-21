package com.example.demo.Rep_Interfaces;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.Clases.Grupo;

public interface IGrupo extends JpaRepository<Grupo, Integer> {

    // Devuelve una lista de grupos impartidos por un profesor según su matrícula (ej. "P001")
    List<Grupo> findByMatriculaProfesor(String matriculaProfesor);

    List<Grupo> findByMatriculaProfesorAndActivo(String matriculaProfesor, Boolean activo);

    // Devuelve una lista con todos los grupos que se encuentren activos o inactivos
    List<Grupo> findByActivo(Boolean activo);

    // Método para inscribir a un alumno en la tabla intermedia esta_en_grupo
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO desweb.esta_en_grupo (id_grupo, matricula_alumno) VALUES (:idGrupo, :matriculaAlumno)", nativeQuery = true)
    void inscribirAlumnoEnGrupo(@Param("idGrupo") Integer idGrupo, 
                                @Param("matriculaAlumno") String matriculaAlumno);
}