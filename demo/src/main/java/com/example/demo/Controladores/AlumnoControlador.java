package com.example.demo.Controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Clases.Alumno;
import com.example.demo.Rep_Interfaces.IAlumno;

/**
 * Controlador de Alumno
 */
@RestController
public class AlumnoControlador {
    @Autowired 
    private IAlumno ialumno;

    /**
     * Método para crear un nuevo alumno
     * @param newAlumno Alumno a crear
     * @return Alumno creado
     */
    @PostMapping ("/crearAlumno")
    public Alumno crearAlumno(@RequestBody Alumno newAlumno){
        return ialumno.save(newAlumno);
    }

    /**
     * Método para obtener todos los alumnos
     * @return Iterable de alumnos
     */
    @GetMapping("/obtenerAlumnos")
    public Iterable<Alumno> obtenerAlumnos() {
        return ialumno.findAll();
    }

    /**
     * Método para obtener un alumno por su nombre
     * @param nombre Nombre del alumno a buscar
     * @return Alumno encontrado o null si no se encuentra
     */
    @GetMapping ("/obtenerAlumno")
    public Alumno obtenerAlumno(@RequestParam String nombre){
        Alumno alumno = ialumno.findByNombre(nombre);

        if(alumno == null){
            System.out.println("No se encontró el alumno: " + nombre);
        }
        return alumno;
    }
}
