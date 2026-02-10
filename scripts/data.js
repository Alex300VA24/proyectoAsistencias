// URL de la API
const API_URL = 'http://localhost:3000/api';

const docentes = [
    {
        nombre: "Ana Villarroel",
        dni: "18459867",
        horario: [
            { dia: "Lunes", inicio: "07:00", fin: "11:00", curso: "Excel Básico" },
            { dia: "Lunes", inicio: "11:00", fin: "13:00", curso: "Redes 1" },
            { dia: "Lunes", inicio: "17:00", fin: "19:00", curso: "Diseño Gráfico" },
            { dia: "Martes", inicio: "17:00", fin: "17:05", curso: "Diseño Grafico" },
            { dia: "Martes", inicio: "17:05", fin: "18:00", curso: "Inteligencia Artificial 2" },
            { dia: "Miércoles", inicio: "17:15", fin: "18:50", curso: "Base de Datos" },
            { dia: "Miércoles", inicio: "19:00", fin: "20:00", curso: "Compiladores" },
            { dia: "Jueves", inicio: "15:50", fin: "15:55", curso: "PowerPoint Básico" },
            { dia: "Jueves", inicio: "18:20", fin: "21:00", curso: "IA con python" },
            { dia: "Viernes", inicio: "08:00", fin: "10:00", curso: "Diseño Gráfico" },
            { dia: "Viernes", inicio: "16:45", fin: "16:55", curso: "PowerPoint Avanzado" },
            { dia: "Viernes", inicio: "16:55", fin: "17:10", curso: "PowerPoint Básico" }
        ]
    },
    {
        nombre: "Manuel Flores",
        dni: "16758938",
        horario: [
            { dia: "Lunes", inicio: "07:00", fin: "12:00", curso: "Excel Intermedio" },
            { dia: "Martes", inicio: "16:25", fin: "16:31", curso: "Inteligencia Artificial 1" },
            { dia: "Martes", inicio: "16:31", fin: "17:00", curso: "Inteligencia Artificial 2" },
            { dia: "Miércoles", inicio: "18:08", fin: "18:09", curso: "Adrminstracion" },
            { dia: "Miércoles", inicio: "18:10", fin: "19:00", curso: "Office Avanzado" },
            { dia: "Jueves", inicio: "16:50", fin: "16:54", curso: "Inteligencia Artificial" },
            { dia: "Jueves", inicio: "16:55", fin: "16:56", curso: "Reparacion de Celulares" },
            { dia: "Jueves", inicio: "18:30", fin: "19:30", curso: "Desarrollo de IA" },
            { dia: "Viernes", inicio: "08:00", fin: "10:00", curso: "Ensamblaje de Computador" }
        ]
    }
];
