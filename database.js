const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexión a la base de datos
const dbPath = path.join(__dirname, 'asistencias.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
        initDatabase();
    }
});

// Inicializar esquema de base de datos
function initDatabase(callback) {
    db.serialize(() => {
        // Tabla de cursos con horarios
        db.run(`
            CREATE TABLE IF NOT EXISTS cursos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL UNIQUE,
                hora_inicio TEXT NOT NULL,
                hora_fin TEXT NOT NULL,
                dia TEXT NOT NULL,
                descripcion TEXT,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de docentes (sin foreign key a cursos, relación many-to-many)
        db.run(`
            CREATE TABLE IF NOT EXISTS docentes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dni TEXT UNIQUE NOT NULL,
                nombre TEXT NOT NULL,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de relación many-to-many entre docentes y cursos
        db.run(`
            CREATE TABLE IF NOT EXISTS docente_cursos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                docente_id INTEGER NOT NULL,
                curso_id INTEGER NOT NULL,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(docente_id, curso_id),
                FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE CASCADE,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
            )
        `);

        // Tabla de jornadas activas
        db.run(`
            CREATE TABLE IF NOT EXISTS jornadas_activas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                docente_dni TEXT UNIQUE NOT NULL,
                fecha TEXT NOT NULL,
                dia TEXT NOT NULL,
                entrada TEXT NOT NULL,
                minutos_tarde INTEGER DEFAULT 0,
                FOREIGN KEY (docente_dni) REFERENCES docentes(dni)
            )
        `);

        // Tabla de asistencias
        db.run(`
            CREATE TABLE IF NOT EXISTS asistencias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                docente_dni TEXT NOT NULL,
                fecha TEXT NOT NULL,
                curso_id INTEGER,
                entrada TEXT NOT NULL,
                salida TEXT NOT NULL,
                horas REAL NOT NULL,
                observaciones INTEGER DEFAULT 0,
                entrada_prog TEXT NOT NULL,
                salida_prog TEXT NOT NULL,
                FOREIGN KEY (docente_dni) REFERENCES docentes(dni),
                FOREIGN KEY (curso_id) REFERENCES cursos(id)
            )
        `);

        // Tabla de administradores
        db.run(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error al crear tablas:', err);
            } else {
                // Insertar admin por defecto si no existe
                db.get("SELECT * FROM admins WHERE usuario = 'admin'", (err, row) => {
                    if (!row) {
                        db.run("INSERT INTO admins (usuario, password) VALUES (?, ?)", ['admin', 'admin123']);
                        console.log('✅ Usuario admin creado por defecto (admin/admin123)');
                    }
                });
                console.log('✅ Esquema de base de datos inicializado');
            }
            if (callback) callback(err);
        });
    });
}

// DOCENTES
function obtenerDocentes(callback) {
    db.all(`
        SELECT DISTINCT d.id, d.dni, d.nombre
        FROM docentes d
        ORDER BY d.nombre
    `, [], (err, docentes) => {
        if (err) return callback(err);
        
        // Obtener cursos para cada docente
        let docentesConCursos = [];
        let procesados = 0;
        
        if (docentes.length === 0) {
            return callback(null, []);
        }
        
        docentes.forEach(docente => {
            db.all(`
                SELECT c.id, c.nombre, c.hora_inicio, c.hora_fin, c.dia
                FROM cursos c
                INNER JOIN docente_cursos dc ON c.id = dc.curso_id
                WHERE dc.docente_id = ?
                ORDER BY c.dia, c.hora_inicio
            `, [docente.id], (err, cursos) => {
                docentesConCursos.push({
                    ...docente,
                    cursos: cursos || []
                });
                procesados++;
                
                if (procesados === docentes.length) {
                    callback(null, docentesConCursos);
                }
            });
        });
    });
}

