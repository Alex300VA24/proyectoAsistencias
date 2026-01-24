# Sistema de Control de Asistencia Docente
## Instituto Leonardo Da Vinci

Un sistema web completo para gestionar la asistencia de docentes, con control de horarios, reportes en Excel y panel administrativo profesional.

---

## ✨ Características Principales

### 📋 Gestión de Docentes
- ✅ Crear docentes con DNI único
- ✅ Asignar/actualizar horarios (cursos)
- ✅ Eliminar docentes
- ✅ Editar información de docentes

### 📚 Gestión de Cursos
- ✅ Crear cursos con horarios específicos
- ✅ Definir día y hora de inicio/fin
- ✅ Agregar descripción de cursos
- ✅ Editar y eliminar cursos
- ✅ Los docentes se asignan a cursos (relación por foreign key)

### 📊 Reportes
- ✅ Generar reportes en Excel automáticamente
- ✅ Incluir información del docente, curso y horarios
- ✅ Mostrar asistencias con hora real vs programada
- ✅ Cálculo total de horas trabajadas
- ✅ Indicadores visuales de alertas (entradas tarde, salidas antes)

### 🎯 Panel Administrativo
- ✅ Interfaz intuitiva con pestañas
- ✅ Tablas interactivas con acciones
- ✅ Modales para crear/editar
- ✅ Confirmaciones de eliminación
- ✅ Gestión completa desde una única página

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `cursos`
```sql
CREATE TABLE cursos (
    id INTEGER PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    dia TEXT NOT NULL,
    descripcion TEXT,
    creado_en DATETIME
)
```

### Tabla: `docentes`
```sql
CREATE TABLE docentes (
    id INTEGER PRIMARY KEY,
    dni TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    curso_id INTEGER,
    creado_en DATETIME,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
)
```

### Tabla: `asistencias`
```sql
CREATE TABLE asistencias (
    id INTEGER PRIMARY KEY,
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
```

### Tabla: `jornadas_activas`
```sql
CREATE TABLE jornadas_activas (
    id INTEGER PRIMARY KEY,
    docente_dni TEXT UNIQUE NOT NULL,
    fecha TEXT NOT NULL,
    dia TEXT NOT NULL,
    entrada TEXT NOT NULL,
    minutos_tarde INTEGER DEFAULT 0,
    FOREIGN KEY (docente_dni) REFERENCES docentes(dni)
)
```

---

## 🚀 API REST Endpoints

### Docentes
- `GET /api/docentes` - Obtener todos los docentes
- `GET /api/docentes/:id` - Obtener docente por ID
- `GET /api/docentes/dni/:dni` - Obtener docente por DNI
- `POST /api/docentes` - Crear nuevo docente
- `PUT /api/docentes/:id` - Actualizar docente
- `DELETE /api/docentes/:id` - Eliminar docente

### Cursos
- `GET /api/cursos` - Obtener todos los cursos
- `GET /api/cursos/:id` - Obtener curso por ID
- `POST /api/cursos` - Crear nuevo curso
- `PUT /api/cursos/:id` - Actualizar curso
- `DELETE /api/cursos/:id` - Eliminar curso

### Reportes
- `GET /api/reportes/:dni` - Generar Excel del docente

---

## 📦 Instalación y Configuración

### Requisitos
- Node.js v14+
- npm o yarn

### Instalación
```bash
# 1. Clonar o descargar el proyecto
cd proyectoAsistencias

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor
npm start
```

El servidor estará disponible en `http://localhost:3000`

---

## 🎯 Uso del Panel Administrativo

### Acceder al Panel
1. Abre tu navegador en `http://localhost:3000/pages/admin.html`
2. Verás tres pestañas: Docentes, Cursos y Reportes

### Pestaña de Docentes
1. Haz clic en "Agregar Docente"
2. Completa los datos:
   - **DNI**: Número único del docente
   - **Nombre**: Nombre completo
   - **Curso**: Selecciona un curso (opcional)
3. Haz clic en "Guardar"
4. Para editar: Haz clic en el botón "Editar" de la fila
5. Para eliminar: Haz clic en "Eliminar" y confirma

### Pestaña de Cursos
1. Haz clic en "Agregar Curso"
2. Completa los datos:
   - **Nombre del Curso**: Nombre único
   - **Día de la Semana**: Selecciona día
   - **Hora Inicio**: Formato HH:MM (ej: 08:00)
   - **Hora Fin**: Formato HH:MM (ej: 12:00)
   - **Descripción**: Información adicional (opcional)
3. Haz clic en "Guardar"
4. Los cursos pueden ser editados o eliminados igual que los docentes

### Pestaña de Reportes
1. Verás listado de todos los docentes
2. Haz clic en "Descargar" para generar un Excel con:
   - Información del docente
   - Curso asignado y horarios
   - Registro de asistencias
   - Total de horas trabajadas
   - Observaciones de cumplimiento de horarios

---

## 📋 Estructura del Proyecto

```
proyectoAsistencias/
├── database.js              # Conexión y funciones de BD
├── server.js                # Configuración del servidor
├── package.json             # Dependencias del proyecto
├── pages/
│   ├── admin.html          # Panel administrativo
│   └── index.html          # Página principal
├── routes/
│   ├── docentes.js         # API de docentes
│   ├── cursos.js           # API de cursos
│   ├── jornadas.js         # API de jornadas
│   ├── asistencias.js      # API de asistencias
│   └── reportes.js         # Generador de reportes Excel
├── scripts/
│   ├── admin.js            # Lógica del panel admin
│   ├── app.js              # Lógica principal
│   └── data.js             # Configuración API
├── style/
│   └── style.css           # Estilos globales
└── asistencias.db          # Base de datos SQLite
```

---

## 🔧 Configuración Técnica

### Dependencias
- **express**: Framework web
- **sqlite3**: Base de datos
- **exceljs**: Generación de reportes Excel
- **cors**: Control de acceso

### Variables de Configuración
- **Puerto**: 3000 (configurable en server.js)
- **Base de Datos**: asistencias.db (SQLite)
- **API_URL**: http://localhost:3000/api (definida en scripts/data.js)

---

## 🎨 Características del UI/UX

### Panel Administrativo
- ✅ Diseño responsive
- ✅ Interfaz moderna con colores del instituto
- ✅ Tablas interactivas con hover
- ✅ Modales elegantes
- ✅ Alertas y confirmaciones con SweetAlert2
- ✅ Iconos FontAwesome
- ✅ Fuente Google Fonts (Inter)

### Reportes Excel
- ✅ Encabezados profesionales
- ✅ Datos tabulados con estilos
- ✅ Códigos de color por estado
- ✅ Cálculos automáticos
- ✅ Formato optimizado para impresión

---

## ⚠️ Validaciones

### Docentes
- DNI único (no puede repetirse)
- Nombre requerido
- Validación de curso asignado

### Cursos
- Nombre único
- Formato de hora: HH:MM válido
- Todos los campos de horario requeridos
- Día de semana válido

---

## 📧 Soporte

Para consultas o problemas, contacta al administrador del instituto.

---

## 📅 Versión
**v2.0** - Sistema mejorado con gestión completa de cursos y horarios

---

*© 2026 Instituto Leonardo Da Vinci - Sistema de Control de Asistencia*

