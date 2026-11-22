document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const correoInput = document.getElementById('correo');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const btnAcceder = document.getElementById('btnAcceder');

    // Definidas arriba para que estén disponibles en todo el archivo
    const BASE_URL = 'http://localhost:8080'; // Cambia el puerto si tu Spring Boot usa otro
    const API_LOGIN_URL = `${BASE_URL}/usuarios/login`;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.textContent = '';

        const correo = correoInput.value.trim();
        const password = passwordInput.value;

        if (!correo || !password) {
            errorMessage.textContent = 'Por favor, completa todos los campos.';
            return;
        }

        if (!correo.includes('@')) {
            errorMessage.textContent = 'Ingresa un correo institucional válido.';
            return;
        }

        try {
            btnAcceder.disabled = true;
            btnAcceder.textContent = 'Verificando...';

            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo: correo,
                    password: password
                })
            });

            if (response.ok) {
                const usuario = await response.json();

                // Guardamos los datos básicos del usuario para usarlos en las otras vistas
                sessionStorage.setItem('usuario', JSON.stringify(usuario));

                // Redirección según el enum Rol en Java (profesor / alumno)
                if (usuario.rol === 'profesor') {
                    window.location.href = 'PaginaProfesor.html';
                } else if (usuario.rol === 'alumno') {
                    window.location.href = 'PaginaAlumno.html';
                } else {
                    errorMessage.textContent = 'Rol de usuario no reconocido.';
                }
            } else if (response.status === 401) {
                const msg = await response.text();
                errorMessage.textContent = msg || 'Correo o contraseña incorrectos.';
            } else {
                errorMessage.textContent = `Error del servidor (${response.status}).`;
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            errorMessage.textContent = 'No se pudo conectar con el backend';
        } finally {
            btnAcceder.disabled = false;
            btnAcceder.textContent = 'Acceder';
        }
    });

    
// --- MODAL DE CREACIÓN DE CUENTA ---
    const registerModal = document.getElementById('registerModal');
    const btnAbrirRegistro = document.getElementById('btnAbrirRegistro');
    const btnCerrarRegistro = document.getElementById('btnCerrarRegistro');
    const registerForm = document.getElementById('registerForm');
    const registerFeedback = document.getElementById('registerFeedback');
    const btnRegistrar = document.getElementById('btnRegistrar');

    const API_USERS_URL = `${BASE_URL}/usuarios`;
    
    const abrirModal = () => {
        registerFeedback.textContent = '';
        registerFeedback.classList.remove('success');
        registerForm.reset();
        registerModal.classList.add('active');
        registerModal.setAttribute('aria-hidden', 'false');
    };

    const cerrarModal = () => {
        registerModal.classList.remove('active');
        registerModal.setAttribute('aria-hidden', 'true');
    };

    btnAbrirRegistro.addEventListener('click', abrirModal);
    btnCerrarRegistro.addEventListener('click', cerrarModal);

    // Cerrar al dar clic fuera de la tarjeta
    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            cerrarModal();
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && registerModal.classList.contains('active')) {
            cerrarModal();
        }
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        registerFeedback.textContent = '';
        registerFeedback.classList.remove('success');

        const nombre = document.getElementById('regNombre').value.trim();
        const correo = document.getElementById('regCorreo').value.trim();
        const password = document.getElementById('regPassword').value;
        const rol = document.getElementById('regRol').value;

        if (!nombre || !correo || !password || !rol) {
            registerFeedback.textContent = 'Completa todos los campos.';
            return;
        }

        if (!correo.includes('@')) {
            registerFeedback.textContent = 'Ingresa un correo institucional válido.';
            return;
        }

        try {
            btnRegistrar.disabled = true;
            btnRegistrar.textContent = 'Creando cuenta...';

            const response = await fetch(API_USERS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre,
                    correo,
                    password,
                    rol
                })
            });

            if (response.status === 201 || response.ok) {
                const creado = await response.json();
                registerFeedback.textContent = `¡Cuenta creada con éxito!\nTu matrícula es ${creado.matricula}.\nYa puedes iniciar sesión.`;
                registerFeedback.classList.add('success');

                // Autocompleta el correo en el login y cierra el modal tras un breve momento
                correoInput.value = correo;
                passwordInput.value = '';
                setTimeout(() => {
                    cerrarModal();
                }, 1800);
            } else if (response.status === 409) {
                const msg = await response.text();
                registerFeedback.textContent = msg || 'El correo ya está registrado.';
            } else {
                const msg = await response.text();
                registerFeedback.textContent = msg || `No se pudo crear la cuenta (${response.status}).`;
            }
        } catch (error) {
            console.error('Error al registrar:', error);
            registerFeedback.textContent = 'No se pudo conectar con el servidor.';
        } finally {
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = 'Registrarse';
        }
    });
});
