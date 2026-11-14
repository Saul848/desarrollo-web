package com.example.demo.Clases;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Clase Equipo que representa un equipo dentro de un grupo
 */
@Entity 
public class Equipo {
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO) 
    private Integer id;
    private Integer idTarea;
    private String nombreEquipo;
    private Integer integrantes;

    /**
     * Constructor vacío de Equipo
     */
    public Equipo(){

    }

    //Getters y setters de profesor
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getIdTarea() {
        return idTarea;
    }

    public void setIdTarea(Integer idTarea) {
        this.idTarea = idTarea;
    }

    public String getNombreEquipo() {
        return nombreEquipo;
    }

    public void setNombreEquipo(String nombreEquipo) {
        this.nombreEquipo = nombreEquipo;
    }

    public Integer getIntegrantes() {
        return integrantes;
    }

    public void setIntegrantes(Integer integrantes) {
        this.integrantes = integrantes;
    }
}

