# 🚀 GUÍA RÁPIDA - Sistema de Control de Asistencia

## ¿Cómo empezar?

### 1️⃣ Iniciar el servidor
```bash
npm start
```
El servidor estará listo en `http://localhost:3000`

---

## 📝 PRIMEROS PASOS

### Paso 1: Crear Cursos
1. Abre `http://localhost:3000/pages/admin.html`
2. Ve a la pestaña **"Cursos"**
3. Haz clic en **"Agregar Curso"**
4. Completa los datos:
   - **Nombre**: Ej: "Matemática Básica"
   - **Día**: Selecciona el día de la semana
   - **Hora Inicio**: Ej: 08:00
   - **Hora Fin**: Ej: 12:00
   - **Descripción**: Opcional
5. Haz clic en **"Guardar"**

✅ *Puedes crear varios cursos con diferentes días y horarios*

---

### Paso 2: Crear Docentes
1. Ve a la pestaña **"Docentes"**
2. Haz clic en **"Agregar Docente"**
3. Completa los datos:
   - **DNI**: Ej: 12345678
   - **Nombre**: Ej: "Juan García"
   - **Curso**: Selecciona uno de los cursos creados
4. Haz clic en **"Guardar"**

✅ *Ahora el docente tiene asignado un curso con su horario*

---

### Paso 3: Editar Docentes o Cursos
1. Busca la fila en la tabla
2. Haz clic en el botón **"Editar"** (lápiz azul)
3. Modifica los datos
4. Haz clic en **"Guardar"**

✅ *Los cambios se actualizan inmediatamente*

---

### Paso 4: Eliminar Docentes o Cursos
1. Busca la fila en la tabla
2. Haz clic en el botón **"Eliminar"** (papelera roja)
3. Confirma la acción en el modal

⚠️ *Esto no se puede deshacer*

---

### Paso 5: Descargar Reportes
1. Ve a la pestaña **"Reportes"**
2. Verás un listado con todos los docentes
3. Haz clic en **"Descargar"** para obtener un Excel

📊 *El reporte incluye:*
- Información del docente y su curso
- Horarios asignados
- Registro de asistencias
- Total de horas trabajadas
- Observaciones de cumplimiento

---

## 🗑️ Borrar Todo el Historial

En la pestaña **"Reportes"**, hay un botón de:
**"Borrar Todo el Historial"**

⚠️ *Esto elimina TODAS las asistencias registradas*

---

## 📱 Características Principales

| Función | Ubicación | Acción |
|---------|-----------|--------|
| Crear Docente | Tab "Docentes" | "Agregar Docente" |
| Editar Docente | Tab "Docentes" | Click "Editar" |
| Eliminar Docente | Tab "Docentes" | Click "Eliminar" |
| Crear Curso | Tab "Cursos" | "Agregar Curso" |
| Editar Curso | Tab "Cursos" | Click "Editar" |
| Eliminar Curso | Tab "Cursos" | Click "Eliminar" |
| Descargar Reporte | Tab "Reportes" | Click "Descargar" |

---

## 🎯 Flujo de Trabajo Recomendado

```
1. Crear Cursos → 2. Crear Docentes → 3. Registrar Asistencias → 4. Descargar Reportes
```

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo cambiar el horario de un docente después de crearlo?**
R: Sí, edita el docente y selecciona otro curso con diferente horario.

**P: ¿Qué pasa si elimino un curso que tiene docentes asignados?**
R: Los docentes se quedarán sin curso asignado, pero no se eliminarán.

**P: ¿Se puede descargar el reporte sin asistencias registradas?**
R: No, el sistema mostrará un error si no hay registros de asistencia.

**P: ¿En qué formato se descarga el reporte?**
R: En formato Excel (.xlsx) con estilos profesionales y cálculos automáticos.

---

## 🔧 Campos Obligatorios

### Para Docentes:
- ✅ DNI (único)
- ✅ Nombre
- ⭕ Curso (opcional)

### Para Cursos:
- ✅ Nombre (único)
- ✅ Día de la semana
- ✅ Hora Inicio (formato HH:MM)
- ✅ Hora Fin (formato HH:MM)
- ⭕ Descripción (opcional)

---

## 💡 Tips y Trucos

1. **Nombres únicos para cursos**: Usa nombres descriptivos como "Matemática 4to A"
2. **Diferentes horarios**: Puedes tener múltiples cursos en el mismo día con diferentes horas
3. **Edición rápida**: Haz clic en cualquier fila, se abrirá un modal para editar
4. **Confirmaciones**: Siempre confirma antes de eliminar datos importantes

---

## 🆘 Soporte

Si tienes problemas:
1. Recarga la página (F5)
2. Verifica que el servidor esté corriendo
3. Revisa la consola del navegador (F12) para mensajes de error
4. Contacta al administrador del sistema

---

**¡Bienvenido al Sistema de Control de Asistencia! 🎓**
