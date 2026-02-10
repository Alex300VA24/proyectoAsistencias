const express = require('express');
const router = express.Router();
const db = require('../database');

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    
    if (!usuario || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    db.verificarAdmin(usuario, password, (err, admin) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (!admin) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Login exitoso
        res.json({ 
            success: true, 
            message: 'Login exitoso',
            admin: {
                id: admin.id,
                usuario: admin.usuario
            }
        });
    });
});

module.exports = router;