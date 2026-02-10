const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Servir archivos estáticos

// Importar rutas
const docentesRoutes = require('./routes/docentes');
const jornadasRoutes = require('./routes/jornadas');
const asistenciasRoutes = require('./routes/asistencias');
const reportesRoutes = require('./routes/reportes');
const cursosRoutes = require('./routes/cursos');
const authRoutes = require('./routes/auth');

// Usar rutas
app.use('/api/docentes', docentesRoutes);
app.use('/api/jornadas', jornadasRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/auth', authRoutes);

// Ruta raíz - redirigir a index.html
app.get('/', (req, res) => {
    res.redirect('/pages/index.html');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`📂 Accede a la aplicación en http://localhost:${PORT}/pages/index.html`);
    console.log(`📊 Panel admin en http://localhost:${PORT}/pages/admin.html\n`);
});
