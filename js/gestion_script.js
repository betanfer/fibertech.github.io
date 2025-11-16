document.addEventListener('DOMContentLoaded', function() {
    // 1. OBTENER EL ROL DEL USUARIO
    const userRole = localStorage.getItem('userRole'); // Obtenido del script.js del login
    const currentUserRoleElement = document.getElementById('currentUserRole');

    // Referencias a los botones de acción
    const btnAlta = document.getElementById('btnAlta');
    const btnModificacion = document.getElementById('btnModificacion');
    const btnBaja = document.getElementById('btnBaja');

    // Referencias a los campos de cálculo
    const ocValorInput = document.getElementById('oc_valor');
    const importe70Input = document.getElementById('importe_70');
    const importe30Input = document.getElementById('importe_30');

    // Verificar si el usuario está logueado
    if (!userRole) {
        alert('Acceso no autorizado. Inicia sesión primero.');
        window.location.href = 'login.html';
        return;
    }

    currentUserRoleElement.textContent = `Perfil: ${userRole}`;

    // 2. LÓGICA DE PERMISOS (MOSTRAR/HABILITAR BOTONES)
    // Reiniciar todos a deshabilitados por defecto
    btnAlta.disabled = true;
    btnModificacion.disabled = true;
    btnBaja.disabled = true;

    // Aplicar permisos según el rol
    switch (userRole) {
        case 'ADMINISTRADOR':
            // ADMINISTADOR Obra: alta, baja, modificacion
            btnAlta.disabled = false;
            btnModificacion.disabled = false;
            btnBaja.disabled = false;
            break;

        case 'GESTOR':
            // GESTOR Obra: alta, modificacion
            btnAlta.disabled = false;
            btnModificacion.disabled = false;
            // La baja permanece deshabilitada
            break;

        case 'SUPERVISOR':
            // SUPERVISOR Obra: alta, baja, modificacion (igual que Admin en este modelo)
            btnAlta.disabled = false;
            btnModificacion.disabled = false;
            btnBaja.disabled = false;
            break;
            
        default:
            // Cualquier otro rol o un error de rol
            currentUserRoleElement.textContent = `Perfil: ${userRole} (Sin permisos)`;
            break;
    }
    
    // 3. CÁLCULO AUTOMÁTICO DE IMPORTES
    function calcularImportes() {
        const valorOC = parseFloat(ocValorInput.value) || 0;
        
        // Calcular 70% y 30%
        const importe70 = valorOC * 0.70;
        const importe30 = valorOC * 0.30;

        // Mostrar resultados (fijar a 2 decimales para dinero)
        importe70Input.value = importe70.toFixed(2);
        importe30Input.value = importe30.toFixed(2);
    }
    
    // Asignar el evento de cálculo cada vez que cambia el valor de la OC
    ocValorInput.addEventListener('input', calcularImportes);
    
    // Llamar una vez al cargar por si el campo tiene un valor inicial
    calcularImportes();

    // 4. Lógica de demostración para los botones
    document.getElementById('obraForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert(`Simulación de Alta de Obra. Rol: ${userRole}. (En un sistema real, esto iría al servidor)`);
    });
    document.getElementById('btnModificacion').addEventListener('click', function() {
        alert(`Simulación de Modificación de Obra. Rol: ${userRole}.`);
    });
    document.getElementById('btnBaja').addEventListener('click', function() {
        alert(`Simulación de Baja de Obra. Rol: ${userRole}.`);
    });
});