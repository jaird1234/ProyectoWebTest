const express      = require('express');
const cors         = require('cors');
const initDB       = require('./init-db');
const { sql, poolPromise } = require('./db');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// ── CATEGORÍAS ─────────────────────────────────────
app.get('/api/categorias', async (req, res) => {
  try {
    const pool   = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Categorias');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ARTÍCULOS ──────────────────────────────────────
app.get('/api/articulos', async (req, res) => {
  try {
    const pool   = await poolPromise;
    const result = await pool.request().query(`
      SELECT a.*, c.Nombre AS CategoriaNombre
      FROM Articulo a
      LEFT JOIN Categorias c ON a.CategoriaId = c.Id
    `);
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/articulos/:id', async (req, res) => {
  try {
    const pool   = await poolPromise;
    const result = await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('SELECT * FROM Articulo WHERE Id = @Id');
    if (!result.recordset.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/articulos', async (req, res) => {
  const { Nombre, Precio, Stock, CategoriaId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Nombre',      sql.NVarChar(100), Nombre)
      .input('Precio',      sql.Decimal(10,2),  Precio)
      .input('Stock',       sql.Int,            Stock)
      .input('CategoriaId', sql.Int,            CategoriaId)
      .query('INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId) VALUES (@Nombre,@Precio,@Stock,@CategoriaId)');
    res.status(201).json({ message: 'Artículo creado ' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/articulos/:id', async (req, res) => {
  const { Nombre, Precio, Stock, CategoriaId } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Id',          sql.Int,            req.params.id)
      .input('Nombre',      sql.NVarChar(100),  Nombre)
      .input('Precio',      sql.Decimal(10,2),  Precio)
      .input('Stock',       sql.Int,            Stock)
      .input('CategoriaId', sql.Int,            CategoriaId)
      .query('UPDATE Articulo SET Nombre=@Nombre, Precio=@Precio, Stock=@Stock, CategoriaId=@CategoriaId WHERE Id=@Id');
    res.json({ message: 'Artículo actualizado ' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/articulos/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Id', sql.Int, req.params.id)
      .query('DELETE FROM Articulo WHERE Id = @Id');
    res.json({ message: 'Artículo eliminado ✅' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CLIENTES ───────────────────────────────────────
app.get('/api/clientes', async (req, res) => {
  try {
    const pool   = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Clientes');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/clientes', async (req, res) => {
  const { Nombre, Telefono, Direccion } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Nombre',    sql.NVarChar(100), Nombre)
      .input('Telefono',  sql.NVarChar(20),  Telefono)
      .input('Direccion', sql.NVarChar(200), Direccion)
      .query('INSERT INTO Clientes (Nombre,Telefono,Direccion) VALUES (@Nombre,@Telefono,@Direccion)');
    res.status(201).json({ message: 'Cliente creado ' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── VENTAS ─────────────────────────────────────────
app.get('/api/ventas', async (req, res) => {
  try {
    const pool   = await poolPromise;
    const result = await pool.request().query(`
      SELECT v.*, u.NombreCompleto AS Vendedor, c.Nombre AS ClienteNombre
      FROM Ventas v
      JOIN Usuarios u ON v.UsuarioId = u.Id
      LEFT JOIN Clientes c ON v.ClienteId = c.Id
      ORDER BY v.Fecha DESC
    `);
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ventas', async (req, res) => {
  const { ClienteId, UsuarioId, Subtotal, IVA, Total, detalle } = req.body;
  try {
    const pool        = await poolPromise;
    const ventaResult = await pool.request()
      .input('ClienteId',  sql.Int,          ClienteId || null)
      .input('UsuarioId',  sql.Int,          UsuarioId)
      .input('Subtotal',   sql.Decimal(10,2), Subtotal)
      .input('IVA',        sql.Decimal(10,2), IVA)
      .input('Total',      sql.Decimal(10,2), Total)
      .query(`
        INSERT INTO Ventas (ClienteId,UsuarioId,Subtotal,IVA,Total)
        OUTPUT INSERTED.Id
        VALUES (@ClienteId,@UsuarioId,@Subtotal,@IVA,@Total)
      `);
    const ventaId = ventaResult.recordset[0].Id;
    for (const item of detalle) {
      await pool.request()
        .input('VentaId',        sql.Int,           ventaId)
        .input('ProductoId',     sql.Int,           item.ProductoId)
        .input('Cantidad',       sql.Int,           item.Cantidad)
        .input('PrecioUnitario', sql.Decimal(10,2), item.PrecioUnitario)
        .input('Subtotal',       sql.Decimal(10,2), item.Subtotal)
        .query('INSERT INTO DetalleVentas (VentaId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES (@VentaId,@ProductoId,@Cantidad,@PrecioUnitario,@Subtotal)');
      await pool.request()
        .input('Cantidad',   sql.Int, item.Cantidad)
        .input('ProductoId', sql.Int, item.ProductoId)
        .query('UPDATE Articulo SET Stock = Stock - @Cantidad WHERE Id = @ProductoId');
    }
    res.status(201).json({ message: 'Venta registrada ', ventaId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── LOGIN ──────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { Usuario, Password } = req.body;
  try {
    const pool   = await poolPromise;
    const result = await pool.request()
      .input('Usuario',  sql.NVarChar(50),  Usuario)
      .input('Password', sql.NVarChar(255), Password)
      .query('SELECT Id, NombreCompleto, Rol FROM Usuarios WHERE Usuario=@Usuario AND Password=@Password');
    if (!result.recordset.length) return res.status(401).json({ error: 'Credenciales incorrectas' });
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT} `));