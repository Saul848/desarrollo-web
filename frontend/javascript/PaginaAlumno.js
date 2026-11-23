const API_URL = "http://localhost:8080";

const usuarioActual = JSON.parse(sessionStorage.getItem("usuario"));

if (!usuarioActual || usuarioActual.rol !== "alumno") {
    window.location.href = "login.html";
}

const matriculaAlumno = usuarioActual.matricula;

const contenedorCursos = document.getElementById("contenedorCursos");
const barraBusqueda = document.getElementById("barra-busqueda");
const botonesCurso = document.querySelectorAll("#barra-botones button");

let grupos = [];
let tareasGrupo = [];
let entregasAlumno = [];
let examenesGrupo = [];
let tareaSeleccionada = null;
let filtroActividadActual = "actuales";

const COLORES = ["#d3d3d3", "#12cdb5", "#7673a1"];

// Cuando se carga la página se muestra el listado de los cursos y se prepara el perfil
document.addEventListener("DOMContentLoaded", () => {
    const spanNombre = document.getElementById("perfil-nombre");
    const spanMatricula = document.getElementById("perfil-matricula");
    if (spanNombre) spanNombre.textContent = usuarioActual.nombre ?? "Alumno";
    if (spanMatricula) spanMatricula.textContent = usuarioActual.matricula ?? "";

    const btnLogout = document.getElementById("logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.removeItem("usuario");
            sessionStorage.removeItem("idGrupoActual");
            window.location.href = "login.html";
        });
    }

    mostrarModal("areaCursos");
    cargarGrupos();
});

function mostrarModal(idModal) {
    document.querySelectorAll(".modal-class").forEach(modal => {
        modal.style.display = "none";
    });

    const modalSeleccionado = document.getElementById(idModal);
    if (modalSeleccionado) {
        modalSeleccionado.style.display = "block";
    }
}

document.getElementById("tituloPagina").addEventListener("click", () => {
    mostrarModal("areaCursos");
});

/* ---------- Grupos del alumno ---------- */
function obtenerNombreGrupo(g) {
    return g.nombre_grupo ?? g.nombre ?? "Sin nombre";
}

function obtenerIdGrupo(g) {
    return g.id ?? g.idGrupo ?? g.id_grupo;
}

async function cargarGrupos() {
    try {
        const resp = await fetch(`${API_URL}/grupos/alumno/${encodeURIComponent(matriculaAlumno)}`);
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
        const nombre = obtenerNombreGrupo(g);
        const iniciales = nombre.substring(0, 2).toUpperCase();

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-curso";
        tarjeta.style.backgroundColor = COLORES[i % COLORES.length];
        tarjeta.innerHTML = `
            <div class="tarjeta-info">
                <span class="tarjeta-iniciales">${iniciales}</span>
                <span class="tarjeta-nombre"></span>
            </div>`;
        tarjeta.querySelector(".tarjeta-nombre").textContent = nombre;

        tarjeta.addEventListener("click", () => abrirGrupo(g));
        contenedorCursos.appendChild(tarjeta);
    });
}

async function abrirGrupo(grupo) {
    const idGrupo = obtenerIdGrupo(grupo);
    const nombre = obtenerNombreGrupo(grupo);

    document.getElementById("nombre-curso").textContent = nombre;
    sessionStorage.setItem("idGrupoActual", idGrupo);

    const detalleTarea = document.getElementById("detalle-tarea");
    const detalleExamen = document.getElementById("detalle-examen");
    if (detalleTarea) detalleTarea.style.display = "none";
    if (detalleExamen) detalleExamen.style.display = "none";

    mostrarModal("areaActividad");
    mostrarSeccion("actividades");

    await Promise.all([
        cargarTareasYEntregas(idGrupo),
        cargarExamenesGrupo(idGrupo)
    ]);
}

barraBusqueda.addEventListener("input", () => {
    const texto = barraBusqueda.value.toLowerCase();
    mostrarGrupos(grupos.filter(g =>
        obtenerNombreGrupo(g).toLowerCase().includes(texto)
    ));
});

