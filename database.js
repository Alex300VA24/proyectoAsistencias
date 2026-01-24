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

        // Tabla de docentes (modificada con foreign key a cursos)
        db.run(`
            CREATE TABLE IF NOT EXISTS docentes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dni TEXT UNIQUE NOT NULL,
                nombre TEXT NOT NULL,
                curso_id INTEGER,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (curso_id) REFERENCES cursos(id)
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
        `, (err) => {
            if (err) {
                console.error('Error al crear tablas:', err);
            } else {
                console.log('✅ Esquema de base de datos inicializado');
            }
            if (callback) callback(err);
        });
    });
}

// DOCENTES
function obtenerDocentes(callback) {
    db.all(`
        SELECT d.id, d.dni, d.nombre, d.curso_id, c.nombre as curso_nombre, c.hora_inicio, c.hora_fin, c.dia
        FROM docentes d
        LEFT JOIN cursos c ON d.curso_id = c.id
    `, [], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows || []);
    });
}

function obtenerDocentePorDNI(dni, callback) {
    db.get(`
        SELECT d.id, d.dni, d.nombre, d.curso_id, c.nombre as curso_nombre, c.hora_inicio, c.hora_fin, c.dia
        FROM docentes d
        LEFT JOIN cursos c ON d.curso_id = c.id
        WHERE d.dni = ?
    `, [dni], (err, row) => {
        if (err) return callback(err);
        callback(null, row || null);
    });
}

function obtenerDocentePorId(id, callback) {
    db.get(`
        SELECT d.id, d.dni, d.nombre, d.curso_id, c.nombre as curso_nombre, c.hora_inicio, c.hora_fin, c.dia
        FROM docentes d
        LEFT JOIN cursos c ON d.curso_id = c.id
        WHERE d.id = ?
    `, [id], (err, row) => {
        if (err) return callback(err);
        callback(null, row || null);
    });
}

function crearDocente(docente, callback) {
    const { dni, nombre, curso_id } = docente;
    db.run(
        'INSERT INTO docentes (dni, nombre, curso_id) VALUES (?, ?, ?)',
        [dni, nombre, curso_id || null],
        function(err) {
            if (err) return callback(err);
            obtenerDocentePorId(this.lastID, callback);
        }
    );
}

function actualizarDocente(id, docente, callback) {
    const { nombre, curso_id } = docente;
    db.run(
        'UPDATE docentes SET nombre = ?, curso_id = ? WHERE id = ?',
        [nombre, curso_id || null, id],
        function(err) {
            if (err) return callback(err);
            obtenerDocentePorId(id, callback);
        }
    );
}

function eliminarDocente(id, callback) {
    db.run('DELETE FROM docentes WHERE id = ?', [id], callback);
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

module.exports = {
    db,
    obtenerDocentes,
    obtenerDocentePorDNI,
    obtenerDocentePorId,
    crearDocente,
    actualizarDocente,
    eliminarDocente,
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
    eliminarCurso
};
