package com.example.demo.Clases;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "grupo", schema = "desweb")
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grupo")
    private Integer id;

    @Column(name = "matricula_creador", length = 8)
    private String matriculaProfesor;

    @Column(name = "nombre", nullable = false)
    private String nombre_grupo;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false)
    private Boolean activo;

    public Grupo() {
    }

    public Integer getIdGrupo() {
        return id;
    }

    public void setIdGrupo(Integer id) {
        this.id = id;
    }

    public String getMatriculaProfesor() {
        return matriculaProfesor;
    }

    public void setMatriculaProfesor(String matriculaProfesor) {
        this.matriculaProfesor = matriculaProfesor;
    }
    
    public String getNombre_grupo() {
        return nombre_grupo;
    }

    public void setNombre_grupo(String nombre_grupo) {
        this.nombre_grupo = nombre_grupo;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}