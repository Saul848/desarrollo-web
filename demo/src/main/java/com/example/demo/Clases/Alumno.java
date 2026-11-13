package com.example.demo.Clases;

import jakarta.persistence.*;

/**
 * Clase Alumno que representa a un estudiante
 */
@Entity
public class Alumno {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    private String nombre;
    private String correo;
    private String password;

    /**
     * Constructor vacío de Alumno
     */
    public Alumno() {

    }

    /**
     * Getters y setters de Alumno
     */
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
