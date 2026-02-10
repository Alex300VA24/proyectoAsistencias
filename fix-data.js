const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'asistencias.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Reparando datos...');

db.serialize(() => {
    // 1. Limpiar asistencias para regenerarlas
    db.run('DELETE FROM asistencias');
    console.log('🗑️ Asistencias limpiadas');

    // 2. Asegurar Docentes (Insert or Ignore)
    const docentes = [
        { dni: '12345678', nombre: 'Juan Pérez García' },
        { dni: '87654321', nombre: 'María López Rodríguez' },
        { dni: '11223344', nombre: 'Carlos Martínez López' },
        { dni: '44332211', nombre: 'Ana García Fernández' },
        { dni: '55667788', nombre: 'Roberto Díaz Sánchez' }
    ];

    docentes.forEach(d => {
        db.run('INSERT OR IGNORE INTO docentes (dni, nombre) VALUES (?, ?)', [d.dni, d.nombre]);
    });

    // 3. Asegurar Cursos
    const cursos = [
        { nombre: 'Matemáticas Básico', hora_inicio: '08:00', hora_fin: '09:30', dia: 'Lunes' },
        { nombre: 'Lengua Española', hora_inicio: '09:45', hora_fin: '11:15', dia: 'Lunes' },
        { nombre: 'Ciencias Naturales', hora_inicio: '11:30', hora_fin: '13:00', dia: 'Martes' },
        { nombre: 'Historia', hora_inicio: '14:00', hora_fin: '15:30', dia: 'Miércoles' },
        { nombre: 'Educación Física', hora_inicio: '15:45', hora_fin: '17:15', dia: 'Jueves' },
        { nombre: 'Informática', hora_inicio: '08:00', hora_fin: '09:30', dia: 'Viernes' },
        { nombre: 'Inglés', hora_inicio: '10:00', hora_fin: '11:30', dia: 'Viernes' }
    ];

    cursos.forEach(c => {
        db.run('INSERT OR IGNORE INTO cursos (nombre, hora_inicio, hora_fin, dia, descripcion) VALUES (?, ?, ?, ?, ?)', 
            [c.nombre, c.hora_inicio, c.hora_fin, c.dia, 'Curso de prueba']);
    });

    // 4. Asignar Cursos a Docentes (Relaciones)
    // Juan (12345678) -> Matemáticas, Educación Física
    // María (87654321) -> Lengua, Ciencias
    setTimeout(() => {
        const asignaciones = [
            { dni: '12345678', curso: 'Matemáticas Básico' },
            { dni: '12345678', curso: 'Educación Física' },
            { dni: '87654321', curso: 'Lengua Española' },
            { dni: '87654321', curso: 'Ciencias Naturales' }
        ];

        asignaciones.forEach(a => {
            db.get('SELECT id FROM docentes WHERE dni = ?', [a.dni], (err, doc) => {
                if (doc) {
                    db.get('SELECT id FROM cursos WHERE nombre = ?', [a.curso], (err, cur) => {
                        if (cur) {
                            db.run('INSERT OR IGNORE INTO docente_cursos (docente_id, curso_id) VALUES (?, ?)', [doc.id, cur.id]);
                        }
                    });
                }
            });
        });

        // 5. Insertar Asistencias
        console.log('📊 Generando asistencias...');
        const asistencias = [
            { dni: '12345678', curso: 'Matemáticas Básico', fecha: '2026-01-20', entrada: '08:05', salida: '09:30' },
            { dni: '12345678', curso: 'Educación Física', fecha: '2026-01-22', entrada: '15:45', salida: '17:15' },
            { dni: '87654321', curso: 'Lengua Española', fecha: '2026-01-20', entrada: '09:45', salida: '11:10' },
            { dni: '87654321', curso: 'Ciencias Naturales', fecha: '2026-01-21', entrada: '11:30', salida: '13:00' }
        ];

        asistencias.forEach(a => {
            db.get('SELECT id FROM cursos WHERE nombre = ?', [a.curso], (err, cur) => {
                if (cur) {
                    db.run(`INSERT INTO asistencias 
                        (docente_dni, fecha, curso_id, entrada, salida, horas, observaciones, entrada_prog, salida_prog) 
                        VALUES (?, ?, ?, ?, ?, 1.5, 0, ?, ?)`,
                        [a.dni, a.fecha, cur.id, a.entrada, a.salida, '08:00', '09:30'],
                        (err) => {
                            if (err) console.error('Error insertando asistencia:', err.message);
                            else console.log(`✅ Asistencia registrada para ${a.dni}`);
                        }
                    );
                }
            });
        });

    }, 1000);
});
