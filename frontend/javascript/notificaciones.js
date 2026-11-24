
(() => {

    const API_NOTIF_URL = "http://localhost:9999/mensajes";

    document.addEventListener("DOMContentLoaded", () => {

        const btnNotif = document.getElementById("btnNotificaciones");

        if (btnNotif) {
            btnNotif.addEventListener("click", toggleNotificaciones);
        }

    });

    async function toggleNotificaciones() {

        let modal = document.getElementById("modalNotificaciones");

        // Si ya está abierto, lo cerramos
        if (modal) {
            modal.remove();
            return;
        }

        // Crear ventana emergente
        modal = document.createElement("div");
        modal.id = "modalNotificaciones";

        modal.style.cssText = `
            position: fixed;
            top: 75px;
            right: 20px;
            width: 340px;
            max-height: 420px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            padding: 15px;
            z-index: 2000;
        `;

        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>Notificaciones</strong>
                <button type="button" id="btnCerrarNotif">X</button>
            </div>
            <div id="listaNotificaciones">
                Cargando notificaciones...
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("btnCerrarNotif")
            .addEventListener("click", () => modal.remove());

        await cargarNotificaciones();

    }

    async function cargarNotificaciones() {

        const contenedor = document.getElementById("listaNotificaciones");

        const usuario = JSON.parse(sessionStorage.getItem("usuario"));

        if (!usuario || !usuario.matricula) {
            contenedor.textContent = "No se encontró el usuario.";
            return;
        }

        try {

            const url = `${API_NOTIF_URL}/notificaciones?idDestinatario=${encodeURIComponent(usuario.matricula)}`;

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error("Error HTTP: " + res.status);
            }

            const notificaciones = await res.json();

            contenedor.innerHTML = "";

            if (notificaciones.length === 0) {
                contenedor.textContent = "No tienes mensajes sin leer.";
                return;
            }

            notificaciones.forEach(msg => {

                const item = document.createElement("div");

                item.style.cssText = `
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                `;

                const asunto = document.createElement("strong");
                asunto.textContent = msg.asunto || "(Sin asunto)";

                const remitente = document.createElement("p");
                remitente.textContent = "De: " + (msg.remitente || "Desconocido");

                const fecha = document.createElement("small");
                fecha.textContent = msg.fecha || "";

                item.appendChild(asunto);
                item.appendChild(remitente);
                item.appendChild(fecha);

                contenedor.appendChild(item);

            });

        } catch (error) {

            console.error("Error al cargar notificaciones:", error);

            contenedor.textContent =
                "No se pudieron cargar las notificaciones.";
        }
    }

})();
