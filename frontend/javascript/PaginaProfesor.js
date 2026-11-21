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

const API = "http://localhost:9999";
const MATRICULA_PROFESOR = sessionStorage.getItem("matricula") || "20230001";
const contenedorCursos = document.getElementById("contenedorCursos");


function formatearFecha(iso) {
    return new Date(iso).toLocaleDateString("es-MX", {
        day: "numeric", month: "short", year: "numeric"
    });
}

function mostrarMensaje(texto) {
    const p = document.createElement("p");
    p.className = "mensaje-cursos";
    p.textContent = texto;
    contenedorCursos.replaceChildren(p);
}

const COLORES_TARJETA = ["color-0", "color-1", "color-2"];   

function crearElemento(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
}

function crearTarjeta(grupo) {
    const id = grupo.idGrupo ?? grupo.id_grupo;
    const nombre = grupo.nombre_grupo ?? grupo.nombre ?? "Sin nombre";
    const color = COLORES_TARJETA[(Number(id) || 0) % COLORES_TARJETA.length];

    const tarjeta = crearElemento("button", `tarjeta-curso ${color}`);
    tarjeta.type = "button";
    tarjeta.dataset.idGrupo = id;

    // Franja superior (los dos círculos se dibujan con ::before y ::after)
    const cabecera = crearElemento("span", "tarjeta-cabecera");
    cabecera.setAttribute("aria-hidden", "true");
    cabecera.append(crearElemento("span", "ranura"));

    // Cuerpo
    const iniciales = crearElemento("span", "curso-iniciales", nombre.trim().slice(0, 2).toUpperCase());

    const titulo = crearElemento("span", "curso-nombre");
    titulo.append(crearElemento("span", "curso-numero", `Grupo: `), nombre);

    const fechas = crearElemento("span", "curso-fechas",
        `${formatearFecha(grupo.fechaInicio)} – ${formatearFecha(grupo.fechaFin)}`);

    const datos = crearElemento("span", "curso-datos");
    datos.append(titulo, fechas);

    const estado = crearElemento("span",
        "estado-curso" + (grupo.activo ? "" : " inactivo"),
        grupo.activo ? "Activo" : "Inactivo");

    const cuerpo = crearElemento("span", "tarjeta-cuerpo");
    cuerpo.append(iniciales, datos, estado);

    tarjeta.append(cabecera, cuerpo);
    tarjeta.addEventListener("click", () => abrirCurso(id, nombre));
    return tarjeta;
}

let grupoSeleccionado = null; 

function abrirCurso(id, nombre) {
    grupoSeleccionado = { id, nombre };

    document.getElementById("nombre-curso").textContent = nombre;
    // Siempre se abre en la pestaña Actividades: reutiliza el clic de esa opción,
    // que ya marca el botón activo y muestra su sección.
    document.querySelector('#barra-botones button[data-seccion="actividades"]').click();
    mostrarModal("areaActividad");
}

const barraBusqueda = document.getElementById("barra-busqueda");
let gruposCargados = [];  

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")     // quitamoa acentos
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ");        // y símbolos como # o : etc
}

// Texto sobre el que se busca en cada grupo
function textoBusqueda(grupo) {
    const id = grupo.idGrupo ?? grupo.id_grupo;
    const nombre = grupo.nombre_grupo ?? grupo.nombre ?? "";
    const estado = grupo.activo ? "activo" : "inactivo";
    return normalizar(
        `${id} ${nombre} ${estado} ${formatearFecha(grupo.fechaInicio)} ${formatearFecha(grupo.fechaFin)}`
    );
}

function aplicarBusqueda() {
    if (gruposCargados.length === 0) return;   // no hay nada que filtrar
    const palabras = normalizar(barraBusqueda.value).split(/\s+/).filter(Boolean);

    const resultado = gruposCargados.filter(({ texto }) => {
        const palabrasGrupo = texto.split(/\s+/);
        return palabras.every((p) => palabrasGrupo.some((g) => g.startsWith(p)));
    });

    if (resultado.length === 0) {
        mostrarMensaje(`No se encontraron cursos para «${barraBusqueda.value.trim()}».`);
        return;
    }
    contenedorCursos.replaceChildren(...resultado.map(({ grupo }) => crearTarjeta(grupo)));
}

async function cargarGrupos(matricula) {
    try {
        const res = await fetch(`${API}/grupos/creador/${encodeURIComponent(matricula)}`);
        if (!res.ok) throw new Error("HTTP " + res.status);

        const grupos = await res.json();
        gruposCargados = grupos.map((grupo) => ({ grupo, texto: textoBusqueda(grupo) }));

        if (gruposCargados.length === 0) {
            mostrarMensaje("Aún no tienes grupos. Crea el primero con «+ Crear nuevo grupo».");
            return;
        }
        aplicarBusqueda();   // respeta lo que ya esté escrito en la barra
    } catch (error) {
        console.error(error);
        gruposCargados = [];
        mostrarMensaje("No se pudieron cargar los grupos. Verifica que el servidor esté en ejecución.");
    }
}

cargarGrupos(MATRICULA_PROFESOR);
barraBusqueda.addEventListener("input", aplicarBusqueda);