/* ---------- Tareas y entregas del alumno ---------- */
async function cargarTareasYEntregas(idGrupo) {
    const contenedor = document.getElementById("contenedor-actividades");
    try {
        const [respTareas, respEntregas] = await Promise.all([
            fetch(`${API_URL}/tareas/obtenerTareasGrupo?idGrupo=${idGrupo}`),
            fetch(`${API_URL}/entregas/alumno?idAlumno=${encodeURIComponent(matriculaAlumno)}`)
        ]);

        if (!respTareas.ok) throw new Error("Error tareas " + respTareas.status);
        tareasGrupo = await respTareas.json();
        entregasAlumno = respEntregas.ok ? await respEntregas.json() : [];

        renderizarTareas();
    } catch (err) {
        console.error(err);
        if (contenedor) {
            contenedor.innerHTML = "<p>No se pudieron cargar las tareas del grupo.</p>";
        }
    }
}

function renderizarTareas() {
    const contenedor = document.getElementById("contenedor-actividades");
    if (!contenedor) return;

    const ahora = new Date();
    const filtradas = tareasGrupo.filter((t) => {
        const estado = (t.estado ?? "").toLowerCase();
        const fechaTermino = t.fechaTermino ? new Date(t.fechaTermino) : null;
        const vencida = fechaTermino ? ahora > fechaTermino : false;

        if (filtroActividadActual === "prorroga") {
            return estado.includes("prorroga") || estado.includes("prórroga");
        }
        if (filtroActividadActual === "concluidas") {
            return vencida && !estado.includes("prorroga") && !estado.includes("prórroga");
        }
        return !vencida;
    });

    contenedor.innerHTML = "";
    if (filtradas.length === 0) {
        contenedor.innerHTML = "<p>No hay tareas en este filtro.</p>";
        return;
    }

    filtradas.forEach((t) => {
        const idTarea = t.id ?? t.idTarea;
        const entregaExistente = entregasAlumno.find((e) => e.idActividad === idTarea);

        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-tarea";
        tarjeta.style.cssText = "background:#fff;padding:14px;margin-bottom:12px;border-radius:8px;cursor:pointer;";

        const estadoEntrega = entregaExistente
            ? (entregaExistente.calificacionObtenida != null
                ? `Calificada (${entregaExistente.calificacionObtenida})`
                : "Entregada")
            : "Pendiente";

        tarjeta.innerHTML = `
            <strong>${t.titulo ?? "Sin título"}</strong>
            <div>Estado de entrega: ${estadoEntrega}</div>
            <div>Fecha límite: ${t.fechaTermino ?? "Sin fecha"}</div>
        `;
        tarjeta.addEventListener("click", () => seleccionarTarea(t, entregaExistente));
        contenedor.appendChild(tarjeta);
    });
}

function seleccionarTarea(tarea, entregaExistente) {
    tareaSeleccionada = tarea;
    const detalle = document.getElementById("detalle-tarea");
    if (!detalle) return;

    detalle.style.display = "block";
    document.getElementById("tarea-titulo").textContent = tarea.titulo ?? "Tarea";
    document.getElementById("tarea-descripcion").textContent = tarea.descripcion ?? "";
    document.getElementById("tarea-info").textContent =
        `Puntos: ${tarea.calificacion ?? "-"} | Estado actividad: ${tarea.estado ?? "-"}`;

    const inputContenido = document.getElementById("input-contenido");
    const inputArchivos = document.getElementById("input-archivos");
    const estadoTexto = document.getElementById("tarea-estado-entrega");
    const btnEnviar = document.getElementById("btn-enviar-entrega");
    const mensaje = document.getElementById("mensaje-entrega");
    if (mensaje) mensaje.textContent = "";

    if (entregaExistente) {
        estadoTexto.textContent = entregaExistente.calificacionObtenida != null
            ? `Calificada: ${entregaExistente.calificacionObtenida} | Retroalimentación: ${entregaExistente.retroalimentacion ?? "Sin retroalimentación"}`
            : "Ya enviaste una entrega (puedes actualizarla antes de que sea calificada).";
        inputContenido.value = entregaExistente.contenido ?? "";
        inputArchivos.value = entregaExistente.archivos ?? "";
        btnEnviar.disabled = entregaExistente.calificacionObtenida != null;
        btnEnviar.textContent = entregaExistente.calificacionObtenida != null ? "Ya calificada" : "Actualizar entrega";
    } else {
        estadoTexto.textContent = "Aún no has realizado esta entrega.";
        inputContenido.value = "";
        inputArchivos.value = "";
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar entrega";
    }
}

