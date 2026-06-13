const fs   = require('fs');
const path = require('path');
const sql  = require('mssql');
require('dotenv').config();

const config = {
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  server:   process.env.DB_HOST,
  database: 'master',
  port:     Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000
  }
};

async function initDB() {
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('Conectado a master ✅');

    const script  = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
    const bloques = script.split(/\bGO\b/i).filter(b => b.trim());

    for (const bloque of bloques) {
      if (bloque.trim()) {
        try {
          await pool.request().query(bloque);
        } catch (e) {
          // Ignorar errores de objetos que ya existen
          if (!e.message.includes('already exists') && !e.message.includes('ya existe')) {
            console.warn('Advertencia SQL:', e.message);
          }
        }
      }
    }
    console.log('Base de datos inicializada ✅');
  } catch (err) {
    console.error('Error al inicializar BD:', err.message);
  } finally {
    if (pool) await pool.close();
  }
}

module.exports = initDB;