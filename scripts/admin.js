// Variables globales
let docenteEnEdicion = null;
let cursoEnEdicion = null;

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarDocentes();
    cargarCursos();
    cargarReportes();
    cargarCursosEnSelect();
});

function cerrarSesion() {
    localStorage.removeItem('adminToken');
    window.location.href = 'index.html';
}

// ==================== FUNCIONES DE PESTAÑAS ====================

function cambiarTab(tab) {
    // Ocultar todos los tabs
    document.querySelectorAll('.admin-tab-content').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(el => {
        el.classList.remove('active');
    });

    // Mostrar tab seleccionado
    document.getElementById(tab + '-tab').classList.add('active');
    // Si el evento fue click, activamos el botón
    if (event && event.target) {
        // Buscar el botón si el click fue en el icono
        const btn = event.target.closest('.admin-tab-btn');
        if(btn) btn.classList.add('active');
    }
}

// ==================== FUNCIONES DE DOCENTES ====================

async function cargarDocentes() {
    try {
        const response = await fetch(`${API_URL}/docentes`);
        if (!response.ok) throw new Error('Error al cargar docentes');

        const docentes = await response.json();
        const tbody = document.getElementById('listaDocentes');
        tbody.innerHTML = '';

        if (docentes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-inbox"></i><p>No hay docentes registrados</p></td></tr>';
            return;
        }

        docentes.forEach(docente => {
            const tr = document.createElement('tr');
            
            // Crear lista de cursos
            let cursosHTML = '-';
            if (docente.cursos && docente.cursos.length > 0) {
                cursosHTML = docente.cursos
                    .map(c => `${c.nombre} (${c.dia} ${c.hora_inicio}-${c.hora_fin})`)
                    .join('<br>');
            }

            tr.innerHTML = `
                <td>${docente.dni}</td>
                <td>${docente.nombre}</td>
                <td>${cursosHTML}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-edit" onclick="editarDocente(${docente.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-sm btn-delete" onclick="confirmarEliminarDocente(${docente.id}, '${docente.nombre}')">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los docentes',
        });
    }
}

function abrirModalDocente() {
    docenteEnEdicion = null;
    document.getElementById('docenteId').value = '';
    document.getElementById('formDocente').reset();
    document.getElementById('modalDocenteTitle').textContent = 'Agregar Docente';
    document.getElementById('docenteDNI').disabled = false;
    document.getElementById('modalDocente').classList.add('active');
}

function cerrarModalDocente() {
    document.getElementById('modalDocente').classList.remove('active');
    docenteEnEdicion = null;
}

function editarDocente(id) {
    fetch(`${API_URL}/docentes/${id}`)
        .then(res => res.json())
        .then(docente => {
            docenteEnEdicion = docente;
            document.getElementById('docenteId').value = docente.id;
            document.getElementById('docenteDNI').value = docente.dni;
            document.getElementById('docenteDNI').disabled = true;
            document.getElementById('docenteNombre').value = docente.nombre;
            
            // Seleccionar múltiples cursos
            const select = document.getElementById('docenteCursosIds');
            const cursosIds = (docente.cursos || []).map(c => c.id);
            
            Array.from(select.options).forEach(option => {
                option.selected = cursosIds.includes(parseInt(option.value));
            });
            
            document.getElementById('modalDocenteTitle').textContent = 'Editar Docente';
            document.getElementById('modalDocente').classList.add('active');
        })
        .catch(err => {
            console.error('Error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el docente',
            });
        });
}

function guardarDocente(event) {
    event.preventDefault();

    const id = document.getElementById('docenteId').value;
    const dni = document.getElementById('docenteDNI').value;
    const nombre = document.getElementById('docenteNombre').value;
    
    // Obtener múltiples cursos seleccionados
    const select = document.getElementById('docenteCursosIds');
    const curso_ids = Array.from(select.selectedOptions).map(opt => parseInt(opt.value));

    const datos = {
        nombre,
        curso_ids
    };

    if (!id) {
        // Crear nuevo
        datos.dni = dni;
        fetch(`${API_URL}/docentes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al crear docente');
                return res.json();
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Docente creado correctamente',
                    timer: 2000
                });
                cerrarModalDocente();
                cargarDocentes();
                cargarReportes();
            })
            .catch(err => {
                console.error('Error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo crear el docente',
                });
            });
    } else {
        // Editar
        fetch(`${API_URL}/docentes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al actualizar docente');
                return res.json();
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Docente actualizado correctamente',
                    timer: 2000
                });
                cerrarModalDocente();
                cargarDocentes();
                cargarReportes();
            })
            .catch(err => {
                console.error('Error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el docente',
                });
            });
    }
}

function confirmarEliminarDocente(id, nombre) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará al docente ${nombre} y todo su historial`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${API_URL}/docentes/${id}`, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Error al eliminar');
                    Swal.fire(
                        '¡Eliminado!',
                        'El docente ha sido eliminado.',
                        'success'
                    );
                    cargarDocentes();
                    cargarReportes();
                })
                .catch(err => {
                    console.error('Error:', err);
                    Swal.fire(
                        'Error',
                        'No se pudo eliminar el docente',
                        'error'
                    );
                });
        }
    });
}

// ==================== FUNCIONES DE CURSOS ====================

async function cargarCursos() {
    try {
        const response = await fetch(`${API_URL}/cursos`);

        if (!response.ok) throw new Error('Error al cargar cursos');

        const cursos = await response.json();
        console.log("Este es cursos: ", cursos[0]);
        console.log("Este es cursos.nombre: ", cursos[0].nombre);
        const tbody = document.getElementById('listaCursos');
        tbody.innerHTML = '';

        if (cursos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-inbox"></i><p>No hay cursos registrados</p></td></tr>';
            return;
        }
        
        cursos.forEach(curso => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${curso.nombre}</td>
                <td>${curso.dia}</td>
                <td>${curso.hora_inicio}</td>
                <td>${curso.hora_fin}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-edit" onclick="editarCurso(${curso.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-sm btn-delete" onclick="confirmarEliminarCurso(${curso.id}, '${curso.nombre}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarCursosEnSelect() {
    try {
        const response = await fetch(`${API_URL}/cursos`);
        if (!response.ok) throw new Error('Error al cargar cursos');
        const cursos = await response.json();
        const select = document.getElementById('docenteCursosIds');
        select.innerHTML = '';
        
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.nombre} (${curso.dia} ${curso.hora_inicio}-${curso.hora_fin})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando cursos en select:', error);
    }
}

function abrirModalCurso() {
    cursoEnEdicion = null;
    document.getElementById('cursoId').value = '';
    document.getElementById('formCurso').reset();
    document.getElementById('modalCursoTitle').textContent = 'Agregar Curso';
    document.getElementById('modalCurso').classList.add('active');
}

function cerrarModalCurso() {
    document.getElementById('modalCurso').classList.remove('active');
    cursoEnEdicion = null;
}

function editarCurso(id) {
    fetch(`${API_URL}/cursos/${id}`)
        .then(res => res.json())
        .then(curso => {
            cursoEnEdicion = curso;
            document.getElementById('cursoId').value = curso.id;
            document.getElementById('cursoNombre').value = curso.nombre;
            document.getElementById('cursoDia').value = curso.dia;
            document.getElementById('cursoHoraInicio').value = curso.hora_inicio;
            document.getElementById('cursoHoraFin').value = curso.hora_fin;
            document.getElementById('cursoDescripcion').value = curso.descripcion || '';
            
            document.getElementById('modalCursoTitle').textContent = 'Editar Curso';
            document.getElementById('modalCurso').classList.add('active');
        })
        .catch(err => {
            console.error('Error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el curso',
            });
        });
}

function guardarCurso(event) {
    event.preventDefault();

    const id = document.getElementById('cursoId').value;
    const datos = {
        nombre: document.getElementById('cursoNombre').value,
        dia: document.getElementById('cursoDia').value,
        hora_inicio: document.getElementById('cursoHoraInicio').value,
        hora_fin: document.getElementById('cursoHoraFin').value,
        descripcion: document.getElementById('cursoDescripcion').value
    };

    const url = id ? `${API_URL}/cursos/${id}` : `${API_URL}/cursos`;
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar curso');
            return res.json();
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Curso guardado correctamente',
                timer: 1500
            });
            cerrarModalCurso();
            cargarCursos();
            cargarCursosEnSelect(); // Actualizar select de docentes
        })
        .catch(err => {
            console.error('Error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el curso',
            });
        });
}

function confirmarEliminarCurso(id, nombre) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará el curso ${nombre}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${API_URL}/cursos/${id}`, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) throw new Error('Error al eliminar');
                    Swal.fire('¡Eliminado!', 'El curso ha sido eliminado.', 'success');
                    cargarCursos();
                    cargarCursosEnSelect();
                })
                .catch(err => {
                    console.error('Error:', err);
                    Swal.fire('Error', 'No se pudo eliminar el curso', 'error');
                });
        }
    });
}

