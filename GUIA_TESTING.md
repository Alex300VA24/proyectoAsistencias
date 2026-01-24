# 🧪 GUÍA DE TESTING - SISTEMA DE ASISTENCIA

## ✅ Verificación Rápida del Sistema

### 1. Inicio del Servidor

```bash
cd proyectoAsistencias
npm start
```

**Resultado esperado:**
```
🚀 Servidor iniciado en http://localhost:3000
📂 Accede a la aplicación en http://localhost:3000/pages/index.html
📊 Panel admin en http://localhost:3000/pages/admin.html
✅ Conectado a la base de datos SQLite
✅ Esquema de base de datos inicializado
```

### 2. Migración de Datos

```bash
# En otra terminal
node migrate-data.js
```

**Resultado esperado:**
```
✅ Curso creado: Excel Básico
✅ Curso creado: Base de Datos
...
✅ Docente creado: Ana Villarroel (DNI: 18459867)
✅ Docente creado: Manuel Flores (DNI: 16758938)

==================================================
✨ ¡Migración de datos completada!
==================================================
📊 Resumen Total:
   - Cursos: 12
   - Docentes: 2
```

---

## 🧪 Tests Funcionales

### Test 1: Gestión de Cursos ✅

**Acceder a:** http://localhost:3000/pages/admin.html
**Pestaña:** Cursos

#### 1.1 Crear Curso
```
Nombre: "Python Avanzado"
Día: Martes
Hora Inicio: 09:00
Hora Fin: 11:30
Descripción: "Curso de Python nivel avanzado"
```
**Resultado:** ✅ Curso aparece en tabla

#### 1.2 Editar Curso
```
Seleccionar cualquier curso → Editar
Cambiar nombre: "Python Avanzado v2"
```
**Resultado:** ✅ Cambios guardados en tabla

#### 1.3 Eliminar Curso
```
Seleccionar "Python Avanzado v2" → Eliminar
Confirmar eliminación
```
**Resultado:** ✅ Curso desaparece de tabla

---

### Test 2: Gestión de Docentes ✅

**Pestaña:** Docentes

#### 2.1 Crear Docente
```
DNI: "12345678"
Nombre: "Juan Pérez"
Curso: "Python Avanzado"
```
**Resultado:** ✅ Docente aparece en tabla con curso asignado

#### 2.2 Verificar Datos
**Esperado:**
```
DNI: 12345678
Nombre: Juan Pérez
Curso: Python Avanzado
Horario: Python Avanzado (09:00 - 11:30)
```

#### 2.3 Editar Docente
```
Seleccionar "Juan Pérez" → Editar
Cambiar curso: "Diseño Gráfico"
```
**Resultado:** ✅ Curso actualizado en tabla

#### 2.4 Eliminar Docente
```
Seleccionar "Juan Pérez" → Eliminar
Confirmar eliminación
```
**Resultado:** ✅ Docente desaparece de tabla

---

### Test 3: Validaciones ✅

#### 3.1 DNI Duplicado (Docentes)
```
Intentar crear docente con DNI existente
```
**Resultado:** ❌ Error: "El DNI ya existe"

#### 3.2 Nombre Curso Duplicado (Cursos)
```
Intentar crear curso con nombre existente
```
**Resultado:** ❌ Error: "El nombre del curso ya existe"

#### 3.3 Formato Hora Inválido
```
Hora Inicio: "25:99"
```
**Resultado:** ❌ Error: "Formato de hora inválido (HH:MM)"

#### 3.4 Campos Requeridos
```
Dejar campos vacíos e intentar guardar
```
**Resultado:** ❌ Error de validación

---

### Test 4: API REST ✅

**Base URL:** http://localhost:3000/api

#### 4.1 Obtener Docentes
```bash
curl http://localhost:3000/api/docentes
```
**Resultado:** 
```json
[
  {
    "id": 1,
    "dni": "18459867",
    "nombre": "Ana Villarroel",
    "curso_id": 10,
    "curso_nombre": "Diseño Gráfico",
    "hora_inicio": "08:00",
    "hora_fin": "10:00",
    "dia": "Viernes"
  },
  ...
]
```

#### 4.2 Obtener Cursos
```bash
curl http://localhost:3000/api/cursos
```
**Resultado:** Lista de 12 cursos con todos los detalles

#### 4.3 Crear Docente (POST)
```bash
curl -X POST http://localhost:3000/api/docentes \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "87654321",
    "nombre": "Carlos López",
    "curso_id": 5
  }'
```
**Resultado:** ✅ Docente creado con ID retornado

