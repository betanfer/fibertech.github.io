document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const obraForm = document.getElementById('obraForm');
    const obrasTableBody = document.getElementById('obrasTableBody');
    const currentUserRoleElement = document.getElementById('currentUserRole');

    // Inputs del formulario
    const obraIdInput = document.getElementById('obraId');
    const nodoInput = document.getElementById('nodo');
    const estadoInput = document.getElementById('estado');
    const ocNumeroInput = document.getElementById('oc_numero');
    const ocValorInput = document.getElementById('oc_valor');
    const importe70Input = document.getElementById('importe_70');
    const importe30Input = document.getElementById('importe_30');
    const cuadrillaInput = document.getElementById('cuadrilla');

    // Botones de Acción
    const btnAlta = document.getElementById('btnAlta');
    const btnModificacion = document.getElementById('btnModificacion');
    const btnBaja = document.getElementById('btnBaja');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnExportar = document.getElementById('btnExportar');

    // Variables de Estado
    const userRole = localStorage.getItem('userRole');
    let obras = JSON.parse(localStorage.getItem('obrasData')) || [];
    obras = obras.map(obra => ({...obra, id: parseInt(obra.id) }));
    let nextObraId = obras.length > 0 ? Math.max(...obras.map(o => o.id)) + 1 : 1;

    console.log('✅ Sistema iniciado');
    console.log('📊 Obras cargadas:', obras.length);
    console.log('👤 Rol del usuario:', userRole);

    // --- FUNCIONES DE PERSISTENCIA Y CÁLCULO ---

    function saveObras() {
        localStorage.setItem('obrasData', JSON.stringify(obras));
        console.log('💾 Obras guardadas en localStorage');
    }

    function calcularImportes() {
        const valorOC = parseFloat(ocValorInput.value) || 0;
        const importe70 = valorOC * 0.70;
        const importe30 = valorOC * 0.30;
        importe70Input.value = importe70.toFixed(2);
        importe30Input.value = importe30.toFixed(2);
    }
    
    ocValorInput.addEventListener('input', calcularImportes);

    // --- LÓGICA DE PERMISOS ---

    function setupPermissions() {
        if (!userRole) {
            console.error('❌ Acceso no autorizado');
            alert('Debes iniciar sesión primero.');
            window.location.href = 'login.html';
            return;
        }

        currentUserRoleElement.textContent = `Perfil: ${userRole}`;

        // Deshabilitar todos los botones por defecto
        btnAlta.disabled = true;
        btnModificacion.disabled = true;
        btnBaja.disabled = true;

        // Aplicar permisos según rol
        switch (userRole) {
            case 'Administrador':
                btnAlta.disabled = false;
                btnModificacion.disabled = false;
                btnBaja.disabled = false;
                console.log('🔑 Permisos: Administrador (completo)');
                break;

            case 'Gestor':
                btnAlta.disabled = false;
                btnModificacion.disabled = false;
                console.log('🔑 Permisos: Gestor (alta y modificación)');
                break;

            case 'Supervisor':
                btnAlta.disabled = false;
                btnModificacion.disabled = false;
                btnBaja.disabled = false;
                console.log('🔑 Permisos: Supervisor (completo)');
                break;
                
            default:
                currentUserRoleElement.textContent = `Perfil: ${userRole} (Sin permisos)`;
                console.warn('⚠️ Rol sin permisos definidos');
                break;
        }
        
        resetForm();
    }

    // --- FUNCIONES CRUD ---

    function renderObras() {
        obrasTableBody.innerHTML = '';
        
        console.log('🔄 Renderizando obras. Total:', obras.length);
        
        if (obras.length === 0) {
            obrasTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay obras registradas.</td></tr>';
            return;
        }

        obras.forEach(obra => {
            const row = obrasTableBody.insertRow();
            
            row.insertCell(0).textContent = obra.nodo;
            
            const estadoCell = row.insertCell(1);
            estadoCell.textContent = obra.estado;
            estadoCell.className = `estado-${obra.estado.toLowerCase().replace(/\s/g, '')}`;
            
            row.insertCell(2).textContent = `$${parseFloat(obra.ocValor).toFixed(2)}`;
            row.insertCell(3).textContent = `$${parseFloat(obra.importe70).toFixed(2)}`;
            row.insertCell(4).textContent = `$${parseFloat(obra.importe30).toFixed(2)}`;
            row.insertCell(5).textContent = obra.cuadrilla;
            
            const actionsCell = row.insertCell(6);
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.className = 'btn-detalle';
            editButton.addEventListener('click', () => loadObraForEdit(obra.id));
            actionsCell.appendChild(editButton);
        });
    }

    // ⚠️ FUNCIÓN SUBMIT DEL FORMULARIO - CORREGIDA
    obraForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = obraIdInput.value ? parseInt(obraIdInput.value) : null;
        const isModifying = id !== null;

        console.log('📝 Submit - ID:', id, 'Es modificación:', isModifying);

        // Validar permisos
        if (isModifying && btnModificacion.disabled) {
            alert('Tu perfil no tiene permisos para Modificar obras.');
            console.warn('⛔ Intento de modificación sin permisos');
            return;
        }
        
        if (!isModifying && btnAlta.disabled) {
            alert('Tu perfil no tiene permisos para Dar de Alta obras.');
            console.warn('⛔ Intento de alta sin permisos');
            return;
        }

        // Crear objeto de la obra
        const newObra = {
            id: isModifying ? id : nextObraId,
            nodo: nodoInput.value.trim(),
            estado: estadoInput.value,
            ocNumero: ocNumeroInput.value.trim(),
            ocValor: parseFloat(ocValorInput.value).toFixed(2), 
            importe70: parseFloat(importe70Input.value).toFixed(2),
            importe30: parseFloat(importe30Input.value).toFixed(2),
            cuadrilla: cuadrillaInput.value.trim()
        };

        console.log('📦 Datos de la obra:', newObra);

        if (isModifying) {
            // MODIFICACIÓN
            const index = obras.findIndex(o => o.id === id); 
            console.log('🔍 Buscando obra con ID:', id, 'Índice encontrado:', index);
            
            if (index !== -1) {
                console.log('📝 Obra antes de modificar:', obras[index]);
                obras[index] = newObra;
                console.log('✅ Obra después de modificar:', obras[index]);
                alert('Obra modificada con éxito.');
            } else {
                alert('Error: Obra no encontrada para modificar.');
                console.error('❌ No se encontró la obra con ID:', id);
                console.log('📋 Obras disponibles:', obras.map(o => o.id));
                return;
            }
        } else {
            // ALTA
            obras.push(newObra);
            nextObraId++;
            alert('Obra dada de alta con éxito.');
            console.log('✅ Nueva obra agregada. Próximo ID:', nextObraId);
        }

        saveObras();
        renderObras();
        resetForm();
    });

    // ⚠️ BOTÓN MODIFICACIÓN - NUEVO EVENT LISTENER
    btnModificacion.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('🔄 Botón Modificación clickeado');
        
        const id = obraIdInput.value ? parseInt(obraIdInput.value) : null;
        
        if (!id) {
            alert('Error: No hay obra cargada para modificar.');
            console.error('❌ No hay ID en el formulario');
            return;
        }

        if (btnModificacion.disabled) {
            alert('Tu perfil no tiene permisos para Modificar obras.');
            console.warn('⛔ Sin permisos de modificación');
            return;
        }

        console.log('🔍 Modificando obra con ID:', id);

        // Crear objeto de la obra
        const obraModificada = {
            id: id,
            nodo: nodoInput.value.trim(),
            estado: estadoInput.value,
            ocNumero: ocNumeroInput.value.trim(),
            ocValor: parseFloat(ocValorInput.value).toFixed(2), 
            importe70: parseFloat(importe70Input.value).toFixed(2),
            importe30: parseFloat(importe30Input.value).toFixed(2),
            cuadrilla: cuadrillaInput.value.trim()
        };

        const index = obras.findIndex(o => o.id === id);
        console.log('📍 Índice encontrado:', index);
        
        if (index !== -1) {
            console.log('📝 Antes:', obras[index]);
            obras[index] = obraModificada;
            console.log('✅ Después:', obras[index]);
            
            saveObras();
            renderObras();
            resetForm();
            alert('Obra modificada con éxito.');
        } else {
            alert('Error: No se encontró la obra.');
            console.error('❌ Obra no encontrada. IDs disponibles:', obras.map(o => o.id));
        }
    });

    // Cargar datos en el formulario para editar
    function loadObraForEdit(id) {
        console.log('📂 Cargando obra para editar. ID:', id);
        
        const numericId = typeof id === 'number' ? id : parseInt(id);
        const obra = obras.find(o => o.id === numericId); 
        
        console.log('🔍 Obra encontrada:', obra);
        
        if (obra) {
            // Cargar datos
            obraIdInput.value = obra.id.toString();
            nodoInput.value = obra.nodo;
            estadoInput.value = obra.estado;
            ocNumeroInput.value = obra.ocNumero;
            ocValorInput.value = parseFloat(obra.ocValor).toFixed(2);
            importe70Input.value = parseFloat(obra.importe70).toFixed(2);
            importe30Input.value = parseFloat(obra.importe30).toFixed(2);
            cuadrillaInput.value = obra.cuadrilla;
            
            console.log('✅ Formulario cargado. ID:', obraIdInput.value);
            
            // Mostrar botones según permisos
            btnAlta.style.display = 'none';
            
            if (!btnModificacion.disabled) {
                btnModificacion.style.display = 'block';
                console.log('✅ Botón Modificación visible');
            } else {
                btnModificacion.style.display = 'none';
                console.log('⛔ Botón Modificación oculto (sin permisos)');
            }
            
            if (!btnBaja.disabled) {
                btnBaja.style.display = 'block';
                console.log('✅ Botón Baja visible');
            } else {
                btnBaja.style.display = 'none';
                console.log('⛔ Botón Baja oculto (sin permisos)');
            }
            
            btnCancelar.style.display = 'block';
            calcularImportes();
        } else {
            alert('Error: No se encontró la obra.');
            console.error('❌ Obra no encontrada con ID:', numericId);
        }
    }

    // Función de Baja/Eliminar
    btnBaja.addEventListener('click', function() {
        const id = obraIdInput.value ? parseInt(obraIdInput.value) : null;
        
        console.log('🗑️ Intentando eliminar ID:', id);
        
        if (!id) {
            alert('Primero selecciona una obra para eliminar.');
            return;
        }

        if (btnBaja.disabled) {
            alert('Tu perfil no tiene permisos para Eliminar obras.');
            return;
        }

        const obraAEliminar = obras.find(o => o.id === id);
        console.log('🔍 Obra a eliminar:', obraAEliminar);
        
        if (!obraAEliminar) {
            alert('Error: No se encontró la obra a eliminar.');
            return;
        }

        if (confirm(`¿Estás seguro de que quieres eliminar la obra del Nodo ${obraAEliminar.nodo}?`)) {
            const cantidadAntes = obras.length;
            obras = obras.filter(o => o.id !== id);
            const cantidadDespues = obras.length;
            
            console.log('📊 Antes:', cantidadAntes, 'Después:', cantidadDespues);
            
            if (cantidadDespues < cantidadAntes) {
                saveObras();
                renderObras();
                resetForm();
                alert('Obra eliminada con éxito.');
                console.log('✅ Eliminación exitosa');
            } else {
                alert('Error: No se pudo eliminar la obra.');
                console.error('❌ Error al eliminar');
            }
        }
    });

    // Resetear formulario
    function resetForm() {
        obraForm.reset();
        obraIdInput.value = '';
        calcularImportes();

        console.log('🔄 Formulario reseteado');

        btnAlta.style.display = btnAlta.disabled ? 'none' : 'block';
        btnModificacion.style.display = 'none';
        btnBaja.style.display = 'none';
        btnCancelar.style.display = 'none';
    }
    
    btnCancelar.addEventListener('click', resetForm);

    // Exportar a CSV
    btnExportar.addEventListener('click', function() {
        if (obras.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        
        console.log('📤 Exportando obras...');
        
        const header = ['Nodo', 'Estado', 'Numero de Orden de Compra', 'Valor de la OC', 'Importe al 70%', 'Importe al 30%', 'Cuadrilla'];
        
        const csvData = obras.map(o => [
            o.nodo,
            o.estado,
            o.ocNumero,
            parseFloat(o.ocValor).toFixed(2),
            parseFloat(o.importe70).toFixed(2),
            parseFloat(o.importe30).toFixed(2),
            o.cuadrilla
        ]);

        const allRows = [header, ...csvData];
        const csvString = allRows.map(row => row.join(';')).join('\n');
        
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'listado_obras.csv');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Exportación completada');
        alert('Archivo exportado exitosamente como listado_obras.csv');
    });

    // INICIALIZACIÓN
    setupPermissions();
    renderObras();
    calcularImportes();
    
    console.log('🚀 Sistema completamente inicializado');
});