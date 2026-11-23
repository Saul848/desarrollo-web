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
    if (typeof cerrarDetalleTarea === "function") cerrarDetalleTarea();
    if (typeof cerrarDetalleExamen === "function") cerrarDetalleExamen();
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

function formatearFechaGrupo(iso) {
    if (!iso) return "";
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toLocaleDateString("es-MX", {
        day: "numeric", month: "short", year: "numeric"
    });
}

function mostrarGrupos(lista) {
    contenedorCursos.innerHTML = "";

    if (lista.length === 0) {
        contenedorCursos.innerHTML = "<p>Aún no perteneces a ningún grupo.</p>";
        return;
    }

    const clasesColor = ["color-0", "color-1", "color-2"];

    lista.forEach((g) => {
        const id = obtenerIdGrupo(g);
        const nombre = obtenerNombreGrupo(g);
        const iniciales = nombre.trim().slice(0, 2).toUpperCase();
        const claseColor = clasesColor[(Number(id) || 0) % clasesColor.length];

        const tarjeta = document.createElement("button");
        tarjeta.type = "button";
        tarjeta.className = `tarjeta-curso ${claseColor}`;

        const cabecera = document.createElement("span");
        cabecera.className = "tarjeta-cabecera";
        cabecera.setAttribute("aria-hidden", "true");
        const ranura = document.createElement("span");
        ranura.className = "ranura";
        cabecera.append(ranura);

        const spanIniciales = document.createElement("span");
        spanIniciales.className = "curso-iniciales";
        spanIniciales.textContent = iniciales;

        const datos = document.createElement("span");
        datos.className = "curso-datos";

        const titulo = document.createElement("span");
        titulo.className = "curso-nombre";
        const prefijo = document.createElement("span");
        prefijo.className = "curso-numero";
        prefijo.textContent = "Grupo: ";
        titulo.append(prefijo, nombre);
        datos.append(titulo);

        const inicio = formatearFechaGrupo(g.fechaInicio ?? g.fecha_inicio);
        const fin = formatearFechaGrupo(g.fechaFin ?? g.fecha_fin);
        if (inicio && fin) {
            const fechas = document.createElement("span");
            fechas.className = "curso-fechas";
            fechas.textContent = `${inicio} – ${fin}`;
            datos.append(fechas);
        }

        const estaActivo = g.activo !== undefined ? Boolean(g.activo) : true;
        const estado = document.createElement("span");
        estado.className = "estado-curso" + (estaActivo ? "" : " inactivo");
        estado.textContent = estaActivo ? "Activo" : "Inactivo";

        const cuerpo = document.createElement("span");
        cuerpo.className = "tarjeta-cuerpo";
        cuerpo.append(spanIniciales, datos, estado);

        tarjeta.append(cabecera, cuerpo);
        tarjeta.addEventListener("click", () => abrirGrupo(g));
        contenedorCursos.appendChild(tarjeta);
    });
}