#### 4.4 Actualizar Docente (PUT)
```bash
curl -X PUT http://localhost:3000/api/docentes/3 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos López Actualizado",
    "curso_id": 7
  }'
```
**Resultado:** ✅ Docente actualizado

#### 4.5 Eliminar Docente (DELETE)
```bash
curl -X DELETE http://localhost:3000/api/docentes/3
```
**Resultado:** ✅ Docente eliminado

---

### Test 5: Reportes Excel ✅

**Pestaña:** Reportes

#### 5.1 Generar Reporte
```
Click en botón "Descargar" de cualquier docente
```
**Resultado:** 
- ✅ Se descarga archivo Excel: `Reporte_NombreDocente.xlsx`
- ✅ Archivo abre correctamente en Excel

#### 5.2 Verificar Contenido del Excel
```
Abrir archivo descargado
```
**Verificar:**
- ✅ Encabezado con nombre del instituto
- ✅ Información del docente (nombre, DNI, curso)
- ✅ Horarios programados (entrada, salida)
- ✅ Tabla de asistencias (si existen registros)
- ✅ Cálculo de total de horas
- ✅ Diseño profesional con colores

#### 5.3 Verificar Formatos
```
Revisar:
- Encabezados azul oscuro
- Datos con filas alternas (blanco/gris claro)
- Total en fila destacada
- Iconos de estado (✅, ⚠️, ❌)
- Bordes y estilos aplicados
```
**Resultado:** ✅ Todo con formato profesional

---

### Test 6: Interfaz UI/UX ✅

#### 6.1 Pestañas
```
Click en cada pestaña (Docentes, Cursos, Reportes)
```
**Resultado:** ✅ Contenido cambia sin recargar página

#### 6.2 Modales
```
Click en "Agregar Docente"
```
**Verificar:**
- ✅ Modal aparece centrado
- ✅ Fondo oscuro (overlay)
- ✅ Botón cerrar (X) funciona
- ✅ Click fuera cierra modal

#### 6.3 Tablas
```
Hover sobre filas de tabla
```
**Resultado:** 
- ✅ Fila se destaca con fondo gris
- ✅ Botones de acción visibles

#### 6.4 Alertas
```
Intentar eliminar un docente
```
**Resultado:** 
- ✅ SweetAlert modal aparece
- ✅ Permite confirmar o cancelar
- ✅ Acciones se ejecutan correctamente

---

## 🐛 Checklist de Errores Comunes

- [ ] ¿El servidor inicia sin errores?
- [ ] ¿La BD se crea correctamente?
- [ ] ¿Los datos iniciales se cargan?
- [ ] ¿Se pueden crear cursos?
- [ ] ¿Se pueden crear docentes?
- [ ] ¿Los docentes se asignan a cursos?
- [ ] ¿Se generan reportes Excel?
- [ ] ¿Las validaciones funcionan?
- [ ] ¿Los estilos se aplican correctamente?
- [ ] ¿Los modales funcionan?

---

## 📊 Datos de Prueba Disponibles

### Docentes Pre-cargados:
- **Ana Villarroel** (DNI: 18459867) → Curso: Diseño Gráfico
- **Manuel Flores** (DNI: 16758938) → Curso: Ensamblaje de Computador

### Cursos Pre-cargados:
1. Excel Básico (Lunes 07:00 - 11:00)
2. Redes 1 (Lunes 11:00 - 13:00)
3. Diseño Gráfico (Viernes 08:00 - 10:00)
4. Inteligencia Artificial 2 (Martes 17:05 - 18:00)
5. Base de Datos (Miércoles 17:15 - 18:50)
6. Compiladores (Miércoles 19:00 - 20:00)
7. IA con Python (Jueves 18:20 - 21:00)
8. Excel Intermedio (Lunes 07:00 - 12:00)
9. Inteligencia Artificial 1 (Martes 16:25 - 16:31)
10. Office Avanzado (Miércoles 18:10 - 19:00)
11. Desarrollo de IA (Jueves 18:30 - 19:30)
12. Ensamblaje de Computador (Viernes 08:00 - 10:00)

---

## 🎯 Resultado Final

Cuando todos los tests pasen:
✅ Sistema completamente funcional
✅ CRUD docentes implementado
✅ CRUD cursos implementado
✅ Reportes Excel generándose
✅ Interfaz responsive y moderna
✅ Validaciones en lugar

**El sistema está listo para producción.**

---

*Generado: Enero 2026*
