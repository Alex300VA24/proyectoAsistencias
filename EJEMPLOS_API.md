# 🔌 Ejemplos de Uso de la API REST

Base URL: `http://localhost:3000/api`

---

## 📚 DOCENTES

### GET - Obtener todos los docentes
```bash
curl -X GET http://localhost:3000/api/docentes
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "dni": "12345678",
    "nombre": "Juan García",
    "curso_id": 1,
    "curso_nombre": "Matemática Básica",
    "hora_inicio": "08:00",
    "hora_fin": "12:00",
    "dia": "Lunes"
  }
]
```

---

### GET - Obtener docente por ID
```bash
curl -X GET http://localhost:3000/api/docentes/1
```

**Respuesta:**
```json
{
  "id": 1,
  "dni": "12345678",
  "nombre": "Juan García",
  "curso_id": 1,
  "curso_nombre": "Matemática Básica",
  "hora_inicio": "08:00",
  "hora_fin": "12:00",
  "dia": "Lunes"
}
```

---

### GET - Obtener docente por DNI
```bash
curl -X GET http://localhost:3000/api/docentes/dni/12345678
```

**Respuesta:**
```json
{
  "id": 1,
  "dni": "12345678",
  "nombre": "Juan García",
  "curso_id": 1,
  "curso_nombre": "Matemática Básica",
  "hora_inicio": "08:00",
  "hora_fin": "12:00",
  "dia": "Lunes"
}
```

---

### POST - Crear docente
```bash
curl -X POST http://localhost:3000/api/docentes \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "12345678",
    "nombre": "Juan García",
    "curso_id": 1
  }'
```

**Campos:**
- `dni` (required): DNI único
- `nombre` (required): Nombre del docente
- `curso_id` (optional): ID del curso asignado

**Respuesta:**
```json
{
  "id": 1,
  "dni": "12345678",
  "nombre": "Juan García",
  "curso_id": 1,
  "curso_nombre": "Matemática Básica",
  "hora_inicio": "08:00",
  "hora_fin": "12:00",
  "dia": "Lunes"
}
```

---

### PUT - Actualizar docente
```bash
curl -X PUT http://localhost:3000/api/docentes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos García",
    "curso_id": 2
  }'
```

**Campos:**
- `nombre` (required): Nuevo nombre
- `curso_id` (optional): Nuevo curso ID

**Respuesta:**
```json
{
  "id": 1,
  "dni": "12345678",
  "nombre": "Juan Carlos García",
  "curso_id": 2,
  "curso_nombre": "Física Aplicada",
  "hora_inicio": "14:00",
  "hora_fin": "18:00",
  "dia": "Miércoles"
}
```

---

### DELETE - Eliminar docente
```bash
curl -X DELETE http://localhost:3000/api/docentes/1
```

**Respuesta:**
```json
{
  "mensaje": "Docente eliminado correctamente"
}
```

---

## 📖 CURSOS

### GET - Obtener todos los cursos
```bash
curl -X GET http://localhost:3000/api/cursos
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Matemática Básica",
    "hora_inicio": "08:00",
    "hora_fin": "12:00",
    "dia": "Lunes",
    "descripcion": "Curso introductorio de matemática",
    "creado_en": "2026-01-23 10:30:00"
  }
]
```

---

### GET - Obtener curso por ID
```bash
curl -X GET http://localhost:3000/api/cursos/1
```

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Matemática Básica",
  "hora_inicio": "08:00",
  "hora_fin": "12:00",
  "dia": "Lunes",
  "descripcion": "Curso introductorio de matemática",
  "creado_en": "2026-01-23 10:30:00"
}
```

---

### POST - Crear curso
```bash
curl -X POST http://localhost:3000/api/cursos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Matemática Básica",
    "hora_inicio": "08:00",
    "hora_fin": "12:00",
    "dia": "Lunes",
    "descripcion": "Curso introductorio de matemática"
  }'
```

**Campos:**
- `nombre` (required): Nombre único del curso
- `hora_inicio` (required): Hora formato HH:MM
- `hora_fin` (required): Hora formato HH:MM
- `dia` (required): Día de la semana
- `descripcion` (optional): Descripción

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Matemática Básica",
  "hora_inicio": "08:00",
  "hora_fin": "12:00",
  "dia": "Lunes",
  "descripcion": "Curso introductorio de matemática",
  "creado_en": "2026-01-23 10:30:00"
}
```

