import React, { useState, useEffect } from 'react';
import axios from 'axios';


export const RANGOS_HORARIOS = [
  "08:00 AM - 09:00 AM","09:00 AM - 10:00 AM","10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM","12:00 PM - 01:00 PM","01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM","03:00 PM - 04:00 PM","04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM","06:00 PM - 07:00 PM","07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
];

export default function DashboardAdmin({ usuario }) {
  const [activeTab, setActiveTab] = useState('pedidos');

  // Datos
  const [pedidos, setPedidos]           = useState([]);
  const [articulos, setArticulos]       = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [proveedores, setProveedores]   = useState([]);
  const [entregasProv, setEntregasProv] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [empleados, setEmpleados]       = useState([]);
  const [ventas, setVentas]             = useState([]);

  // Filtros de pedidos
  const [filtroDia, setFiltroDia]         = useState('');
  const [filtroHorario, setFiltroHorario] = useState('');
  const [filtroEstado, setFiltroEstado]   = useState('');

  // Búsqueda inventario
  const [busquedaArticulo, setBusquedaArticulo] = useState('');

  // Form artículo
  const [artForm, setArtForm]           = useState({ Nombre:'', Precio:'', Stock:'', CategoriaId:'', Imagen:'', Descuento:0, Destacado:false });
  const [editandoArticulo, setEditandoArticulo] = useState(null);

  // Form nueva categoría (inline)
  const [mostrarNuevaCat, setMostrarNuevaCat] = useState(false);
  const [nuevaCatNombre, setNuevaCatNombre]   = useState('');

  // Form empleado (alta + edición)
  const [empForm, setEmpForm]           = useState({ NombreCompleto:'', Usuario:'', Contrasena:'', Rol:'Repartidor', Telefono:'', Correo:'' });
  const [editandoEmpleado, setEditandoEmpleado] = useState(null);
  const [mostrarFormEmp, setMostrarFormEmp]     = useState(false);

  // Form proveedores
  const [provForm, setProvForm] = useState({ Nombre:'', Contacto:'', Telefono:'' });
  const [entForm, setEntForm]   = useState({ ProveedorId:'', FechaProgramada:'', MontoAPagar:'' });

  useEffect(() => { fetchDatos(); }, []);

  const fetchDatos = async () => {
    try {
      const resPed = await axios.get('/api/pedidos');
      setPedidos(resPed.data);
      setVentas(resPed.data);

      if (usuario.Rol === 'Administrador' || usuario.Rol === 'Almacenista') {
        const [resArt, resCat, resProv, resEnt, resRep, resEmp] = await Promise.all([
          axios.get('/api/articulos'),
          axios.get('/api/categorias'),
          axios.get('/api/proveedores'),
          axios.get('/api/entregas-proveedores'),
          axios.get('/api/repartidores'),
          axios.get('/api/empleados'),
        ]);
        setArticulos(resArt.data);
        setCategorias(resCat.data);
        setProveedores(resProv.data);
        setEntregasProv(resEnt.data);
        setRepartidores(resRep.data);
        setEmpleados(resEmp.data);
      }
    } catch (err) { console.error('Error al cargar datos:', err); }
  };

  // ── KPIs ventas ──
  const totalVentas       = ventas.reduce((acc, v) => acc + Number(v.Total || 0), 0);
  const pedidosEntregados = ventas.filter(v => v.Estado === 'Entregado').length;
  const pedidosPendientes = ventas.filter(v => v.Estado !== 'Entregado').length;

  // ── Pedidos filtrados ──
  const pedidosFiltrados = pedidos.filter(p => {
    const horarioFull = p.HorarioEntrega || '';
    // HorarioEntrega guarda "YYYY-MM-DD | HH:MM AM - HH:MM AM"
    const [diaParte, horaParte] = horarioFull.split(' | ');
    const coincideDia     = !filtroDia     || (diaParte || '').includes(filtroDia);
    const coincideHorario = !filtroHorario || (horaParte || '').includes(filtroHorario);
    const coincideEstado  = !filtroEstado  || p.Estado === filtroEstado;
    return coincideDia && coincideHorario && coincideEstado;
  });

  // ── Pedidos: cambiar estado ──
  const cambiarEstadoPedido = async (id, nuevoEstado, repId = null) => {
    await axios.put(`/api/pedidos/${id}/estado`, { Estado: nuevoEstado, RepartidorId: repId });
    fetchDatos();
  };

  // ── CRUD Artículos ──
  const guardarArticulo = async (e) => {
    e.preventDefault();
    if (editandoArticulo) {
      await axios.put(`/api/articulos/${editandoArticulo}`, artForm);
    } else {
      await axios.post('/api/articulos', artForm);
    }
    setArtForm({ Nombre:'', Precio:'', Stock:'', CategoriaId:'', Imagen:'', Descuento:0, Destacado:false });
    setEditandoArticulo(null);
    fetchDatos();
  };
  const editarArticulo = (a) => {
    setArtForm({ Nombre:a.Nombre, Precio:a.Precio, Stock:a.Stock, CategoriaId:a.CategoriaId, Imagen:a.Imagen||'', Descuento:a.Descuento||0, Destacado:a.Destacado||false });
    setEditandoArticulo(a.Id);
    window.scrollTo({ top: 0, behavior:'smooth' });
  };
  const eliminarArticulo = async (id) => {
    if (window.confirm('¿Eliminar este artículo?')) {
      await axios.delete(`/api/articulos/${id}`);
      fetchDatos();
    }
  };

  // ── Nueva categoría inline ──
  const crearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCatNombre.trim()) return;
    const res = await axios.post('/api/categorias', { Nombre: nuevaCatNombre.trim() });
    setNuevaCatNombre('');
    setMostrarNuevaCat(false);
    await fetchDatos();
    // Seleccionar la nueva categoría automáticamente
    if (res.data?.Id) setArtForm(f => ({ ...f, CategoriaId: res.data.Id }));
  };

  // ── CRUD Empleados (alta + edición) ──
  const abrirAltaEmpleado = () => {
    setEmpForm({ NombreCompleto:'', Usuario:'', Contrasena:'', Rol:'Repartidor', Telefono:'', Correo:'' });
    setEditandoEmpleado(null);
    setMostrarFormEmp(true);
  };
  const editarEmpleado = (emp) => {
    setEmpForm({ NombreCompleto:emp.NombreCompleto, Usuario:emp.Usuario||'', Contrasena:'', Rol:emp.Rol, Telefono:emp.Telefono||'', Correo:emp.Correo||'' });
    setEditandoEmpleado(emp.Id);
    setMostrarFormEmp(true);
  };
  const guardarEmpleado = async (e) => {
    e.preventDefault();
    if (editandoEmpleado) {
      await axios.put(`/api/empleados/${editandoEmpleado}`, empForm);
    } else {
      await axios.post('/api/empleados', empForm);
    }
    setMostrarFormEmp(false);
    setEditandoEmpleado(null);
    setEmpForm({ NombreCompleto:'', Usuario:'', Contrasena:'', Rol:'Repartidor', Telefono:'', Correo:'' });
    fetchDatos();
  };
  const eliminarEmpleado = async (id) => {
    if (window.confirm('¿Dar de baja definitivamente a este empleado?')) {
      await axios.delete(`/api/empleados/${id}`);
      fetchDatos();
    }
  };

  // ── Proveedores ──
  const registrarProveedor = async (e) => {
    e.preventDefault();
    await axios.post('/api/proveedores', provForm);
    setProvForm({ Nombre:'', Contacto:'', Telefono:'' });
    fetchDatos();
  };
  const programarEntregaProv = async (e) => {
    e.preventDefault();
    await axios.post('/api/entregas-proveedores', entForm);
    setEntForm({ ProveedorId:'', FechaProgramada:'', MontoAPagar:'' });
    fetchDatos();
  };
  const recibirEntregaProveedor = async (id) => {
    await axios.put(`/api/entregas-proveedores/${id}/recibir`);
    fetchDatos();
  };

  const articulosFiltrados = articulos.filter(a =>
    a.Nombre.toLowerCase().includes(busquedaArticulo.toLowerCase())
  );

  // ── Estilos reutilizables ──
  const inputStyle = { padding:'10px 12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-primary)', color:'var(--text-main)', fontSize:'0.9rem' };
  const cardSeccion = { background:'var(--bg-primary)', padding:'16px', borderRadius:'10px', marginBottom:'16px' };

  // ==========================================
  // RENDER: REPARTIDOR
  // ==========================================
  if (usuario.Rol === 'Repartidor') {
    const misPedidos = pedidos
      .filter(p => p.RepartidorId === usuario.Id || p.Estado === 'Preparado')
      .sort((a, b) => (a.CodigoPostal || '').localeCompare(b.CodigoPostal || ''));
    return (
      <div className="card">
        <h2>📦 Ruta de Entregas Asignadas</h2>
        <div style={{ marginTop:'20px' }}>
          {misPedidos.map(p => (
            <div key={p.Id} className="card" style={{ background:'var(--bg-primary)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap' }}>
                <div>
                  <h3 style={{ margin:'0 0 10px' }}>Pedido N° {p.Id}</h3>
                  {p.Calle
                    ? <p>📍 {p.Calle} #{p.Numero}, Col. {p.Colonia}, {p.Municipio}. <strong>CP: {p.CodigoPostal}</strong></p>
                    : <p style={{ color:'red' }}>📍 Destino no registrado</p>
                  }
                </div>
                <div style={{ minWidth:'150px' }}>
                  {p.Estado === 'Preparado'  && <button className="btn" onClick={() => cambiarEstadoPedido(p.Id, 'En Camino', usuario.Id)}>Tomar Ruta</button>}
                  {p.Estado === 'En Camino'  && <button className="btn" style={{ background:'#2b8a3e' }} onClick={() => cambiarEstadoPedido(p.Id, 'Entregado')}>Marcar Entregado ✓</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: ADMIN / ALMACENISTA
  // ==========================================
  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <div className="sidebar-menu">
        <ul>
          <li className={activeTab === 'pedidos'      ? 'active' : ''} onClick={() => setActiveTab('pedidos')}>🚚 Pedidos</li>
          <li className={activeTab === 'inventario'   ? 'active' : ''} onClick={() => setActiveTab('inventario')}>📦 Inventario</li>
          <li className={activeTab === 'proveedores'  ? 'active' : ''} onClick={() => setActiveTab('proveedores')}>🤝 Proveedores</li>
          <li className={activeTab === 'repartidores' ? 'active' : ''} onClick={() => setActiveTab('repartidores')}>🛵 Rutas y Choferes</li>
          <li className={activeTab === 'ventas'       ? 'active' : ''} onClick={() => setActiveTab('ventas')}>📊 Ventas</li>
          {usuario.Rol === 'Administrador' && (
            <li className={activeTab === 'empleados' ? 'active' : ''} onClick={() => setActiveTab('empleados')}>👥 Empleados</li>
          )}
        </ul>
      </div>

      {/* CONTENIDO */}
      <div className="dashboard-content">

        {/* ══════════════════════════════════════
            PESTAÑA: PEDIDOS (con filtros)
        ══════════════════════════════════════ */}
        {activeTab === 'pedidos' && (
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
              <h3 style={{ margin:0 }}>🚚 Gestión de Pedidos
                <span style={{ marginLeft:'10px', background:'var(--primary-color)', color:'white', borderRadius:'999px', padding:'2px 10px', fontSize:'0.8rem', fontWeight:600 }}>
                  {pedidosFiltrados.length}
                </span>
              </h3>
              <button className="btn" style={{ width:'auto', fontSize:'0.85rem', backgroundColor:'#495057' }} onClick={fetchDatos}>🔄 Actualizar</button>
            </div>

            {/* Filtros */}
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px', padding:'14px', background:'var(--bg-primary)', borderRadius:'10px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1, minWidth:'160px' }}>
                <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>📅 Filtrar por día</label>
                <input type="date" value={filtroDia} onChange={e => setFiltroDia(e.target.value)} style={{ ...inputStyle }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:2, minWidth:'200px' }}>
                <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>🕐 Filtrar por horario</label>
                <select value={filtroHorario} onChange={e => setFiltroHorario(e.target.value)} style={{ ...inputStyle }}>
                  <option value="">Todos los horarios</option>
                  {RANGOS_HORARIOS.map((r,i) => <option key={i} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1, minWidth:'140px' }}>
                <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>📌 Estado</label>
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ ...inputStyle }}>
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Preparado">Preparado</option>
                  <option value="En Camino">En Camino</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
              {(filtroDia || filtroHorario || filtroEstado) && (
                <div style={{ display:'flex', alignItems:'flex-end' }}>
                  <button onClick={() => { setFiltroDia(''); setFiltroHorario(''); setFiltroEstado(''); }}
                    style={{ ...inputStyle, background:'#fa5252', color:'white', border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                    ✕ Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            {pedidosFiltrados.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No hay pedidos con esos filtros.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {pedidosFiltrados.map(p => (
                  <div key={p.Id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderRadius:'10px', border:'1px solid var(--border-color)', background:'var(--bg-primary)', flexWrap:'wrap', gap:'10px' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'4px' }}>
                        <strong>Pedido #{p.Id}</strong>
                        <span className={`badge ${p.Estado === 'Entregado' ? 'badge-success' : 'badge-progress'}`}>{p.Estado}</span>
                        <span style={{ fontSize:'0.85rem', color:'var(--primary-color)', fontWeight:600 }}>🕐 {p.HorarioEntrega}</span>
                      </div>
                      <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', margin:'2px 0' }}>👤 {p.Cliente}</p>
                      <p style={{ fontSize:'0.83rem', color:'var(--text-muted)' }}>
                        📍 {p.Calle ? `${p.Calle} #${p.Numero}, Col. ${p.Colonia}, ${p.Municipio}` : 'Sin dirección registrada'}
                      </p>
                    </div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', flexShrink:0 }}>
                      {p.Estado === 'Pendiente' && (
                        <button className="btn" style={{ width:'auto', padding:'6px 12px', fontSize:'0.85rem' }}
                          onClick={() => cambiarEstadoPedido(p.Id, 'Preparado')}>
                          ✅ Aprobar Empaque
                        </button>
                      )}
                      {p.Estado === 'Preparado' && (
                        <select onChange={e => e.target.value && cambiarEstadoPedido(p.Id, 'En Camino', e.target.value)}
                          style={{ ...inputStyle, fontSize:'0.85rem', minWidth:'160px' }}>
                          <option value="">Asignar Chofer...</option>
                          {empleados.filter(e => e.Rol === 'Repartidor').map(r => (
                            <option key={r.Id} value={r.Id}>{r.NombreCompleto}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            PESTAÑA: INVENTARIO (+ nueva categoría)
        ══════════════════════════════════════ */}
        {activeTab === 'inventario' && (
          <div className="card">
            <h3>🛠️ Gestión de Almacén</h3>

            {/* Buscador */}
            <div style={{ margin:'16px 0' }}>
              <input type="text" placeholder="🔍 Buscar artículo..." value={busquedaArticulo}
                onChange={e => setBusquedaArticulo(e.target.value)} style={{ ...inputStyle, width:'100%' }} />
            </div>

            {/* Formulario artículo */}
            <form onSubmit={guardarArticulo} style={{ ...cardSeccion }}>
              <h4 style={{ marginBottom:'12px' }}>{editandoArticulo ? '✏️ Modificar Artículo' : '✨ Nuevo Artículo'}</h4>

              <div className="flex-row">
                <input placeholder="Nombre del Producto" value={artForm.Nombre}
                  onChange={e => setArtForm({...artForm, Nombre:e.target.value})} required style={inputStyle} />
                <input type="number" step="0.01" placeholder="Precio Venta ($)" value={artForm.Precio}
                  onChange={e => setArtForm({...artForm, Precio:e.target.value})} required style={inputStyle} />
                <input type="number" placeholder="Stock inicial" value={artForm.Stock}
                  onChange={e => setArtForm({...artForm, Stock:e.target.value})} required style={inputStyle} />
              </div>

              {/* Categoría + botón crear categoría */}
              <div style={{ display:'flex', gap:'10px', marginTop:'10px', alignItems:'flex-end', flexWrap:'wrap' }}>
                <div style={{ flex:2, display:'flex', flexDirection:'column', gap:'4px' }}>
                  <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>Categoría</label>
                  <select value={artForm.CategoriaId}
                    onChange={e => setArtForm({...artForm, CategoriaId:e.target.value})}
                    required style={{ ...inputStyle }}>
                    <option value="">Selecciona categoría...</option>
                    {categorias.map(c => <option key={c.Id} value={c.Id}>{c.Nombre}</option>)}
                  </select>
                </div>
                <button type="button"
                  onClick={() => setMostrarNuevaCat(v => !v)}
                  style={{ ...inputStyle, background: mostrarNuevaCat ? '#495057' : 'var(--primary-color)', color:'white', border:'none', cursor:'pointer', whiteSpace:'nowrap', height:'42px' }}>
                  {mostrarNuevaCat ? '✕ Cancelar' : '+ Nueva Categoría'}
                </button>
              </div>

              {/* Panel nueva categoría inline */}
              {mostrarNuevaCat && (
                <div style={{ display:'flex', gap:'10px', marginTop:'10px', padding:'12px', background:'var(--bg-secondary)', borderRadius:'8px', border:'1px solid var(--border-color)', alignItems:'center' }}>
                  <input placeholder="Nombre de la nueva categoría" value={nuevaCatNombre}
                    onChange={e => setNuevaCatNombre(e.target.value)}
                    style={{ ...inputStyle, flex:1 }} autoFocus />
                  <button type="button" onClick={crearCategoria}
                    style={{ ...inputStyle, background:'#2b8a3e', color:'white', border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                    Crear Categoría
                  </button>
                </div>
              )}

              <div className="flex-row" style={{ marginTop:'10px' }}>
                <input placeholder="URL de la Imagen" value={artForm.Imagen}
                  onChange={e => setArtForm({...artForm, Imagen:e.target.value})} style={inputStyle} />
                <input type="number" min="0" max="100" placeholder="% Descuento"
                  value={artForm.Descuento}
                  onChange={e => setArtForm({...artForm, Descuento:parseInt(e.target.value)||0})} style={{ ...inputStyle, maxWidth:'140px' }} />
                <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', cursor:'pointer' }}>
                  <input type="checkbox" checked={artForm.Destacado}
                    onChange={e => setArtForm({...artForm, Destacado:e.target.checked})} />
                  ⭐ Destacado
                </label>
              </div>

              <div className="flex-row" style={{ marginTop:'14px' }}>
                <button type="submit" className="btn" style={{ maxWidth:'180px' }}>
                  {editandoArticulo ? '💾 Actualizar' : '✨ Guardar Artículo'}
                </button>
                {editandoArticulo && (
                  <button type="button" className="btn-danger"
                    onClick={() => { setEditandoArticulo(null); setArtForm({ Nombre:'', Precio:'', Stock:'', CategoriaId:'', Imagen:'', Descuento:0, Destacado:false }); }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            {/* Grid artículos */}
            {articulosFiltrados.length === 0 ? (
              <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'20px' }}>No se encontraron artículos.</p>
            ) : (
              <div className="grid" style={{ marginTop:'16px' }}>
                {articulosFiltrados.map(a => (
                  <div key={a.Id} style={{ border:'1px solid var(--border-color)', padding:'14px', borderRadius:'10px', background:'var(--bg-primary)' }}>
                    {a.Imagen && <img src={a.Imagen} alt={a.Nombre} style={{ width:'100%', height:'80px', objectFit:'cover', borderRadius:'6px', marginBottom:'8px' }} />}
                    <h4 style={{ marginBottom:'4px' }}>{a.Nombre}</h4>
                    {a.Destacado && <p style={{ color:'#f59f00', fontSize:'0.82rem', fontWeight:'bold' }}>⭐ Destacado</p>}
                    {a.Descuento > 0 && <p style={{ color:'#e03131', fontSize:'0.82rem', fontWeight:'bold' }}>🔥 {a.Descuento}% OFF</p>}
                    <p style={{ fontSize:'0.9rem' }}>💲{Number(a.Precio).toFixed(2)}</p>
                    <p style={{ fontSize:'0.9rem' }}>Stock: <strong style={{ color: a.Stock > 5 ? '#2b8a3e' : '#e03131' }}>{a.Stock} uds.</strong></p>
                    <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                      <button className="btn" style={{ background:'#e0aa00', flex:1, padding:'5px' }} onClick={() => editarArticulo(a)}>Editar</button>
                      <button className="btn-danger" style={{ flex:1, padding:'5px' }} onClick={() => eliminarArticulo(a.Id)}>Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            PESTAÑA: PROVEEDORES
        ══════════════════════════════════════ */}
        {activeTab === 'proveedores' && (
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
            <div className="card" style={{ flex:1, minWidth:'300px' }}>
              <h3>🤝 Registro de Proveedores</h3>
              <form onSubmit={registrarProveedor} className="form-group" style={{ marginTop:'10px' }}>
                <input placeholder="Razón Social / Nombre" value={provForm.Nombre} onChange={e => setProvForm({...provForm, Nombre:e.target.value})} required />
                <input placeholder="Nombre del Contacto" value={provForm.Contacto} onChange={e => setProvForm({...provForm, Contacto:e.target.value})} />
                <input placeholder="Teléfono" value={provForm.Telefono} onChange={e => setProvForm({...provForm, Telefono:e.target.value})} />
                <button type="submit" className="btn">Guardar Proveedor</button>
              </form>
              <h3 style={{ marginTop:'20px' }}>📅 Programar Recepción</h3>
              <form onSubmit={programarEntregaProv} className="form-group" style={{ marginTop:'10px' }}>
                <select value={entForm.ProveedorId} onChange={e => setEntForm({...entForm, ProveedorId:e.target.value})} required>
                  <option value="">Selecciona Proveedor...</option>
                  {proveedores.map(p => <option key={p.Id} value={p.Id}>{p.Nombre}</option>)}
                </select>
                <input type="datetime-local" value={entForm.FechaProgramada} onChange={e => setEntForm({...entForm, FechaProgramada:e.target.value})} required />
                <input type="number" step="0.01" placeholder="Costo Total ($)" value={entForm.MontoAPagar} onChange={e => setEntForm({...entForm, MontoAPagar:e.target.value})} required />
                <button type="submit" className="btn">Programar Entrada</button>
              </form>
            </div>
            <div className="card" style={{ flex:2, minWidth:'320px' }}>
              <h3>📊 Cuentas por Pagar y Entregas</h3>
              <table style={{ width:'100%', marginTop:'15px', borderCollapse:'collapse', textAlign:'left' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid var(--border-color)' }}>
                    <th style={{ padding:'8px' }}>Proveedor</th><th>Fecha</th><th>Pago</th><th>Estado</th><th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {entregasProv.map(e => (
                    <tr key={e.Id} style={{ borderBottom:'1px solid var(--border-color)' }}>
                      <td style={{ padding:'8px' }}>{e.ProveedorNombre}</td>
                      <td>{new Date(e.FechaProgramada).toLocaleString()}</td>
                      <td style={{ fontWeight:'bold' }}>${e.MontoAPagar.toFixed(2)}</td>
                      <td><span className={`badge ${e.Estado === 'Recibida' ? 'badge-success' : 'badge-pending'}`}>{e.Estado}</span></td>
                      <td>{e.Estado === 'Programada' && <button className="btn" style={{ padding:'4px 8px', fontSize:'0.85rem' }} onClick={() => recibirEntregaProveedor(e.Id)}>Recibir</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop:'20px', background:'var(--bg-primary)', padding:'15px', borderRadius:'6px', textAlign:'right' }}>
                <h4>Pasivo Total Pendiente:</h4>
                <h2 style={{ color:'var(--accent-color)' }}>
                  ${entregasProv.filter(e => e.Estado === 'Programada').reduce((acc, c) => acc + c.MontoAPagar, 0).toFixed(2)}
                </h2>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            PESTAÑA: REPARTIDORES
        ══════════════════════════════════════ */}
        {activeTab === 'repartidores' && (
          <div className="card">
            <h3>🛵 Control de Repartidores y Rutas</h3>
            <div style={{ marginTop:'20px' }}>
              {repartidores.map(rep => {
                const rutas = pedidos.filter(p => p.RepartidorId === rep.Id);
                return (
                  <div key={rep.Id} style={{ border:'1px solid var(--border-color)', padding:'15px', borderRadius:'8px', marginBottom:'15px' }}>
                    <h4>{rep.NombreCompleto} <span style={{ color:'gray', fontSize:'0.9rem' }}>(Chofer)</span></h4>
                    <p style={{ margin:'10px 0', fontWeight:'bold' }}>Rutas Asignadas ({rutas.length}):</p>
                    {rutas.length === 0 ? <p style={{ color:'gray' }}>No tiene rutas asignadas.</p> : (
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
                        <tbody>
                          {rutas.map(r => (
                            <tr key={r.Id} style={{ borderBottom:'1px solid #eee' }}>
                              <td style={{ padding:'8px 0' }}><strong>Pedido #{r.Id}</strong></td>
                              <td>Destino: {r.Calle} #{r.Numero}, {r.Colonia}</td>
                              <td style={{ color:'var(--primary-color)' }}>{r.HorarioEntrega}</td>
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

        {/* ══════════════════════════════════════
            PESTAÑA: VENTAS
        ══════════════════════════════════════ */}
        {activeTab === 'ventas' && (
          <div className="card">
            <h2>📊 Resumen de Ventas</h2>
            <div style={{ display:'flex', gap:'15px', marginBottom:'20px', flexWrap:'wrap' }}>
              <div className="card"><h4>💰 Total Vendido</h4><h2>${totalVentas.toFixed(2)}</h2></div>
              <div className="card"><h4>📦 Pedidos Totales</h4><h2>{ventas.length}</h2></div>
              <div className="card"><h4>✅ Entregados</h4><h2>{pedidosEntregados}</h2></div>
              <div className="card"><h4>⏳ Pendientes</h4><h2>{pedidosPendientes}</h2></div>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse', marginTop:'15px' }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--border-color)' }}>
                  <th style={{ padding:'8px' }}>Folio</th><th>Cliente</th><th>Horario</th><th>Total</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(v => (
                  <tr key={v.Id} style={{ borderBottom:'1px solid var(--border-color)' }}>
                    <td style={{ padding:'8px' }}>#{v.Id}</td>
                    <td>{v.Cliente}</td>
                    <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{v.HorarioEntrega}</td>
                    <td style={{ fontWeight:600 }}>${Number(v.Total).toFixed(2)}</td>
                    <td><span className={`badge ${v.Estado === 'Entregado' ? 'badge-success' : 'badge-progress'}`}>{v.Estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════
            PESTAÑA: EMPLEADOS (alta + edición)
        ══════════════════════════════════════ */}
        {activeTab === 'empleados' && usuario.Rol === 'Administrador' && (
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
              <h3 style={{ margin:0 }}>👥 Control de Personal
                <span style={{ marginLeft:'10px', background:'var(--primary-color)', color:'white', borderRadius:'999px', padding:'2px 10px', fontSize:'0.8rem', fontWeight:600 }}>
                  {empleados.length}
                </span>
              </h3>
              <button className="btn" style={{ width:'auto', background:'#2b8a3e' }} onClick={abrirAltaEmpleado}>
                + Dar de Alta Empleado
              </button>
            </div>

            {/* Formulario alta / edición */}
            {mostrarFormEmp && (
              <form onSubmit={guardarEmpleado} style={{ ...cardSeccion, border:'1px solid var(--border-color)', marginBottom:'20px' }}>
                <h4 style={{ marginBottom:'14px' }}>{editandoEmpleado ? '✏️ Editar Empleado' : '🆕 Nuevo Empleado'}</h4>

                <div className="flex-row">
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
                    <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>Nombre Completo *</label>
                    <input placeholder="Ej: Juan García López" value={empForm.NombreCompleto}
                      onChange={e => setEmpForm({...empForm, NombreCompleto:e.target.value})} required style={inputStyle} />
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
                    <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>Usuario (login) *</label>
                    <input placeholder="Ej: juangarcia" value={empForm.Usuario}
                      onChange={e => setEmpForm({...empForm, Usuario:e.target.value})}
                      required={!editandoEmpleado} style={inputStyle} />
                  </div>
                </div>

                <div className="flex-row" style={{ marginTop:'10px' }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
                    <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>
                      {editandoEmpleado ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                    </label>
                    <input type="password" placeholder="Contraseña" value={empForm.Contrasena}
                      onChange={e => setEmpForm({...empForm, Contrasena:e.target.value})}
                      required={!editandoEmpleado} style={inputStyle} />
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
                    <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>Rol *</label>
                    <select value={empForm.Rol} onChange={e => setEmpForm({...empForm, Rol:e.target.value})} required style={{ ...inputStyle }}>
                      <option value="Repartidor">🛵 Repartidor</option>
                      <option value="Almacenista">📦 Almacenista</option>
                      <option value="Administrador">⚙️ Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="flex-row" style={{ marginTop:'10px' }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
                    <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>Teléfono</label>
                    <input placeholder="55 1234 5678" value={empForm.Telefono}
                      onChange={e => setEmpForm({...empForm, Telefono:e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
                    <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>Correo electrónico</label>
                    <input type="email" placeholder="correo@ejemplo.com" value={empForm.Correo}
                      onChange={e => setEmpForm({...empForm, Correo:e.target.value})} style={inputStyle} />
                  </div>
                </div>

                <div className="flex-row" style={{ marginTop:'16px' }}>
                  <button type="submit" className="btn" style={{ maxWidth:'200px', background:'#2b8a3e' }}>
                    {editandoEmpleado ? '💾 Actualizar Empleado' : '✅ Registrar Empleado'}
                  </button>
                  <button type="button" className="btn-danger"
                    onClick={() => { setMostrarFormEmp(false); setEditandoEmpleado(null); }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Tabla de empleados */}
            {empleados.length === 0 ? (
              <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'30px' }}>No hay empleados registrados.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {empleados.map(emp => (
                  <div key={emp.Id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', borderRadius:'10px', border:'1px solid var(--border-color)', background:'var(--bg-primary)', flexWrap:'wrap' }}>
                    {/* Avatar inicial */}
                    <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'var(--primary-color)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.1rem', flexShrink:0 }}>
                      {(emp.NombreCompleto || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                        <span style={{ fontWeight:600 }}>{emp.NombreCompleto}</span>
                        <span className={`badge ${emp.Rol === 'Administrador' ? 'badge-pending' : emp.Rol === 'Repartidor' ? 'badge-progress' : 'badge-success'}`}>{emp.Rol}</span>
                      </div>
                      <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', margin:'3px 0' }}>
                        👤 {emp.Usuario}
                        {emp.Correo && <span> · ✉️ {emp.Correo}</span>}
                        {emp.Telefono && <span> · 📞 {emp.Telefono}</span>}
                      </p>
                    </div>
                    <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                      <button className="btn" style={{ background:'#e0aa00', padding:'6px 12px', width:'auto', fontSize:'0.85rem' }}
                        onClick={() => editarEmpleado(emp)}>
                        ✏️ Editar
                      </button>
                      <button className="btn-danger" style={{ padding:'6px 12px', fontSize:'0.85rem' }}
                        onClick={() => eliminarEmpleado(emp.Id)}>
                        🗑️ Baja
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}