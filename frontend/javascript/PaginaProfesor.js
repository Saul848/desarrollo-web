//Agregar el usuario que esta logeado en este momento 
const usuarioActual = JSON.parse(sessionStorage.getItem("usuario"));

if (!usuarioActual || usuarioActual.rol !== "profesor") {
    window.location.href = "login.html";
}

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


/* Boton para el correo  */

const btnCorreo = document.getElementById("btnCorreo");

btnCorreo.addEventListener("click", () => {
    window.location.href = "correo.html";
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
    filtroActividades = filtro;
    mostrarActividades();
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

    // Cada curso abre en Actividades y con el filtro "Actuales"
    document.querySelector('#barra-botones button[data-seccion="actividades"]').click();
    document.querySelector('#filtros-actividades button[data-filtro="actuales"]').click();

    cargarActividades(id);
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
const inputFechaInicio = document.getElementById("fecha-inicio");
const inputFechaFin = document.getElementById("fecha-fin");
inputFechaInicio.addEventListener("change", () => {
    inputFechaFin.min = inputFechaInicio.value;
});

document.getElementById("btnCrearCurso").addEventListener("click", abrirModalCrearGrupo);
document.getElementById("btnCancelarGrupo").addEventListener("click", cerrarModalCrearGrupo);

async function abrirModalCrearGrupo() {
    formCrearGrupo.reset();
    inputFechaFin.min = "";
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

    const inicio = inputFechaInicio.value;   // formato "2026-08-10"
    const fin = inputFechaFin.value;

    if (!inicio || !fin) {
        mostrarError("Selecciona la fecha de inicio y la fecha de fin.");
        return;
    }
    if (fin < inicio) {
        mostrarError("La fecha de fin no puede ser anterior a la de inicio.");
        return;
    }

    btnConfirmarGrupo.disabled = true;
    try {
        const res = await fetch(`${API}/grupos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre_grupo: nombre,
                matriculaProfesor: MATRICULA_PROFESOR,
                fechaInicio: `${inicio}T00:00:00`,
                fechaFin: `${fin}T23:59:59`,
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

// Actividades (tareas) del grupo abierto ----------------
const contenedorActividades = document.getElementById("contenedor-actividades");

const urlTareasDeGrupo = (idGrupo) => `${API}/tareas/obtenerTareasGrupo/${idGrupo}`;

// Botón de filtro -> valor de la columna `estado`
const ESTADO_POR_FILTRO = { actuales: "activo", concluidas: "inactivo", prorroga: "prorroga" };
const TEXTO_FILTRO = { actuales: "actuales", concluidas: "concluidas", prorroga: "con prórroga" };
const ETIQUETA_ESTADO = { activo: "Actual", inactivo: "Concluida", prorroga: "Con prórroga" };

let tareasCargadas = [];
let filtroActividades = "actuales";

// Un solo lugar para ajustar los nombres de campo que devuelve tu API
function normalizarTarea(t) {
    return {
        id: t.id,
        titulo: t.titulo ?? "",
        descripcion: t.descripcion ?? "",
        fechaInicio: t.fechaInicio ?? t.fecha_inicio,
        fechaTermino: t.fechaTermino ?? t.fecha_termino,
        estado: String(t.estado ?? "").trim().toLowerCase()
    };
}

function mostrarMensajeActividades(texto) {
    contenedorActividades.replaceChildren(crearElemento("p", "mensaje-actividades", texto));
}

function crearTarjetaTarea(tarea) {
    const item = crearElemento("article", `tarea tarea-${tarea.estado}`);

    item.append(crearElemento("h3", "tarea-titulo", tarea.titulo));
    if (tarea.descripcion) {
        item.append(crearElemento("p", "tarea-descripcion", tarea.descripcion));
    }
    item.append(
        crearElemento("p", "tarea-fechas",
            `${formatearFecha(tarea.fechaInicio)} – ${formatearFecha(tarea.fechaTermino)}`),
        crearElemento("span", "tarea-estado", ETIQUETA_ESTADO[tarea.estado] ?? tarea.estado)
    );

    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.addEventListener("click", () => abrirTarea(tarea));
    item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirTarea(tarea);
        }
    });
    return item;
}

function mostrarActividades() {
    const estado = ESTADO_POR_FILTRO[filtroActividades];
    const lista = tareasCargadas.filter((t) => t.estado === estado);

    if (lista.length === 0) {
        mostrarMensajeActividades(`No hay actividades ${TEXTO_FILTRO[filtroActividades]}.`);
        return;
    }
    contenedorActividades.replaceChildren(...lista.map(crearTarjetaTarea));
}

async function cargarActividades(idGrupo) {
    tareasCargadas = [];
    mostrarMensajeActividades("Cargando actividades...");
    try {
        const res = await fetch(urlTareasDeGrupo(idGrupo));
        if (!res.ok) throw new Error("HTTP " + res.status);

        const datos = await res.json();
        if (grupoSeleccionado?.id !== idGrupo) return;   // el usuario ya abrió otro curso

        tareasCargadas = datos.map(normalizarTarea);
        mostrarActividades();
    } catch (error) {
        console.error(error);
        mostrarMensajeActividades("No se pudieron cargar las actividades.");
    }
}

// Modal con el contenido de una actividad ----------------------------
const modalTarea = document.getElementById("modal-tarea");
let tareaSeleccionada = null;   // la usaremos después para eliminar y para ver las entregas

function abrirTarea(tarea) {
    tareaSeleccionada = tarea;
    document.getElementById("detalle-titulo").textContent = tarea.titulo;
    document.getElementById("detalle-descripcion").textContent =
        tarea.descripcion || "Esta actividad no tiene descripción.";
    mostrarPanelTarea("contenido-tarea");   // cada tarea se abre en la pestaña Actividad
    modalTarea.style.display = "flex";
}

function cerrarTarea() {
    modalTarea.style.display = "none";
}

document.getElementById("btnCerrarTarea").addEventListener("click", cerrarTarea);

// Clic en el fondo oscuro, fuera de la tarjeta: cierra
modalTarea.addEventListener("click", (e) => {
    if (e.target === modalTarea) cerrarTarea();
});

const tarjetaTarea = document.querySelector(".tarjeta-tarea");
const botonesPestanaTarea = document.querySelectorAll("#barra-tarea ul button");
const listaEntregas = document.getElementById("lista-entregas");

// Cambia entre "Actividad" y "Entregas"
function mostrarPanelTarea(idPanel) {
    document.querySelectorAll(".panel-tarea").forEach((panel) => {
        panel.hidden = panel.id !== idPanel;
    });
    botonesPestanaTarea.forEach((boton) => {
        boton.classList.toggle("activo", boton.dataset.panel === idPanel);
    });
    tarjetaTarea.dataset.panel = idPanel;

    if (idPanel === "entregas-tarea" && grupoSeleccionado) {
        cargarEntregasPanel(grupoSeleccionado.id);
    }
}

botonesPestanaTarea.forEach((boton) => {
    boton.addEventListener("click", () => mostrarPanelTarea(boton.dataset.panel));
});

function mensajeEntregas(texto) {
    listaEntregas.replaceChildren(crearElemento("li", "mensaje-entregas", texto));
}

function crearFilaAlumno(alumno, entrega) {
    const fila = crearElemento("li", "fila-alumno");

    const boton = crearElemento("button", "btn-ver-entrega");
    boton.type = "button";

    fila.append(
        crearElemento("span", "etiqueta-alumno", "Alumno"),
        crearElemento("span", "alumno-nombre", alumno.nombre),
        crearElemento("span", "alumno-matricula", `Matricula: ${alumno.matricula}`),
        boton
    );

    if (!entrega) {
        boton.textContent = "Sin entrega";
        boton.disabled = true;
        return fila;
    }

    const detalle = crearDetalleEntrega(entrega);
    boton.textContent = "Ver entrega";
    boton.setAttribute("aria-expanded", "false");
    boton.addEventListener("click", () => {
        detalle.hidden = !detalle.hidden;
        boton.textContent = detalle.hidden ? "Ver entrega" : "Ocultar entrega";
        boton.setAttribute("aria-expanded", String(!detalle.hidden));
    });

    fila.append(detalle);
    return fila;
}

async function cargarEntregasPanel() {
    mensajeEntregas("Cargando alumnos...");
    const idGrupo = grupoSeleccionado.id;
    const idTarea = tareaSeleccionada.id;

    try {
        const [resAlumnos, resEntregas] = await Promise.all([
            fetch(`${API}/usuarios/grupo/${idGrupo}/alumnos`),
            fetch(`${API}/entregas/actividad/${idTarea}`)
        ]);
        if (!resAlumnos.ok || !resEntregas.ok) {
            throw new Error(`HTTP ${resAlumnos.status} / ${resEntregas.status}`);
        }

        const alumnos = await resAlumnos.json();
        const entregas = (await resEntregas.json()).map(normalizarEntrega);

        if (tareaSeleccionada?.id !== idTarea) return;   // se abrió otra tarea mientras cargaba

        if (alumnos.length === 0) {
            mensajeEntregas("Aún no hay alumnos inscritos en este grupo.");
            return;
        }

        const entregaPorAlumno = new Map(entregas.map((e) => [e.idAlumno, e]));
        listaEntregas.replaceChildren(
            ...alumnos.map((a) => crearFilaAlumno(a, entregaPorAlumno.get(String(a.matricula))))
        );
    } catch (error) {
        console.error(error);
        mensajeEntregas("No se pudo cargar la lista de alumnos.");
    }
}

// Método para ajustar los nombres de campo que devuelve la API
function normalizarEntrega(e) {
    return {
        id: e.idEntrega ?? e.id_entrega ?? e.id,
        idActividad: e.idActividad ?? e.id_actividad,
        idAlumno: String(e.idAlumno ?? e.id_alumno ?? ""),
        contenido: e.contenido ?? "",
        archivos: e.archivos ?? "",
        calificacion: e.calificacionObtenida ?? e.calificacion_obtenida ?? null,
        retroalimentacion: e.retroalimentacion ?? ""
    };
}

function crearDetalleEntrega(entrega) {
    const detalle = crearElemento("div", "detalle-entrega");
    detalle.hidden = true;

    const camposLectura = [
        ["Contenido:", entrega.contenido || "Sin contenido."],
        ["Archivos:", entrega.archivos || "Sin archivos."]
    ];
    for (const [etiqueta, valor] of camposLectura) {
        const campo = crearElemento("div", "campo-detalle");
        campo.append(
            crearElemento("span", "etiqueta-detalle", etiqueta),
            crearElemento("p", "", String(valor))
        );
        detalle.append(campo);
    }

    detalle.append(crearFormularioCalificacion(entrega));
    return detalle;
}

function crearFormularioCalificacion(entrega) {
    const MAX_RETRO = 255;

    const form = crearElemento("form", "form-calificar");
    form.noValidate = true;   // validamos nosotros para mostrar mensajes propios

    // Calificación
    const inputNota = document.createElement("input");
    inputNota.type = "number";
    inputNota.min = "0";
    inputNota.max = "10";
    inputNota.step = "0.01";
    inputNota.className = "input-calificacion";
    inputNota.value = entrega.calificacion == null ? "" : Number(entrega.calificacion).toFixed(2);

    const campoNota = crearElemento("label", "campo-form");
    campoNota.append(crearElemento("span", "etiqueta-detalle", "Calificación (0 a 10):"), inputNota);

    // Retroalimentación
    const inputRetro = document.createElement("textarea");
    inputRetro.className = "input-retro";
    inputRetro.rows = 3;
    inputRetro.maxLength = MAX_RETRO;
    inputRetro.placeholder = "Escribe la retroalimentación para el alumno...";
    inputRetro.value = entrega.retroalimentacion || "";

    const contador = crearElemento("small", "contador-retro", `${inputRetro.value.length}/${MAX_RETRO}`);
    inputRetro.addEventListener("input", () => {
        contador.textContent = `${inputRetro.value.length}/${MAX_RETRO}`;
    });

    const campoRetro = crearElemento("label", "campo-form");
    campoRetro.append(crearElemento("span", "etiqueta-detalle", "Retroalimentación:"), inputRetro);

    // Estado y botón
    const estado = crearElemento("p", "estado-guardado");
    estado.setAttribute("role", "status");

    const boton = crearElemento("button", "btn-guardar-calificacion", "Guardar calificación");
    boton.type = "submit";

    function mostrarEstado(texto, esError) {
        estado.textContent = texto;
        estado.classList.toggle("error", esError);
    }

    form.append(campoNota, campoRetro, contador, estado, boton);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const texto = inputNota.value.trim();
        const nota = Number(texto);
        if (texto === "" || Number.isNaN(nota) || nota < 0 || nota > 10) {
            mostrarEstado("La calificación debe ser un número entre 0 y 10.", true);
            return;
        }

        const retro = inputRetro.value.trim();
        boton.disabled = true;
        mostrarEstado("Guardando...", false);

        try {
            const res = await fetch(`${API}/entregas/${entrega.id}/calificacion`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ calificacion: nota, retroalimentacion: retro })
            });
            if (!res.ok) throw new Error(await res.text());

            entrega.calificacion = nota;
            entrega.retroalimentacion = retro;
            mostrarEstado("Calificación guardada.", false);
        } catch (error) {
            console.error(error);
            mostrarEstado("No se pudo guardar. " + error.message, true);
        } finally {
            boton.disabled = false;
        }
    });


    return form;
}

//  Crear actividad (tarea) ----------------------------
const modalCrearTarea = document.getElementById("modal-crear-tarea");
const formCrearTarea = document.getElementById("form-crear-tarea");
const inputTituloTarea = document.getElementById("titulo-tarea");
const inputDescripcionTarea = document.getElementById("descripcion-tarea");
const inputInicioTarea = document.getElementById("inicio-tarea");
const inputFinTarea = document.getElementById("fin-tarea");
const selectHoraInicio = document.getElementById("hora-inicio-tarea");
const selectHoraFin = document.getElementById("hora-fin-tarea");
const errorCrearTarea = document.getElementById("error-crear-tarea");
const btnConfirmarTarea = document.getElementById("btnConfirmarTarea");

const urlCrearTarea = `${API}/tareas/crearTarea`;

// Horas cada 30 min, más 23:59 para cerrar al final del día.
// Por defecto: inicia a las 00:00 y cierra a las 23:59 
function llenarHoras(select, horaPorDefecto) {
    const horas = [];
    for (let h = 0; h < 24; h++) {
        const hh = String(h).padStart(2, "0");
        horas.push(`${hh}:00`, `${hh}:30`);
    }
    horas.push("23:59");
    select.replaceChildren(
        ...horas.map((hora) => new Option(hora, hora, hora === horaPorDefecto, hora === horaPorDefecto))
    );
}
llenarHoras(selectHoraInicio, "00:00");
llenarHoras(selectHoraFin, "23:59");

// "2026-09-01" + "10:30" -> "2026-09-01T10:30:00" (23:59 -> segundos en 59)
const marcaTiempo = (fecha, hora) => `${fecha}T${hora}:${hora === "23:59" ? "59" : "00"}`;

//La fecha de cierre no puede ser anterior a la de inicio
inputInicioTarea.addEventListener("change", () => {
    inputFinTarea.min = inputInicioTarea.value;
});

document.getElementById("btnCrearActividad").addEventListener("click", abrirModalCrearTarea);
document.getElementById("btnCancelarTarea").addEventListener("click", cerrarModalCrearTarea);
document.getElementById("btnCerrarCrearTarea").addEventListener("click", cerrarModalCrearTarea);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalCrearTarea.style.display === "flex") {
        cerrarModalCrearTarea();
    }
});

function abrirModalCrearTarea() {
    if (!grupoSeleccionado) return;   // sin grupo abierto no hay a dónde asignar la actividad también devuelve las horas y el tipo a sus valores por defecto
    formCrearTarea.reset();           
    inputFinTarea.min = "";
    ocultarErrorTarea();
    modalCrearTarea.style.display = "flex";
    inputTituloTarea.focus();
}

function cerrarModalCrearTarea() {
    modalCrearTarea.style.display = "none";
}

function mostrarErrorTarea(texto) {
    errorCrearTarea.textContent = texto;
    errorCrearTarea.hidden = false;
}

function ocultarErrorTarea() {
    errorCrearTarea.hidden = true;
}

// El backend puede responder texto plano (fechas) o JSON con errores por atributo
async function leerErrorTarea(res) {
    const cuerpo = await res.text();
    let texto = "";
    try {
        const datos = JSON.parse(cuerpo);
        // El JSON genérico de Spring trae "timestamp" y no sirve para mostrarlo asi como viene
        if (datos && typeof datos === "object" && !datos.timestamp) {
            texto = Object.values(datos).join(" | ");
        }
    } catch {
        texto = cuerpo;
    }
    return texto || `Error del servidor (HTTP ${res.status}).`;
}

formCrearTarea.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarErrorTarea();

    const titulo = inputTituloTarea.value.trim();
    const inicio = inputInicioTarea.value;   // formato "2026-09-01"
    const fin = inputFinTarea.value;

    if (!grupoSeleccionado) {
        mostrarErrorTarea("Abre un grupo antes de crear una actividad.");
        return;
    }
    if (!titulo) {
        mostrarErrorTarea("Escribe el título de la actividad.");
        return;
    }
    if (!inicio || !fin) {
        mostrarErrorTarea("Selecciona la fecha de inicio y la fecha de cierre.");
        return;
    }

    const fechaInicio = marcaTiempo(inicio, selectHoraInicio.value);
    const fechaTermino = marcaTiempo(fin, selectHoraFin.value);
    if (fechaTermino < fechaInicio) {
        mostrarErrorTarea("El cierre no puede ser anterior al inicio.");
        return;
    }

    const idGrupo = grupoSeleccionado.id;   // se guarda por si el usuario cambia de grupo mientras se envía

    btnConfirmarTarea.disabled = true;
    try {
        const res = await fetch(urlCrearTarea, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idGrupo: Number(idGrupo),
                titulo,
                descripcion: inputDescripcionTarea.value.trim(),
                fechaInicio,
                fechaTermino,
                estado: "activo"   // una actividad nueva siempre nace como Actual
            })
        });
        if (!res.ok) throw new Error(await leerErrorTarea(res));

        cerrarModalCrearTarea();

        // Si el profesor sigue en el mismo grupo, mostramos "Actuales" y recargamos la lista
        if (grupoSeleccionado?.id === idGrupo) {
            document.querySelector('#filtros-actividades button[data-filtro="actuales"]').click();
            await cargarActividades(idGrupo);
        }
    } catch (error) {
        console.error(error);
        mostrarErrorTarea("No se pudo crear la actividad. " + error.message);
    } finally {
        btnConfirmarTarea.disabled = false;
    }
});

// Alumnos del grupo abierto --------------
const contenedorAlumnos = document.getElementById("contenedor-alumnos");

function mostrarMensajeAlumnos(texto) {
    contenedorAlumnos.replaceChildren(crearElemento("p", "mensaje-alumnos", texto));
}

function crearTarjetaAlumno(alumno) {
    const tarjeta = crearElemento("article", "tarjeta-alumno");

    const encabezado = crearElemento("div", "tarjeta-alumno-encabezado");
    encabezado.append(
        crearElemento("span", "tarjeta-alumno-etiqueta", "Alumno"),
        crearElemento("span", "tarjeta-alumno-nombre", alumno.nombre)
    );

    // Aquí irá después el botón "Expulsar alumno"
    tarjeta.append(
        encabezado,
        crearElemento("p", "tarjeta-alumno-matricula", `Matrícula: ${alumno.matricula}`)
    );
    return tarjeta;
}

async function cargarAlumnosGrupo(idGrupo) {
    mostrarMensajeAlumnos("Cargando alumnos...");
    try {
        const res = await fetch(`${API}/usuarios/grupo/${idGrupo}/alumnos`);
        if (!res.ok) throw new Error("HTTP " + res.status);

        const alumnos = await res.json();
        if (grupoSeleccionado?.id !== idGrupo) return;   // el profesor ya abrió otro grupo

        if (alumnos.length === 0) {
            mostrarMensajeAlumnos("Aún no hay alumnos inscritos en este grupo.");
            return;
        }

        alumnos.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));
        contenedorAlumnos.replaceChildren(...alumnos.map(crearTarjetaAlumno));
    } catch (error) {
        console.error(error);
        mostrarMensajeAlumnos("No se pudo cargar la lista de alumnos.");
    }
}

// Cada vez que se entra a la pestaña "Alumnos" se vuelve a consultar, así siempre está actualizada
document.querySelector('#barra-botones button[data-seccion="alumnos"]').addEventListener("click", () => {
    if (grupoSeleccionado) cargarAlumnosGrupo(grupoSeleccionado.id);
});

// Agregar alumnos al grupo abierto -----------------------------------
const modalAgregarAlumnos = document.getElementById("modal-agregar-alumnos");
const formAgregarAlumnos = document.getElementById("form-agregar-alumnos");
const inputBuscarAlumnos = document.getElementById("buscar-alumnos-disponibles");
const listaAlumnosDisponibles = document.getElementById("lista-alumnos-disponibles");
const errorAgregarAlumnos = document.getElementById("error-agregar-alumnos");
const btnConfirmarAgregarAlumnos = document.getElementById("btnConfirmarAgregarAlumnos");

document.getElementById("btnAgregarAlumnos").addEventListener("click", abrirModalAgregarAlumnos);
document.getElementById("btnCancelarAgregarAlumnos").addEventListener("click", cerrarModalAgregarAlumnos);
document.getElementById("btnCerrarAgregarAlumnos").addEventListener("click", cerrarModalAgregarAlumnos);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalAgregarAlumnos.style.display === "flex") {
        cerrarModalAgregarAlumnos();
    }
});

function cerrarModalAgregarAlumnos() {
    modalAgregarAlumnos.style.display = "none";
}

function mostrarErrorAgregarAlumnos(texto) {
    errorAgregarAlumnos.textContent = texto;
    errorAgregarAlumnos.hidden = false;
}

function ocultarErrorAgregarAlumnos() {
    errorAgregarAlumnos.hidden = true;
}

function mensajeAlumnosDisponibles(texto) {
    return crearElemento("li", "mensaje-disponibles", texto);
}

async function abrirModalAgregarAlumnos() {
    if (!grupoSeleccionado) return;
    formAgregarAlumnos.reset();
    ocultarErrorAgregarAlumnos();
    modalAgregarAlumnos.style.display = "flex";
    inputBuscarAlumnos.focus();
    await cargarAlumnosDisponibles(grupoSeleccionado.id);
}

// Todos los alumnos de la base de datos, menos los que ya pertenecen al grupo
async function cargarAlumnosDisponibles(idGrupo) {
    listaAlumnosDisponibles.replaceChildren(mensajeAlumnosDisponibles("Cargando alumnos..."));
    try {
        const [resTodos, resInscritos] = await Promise.all([
            fetch(`${API}/usuarios/alumnos`),
            fetch(`${API}/usuarios/grupo/${idGrupo}/alumnos`)
        ]);
        if (!resTodos.ok || !resInscritos.ok) {
            throw new Error(`HTTP ${resTodos.status} / ${resInscritos.status}`);
        }

        const [todos, inscritos] = await Promise.all([resTodos.json(), resInscritos.json()]);
        if (grupoSeleccionado?.id !== idGrupo) return;   // se abrió otro grupo mientras cargaba

        const yaInscritos = new Set(inscritos.map((a) => String(a.matricula)));
        const disponibles = todos.filter((u) => !yaInscritos.has(String(u.matricula)));

        if (todos.length === 0) {
            listaAlumnosDisponibles.replaceChildren(mensajeAlumnosDisponibles("No hay alumnos registrados."));
            return;
        }
        if (disponibles.length === 0) {
            listaAlumnosDisponibles.replaceChildren(
                mensajeAlumnosDisponibles("Todos los alumnos ya pertenecen a este grupo."));
            return;
        }

        disponibles.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));
        listaAlumnosDisponibles.replaceChildren(...disponibles.map(crearFilaAlumnoDisponible));
    } catch (error) {
        console.error(error);
        listaAlumnosDisponibles.replaceChildren(
            mensajeAlumnosDisponibles("No se pudo cargar la lista de alumnos."));
    }
}

function crearFilaAlumnoDisponible(alumno) {
    const li = crearElemento("li");
    li.dataset.busqueda = normalizar(`${alumno.nombre} ${alumno.matricula}`);

    const fila = crearElemento("label", "fila-disponible");

    const info = crearElemento("span", "", alumno.nombre);
    info.append(crearElemento("small", "", String(alumno.matricula)));

    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.value = alumno.matricula;

    fila.append(info, casilla);
    li.append(fila);
    return li;
}

// La búsqueda solo oculta filas, así las casillas marcadas se conservan
inputBuscarAlumnos.addEventListener("input", () => {
    const texto = normalizar(inputBuscarAlumnos.value).trim();
    listaAlumnosDisponibles.querySelectorAll("li[data-busqueda]").forEach((li) => {
        li.hidden = !li.dataset.busqueda.includes(texto);
    });
});

formAgregarAlumnos.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarErrorAgregarAlumnos();

    if (!grupoSeleccionado) {
        mostrarErrorAgregarAlumnos("Abre un grupo antes de agregar alumnos.");
        return;
    }

    const seleccionados = [...listaAlumnosDisponibles.querySelectorAll("input:checked")]
        .map((casilla) => casilla.value);
    if (seleccionados.length === 0) {
        mostrarErrorAgregarAlumnos("Selecciona al menos un alumno.");
        return;
    }

    const idGrupo = grupoSeleccionado.id;   // por si el profesor cambia de grupo mientras se envía

    btnConfirmarAgregarAlumnos.disabled = true;
    try {
        const fallidos = [];
        for (const matricula of seleccionados) {
            try {
                const params = new URLSearchParams({ matriculaAlumno: matricula });
                const res = await fetch(`${API}/grupos/${idGrupo}/inscribir?${params}`, { method: "POST" });
                if (!res.ok) fallidos.push(matricula);
            } catch {
                fallidos.push(matricula);
            }
        }

        // Si no se pudo inscribir a nadie, el modal se queda abierto para reintentar
        if (fallidos.length === seleccionados.length) {
            mostrarErrorAgregarAlumnos("No se pudo inscribir a los alumnos seleccionados. Verifica que el servidor esté en ejecución.");
            return;
        }

        cerrarModalAgregarAlumnos();
        if (grupoSeleccionado?.id === idGrupo) await cargarAlumnosGrupo(idGrupo);

        if (fallidos.length > 0) {
            alert("Se agregaron los demás, pero no se pudo inscribir a: " + fallidos.join(", "));
        }
    } finally {
        btnConfirmarAgregarAlumnos.disabled = false;
    }
});

// ===== Alumnos del grupo abierto =====
// Si tu ruta para quitar a un alumno del grupo es otra, cámbiala solo aquí
const urlExpulsarAlumno = (idGrupo, matricula) =>
    `${API}/grupos/${idGrupo}/alumnos/${encodeURIComponent(matricula)}`;

function mostrarMensajeAlumnos(texto) {
    contenedorAlumnos.replaceChildren(crearElemento("p", "mensaje-alumnos", texto));
}

function crearTarjetaAlumno(alumno) {
    const tarjeta = crearElemento("article", "tarjeta-alumno");

    const encabezado = crearElemento("div", "tarjeta-alumno-encabezado");
    encabezado.append(
        crearElemento("span", "tarjeta-alumno-etiqueta", "Alumno"),
        crearElemento("span", "tarjeta-alumno-nombre", alumno.nombre)
    );

    const info = crearElemento("div", "tarjeta-alumno-info");
    info.append(
        encabezado,
        crearElemento("p", "tarjeta-alumno-matricula", `Matrícula: ${alumno.matricula}`)
    );

    const boton = crearElemento("button", "btn-expulsar-alumno", "Expulsar alumno");
    boton.type = "button";
    boton.addEventListener("click", () => expulsarAlumno(alumno, boton));

    tarjeta.append(info, boton);
    return tarjeta;
}

async function expulsarAlumno(alumno, boton) {
    if (!grupoSeleccionado) return;

    const idGrupo = grupoSeleccionado.id;   // por si el profesor cambia de grupo mientras se envía
    const confirmado = confirm(
        `¿Expulsar a ${alumno.nombre} (${alumno.matricula}) del grupo «${grupoSeleccionado.nombre}»?`
    );
    if (!confirmado) return;

    boton.disabled = true;
    try {
        const res = await fetch(urlExpulsarAlumno(idGrupo, alumno.matricula), { method: "DELETE" });

        // Un 404 NO se toma como éxito: lo más probable es que la ruta aún no exista en el backend
        if (!res.ok) {
            const pista = res.status === 404 ? " (¿ya existe el endpoint en el backend?)" : "";
            throw new Error(`El servidor respondió con el error ${res.status}.${pista}`);
        }

        if (grupoSeleccionado?.id === idGrupo) await cargarAlumnosGrupo(idGrupo);
    } catch (error) {
        console.error(error);
        alert("No se pudo expulsar al alumno. " + error.message);
        boton.disabled = false;
    }
}

async function cargarAlumnosGrupo(idGrupo) {
    mostrarMensajeAlumnos("Cargando alumnos...");
    try {
        const res = await fetch(`${API}/usuarios/grupo/${idGrupo}/alumnos`);
        if (!res.ok) throw new Error("HTTP " + res.status);

        const alumnos = await res.json();
        if (grupoSeleccionado?.id !== idGrupo) return;   // el profesor ya abrió otro grupo

        if (alumnos.length === 0) {
            mostrarMensajeAlumnos("Aún no hay alumnos inscritos en este grupo.");
            return;
        }

        alumnos.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"));
        contenedorAlumnos.replaceChildren(...alumnos.map(crearTarjetaAlumno));
    } catch (error) {
        console.error(error);
        mostrarMensajeAlumnos("No se pudo cargar la lista de alumnos.");
    }
}

// Cada vez que se entra a la pestaña "Alumnos" se vuelve a consultar, así siempre está actualizada
document.querySelector('#barra-botones button[data-seccion="alumnos"]').addEventListener("click", () => {
    if (grupoSeleccionado) cargarAlumnosGrupo(grupoSeleccionado.id);
});