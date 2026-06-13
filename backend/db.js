const sql = require('mssql');
require('dotenv').config();

const config = {
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  server:   process.env.DB_HOST,
  database: 'TiendaAbarrotes',
  port:     Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Pool conectado a TiendaAbarrotes ✅');
    return pool;
  })
  .catch(err => console.error('Error pool:', err.message));

module.exports = { sql, poolPromise };