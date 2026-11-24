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
let filtroExamenActual = "actuales";
let examenAbiertoId = null;

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

    const ahora = new Date();
    const filtradas = tareasGrupo.filter((t) => {
        const estado = (t.estado ?? "").trim().toLowerCase();
        const esProrroga = estado.includes("prorroga") || estado.includes("prórroga");
        const fechaTermino = t.fechaTermino ? new Date(t.fechaTermino) : null;
        const fechaValida = fechaTermino && !Number.isNaN(fechaTermino.getTime());
        const vencida = fechaValida ? ahora > fechaTermino : false;
        const vigente = !vencida;

        if (filtroActividadActual === "prorroga") {
            return esProrroga && vigente;
        }
        if (filtroActividadActual === "concluidas") {
            return vencida;
        }
        return vigente && !esProrroga;
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
        const estadoRaw = (t.estado ?? "activo").trim().toLowerCase();

        const esProrroga = estadoRaw.includes("prorroga") || estadoRaw.includes("prórroga");
        const fechaTermino = t.fechaTermino ? new Date(t.fechaTermino) : null;
        const fechaValida = fechaTermino && !Number.isNaN(fechaTermino.getTime());
        const vencida = fechaValida ? ahora > fechaTermino : false;
        const vigente = !vencida;

        const claseEstado = esProrroga
            ? "tarea-prorroga"
            : (estadoRaw === "inactivo" ? "tarea-inactivo" : "tarea-activo");

        const etiquetaEstado = esProrroga
            ? "Con prórroga"
            : (estadoRaw === "inactivo" ? "Concluida" : "Actual");

        const estadoEntrega = entregaExistente
            ? (entregaExistente.calificacionObtenida != null
                ? `Calificada (${entregaExistente.calificacionObtenida})`
                : "Entregada")
            : "Pendiente";

        const textoFecha = esProrroga
            ? (vigente
                ? `Prórroga vigente hasta: ${formatearFechaCorta(t.fechaTermino)}`
                : `Prórroga vencida: ${formatearFechaCorta(t.fechaTermino)}`)
            : `Fecha límite: ${formatearFechaCorta(t.fechaTermino)}`;

        const tarjeta = document.createElement("article");
        tarjeta.className = `tarjeta-tarea-alumno ${claseEstado}`;
        tarjeta.innerHTML = `
            <h4 class="tarea-alumno-titulo">${t.titulo ?? "Sin título"}</h4>
            <p class="tarea-alumno-meta">Estado de entrega: <strong>${estadoEntrega}</strong></p>
            <p class="tarea-alumno-fecha">${textoFecha}</p>
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

    const estadoRaw = (tarea.estado ?? "").trim().toLowerCase();
    const esProrroga = estadoRaw.includes("prorroga") || estadoRaw.includes("prórroga");
    const fechaTermino = tarea.fechaTermino ? new Date(tarea.fechaTermino) : null;
    const fechaValida = fechaTermino && !Number.isNaN(fechaTermino.getTime());
    const ahora = new Date();
    const vigente = !fechaValida || ahora <= fechaTermino;

    const etiquetaVigencia = esProrroga
        ? (vigente
            ? `Prórroga vigente hasta: ${formatearFechaCorta(tarea.fechaTermino)}`
            : `Prórroga vencida (${formatearFechaCorta(tarea.fechaTermino)})`)
        : `Fecha límite: ${formatearFechaCorta(tarea.fechaTermino)}`;

    document.getElementById("tarea-info").textContent =
        `${etiquetaVigencia} | Estado actividad: ${tarea.estado ?? "-"}`;

    const inputContenido = document.getElementById("input-contenido");
    const inputArchivos = document.getElementById("input-archivos");
    const estadoTexto = document.getElementById("tarea-estado-entrega");
    const btnEnviar = document.getElementById("btn-enviar-entrega");
    const mensaje = document.getElementById("mensaje-entrega");
    if (mensaje) mensaje.textContent = "";

    const yaCalificada = entregaExistente?.calificacionObtenida != null;
    const puedeEntregar = vigente && !yaCalificada;

    if (entregaExistente) {
        estadoTexto.textContent = yaCalificada
            ? `Calificada: ${entregaExistente.calificacionObtenida} | Retroalimentación: ${entregaExistente.retroalimentacion ?? "Sin retroalimentación"}`
            : (vigente
                ? "Ya enviaste una entrega (puedes actualizarla mientras el periodo esté vigente)."
                : "Entrega registrada. El periodo habilitado ya finalizó.");
        inputContenido.value = entregaExistente.contenido ?? "";
        inputArchivos.value = entregaExistente.archivos ?? "";
        btnEnviar.disabled = !puedeEntregar;
        btnEnviar.textContent = yaCalificada
            ? "Ya calificada"
            : (vigente ? "Actualizar entrega" : "Periodo cerrado");
    } else {
        estadoTexto.textContent = vigente
            ? (esProrroga
                ? "Prórroga activa: puedes enviar tu entrega dentro del periodo habilitado."
                : "Aún no has realizado esta entrega.")
            : "El periodo de entrega ha finalizado.";
        inputContenido.value = "";
        inputArchivos.value = "";
        btnEnviar.disabled = !puedeEntregar;
        btnEnviar.textContent = vigente ? "Enviar entrega" : "Periodo cerrado";
    }

    inputContenido.disabled = !puedeEntregar;
    inputArchivos.disabled = !puedeEntregar;
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
    examenAbiertoId = null;
    const detalle = document.getElementById("detalle-examen");
    if (detalle) {
        detalle.style.display = "none";
    }
    const formExamen = document.getElementById("form-responder-examen");
    const resultadoBox = document.getElementById("resultado-examen");
    if (formExamen) formExamen.style.display = "none";
    if (resultadoBox) {
        resultadoBox.style.display = "none";
        resultadoBox.textContent = "";
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

function esExamenVencidoPorDia(fechaLimRaw) {
    if (!fechaLimRaw) return false;
    const fechaLim = new Date(fechaLimRaw);
    if (Number.isNaN(fechaLim.getTime())) return false;

    const finDiaLimite = new Date(
        fechaLim.getFullYear(),
        fechaLim.getMonth(),
        fechaLim.getDate(),
        23, 59, 59, 999
    );

    return new Date() > finDiaLimite;
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

    const filtrados = examenesGrupo.filter((ex) => {
        const estadoRaw = String(ex.estado ?? "").trim().toLowerCase();
        const esProrroga = estadoRaw.includes("prorroga") || estadoRaw.includes("prórroga");
        const fechaLim = ex.fecha_limite ?? ex.fechaLimite;
        const fechaObj = fechaLim ? new Date(fechaLim) : null;
        const vencido = fechaObj && !Number.isNaN(fechaObj.getTime()) ? ahora > fechaObj : false;
        const vigente = !vencido;

        if (filtroExamenActual === "prorroga") return esProrroga && vigente;
        if (filtroExamenActual === "concluidas") return vencido;
        return vigente && !esProrroga;
    });

    if (filtrados.length === 0) {
        contenedor.innerHTML = "<p>No hay exámenes en este filtro.</p>";
        return;
    }

    filtrados.forEach((ex) => {
        const estadoRaw = String(ex.estado ?? "").trim().toLowerCase();
        const esProrroga = estadoRaw.includes("prorroga") || estadoRaw.includes("prórroga");
        const fechaLim = ex.fecha_limite ?? ex.fechaLimite;
        const fechaObj = fechaLim ? new Date(fechaLim) : null;
        const vencido = fechaObj && !Number.isNaN(fechaObj.getTime()) ? ahora > fechaObj : false;
        const vigente = !vencido;

        const estadoTexto = esProrroga
            ? (vigente ? "Con prórroga" : "Prórroga vencida")
            : (vencido ? "Concluido" : "Disponible");

        const claseEstado = vencido && !esProrroga
            ? "examen-concluido"
            : (esProrroga ? "examen-prorroga" : "");

        const puntosEx = ex.calificacion_asignada ?? ex.calificacionAsignada ?? ex.calificacion ?? "-";
        const intentosEx = ex.intentos_permitidos ?? ex.intentosPermitidos ?? ex.intentos ?? "-";
        const tiempoRaw = ex.tiempo_limite ?? ex.tiempoLimite;
        const tiempoTexto = tiempoRaw ? ` · Duración: ${tiempoRaw}` : "";

        const tarjeta = document.createElement("article");
        tarjeta.className = `tarjeta-examen ${claseEstado}`;
        tarjeta.innerHTML = `
            <h4 class="examen-titulo-card">${ex.titulo ?? "Examen"}</h4>
            <p class="examen-meta-card">Puntos: <strong>${puntosEx}</strong> · Intentos: <strong>${intentosEx}</strong>${tiempoTexto}</p>
            <p class="examen-fecha-card">Fecha límite: ${formatearFechaExamen(fechaLim)}</p>
            <span class="examen-estado-badge">${estadoTexto}</span>
        `;

        tarjeta.addEventListener("click", () => {
            const detalle = document.getElementById("detalle-examen");
            if (!detalle) return;
            detalle.style.display = "flex";
            document.getElementById("examen-titulo").textContent = ex.titulo ?? "Examen";
            document.getElementById("examen-info").textContent =
                `Intentos permitidos: ${intentosEx} | Tiempo límite: ${tiempoRaw ?? "-"} | Puntos: ${puntosEx}`;
            document.getElementById("mensaje-examen").textContent =
                `Fecha límite: ${formatearFechaExamen(fechaLim)}`;

            const btnEnviarExamen = document.getElementById("btn-enviar-examen");
            if (btnEnviarExamen) btnEnviarExamen.disabled = false;

            cargarReactivosDeExamen(obtenerIdExamen(ex));
        });

        contenedor.appendChild(tarjeta);
    });
}

function obtenerIdExamen(ex) {
    return ex.idExamen ?? ex.id_examen ?? ex.id;
}

async function cargarReactivosDeExamen(idExamen) {
    examenAbiertoId = idExamen;
    const formExamen = document.getElementById("form-responder-examen");
    const contReactivos = document.getElementById("contenedor-reactivos-examen");
    const resultadoBox = document.getElementById("resultado-examen");
    const msgExamen = document.getElementById("mensaje-examen");

    if (!formExamen || !contReactivos) return;

    formExamen.style.display = "none";
    if (resultadoBox) {
        resultadoBox.style.display = "none";
        resultadoBox.textContent = "";
    }
    contReactivos.innerHTML = "";
    if (msgExamen) msgExamen.textContent = "Cargando preguntas del examen...";

    const guardadoPrevio = leerEstadoExamenAlumno(idExamen);

    try {
        const resp = await fetch(`${API_URL}/reactivos`);
        if (!resp.ok) throw new Error("Error al cargar reactivos: " + resp.status);

        const todos = await resp.json();
        const reactivos = todos.filter(
            (r) => String(r.id_examen ?? r.idExamen ?? "") === String(idExamen)
        );

        if (reactivos.length === 0) {
            if (msgExamen) msgExamen.textContent = "Este examen aún no tiene preguntas registradas.";
            return;
        }

        if (msgExamen) {
            msgExamen.textContent = guardadoPrevio?.enviado
                ? `Este examen ya fue enviado (${reactivos.length} reactivo(s)).`
                : `Responde las ${reactivos.length} pregunta(s) y presiona "Enviar examen".`;
        }

        reactivos.forEach((r, idx) => {
            const idReactivo = r.id_reactivo ?? r.idReactivo ?? r.id ?? idx;
            const puntos = r.valor ?? 0;
            const tipoRaw = String(r.tipo ?? "").trim().toLowerCase();

            let opciones = [r.opcion_1, r.opcion_2, r.opcion_3, r.opcion_4].filter(
                (op) => op && String(op).trim() !== ""
            );

            const esFalsoVerdadero =
                tipoRaw.includes("falso") || tipoRaw.includes("verdadero") || tipoRaw === "vf" || tipoRaw === "v/f";
            const esAbierta = tipoRaw.includes("abierta");

            if (esFalsoVerdadero && opciones.length === 0) {
                opciones = ["Verdadero", "Falso"];
            }

            const usarOpciones = !esAbierta && opciones.length > 0;
            const respuestaPrevia = guardadoPrevio?.respuestas?.find(
                (item) => String(item.idReactivo) === String(idReactivo)
            )?.respuesta ?? "";

            const card = document.createElement("div");
            card.className = "tarjeta-reactivo-alumno";
            card.dataset.idReactivo = idReactivo;
            card.dataset.valor = puntos;
            card.dataset.tipo = tipoRaw;
            card.dataset.respuestaCorrecta = r.respuesta_correcta ?? "";

            const cabecera = document.createElement("div");
            cabecera.className = "reactivo-cabecera";
            cabecera.innerHTML = `<span>Reactivo #${idx + 1} (${r.tipo || (usarOpciones ? "Opción" : "Abierta")})</span><span>${puntos} pts</span>`;

            const enunciado = document.createElement("p");
            enunciado.className = "reactivo-enunciado";
            enunciado.textContent = r.enunciado ?? "Sin enunciado";

            card.append(cabecera, enunciado);

            if (usarOpciones) {
                const divOps = document.createElement("div");
                divOps.className = "opciones-reactivo-alumno";
                opciones.forEach((op, opIdx) => {
                    const label = document.createElement("label");
                    label.className = "opcion-radio-label";

                    const radio = document.createElement("input");
                    radio.type = "radio";
                    radio.name = `reactivo_${idReactivo}`;
                    radio.value = op;
                    radio.dataset.indiceOpcion = String(opIdx + 1);
                    if (respuestaPrevia && String(respuestaPrevia) === String(op)) {
                        radio.checked = true;
                    }
                    if (opIdx === 0) radio.required = true;

                    const spanTxt = document.createElement("span");
                    spanTxt.textContent = op;

                    label.append(radio, spanTxt);
                    divOps.append(label);
                });
                card.append(divOps);
            } else {
                const textarea = document.createElement("textarea");
                textarea.rows = 3;
                textarea.placeholder = "Escribe tu respuesta...";
                textarea.required = true;
                textarea.value = respuestaPrevia;
                textarea.dataset.respuestaAlumno = "true";
                card.append(textarea);
            }

            contReactivos.append(card);
        });

        formExamen.style.display = "flex";

        if (guardadoPrevio?.enviado) {
            bloquearCamposExamen(true);
            if (resultadoBox) {
                resultadoBox.style.display = "block";
                resultadoBox.textContent = `Examen ya enviado (${guardadoPrevio.respuestas?.length ?? reactivos.length} reactivo(s) registrado(s)).`;
            }
        } else {
            bloquearCamposExamen(false);
        }
        const califGuardada = leerCalificacionExamenAlumno(idExamen);

        if (califGuardada) {
            mostrarResumenCalificacionAlumno(califGuardada);
        }
    } catch (err) {
        console.error(err);
        if (msgExamen) msgExamen.textContent = "No se pudieron cargar las preguntas del examen.";
    }
}