function obtenerDocentePorDNI(dni, callback) {
    db.get(`
        SELECT id, dni, nombre
        FROM docentes
        WHERE dni = ?
    `, [dni], (err, docente) => {
        if (err) return callback(err);
        if (!docente) return callback(null, null);
        
        db.all(`
            SELECT c.id, c.nombre, c.hora_inicio, c.hora_fin, c.dia
            FROM cursos c
            INNER JOIN docente_cursos dc ON c.id = dc.curso_id
            WHERE dc.docente_id = ?
            ORDER BY c.dia, c.hora_inicio
        `, [docente.id], (err, cursos) => {
            if (err) return callback(err);
            callback(null, {
                ...docente,
                cursos: cursos || []
            });
        });
    });
}

function obtenerDocentePorId(id, callback) {
    db.get(`
        SELECT id, dni, nombre
        FROM docentes
        WHERE id = ?
    `, [id], (err, docente) => {
        if (err) return callback(err);
        if (!docente) return callback(null, null);
        
        db.all(`
            SELECT c.id, c.nombre, c.hora_inicio, c.hora_fin, c.dia
            FROM cursos c
            INNER JOIN docente_cursos dc ON c.id = dc.curso_id
            WHERE dc.docente_id = ?
            ORDER BY c.dia, c.hora_inicio
        `, [docente.id], (err, cursos) => {
            if (err) return callback(err);
            callback(null, {
                ...docente,
                cursos: cursos || []
            });
        });
    });
}

function crearDocente(docente, callback) {
    const { dni, nombre } = docente;
    db.run(
        'INSERT INTO docentes (dni, nombre) VALUES (?, ?)',
        [dni, nombre],
        function(err) {
            if (err) return callback(err);
            obtenerDocentePorId(this.lastID, callback);
        }
    );
}

function actualizarDocente(id, docente, callback) {
    const { nombre } = docente;
    db.run(
        'UPDATE docentes SET nombre = ? WHERE id = ?',
        [nombre, id],
        function(err) {
            if (err) return callback(err);
            obtenerDocentePorId(id, callback);
        }
    );
}

function eliminarDocente(id, callback) {
    db.run('DELETE FROM docentes WHERE id = ?', [id], callback);
}

// Agregar curso a docente
function asignarCursoDocente(docente_id, curso_id, callback) {
    db.run(
        'INSERT OR IGNORE INTO docente_cursos (docente_id, curso_id) VALUES (?, ?)',
        [docente_id, curso_id],
        function(err) {
            if (err) return callback(err);
            obtenerDocentePorId(docente_id, callback);
        }
    );
}

// Remover curso de docente
function removerCursoDocente(docente_id, curso_id, callback) {
    db.run(
        'DELETE FROM docente_cursos WHERE docente_id = ? AND curso_id = ?',
        [docente_id, curso_id],
        function(err) {
            if (err) return callback(err);
            obtenerDocentePorId(docente_id, callback);
        }
    );
}

// Actualizar cursos de un docente (remplazo completo)
function actualizarCursosDocente(docente_id, curso_ids, callback) {
    db.run('DELETE FROM docente_cursos WHERE docente_id = ?', [docente_id], (err) => {
        if (err) return callback(err);
        
        if (!curso_ids || curso_ids.length === 0) {
            return obtenerDocentePorId(docente_id, callback);
        }
        
        let insertados = 0;
        curso_ids.forEach(curso_id => {
            db.run(
                'INSERT INTO docente_cursos (docente_id, curso_id) VALUES (?, ?)',
                [docente_id, curso_id],
                function(err) {
                    if (err) console.error(err);
                    insertados++;
                    
                    if (insertados === curso_ids.length) {
                        obtenerDocentePorId(docente_id, callback);
                    }
                }
            );
        });
    });
}

// JORNADAS ACTIVAS
function obtenerJornadaActiva(dni, callback) {
    db.get(
        'SELECT * FROM jornadas_activas WHERE docente_dni = ?',
        [dni],
        callback
    );
}

