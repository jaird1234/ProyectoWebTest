import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardAdmin({ usuario }) {
  const [activeTab, setActiveTab] = useState('pedidos');
  
  // Estados de datos
  const [pedidos, setPedidos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [entregasProv, setEntregasProv] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [empleados, setEmpleados] = useState([]); 
  const [busquedaArticulo, setBusquedaArticulo] = useState('');
  const [ventas, setVentas] = useState([]);
  // Formularios de Estado
  const [artForm, setArtForm] = useState({ Nombre: '', Precio: '', Stock: '', CategoriaId: '', Imagen: '' , Descuento:0, Destacado: false});
  const [editandoArticulo, setEditandoArticulo] = useState(null);
  
  const [empForm, setEmpForm] = useState({ NombreCompleto: '', Rol: '', Telefono: '' });
  const [editandoEmpleado, setEditandoEmpleado] = useState(null);

  const [provForm, setProvForm] = useState({ Nombre: '', Contacto: '', Telefono: '' });
  const [entForm, setEntForm] = useState({ ProveedorId: '', FechaProgramada: '', MontoAPagar: '' });

  useEffect(() => { fetchDatos(); }, []);
  const articulosFiltrados = articulos.filter(a =>
  a.Nombre.toLowerCase().includes(busquedaArticulo.toLowerCase()));
  const totalVentas =
  ventas.reduce((acc, v) => acc + Number(v.Total || 0), 0);
  const pedidosEntregados =
  ventas.filter(v => v.Estado === 'Entregado').length;
  const pedidosPendientes =
  ventas.filter(v => v.Estado !== 'Entregado').length;

  const fetchDatos = async () => {
    const resPed = await axios.get('/api/pedidos');
    setPedidos(resPed.data);
    setVentas(resPed.data);

    if (usuario.Rol === 'Administrador' || usuario.Rol === 'Almacenista') {
      const resArt = await axios.get('/api/articulos');
      const resCat = await axios.get('/api/categorias');
      const resProv = await axios.get('/api/proveedores');
      const resEnt = await axios.get('/api/entregas-proveedores');
      const resRep = await axios.get('/api/repartidores');
      const resEmp = await axios.get('/api/empleados'); 
      
      setArticulos(resArt.data);
      setCategorias(resCat.data);
      setProveedores(resProv.data);
      setEntregasProv(resEnt.data);
      setRepartidores(resRep.data);
      setEmpleados(resEmp.data);
    }
  };

  // ─── LOGÍSTICA DE PEDIDOS ───
  const cambiarEstadoPedido = async (id, nuevoEstado, repId = null) => {
    await axios.put(`http://localhost:3001/api/pedidos/${id}/estado`, { Estado: nuevoEstado, RepartidorId: repId });
    fetchDatos();
  };

  // ─── CRUD ARTÍCULOS ───
  const guardarArticulo = async (e) => {
    e.preventDefault();
    if (editandoArticulo) {
      await axios.put(`/api/articulos/${editandoArticulo}`, artForm);
    } else {
      await axios.post('/api/articulos', artForm);
    }
    setArtForm({ Nombre: '', Precio: '', Stock: '', CategoriaId: '', Imagen: '', Descuento: 0, Destacado: false });
    setEditandoArticulo(null);
    fetchDatos();
  };
  const editarArticulo = (a) => {
    setArtForm({ Nombre: a.Nombre, Precio: a.Precio, Stock: a.Stock, CategoriaId: a.CategoriaId, Imagen: a.Imagen || '', Descuento: a.Descuento || 0, Destacado: a.Destacado || false });
    setEditandoArticulo(a.Id);
  };
  const eliminarArticulo = async (id) => {
    if(window.confirm('¿Eliminar este artículo definitivamente?')) {
      await axios.delete(`/api/articulos/${id}`);
      fetchDatos();
    }
  };

  // ─── CRUD EMPLEADOS ───
  const guardarEmpleado = async (e) => {
    e.preventDefault();
    await axios.put(`/api/empleados/${editandoEmpleado}`, empForm);
    setEditandoEmpleado(null);
    setEmpForm({ NombreCompleto: '', Rol: '', Telefono: '' });
    fetchDatos();
  };
  const editarEmpleado = (emp) => {
    setEmpForm({ NombreCompleto: emp.NombreCompleto, Rol: emp.Rol, Telefono: emp.Telefono || '' });
    setEditandoEmpleado(emp.Id);
  };
  const eliminarEmpleado = async (id) => {
    if(window.confirm('¿Dar de baja definitivamente a este empleado?')) {
      await axios.delete(`/api/empleados/${id}`);
      fetchDatos();
    }
  };

  // ─── LÓGICA PROVEEDORES ───
  const registrarProveedor = async (e) => {
    e.preventDefault();
    await axios.post('/api/proveedores', provForm);
    setProvForm({ Nombre: '', Contacto: '', Telefono: '' });
    fetchDatos();
  };
  const programarEntregaProv = async (e) => {
    e.preventDefault();
    await axios.post('/api/entregas-proveedores', entForm);
    setEntForm({ ProveedorId: '', FechaProgramada: '', MontoAPagar: '' });
    fetchDatos();
  };
  const recibirEntregaProveedor = async (id) => {
    await axios.put(`/api/entregas-proveedores/${id}/recibir`);
    fetchDatos();
  };

  // ==========================================
  // RENDER: VISTA ÚNICA DE REPARTIDOR
  // ==========================================
  if (usuario.Rol === 'Repartidor') {
    const misPedidos = pedidos
  .filter(p => p.RepartidorId === usuario.Id || p.Estado === 'Preparado')
  .sort((a, b) => (a.CodigoPostal || '').localeCompare(b.CodigoPostal || ''));
    return (
      <div className="card">
        <h2>📦 Ruta de Entregas Asignadas</h2>
        <div style={{ marginTop: '20px' }}>
          {misPedidos.map(p => (
            <div key={p.Id} className="card" style={{ background: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>Pedido N° {p.Id}</h3>
                  {p.Calle ? (
  <p style={{ marginTop: '5px' }}>📍 Destino: {p.Calle} #{p.Numero}, Col. {p.Colonia}, {p.Municipio}. <strong>CP: {p.CodigoPostal}</strong></p>
) : (
  <p style={{ marginTop: '5px', color: 'red' }}>📍 Destino no registrado (Pedido antiguo)</p>
)}
                </div>
                <div style={{ minWidth: '150px' }}>
                  {p.Estado === 'Preparado' && <button className="btn" onClick={() => cambiarEstadoPedido(p.Id, 'En Camino', usuario.Id)}>Tomar Ruta</button>}
                  {p.Estado === 'En Camino' && <button className="btn" style={{ background: '#2b8a3e' }} onClick={() => cambiarEstadoPedido(p.Id, 'Entregado')}>Marcar Entregado ✓</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: DASHBOARD ADMIN Y ALMACENISTA
  // ==========================================
  return (
    <div className="dashboard-layout">
      {/* MENÚ LATERAL */}
      <div className="sidebar-menu">
        <ul>
          <li className={activeTab === 'pedidos' ? 'active' : ''} onClick={() => setActiveTab('pedidos')}>🚚 Pedidos</li>
          <li className={activeTab === 'inventario' ? 'active' : ''} onClick={() => setActiveTab('inventario')}>📦 Inventario</li>
          <li className={activeTab === 'proveedores' ? 'active' : ''} onClick={() => setActiveTab('proveedores')}>🤝 Proveedores</li>
          <li className={activeTab === 'repartidores' ? 'active' : ''} onClick={() => setActiveTab('repartidores')}>🛵 Rutas y Choferes</li>
          <li className={activeTab === 'ventas' ? 'active' : ''} onClick={() => setActiveTab('ventas')}>📊 Ventas</li>
          {usuario.Rol === 'Administrador' && (
            <li className={activeTab === 'empleados' ? 'active' : ''} onClick={() => setActiveTab('empleados')}>👥 Empleados</li>
          )}
        </ul>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="dashboard-content">
        
        {/* PESTAÑA: PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="card">
            <h3>📦 Gestión Global de Pedidos</h3>
              {pedidos.map(p => (
                <div key={p.Id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <strong>Pedido #{p.Id}</strong> - {p.Cliente} | <span style={{ color: 'var(--primary-color)' }}>{p.HorarioEntrega}</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                       Destino: {p.Calle ? `${p.Calle} #${p.Numero}, Col. ${p.Colonia}, ${p.Municipio}. CP: ${p.CodigoPostal}` : 'Sin dirección registrada'}
                    </p>
                  </div>
                  <div>
                    <span className="badge badge-progress" style={{ marginRight: '10px' }}>{p.Estado}</span>
                    {p.Estado === 'Pendiente' && (
                      <button className="btn" style={{ display: 'inline-block', width: 'auto', padding: '4px 10px' }} onClick={() => cambiarEstadoPedido(p.Id, 'Preparado')}>Aprobar Empaque</button>
                    )}
                    {p.Estado === 'Preparado' && (
                      <select onChange={(e) => cambiarEstadoPedido(p.Id, 'En Camino', e.target.value)} style={{ width: '160px', padding: '4px' }}>
                        <option value="">Asignar Chofer...</option>
                        {empleados.filter(e => e.Rol === 'Repartidor').map(r => <option key={r.Id} value={r.Id}>{r.NombreCompleto}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
        )}

        {/* PESTAÑA: INVENTARIO */}
        {activeTab === 'inventario' && (
          <div className="card">
            <h3>🛠️ Gestión de Almacén</h3>
             <div style={{ margin: '20px 0' }}>
            <input
             type="text"
             placeholder="🔍 Buscar artículo..."
             value={busquedaArticulo}
             onChange={(e) => setBusquedaArticulo(e.target.value)}
             style={{
             width: '100%',
            padding: '10px',
            borderRadius: '8px',
           border: '1px solid #ccc'
           }}
            />
            </div>
            <form onSubmit={guardarArticulo} className="form-group" style={{ marginTop: '15px', background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px' }}>
              <h4>{editandoArticulo ? '✏️ Modificar Artículo' : '✨ Nuevo Artículo'}</h4>
              <div className="flex-row" style={{ marginTop: '10px' }}>
                <input placeholder="Nombre Producto" value={artForm.Nombre} onChange={e => setArtForm({...artForm, Nombre: e.target.value})} required />
                <input type="number" step="0.01" placeholder="Precio Venta" value={artForm.Precio} onChange={e => setArtForm({...artForm, Precio: e.target.value})} required />
                <input type="number" placeholder="Existencias Iniciales" value={artForm.Stock} onChange={e => setArtForm({...artForm, Stock: e.target.value})} required />
              </div>
              <div className="flex-row">
  <select
    value={artForm.CategoriaId}
    onChange={e => setArtForm({...artForm, CategoriaId: e.target.value})}
    required
  >
    <option value="">Categoría...</option>
    {categorias.map(c => (
      <option key={c.Id} value={c.Id}>
        {c.Nombre}
      </option>
    ))}
  </select>

  <input
    placeholder="URL de la Imagen"
    value={artForm.Imagen}
    onChange={e => setArtForm({...artForm, Imagen: e.target.value})}
  />
</div>

<div
  className="flex-row"
  style={{ marginTop: '10px' }}
>
  <input
    type="number"
    min="0"
    max="100"
    placeholder="% Descuento"
    value={artForm.Descuento}
    onChange={e =>
      setArtForm({
        ...artForm,
        Descuento: parseInt(e.target.value) || 0
      })
    }
  />

  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}
  >
    <input
      type="checkbox"
      checked={artForm.Destacado}
      onChange={e =>
        setArtForm({
          ...artForm,
          Destacado: e.target.checked
        })
      }
    />
    ⭐ Producto Destacado
  </label>
</div>

<div
  className="flex-row"
  style={{ marginTop: '10px' }}
>
  <button
    type="submit"
    className="btn"
    style={{ maxWidth: '200px' }}
  >
    {editandoArticulo ? 'Actualizar' : 'Guardar'}
  </button>

  {editandoArticulo && (
    <button
      type="button"
      className="btn-danger"
      onClick={() => {
        setEditandoArticulo(null);
        setArtForm({
          Nombre: '',
          Precio: '',
          Stock: '',
          CategoriaId: '',
          Imagen: '',
          Descuento: 0,
          Destacado: false
        });
      }}
    >
      Cancelar
    </button>
  )}
</div>
            </form>
            <div className="grid">
              {articulosFiltrados.length === 0 && (
               <p style={{ textAlign: 'center', color: 'gray' }}>
               No se encontraron artículos.
              </p>
              )}
              {articulosFiltrados.map(a => (
                <div key={a.Id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px' }}>
                  <h4>{a.Nombre}</h4>

{a.Destacado && (
  <p style={{ color: '#f59f00', fontWeight: 'bold' }}>
    ⭐ Destacado
  </p>
)}

{a.Descuento > 0 && (
  <p style={{ color: '#e03131', fontWeight: 'bold' }}>
    🔥 {a.Descuento}% OFF
  </p>
)}

<p>Precio: ${a.Precio}</p>
                  <p style={{ fontSize: '1.2rem', marginTop: '5px' }}>Stock: <strong style={{ color: a.Stock > 5 ? 'green' : 'red' }}>{a.Stock} uds.</strong></p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn" style={{ background: '#e0aa00', flex: 1, padding: '5px' }} onClick={() => editarArticulo(a)}>Editar</button>
                    <button className="btn-danger" style={{ flex: 1, padding: '5px' }} onClick={() => eliminarArticulo(a.Id)}>Borrar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA: PROVEEDORES */}
        {activeTab === 'proveedores' && (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: 1, minWidth: '300px' }}>
              <h3>🤝 Registro de Proveedores</h3>
              <form onSubmit={registrarProveedor} className="form-group" style={{ marginTop: '10px' }}>
                <input placeholder="Razón Social / Nombre" value={provForm.Nombre} onChange={e => setProvForm({...provForm, Nombre: e.target.value})} required />
                <input placeholder="Nombre del Contacto" value={provForm.Contacto} onChange={e => setProvForm({...provForm, Contacto: e.target.value})} />
                <input placeholder="Teléfono" value={provForm.Telefono} onChange={e => setProvForm({...provForm, Telefono: e.target.value})} />
                <button type="submit" className="btn">Guardar Proveedor</button>
              </form>

              <h3 style={{ marginTop: '20px' }}>📅 Programar Recepción</h3>
              <form onSubmit={programarEntregaProv} className="form-group" style={{ marginTop: '10px' }}>
                <select value={entForm.ProveedorId} onChange={e => setEntForm({...entForm, ProveedorId: e.target.value})} required>
                  <option value="">Selecciona Proveedor...</option>
                  {proveedores.map(p => <option key={p.Id} value={p.Id}>{p.Nombre}</option>)}
                </select>
                <input type="datetime-local" value={entForm.FechaProgramada} onChange={e => setEntForm({...entForm, FechaProgramada: e.target.value})} required />
                <input type="number" step="0.01" placeholder="Costo Total ($)" value={entForm.MontoAPagar} onChange={e => setEntForm({...entForm, MontoAPagar: e.target.value})} required />
                <button type="submit" className="btn">Programar Entrada</button>
              </form>
            </div>
            <div className="card" style={{ flex: 2, minWidth: '320px' }}>
              <h3>📊 Cuentas por Pagar y Entregas</h3>
              <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '8px' }}>Proveedor</th>
                    <th>Fecha</th>
                    <th>Pago</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {entregasProv.map(e => (
                    <tr key={e.Id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px' }}>{e.ProveedorNombre}</td>
                      <td>{new Date(e.FechaProgramada).toLocaleString()}</td>
                      <td style={{ fontWeight: 'bold' }}>${e.MontoAPagar.toFixed(2)}</td>
                      <td><span className={`badge ${e.Estado === 'Recibida' ? 'badge-success' : 'badge-pending'}`}>{e.Estado}</span></td>
                      <td>
                        {e.Estado === 'Programada' && <button className="btn" style={{ padding: '4px 8px', fontSize: '0.85rem' }} onClick={() => recibirEntregaProveedor(e.Id)}>Recibir</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '20px', background: 'var(--bg-primary)', padding: '15px', borderRadius: '6px', textAlign: 'right' }}>
                <h4>Pasivo Total Pendiente:</h4>
                <h2 style={{ color: 'var(--accent-color)' }}>
                  ${entregasProv.filter(e => e.Estado === 'Programada').reduce((acc, curr) => acc + curr.MontoAPagar, 0).toFixed(2)}
                </h2>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: REPARTIDORES */}
        {activeTab === 'repartidores' && (
          <div className="card">
            <h3>🛵 Control de Repartidores y Rutas</h3>
            <div style={{ marginTop: '20px' }}>
              {repartidores.map(rep => {
                const rutas = pedidos.filter(p => p.RepartidorId === rep.Id);
                return (
                  <div key={rep.Id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <h4>{rep.NombreCompleto} <span style={{ color: 'gray', fontSize: '0.9rem' }}>(Chofer)</span></h4>
                    <p style={{ margin: '10px 0', fontWeight: 'bold' }}>Rutas Asignadas ({rutas.length}):</p>
                    {rutas.length === 0 ? <p style={{ color: 'gray' }}>No tiene rutas asignadas.</p> : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <tbody>
                          {rutas.map(r => (
                            <tr key={r.Id} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '8px 0' }}><strong>Pedido #{r.Id}</strong></td>
                              <td>Destino: {r.Calle} #{r.Numero}, {r.Colonia}</td>
                              <td style={{ color: 'var(--primary-color)' }}>{r.HorarioEntrega}</td>
                              <td><span className="badge badge-success">{r.Estado}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* PESTAÑA: VENTAS */}
{activeTab === 'ventas' && (
  <div className="card">

    <h2>📊 Resumen de Ventas</h2>

    <div
      style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}
    >
      <div className="card">
        <h4>💰 Total Vendido</h4>
        <h2>${totalVentas.toFixed(2)}</h2>
      </div>

      <div className="card">
        <h4>📦 Pedidos Totales</h4>
        <h2>{ventas.length}</h2>
      </div>

      <div className="card">
        <h4>✅ Entregados</h4>
        <h2>{pedidosEntregados}</h2>
      </div>

      <div className="card">
        <h4>⏳ Pendientes</h4>
        <h2>{pedidosPendientes}</h2>
      </div>
    </div>

    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '15px'
      }}
    >
      <thead>
        <tr
          style={{
            borderBottom: '2px solid var(--border-color)'
          }}
        >
          <th>Folio</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Estado</th>
        </tr>
      </thead>

      <tbody>
        {ventas.map(v => (
          <tr
            key={v.Id}
            style={{
              borderBottom:
                '1px solid var(--border-color)'
            }}
          >
            <td>#{v.Id}</td>

            <td>
              {new Date(v.Fecha).toLocaleDateString()}
            </td>

            <td>
              ${Number(v.Total).toFixed(2)}
            </td>

            <td>{v.Estado}</td>
          </tr>
        ))}
      </tbody>
    </table>

  </div>
)}

        {/* PESTAÑA: EMPLEADOS (SOLO ADMIN) */}
        {activeTab === 'empleados' && usuario.Rol === 'Administrador' && (
          <div className="card">
            <h3>👥 Control de Personal</h3>
            {editandoEmpleado && (
              <form onSubmit={guardarEmpleado} className="form-group" style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4>✏️ Modificando Datos del Empleado</h4>
                <div className="flex-row" style={{ marginTop: '10px' }}>
                  <input placeholder="Nombre Completo" value={empForm.NombreCompleto} onChange={e => setEmpForm({...empForm, NombreCompleto: e.target.value})} required />
                  <input placeholder="Teléfono" value={empForm.Telefono} onChange={e => setEmpForm({...empForm, Telefono: e.target.value})} />
                  <select value={empForm.Rol} onChange={e => setEmpForm({...empForm, Rol: e.target.value})} required>
                    <option value="Repartidor">Repartidor (Chofer)</option>
                    <option value="Almacenista">Almacenista</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
                <div className="flex-row">
                  <button type="submit" className="btn">Actualizar Empleado</button>
                  <button type="button" className="btn-danger" onClick={() => setEditandoEmpleado(null)}>Cancelar</button>
                </div>
              </form>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '10px' }}>Usuario</th>
                  <th>Nombre Completo</th>
                  <th>Rol Asignado</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map(emp => (
                  <tr key={emp.Id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px' }}>{emp.Usuario}</td>
                    <td>{emp.NombreCompleto}</td>
                    <td><span className="badge badge-success">{emp.Rol}</span></td>
                    <td>{emp.Telefono || 'N/A'}</td>
                    <td>
                      <button className="btn" style={{ background: '#e0aa00', padding: '4px 8px', marginRight: '5px', display: 'inline-block', width: 'auto' }} onClick={() => editarEmpleado(emp)}>Editar</button>
                      <button className="btn-danger" onClick={() => eliminarEmpleado(emp.Id)}>Baja</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}