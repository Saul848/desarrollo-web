const API_URL = "http://localhost:8080/mensajes";

// Aca se define el usuario para mostrar los correo 
const usuarioActual = JSON.parse(sessionStorage.getItem("usuario"));

if (!usuarioActual) {
    window.location.href = "login.html";
}

// Identificador del usuario que inició sesión
const matriculaUsuario = usuarioActual.matricula;
let correoSeleccionado = null;

function obtenerIdMensaje(msg) {
    return msg.id_mensaje ?? msg.id;
}

async function cargarBandejaEntrada() {
    try {
        console.log("Usuario actual:", usuarioActual);
        const matriculaUsuario = usuarioActual.matricula;

        const url = `${API_URL}/destinatario?idDestinatario=${encodeURIComponent(matriculaUsuario)}`;

        console.log("URL consultada:", url);

        const res = await fetch(url);

        console.log("Estado HTTP:", res.status);

        if (!res.ok) {
            throw new Error("Error HTTP: " + res.status);
        }

        const mensajes = await res.json();

        // prueba en consola del navegador
        console.log("Mensajes recibidos:", mensajes);

        mensajes.forEach(msg => {
            console.log("Remitente recibido:", msg.remitente);
        });
        // aca termina la prueba

        console.log("Mensajes recibidos:", mensajes);

        renderizarTabla(mensajes);

    } catch (error) {
        console.error("Error al cargar bandeja:", error);
    }
}

// Buscar correos del usuario logueado por palabra del asunto
async function buscarCorreos() {

    const asunto = document.getElementById("inputBuscar").value.trim();

    if (!asunto) {
        alert("Escribe una palabra para buscar.");
        return;
    }

    try {

        const url = `${API_URL}/buscar?asunto=${encodeURIComponent(asunto)}&idDestinatario=${encodeURIComponent(matriculaUsuario)}`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Error HTTP: " + res.status);
        }

        const mensajes = await res.json();

        renderizarTabla(mensajes);

    } catch (error) {
        console.error("Error al buscar correos:", error);
        alert("No se pudieron buscar los correos.");
    }
}

// Metodo para darle formato a la tabla

function formatearFecha(fecha) {
    if (!fecha) return "";

    const fechaObjeto = new Date(fecha);

    if (isNaN(fechaObjeto.getTime())) {
        return fecha;
    }

    return fechaObjeto.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}


