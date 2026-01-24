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
    event.target.classList.add('active');
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
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-inbox"></i><p>No hay docentes registrados</p></td></tr>';
            return;
        }

        docentes.forEach(docente => {
            const tr = document.createElement('tr');
            const horario = docente.curso_nombre
                ? `${docente.curso_nombre} (${docente.hora_inicio} - ${docente.hora_fin})`
                : 'Sin asignar';

            tr.innerHTML = `
                <td>${docente.dni}</td>
                <td>${docente.nombre}</td>
                <td>${docente.curso_nombre || '-'}</td>
                <td>${horario}</td>
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
            document.getElementById('docenteCursoId').value = docente.curso_id || '';
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
    const curso_id = document.getElementById('docenteCursoId').value;

    const datos = {
        nombre,
        curso_id: curso_id ? parseInt(curso_id) : null
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
        title: '¿Eliminar docente?',
        text: `¿Estás seguro de que deseas eliminar a "${nombre}"? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
        cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarDocente(id);
        }
    });
}

function eliminarDocente(id) {
    fetch(`${API_URL}/docentes/${id}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error('Error al eliminar docente');
            return res.json();
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: 'El docente ha sido eliminado correctamente',
                timer: 2000
            });
            cargarDocentes();
            cargarReportes();
        })
        .catch(err => {
            console.error('Error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el docente',
            });
        });
}

// ==================== FUNCIONES DE CURSOS ====================

async function cargarCursos() {
    try {
        const response = await fetch(`${API_URL}/cursos`);
        if (!response.ok) throw new Error('Error al cargar cursos');

        const cursos = await response.json();
        const tbody = document.getElementById('listaCursos');
        tbody.innerHTML = '';

        if (cursos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><p>No hay cursos registrados</p></td></tr>';
            return;
        }

        cursos.forEach(curso => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${curso.nombre}</strong></td>
                <td>${curso.dia}</td>
                <td>${curso.hora_inicio}</td>
                <td>${curso.hora_fin}</td>
                <td>${curso.descripcion || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-edit" onclick="editarCurso(${curso.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-sm btn-delete" onclick="confirmarEliminarCurso(${curso.id}, '${curso.nombre}')">
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
            text: 'No se pudieron cargar los cursos',
        });
    }
}

async function cargarCursosEnSelect() {
    try {
        const response = await fetch(`${API_URL}/cursos`);
        if (!response.ok) throw new Error('Error al cargar cursos');

        const cursos = await response.json();
        const select = document.getElementById('docenteCursoId');

        // Limpiar opciones existentes (excepto la primera)
        while (select.options.length > 1) {
            select.remove(1);
        }

        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.id;
            option.textContent = `${curso.nombre} (${curso.hora_inicio} - ${curso.hora_fin})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
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
    const nombre = document.getElementById('cursoNombre').value;
    const dia = document.getElementById('cursoDia').value;
    const hora_inicio = document.getElementById('cursoHoraInicio').value;
    const hora_fin = document.getElementById('cursoHoraFin').value;
    const descripcion = document.getElementById('cursoDescripcion').value;

    const datos = {
        nombre,
        dia,
        hora_inicio,
        hora_fin,
        descripcion
    };

    if (!id) {
        // Crear nuevo
        fetch(`${API_URL}/cursos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al crear curso');
                return res.json();
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Curso creado correctamente',
                    timer: 2000
                });
                cerrarModalCurso();
                cargarCursos();
                cargarCursosEnSelect();
            })
            .catch(err => {
                console.error('Error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo crear el curso',
                });
            });
    } else {
        // Editar
        fetch(`${API_URL}/cursos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al actualizar curso');
                return res.json();
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Curso actualizado correctamente',
                    timer: 2000
                });
                cerrarModalCurso();
                cargarCursos();
                cargarCursosEnSelect();
                cargarDocentes();
            })
            .catch(err => {
                console.error('Error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el curso',
                });
            });
    }
}

function confirmarEliminarCurso(id, nombre) {
    Swal.fire({
        title: '¿Eliminar curso?',
        text: `¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
        cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarCurso(id);
        }
    });
}

function eliminarCurso(id) {
    fetch(`${API_URL}/cursos/${id}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error('Error al eliminar curso');
            return res.json();
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: 'El curso ha sido eliminado correctamente',
                timer: 2000
            });
            cargarCursos();
            cargarCursosEnSelect();
            cargarDocentes();
        })
        .catch(err => {
            console.error('Error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el curso',
            });
        });
}

// ==================== FUNCIONES DE REPORTES ====================

async function cargarReportes() {
    try {
        const response = await fetch(`${API_URL}/docentes`);
        if (!response.ok) throw new Error('Error al cargar docentes');

        const docentes = await response.json();
        const tbody = document.getElementById('listaReportes');
        tbody.innerHTML = '';

        if (docentes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-inbox"></i><p>No hay docentes para descargar reportes</p></td></tr>';
            return;
        }

        docentes.forEach(docente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${docente.nombre}</td>
                <td>${docente.dni}</td>
                <td>${docente.curso_nombre || 'Sin asignar'}</td>
                <td>
                    <button class="btn-sm btn-primary" onclick="generarExcel('${docente.dni}', '${docente.nombre}')">
                        <i class="fas fa-file-excel"></i> Descargar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los docentes para reportes',
        });
    }
}

async function generarExcel(dni, nombre) {
    try {
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

// Borrar todo el historial
async function borrarHistorial() {
    try {
        const response = await fetch(`${API_URL}/asistencias`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar historial');
        }

        Swal.fire({
            title: "¡Eliminado!",
            text: "El historial ha sido eliminado correctamente.",
            icon: "success",
        }).then(() => {
            location.reload();
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el historial',
        });
    }
}

// Cerrar modales al hacer click fuera
window.onclick = function(event) {
    const modalDocente = document.getElementById('modalDocente');
    const modalCurso = document.getElementById('modalCurso');

    if (event.target === modalDocente) {
        cerrarModalDocente();
    }
    if (event.target === modalCurso) {
        cerrarModalCurso();
    }
};
