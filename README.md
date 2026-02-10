# Proyecto Asistencias

Sistema web para control de asistencia docente (Node.js + Express + SQLite).

## Requisitos
- Node.js 14+ (recomendado 16/18)
- npm (viene con Node)

## Instalacion
1. Instalar dependencias
```bash
npm install
```

2. (Opcional) Inicializar la base de datos desde los scripts
```bash
npm run init-db
```

## Ejecucion
```bash
npm start
```

El servidor queda en `http://localhost:3000`.

## Paginas
- Principal: `http://localhost:3000/pages/index.html`
- Panel admin: `http://localhost:3000/pages/admin.html`

## Estructura basica
```
proyectoAsistencias/
  server.js
  database.js
  asistencias.db
  routes/
  pages/
  scripts/
  style/
```

## Scripts npm
- `npm start`: inicia el servidor
- `npm run init-db`: carga/migra datos iniciales

## Notas
- La base de datos SQLite es `asistencias.db`.
- El puerto por defecto es 3000 (configurable en `server.js`).
