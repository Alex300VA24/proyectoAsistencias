const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const db = require('../database');

// GET /api/reportes/:dni - Generar y descargar reporte Excel profesional
router.get('/:dni', async (req, res) => {
    const { dni } = req.params;
    
    // Obtener docente
    db.obtenerDocentePorDNI(dni, async (err, docente) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener docente' });
        }
        if (!docente) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }
        
        // Obtener asistencias
        db.obtenerAsistencias(dni, async (err, asistencias) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener asistencias' });
            }
            
            if (asistencias.length === 0) {
                return res.status(404).json({ error: 'No hay registros de asistencia' });
            }
            
            try {
                // Crear libro de Excel
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Reporte de Asistencia', {
                    pageSetup: { paperSize: 9, orientation: 'landscape' }
                });
                
                // ===== ENCABEZADO =====
                worksheet.mergeCells('A1:H1');
                const titleRow = worksheet.getCell('A1');
                titleRow.value = 'Instituto Leonardo Da Vinci';
                titleRow.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF1E40AF' } };
                titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
                titleRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E7FF' }
                };
                worksheet.getRow(1).height = 30;
                
                worksheet.mergeCells('A2:H2');
                const subtitleRow = worksheet.getCell('A2');
                subtitleRow.value = 'Reporte de Asistencia Docente';
                subtitleRow.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF374151' } };
                subtitleRow.alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getRow(2).height = 25;
                
                // Información del docente
                worksheet.mergeCells('A3:H3');
                const docenteRow = worksheet.getCell('A3');
                docenteRow.value = `Docente: ${docente.nombre}`;
                docenteRow.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF1F2937' } };
                docenteRow.alignment = { vertical: 'middle', horizontal: 'left' };
                worksheet.getRow(3).height = 20;
                
                // Información del DNI
                worksheet.mergeCells('A4:H4');
                const dniRow = worksheet.getCell('A4');
                dniRow.value = `DNI: ${docente.dni}`;
                dniRow.font = { name: 'Arial', size: 11, color: { argb: 'FF4B5563' } };
                dniRow.alignment = { vertical: 'middle', horizontal: 'left' };
                
                // Información del curso asignado
                worksheet.mergeCells('A5:H5');
                const cursoRow = worksheet.getCell('A5');
                const cursoInfo = docente.curso_nombre 
                    ? `Curso: ${docente.curso_nombre} (${docente.hora_inicio} - ${docente.hora_fin}, ${docente.dia})`
                    : 'Curso: Sin asignar';
                cursoRow.value = cursoInfo;
                cursoRow.font = { name: 'Arial', size: 11, color: { argb: 'FF4B5563' } };
                cursoRow.alignment = { vertical: 'middle', horizontal: 'left' };
                
                // Fila vacía
                worksheet.addRow([]);
                
                // ===== CABECERAS DE TABLA =====
                const headerRow = worksheet.addRow([
                    'Fecha',
                    'Curso',
                    'Entrada',
                    'Salida',
                    'Horas Trabajadas',
                    'Hora Programada Entrada',
                    'Hora Programada Salida',
                    'Observaciones'
                ]);
                
                headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
                headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                headerRow.height = 30;
                
                // Estilo de cabecera
                headerRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF1E40AF' }
                    };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    };
                });
                
                // ===== DATOS =====
                let totalHoras = 0;
                let rowIndex = 8;
                
                asistencias.forEach((registro) => {
                    // Generar observación técnica
                    let observacion = '';
                    let observacionColor = 'FF10B981'; // Verde por defecto (OK)
                    
                    if (registro.entrada > registro.entrada_prog && registro.salida < registro.salida_prog) {
                        observacion = '⚠️ Entró tarde y salió antes';
                        observacionColor = 'FFEF4444'; // Rojo
                    } else if (registro.entrada > registro.entrada_prog) {
                        observacion = '⚠️ Entró tarde';
                        observacionColor = 'FFF59E0B'; // Amarillo/Naranja
                    } else if (registro.salida < registro.salida_prog) {
                        observacion = '⚠️ Salió antes';
                        observacionColor = 'FFF59E0B'; // Amarillo/Naranja
                    } else {
                        observacion = '✅ Dentro de horario';
                    }
                    
                    const dataRow = worksheet.addRow([
                        registro.fecha,
                        registro.curso || '-',
                        registro.entrada,
                        registro.salida,
                        Number(registro.horas).toFixed(2),
                        registro.entrada_prog,
                        registro.salida_prog,
                        observacion
                    ]);
                    
                    // Estilo de fila (alternar colores)
                    const isEvenRow = rowIndex % 2 === 0;
                    dataRow.height = 20;
                    dataRow.eachCell((cell, colNumber) => {
                        cell.font = { name: 'Arial', size: 10 };
                        cell.alignment = { vertical: 'middle', horizontal: colNumber === 8 ? 'left' : 'center' };
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: isEvenRow ? 'FFFFFFFF' : 'FFF9FAFB' }
                        };
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                        };
                        
                        // Color especial para observaciones
                        if (colNumber === 8) {
                            cell.font = { ...cell.font, color: { argb: observacionColor }, bold: true };
                        }
                    });
                    
                    totalHoras += parseFloat(registro.horas);
                    rowIndex++;
                });
                
                // ===== FILA DE TOTAL =====
                worksheet.addRow([]);
                const totalRow = worksheet.addRow([
                    '', '', '', '', 'TOTAL HORAS:', totalHoras.toFixed(2), '', ''
                ]);
                
                totalRow.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF1F2937' } };
                totalRow.alignment = { vertical: 'middle', horizontal: 'center' };
                totalRow.height = 25;
                
                // Estilo de fila total
                totalRow.eachCell((cell, colNumber) => {
                    if (colNumber >= 5 && colNumber <= 6) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFDBEAFE' }
                        };
                        cell.border = {
                            top: { style: 'double', color: { argb: 'FF1E40AF' } },
                            left: { style: 'thin', color: { argb: 'FF1E40AF' } },
                            bottom: { style: 'double', color: { argb: 'FF1E40AF' } },
                            right: { style: 'thin', color: { argb: 'FF1E40AF' } }
                        };
                    }
                });
                
                // ===== ANCHOS DE COLUMNA =====
                worksheet.getColumn(1).width = 14;  // Fecha
                worksheet.getColumn(2).width = 20;  // Curso
                worksheet.getColumn(3).width = 12;  // Entrada
                worksheet.getColumn(4).width = 12;  // Salida
                worksheet.getColumn(5).width = 18;  // Horas
                worksheet.getColumn(6).width = 18;  // Hora Prog Entrada
                worksheet.getColumn(7).width = 18;  // Hora Prog Salida
                worksheet.getColumn(8).width = 30;  // Observaciones
                
                // ===== ENVIAR ARCHIVO =====
                res.setHeader(
                    'Content-Type',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                res.setHeader(
                    'Content-Disposition',
                    `attachment; filename=Reporte_${docente.nombre.replace(/\s/g, '_')}.xlsx`
                );
                
                await workbook.xlsx.write(res);
                res.end();
                
            } catch (error) {
                console.error('Error al generar Excel:', error);
                res.status(500).json({ error: 'Error al generar reporte Excel' });
            }
        });
    });
});

module.exports = router;
