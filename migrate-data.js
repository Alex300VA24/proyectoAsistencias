const db = require('./database');

// Esperar a que la base de datos se inicialice
setTimeout(() => {
    console.log('🔄 Iniciando migración de datos...\n');

    // Datos de ejemplo
    const cursosData = [
        { nombre: 'Matemáticas Básico', hora_inicio: '08:00', hora_fin: '09:30', dia: 'Lunes', descripcion: 'Clase de matemáticas para educación básica' },
        { nombre: 'Lengua Española', hora_inicio: '09:45', hora_fin: '11:15', dia: 'Lunes', descripcion: 'Clase de idioma español' },
        { nombre: 'Ciencias Naturales', hora_inicio: '11:30', hora_fin: '13:00', dia: 'Martes', descripcion: 'Clase de ciencias y naturaleza' },
        { nombre: 'Historia', hora_inicio: '14:00', hora_fin: '15:30', dia: 'Miércoles', descripcion: 'Clase de historia general' },
        { nombre: 'Educación Física', hora_inicio: '15:45', hora_fin: '17:15', dia: 'Jueves', descripcion: 'Clase de educación física' },
        { nombre: 'Informática', hora_inicio: '08:00', hora_fin: '09:30', dia: 'Viernes', descripcion: 'Clase de informática y programación' },
        { nombre: 'Inglés', hora_inicio: '10:00', hora_fin: '11:30', dia: 'Viernes', descripcion: 'Clase de inglés conversacional' }
    ];

    const docentesData = [
        { dni: '12345678', nombre: 'Juan Pérez García' },
        { dni: '87654321', nombre: 'María López Rodríguez' },
        { dni: '11223344', nombre: 'Carlos Martínez López' },
        { dni: '44332211', nombre: 'Ana García Fernández' },
        { dni: '55667788', nombre: 'Roberto Díaz Sánchez' }
    ];

    // Relaciones docente-cursos (cada docente puede tener varios cursos)
    const relaciones = [
        { docente_dni: '12345678', curso_index: 0 }, // Juan - Matemáticas
        { docente_dni: '12345678', curso_index: 4 }, // Juan - Educación Física
        { docente_dni: '87654321', curso_index: 1 }, // María - Lengua Española
        { docente_dni: '87654321', curso_index: 2 }, // María - Ciencias Naturales
        { docente_dni: '11223344', curso_index: 3 }, // Carlos - Historia
        { docente_dni: '44332211', curso_index: 5 }, // Ana - Informática
        { docente_dni: '44332211', curso_index: 6 }, // Ana - Inglés
        { docente_dni: '55667788', curso_index: 0 }, // Roberto - Matemáticas
        { docente_dni: '55667788', curso_index: 1 }  // Roberto - Lengua Española
    ];

    // Datos de asistencia de ejemplo
    const asistenciasData = [
        {
            docente_dni: '12345678',
            fecha: '2026-01-20',
            curso: 'Matemáticas Básico',
            entrada: '08:05',
            salida: '09:30',
            entrada_prog: '08:00',
            salida_prog: '09:30'
        },
        {
            docente_dni: '12345678',
            fecha: '2026-01-21',
            curso: 'Educación Física',
            entrada: '15:45',
            salida: '17:15',
            entrada_prog: '15:45',
            salida_prog: '17:15'
        },
        {
            docente_dni: '87654321',
            fecha: '2026-01-20',
            curso: 'Lengua Española',
            entrada: '09:45',
            salida: '11:10',
            entrada_prog: '09:45',
            salida_prog: '11:15'
        },
        {
            docente_dni: '87654321',
            fecha: '2026-01-21',
            curso: 'Ciencias Naturales',
            entrada: '11:30',
            salida: '13:00',
            entrada_prog: '11:30',
            salida_prog: '13:00'
        },
        {
            docente_dni: '11223344',
            fecha: '2026-01-20',
            curso: 'Historia',
            entrada: '14:00',
            salida: '15:30',
            entrada_prog: '14:00',
            salida_prog: '15:30'
        },
        {
            docente_dni: '44332211',
            fecha: '2026-01-22',
            curso: 'Informática',
            entrada: '08:00',
            salida: '09:30',
            entrada_prog: '08:00',
            salida_prog: '09:30'
        },
        {
            docente_dni: '55667788',
            fecha: '2026-01-20',
            curso: 'Matemáticas Básico',
            entrada: '08:10',
            salida: '09:30',
            entrada_prog: '08:00',
            salida_prog: '09:30'
        }
    ];

    // Iniciar migración
    let cursosInsertados = 0;
    let docentesInsertados = 0;
    let relacionesInsertadas = 0;
    let asistenciasInsertadas = 0;

    // Función para insertar cursos
    function insertarCursos() {
        console.log(`📚 Creando ${cursosData.length} cursos...\n`);

        cursosData.forEach(curso => {
            db.crearCurso(curso, (err, result) => {
                if (err) {
                    console.error('❌ Error al crear curso:', curso.nombre, err.message);
                } else {
                    console.log('✅ Curso creado:', curso.nombre);
                }
                cursosInsertados++;
                
                if (cursosInsertados === cursosData.length) {
                    insertarDocentes();
                }
            });
        });
    }

    // Función para insertar docentes
    function insertarDocentes() {
        console.log(`\n👥 Creando ${docentesData.length} docentes...\n`);
        
        docentesData.forEach(docente => {
            db.crearDocente(docente, (err, result) => {
                if (err) {
                    console.error('❌ Error al crear docente:', docente.nombre, err.message);
                } else {
                    console.log('✅ Docente creado:', docente.nombre);
                }
                docentesInsertados++;
                
                if (docentesInsertados === docentesData.length) {
                    insertarRelaciones();
                }
            });
        });
    }

    // Función para insertar relaciones docente-curso
    function insertarRelaciones() {
        console.log(`\n🔗 Asignando cursos a docentes...\n`);
        
        db.obtenerDocentes((err, docentes) => {
            if (err) {
                console.error('❌ Error al obtener docentes:', err);
                return;
            }
            
            db.obtenerCursos((err, cursos) => {
                if (err) {
                    console.error('❌ Error al obtener cursos:', err);
                    return;
                }
                
                relaciones.forEach(rel => {
                    const docente = docentes.find(d => d.dni === rel.docente_dni);
                    const curso = cursos[rel.curso_index];
                    
                    if (docente && curso) {
                        db.asignarCursoDocente(docente.id, curso.id, (err) => {
                            if (err) {
                                console.error('❌ Error al asignar curso:', err.message);
                            } else {
                                console.log(`✅ Asignado: ${docente.nombre} → ${curso.nombre}`);
                            }
                            relacionesInsertadas++;
                            
                            if (relacionesInsertadas === relaciones.length) {
                                insertarAsistencias();
                            }
                        });
                    }
                });
            });
        });
    }

    // Función para insertar asistencias
    function insertarAsistencias() {
        console.log(`\n📊 Insertando ${asistenciasData.length} registros de asistencia...\n`);
        
        db.obtenerDocentes((err, docentes) => {
            if (err) {
                console.error('❌ Error al obtener docentes:', err);
                return;
            }
            
            asistenciasData.forEach(asistencia => {
                const docente = docentes.find(d => d.dni === asistencia.docente_dni);
                const curso = docente && docente.cursos.find(c => c.nombre === asistencia.curso);
                
                if (docente && curso) {
                    const [entH, entM] = asistencia.entrada.split(':').map(Number);
                    const [salH, salM] = asistencia.salida.split(':').map(Number);
                    const horas = (salH + salM/60) - (entH + entM/60);
                    
                    db.crearAsistencia({
                        docente_dni: asistencia.docente_dni,
                        fecha: asistencia.fecha,
                        curso_id: curso.id,
                        entrada: asistencia.entrada,
                        salida: asistencia.salida,
                        horas: horas,
                        observaciones: 0,
                        entrada_prog: asistencia.entrada_prog,
                        salida_prog: asistencia.salida_prog
                    }, (err) => {
                        if (err) {
                            console.error('❌ Error al registrar asistencia:', err.message);
                        } else {
                            console.log(`✅ Asistencia registrada: ${docente.nombre} - ${asistencia.fecha}`);
                        }
                        asistenciasInsertadas++;
                        
                        if (asistenciasInsertadas === asistenciasData.length) {
                            console.log('\n' + '='.repeat(60));
                            console.log('✨ ¡Migración completada exitosamente!');
                            console.log('='.repeat(60));
                            console.log('\n📊 Resumen:');
                            console.log(`   • Cursos creados: ${cursosData.length}`);
                            console.log(`   • Docentes creados: ${docentesData.length}`);
                            console.log(`   • Relaciones docente-curso: ${relacionesInsertadas}`);
                            console.log(`   • Registros de asistencia: ${asistenciasInsertadas}`);
                            console.log('\n💡 Ejecuta "npm start" para iniciar el servidor');
                            console.log('🌐 Accede a: http://localhost:3000/pages/admin.html\n');
                            process.exit(0);
                        }
                    });
                }
            });
        });
    }

    // Iniciar el proceso
    insertarCursos();

}, 2000); // Esperar 2 segundos para que la BD se inicialice

