const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/jornadas/:dni - Obtener jornada activa de un docente
router.get('/:dni', (req, res) => {
    const { dni } = req.params;
    
    db.obtenerJornadaActiva(dni, (err, jornada) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener jornada' });
        }
        res.json(jornada || null);
    });
});

// POST /api/jornadas - Crear nueva jornada (marcar entrada)
router.post('/', (req, res) => {
    const { docente_dni, fecha, dia, entrada, minutos_tarde } = req.body;
    
    if (!docente_dni || !fecha || !dia || !entrada) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    
    db.crearJornadaActiva(
        { docente_dni, fecha, dia, entrada, minutos_tarde: minutos_tarde || 0 },
        (err, jornada) => {
            if (err) {
                return res.status(500).json({ error: 'Error al crear jornada' });
            }
            res.status(201).json(jornada);
        }
    );
});

// DELETE /api/jornadas/:dni - Eliminar jornada activa (al marcar salida)
router.delete('/:dni', (req, res) => {
    const { dni } = req.params;
    
    db.eliminarJornadaActiva(dni, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar jornada' });
        }
        res.json({ message: 'Jornada eliminada correctamente' });
    });
});

module.exports = router;
