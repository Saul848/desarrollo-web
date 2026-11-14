package com.example.demo.Controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Clases.Reactivo;
import com.example.demo.Rep_Interfaces.IReactivo;

/**
 * Clase que se encarga de recibir las peticiones y realizar las acciones sobre Profesores
 * ProfesorControlador
 */
@RestController
@RequestMapping("/reactivos")
public class ReactivoControlador {
    
    /*Se agrega la propiedad que hará uso del crud repository*/
	@Autowired
	private IReactivo ireactivo;

    //POST /profesores -> crear
	@PostMapping
	public ResponseEntity<?> crearProfesor(@RequestBody Reactivo newReactivo){
		if(ireactivo.existsById(newReactivo.getId_reactivo())){
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya existe un reactivo con este id");
		}

		Reactivo reactivoGuardado = ireactivo.save(newReactivo);
		return ResponseEntity.status(HttpStatus.CREATED).body(reactivoGuardado);
	}
}