---

### PUT - Actualizar curso
```bash
curl -X PUT http://localhost:3000/api/cursos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Matemática Avanzada",
    "hora_inicio": "09:00",
    "hora_fin": "13:00",
    "dia": "Martes",
    "descripcion": "Curso avanzado de matemática"
  }'
```

**Campos:**
- `nombre` (required): Nombre único del curso
- `hora_inicio` (required): Hora formato HH:MM
- `hora_fin` (required): Hora formato HH:MM
- `dia` (required): Día de la semana
- `descripcion` (optional): Descripción

**Respuesta:**
```json
{
  "id": 1,
  "nombre": "Matemática Avanzada",
  "hora_inicio": "09:00",
  "hora_fin": "13:00",
  "dia": "Martes",
  "descripcion": "Curso avanzado de matemática",
  "creado_en": "2026-01-23 10:30:00"
}
```

---

### DELETE - Eliminar curso
```bash
curl -X DELETE http://localhost:3000/api/cursos/1
```

**Respuesta:**
```json
{
  "mensaje": "Curso eliminado correctamente"
}
```

---

## 📊 REPORTES

### GET - Descargar reporte Excel
```bash
curl -X GET http://localhost:3000/api/reportes/12345678 \
  --output reporte.xlsx
```

**Parámetro:**
- `:dni`: DNI del docente

**Respuesta:**
- Archivo Excel (.xlsx) con:
  - Información del docente
  - Curso asignado y horarios
  - Registro de asistencias
  - Observaciones de cumplimiento
  - Total de horas trabajadas

---

## 🔍 CÓDIGOS DE ERROR

### 400 Bad Request
```json
{
  "error": "Datos incompletos"
}
```
- Falta algún campo requerido
- Formato inválido

### 404 Not Found
```json
{
  "error": "Docente no encontrado"
}
```
- El recurso no existe

### 409 Conflict
```json
{
  "error": "El DNI ya existe"
}
```
- Violación de restricción UNIQUE
- DNI o nombre duplicado

### 500 Internal Server Error
```json
{
  "error": "Error al crear docente"
}
```
- Error en el servidor

---

## 📝 Ejemplo de Flujo Completo

### 1. Crear un curso
```bash
curl -X POST http://localhost:3000/api/cursos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Inglés Básico",
    "hora_inicio": "10:00",
    "hora_fin": "14:00",
    "dia": "Miércoles",
    "descripcion": "Curso de inglés principiantes"
  }'
```

Respuesta: `id: 5`

---

### 2. Crear un docente asignado a ese curso
```bash
curl -X POST http://localhost:3000/api/docentes \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "98765432",
    "nombre": "María López",
    "curso_id": 5
  }'
```

Respuesta: docente creado

---

### 3. Actualizar el docente
```bash
curl -X PUT http://localhost:3000/api/docentes/2 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María Elena López",
    "curso_id": 5
  }'
```

Respuesta: docente actualizado

---

### 4. Descargar reporte
```bash
curl -X GET http://localhost:3000/api/reportes/98765432 \
  --output reporte_maria.xlsx
```

Resultado: Excel descargado

---

### 5. Eliminar docente
```bash
curl -X DELETE http://localhost:3000/api/docentes/2
```

Respuesta: docente eliminado

---

## 🧪 Prueba Rápida con JavaScript

```javascript
// Obtener todos los docentes
fetch('http://localhost:3000/api/docentes')
  .then(res => res.json())
  .then(data => console.log(data));

// Crear docente
fetch('http://localhost:3000/api/docentes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dni: '12345678',
    nombre: 'Nuevo Docente',
    curso_id: 1
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Actualizar docente
fetch('http://localhost:3000/api/docentes/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Nombre Actualizado',
    curso_id: 2
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Eliminar docente
fetch('http://localhost:3000/api/docentes/1', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## ✅ Headers Recomendados

Para todas las requests (excepto GET):
```
Content-Type: application/json
```

---

## 🚀 Tips

1. **DNI único**: Cada docente debe tener un DNI diferente
2. **Formato de hora**: Siempre usar HH:MM (24 horas)
3. **Días válidos**: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado
4. **Curso_id opcional**: Docente sin curso asignado está permitido
5. **Foreign keys**: Asegúrate que el curso_id existe antes de asignar

