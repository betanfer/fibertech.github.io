document.addEventListener('DOMContentLoaded', function() {
    const userManagementForm = document.getElementById('userManagementForm');
    const userIdInput = document.getElementById('userId');
    const newUsernameInput = document.getElementById('newUsername');
    const newPasswordInput = document.getElementById('newPassword');
    const newRoleSelect = document.getElementById('newRole');
    const saveUserButton = document.getElementById('saveUserButton');
    const cancelEditButton = document.getElementById('cancelEditButton');
    const formMessage = document.getElementById('formMessage');
    const usersTableBody = document.getElementById('usersTableBody');

 // Cargar usuarios desde localStorage o inicializar con valores por defecto
    let users = JSON.parse(localStorage.getItem('adminUsers')) || [
        { usuario: 'admin', password: 'root', rol: 'Administrador' },
        { usuario: 'gestor_proyectos', password: 'claveGestor2', rol: 'Gestor' },
        { usuario: 'fer', password: 'fer', rol: 'Gestor' },
        { usuario: 'javier', password: 'root', rol: 'Supervisor' },
        { usuario: 'supervisor_obra', password: 'claveSuper3', rol: 'Supervisor' }
    ];
    let nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    // Función para guardar usuarios en localStorage
    function saveUsers() {
        localStorage.setItem('adminUsers', JSON.stringify(users));
    }

    // Función para renderizar la tabla de usuarios
    function renderUsers() {
        usersTableBody.innerHTML = ''; // Limpiar tabla
        users.forEach(user => {
            const row = usersTableBody.insertRow();
            row.insertCell(0).textContent = user.usuario;
            row.insertCell(1).textContent = user.rol;
            const actionsCell = row.insertCell(2);
            
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'edit';
            editButton.addEventListener('click', () => editUser(user.id));
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'delete';
            deleteButton.addEventListener('click', () => deleteUser(user.id));
            actionsCell.appendChild(deleteButton);
        });
    }

    // Dar de Alta / Modificar Usuario
    userManagementForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = userIdInput.value;
        const newUsername = newUsernameInput.value.trim();
        const newPassword = newPasswordInput.value.trim(); // Solo se actualiza si no está vacío
        const newRole = newRoleSelect.value;

        if (!newUsername) {
            formMessage.textContent = 'El nombre de usuario no puede estar vacío.';
            formMessage.style.color = 'red';
            return;
        }

        // Si estamos editando un usuario existente
        if (id) {
            const userIndex = users.findIndex(u => u.id == id);
            if (userIndex !== -1) {
                // Validación para no permitir cambiar el usuario 'admin_obras' a no-admin
                if (users[userIndex].usuario === 'admin_obras' && newRole !== 'Administrador') {
                    formMessage.textContent = 'El usuario "admin_obras" debe permanecer como Administrador.';
                    formMessage.style.color = 'red';
                    return;
                }

                users[userIndex].usuario = newUsername;
                if (newPassword) { // Solo actualiza la contraseña si se ha ingresado una nueva
                    users[userIndex].password = newPassword;
                }
                users[userIndex].rol = newRole;
                formMessage.textContent = 'Usuario modificado correctamente.';
                formMessage.style.color = 'green';
            }
        } else { // Si estamos dando de alta un nuevo usuario
            if (!newPassword) {
                formMessage.textContent = 'La contraseña es obligatoria para un nuevo usuario.';
                formMessage.style.color = 'red';
                return;
            }
            // Comprobar si el nombre de usuario ya existe
            if (users.some(u => u.usuario === newUsername)) {
                formMessage.textContent = 'Ya existe un usuario con este nombre.';
                formMessage.style.color = 'red';
                return;
            }
            users.push({ id: nextUserId++, usuario: newUsername, password: newPassword, rol: newRole });
            formMessage.textContent = 'Usuario dado de alta correctamente.';
            formMessage.style.color = 'green';
        }

        saveUsers();
        renderUsers();
        resetForm();
    });

    // Función para cargar datos de usuario en el formulario para edición
    function editUser(id) {
        const user = users.find(u => u.id === id);
        if (user) {
            userIdInput.value = user.id;
            newUsernameInput.value = user.usuario;
            newRoleSelect.value = user.rol;
            newPasswordInput.value = ''; // Limpiar la contraseña para no mostrarla

            saveUserButton.textContent = 'Guardar Cambios';
            cancelEditButton.style.display = 'inline-block';
            formMessage.textContent = ''; // Limpiar mensajes
            // Deshabilitar el cambio de rol si es el admin_obras para esta demo simple
            newRoleSelect.disabled = (user.usuario === 'admin_obras');
            newUsernameInput.disabled = (user.usuario === 'admin_obras'); // No permitir cambiar el usuario admin_obras
        }
    }

    // Función para eliminar usuario
    function deleteUser(id) {
        // Validación para no permitir eliminar al usuario 'admin_obras'
        const userToDelete = users.find(u => u.id === id);
        if (userToDelete && userToDelete.usuario === 'admin_obras') {
            formMessage.textContent = 'No se puede eliminar al usuario administrador principal.';
            formMessage.style.color = 'red';
            return;
        }

        if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            users = users.filter(user => user.id !== id);
            saveUsers();
            renderUsers();
            formMessage.textContent = 'Usuario eliminado correctamente.';
            formMessage.style.color = 'green';
            resetForm(); // Por si se estaba editando el usuario eliminado
        }
    }

    // Función para resetear el formulario
    function resetForm() {
        userManagementForm.reset();
        userIdInput.value = '';
        saveUserButton.textContent = 'Dar de Alta Usuario';
        cancelEditButton.style.display = 'none';
        newPasswordInput.placeholder = 'Solo si quieres cambiarla';
        newRoleSelect.disabled = false; // Habilitar el select de rol
        newUsernameInput.disabled = false; // Habilitar el input de usuario
    }

    cancelEditButton.addEventListener('click', resetForm);

    renderUsers(); // Renderizar la tabla al cargar la página

    // Seguridad: Solo permitir acceso si el rol en localStorage es 'Administrador'
    // IMPORTANTE: Esto es una simulación. En un entorno real, esto lo verificaría el servidor.
    const currentUserRole = localStorage.getItem('userRole');
    if (currentUserRole !== 'Administrador') {
        alert('Acceso denegado. Solo los administradores pueden ver esta página.');
        window.location.href = 'login.html'; // Redirigir si no es admin
    }
});