function crearJornadaActiva(jornada, callback) {
    const { docente_dni, fecha, dia, entrada, minutos_tarde } = jornada;
    db.run(
        'INSERT INTO jornadas_activas (docente_dni, fecha, dia, entrada, minutos_tarde) VALUES (?, ?, ?, ?, ?)',
        [docente_dni, fecha, dia, entrada, minutos_tarde],
        function(err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID, ...jornada });
        }
    );
}

function eliminarJornadaActiva(dni, callback) {
    db.run(
        'DELETE FROM jornadas_activas WHERE docente_dni = ?',
        [dni],
        callback
    );
}

// ASISTENCIAS
function obtenerAsistencias(dni, callback) {
    db.all(
        'SELECT * FROM asistencias WHERE docente_dni = ? ORDER BY fecha DESC',
        [dni],
        callback
    );
}

function crearAsistencia(asistencia, callback) {
    const { docente_dni, fecha, curso_id, entrada, salida, horas, observaciones, entrada_prog, salida_prog } = asistencia;
    db.run(
        `INSERT INTO asistencias 
        (docente_dni, fecha, curso_id, entrada, salida, horas, observaciones, entrada_prog, salida_prog) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [docente_dni, fecha, curso_id, entrada, salida, horas, observaciones, entrada_prog, salida_prog],
        function(err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID, ...asistencia });
        }
    );
}

function eliminarTodasLasAsistencias(callback) {
    db.run('DELETE FROM asistencias', [], callback);
}

function eliminarTodasLasJornadas(callback) {
    db.run('DELETE FROM jornadas_activas', [], callback);
}

// CURSOS
function obtenerCursos(callback) {
    db.all('SELECT * FROM cursos ORDER BY nombre', [], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows || []);
    });
}

function obtenerCursoPorId(id, callback) {
    db.get('SELECT * FROM cursos WHERE id = ?', [id], (err, row) => {
        if (err) return callback(err);
        callback(null, row || null);
    });
}

function crearCurso(curso, callback) {
    const { nombre, hora_inicio, hora_fin, dia, descripcion } = curso;
    db.run(
        'INSERT INTO cursos (nombre, hora_inicio, hora_fin, dia, descripcion) VALUES (?, ?, ?, ?, ?)',
        [nombre, hora_inicio, hora_fin, dia, descripcion || ''],
        function(err) {
            if (err) return callback(err);
            obtenerCursoPorId(this.lastID, callback);
        }
    );
}

function actualizarCurso(id, curso, callback) {
    const { nombre, hora_inicio, hora_fin, dia, descripcion } = curso;
    db.run(
        'UPDATE cursos SET nombre = ?, hora_inicio = ?, hora_fin = ?, dia = ?, descripcion = ? WHERE id = ?',
        [nombre, hora_inicio, hora_fin, dia, descripcion || '', id],
        function(err) {
            if (err) return callback(err);
            obtenerCursoPorId(id, callback);
        }
    );
}

function eliminarCurso(id, callback) {
    db.run('DELETE FROM cursos WHERE id = ?', [id], callback);
}

function verificarAdmin(usuario, password, callback) {
    db.get('SELECT * FROM admins WHERE usuario = ? AND password = ?', [usuario, password], (err, row) => {
        if (err) return callback(err);
        callback(null, row);
    });
}

module.exports = {
    db,
    obtenerDocentes,
    obtenerDocentePorDNI,
    obtenerDocentePorId,
    crearDocente,
    actualizarDocente,
    eliminarDocente,
    asignarCursoDocente,
    removerCursoDocente,
    actualizarCursosDocente,
    obtenerJornadaActiva,
    crearJornadaActiva,
    eliminarJornadaActiva,
    obtenerAsistencias,
    crearAsistencia,
    eliminarTodasLasAsistencias,
    eliminarTodasLasJornadas,
    obtenerCursos,
    obtenerCursoPorId,
    crearCurso,
    actualizarCurso,
    eliminarCurso,
    verificarAdmin
};