const formEntrega = document.getElementById("form-entrega");
if (formEntrega) {
    formEntrega.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!tareaSeleccionada) return;

        const idTarea = tareaSeleccionada.id ?? tareaSeleccionada.idTarea;
        const contenido = document.getElementById("input-contenido").value.trim();
        const archivos = document.getElementById("input-archivos").value.trim();
        const mensaje = document.getElementById("mensaje-entrega");

        const entregaExistente = entregasAlumno.find((en) => en.idActividad === idTarea);

        try {
            let resp;
            if (entregaExistente) {
                resp = await fetch(`${API_URL}/entregas/${entregaExistente.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contenido, archivos })
                });
            } else {
                resp = await fetch(`${API_URL}/entregas`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        idActividad: idTarea,
                        idAlumno: matriculaAlumno,
                        contenido,
                        archivos
                    })
                });
            }

            const textoResp = await resp.text();
            if (!resp.ok) {
                if (mensaje) mensaje.textContent = "No se pudo guardar: " + textoResp;
                return;
            }

            if (mensaje) mensaje.textContent = "Entrega guardada correctamente.";
            const idGrupo = sessionStorage.getItem("idGrupoActual");
            await cargarTareasYEntregas(idGrupo);
        } catch (err) {
            console.error(err);
            if (mensaje) mensaje.textContent = "Error de conexión al enviar la entrega.";
        }
    });
}

/* ---------- Exámenes del grupo ---------- */
async function cargarExamenesGrupo(idGrupo) {
    const contenedor = document.getElementById("contenedor-examenes");
    try {
        const resp = await fetch(`${API_URL}/examenes/grupo/${idGrupo}`);
        if (!resp.ok) throw new Error("Error exámenes " + resp.status);
        examenesGrupo = await resp.json();
        renderizarExamenes();
    } catch (err) {
        console.error(err);
        if (contenedor) {
            contenedor.innerHTML = "<p>No se pudieron cargar los exámenes del grupo.</p>";
        }
    }
}

function renderizarExamenes() {
    const contenedor = document.getElementById("contenedor-examenes");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    if (examenesGrupo.length === 0) {
        contenedor.innerHTML = "<p>No hay exámenes registrados en este grupo.</p>";
        return;
    }

    examenesGrupo.forEach((ex) => {
        const tarjeta = document.createElement("div");
        tarjeta.style.cssText = "background:#fff;padding:14px;margin-bottom:12px;border-radius:8px;cursor:pointer;";
        tarjeta.innerHTML = `
            <strong>${ex.titulo ?? "Examen"}</strong>
            <div>Puntos: ${ex.calificacion ?? "-"} | Fecha límite: ${ex.fecha_limite ?? "-"}</div>
        `;
        tarjeta.addEventListener("click", () => {
            const detalle = document.getElementById("detalle-examen");
            if (!detalle) return;
            detalle.style.display = "block";
            document.getElementById("examen-titulo").textContent = ex.titulo ?? "Examen";
            document.getElementById("examen-info").textContent =
                `Intentos permitidos: ${ex.intentos ?? "-"} | Tiempo límite: ${ex.tiempo_limite ?? "-"}`;
            document.getElementById("mensaje-examen").textContent =
                "Examen seleccionado.";
        });
        contenedor.appendChild(tarjeta);
    });
}

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

/* Boton para el correo */
const btnCorreo = document.getElementById("btnCorreo");
btnCorreo.addEventListener("click", () => {
    window.location.href = "correo.html";
});

btnPerfil.addEventListener("click", () => {
    modalPerfil.hidden ? abrirPerfil() : cerrarPerfil();
});

document.addEventListener("click", (e) => {
    if (!modalPerfil.hidden
            && !modalPerfil.contains(e.target)
            && !btnPerfil.contains(e.target)) {
        cerrarPerfil();
    }
});

/* ---------- Botones dentro de un curso ---------- */
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
    filtroActividadActual = filtro;
    renderizarTareas();
}

function aplicarFiltroExamenes(filtro) {
    console.log("Exámenes:", filtro);
}

function mostrarSeccion(nombre) {
    document.querySelectorAll(".seccion-grupo").forEach((s) => {
        s.style.display = "none";
    });

    const seccion = document.getElementById("seccion-" + nombre);
    if (seccion) {
        seccion.style.display = "block";
    }
}