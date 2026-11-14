package com.example.demo.Controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Clases.Reactivo;
import com.example.demo.Rep_Interfaces.IReactivo;

/**
 * Clase que se encarga de recibir las peticiones y realizar las acciones sobre Reactivos
 * ReactivoControlador
 */
@RestController
@RequestMapping("/reactivos")
public class ReactivoControlador {
    
    /*Se agrega la propiedad que hará uso del crud repository*/
	@Autowired
	private IReactivo ireactivo;

	/**
	 * Método que permite guardar un reactivo en la base de datos
	 * @param reactivo
	 * @return
	 */
	@PostMapping 
	public Reactivo guardarReactivo(@RequestBody Reactivo reactivo) {
		return ireactivo.save(reactivo);
	}

	/**
	 * Método que permite obtener todos los reactivos de la base de datos
	 * @return
	 */
	@GetMapping
	public Iterable<Reactivo> obtenerReactivos() {
		return ireactivo.findAll();
	}

	/**
	 * Método que permite obtener un reactivo por su id
	 * @param id
	 * @return
	 */
	@GetMapping("/{id}")
	public Reactivo obtenerReactivoPorId(@PathVariable Integer id) {
		return ireactivo.findById(id).orElse(null);
	}

}
