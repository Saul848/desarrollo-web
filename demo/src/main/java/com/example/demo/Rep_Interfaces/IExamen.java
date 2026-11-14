package com.example.demo.Rep_Interfaces;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.example.demo.Clases.Examen;

public interface IExamen  extends CrudRepository<Examen, Integer>{
    
    //al usar atributos con guiones bajos, se utiliza query para no confundir a spring
    @Query("SELECT e FROM Examen e WHERE e.id_grupo = :idGrupo")
    List<Examen> buscarPorGrupo(@Param("idGrupo") Integer idGrupo);
}