async function abrirGrupo(grupo) {
    const idGrupo = obtenerIdGrupo(grupo);
    const nombre = obtenerNombreGrupo(grupo);

    document.getElementById("nombre-curso").textContent = nombre;
    sessionStorage.setItem("idGrupoActual", idGrupo);

    if (typeof cerrarDetalleTarea === "function") cerrarDetalleTarea();
    if (typeof cerrarDetalleExamen === "function") cerrarDetalleExamen();

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
            fetch(`${API_URL}/tareas/obtenerTareasGrupo/${idGrupo}`),
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

function formatearFechaCorta(iso) {
    if (!iso) return "Sin fecha";
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return iso;
    return fecha.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function renderizarTareas() {
    const contenedor = document.getElementById("contenedor-actividades");
    if (!contenedor) return;

    //si la tarea seleccionado ya no esta, se oculta el modal
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

    if (tareaSeleccionada) {
        const idSel = tareaSeleccionada.id ?? tareaSeleccionada.idTarea;
        const sigueVisible = filtradas.some((t) => (t.id ?? t.idTarea) === idSel);
        if (!sigueVisible) cerrarDetalleTarea();
    }

    contenedor.innerHTML = "";
    if (filtradas.length === 0) {
        contenedor.innerHTML = "<p>No hay tareas en este filtro.</p>";
        return;
    }

    filtradas.forEach((t) => {
        const idTarea = t.id ?? t.idTarea;
        const entregaExistente = entregasAlumno.find((e) => e.idActividad === idTarea);
        const estadoRaw = (t.estado ?? "activo").toLowerCase();

        const claseEstado = estadoRaw.includes("prorroga") || estadoRaw.includes("prórroga")
            ? "tarea-prorroga"
            : (estadoRaw === "inactivo" ? "tarea-inactivo" : "tarea-activo");

        const etiquetaEstado = estadoRaw.includes("prorroga") || estadoRaw.includes("prórroga")
            ? "Con prórroga"
            : (estadoRaw === "inactivo" ? "Concluida" : "Actual");

        const estadoEntrega = entregaExistente
            ? (entregaExistente.calificacionObtenida != null
                ? `Calificada (${entregaExistente.calificacionObtenida})`
                : "Entregada")
            : "Pendiente";

        const tarjeta = document.createElement("article");
        tarjeta.className = `tarjeta-tarea-alumno ${claseEstado}`;
        tarjeta.innerHTML = `
            <h4 class="tarea-alumno-titulo">${t.titulo ?? "Sin título"}</h4>
            <p class="tarea-alumno-meta">Estado de entrega: <strong>${estadoEntrega}</strong></p>
            <p class="tarea-alumno-fecha">Fecha límite: ${formatearFechaCorta(t.fechaTermino)}</p>
            <span class="tarea-alumno-estado">${etiquetaEstado}</span>
        `;
        tarjeta.addEventListener("click", () => seleccionarTarea(t, entregaExistente));
        contenedor.appendChild(tarjeta);
    });
}

function seleccionarTarea(tarea, entregaExistente) {
    tareaSeleccionada = tarea;
    const detalle = document.getElementById("detalle-tarea");
    if (!detalle) return;

    detalle.style.display = "flex";
    document.getElementById("tarea-titulo").textContent = tarea.titulo ?? "Tarea";
    document.getElementById("tarea-descripcion").textContent = tarea.descripcion || "Sin descripción.";
    document.getElementById("tarea-info").textContent =
        `Fecha límite: ${formatearFechaCorta(tarea.fechaTermino)} | Estado actividad: ${tarea.estado ?? "-"}`;

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

function cerrarDetalleTarea() {
    tareaSeleccionada = null;
    const detalle = document.getElementById("detalle-tarea");
    if (detalle) {
        detalle.style.display = "none";
    }
}

document.getElementById("btnCerrarDetalleTarea")?.addEventListener("click", cerrarDetalleTarea);

document.getElementById("detalle-tarea")?.addEventListener("click", (e) => {
    if (e.target.id === "detalle-tarea") {
        cerrarDetalleTarea();
    }
});

document.addEventListener("keydown", (e) => {
    const detalle = document.getElementById("detalle-tarea");
    if (e.key === "Escape" && detalle && detalle.style.display === "flex") {
        cerrarDetalleTarea();
    }
});

const formEntrega = document.getElementById("form-entrega");
if (formEntrega) {
    formEntrega.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!tareaSeleccionada) return;

        const idTarea = tareaSeleccionada.id ?? tareaSeleccionada.idTarea;
        const contenido = document.getElementById("input-contenido").value.trim();
        const archivos = document.getElementById("input-archivos").value.trim();
        const mensaje = document.getElementById("mensaje-entrega");
        const btnEnviar = document.getElementById("btn-enviar-entrega");

        const entregaExistente = entregasAlumno.find((en) => en.idActividad === idTarea);
        if (btnEnviar) btnEnviar.disabled = true;

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
                if (btnEnviar) btnEnviar.disabled = false;
                return;
            }

            const idGrupo = sessionStorage.getItem("idGrupoActual");
            await cargarTareasYEntregas(idGrupo);
            cerrarDetalleTarea();
        } catch (err) {
            console.error(err);
            if (mensaje) mensaje.textContent = "Error de conexión al enviar la entrega.";
            if (btnEnviar) btnEnviar.disabled = false;
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

function cerrarDetalleExamen() {
    const detalle = document.getElementById("detalle-examen");
    if (detalle) {
        detalle.style.display = "none";
    }
}

document.getElementById("btnCerrarDetalleExamen")?.addEventListener("click", cerrarDetalleExamen);

document.getElementById("detalle-examen")?.addEventListener("click", (e) => {
    if (e.target.id === "detalle-examen") {
        cerrarDetalleExamen();
    }
});

document.addEventListener("keydown", (e) => {
    const detalle = document.getElementById("detalle-examen");
    if (e.key === "Escape" && detalle && detalle.style.display === "flex") {
        cerrarDetalleExamen();
    }
});

function formatearFechaExamen(iso) {
    if (!iso) return "Sin fecha límite";
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return iso;
    return fecha.toLocaleString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function renderizarExamenes() {
    const contenedor = document.getElementById("contenedor-examenes");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    if (examenesGrupo.length === 0) {
        contenedor.innerHTML = "<p>No hay exámenes registrados en este grupo.</p>";
        return;
    }

    const ahora = new Date();

    examenesGrupo.forEach((ex) => {
        const fechaLim = ex.fecha_limite ?? ex.fechaLimite;
        const vencido = fechaLim ? ahora > new Date(fechaLim) : false;
        const estadoTexto = vencido ? "Concluido" : "Disponible";
        const claseEstado = vencido ? "examen-concluido" : "";

        const tarjeta = document.createElement("article");
        tarjeta.className = `tarjeta-examen ${claseEstado}`;
        tarjeta.innerHTML = `
            <h4 class="examen-titulo-card">${ex.titulo ?? "Examen"}</h4>
            <p class="examen-meta-card">Puntos: <strong>${ex.calificacion ?? "-"}</strong> · Intentos: <strong>${ex.intentos ?? "-"}</strong></p>
            <p class="examen-fecha-card">Fecha límite: ${formatearFechaExamen(fechaLim)}</p>
            <span class="examen-estado-badge">${estadoTexto}</span>
        `;

        tarjeta.addEventListener("click", () => {
            const detalle = document.getElementById("detalle-examen");
            if (!detalle) return;
            detalle.style.display = "flex";
            document.getElementById("examen-titulo").textContent = ex.titulo ?? "Examen";
            document.getElementById("examen-info").textContent =
                `Intentos permitidos: ${ex.intentos ?? "-"} | Tiempo límite: ${ex.tiempo_limite ?? ex.tiempoLimite ?? "-"} | Puntos: ${ex.calificacion ?? "-"}`;
            document.getElementById("mensaje-examen").textContent =
                `Fecha límite: ${formatearFechaExamen(fechaLim)}`;
        });

        contenedor.appendChild(tarjeta);
    });
}

/* ---------- Usuarios del grupo ---------- */
async function obtenerDatosProfesorGrupo(grupoActual) {
    const matriculaProfe =
        grupoActual?.matriculaProfesor ??
        grupoActual?.matricula_profesor ??
        grupoActual?.profesor?.matricula ??
        null;

    // Si el objeto ya trae nombre y matrícula del profesor
    if (grupoActual?.profesor?.nombre) {
        return {
            nombre: grupoActual.profesor.nombre,
            matricula: grupoActual.profesor.matricula ?? matriculaProfe ?? ""
        };
    }

    if (!matriculaProfe) return null;

    try {
        const resp = await fetch(`${API_URL}/usuarios`);
        if (!resp.ok) {
            return { nombre: "Profesor del grupo", matricula: matriculaProfe };
        }
        const usuarios = await resp.json();
        const encontrado = usuarios.find(
            (u) => String(u.matricula) === String(matriculaProfe)
        );
        return {
            nombre: encontrado?.nombre ?? "Profesor del grupo",
            matricula: matriculaProfe
        };
    } catch {
        return { nombre: "Profesor del grupo", matricula: matriculaProfe };
    }
}

function crearTarjetaIntegrante(persona, esProfesor) {
    const tarjeta = document.createElement("article");
    tarjeta.className = `tarjeta-integrante${esProfesor ? " es-profesor" : ""}`;

    const encabezado = document.createElement("div");
    encabezado.className = "integrante-encabezado";

    const badge = document.createElement("span");
    badge.className = `badge-rol${esProfesor ? " profesor" : ""}`;
    badge.textContent = esProfesor ? "Maestro" : "Alumno";

    const nombre = document.createElement("span");
    nombre.className = "integrante-nombre";
    nombre.textContent = persona.nombre ?? "Sin nombre";

    encabezado.append(badge, nombre);

    const matricula = document.createElement("p");
    matricula.className = "integrante-matricula";
    matricula.textContent = persona.matricula ? `Matrícula: ${persona.matricula}` : "Docente titular";

    tarjeta.append(encabezado, matricula);
    return tarjeta;
}

async function cargarIntegrantesGrupo(idGrupo) {
    const contenedor = document.getElementById("contenedor-integrantes-grupo");
    if (!contenedor) return;

    contenedor.innerHTML = `<p class="mensaje-integrantes">Cargando integrantes del grupo...</p>`;

    try {
        const grupoActual = grupos.find(
            (g) => String(obtenerIdGrupo(g)) === String(idGrupo)
        );

        const [respAlumnos, datosProfesor] = await Promise.all([
            fetch(`${API_URL}/usuarios/grupo/${idGrupo}/alumnos`),
            obtenerDatosProfesorGrupo(grupoActual)
        ]);

        if (!respAlumnos.ok) {
            throw new Error("Error al cargar alumnos: " + respAlumnos.status);
        }

        const alumnos = await respAlumnos.json();
        const elementos = [];

        if (datosProfesor) {
            elementos.push(crearTarjetaIntegrante(datosProfesor, true));
        }

        const alumnosOrdenados = [...alumnos].sort((a, b) =>
            String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""), "es")
        );

        alumnosOrdenados.forEach((al) => {
            elementos.push(crearTarjetaIntegrante(al, false));
        });

        if (elementos.length === 0) {
            contenedor.innerHTML = `<p class="mensaje-integrantes">No hay integrantes registrados en este grupo.</p>`;
            return;
        }

        contenedor.replaceChildren(...elementos);
    } catch (err) {
        console.error(err);
        contenedor.innerHTML = `<p class="mensaje-integrantes">No se pudieron cargar los integrantes del grupo.</p>`;
    }
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
        if (typeof cerrarDetalleTarea === "function") cerrarDetalleTarea();
        if (typeof cerrarDetalleExamen === "function") cerrarDetalleExamen();
        
        botonesCurso.forEach((b) => {
            b.classList.remove("activo");
            b.removeAttribute("aria-current");
        });
        btn.classList.add("activo");
        btn.setAttribute("aria-current", "page");

        mostrarSeccion(btn.dataset.seccion);

        if (btn.dataset.seccion === "alumnos") {
            const idGrupo = sessionStorage.getItem("idGrupoActual");
            if (idGrupo) cargarIntegrantesGrupo(idGrupo);
        }
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
    cerrarDetalleTarea();
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