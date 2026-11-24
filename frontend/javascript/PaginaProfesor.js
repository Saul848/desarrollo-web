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

let filtroExamenes = "actuales";

function aplicarFiltroExamenes(filtro) {
    filtroExamenes = filtro;
    if (grupoSeleccionado?.id) {
        cargarExamenes(grupoSeleccionado.id);
    }

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

    if (nombre === "examenes" && grupoSeleccionado?.id) {
    cargarExamenes(grupoSeleccionado.id);
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
    tarjeta.addEventListener("click", () => abrirCurso(id, nombre, Boolean(grupo.activo)));
    return tarjeta;
}

let grupoSeleccionado = null; 

function abrirCurso(id, nombre, activo = true) {
    grupoSeleccionado = { id, nombre, activo: Boolean(activo)};
    document.getElementById("nombre-curso").textContent = nombre;
    actualizarBotonEstadoGrupo(grupoSeleccionado.activo);

    // Cada curso abre en Actividades y con el filtro "Actuales"
    document.querySelector('#barra-botones button[data-seccion="actividades"]').click();
    document.querySelector('#filtros-actividades button[data-filtro="actuales"]').click();

    cargarActividades(id);
    mostrarModal("areaActividad");
}

const btnCerrarGrupo = document.getElementById("btnCerrarGrupo");

function actualizarBotonEstadoGrupo(activo) {
    if (!btnCerrarGrupo) return;
    if (activo) {
        btnCerrarGrupo.textContent = "Cerrar grupo";
        btnCerrarGrupo.className = "btn-expulsar-alumno";
    } else {
        btnCerrarGrupo.textContent = "Activar grupo";
        btnCerrarGrupo.className = "btn-confirmar-turquesa";
    }
}

btnCerrarGrupo?.addEventListener("click", async () => {
    if (!grupoSeleccionado?.id) return;

    const vaACerrar = Boolean(grupoSeleccionado.activo);
    const accion = vaACerrar ? "cerrar" : "activar";
    const confirmar = confirm(`¿Seguro que deseas ${accion} el grupo "${grupoSeleccionado.nombre}"?`);
    if (!confirmar) return;

    try {
        const res = await fetch(`${API}/grupos/${grupoSeleccionado.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: !vaACerrar })
        });

        if (!res.ok) {
            throw new Error(await res.text() || `HTTP ${res.status}`);
        }

        const actualizado = await res.json();
        const nuevoEstado = Boolean(actualizado.activo ?? !vaACerrar);
        grupoSeleccionado.activo = nuevoEstado;
        actualizarBotonEstadoGrupo(nuevoEstado);

        await cargarGrupos(MATRICULA_PROFESOR);
        mostrarModal("areaCursos");
    } catch (error) {
        console.error(error);
        alert(`No se pudo ${accion} el grupo: ` + error.message);
    }
});

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

// ===== Exámenes y Reactivos del grupo abierto =====
const contenedorExamenes = document.getElementById("contenedor-examenes");
const modalCrearExamen = document.getElementById("modal-crear-examen");
const formCrearExamen = document.getElementById("form-crear-examen");
const listaReactivos = document.getElementById("lista-reactivos");
const errorCrearExamen = document.getElementById("error-crear-examen");
const btnConfirmarExamen = document.getElementById("btnConfirmarExamen");

let examenesCargados = [];
let contadorReactivos = 0;

document.getElementById("btnCrearExamen").addEventListener("click", abrirModalCrearExamen);
document.getElementById("btnCancelarExamen").addEventListener("click", cerrarModalCrearExamen);
document.getElementById("btnCerrarModalExamen").addEventListener("click", cerrarModalCrearExamen);
document.getElementById("btnAgregarReactivo").addEventListener("click", () => agregarTarjetaReactivo());

modalCrearExamen.addEventListener("click", (e) => {
    if (e.target === modalCrearExamen) cerrarModalCrearExamen();
});

function abrirModalCrearExamen() {
    if (!grupoSeleccionado?.id) {
        alert("Primero selecciona un grupo.");
        return;
    }
    formCrearExamen.reset();
    errorCrearExamen.hidden = true;
    errorCrearExamen.textContent = "";
    listaReactivos.replaceChildren();
    contadorReactivos = 0;

    // Agrega un primer reactivo por defecto para facilitar el llenado
    agregarTarjetaReactivo();
    modalCrearExamen.style.display = "flex";
}

function cerrarModalCrearExamen() {
    modalCrearExamen.style.display = "none";
}

function agregarTarjetaReactivo() {
    contadorReactivos += 1;
    const num = contadorReactivos;

    const tarjeta = crearElemento("div", "tarjeta-reactivo");
    tarjeta.dataset.indice = num;

    const cabecera = crearElemento("div", "cabecera-reactivo");
    cabecera.append(crearElemento("strong", "", `Reactivo #${num}`));

    const btnQuitar = crearElemento("button", "btn-quitar-reactivo", "Eliminar");
    btnQuitar.type = "button";
    btnQuitar.addEventListener("click", () => {
        tarjeta.remove();
        renumerarReactivos();
    });
    cabecera.append(btnQuitar);

    const filaSuperior = crearElemento("div", "fila-campos-examen");

    const grupoTipo = crearElemento("div", "campo-form");
    const labelTipo = crearElemento("label", "", "Tipo de pregunta:");
    const selectTipo = document.createElement("select");
    selectTipo.className = "tipo-reactivo";
    selectTipo.innerHTML = `
        <option value="abierta">Pregunta abierta</option>
        <option value="verdadero_falso">Verdadero / Falso</option>
        <option value="opcion_multiple">Opción múltiple</option>
    `;
    grupoTipo.append(labelTipo, selectTipo);

    const grupoValor = crearElemento("div", "campo-form");
    const labelValor = crearElemento("label", "", "Valor (puntos):");
    const inputValor = document.createElement("input");
    inputValor.type = "number";
    inputValor.className = "valor-reactivo";
    inputValor.min = "0.5";
    inputValor.step = "0.5";
    inputValor.value = "10";
    inputValor.required = true;
    grupoValor.append(labelValor, inputValor);

    filaSuperior.append(grupoTipo, grupoValor);

    const grupoEnunciado = crearElemento("div", "campo-form");
    const labelEnunciado = crearElemento("label", "", "Pregunta / Redacción:");
    const inputEnunciado = document.createElement("textarea");
    inputEnunciado.className = "enunciado-reactivo";
    inputEnunciado.rows = 2;
    inputEnunciado.placeholder = "Escribe la pregunta o instrucción del reactivo...";
    inputEnunciado.required = true;
    grupoEnunciado.append(labelEnunciado, inputEnunciado);

    const contenedorDinamico = crearElemento("div", "detalle-tipo-reactivo");

    const renderizarCamposTipo = () => {
        contenedorDinamico.replaceChildren();
        const tipo = selectTipo.value;

        if (tipo === "abierta") {
            const wrap = crearElemento("div", "campo-form");
            wrap.append(crearElemento("label", "", "Respuesta esperada / guía de calificación:"));
            const inputResp = document.createElement("input");
            inputResp.type = "text";
            inputResp.className = "respuesta-reactivo";
            inputResp.placeholder = "Respuesta modelo o criterio clave";
            wrap.append(inputResp);
            contenedorDinamico.append(wrap);
        } else if (tipo === "verdadero_falso") {
            const wrap = crearElemento("div", "campo-form");
            wrap.append(crearElemento("label", "", "Respuesta correcta:"));
            const selectFV = document.createElement("select");
            selectFV.className = "respuesta-reactivo";
            selectFV.innerHTML = `
                <option value="Verdadero">Verdadero</option>
                <option value="Falso">Falso</option>
            `;
            wrap.append(selectFV);
            contenedorDinamico.append(wrap);
        } else if (tipo === "opcion_multiple") {
            const wrap = crearElemento("div", "campo-form");
            wrap.append(crearElemento("label", "", "Opciones (A, B, C, D):"));

            const grid = crearElemento("div", "grid-opciones-multiple");
            ["A", "B", "C", "D"].forEach((letra) => {
                const inp = document.createElement("input");
                inp.type = "text";
                inp.className = "opcion-multiple";
                inp.dataset.opcion = letra;
                inp.placeholder = `Opción ${letra}`;
                grid.append(inp);
            });

            const wrapCorrecta = crearElemento("div", "campo-form");
            wrapCorrecta.style.marginTop = "0.6rem";
            wrapCorrecta.append(crearElemento("label", "", "Inciso correcto:"));
            const selectCorrecta = document.createElement("select");
            selectCorrecta.className = "respuesta-reactivo";
            selectCorrecta.innerHTML = `
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
            `;
            wrapCorrecta.append(selectCorrecta);

            wrap.append(grid, wrapCorrecta);
            contenedorDinamico.append(wrap);
        }
    };

    selectTipo.addEventListener("change", renderizarCamposTipo);
    renderizarCamposTipo();

    tarjeta.append(cabecera, filaSuperior, grupoEnunciado, contenedorDinamico);
    listaReactivos.append(tarjeta);
}

function renumerarReactivos() {
    listaReactivos.querySelectorAll(".tarjeta-reactivo").forEach((tarjeta, idx) => {
        const strong = tarjeta.querySelector(".cabecera-reactivo strong");
        if (strong) strong.textContent = `Reactivo #${idx + 1}`;
    });
}

function recolectarReactivos(idExamen) {
    const tarjetas = [...listaReactivos.querySelectorAll(".tarjeta-reactivo")];

    return tarjetas.map((tarjeta) => {
        const tipo = tarjeta.querySelector(".tipo-reactivo").value;
        const valor = Number(tarjeta.querySelector(".valor-reactivo").value);
        const enunciado = tarjeta.querySelector(".enunciado-reactivo").value.trim();

        let opcion_1 = null;
        let opcion_2 = null;
        let opcion_3 = null;
        let opcion_4 = null;
        let respuesta_correcta = null;

        if (tipo === "opcion_multiple") {
            const opciones = [...tarjeta.querySelectorAll(".opcion-multiple")];
            opcion_1 = opciones[0]?.value.trim() || null;
            opcion_2 = opciones[1]?.value.trim() || null;
            opcion_3 = opciones[2]?.value.trim() || null;
            opcion_4 = opciones[3]?.value.trim() || null;

            const letra = tarjeta.querySelector(".respuesta-reactivo")?.value;
            const mapaIndice = { A: 1, B: 2, C: 3, D: 4 };
            respuesta_correcta = mapaIndice[letra] ?? null;
        } else if (tipo === "verdadero_falso") {
            opcion_1 = "Verdadero";
            opcion_2 = "Falso";
            const elegida = tarjeta.querySelector(".respuesta-reactivo")?.value;
            respuesta_correcta = elegida === "Verdadero" ? 1 : 2;
        }
        // Si es "abierta", opcion_1..4 y respuesta_correcta quedan en null

        return {
            id_examen: idExamen,
            tipo,
            enunciado,
            opcion_1,
            opcion_2,
            opcion_3,
            opcion_4,
            respuesta_correcta,
            valor
        };
    });
}

formCrearExamen.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorCrearExamen.hidden = true;

    const titulo = document.getElementById("titulo-examen").value.trim();
    const fechaLimiteRaw = document.getElementById("fecha-limite-examen").value;
    const calificacion = Number(document.getElementById("puntos-examen").value);
    const intentos = Number(document.getElementById("intentos-examen").value);
    const tiempoLimiteRaw = document.getElementById("tiempo-limite-examen").value;

    if (!titulo || !fechaLimiteRaw || !calificacion) {
        errorCrearExamen.textContent = "Completa el título, la fecha límite y los puntos del examen.";
        errorCrearExamen.hidden = false;
        return;
    }

    const reactivos = recolectarReactivos(null);
    if (reactivos.length === 0) {
        errorCrearExamen.textContent = "Añade al menos un reactivo al examen.";
        errorCrearExamen.hidden = false;
        return;
    }

    btnConfirmarExamen.disabled = true;
    try {
        // 1. Crear el examen
        const fechaLimiteISO = fechaLimiteRaw.length === 16 ? `${fechaLimiteRaw}:00` : fechaLimiteRaw;
        const resExamen = await fetch(`${API}/examenes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_grupo: grupoSeleccionado.id,
                titulo,
                calificacion_asignada: calificacion,
                fecha_limite: fechaLimiteISO,
                intentos_permitidos: intentos,
                tiempo_limite: tiempoLimiteRaw ? Number(tiempoLimiteRaw) : null
            })
        });

        if (!resExamen.ok) {
            throw new Error(await resExamen.text() || `HTTP ${resExamen.status}`);
        }

        const examenCreado = await resExamen.json();
        const idExamen = examenCreado.id_examen ?? examenCreado.idExamen ?? examenCreado.id;

        // 2. Guardar cada reactivo asociado al examen creado
        for (const r of reactivos) {
            const resReactivo = await fetch(`${API}/reactivos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...r, id_examen: idExamen })
            });
            if (!resReactivo.ok) {
                throw new Error(`Error al guardar reactivo: ${await resReactivo.text()}`);
            }
        }

        cerrarModalCrearExamen();
        await cargarExamenes(grupoSeleccionado.id);
    } catch (error) {
        console.error(error);
        errorCrearExamen.textContent = "No se pudo guardar el examen: " + error.message;
        errorCrearExamen.hidden = false;
    } finally {
        btnConfirmarExamen.disabled = false;
    }
});