// ==================== FUNCIONES DE REPORTES ====================

async function cargarReportes() {
    try {
        const response = await fetch(`${API_URL}/docentes`);
        if (!response.ok) throw new Error('Error al cargar docentes para reportes');

        const docentes = await response.json();
        const tbody = document.getElementById('listaReportes');
        tbody.innerHTML = '';

        if (docentes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><i class="fas fa-inbox"></i><p>No hay datos para reportes</p></td></tr>';
            return;
        }

        docentes.forEach(docente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${docente.dni}</td>
                <td>${docente.nombre}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="generarExcel('${docente.dni}', '${docente.nombre}')">
                        <i class="fas fa-file-excel"></i> Descargar Reporte
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function generarExcel(dni, nombre) {
    try {
        // Verificar si hay datos primero
        /* 
           Nota: La descarga directa via window.open no permite manejar errores 404 fácilmente.
           Mejor hacemos un fetch blob o verificamos primero.
        */
        
        window.open(`${API_URL}/reportes/${dni}`, '_blank');
        
        Swal.fire({
            icon: 'success',
            title: 'Descargando...',
            text: 'El reporte se está descargando',
            timer: 2000,
            timerProgressBar: true
        });
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar el reporte',
        });
    }
}

function borrarHistorial() {
    // Implementar endpoint para borrar historial si es necesario
    // Por ahora solo es un placeholder visual o requiere endpoint backend
    fetch(`${API_URL}/asistencias`, { method: 'DELETE' }) // Asumiendo que existe este endpoint
        .then(res => {
            if(res.ok) {
                 Swal.fire('Eliminado', 'Historial eliminado', 'success');
            } else {
                 Swal.fire('Error', 'No se pudo eliminar', 'error');
            }
        });
}
