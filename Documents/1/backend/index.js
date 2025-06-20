const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const DB_FILE = './db.json';

// Inicializar archivo de base de datos si no existe
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], attendance: [] }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Registrar usuario
app.post('/users', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  const db = readDB();
  const id = Date.now().toString();
  db.users.push({ id, name });
  writeDB(db);
  res.status(201).json({ id, name });
});

// Eliminar usuario
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.users = db.users.filter(u => u.id !== id);
  db.attendance = db.attendance.filter(a => a.userId !== id);
  writeDB(db);
  res.json({ success: true });
});

// Pasar lista
app.post('/attendance', (req, res) => {
  const { userId, status, date } = req.body;
  if (!userId || !['present', 'late', 'absent'].includes(status)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  const db = readDB();
  const recordDate = date || new Date().toISOString().slice(0, 10);
  db.attendance.push({ userId, status, date: recordDate });
  writeDB(db);
  res.status(201).json({ userId, status, date: recordDate });
});

// Mostrar asistencia
app.get('/attendance', (req, res) => {
  const db = readDB();
  const users = db.users;
  const attendance = db.attendance;
  res.json({ users, attendance });
});

// Ruta para servir index.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`API corriendo en puerto ${PORT}`);
}); 