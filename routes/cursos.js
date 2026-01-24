const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/cursos - Obtener todos los cursos
router.get('/', (req, res) => {
    db.obtenerCursos((err, cursos) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener cursos' });
        }
        res.json(cursos);
    });
});

// GET /api/cursos/:id - Obtener curso por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.obtenerCursoPorId(id, (err, curso) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener curso' });
        }
        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.json(curso);
    });
});

// POST /api/cursos - Crear nuevo curso
router.post('/', (req, res) => {
    const { nombre, hora_inicio, hora_fin, dia, descripcion } = req.body;
    
    if (!nombre || !hora_inicio || !hora_fin || !dia) {
        return res.status(400).json({ error: 'Nombre, horas y día son requeridos' });
    }
    
    // Validar formato de horas
    const regexHora = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regexHora.test(hora_inicio) || !regexHora.test(hora_fin)) {
        return res.status(400).json({ error: 'Formato de hora inválido (HH:MM)' });
    }
    
    db.crearCurso({ nombre, hora_inicio, hora_fin, dia, descripcion }, (err, curso) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'El nombre del curso ya existe' });
            }
            return res.status(500).json({ error: 'Error al crear curso' });
        }
        res.status(201).json(curso);
    });
});

// PUT /api/cursos/:id - Actualizar curso
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, hora_inicio, hora_fin, dia, descripcion } = req.body;
    
    if (!nombre || !hora_inicio || !hora_fin || !dia) {
        return res.status(400).json({ error: 'Nombre, horas y día son requeridos' });
    }
    
    // Validar formato de horas
    const regexHora = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regexHora.test(hora_inicio) || !regexHora.test(hora_fin)) {
        return res.status(400).json({ error: 'Formato de hora inválido (HH:MM)' });
    }
    
    db.actualizarCurso(id, { nombre, hora_inicio, hora_fin, dia, descripcion }, (err, curso) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'El nombre del curso ya existe' });
            }
            return res.status(500).json({ error: 'Error al actualizar curso' });
        }
        res.json(curso);
    });
});

// DELETE /api/cursos/:id - Eliminar curso
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.eliminarCurso(id, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar curso' });
        }
        res.json({ mensaje: 'Curso eliminado correctamente' });
    });
});

module.exports = router;
