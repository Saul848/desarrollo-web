package com.example.demo.Controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Clases.Tarea;
import com.example.demo.Rep_Interfaces.ITarea;

/**
 * Controlador de Tarea
 */
@RestController
public class TareaControlador {
    
    @Autowired 
    private ITarea itarea;

    /**
     * Método para crear una nueva tarea
     * @param newTarea Tarea a crear
     * @return Tarea creada
     */
    @PostMapping ("/crearTarea")
    public Tarea crearTarea(@RequestBody Tarea newTarea){
        return itarea.save(newTarea);
    }

    /**
     * Método para obtener todas las tareas
     * @return Iterable de tareas
     */
    @GetMapping ("/obtenerTareas")
    public Iterable<Tarea> obtenerTareas() {
        return itarea.findAll();
    }

    /**
     * Método para obtener una tarea por su título
     * @param titulo Título de la tarea a obtener
     * @return Tarea encontrada o null si no se encuentra
     */
    @GetMapping ("/obtenerTarea")
    public Tarea obtenerTarea(@RequestParam String titulo){
        Tarea tarea = itarea.findByTitulo(titulo);

        if(tarea == null){
            System.out.println("No se encontró la tarea: " + titulo);
        }
        return tarea;
    }   

}
