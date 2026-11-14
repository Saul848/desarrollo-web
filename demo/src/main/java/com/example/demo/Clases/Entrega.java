package com.example.demo.Clases;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * Clase Entrega que representa la entrega de una tarea.
 */
@Entity 
public class Entrega {
    @Id 
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private Integer idActividad;
    private String idAlumno;
    private String contenido;
    private String archivos;
    private BigDecimal calificacionObtenida;
    private String retroalimentacion;
    private LocalDateTime fechaEntrega;
    
    /**
     * Constructor vacío de Entrega
     */
    public Entrega(){
    }

    //Getters y setters de entrega
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getIdActividad() {
        return idActividad;
    }

    public void setIdActividad(Integer idActividad) {
        this.idActividad = idActividad;
    }

    public String getIdAlumno() {
        return idAlumno;
    }

    public void setIdAlumno(String idAlumno) {
        this.idAlumno = idAlumno;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public String getArchivos() {
        return archivos;
    }

    public void setArchivos(String archivos) {
        this.archivos = archivos;
    }

    public BigDecimal getCalificacionObtenida() {
        return calificacionObtenida;
    }

    public void setCalificacionObtenida(BigDecimal calificacionObtenida) {
        this.calificacionObtenida = calificacionObtenida;
    }

    public String getRetroalimentacion() {
        return retroalimentacion;
    }

    public void setRetroalimentacion(String retroalimentacion) {
        this.retroalimentacion = retroalimentacion;
    }

    public LocalDateTime getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(LocalDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }
}