async function cargarExamenes(idGrupo) {
    if (!contenedorExamenes) return;
    contenedorExamenes.replaceChildren(crearElemento("p", "", "Cargando exámenes..."));
    try {
        const res = await fetch(`${API}/examenes/grupo/${idGrupo}`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        examenesCargados = await res.json();
        renderizarExamenes();
    } catch (error) {
        console.error(error);
        contenedorExamenes.replaceChildren(crearElemento("p", "", "No se pudieron cargar los exámenes."));
    }
}

let examenSeleccionadoProf = null;

function esExamenVencidoPorDia(fechaLimRaw) {
    if (!fechaLimRaw) return false;
    const fechaLim = new Date(fechaLimRaw);
    if (Number.isNaN(fechaLim.getTime())) return false;

    // Fin del día (23:59:59.999) de la fecha límite para que un examen de hoy no salga concluido hoy mismo
    const finDiaLimite = new Date(
        fechaLim.getFullYear(),
        fechaLim.getMonth(),
        fechaLim.getDate(),
        23, 59, 59, 999
    );

    const ahora = new Date();
    return ahora > finDiaLimite;
}

function obtenerIdExamenProf(ex) {
    return ex.idExamen ?? ex.id_examen ?? ex.id;
}

function cerrarModalDetalleExamenProf() {
    examenSeleccionadoProf = null;
    const modal = document.getElementById("modal-detalle-examen");
    if (modal) modal.style.display = "none";
}

document.getElementById("btnCerrarDetalleExamenProf")?.addEventListener("click", cerrarModalDetalleExamenProf);
document.getElementById("modal-detalle-examen")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-detalle-examen") cerrarModalDetalleExamenProf();
});

