/*********************************
 * CONFIGURACIÓN GENERAL
 *********************************/
const TOLERANCIA_ENTRADA_MIN = 10;   // puede marcar 10 min antes
const TOLERANCIA_SALIDA_MIN = 15;    // puede marcar 15 min después
const LIMITE_TARDANZA = 30;          // 30 min tarde = bloqueo
const CORTE_JORNADA_MIN = 30;

let docenteActual = null;
let jornadaActiva = null;

/*********************************
 * LOGIN POR DNI
 *********************************/
async function verificarDNI() {
    const dni = document.getElementById("dniInput").value.trim();

    if (dni === DNI_ADMIN) {
        window.location.href = "admin.html";
        return;
    }

    try {
        // Obtener docente desde la API
        const response = await fetch(`${API_URL}/docentes/${dni}`);
        
        if (!response.ok) {
            mostrarMensaje("❌ DNI no registrado");
            return;
        }
        
        docenteActual = await response.json();
        
        // Obtener jornada activa desde la API
        const jornadaResponse = await fetch(`${API_URL}/jornadas/${dni}`);
        jornadaActiva = await jornadaResponse.json();
        
        mostrarPanelDocente();
    } catch (error) {
        console.error('Error al verificar DNI:', error);
        mostrarMensaje("❌ Error de conexión con el servidor");
    }
}

/*********************************
 * PANEL DOCENTE
 *********************************/
async function mostrarPanelDocente() {
    document.getElementById("panelDocente").classList.remove("hidden");
    document.getElementById("bienvenida").innerText =
        `Bienvenido/a ${docenteActual.nombre}`;

    const ahora = new Date();
    const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const diaHoy = dias[ahora.getDay()];

    document.getElementById("fechaActual").innerText =
        `${diaHoy} - ${ahora.toLocaleDateString()}`;

    const lista = document.getElementById("listaCursos");
    lista.innerHTML = "";

    if (jornadaActiva) {
        lista.innerHTML = `<li>🟢 Jornada iniciada a las ${jornadaActiva.entrada}</li>`;
        ocultarEntradaMostrarSalida();
        return;
    }

    const cursosAhora = await obtenerCursosDelMomento(diaHoy, ahora);

    // Minuto actual
    const minActual = ahora.getHours() * 60 + ahora.getMinutes();

    // Cursos pendientes para más tarde hoy (excluyendo curso activo)
    const cursosPendientes = docenteActual.horario.filter(h => {
        if (h.dia !== diaHoy) return false;

        const inicio = convertirAMin(h.inicio);

        // si ya pasó su hora de inicio no es pendiente
        if (inicio <= minActual) return false;

        // si es el curso que está activo ahora, excluir
        if (convertirAMin(h.inicio) <= minActual) return false;

        return true;
    });


    lista.innerHTML = "";

    /* ===== CASO 1: HAY CURSO ACTIVO ===== */
    if (cursosAhora.length > 0) {

        // Título curso actual
        const liTitulo = document.createElement("li");
        liTitulo.innerText = "🟢 Curso iniciado ahora:";
        liTitulo.style.fontWeight = "600";
        lista.appendChild(liTitulo);

        cursosAhora.forEach(c => {
            const li = document.createElement("li");
            li.innerText = `${c.curso} (${c.inicio} - ${c.fin})`;
            lista.appendChild(li);
        });

        // Luego mostramos pendientes si existen
        if (cursosPendientes.length > 0) {
            const liPend = document.createElement("li");
            liPend.innerText = "📌 Cursos pendientes para hoy:";
            liPend.style.marginTop = "8px";
            liPend.style.fontWeight = "600";
            lista.appendChild(liPend);

            cursosPendientes.forEach(c => {
                const li = document.createElement("li");
                li.innerText = `${c.curso} (${c.inicio} - ${c.fin})`;
                lista.appendChild(li);
            });
        }

        habilitarEntrada();
        return;
    }

    /* ===== CASO 2: NO HAY CURSO ACTIVO ===== */
    if (cursosAhora.length === 0) {

        const liNo = document.createElement("li");
        liNo.innerText = "⛔ No tiene cursos en este momento";
        lista.appendChild(liNo);

        if (cursosPendientes.length > 0) {
            const liPend = document.createElement("li");
            liPend.innerText = "📌 Cursos pendientes para hoy:";
            liPend.style.marginTop = "8px";
            liPend.style.fontWeight = "600";
            lista.appendChild(liPend);

            cursosPendientes.forEach(c => {
                const li = document.createElement("li");
                li.innerText = `${c.curso} (${c.inicio} - ${c.fin})`;
                lista.appendChild(li);
            });
        } else {
            const liFin = document.createElement("li");
            liFin.innerText = "✅ No tiene más cursos programados hoy";
            lista.appendChild(liFin);
        }

        bloquearEntrada();
        return;
    }


    cursos.forEach(c => {
        const li = document.createElement("li");
        li.innerText = `${c.curso} (${c.inicio} - ${c.fin})`;
        lista.appendChild(li);
    });

    habilitarEntrada();
}

