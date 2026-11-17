package com.example.demo.Controladores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Clases.Reactivo;
import com.example.demo.Rep_Interfaces.IReactivo;
import jakarta.validation.Valid;

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
	public ResponseEntity<Reactivo> guardarReactivo(@Valid @RequestBody Reactivo reactivo) {
		reactivo.setId_reactivo(null);
		Reactivo reactivoGuardado = ireactivo.save(reactivo);
		return ResponseEntity.ok(reactivoGuardado);
	}

	/**
	 * Método que permite obtener todos los reactivos de la base de datos
	 * @return
	 */
	@GetMapping
	public ResponseEntity<Iterable<Reactivo>> obtenerReactivos() {
		Iterable<Reactivo> reactivos = ireactivo.findAll();
		return ResponseEntity.ok(reactivos);
	}

	/**
	 * Método que permite obtener un reactivo por su id
	 * @param id
	 * @return
	 */
	@GetMapping("/{id}")
	public ResponseEntity<Reactivo> obtenerReactivoPorId(@PathVariable Integer id) {
		return ireactivo.findById(id)
			.map(reactivo -> ResponseEntity.ok(reactivo))
			.orElse(ResponseEntity.notFound().build());
	}

	/**
	 * Método que permite actualizar un reactivo en la base de datos
	 * @param id
	 * @param reactivoActualizado
	 * @return
	 */
	@PutMapping("/{id}")
	public ResponseEntity<Reactivo> actualizarReactivo(@PathVariable Integer id, @Valid @RequestBody Reactivo reactivoActualizado) {
		return ireactivo.findById(id)
			.map(reactivoExistente -> {
				reactivoExistente.setId_examen(reactivoActualizado.getId_examen());
				reactivoExistente.setValor(reactivoActualizado.getValor());
				reactivoExistente.setRespuesta(reactivoActualizado.getRespuesta());

				Reactivo guardado = ireactivo.save(reactivoExistente);
				return ResponseEntity.ok(guardado);
			})
			.orElseGet(() -> ResponseEntity.notFound().build());
	}

	/**
	 * Método que permite eliminar un reactivo de la base de datos
	 * @param id
	 * @return
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarReactivo(@PathVariable Integer id) {
		if (ireactivo.existsById(id)) {
			ireactivo.deleteById(id);
			return ResponseEntity.noContent().build();
		} else {
			return ResponseEntity.notFound().build();
		}
	}
}
