package com.example.demo.Clases;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Reactivo
 */
public class Reactivo {
    @Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id_reactivo;
    
    private Integer id_examen;
    private Integer valor;
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
    
    public Integer getValor() {
        return valor;
    }
    public void setValor(Integer valor) {
        this.valor = valor;
    }
    
    public Integer getRespuesta() {
        return respuesta;
    }
    public void setRespuesta(Integer respuesta) {
        this.respuesta = respuesta;
    }
}