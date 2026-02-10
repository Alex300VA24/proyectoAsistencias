const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/docentes - Obtener todos los docentes
router.get('/', (req, res) => {
    db.obtenerDocentes((err, docentes) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener docentes' });
        }
        res.json(docentes);
    });
});

// GET /api/docentes/:id - Obtener docente por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.obtenerDocentePorId(id, (err, docente) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener docente' });
        }
        if (!docente) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }
        res.json(docente);
    });
});

// GET /api/docentes/dni/:dni - Obtener docente por DNI
router.get('/dni/:dni', (req, res) => {
    const { dni } = req.params;
    
    db.obtenerDocentePorDNI(dni, (err, docente) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener docente' });
        }
        if (!docente) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }
        res.json(docente);
    });
});

// POST /api/docentes - Crear nuevo docente
router.post('/', (req, res) => {
    const { dni, nombre, curso_ids } = req.body;
    
    if (!dni || !nombre) {
        return res.status(400).json({ error: 'DNI y nombre son requeridos' });
    }
    
    db.crearDocente({ dni, nombre }, (err, docente) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'El DNI ya existe' });
            }
            return res.status(500).json({ error: 'Error al crear docente' });
        }
        
        // Asignar cursos si se proporcionan
        if (curso_ids && curso_ids.length > 0) {
            db.actualizarCursosDocente(docente.id, curso_ids, (err, docenteActualizado) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al asignar cursos' });
                }
                res.status(201).json(docenteActualizado);
            });
        } else {
            res.status(201).json(docente);
        }
    });
});

// PUT /api/docentes/:id - Actualizar docente
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, curso_ids } = req.body;
    
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    db.actualizarDocente(id, { nombre }, (err, docente) => {
        if (err) {
            return res.status(500).json({ error: 'Error al actualizar docente' });
        }
        
        // Actualizar cursos si se proporcionan
        if (curso_ids !== undefined) {
            db.actualizarCursosDocente(id, curso_ids || [], (err, docenteActualizado) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar cursos' });
                }
                res.json(docenteActualizado);
            });
        } else {
            res.json(docente);
        }
    });
});

// DELETE /api/docentes/:id - Eliminar docente
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.eliminarDocente(id, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar docente' });
        }
        res.json({ mensaje: 'Docente eliminado correctamente' });
    });
});

// POST /api/docentes/:id/cursos - Asignar curso a docente
router.post('/:id/cursos', (req, res) => {
    const { id } = req.params;
    const { curso_id } = req.body;
    
    if (!curso_id) {
        return res.status(400).json({ error: 'curso_id es requerido' });
    }
    
    db.asignarCursoDocente(id, curso_id, (err, docente) => {
        if (err) {
            return res.status(500).json({ error: 'Error al asignar curso' });
        }
        res.json(docente);
    });
});

// DELETE /api/docentes/:id/cursos/:curso_id - Remover curso de docente
router.delete('/:id/cursos/:curso_id', (req, res) => {
    const { id, curso_id } = req.params;
    
    db.removerCursoDocente(id, curso_id, (err, docente) => {
        if (err) {
            return res.status(500).json({ error: 'Error al remover curso' });
        }
        res.json(docente);
    });
});

module.exports = router;
