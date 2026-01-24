const db = require('./database');

// Esperar a que la base de datos esté lista
setTimeout(() => {
    console.log('🔄 Iniciando migración de datos...\n');

    // Primero, crear los cursos
    const cursos = [
        {
            nombre: "Excel Básico",
            dia: "Lunes",
            hora_inicio: "07:00",
            hora_fin: "11:00",
            descripcion: "Introducción a Excel"
        },
        {
            nombre: "Redes 1",
            dia: "Lunes",
            hora_inicio: "11:00",
            hora_fin: "13:00",
            descripcion: "Fundamentos de redes"
        },
        {
            nombre: "Diseño Gráfico",
            dia: "Viernes",
            hora_inicio: "08:00",
            hora_fin: "10:00",
            descripcion: "Diseño gráfico profesional"
        },
        {
            nombre: "Inteligencia Artificial 2",
            dia: "Martes",
            hora_inicio: "17:05",
            hora_fin: "18:00",
            descripcion: "IA avanzado"
        },
        {
            nombre: "Base de Datos",
            dia: "Miércoles",
            hora_inicio: "17:15",
            hora_fin: "18:50",
            descripcion: "Diseño de bases de datos"
        },
        {
            nombre: "Compiladores",
            dia: "Miércoles",
            hora_inicio: "19:00",
            hora_fin: "20:00",
            descripcion: "Teoría de compiladores"
        },
        {
            nombre: "IA con Python",
            dia: "Jueves",
            hora_inicio: "18:20",
            hora_fin: "21:00",
            descripcion: "Inteligencia Artificial con Python"
        },
        {
            nombre: "Excel Intermedio",
            dia: "Lunes",
            hora_inicio: "07:00",
            hora_fin: "12:00",
            descripcion: "Nivel intermedio de Excel"
        },
        {
            nombre: "Inteligencia Artificial 1",
            dia: "Martes",
            hora_inicio: "16:25",
            hora_fin: "16:31",
            descripcion: "IA básico"
        },
        {
            nombre: "Office Avanzado",
            dia: "Miércoles",
            hora_inicio: "18:10",
            hora_fin: "19:00",
            descripcion: "Suite Office avanzado"
        },
        {
            nombre: "Desarrollo de IA",
            dia: "Jueves",
            hora_inicio: "18:30",
            hora_fin: "19:30",
            descripcion: "Desarrollo de aplicaciones IA"
        },
        {
            nombre: "Ensamblaje de Computador",
            dia: "Viernes",
            hora_inicio: "08:00",
            hora_fin: "10:00",
            descripcion: "Ensamblaje y mantenimiento"
        }
    ];

    // Datos de docentes con referencias a cursos por nombre
    const docentes = [
        {
            nombre: "Ana Villarroel",
            dni: "18459867",
            curso_nombre: "Diseño Gráfico"
        },
        {
            nombre: "Manuel Flores",
            dni: "16758938",
            curso_nombre: "Ensamblaje de Computador"
        }
    ];

    let cursosCompletados = 0;
    let cursosConError = 0;
    const cursosPorNombre = {}; // Para guardar referencias

    console.log(`📚 Creando ${cursos.length} cursos...\n`);

    // Crear cursos
    cursos.forEach((curso) => {
        db.crearCurso(curso, (err, result) => {
            cursosCompletados++;

            if (err) {
                console.error(`❌ Error al crear curso "${curso.nombre}":`, err.message);
                cursosConError++;
            } else {
                console.log(`✅ Curso creado: ${curso.nombre}`);
                cursosPorNombre[curso.nombre] = result.id;
            }

            // Cuando se completen todos los cursos, crear los docentes
            if (cursosCompletados === cursos.length) {
                console.log(`\n📊 Cursos completados:`);
                console.log(`   - Exitosos: ${cursosCompletados - cursosConError}`);
                console.log(`   - Errores: ${cursosConError}\n`);

                crearDocentes();
            }
        });
    });

    // Función para crear docentes después de los cursos
    function crearDocentes() {
        console.log(`👥 Creando ${docentes.length} docentes...\n`);

        let docentesCompletados = 0;
        let docentesConError = 0;

        docentes.forEach((docente) => {
            const docenteData = {
                nombre: docente.nombre,
                dni: docente.dni,
                curso_id: cursosPorNombre[docente.curso_nombre] || null
            };

            db.crearDocente(docenteData, (err, result) => {
                docentesCompletados++;

                if (err) {
                    console.error(`❌ Error al crear docente "${docente.nombre}":`, err.message);
                    docentesConError++;
                } else {
                    console.log(`✅ Docente creado: ${docente.nombre} (DNI: ${docente.dni})`);
                    if (docente.curso_nombre) {
                        console.log(`   └─ Curso asignado: ${docente.curso_nombre}`);
                    }
                }

                // Cuando se completen todos
                if (docentesCompletados === docentes.length) {
                    console.log(`\n📊 Docentes completados:`);
                    console.log(`   - Exitosos: ${docentesCompletados - docentesConError}`);
                    console.log(`   - Errores: ${docentesConError}`);

                    console.log(`\n${'='.repeat(50)}`);
                    console.log('✨ ¡Migración de datos completada!');
                    console.log(`${'='.repeat(50)}`);
                    console.log(`\n📊 Resumen Total:`);
                    console.log(`   - Cursos: ${cursosCompletados - cursosConError}`);
                    console.log(`   - Docentes: ${docentesCompletados - docentesConError}`);
                    console.log(`\n💡 Ejecuta "npm start" para iniciar el servidor`);
                    console.log(`🌐 Accede a: http://localhost:3000/pages/admin.html\n`);

                    process.exit(0);
                }
            });
        });
    }
}, 2000); // Esperar 2 segundos para que la BD se inicialice

