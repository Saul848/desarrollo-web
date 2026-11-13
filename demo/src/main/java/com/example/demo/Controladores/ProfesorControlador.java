package com.example.demo.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Clases.Profesor;
import com.example.demo.Rep_Interfaces.IProfesor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Clase que se encarga de recibir las peticiones y realizar las acciones sobre Profesores
 * ProfesorControlador
 */
@RestController
@RequestMapping("/profesores")
public class ProfesorControlador {
    /*Se agrega la propiedad que hará uso del crud repository*/
	@Autowired
	private IProfesor iprofesor;

	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

	//POST /profesores -> crear
	@PostMapping
	public ResponseEntity<?> crearProfesor(@RequestBody Profesor newProfesor){
		if(iprofesor.existsByCorreo(newProfesor.getCorreo())){
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya existe un profesor asociado a este correo");
		}
		//Creamos el nuevo profesor con su contraseña en formato hash y lo guardamos 
		newProfesor.setPassword(encoder.encode(newProfesor.getPassword()));
		Profesor profesorGuardado = iprofesor.save(newProfesor);
		return ResponseEntity.status(HttpStatus.CREATED).body(profesorGuardado);
	}

	//GET /profesores -> listar todos
    @GetMapping
	public Iterable<Profesor> obtenerProfesores(){
		return iprofesor.findAll();
	}

	//GET /profesores/buscar?nombre="" -> coincidencias parciales (puede haber repetidos)
    @GetMapping("/buscar")
	public List<Profesor> obtenerProfesor(@RequestParam String nombre){
		return iprofesor.findByNombreContainingIgnoreCase(nombre);
	}

	// POST /profesores/login  -> validar credenciales
	/* 
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Profesor datos) {
        Optional<Profesor> profesor = iprofesor.findByCorreo(datos.getCorreo());
        if (profesor.isPresent()
                && encoder.matches(datos.getPassword(), profesor.get().getPassword())) {
            return ResponseEntity.ok(profesor.get());
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Correo o contraseña incorrectos");
    }
	*/
}