/*********************************
 * OBTENER CURSOS DEL MOMENTO
 *********************************/
async function obtenerCursosDelMomento(dia, ahora) {
    const minActual = ahora.getHours() * 60 + ahora.getMinutes();
    const hoy = new Date().toLocaleDateString();

    console.log("Estos son minActual y hoy: ", {minActual, hoy});

    // Obtener historial desde la API
    let historial = [];
    try {
        const response = await fetch(`${API_URL}/asistencias/${docenteActual.dni}`);
        if (response.ok) {
            const asistencias = await response.json();
            // Convertir formato de BD al formato esperado
            historial = asistencias.map(a => ({
                fecha: a.fecha,
                nombre: a.curso
            }));
        }
    } catch (error) {
        console.error('Error al obtener historial:', error);
    }

    console.log("Este es historial: ", {historial});

    const cursosDia = docenteActual.horario
        .filter(h => h.dia === dia)
        .sort((a,b)=> convertirAMin(a.inicio) - convertirAMin(b.inicio));

    console.log("Estos son cursosDia: ", {cursosDia});

    for (let h of cursosDia) {

        const inicio = convertirAMin(h.inicio);
        const fin = convertirAMin(h.fin);

        // Si ya fue registrado hoy → ignorar
        const yaHecho = historial.some(r =>
            r.fecha === hoy && r.nombre === h.curso
        );
        if (yaHecho) continue;

        // Ventanas con tolerancia
        const inicioConTol = inicio - TOLERANCIA_ENTRADA_MIN;
        const finConTol = fin + TOLERANCIA_SALIDA_MIN;

        // ✅ Curso visible como activo
        if (minActual >= inicioConTol && minActual < finConTol) {
            return [h];
        }

        // 🛑 Si aún no llegamos al siguiente curso, detener búsqueda
        if (minActual < inicioConTol) break;
    }

    return [];
}



function convertirAMin(hora) {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
}

function formatearHora(fecha) {
    return fecha.toTimeString().slice(0, 5);
}

/*********************************
 * MARCAR ENTRADA
 *********************************/
