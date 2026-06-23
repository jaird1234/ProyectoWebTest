const express      = require('express');
const cors         = require('cors');
const initDB       = require('./init-db');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let sql;
let poolPromise;

// ── AUTH & REGISTRO ────────────────────────
app.post('/api/login', async (req, res) => {
  const { Usuario, Password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Usuario', sql.NVarChar(50), Usuario)
      .input('Password', sql.NVarChar(255), Password)
      .query('SELECT Id, Usuario, NombreCompleto, Rol, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono FROM Usuarios WHERE Usuario=@Usuario AND Password=@Password');
    if (!result.recordset.length) return res.status(401).json({ error: 'Credenciales incorrectas' });
    res.json(result.recordset[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/register', async (req, res) => {
  const { Usuario, Password, NombreCompleto, Calle, Numero, Colonia, Municipio, CodigoPostal, Telefono } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Usuario', sql.NVarChar(50), Usuario)
      .input('Password', sql.NVarChar(255), Password)
      .input('NombreCompleto', sql.NVarChar(100), NombreCompleto)
      .input('Rol', sql.NVarChar(30), 'Cliente')
      .input('Calle', sql.NVarChar(100), Calle)
      .input('Numero', sql.NVarChar(20), Numero)
      .input('Colonia', sql.NVarChar(100), Colonia)
      .input('Municipio', sql.NVarChar(100), Municipio)
      .input('CodigoPostal', sql.NVarChar(10), CodigoPostal)
      .input('Telefono', sql.NVarChar(20), Telefono)
      .query('INSERT INTO Usuarios (Usuario,Password,NombreCompleto,Rol,Calle,Numero,Colonia,Municipio,CodigoPostal,Telefono) VALUES (@Usuario,@Password,@NombreCompleto,@Rol,@Calle,@Numero,@Colonia,@Municipio,@CodigoPostal,@Telefono)');
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) { res.status(500).json({ error: 'El nombre de usuario ya existe o los datos son inválidos' }); }
});

// ── ARTÍCULOS & CATEGORÍAS ─────────────────────────────
app.post('/api/categorias', async (req, res) => {
  const { Nombre } = req.body;
  const pool = await poolPromise;
  const result = await pool.request()
    .input('Nombre', sql.NVarChar, Nombre)
    .query(`INSERT INTO Categorias (Nombre) OUTPUT INSERTED.Id VALUES (@Nombre)`);
  res.json({ Id: result.recordset[0].Id });
});

app.get('/api/articulos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT a.*, c.Nombre AS CategoriaNombre FROM Articulo a LEFT JOIN Categorias c ON a.CategoriaId = c.Id');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/articulos', async (req, res) => {
  const { Nombre, Precio, Stock, CategoriaId, Imagen } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Precio', sql.Decimal(10,2), Precio)
      .input('Stock', sql.Int, Stock)
      .input('CategoriaId', sql.Int, CategoriaId)
      .input('Imagen', sql.NVarChar(sql.MAX), Imagen)
      .query('INSERT INTO Articulo (Nombre,Precio,Stock,CategoriaId,Imagen) VALUES (@Nombre,@Precio,@Stock,@CategoriaId,@Imagen)');
    res.status(201).json({ message: 'Creado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/articulos/:id', async (req, res) => {
  const { Nombre, Precio, Stock, CategoriaId, Imagen } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Precio', sql.Decimal(10,2), Precio)
      .input('Stock', sql.Int, Stock)
      .input('CategoriaId', sql.Int, CategoriaId)
      .input('Imagen', sql.NVarChar(sql.MAX), Imagen)
      .query('UPDATE Articulo SET Nombre=@Nombre, Precio=@Precio, Stock=@Stock, CategoriaId=@CategoriaId, Imagen=@Imagen WHERE Id=@Id');
    res.json({ message: 'Actualizado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/articulos/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('Id', sql.Int, req.params.id).query('DELETE FROM Articulo WHERE Id=@Id');
    res.json({ message: 'Eliminado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PROVEEDORES Y ALMACÉN ───────────────────────────
app.get('/api/proveedores', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Proveedores');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/proveedores', async (req, res) => {
  const { Nombre, Contacto, Telefono } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Contacto', sql.NVarChar(100), Contacto)
      .input('Telefono', sql.NVarChar(20), Telefono)
      .query('INSERT INTO Proveedores (Nombre,Contacto,Telefono) VALUES (@Nombre,@Contacto,@Telefono)');
    res.sendStatus(201);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/entregas-proveedores', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT e.*, p.Nombre AS ProveedorNombre FROM EntregasProveedores e JOIN Proveedores p ON e.ProveedorId = p.Id ORDER BY e.FechaProgramada ASC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/entregas-proveedores', async (req, res) => {
  const { ProveedorId, FechaProgramada, MontoAPagar } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ProveedorId', sql.Int, ProveedorId)
      .input('FechaProgramada', sql.DateTime, FechaProgramada)
      .input('MontoAPagar', sql.Decimal(10,2), MontoAPagar)
      .query('INSERT INTO EntregasProveedores (ProveedorId,FechaProgramada,MontoAPagar) VALUES (@ProveedorId,@FechaProgramada,@MontoAPagar)');
    res.sendStatus(201);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/entregas-proveedores/:id/recibir', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('Id', sql.Int, req.params.id).query("UPDATE EntregasProveedores SET Estado='Recibida' WHERE Id=@Id");
    res.sendStatus(200);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GESTIÓN DE EMPLEADOS ───────────────────────────
app.post('/api/empleados', async (req, res) => {
  const { NombreCompleto, Usuario, Contrasena, Rol, Telefono, Correo } = req.body;
  const pool = await poolPromise;
  await pool.request()
    .input('NombreCompleto', sql.NVarChar, NombreCompleto)
    .input('Usuario',        sql.NVarChar, Usuario)
    .input('Contrasena',     sql.NVarChar, Contrasena)
    .input('Rol',            sql.NVarChar, Rol)
    .input('Telefono',       sql.NVarChar, Telefono || null)
    .input('Correo',         sql.NVarChar, Correo || null)
    .query(`INSERT INTO Usuarios (NombreCompleto, Usuario, Contrasena, Rol, Telefono, Correo)
            VALUES (@NombreCompleto, @Usuario, @Contrasena, @Rol, @Telefono, @Correo)`);
  res.json({ ok: true });
});

app.put('/api/empleados/:id', async (req, res) => {
  const { NombreCompleto, Rol, Telefono } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('NombreCompleto', sql.NVarChar(100), NombreCompleto)
      .input('Rol', sql.NVarChar(30), Rol)
      .input('Telefono', sql.NVarChar(20), Telefono)
      .query('UPDATE Usuarios SET NombreCompleto=@NombreCompleto, Rol=@Rol, Telefono=@Telefono WHERE Id=@Id');
    res.sendStatus(200);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/empleados/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('Id', sql.Int, req.params.id).query('DELETE FROM Usuarios WHERE Id=@Id');
    res.sendStatus(200);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/repartidores', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT Id, NombreCompleto FROM Usuarios WHERE Rol='Repartidor'");
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PEDIDOS Y ENTREGAS ───────────────────────────────
app.get('/api/pedidos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT p.*, u.NombreCompleto AS Cliente, r.NombreCompleto AS Repartidor FROM Pedidos p JOIN Usuarios u ON p.ClienteId = u.Id LEFT JOIN Usuarios r ON p.RepartidorId = r.Id ORDER BY p.Fecha DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pedidos/cliente/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ClienteId', sql.Int, req.params.id)
      .query('SELECT * FROM Pedidos WHERE ClienteId = @ClienteId ORDER BY Fecha DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pedidos/repartidor/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('RepartidorId', sql.Int, req.params.id)
      .query("SELECT p.*, u.NombreCompleto AS Cliente, u.Telefono AS TelefonoCliente FROM Pedidos p JOIN Usuarios u ON p.ClienteId = u.Id WHERE p.RepartidorId = @RepartidorId AND p.Estado != 'Entregado' ORDER BY p.Fecha ASC");
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pedidos', async (req, res) => {
  const { ClienteId, HorarioEntrega, Calle, Numero, Colonia, Municipio, CodigoPostal, Subtotal, IVA, Total, detalle } = req.body;
  try {
    const pool = await poolPromise;
    for (const item of detalle) {
      const check = await pool.request().input('Id', sql.Int, item.ProductoId).query('SELECT Stock, Nombre FROM Articulo WHERE Id=@Id');
      if (check.recordset[0].Stock < item.Cantidad) return res.status(400).json({ error: `Stock insuficiente para: ${check.recordset[0].Nombre}` });
    }

    const pedRes = await pool.request()
      .input('ClienteId', sql.Int, ClienteId)
      .input('HorarioEntrega', sql.NVarChar(50), HorarioEntrega)
      .input('Calle', sql.NVarChar(100), Calle)
      .input('Numero', sql.NVarChar(20), Numero)
      .input('Colonia', sql.NVarChar(100), Colonia)
      .input('Municipio', sql.NVarChar(100), Municipio)
      .input('CodigoPostal', sql.NVarChar(10), CodigoPostal)
      .input('Subtotal', sql.Decimal(10,2), Subtotal)
      .input('IVA', sql.Decimal(10,2), IVA)
      .input('Total', sql.Decimal(10,2), Total)
      .query('INSERT INTO Pedidos (ClienteId,HorarioEntrega,Calle,Numero,Colonia,Municipio,CodigoPostal,Subtotal,IVA,Total) OUTPUT INSERTED.Id VALUES (@ClienteId,@HorarioEntrega,@Calle,@Numero,@Colonia,@Municipio,@CodigoPostal,@Subtotal,@IVA,@Total)');
    
    const pedidoId = pedRes.recordset[0].Id;
    for (const item of detalle) {
      await pool.request()
        .input('PedidoId', sql.Int, pedidoId)
        .input('ProductoId', sql.Int, item.ProductoId)
        .input('Cantidad', sql.Int, item.Cantidad)
        .input('PrecioUnitario', sql.Decimal(10,2), item.PrecioUnitario)
        .input('Subtotal', sql.Decimal(10,2), item.Subtotal)
        .query('INSERT INTO DetallePedidos (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal) VALUES (@PedidoId,@ProductoId,@Cantidad,@PrecioUnitario,@Subtotal)');
      
      await pool.request()
        .input('Cantidad', sql.Int, item.Cantidad)
        .input('ProductoId', sql.Int, item.ProductoId)
        .query('UPDATE Articulo SET Stock = Stock - @Cantidad WHERE Id = @ProductoId');
    }
    res.status(201).json({ pedidoId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/pedidos/:id/estado', async (req, res) => {
  const { Estado, RepartidorId } = req.body;
  try {
    const pool = await poolPromise;
    let query = "UPDATE Pedidos SET Estado=@Estado WHERE Id=@Id";
    if (RepartidorId) query = "UPDATE Pedidos SET Estado=@Estado, RepartidorId=@RepartidorId WHERE Id=@Id";
    
    const reqInstance = pool.request()
      .input('Id', sql.Int, req.params.id)
      .input('Estado', sql.NVarChar(30), Estado);
    if (RepartidorId) reqInstance.input('RepartidorId', sql.Int, RepartidorId);
    
    await reqInstance.query(query);
    res.sendStatus(200);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ARRANQUE ────────────────────────────────────────
initDB().then(() => {
  const db = require('./db');
  sql = db.sql;
  poolPromise = db.poolPromise;
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT} 🚀`));
});