async function cargarRespuestasExamenParaProfesor(idExamen, idGrupo) {
    const cont = document.getElementById("contenedor-respuestas-examen");
    if (!cont) return;
    cont.replaceChildren(crearElemento("p", "", "Cargando respuestas de alumnos..."));

    let alumnos = [];
    try {
        const resAl = await fetch(`${API}/usuarios/grupo/${idGrupo}/alumnos`);
        if (resAl.ok) alumnos = await resAl.json();
    } catch (err) {
        console.error(err);
    }

    let reactivosExamen = [];
    let respuestasBD = [];
    try {
        const [resReact, resResp] = await Promise.all([
            fetch(`${API}/reactivos`),
            fetch(`${API}/respuestas-alumno`)
        ]);
        if (resReact.ok) {
            const todosReactivos = await resReact.json();
            reactivosExamen = todosReactivos.filter(
                (r) => String(r.id_examen ?? r.idExamen ?? "") === String(idExamen)
            );
        }
        if (resResp.ok) {
            respuestasBD = await resResp.json();
        }
    } catch (err) {
        console.error(err);
    }

    const mapaReactivos = new Map(
        reactivosExamen.map((r) => [
            String(r.id_reactivo ?? r.idReactivo ?? r.id),
            r
        ])
    );

    const filas = [];
    if (alumnos.length > 0) {
        alumnos.forEach((al) => {
            const matricula = String(al.matricula);
            let registro = null;

            try {
                const rawSession = sessionStorage.getItem(`examen_enviado_${matricula}_${idExamen}`);
                if (rawSession) registro = JSON.parse(rawSession);
            } catch {
                // ignorar error de parseo
            }

            if (!registro && respuestasBD.length > 0 && mapaReactivos.size > 0) {
                const filasAlumnoExamen = respuestasBD.filter((rb) => {
                    const idAl = String(rb.id_alumno ?? rb.idAlumno ?? "");
                    const idRe = String(rb.id_reactivo ?? rb.idReactivo ?? "");
                    return idAl === matricula && mapaReactivos.has(idRe);
                });

                if (filasAlumnoExamen.length > 0) {
                    const respuestasReconstruidas = filasAlumnoExamen.map((rb) => {
                        const idRe = String(rb.id_reactivo ?? rb.idReactivo ?? "");
                        const react = mapaReactivos.get(idRe);
                        const tipoRaw = String(react?.tipo ?? "").trim().toLowerCase();
                        const esAbierta = tipoRaw.includes("abierta");
                        const valorReact = Number(react?.valor) || 0;
                        const textoResp = rb.respuesta_texto ?? rb.respuestaTexto ?? "";
                        const opcionElegida = rb.opcion_elegida ?? rb.opcionElegida ?? null;
                        const esCorrectaRaw = rb.es_correcta ?? rb.esCorrecta ?? false;

                        if (esAbierta) {
                            return {
                                idReactivo: idRe,
                                enunciado: react?.enunciado ?? "",
                                valorMaximo: valorReact,
                                tipo: "abierta",
                                respuesta: textoResp,
                                puntosObtenidos: null,
                                pendienteRevision: true
                            };
                        }

                        const opciones = [react?.opcion_1, react?.opcion_2, react?.opcion_3, react?.opcion_4];
                        const idxElegida = Number(opcionElegida);
                        const textoOpcion =
                            idxElegida >= 1 && idxElegida <= opciones.length
                                ? (opciones[idxElegida - 1] ?? `Opción ${idxElegida}`)
                                : (opcionElegida ? `Opción ${opcionElegida}` : "");

                        const esCorrecta = Boolean(esCorrectaRaw);
                        return {
                            idReactivo: idRe,
                            tipo: tipoRaw,
                            respuesta: textoOpcion,
                            puntosObtenidos: esCorrecta ? valorReact : 0,
                            esCorrecta,
                            pendienteRevision: false
                        };
                    });

                    registro = {
                        enviado: true,
                        respuestas: respuestasReconstruidas
                    };
                }
            }

            const card = crearElemento("div", "tarjeta-reactivo");
            card.append(crearElemento("strong", "", `${al.nombre} (${matricula})`));

            const respuestasLista = registro?.respuestas ?? [];
            const califGuardada = leerCalificacionExamenProf(matricula, idExamen);

            const puntosCerradas = respuestasLista
                .filter((item) => !item.pendienteRevision)
                .reduce((acc, item) => acc + (Number(item.puntosObtenidos) || 0), 0);

            const abiertas = respuestasLista
                .map((item, idx) => ({ item, numeroReactivo: idx + 1 }))
                .filter(({ item }) => item.pendienteRevision);

            if (respuestasLista.length > 0) {
                const lista = crearElemento("ul", "");
                respuestasLista.forEach((item, idx) => {
                    let detalleEstado = "";
                    if (item.pendienteRevision) {
                        const notaAbierta = califGuardada?.notasAbiertas?.[item.idReactivo];
                        const maxPts = item.valorMaximo ?? "";
                        detalleEstado = notaAbierta != null
                            ? ` (Abierta: ${notaAbierta}${maxPts !== "" ? ` / ${maxPts}` : ""} pts)`
                            : ` (Abierta${maxPts !== "" ? ` - máx. ${maxPts} pts` : ""} - pendiente de calificar)`;
                    } else {
                        detalleEstado = item.esCorrecta
                            ? ` (${item.puntosObtenidos} pts - automática)`
                            : " (0 pts - automática)";
                    }

                    lista.append(
                        crearElemento(
                            "li",
                            "",
                            `Reactivo #${idx + 1}: ${item.respuesta || "Sin respuesta"}${detalleEstado}`
                        )
                    );
                });
                card.append(lista);
            } else {
                card.append(crearElemento("p", "", "Sin respuestas registradas aún."));
            }

            if (respuestasLista.length > 0 && abiertas.length > 0) {
                const formCalif = crearElemento("form", "form-calificar");
                formCalif.noValidate = true;

                const inputsAbiertas = [];

                abiertas.forEach(({ item, numeroReactivo }) => {
                    const maxPts = Number(item.valorMaximo) > 0 ? Number(item.valorMaximo) : null;
                    const valorPrevia = califGuardada?.notasAbiertas?.[item.idReactivo] ?? "";

                    const labelAbierta = crearElemento("label", "campo-form");
                    const textoLabel = maxPts != null
                        ? `Calificación Reactivo #${numeroReactivo} (Abierta - máx. ${maxPts} pts):`
                        : `Calificación Reactivo #${numeroReactivo} (Abierta):`;

                    const inpNota = document.createElement("input");
                    inpNota.type = "number";
                    inpNota.min = "0";
                    if (maxPts != null) inpNota.max = String(maxPts);
                    inpNota.step = "0.5";
                    inpNota.className = "input-calificacion";
                    inpNota.placeholder = maxPts != null ? `0 - ${maxPts}` : "Puntos";
                    inpNota.value = valorPrevia !== "" ? String(valorPrevia) : "";

                    labelAbierta.append(crearElemento("span", "etiqueta-detalle", textoLabel), inpNota);
                    formCalif.append(labelAbierta);

                    inputsAbiertas.push({ idReactivo: item.idReactivo, maxPts, inpNota });
                });

                const inputRetro = document.createElement("textarea");
                inputRetro.className = "input-retro";
                inputRetro.rows = 2;
                inputRetro.placeholder = "Retroalimentación general (opcional)...";
                inputRetro.value = califGuardada?.retroalimentacion ?? "";

                const totalActualTxt = califGuardada?.calificacion != null
                    ? `Calificación total actual: ${califGuardada.calificacion}`
                    : `Puntos automáticos (cerradas): ${puntosCerradas}`;

                const estadoGuardado = crearElemento("p", "estado-guardado", totalActualTxt);

                const btnGuardar = crearElemento("button", "btn-guardar-calificacion", "Guardar calificación");
                btnGuardar.type = "submit";

                formCalif.append(inputRetro, estadoGuardado, btnGuardar);

                formCalif.addEventListener("submit", (e) => {
                    e.preventDefault();

                    let sumaAbiertas = 0;
                    const notasAbiertas = {};

                    for (const { idReactivo, maxPts, inpNota } of inputsAbiertas) {
                        const raw = inpNota.value.trim();
                        const nota = Number(raw);

                        if (raw === "" || Number.isNaN(nota) || nota < 0) {
                            estadoGuardado.textContent = "Ingresa una calificación válida mayor o igual a 0 en cada pregunta abierta.";
                            estadoGuardado.classList.add("error");
                            return;
                        }
                        if (maxPts != null && nota > maxPts) {
                            estadoGuardado.textContent = `La calificación de la pregunta abierta no puede superar ${maxPts} pts.`;
                            estadoGuardado.classList.add("error");
                            return;
                        }

                        notasAbiertas[idReactivo] = nota;
                        sumaAbiertas += nota;
                    }

                    const totalFinal = puntosCerradas + sumaAbiertas;

                    const actualizado = {
                        ...(califGuardada || {}),
                        calificacion: totalFinal,
                        puntosAutomaticos: puntosCerradas,
                        puntosAbiertas: sumaAbiertas,
                        notasAbiertas,
                        calificacionManual: totalFinal,
                        preguntasAbiertasPendientes: 0,
                        retroalimentacion: inputRetro.value.trim()
                    };

                    guardarCalificacionExamenProf(matricula, idExamen, actualizado);
                    estadoGuardado.classList.remove("error");
                    estadoGuardado.textContent =
                        `Total guardado: ${totalFinal} (${puntosCerradas} cerradas + ${sumaAbiertas} abiertas)`;
                });

                card.append(formCalif);
            } else if (respuestasLista.length > 0 && califGuardada?.calificacion != null) {
                card.append(
                    crearElemento(
                        "p",
                        "estado-guardado",
                        `Calificación automática total: ${califGuardada.calificacion}`
                    )
                );
            }

            filas.push(card);
        });
    }

    if (filas.length === 0) {
        cont.replaceChildren(crearElemento("p", "", "No hay respuestas registradas para este examen."));
        return;
    }

    cont.replaceChildren(...filas);
}

