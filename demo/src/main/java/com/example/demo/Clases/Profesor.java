package com.example.demo.Clases;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
public class Profesor {
    @Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Integer id;

    private String nombre;
    private String correo;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) //Propiedad de solo escritura - al responder JSOn ya no manda este atributo
    private String password;

    /**
     * Constructor vacío de Profesor
     */
    public Profesor(){

    }

    //Getters y setters de profesor
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
