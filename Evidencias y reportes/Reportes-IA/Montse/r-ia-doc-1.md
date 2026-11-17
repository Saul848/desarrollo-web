# Reporte de Uso Documental en el Proyecto

**Fecha:**  
13/11/2026
**Número de reporte:**  
1
---

# 1. Breve descripción de uso

Describir la intención general de las consultas.

Lo estaba utilizando como guia para realizar la parte de controladores e interfaces y para verificar que la implementación fuera la correcta, ya que estaba utilizando como referencia partes que ya habían hecho mis compañeros, sobre todo para seguir el orden que ellos llevaban.
---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| 12/11/2026 | Claude | [PROMPT 1](#Prompt-1) | [RESPUESTA A PROMPT 1](#Prompt-1) |
| 12/11/2026 | Claude | [PROMPT 2](#Prompt-2) | [RESPUESTA A PROMPT 2](#Prompt-2) |
| 12/11/2026 | Claude | [PROMPT 3](#Prompt-3) | [RESPUESTA A PROMPT 3](#Prompt-3) |

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales
Primer reporte de Montserrat Rojas Martinez, se hizo uso de la IA para aclarar dudas, llevar una guia, tener una idea más clara.

#### Prompt-1
Estoy realizando un sistema escolar con Spring Boot, Hibernate/JPA y una
base de datos relacional. Mi equipo ya tiene implementado un controlador y una interfaz(ProfesorControlador e IProfesor), además de clases.

Necesito saber qué estructura debería seguir para crear un controlador REST
y su interfaz de repositorio para una entidad nueva, limitándome a las
operaciones GET y POST. Quiero que me expliques:

- Cómo debo organizar el controlador.
- Cómo debo definir la interfaz de repositorio y qué métodos de consulta
   conviene agregar.
- Qué validaciones básicas y códigos HTTP son recomendables en el POST.

#### Respuesta a promt 1
- Interfaz: extender CrudRepository<Entidad, Integer>. Agregar métodos
  derivados del nombre (findByAtributo, existsByAtributo) según las
  consultas necesarias. Los nombres deben coincidir con los atributos de
  la clase, no con las columnas de la BD.

- Controlador: usar @RestController y @RequestMapping("/entidades"),
  inyectar la interfaz con @Autowired.
  - POST: recibir @RequestBody, validar campos obligatorios (400) y
    duplicados (409), guardar y responder 201 CREATED.
  - GET: listar todos (findAll), obtener por id (200 o 404) y filtrar por
    atributos con @RequestParam.

- Usar ResponseEntity para controlar los códigos HTTP y mantener rutas
  consistentes entre todos los controladores del equipo.

#### Prompt-2
En el controlador de EntregaControlador.java encontré esta línea

// La fecha la asigna el servidor, no el cliente
newEntrega.setFechaEntrega(LocalDateTime.now());

que no entiendo del todo, para mayor contexto en el proyecto existe la entidad Profesor, y en el sistema quiero que el profesor sea quien asigne la fecha, pero entonces qué significa esa línea o que esta indicando.

#### Respuesta a promt 2
Qué es lo que asigna el profesor

El profesor normalmente define la fecha límite de la actividad. Ese dato no vive en Entrega, sino en la tabla actividad (o en Tarea, según como la hayan modelado), probablemente en una columna como fecha_limite. Ahí el profesor decide hasta cuándo se puede entregar.

Qué hace esa línea

Cuando el alumno hace el POST, el servidor guarda la fecha y hora actual como momento de entrega, ignorando lo que venga en el JSON. Así el alumno no puede mandar "fechaEntrega": "2020-01-01" para aparentar que entregó a tiempo.

#### Prompt-3
Este método que hace, porque tengo una confución en la parte de "coincidencias parciales por nombre"

//GET /equipos/buscar?nombre="" -> coincidencias parciales por nombre
    @GetMapping("/buscar")
    public List<Equipo> buscarPorNombre(@RequestParam String nombre) {
        return iequipo.findByNombreEquipoContainingIgnoreCase(nombre);
    }

#### Respuesta a promt 3
Es una búsqueda por texto parcial en el nombre del equipo. Devuelve todos los equipos cuyo nombreEquipo contenga el texto que le mandes, sin importar mayúsculas o minúsculas.

Ejemplo

Supón que hay estos equipos guardados:

Equipo Alfa
Los Alfa Romeo
Equipo Beta
ALFABETO