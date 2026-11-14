package com.example.demo.Clases;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Examen {
    @Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id_examen;
    
    private Integer id_grupo;
    private String titulo;
    private Integer calificacion;
    private Date fecha_limite;
    private int intentos;
    private int tiempo_limite;
    
    //Getters y setters------------------
    public Integer getId_examen() {
        return id_examen;
    }
    public void setId_examen(Integer id_examen) {
        this.id_examen = id_examen;
    }
    
    public Integer getId_grupo() {
        return id_grupo;
    }
    public void setId_grupo(Integer id_grupo) {
        this.id_grupo = id_grupo;
    }
    
    public String getTitulo() {
        return titulo;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    
    public Integer getCalificacion() {
        return calificacion;
    }
    public void setCalificacion(Integer calificacion) {
        this.calificacion = calificacion;
    }
    
    public Date getFecha_limite() {
        return fecha_limite;
    }
    public void setFecha_limite(Date fecha_limite) {
        this.fecha_limite = fecha_limite;
    }
    
    public int getIntentos() {
        return intentos;
    }
    public void setIntentos(int intentos) {
        this.intentos = intentos;
    }
    
    public int getTiempo_limite() {
        return tiempo_limite;
    }
    public void setTiempo_limite(int tiempo_limite) {
        this.tiempo_limite = tiempo_limite;
    }
}
