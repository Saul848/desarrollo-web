package com.example.demo.Clases;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

/**
 * Reactivo
 */
@Entity
@Table(name = "reactivo")
public class Reactivo {
    @Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_reactivo;

    @NotNull(message = "El ID del examen es obligatorio")
    @Positive(message = "El ID del examen debe ser un número positivo")
    @Column(nullable = false)
    private Integer id_examen;

    @NotNull(message = "El valor del reactivo es obligatorio")
    @DecimalMin(value = "0.01", message = "El valor debe ser mayor a 0")
    @DecimalMax(value = "99.99", message = "El valor no puede exceder 99.99")
    @Digits(integer = 2, fraction = 2, message = "El valor debe tener máximo 2 enteros y 2 decimales")
    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal valor;

    @NotNull(message = "La respuesta es obligatoria")
    @Positive(message = "La respuesta debe ser un número válido mayor a 0")
    @Column(nullable = false)
    private Integer respuesta;

    /**
     * Constructor
     */
    public Reactivo() {
    }

    /**
     * Getters y setters de Reactivo
     */
    public Integer getId_reactivo() {
        return id_reactivo;
    }
    public void setId_reactivo(Integer id_reactivo) {
        this.id_reactivo = id_reactivo;
    }
    
    public Integer getId_examen() {
        return id_examen;
    }
    public void setId_examen(Integer id_examen) {
        this.id_examen = id_examen;
    }
    
    public BigDecimal getValor() {
        return valor;
    }
    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
    
    public Integer getRespuesta() {
        return respuesta;
    }
    public void setRespuesta(Integer respuesta) {
        this.respuesta = respuesta;
    }
}