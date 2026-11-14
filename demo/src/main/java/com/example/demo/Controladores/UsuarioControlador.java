package com.example.demo.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Clases.Rol;
import com.example.demo.Clases.Usuario;
import com.example.demo.Rep_Interfaces.IUsuario;

import jakarta.validation.Valid;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Clase que se encarga de recibir las peticiones y realizar las acciones sobre Usuarios
 * UsuarioControlador
 */
@RestController
@RequestMapping("/usuarios")
public class UsuarioControlador {
    /*Se agrega la propiedad que hará uso del crud repository*/
	@Autowired
	private IUsuario iusuario;

	//variable encoder que convierte las contraseñas a hash
	private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

	//POST /usuarios -> crear
	@PostMapping
	public ResponseEntity<?> crearUsuario(@RequestBody Usuario newUsuario){
		if(iusuario.existsById(newUsuario.getMatricula())){
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya existe un usuario con esta matricula");
		}

		if(iusuario.existsByCorreo(newUsuario.getCorreo())){
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya existe un usuario asociado a este correo");
		}
		//Creamos el nuevo usuario con su contraseña en formato hash y lo guardamos 
		newUsuario.setPassword(encoder.encode(newUsuario.getPassword()));
		Usuario guardado = iusuario.save(newUsuario);
		return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
	}

	//GET /usuarios -> listar todos (maestros y alumnos)
    @GetMapping
	public Iterable<Usuario> obtenerUsuarios(){
		return iusuario.findAll();
	}

	//GET /usuarios/buscar?nombre="" -> coincidencias parciales (puede haber repetidos)
    @GetMapping("/buscar")
	public List<Usuario> obtenerUsuario(@RequestParam String nombre){
		return iusuario.findByNombreContainingIgnoreCase(nombre);
	}

	// POST /usuarios/login  -> validar credenciales
	public ResponseEntity<?> login(@Valid @RequestBody Usuario datos){
		Optional<Usuario> usuario = iusuario.findByCorreo(datos.getCorreo());
		//compara la contraseña presentada con la buscada en la BD
		if (usuario.isPresent() && encoder.matches(datos.getPassword(), usuario.get().getPassword())){
			return ResponseEntity.ok(usuario.get());
		}
		//si la coincidencia no se detecta se devuelve una respuesta negativa
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Correo o contraseña incorrectos");
	}

	//Get /usuarios/12345678 -> coincidencia única
	@GetMapping("/{matricula}")
	public ResponseEntity<Usuario> obtenerPorMatricula(@PathVariable String matricula) {
		return iusuario.findById(matricula)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	//GET /usuarios/profesores -> todos los profesores
	@GetMapping("/profesores")
	public List<Usuario> listarProfesores(){
		return iusuario.findByRol(Rol.PROFESOR);
	}
	
	//GET /usuarios/alumnos -> todos los alumnos
	@GetMapping("/alumnos")
	public List<Usuario> listarAlumnos(){
		return iusuario.findByRol(Rol.ALUMNO);
	}
}