const formResponderExamen = document.getElementById("form-responder-examen");
if (formResponderExamen) {
    formResponderExamen.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (examenAbiertoId == null) return;

        const tarjetas = [...document.querySelectorAll(".tarjeta-reactivo-alumno")];
        let puntosAutomaticos = 0;
        let puntosTotales = 0;
        let preguntasAbiertasPendientes = 0;

        const respuestas = tarjetas.map((card) => {
            const idReactivo = card.dataset.idReactivo;
            const valor = Number(card.dataset.valor) || 0;
            const tipo = String(card.dataset.tipo || "").toLowerCase();
            const respuestaCorrecta = card.dataset.respuestaCorrecta;

            puntosTotales += valor;

            const checkedRadio = card.querySelector('input[type="radio"]:checked');
            const textarea = card.querySelector("textarea");

            const esAbierta = tipo.includes("abierta") || (!checkedRadio && textarea);

            if (esAbierta) {
                preguntasAbiertasPendientes += 1;
                return {
                    idReactivo,
                    enunciado: card.querySelector(".reactivo-enunciado")?.textContent ?? "",
                    valorMaximo: valor,
                    tipo: "abierta",
                    respuesta: textarea ? textarea.value.trim() : "",
                    puntosObtenidos: null,
                    pendienteRevision: true
                };
            }

            const indiceMarcado = checkedRadio ? Number(checkedRadio.dataset.indiceOpcion) : null;
            const esCorrecta =
                respuestaCorrecta !== undefined &&
                respuestaCorrecta !== "" &&
                indiceMarcado === Number(respuestaCorrecta);

            const puntosObtenidos = esCorrecta ? valor : 0;
            puntosAutomaticos += puntosObtenidos;

            return {
                idReactivo,
                tipo,
                respuesta: checkedRadio ? checkedRadio.value : "",
                puntosObtenidos,
                esCorrecta,
                pendienteRevision: false
            };
        });

        guardarEstadoExamenAlumno(examenAbiertoId, {
            enviado: true,
            fechaEnvio: new Date().toISOString(),
            respuestas
        });

        const loteBackend = respuestas.map((item) => ({
            id_reactivo: Number(item.idReactivo),
            id_alumno: String(matriculaAlumno),
            opcion_elegida: item.pendienteRevision
                ? null
                : (tarjetas.find((c) => String(c.dataset.idReactivo) === String(item.idReactivo))
                    ?.querySelector('input[type="radio"]:checked')?.dataset.indiceOpcion
                    ? Number(
                        tarjetas.find((c) => String(c.dataset.idReactivo) === String(item.idReactivo))
                            .querySelector('input[type="radio"]:checked').dataset.indiceOpcion
                    )
                    : null),
            respuesta_texto: item.pendienteRevision ? item.respuesta : null,
            es_correcta: item.pendienteRevision ? null : Boolean(item.esCorrecta)
        }));

        try {
            const respBackend = await fetch(`${API_URL}/respuestas-alumno/lote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loteBackend)
            });
            if (!respBackend.ok) {
                console.warn("No se pudo guardar el lote en BD:", await respBackend.text());
            }
        } catch (err) {
            console.error("Error de red al guardar respuestas en BD:", err);
        }

        const califPrevia = leerCalificacionExamenAlumno(examenAbiertoId);
        const notaFinal = califPrevia?.calificacionManual != null
            ? califPrevia.calificacionManual
            : puntosAutomaticos;

        const payloadCalif = {
            calificacion: notaFinal,
            puntosAutomaticos,
            puntosTotales,
            preguntasAbiertasPendientes,
            retroalimentacion: califPrevia?.retroalimentacion ?? "",
            calificacionManual: califPrevia?.calificacionManual ?? null
        };

        guardarCalificacionExamenAlumno(examenAbiertoId, payloadCalif);
        bloquearCamposExamen(true);
        mostrarResumenCalificacionAlumno(payloadCalif);
    });
}

function obtenerClaveExamenAlumno(idExamen) {
    return `examen_enviado_${matriculaAlumno}_${idExamen}`;
}

function leerEstadoExamenAlumno(idExamen) {
    try {
        const raw = sessionStorage.getItem(obtenerClaveExamenAlumno(idExamen));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function guardarEstadoExamenAlumno(idExamen, payload) {
    try {
        sessionStorage.setItem(obtenerClaveExamenAlumno(idExamen), JSON.stringify(payload));
    } catch (err) {
        console.error("No se pudo guardar el estado del examen en sesión:", err);
    }
}

function bloquearCamposExamen(bloqueado) {
    const tarjetas = document.querySelectorAll(".tarjeta-reactivo-alumno");
    tarjetas.forEach((card) => {
        card.querySelectorAll("textarea, input[type='radio']").forEach((el) => {
            el.disabled = bloqueado;
        });
    });
    const btnEnviar = document.getElementById("btn-enviar-examen");
    if (btnEnviar) {
        btnEnviar.disabled = bloqueado;
        btnEnviar.textContent = bloqueado ? "Examen enviado" : "Enviar examen";
    }
}

function guardarCalificacionExamenAlumno(idExamen, payload) {
    try {
        sessionStorage.setItem(
            `calificacion_examen_${matriculaAlumno}_${idExamen}`,
            JSON.stringify(payload)
        );
    } catch (err) {
        console.error("No se pudo guardar la calificación del examen:", err);
    }
}

function leerCalificacionExamenAlumno(idExamen) {
    try {
        const raw = sessionStorage.getItem(`calificacion_examen_${matriculaAlumno}_${idExamen}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function mostrarResumenCalificacionAlumno(califData) {
    const resultadoBox = document.getElementById("resultado-examen");
    if (!resultadoBox || !califData) return;

    resultadoBox.style.display = "block";
    const pendientesTxt = califData.preguntasAbiertasPendientes > 0
        ? ` (${califData.preguntasAbiertasPendientes} pregunta(s) abierta(s) pendiente(s) de calificación por el maestro)`
        : "";
    const retroTxt = califData.retroalimentacion
        ? ` | Retroalimentación: ${califData.retroalimentacion}`
        : "";

    resultadoBox.textContent =
        `Calificación obtenida: ${califData.calificacion} / ${califData.puntosTotales}${pendientesTxt}${retroTxt}`;
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
    filtroExamenActual = filtro;
    cerrarDetalleExamen();
    renderizarExamenes();
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