function renderizarTabla(mensajes) {
    const tbody = document.getElementById("tablaCorreos");
    tbody.innerHTML = "";

    if (!mensajes || mensajes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No hay correos para mostrar.</td></tr>`;
        return;
    }

    mensajes.forEach((msg) => {
        const idMsg = obtenerIdMensaje(msg);
        const tr = document.createElement("tr");
        const asuntoHtml = msg.leido ? msg.asunto : `<strong>${msg.asunto}</strong>`;

        tr.innerHTML = `
            <td><input type="checkbox" data-id="${idMsg}"></td>
            <td>${formatearFecha(msg.fecha)}</td>
            <td>${msg.remitente || ""}</td>
            <td>${asuntoHtml}</td>
        `;

        tr.addEventListener("click", (e) => {
            if (e.target.type === "checkbox") return;
            abrirCorreo(msg);
        });

        tbody.appendChild(tr);
    });
}

async function abrirCorreo(msg) {
    correoSeleccionado = msg;
    const idMsg = obtenerIdMensaje(msg);

    document.getElementById("detalleAsunto").textContent = msg.asunto || "(Sin asunto)";
    document.getElementById("detalleRemitente").textContent = msg.remitente || "";
    document.getElementById("detalleFecha").textContent = formatearFecha(msg.fecha);
    document.getElementById("detalleCuerpo").textContent = msg.cuerpo || "";
    document.getElementById("panelDetalleCorreo").style.display = "block";

    if (!msg.leido && idMsg !== undefined) {
        try {
            const res = await fetch(`${API_URL}/${idMsg}/leido`, { method: "PUT" });
            if (res.ok) {
                msg.leido = true;
                cargarBandejaEntrada();
            }
        } catch (error) {
            console.error("Error al marcar como leído:", error);
        }
    }
}

// cerrar el correo 

function cerrarDetalleCorreo() {
    document.getElementById("panelDetalleCorreo").style.display = "none";

    correoSeleccionado = null;
}



// funcion para abrir un nuevo correo 
function abrirNuevoCorreo() {
    document.getElementById("panelNuevoCorreo").style.display = "block";
}

// funcion para cancelar un envio de correo
function cancelarNuevoCorreo() {
    document.getElementById("formNuevoCorreo").reset();
    document.getElementById("panelNuevoCorreo").style.display = "none";
}

//funcion para enviar el nuevo correo opteniendo los campos
async function enviarNuevoCorreo(e) {
    e.preventDefault();

    // Obtener los datos del formulario -- Falta mejorarlo para no pedir id
    const destinatario = document.getElementById("inputDestinatario").value.trim();
    const asunto = document.getElementById("inputAsunto").value.trim();
    const cuerpo = document.getElementById("inputCuerpo").value.trim();

    // se valida la informacion
    if (!destinatario || !asunto || !cuerpo) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    // Construir el objeto que se manda a sprint creo aca para optener el id del destinatario despues de pedir nombre
    const nuevoMensaje = {
        remitente: usuarioActual.matricula,
        idDestinatario: destinatario,
        asunto: asunto,
        cuerpo: cuerpo,
        leido: false
    };

    try {
      
        const res = await fetch(`${API_URL}/enviarMensaje`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoMensaje)
        });

        if (!res.ok) {
            const error = await res.text();
            alert(error);
            return;
        }

        // Envio exitoso
        alert("¡Correo enviado correctamente!");

        // Limpiar formulario
        document.getElementById("formNuevoCorreo").reset();

        // Cerrar panel
        document.getElementById("panelNuevoCorreo").style.display = "none";

        // Actualizar lista de mensajes
        cargarBandejaEntrada();

    } catch (error) {
        console.error("Error al enviar correo:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// metodo para eliminar un correo 
async function eliminarCorreo() {
    if (!correoSeleccionado) {
        alert("No hay ningún correo seleccionado.");
        return;
    }

    const idMensaje = obtenerIdMensaje(correoSeleccionado);

    if (!confirm("¿Estás seguro de que deseas eliminar este correo?")) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${idMensaje}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const error = await res.text();
            alert("No se pudo eliminar el correo: " + error);
            return;
        }

        alert("Correo eliminado correctamente.");

        correoSeleccionado = null;

        document.getElementById("panelDetalleCorreo").style.display = "none";

        await cargarBandejaEntrada();

    } catch (error) {
        console.error("Error al eliminar correo:", error);
        alert("No se pudo conectar con el servidor.");
    }
}



// listener de los botones
document.addEventListener("DOMContentLoaded", () => {

    // Cargar los correos
    cargarBandejaEntrada();

    // Abrir formulario de nuevo correo
    document.getElementById("btnNuevoCorreo")
        .addEventListener("click", abrirNuevoCorreo);

    // Cancelar envio
    document.getElementById("btnCancelarEnvio")
        .addEventListener("click", cancelarNuevoCorreo);

    // Enviar correo al hacer submit
    document.getElementById("formNuevoCorreo")
        .addEventListener("submit", enviarNuevoCorreo);

    // Eliminar un correo 
    document.getElementById("btnEliminarCorreo")
        .addEventListener("click", eliminarCorreo);

    // Cerrar el correo 
    document.getElementById("btnCerrarDetalle")
        .addEventListener("click", cerrarDetalleCorreo);

    // Buscar correos
    document.getElementById("btnBuscar")
        .addEventListener("click", buscarCorreos);

    // Regresar a la bandeja de entrada
    document.getElementById("btnBandeja")
        .addEventListener("click", () => {
            document.getElementById("inputBuscar").value = "";
            cargarBandejaEntrada();
        });
});

