package com.example.demo.Clases;

import java.math.BigDecimal;
import java.util.Date;

import org.hibernate.annotations.ColumnTransformer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "examen", schema = "desweb")
public class Examen {
    @Id
	@GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id_examen;
    
    @Column(nullable = false)
    private Integer id_grupo;

    @Column(length = 150, nullable = false)
    private String titulo;

    @Column(name="calificacion_asignada", precision = 5, scale = 2, nullable = false)
    private BigDecimal calificacion_asignada;

    @Column(nullable = false)
    private Date fecha_limite;

    @Column(name="intentos_permitidos")
    private int intentos;

    @Column (name="tiempo_limite", columnDefinition = "INTERVAL")
    @ColumnTransformer(
        read = "tiempo_limite::text",
        write = "make_interval(mins => ?::integer)"
    )
    private String tiempo_limite;
    
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
    
    public BigDecimal getCalificacion_asignada() {
        return calificacion_asignada;
    }
    public void setCalificacion_asignada(BigDecimal calificacion_asignada) {
        this.calificacion_asignada = calificacion_asignada;
    }
    
    public Date getFecha_limite() {
        return fecha_limite;
    }
    public void setFecha_limite(Date fecha_limite) {
        this.fecha_limite = fecha_limite;
    }
    
    public int getIntentos_permitidos() {
        return intentos;
    }
    public void setIntentos_permitidos(int intentos) {
        this.intentos = intentos;
    }
    
    public String getTiempo_limite() {
        return tiempo_limite;
    }
    public void setTiempo_limite(String tiempo_limite) {
        this.tiempo_limite = tiempo_limite;
    }
}
