package com.example.demo.Clases;

import java.math.BigDecimal;

import org.hibernate.annotations.ColumnTransformer;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

/**
 * Reactivo
 */
@Entity
@Table(name = "reactivo", schema = "desweb")
public class Reactivo {
    @Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_reactivo;

    @NotNull(message = "El ID del examen es obligatorio")
    @Positive(message = "El ID del examen debe ser un número positivo")
    @Column(nullable = false)
    private Integer id_examen;

    @NotBlank(message = "El tipo de reactivo es obligatorio")
    @Column(nullable = false, columnDefinition = "desweb.tipo_pregunta")
    @ColumnTransformer(write = "?::desweb.tipo_pregunta")
    private String tipo;

    @NotBlank(message = "El enunciado es obligatorio")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String enunciado;

    @Column(columnDefinition = "TEXT")
    private String opcion_1;

    @Column(columnDefinition = "TEXT")
    private String opcion_2;

    @Column(columnDefinition = "TEXT")
    private String opcion_3;

    @Column(columnDefinition = "TEXT")
    private String opcion_4;

    private Integer respuesta_correcta;

    @NotNull(message = "El valor del reactivo es obligatorio")
    @DecimalMin(value = "0.01", message = "El valor debe ser mayor a 0")
    @DecimalMax(value = "99.99", message = "El valor no puede exceder 99.99")
    @Digits(integer = 2, fraction = 2, message = "El valor debe tener máximo 2 enteros y 2 decimales")
    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal valor;

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
    
    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getOpcion_1() {
        return opcion_1;
    }

    public void setOpcion_1(String opcion_1) {
        this.opcion_1 = opcion_1;
    }

    public String getOpcion_2() {
        return opcion_2;
    }

    public void setOpcion_2(String opcion_2) {
        this.opcion_2 = opcion_2;
    }

    public String getOpcion_3() {
        return opcion_3;
    }

    public void setOpcion_3(String opcion_3) {
        this.opcion_3 = opcion_3;
    }   

    public String getOpcion_4() {
        return opcion_4;
    }

    public void setOpcion_4(String opcion_4) {
        this.opcion_4 = opcion_4;
    }

    public Integer getRespuesta_correcta() {
        return respuesta_correcta;
    }
    public void setRespuesta_correcta(Integer respuesta_correcta) {
        this.respuesta_correcta = respuesta_correcta;
    }

    public BigDecimal getValor() {
        return valor;
    }
    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}