async function abrirDetalleExamenProf(ex) {
    examenSeleccionadoProf = ex;
    const modal = document.getElementById("modal-detalle-examen");
    if (!modal) return;

    const idExamen = obtenerIdExamenProf(ex);
    const puntos = ex.calificacion_asignada ?? ex.calificacionAsignada ?? ex.calificacion ?? 0;
    const intentos = ex.intentos_permitidos ?? ex.intentosPermitidos ?? ex.intentos ?? 1;

    document.getElementById("titulo-detalle-examen").textContent = ex.titulo ?? "Examen";
    document.getElementById("info-detalle-examen").textContent =
        `Puntos: ${puntos} · Intentos: ${intentos}${ex.fecha_limite ? ` · Límite: ${formatearFecha(ex.fecha_limite)}` : ""}`;

    modal.style.display = "flex";
    await cargarRespuestasExamenParaProfesor(idExamen, grupoSeleccionado?.id);
}

document.getElementById("btnEliminarExamen")?.addEventListener("click", async () => {
    if (!examenSeleccionadoProf || !grupoSeleccionado?.id) return;
    const idExamen = obtenerIdExamenProf(examenSeleccionadoProf);
    const titulo = examenSeleccionadoProf.titulo ?? "este examen";

    if (!confirm(`¿Seguro que deseas eliminar "${titulo}"?`)) return;

    const btnDel = document.getElementById("btnEliminarExamen");
    if (btnDel) btnDel.disabled = true;

    try {
        const res = await fetch(`${API}/examenes/${idExamen}`, { method: "DELETE" });
        if (!res.ok) {
            throw new Error(await res.text() || `HTTP ${res.status}`);
        }
        cerrarModalDetalleExamenProf();
        await cargarExamenes(grupoSeleccionado.id);
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el examen: " + err.message);
    } finally {
        if (btnDel) btnDel.disabled = false;
    }
});

