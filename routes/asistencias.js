const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/asistencias/:dni - Obtener historial de asistencias
router.get('/:dni', (req, res) => {
    const { dni } = req.params;
    
    db.obtenerAsistencias(dni, (err, asistencias) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener asistencias' });
        }
        res.json(asistencias);
    });
});

// POST /api/asistencias - Registrar asistencia(s) (al marcar salida)
router.post('/', (req, res) => {
    const asistencias = req.body; // Puede ser array o objeto único
    
    const asistenciasArray = Array.isArray(asistencias) ? asistencias : [asistencias];
    
    let completed = 0;
    const errors = [];
    
    asistenciasArray.forEach((asistencia, index) => {
        const { docente_dni, fecha, curso, entrada, salida, horas, observaciones, entrada_prog, salida_prog } = asistencia;
        
        if (!docente_dni || !fecha || !curso || !entrada || !salida || horas === undefined) {
            errors.push({ index, error: 'Datos incompletos' });
            completed++;
            return;
        }
        
        db.crearAsistencia(
            { 
                docente_dni, 
                fecha, 
                curso, 
                entrada, 
                salida, 
                horas, 
                observaciones: observaciones || 0,
                entrada_prog: entrada_prog || entrada,
                salida_prog: salida_prog || salida
            },
            (err, result) => {
                if (err) {
                    errors.push({ index, error: err.message });
                }
                completed++;
                
                // Cuando se completen todas
                if (completed === asistenciasArray.length) {
                    if (errors.length > 0) {
                        return res.status(500).json({ 
                            error: 'Error al registrar algunas asistencias',
                            details: errors
                        });
                    }
                    res.status(201).json({ 
                        message: 'Asistencias registradas correctamente',
                        count: asistenciasArray.length
                    });
                }
            }
        );
    });
});

// DELETE /api/asistencias - Borrar todo el historial
router.delete('/', (req, res) => {
    db.eliminarTodasLasAsistencias((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al eliminar asistencias' });
        }
        
        // También limpiar jornadas activas
        db.eliminarTodasLasJornadas((err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar jornadas' });
            }
            res.json({ message: 'Historial eliminado correctamente' });
        });
    });
});

module.exports = router;
