package com.example.demo.Clases;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "respuestas_alumno", schema = "desweb")
public class RespuestaAlumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ra")
    private Integer id_ra;

    @Column(name = "id_reactivo", nullable = false)
    private Integer id_reactivo;

    @Column(name = "id_alumno", length = 15, nullable = false)
    private String id_alumno;

    @Column(name = "opcion_elegida")
    private Integer opcion_elegida;

    @Column(name = "respuesta_texto", columnDefinition = "TEXT")
    private String respuesta_texto;

    @Column(name = "es_correcta")
    private Boolean es_correcta;

    public RespuestaAlumno() {
    }

    public Integer getId_ra() {
        return id_ra;
    }

    public void setId_ra(Integer id_ra) {
        this.id_ra = id_ra;
    }

    public Integer getId_reactivo() {
        return id_reactivo;
    }

    public void setId_reactivo(Integer id_reactivo) {
        this.id_reactivo = id_reactivo;
    }

    public String getId_alumno() {
        return id_alumno;
    }

    public void setId_alumno(String id_alumno) {
        this.id_alumno = id_alumno;
    }

    public Integer getOpcion_elegida() {
        return opcion_elegida;
    }

    public void setOpcion_elegida(Integer opcion_elegida) {
        this.opcion_elegida = opcion_elegida;
    }

    public String getRespuesta_texto() {
        return respuesta_texto;
    }

    public void setRespuesta_texto(String respuesta_texto) {
        this.respuesta_texto = respuesta_texto;
    }

    public Boolean getEs_correcta() {
        return es_correcta;
    }

    public void setEs_correcta(Boolean es_correcta) {
        this.es_correcta = es_correcta;
    }
}