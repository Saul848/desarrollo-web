package com.example.demo.Clases;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "usuario", schema = "desweb")
public class Usuario {
    @Id
    @Column(length = 8, nullable = false)
    @Pattern(regexp = "\\d{8}", message = "La matrícula debe tener exactamente 8 dígitos")
    private String matricula;
    private String nombre;
    
    @Column(name = "correo_institucional")
    private String correo;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) //Propiedad de solo escritura - al responder JSOn ya no manda este atributo
    private String password;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @NotNull(message = "el rol es obligatorio")
    private Rol rol;

    /**
     * Constructor vacío de Profesor
     */
    public Usuario(){

    }

    //Getters y setters de profesor
    public String getMatricula() {
        return matricula;
    }

    public void setMatricula(String matricula) {
        this.matricula = matricula;
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
    
    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }
}
