document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // 1. Definir una lista de usuarios vÃ¡lidos (simulacion de la Base de Datos)
    const USUARIOS_VALIDOS = [
        { usuario: 'admin', password: 'root', rol: 'Administrador' },
        { usuario: 'gestor_proyectos', password: 'claveGestor2', rol: 'Gestor' },
        { usuario: 'fer', password: 'fer', rol: 'Gestor' },
        { usuario: 'javier', password: 'javier', rol: 'Supervisor' },
        { usuario: 'supervisor_obra', password: 'claveSuper3', rol: 'Supervisor' }
    ];
    
    // 2. Definir URLs de destino
    const URL_PAGINA_ADMIN = 'admin.html';
    const URL_PAGINA_OBRAS = 'gestion_obras04.html';

    // 3. Obtener los valores ingresados
    const usuarioInput = document.getElementById('usuario').value;
    const passwordInput = document.getElementById('password').value;
    const mensajeError = document.getElementById('mensajeError');

    // 4. Buscar si el usuario y la contraseÃ±a coinciden
    const usuarioEncontrado = USUARIOS_VALIDOS.find(user => 
        user.usuario === usuarioInput && user.password === passwordInput
    );

    // 5. Simular la validaciÃ³n y redireccionar
    if (usuarioEncontrado) {
        // Credenciales correctas
        mensajeError.textContent = `¡BIENVENIDO, ${usuarioEncontrado.rol}! ACCEDIENDO A SU SESION ...`;
        mensajeError.style.color = 'green';
        
        // Guardar el rol en el navegador para la pÃ¡gina de destino
        localStorage.setItem('userRole', usuarioEncontrado.rol);
        
        // Redirigir segÃºn el rol
        let redirectionURL;
        if (usuarioEncontrado.rol === 'Administrador') {
            redirectionURL = URL_PAGINA_ADMIN; // Administrador va a gestion de usuarios
        } else {
            redirectionURL = URL_PAGINA_OBRAS; // Gestor y Supervisor van a gestion de obras
        }

        setTimeout(function() {
            // Se usa window.location.href = URL, no la variable del user
            window.location.href = redirectionURL; 
        }, 1500);
        
    } else {
        // Credenciales incorrectas
        mensajeError.textContent = 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.';
        mensajeError.style.color = 'red';
    }
});