const API_URL = "http://localhost:9999";

const usuarioActual = JSON.parse(sessionStorage.getItem("usuario"));

if (!usuarioActual || usuarioActual.rol !== "alumno") {
    window.location.href = "login.html";
}

const matriculaAlumno = usuarioActual.matricula;


const contenedorCursos = document.getElementById("contenedorCursos");
const barraBusqueda = document.getElementById("barra-busqueda");
const botonesCurso = document.querySelectorAll("#barra-botones button");
let grupos = [];

const COLORES = ["#d3d3d3", "#12cdb5", "#7673a1"];

//Cuando se carga la página se muestra el listado de los cursos
document.addEventListener('DOMContentLoaded', ()=>{
    mostrarModal('areaCursos')
    cargarGrupos();
})

function mostrarModal(idModal){
    // Ocultar todos los modales principales
    document.querySelectorAll(".modal-class").forEach(modal => {
        modal.style.display = "none";
    });

    // Mostrar el modal seleccionado
    const modalSeleccionado = document.getElementById(idModal);

    if (modalSeleccionado) {
        modalSeleccionado.style.display = "block";
    }
}

document.getElementById("tituloPagina").addEventListener("click", () => {
    mostrarModal("areaCursos")
});

/* ---------- Grupos del alumno ---------- */
async function cargarGrupos() {
    try {
        const resp = await fetch(`${API_URL}/grupos/alumno/${matriculaAlumno}`);
        if (!resp.ok) throw new Error("Error " + resp.status);
        grupos = await resp.json();
        mostrarGrupos(grupos);
    } catch (err) {
        console.error(err);
        contenedorCursos.innerHTML = "<p>No se pudieron cargar los grupos.</p>";
    }
}

function mostrarGrupos(lista) {
    contenedorCursos.innerHTML = "";

    if (lista.length === 0) {
        contenedorCursos.innerHTML = "<p>Aún no perteneces a ningún grupo.</p>";
        return;
    }

    lista.forEach((g, i) => {
        const nombre = g.nombre_grupo ?? "Sin nombre";
        const iniciales = nombre.substring(0, 2).toUpperCase();

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-curso";
        tarjeta.style.backgroundColor = COLORES[i % COLORES.length];
        tarjeta.innerHTML = `
            <div class="tarjeta-info">
                <span class="tarjeta-iniciales">${iniciales}</span>
                <span class="tarjeta-nombre"></span>
            </div>`;
        // textContent evita inyectar HTML si el nombre trae caracteres raros
        tarjeta.querySelector(".tarjeta-nombre").textContent = nombre;

        tarjeta.addEventListener("click", () => abrirGrupo(g));
        contenedorCursos.appendChild(tarjeta);
    });
}

function abrirGrupo(grupo) {
    document.getElementById("nombre-curso").textContent = grupo.nombre_grupo;
    sessionStorage.setItem("idGrupoActual", grupo.id);
    mostrarModal("areaActividad");
    mostrarSeccion("actividades");
}

barraBusqueda.addEventListener("input", () => {
    const texto = barraBusqueda.value.toLowerCase();
    mostrarGrupos(grupos.filter(g =>
        (g.nombre_grupo ?? "").toLowerCase().includes(texto)
    ));
});

/* ---------- Perfil ---------- */
const btnPerfil = document.getElementById("btnPerfil");
const modalPerfil = document.getElementById("modal-perfil");

function abrirPerfil() {
    modalPerfil.hidden = false;
    btnPerfil.setAttribute("aria-expanded", "true");
}

function cerrarPerfil() {
    modalPerfil.hidden = true;
    btnPerfil.setAttribute("aria-expanded", "false");
}


/* Boton para el correo  */

const btnCorreo = document.getElementById("btnCorreo");

btnCorreo.addEventListener("click", () => {
    window.location.href = "correo.html";
});


// Clic en el botón: abre o cierra
btnPerfil.addEventListener("click", () => {
    modalPerfil.hidden ? abrirPerfil() : cerrarPerfil();
});

// Clic fuera del modal: lo cierra
document.addEventListener("click", (e) => {
    if (!modalPerfil.hidden
            && !modalPerfil.contains(e.target)
            && !btnPerfil.contains(e.target)) {
        cerrarPerfil();
    }
});

/* ---------- Botones dentro de un curso ---------- */
/**
 * Método que cambia el estado de los botones dentro de un curso
 */
botonesCurso.forEach((btn) => {
    btn.addEventListener("click", () => {
        botonesCurso.forEach((b) => {
            b.classList.remove("activo");
            b.removeAttribute("aria-current");
        });
        btn.classList.add("activo");
        btn.setAttribute("aria-current", "page");

        mostrarSeccion(btn.dataset.seccion);
    });
});

/* ---------- Filtros ---------- */
/**
 * Lógica para los filtros dentro de los grupos y examenes
 */
const accionesFiltro = {
    "filtros-actividades": aplicarFiltroActividades,
    "filtros-examenes": aplicarFiltroExamenes
};

document.querySelectorAll(".filtros").forEach((grupo) => {
    const botones = grupo.querySelectorAll("button");

    botones.forEach((btn) => {
        btn.addEventListener("click", () => {
            botones.forEach((b) => {
                b.classList.remove("activo");
                b.setAttribute("aria-pressed", "false");
            });
            btn.classList.add("activo");
            btn.setAttribute("aria-pressed", "true");

            accionesFiltro[grupo.id](btn.dataset.filtro);
        });
    });
});

function aplicarFiltroActividades(filtro) {
    console.log("Actividades:", filtro);
}

function aplicarFiltroExamenes(filtro) {
    console.log("Exámenes:", filtro);
}

/**
 * Método para mostrar una seccion dentro de un grupo
 * @param {*} nombre 
 */
function mostrarSeccion(nombre) {
    document.querySelectorAll(".seccion-grupo").forEach((s) => {
        s.style.display = "none";
    });

    const seccion = document.getElementById("seccion-" + nombre);
    if (seccion) {
        seccion.style.display = "block";
    }
}