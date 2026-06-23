const fs   = require('fs');
const path = require('path');
const { poolPromise } = require('./db');

async function initDB() {
  try {
    const pool   = await poolPromise;
    const script = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
    const bloques = script.split(/\bGO\b/i).filter(b => b.trim());
    for (const bloque of bloques) {
      if (bloque.trim()) await pool.request().query(bloque);
    }
    console.log('Base de datos inicializada ✅');
  } catch (err) {
    console.error('Error al inicializar BD:', err.message);
  }
}

module.exports = initDB;