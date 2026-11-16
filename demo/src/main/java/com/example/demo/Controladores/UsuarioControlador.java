package com.example.demo.Controladores;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

	//Métodos POST-----------------------------------------------------------
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

	
	// POST /usuarios/login/usuario1  -> validar credenciales
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Usuario datos){
		Optional<Usuario> usuario = iusuario.findByCorreo(datos.getCorreo());
		//compara la contraseña presentada con la buscada en la BD
		if (usuario.isPresent() && encoder.matches(datos.getPassword(), usuario.get().getPassword())){
			return ResponseEntity.ok(usuario.get());
		}
		//si la coincidencia no se detecta se devuelve una respuesta negativa
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Correo o contraseña incorrectos");
	}

	//Métodos GET-----------------------------------------------------------
	//GET /usuarios -> listar todos (maestros y alumnos)
    @GetMapping
	public Iterable<Usuario> obtenerUsuarios(){
		return iusuario.findAll();
	}

	//GET /usuarios/buscar?nombre=ana
    @GetMapping("/buscar")
	public List<Usuario> obtenerUsuario(@RequestParam String nombre){
		return iusuario.findByNombreContainingIgnoreCase(nombre);
	}

	// GET /usuarios/correo?valor=ana@uv.mx
    @GetMapping("/correo")
    public ResponseEntity<Usuario> obtenerPorCorreo(@RequestParam("valor") String correo) {
        return iusuario.findByCorreo(correo).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
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
		return iusuario.findByRol(Rol.profesor);
	}
	
	//GET /usuarios/alumnos -> todos los alumnos
	@GetMapping("/alumnos")
	public List<Usuario> listarAlumnos(){
		return iusuario.findByRol(Rol.alumno);
	}

	//Métodos PUT-----------------------------------------------------------
	// PUT /usuarios/12345678
	@PutMapping("/{matricula}")
	public ResponseEntity<?> actualizarUsuario(@PathVariable String matricula, @Valid @RequestBody Usuario datos){
		Optional<Usuario> buscado = iusuario.findById(matricula);
		//Verificamos que sí haya un empleado buscado
		if(buscado.isEmpty()){
			return ResponseEntity.notFound().build();
		}
		Usuario existente = buscado.get();
		//Verificamos que no haya correos duplicados
		Optional<Usuario> conMismoCorreo = iusuario.findByCorreo(datos.getCorreo());
		if(conMismoCorreo.isPresent() && !conMismoCorreo.get().getMatricula().equals(matricula)){
			return ResponseEntity.status(HttpStatus.CONFLICT).body("Ese correo ya pertenece a otro usuario!");
		}

		existente.setNombre(datos.getNombre());
		existente.setCorreo(datos.getCorreo());
		existente.setRol(datos.getRol());

		//solo cambiamos la contraseña si es que se envia una
		if(datos.getPassword() != null && !datos.getPassword().isBlank()){
			existente.setPassword(encoder.encode(datos.getPassword()));
		}
		return ResponseEntity.ok(iusuario.save(existente));
	}

	//Métodos DELETE-----------------------------------------------------------
	@DeleteMapping("/{matricula}")
	public ResponseEntity<?> eliminarUsuario(@PathVariable String matricula){
		if(!iusuario.existsById(matricula)){
			return ResponseEntity.notFound().build();
		}

		iusuario.deleteById(matricula);

		return ResponseEntity.noContent().build();
	}
}