document.getElementById("btnBuscar").addEventListener("click", () => {
    aplicarBusqueda();
    barraBusqueda.focus();
});

const modalCrearGrupo = document.getElementById("modal-crear-grupo");
const formCrearGrupo = document.getElementById("form-crear-grupo");
const inputNombreGrupo = document.getElementById("nombre-grupo");
const inputBuscarMiembros = document.getElementById("buscar-miembros");
const listaMiembros = document.getElementById("lista-miembros");
const errorCrearGrupo = document.getElementById("error-crear-grupo");
const btnConfirmarGrupo = document.getElementById("btnConfirmarGrupo");

document.getElementById("btnCrearCurso").addEventListener("click", abrirModalCrearGrupo);
document.getElementById("btnCancelarGrupo").addEventListener("click", cerrarModalCrearGrupo);

async function abrirModalCrearGrupo() {
    formCrearGrupo.reset();
    ocultarError();
    modalCrearGrupo.style.display = "flex";
    inputNombreGrupo.focus();
    await cargarMiembros();
}


function cerrarModalCrearGrupo() {
    modalCrearGrupo.style.display = "none";
}

function mostrarError(texto) {
    errorCrearGrupo.textContent = texto;
    errorCrearGrupo.hidden = false;
}

function ocultarError() {
    errorCrearGrupo.hidden = true;
}

function mensajeLista(texto) {
    const li = document.createElement("li");
    li.className = "mensaje-lista";
    li.textContent = texto;
    return li;
}

//Lista de usuarios -------- 
async function cargarMiembros() {
    listaMiembros.replaceChildren(mensajeLista("Cargando usuarios..."));
    try {
        const res = await fetch(`${API}/usuarios`);
        if (!res.ok) throw new Error("HTTP " + res.status);

        const usuarios = (await res.json())
            .filter((u) => u.matricula !== MATRICULA_PROFESOR);   // el creador no se agrega a sí mismo

        if (usuarios.length === 0) {
            listaMiembros.replaceChildren(mensajeLista("No hay usuarios para agregar."));
            return;
        }
        listaMiembros.replaceChildren(...usuarios.map(crearFilaMiembro));
    } catch (error) {
        console.error(error);
        listaMiembros.replaceChildren(mensajeLista("No se pudo cargar la lista de usuarios."));
    }
}

function crearFilaMiembro(usuario) {
    const li = document.createElement("li");
    li.dataset.busqueda = `${usuario.nombre} ${usuario.matricula}`.toLowerCase();

    const fila = document.createElement("label");
    fila.className = "fila-miembro";

    const info = document.createElement("span");
    info.textContent = usuario.nombre;
    const matricula = document.createElement("small");
    matricula.textContent = usuario.matricula;
    info.append(matricula);

    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.value = usuario.matricula;
    casilla.dataset.rol = usuario.rol;

    fila.append(info, casilla);
    li.append(fila);
    return li;
}

// Búsqueda: solo oculta filas, así las casillas marcadas se conservan
inputBuscarMiembros.addEventListener("input", () => {
    const texto = inputBuscarMiembros.value.trim().toLowerCase();
    listaMiembros.querySelectorAll("li[data-busqueda]").forEach((li) => {
        li.hidden = !li.dataset.busqueda.includes(texto);
    });
});

// ---- Crear el grupo ----
function fechaLocalISO(fecha) {
    // "2026-11-20T18:30:00" en hora local (toISOString la daría en UTC)
    return new Date(fecha - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

formCrearGrupo.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarError();

    const nombre = inputNombreGrupo.value.trim();
    if (!nombre) {
        mostrarError("Escribe el nombre del curso.");
        return;
    }

    const miembros = [...listaMiembros.querySelectorAll("input:checked")];

    // Provisional: la maqueta no pide fechas, pero el backend las exige.
    const inicio = new Date();
    const fin = new Date();
    fin.setMonth(fin.getMonth() + 6);

    btnConfirmarGrupo.disabled = true;
    try {
        const res = await fetch(`${API}/grupos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre_grupo: nombre,
                matriculaProfesor: MATRICULA_PROFESOR,
                fechaInicio: fechaLocalISO(inicio),
                fechaFin: fechaLocalISO(fin),
                activo: true
            })
        });
        if (!res.ok) throw new Error(await res.text());

        const grupo = await res.json();
        const idGrupo = grupo.idGrupo ?? grupo.id_grupo;

        const fallidos = [];
        for (const miembro of miembros) {
            const params = new URLSearchParams({
                matriculaAlumno: miembro.value
            });
            const r = await fetch(`${API}/grupos/${idGrupo}/inscribir?${params}`, { method: "POST" });
            if (!r.ok) fallidos.push(miembro.value);
        }

        cerrarModalCrearGrupo();
        await cargarGrupos(MATRICULA_PROFESOR);

        if (fallidos.length > 0) {
            alert("El grupo se creó, pero no se pudo inscribir a: " + fallidos.join(", "));
        }
    } catch (error) {
        console.error(error);
        mostrarError("No se pudo crear el grupo. " + error.message);
    } finally {
        btnConfirmarGrupo.disabled = false;
    }
});