async function marcarEntrada() {
    const ahora = new Date();
    const dias = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    const diaHoy = dias[ahora.getDay()];

    // Verificar si ya existe jornada activa
    try {
        const jornadaResponse = await fetch(`${API_URL}/jornadas/${docenteActual.dni}`);
        const jornadaExistente = await jornadaResponse.json();
        
        if (jornadaExistente && jornadaExistente.docente_dni) {
            Swal.fire({
                icon: 'warning',
                title: 'Entrada Activa',
                text: 'Ya existe una entrada activa para este docente',
                confirmButtonColor: '#1e40af'
            });
            return;
        }
    } catch (error) {
        console.error('Error al verificar jornada:', error);
    }

    const cursos = await obtenerCursosDelMomento(diaHoy, ahora);
    if (!cursos.length) {
        Swal.fire({
            icon: 'error',
            title: 'Sin Cursos',
            text: 'No tiene cursos programados en este horario',
            confirmButtonColor: '#1e40af'
        }).then(() => reiniciarSesion());
        return;
    }

    // ⛔ Evitar re-marcación del mismo curso en el mismo día
    try {
        const asistenciasResponse = await fetch(`${API_URL}/asistencias/${docenteActual.dni}`);
        const asistencias = await asistenciasResponse.json();
        
        const hoy = new Date().toLocaleDateString();
        const cursoActual = cursos[0].curso;

        const yaRegistrado = asistencias.some(a =>
            a.fecha === hoy && a.curso === cursoActual
        );

        if (yaRegistrado) {
            Swal.fire({
                icon: 'warning',
                title: 'Ya Registrado',
                text: 'Este curso ya fue registrado hoy. No puede volver a marcar entrada.',
                confirmButtonColor: '#1e40af'
            }).then(() => reiniciarSesion());
            return;
        }
    } catch (error) {
        console.error('Error al verificar asistencias:', error);
    }

    const inicioProg = convertirAMin(cursos[0].inicio);
    const minActual = ahora.getHours()*60 + ahora.getMinutes();
    const minutosTarde = minActual - inicioProg;

    // ❌ Bloqueo por tardanza extrema
    if (minutosTarde >= LIMITE_TARDANZA) {
        Swal.fire({
            icon: 'error',
            title: 'Tardanza Excesiva',
            text: 'Llegó demasiado tarde. Debe acudir a administración.',
            confirmButtonColor: '#1e40af'
        }).then(() => reiniciarSesion());
        return;
    }

    // ✅ Hora que se guardará
    let horaEntradaGuardar;

    // Si marcó antes o justo a tiempo → guardar hora oficial
    if (minActual <= inicioProg) {
        horaEntradaGuardar = cursos[0].inicio;
    } else {
        // Si llegó tarde leve → guardar hora real
        horaEntradaGuardar = formatearHora(ahora);
    }

    jornadaActiva = {
        docente_dni: docenteActual.dni,
        fecha: ahora.toLocaleDateString(),
        dia: diaHoy,
        entrada: horaEntradaGuardar,
        minutos_tarde: Math.max(0, minutosTarde)
    };

    // Guardar en la API
    try {
        const response = await fetch(`${API_URL}/jornadas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jornadaActiva)
        });

        if (!response.ok) {
            throw new Error('Error al guardar jornada');
        }

        Swal.fire({
            icon: 'success',
            title: '¡Entrada Registrada!',
            text: 'Su entrada ha sido registrada correctamente',
            confirmButtonColor: '#1e40af',
            timer: 2500,
            timerProgressBar: true
        }).then(() => reiniciarSesion());
        
    } catch (error) {
        console.error('Error al marcar entrada:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo registrar la entrada. Intente nuevamente.',
            confirmButtonColor: '#1e40af'
        });
    }
}


/*********************************
 * MARCAR SALIDA
 *********************************/
async function marcarSalida() {
    try {
        // Obtener jornada activa desde la API
        const jornadaResponse = await fetch(`${API_URL}/jornadas/${docenteActual.dni}`);
        
        if (!jornadaResponse.ok || !await jornadaResponse.text()) {
            Swal.fire({
                icon: 'error',
                title: 'Sin Entrada',
                text: 'No hay entrada activa registrada',
                confirmButtonColor: '#1e40af'
            }).then(() => reiniciarSesion());
            return;
        }
        
        // Rehacer la petición para obtener el JSON
        const jornadaResponse2 = await fetch(`${API_URL}/jornadas/${docenteActual.dni}`);
        const jornada = await jornadaResponse2.json();
        
        const ahora = new Date();
        const horaSalidaReal = formatearHora(ahora);

        let minSalidaReal = convertirAMin(horaSalidaReal);

        const todosCursosDia = docenteActual.horario
            .filter(h => h.dia === jornada.dia)
            .sort((a,b)=> convertirAMin(a.inicio)-convertirAMin(b.inicio));

        // construir bloque continuo desde el curso donde marcó entrada
        let cursosDia = [];
        let inicioJornada = convertirAMin(jornada.entrada);

        for (let i = 0; i < todosCursosDia.length; i++) {

            const inicioCurso = convertirAMin(todosCursosDia[i].inicio);
            const finCurso = convertirAMin(todosCursosDia[i].fin);

            // encontrar curso donde empezó la jornada
            if (inicioJornada >= inicioCurso && inicioJornada < finCurso) {

                // ⚠️ Si salió antes del final del primer curso
                // entonces NO se permiten cursos continuos siguientes
                if (minSalidaReal < finCurso) {
                    cursosDia = [todosCursosDia[i]];
                    break;
                }

                // Caso normal → sí permite bloque continuo
                cursosDia.push(todosCursosDia[i]);

                // añadir cursos siguientes si son continuos
                for (let j = i+1; j < todosCursosDia.length; j++) {

                    const inicioSig = convertirAMin(todosCursosDia[j].inicio);
                    const finAnterior = convertirAMin(todosCursosDia[j-1].fin);
                    const separacion = inicioSig - finAnterior;

                    if (separacion <= CORTE_JORNADA_MIN) {
                        cursosDia.push(todosCursosDia[j]);
                    } else {
                        break; // corte de jornada
                    }
                }
                break;
            }
        }

        if (!cursosDia.length) {
            Swal.fire({
                icon: 'error',
                title: 'Sin Cursos',
                text: 'No hay cursos válidos para registrar',
                confirmButtonColor: '#1e40af'
            }).then(() => reiniciarSesion());
            return;
        }

        // Último curso del bloque continuo
        const finProg = convertirAMin(cursosDia[cursosDia.length-1].fin);

        // Diferencia salida
        const minutosDespues = minSalidaReal - finProg;

        // ❌ Bloqueo si sale demasiado tarde
        if (minutosDespues > TOLERANCIA_SALIDA_MIN) {
            Swal.fire({
                icon: 'error',
                title: 'Salida Tardía',
                text: 'Salida fuera de tiempo permitido. Debe acudir a administración.',
                confirmButtonColor: '#1e40af'
            }).then(() => reiniciarSesion());
            return;
        }

        // Hora salida que se guardará
        let horaSalidaGuardar;

        // Si marca después dentro tolerancia → guardar hora oficial
        if (minutosDespues >= 0) {
            horaSalidaGuardar = cursosDia[cursosDia.length-1].fin;
        } else {
            // Si sale antes → guardar hora real
            horaSalidaGuardar = horaSalidaReal;
        }

        // Minutos salida anticipada
        const minutosSalidaAnticipada = Math.max(0, finProg - convertirAMin(horaSalidaGuardar));

        // Preparar registros de asistencia
        const asistencias = [];
        
        cursosDia.forEach((curso, idx) => {

            let entradaCurso;
            let salidaCurso;

            // Primer curso → usa la hora real de entrada guardada
            if (idx === 0) {
                entradaCurso = jornada.entrada;
            } 
            // Cursos siguientes → usan su hora programada de inicio
            else {
                entradaCurso = curso.inicio;
            }

            // Último curso → usa hora de salida guardada
            if (idx === cursosDia.length - 1) {
                salidaCurso = horaSalidaGuardar;
            } 
            // Cursos intermedios → usan su hora programada de fin
            else {
                salidaCurso = curso.fin;
            }

            // Observaciones
            let observacionesNumero = 0;

            // Si es primer curso → suma tardanza entrada
            if (idx === 0) {
                observacionesNumero += jornada.minutos_tarde || 0;
            }

            // Si es último curso → suma excedente o salida anticipada
            if (idx === cursosDia.length - 1) {
                observacionesNumero += minutosSalidaAnticipada;
            }

            asistencias.push({
                docente_dni: docenteActual.dni,
                fecha: jornada.fecha,
                curso: curso.curso,
                entrada: entradaCurso,
                salida: salidaCurso,
                horas: ((convertirAMin(salidaCurso) - convertirAMin(entradaCurso)) / 60).toFixed(2),
                observaciones: observacionesNumero,
                entrada_prog: curso.inicio,
                salida_prog: curso.fin
            });
        });

        // Guardar asistencias en la API
        const asistenciasResponse = await fetch(`${API_URL}/asistencias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(asistencias)
        });

        if (!asistenciasResponse.ok) {
            throw new Error('Error al guardar asistencias');
        }

        // Eliminar jornada activa
        await fetch(`${API_URL}/jornadas/${docenteActual.dni}`, {
            method: 'DELETE'
        });

        Swal.fire({
            icon: 'success',
            title: '¡Salida Registrada!',
            text: 'Su salida ha sido registrada correctamente',
            confirmButtonColor: '#1e40af',
            timer: 2500,
            timerProgressBar: true
        }).then(() => reiniciarSesion());
        
    } catch (error) {
        console.error('Error al marcar salida:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo registrar la salida. Intente nuevamente.',
            confirmButtonColor: '#1e40af'
        });
    }
}


/*********************************
 * UI HELPERS
 *********************************/
function bloquearEntrada() {
    document.getElementById("btnEntrada").disabled = true;
    document.getElementById("btnSalida").classList.add("hidden");
}

function habilitarEntrada() {
    document.getElementById("btnEntrada").disabled = false;
    document.getElementById("btnEntrada").classList.remove("hidden");
    document.getElementById("btnSalida").classList.add("hidden");
}

function ocultarEntradaMostrarSalida() {
    document.getElementById("btnEntrada").classList.add("hidden");
    document.getElementById("btnSalida").classList.remove("hidden");
}

/*********************************
 * SESIÓN
 *********************************/
function reiniciarSesion() {
    docenteActual = null;
    document.getElementById("dniInput").value = "";
    location.reload();
}

function mostrarMensaje(msg) {
    document.getElementById("mensaje").innerText = msg;
}
