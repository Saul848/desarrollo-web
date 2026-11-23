package com.example.demo.Rep_Interfaces;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.example.demo.Clases.Rol;
import com.example.demo.Clases.Usuario;

public interface IUsuario extends CrudRepository<Usuario, String>{
    //Devuelve una lista de profesores. En caso de encontrar a alguno con un nombre repetido, lo devuelve también
    List<Usuario> findByNombreContainingIgnoreCase(String nombre);

    //Devuelve una lista de profesores. En caso de encontrar a alguno con un nombre repetido, lo devuelve también
    Optional<Usuario> findByCorreo(String correo);

    //Comprueba si existe un profesor con un correo especifico
    boolean existsByCorreo(String correo);
    //devuelve solo los usuarios de un rol especifico
    List<Usuario> findByRol(Rol rol);

    @Query(value = "SELECT u.* "
            + "FROM desweb.esta_en_grupo AS eg, desweb.usuario AS u "
            + "WHERE eg.matricula_alumno = u.matricula AND eg.id_grupo = :idGrupo "
            + "ORDER BY u.nombre",
        nativeQuery = true)
    List<Usuario> findAlumnosByGrupo(@Param("idGrupo") Integer idGrupo);
}
