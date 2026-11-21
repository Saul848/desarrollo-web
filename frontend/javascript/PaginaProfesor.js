//Cuando se carga la página se muestra el listado de los cursos
document.addEventListener('DOMContentLoaded', ()=>{
    mostrarModal('areaCursos')
    // Sección con la que arranca la página
    mostrarSeccion("actividades");
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

const btnLogout = document.getElementById('logout')

function cerrarSesion (){
    window.location.href('login.html');
}

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

document.getElementById('btnPrueba').addEventListener('click', ()=>{
    mostrarModal('areaActividad')
})

const botonesCurso = document.querySelectorAll("#barra-botones button");

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


async function recuperarCursosActivos(id_creador) {
    cursos = fetch(`/grupos/creador/${id_creador}?activo=true`)
}