package com.example.demo.Clases;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;


/**
 * Clase Tarea que representa una tarea asignada
 */
@Entity
@Table (name = "tarea", schema = "desweb")
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "El ID del grupo es obligatorio")
    @Positive(message = "El ID del grupo debe ser un número positivo")
    @Column(name = "id_grupo", nullable = false)
    private Integer idGrupo;

    @NotBlank(message = "El título de la tarea es obligatorio")
    @Size(max = 150, message = "El título no puede exceder los 150 caracteres")
    @Column(nullable = false, length = 150)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha de término es obligatoria")
    @Column(name = "fecha_termino", nullable = false)
    private LocalDateTime fechaTermino;

    @NotBlank(message = "El estado de la tarea es obligatorio")
    @Pattern(
        regexp = "^(activo|inactivo|prorroga)$",
        message = "El estado debe ser: activo, inactivo o prorroga"
    )
    @NotBlank(message = "El estado de la tarea es obligatorio")
    @Pattern(
        regexp = "^(activo|inactivo|prorroga)$",
        message = "El estado debe ser: activo, inactivo o prorroga"
    )
    @Column(nullable = false, length = 255)
    private String estado;

    /**
     * Constructor vacío de Tarea
     */
    public Tarea() {
    }

    /**
     * Getters y setters de Tarea
     */
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getIdGrupo() {
        return idGrupo;
    }

    public void setIdGrupo(Integer idGrupo) {
        this.idGrupo = idGrupo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaTermino() {
        return fechaTermino;
    }

    public void setFechaTermino(LocalDateTime fechaTermino) {
        this.fechaTermino = fechaTermino;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

}