function guardarCalificacionExamenProf(matricula, idExamen, data) {
    try {
        sessionStorage.setItem(
            `calificacion_examen_${matricula}_${idExamen}`,
            JSON.stringify(data)
        );
    } catch (err) {
        console.error("No se pudo guardar la calificación:", err);
    }
}

function leerCalificacionExamenProf(matricula, idExamen) {
    try {
        const raw = sessionStorage.getItem(`calificacion_examen_${matricula}_${idExamen}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function renderizarExamenes() {
    if (!contenedorExamenes) return;
    if (!examenesCargados || examenesCargados.length === 0) {
        contenedorExamenes.replaceChildren(crearElemento("p", "", "No hay exámenes registrados en este grupo."));
        return;
    }

    const listaFiltrada = examenesCargados.filter((ex) => {
        const estadoRaw = String(ex.estado ?? "").trim().toLowerCase();
        const esProrroga = estadoRaw.includes("prorroga") || estadoRaw.includes("prórroga");
        const vencido = esExamenVencidoPorDia(ex.fecha_limite ?? ex.fechaLimite);

        if (filtroExamenes === "actuales") return !vencido && !esProrroga;
        if (filtroExamenes === "concluidas") return vencido;
        if (filtroExamenes === "prorroga") return esProrroga && !vencido;
        return true;
    });

    if (listaFiltrada.length === 0) {
        contenedorExamenes.replaceChildren(crearElemento("p", "", `No hay exámenes en «${filtroExamenes}».`));
        return;
    }

    const tarjetas = listaFiltrada.map((ex) => {
        const puntos = ex.calificacion_asignada ?? ex.calificacionAsignada ?? ex.calificacion ?? 0;
        const intentos = ex.intentos_permitidos ?? ex.intentosPermitidos ?? ex.intentos ?? 1;
        const tiempoTexto = ex.tiempo_limite ? ` · Duración: ${ex.tiempo_limite}` : "";
        const fechaRaw = ex.fecha_limite ?? ex.fechaLimite;
        const fechaTexto = fechaRaw
            ? `Límite: ${typeof formatearFecha === "function" ? formatearFecha(fechaRaw) : fechaRaw}`
            : "";

        const card = crearElemento("article", "tarea");
        card.append(
            crearElemento("h3", "tarea-titulo", ex.titulo ?? "Examen sin título"),
            crearElemento("p", "tarea-descripcion", `Puntos: ${puntos} · Intentos: ${intentos}${tiempoTexto}`),
            crearElemento("p", "tarea-fechas", fechaTexto)
        );

        const btnBorrarRapido = crearElemento("button", "btn-quitar-reactivo", "Eliminar");
        btnBorrarRapido.type = "button";
        btnBorrarRapido.addEventListener("click", async (e) => {
            e.stopPropagation();
            examenSeleccionadoProf = ex;
            document.getElementById("btnEliminarExamen")?.click();
        });
        card.append(btnBorrarRapido);

        card.addEventListener("click", () => abrirDetalleExamenProf(ex));
        return card;
    });

    contenedorExamenes.replaceChildren(...tarjetas);
}

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
