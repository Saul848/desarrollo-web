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


//Cuando se carga la página se muestra el listado de los cursos
document.addEventListener('DOMContentLoaded', ()=>{
    mostrarModal('areaCursos')
})

document.getElementById("tituloPagina").addEventListener("click", () => {
    mostrarModal("areaCursos")
});