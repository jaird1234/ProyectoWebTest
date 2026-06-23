import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Tienda({ usuario, setUsuario, openLogin }) {
  const [articulos, setArticulos]                   = useState([]);
  const [carrito, setCarrito]                       = useState([]);
  const [carritoAbierto, setCarritoAbierto]         = useState(false);
  const [checkoutMode, setCheckoutMode]             = useState(false);
  const [busquedaProducto, setBusquedaProducto]     = useState('');
  const [categorias, setCategorias]                 = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [fechaEntrega, setFechaEntrega]             = useState('');
  const [horario, setHorario]                       = useState('');
  const [direccionEnvio, setDireccionEnvio]         = useState({ Calle:'', Numero:'', Colonia:'', Municipio:'', CodigoPostal:'' });
  const [datosPago, setDatosPago]                   = useState({ Numero:'', Titular:'', Vencimiento:'', CVV:'' });
  const panelRef = useRef(null);

  const rangosHorarios = [
    "11:00 AM - 12:00 PM","12:00 PM - 01:00 PM","01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM","03:00 PM - 04:00 PM"
  ];

  useEffect(() => { cargarArticulos(); }, []);

  useEffect(() => {
    if (usuario) {
      setDireccionEnvio({
        Calle: usuario.Calle || '', Numero: usuario.Numero || '',
        Colonia: usuario.Colonia || '', Municipio: usuario.Municipio || '',
        CodigoPostal: usuario.CodigoPostal || ''
      });
    }
  }, [usuario]);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (carritoAbierto && panelRef.current && !panelRef.current.contains(e.target)
          && !e.target.closest('.carrito-fab')) {
        setCarritoAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [carritoAbierto]);

  const cargarArticulos = async () => {
    try {
      const [resArt, resCat] = await Promise.all([
        axios.get('/api/articulos'),
        axios.get('/api/categorias'),
      ]);
      setArticulos(Array.isArray(resArt.data) ? resArt.data : []);
      setCategorias(Array.isArray(resCat.data) ? resCat.data : []);
    } catch (err) { console.error('Error al cargar datos:', err); }
  };

  const articulosFiltrados = articulos.filter(a => {
    const coincideNombre = a.Nombre.toLowerCase().includes(busquedaProducto.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === '' || a.CategoriaId === parseInt(categoriaSeleccionada);
    return coincideNombre && coincideCategoria;
  });

  const productosDestacados = articulos.filter(a => a.Destacado === true || a.Destacado === 1);
  const productosOferta     = articulos.filter(a => a.Descuento > 0);

  const agregarAlCarrito = (prod) => {
    setCarrito(prev => {
      const ext = prev.find(i => i.Id === prod.Id);
      return ext
        ? prev.map(i => i.Id === prod.Id ? { ...i, Cantidad: i.Cantidad + 1 } : i)
        : [...prev, { ...prod, Cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cant) => {
    const prod = articulos.find(a => a.Id === id);
    if (prod && cant > prod.Stock) return alert('No puedes exceder existencias.');
    if (cant <= 0) return setCarrito(carrito.filter(i => i.Id !== id));
    setCarrito(carrito.map(i => i.Id === id ? { ...i, Cantidad: cant } : i));
  };

  const totalCarrito = carrito.reduce((acc, item) => {
    const precio = item.Descuento > 0 ? item.Precio * (1 - item.Descuento / 100) : item.Precio;
    return acc + precio * item.Cantidad;
  }, 0);

  const totalItems = carrito.reduce((acc, item) => acc + item.Cantidad, 0);

  const procesarCheckout = () => {
    if (carrito.length === 0) return alert('El carrito está vacío.');
    if (!usuario) { openLogin(); } else { setCarritoAbierto(false); setCheckoutMode(true); }
  };

  const enviarPedido = async () => {
    if (!fechaEntrega) return alert('Selecciona el día de entrega.');
    if (!horario) return alert('Selecciona una hora de entrega.');
    if (!datosPago.Numero || !datosPago.CVV) return alert('Ingresa los datos de la tarjeta (simulados).');

    const sub = totalCarrito;
    const iva = sub * 0.16;
    const tot = sub + iva;
    const horarioFinal = `${fechaEntrega} | ${horario}`;

    const payload = {
      ClienteId: usuario.Id, HorarioEntrega: horarioFinal, ...direccionEnvio,
      Subtotal: sub, IVA: iva, Total: tot,
      detalle: carrito.map(i => ({ ProductoId: i.Id, Cantidad: i.Cantidad, PrecioUnitario: i.Precio, Subtotal: i.Precio * i.Cantidad }))
    };

    try {
      await axios.post('/api/pedidos', payload);
      alert('🚀 ¡Pago Aprobado y Pedido recibido!');
      setCarrito([]); setCheckoutMode(false); cargarArticulos();
    } catch (err) { alert('Error procesando el pedido'); }
  };

  // ── Estilos del carrito flotante ──
  const styles = {
    fab: {
      position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000,
      width: '60px', height: '60px', borderRadius: '50%',
      backgroundColor: 'var(--primary-color)', color: 'white',
      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    badge: {
      position: 'absolute', top: '-6px', right: '-6px',
      backgroundColor: '#e03131', color: 'white', borderRadius: '50%',
      width: '22px', height: '22px', fontSize: '0.75rem', fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '2px solid white',
    },
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)',
      zIndex: 999, opacity: carritoAbierto ? 1 : 0,
      pointerEvents: carritoAbierto ? 'all' : 'none',
      transition: 'opacity 0.25s ease',
    },
    panel: {
      position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
      width: '360px', maxWidth: '95vw',
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column',
      transform: carritoAbierto ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
    },
    panelHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px', borderBottom: '1px solid var(--border-color)',
    },
    panelBody: { flex: 1, overflowY: 'auto', padding: '16px' },
    panelFooter: {
      padding: '16px 20px', borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
    },
    itemRow: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 0', borderBottom: '1px solid var(--border-color)',
    },
    itemImg: { width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', background: '#eee' },
    qtyBtn: {
      width: '28px', height: '28px', border: '1px solid var(--border-color)',
      borderRadius: '6px', background: 'var(--bg-primary)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)',
    },
  };

  return (
    <div>
      {/* ── CONTENIDO PRINCIPAL ── */}
      {!checkoutMode ? (
        <>
          {/* Destacados */}
          <h2 style={{ marginBottom: '15px', color: '#f59f00' }}>⭐ Productos Destacados del Día</h2>
          <div className="grid">
            {productosDestacados.map(a => (
              <div key={a.Id} className="card tienda-card">
                <div style={{ background:'#ffd43b', color:'#000', padding:'5px 8px', borderRadius:'6px', fontWeight:'bold', marginBottom:'10px', textAlign:'center', fontSize:'0.85rem' }}>⭐ Destacado</div>
                <div className="img-wrap"><img src={a.Imagen} alt={a.Nombre} /></div>
                <h3>{a.Nombre}</h3>
                <p style={{ fontSize:'1.3rem', fontWeight:'bold' }}>${a.Precio.toFixed(2)}</p>
                <button className="btn" onClick={() => { agregarAlCarrito(a); setCarritoAbierto(true); }}>Agregar al Carrito</button>
              </div>
            ))}
          </div>

          {/* Ofertas */}
          <h2 style={{ marginTop:'40px', marginBottom:'15px', color:'#e03131' }}>🔥 Productos en Oferta</h2>
          <div className="grid">
            {productosOferta.map(a => {
              const precioFinal = a.Precio * (1 - a.Descuento / 100);
              return (
                <div key={a.Id} className="card tienda-card">
                  <div style={{ background:'#fa5252', color:'white', padding:'6px', borderRadius:'6px', textAlign:'center', fontWeight:'bold', marginBottom:'10px', fontSize:'0.85rem' }}>🔥 {a.Descuento}% OFF</div>
                  <div className="img-wrap"><img src={a.Imagen} alt={a.Nombre} /></div>
                  <h3>{a.Nombre}</h3>
                  <p style={{ textDecoration:'line-through', color:'#999', margin:'2px 0' }}>${a.Precio.toFixed(2)}</p>
                  <p style={{ color:'#e03131', fontWeight:'bold', fontSize:'1.4rem', margin:'2px 0' }}>${precioFinal.toFixed(2)}</p>
                  <button className="btn" onClick={() => { agregarAlCarrito(a); setCarritoAbierto(true); }}>Agregar al Carrito</button>
                </div>
              );
            })}
          </div>

          {/* Catálogo general */}
          <h2 style={{ marginTop:'40px', marginBottom:'20px' }}>Todos los Productos</h2>
          <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
            <input type="text" placeholder="🔍 Buscar producto..."
              value={busquedaProducto} onChange={e => setBusquedaProducto(e.target.value)}
              style={{ flex:2, minWidth:'250px', padding:'12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-primary)', color:'var(--text-main)' }}
            />
            <select value={categoriaSeleccionada} onChange={e => setCategoriaSeleccionada(e.target.value)}
              style={{ flex:1, minWidth:'200px', padding:'12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-primary)', color:'var(--text-main)' }}>
              <option value="">Todas las categorías</option>
              {categorias.map(cat => <option key={cat.Id} value={cat.Id}>{cat.Nombre}</option>)}
            </select>
          </div>

          {articulosFiltrados.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No se encontraron productos.</div>
          )}
          <div className="grid">
            {articulosFiltrados.map(a => (
              <div key={a.Id} className="card tienda-card">
                <div className="img-wrap"><img src={a.Imagen} alt={a.Nombre} /></div>
                <h3>{a.Nombre}</h3>
                <p style={{ fontSize:'1.3rem', fontWeight:'bold', margin:'5px 0' }}>${a.Precio.toFixed(2)}</p>
                <p style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Precio sin IVA ni envío</p>
                <button className="btn" style={{ marginTop:'10px' }}
                  onClick={() => { agregarAlCarrito(a); setCarritoAbierto(true); }}
                  disabled={a.Stock === 0}>
                  {a.Stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ── CHECKOUT ── */
        <div className="card">
          <h2>🏠 Detalles Completos de Envío</h2>
          <div className="flex-row" style={{ marginTop:'15px' }}>
            <input placeholder="Calle" value={direccionEnvio.Calle} onChange={e => setDireccionEnvio({...direccionEnvio, Calle:e.target.value})} />
            <input placeholder="Número Int/Ext" value={direccionEnvio.Numero} onChange={e => setDireccionEnvio({...direccionEnvio, Numero:e.target.value})} />
          </div>
          <div className="flex-row" style={{ marginTop:'15px' }}>
            <input placeholder="Colonia" value={direccionEnvio.Colonia} onChange={e => setDireccionEnvio({...direccionEnvio, Colonia:e.target.value})} />
            <input placeholder="Municipio/Delegación" value={direccionEnvio.Municipio} onChange={e => setDireccionEnvio({...direccionEnvio, Municipio:e.target.value})} />
            <input placeholder="Código Postal" value={direccionEnvio.CodigoPostal} onChange={e => setDireccionEnvio({...direccionEnvio, CodigoPostal:e.target.value})} />
          </div>

          <h3 style={{ margin:'20px 0 10px' }}>📅 Día y Horario Deseado</h3>
          <div className="flex-row" style={{ marginBottom:'25px' }}>
            <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} style={{ flex:1 }} />
            <select value={horario} onChange={e => setHorario(e.target.value)} style={{ flex:2 }}>
              <option value="">Selecciona una franja horaria...</option>
              {rangosHorarios.map((r,i) => <option key={i} value={r}>{r}</option>)}
            </select>
          </div>

          <hr style={{ margin:'20px 0', borderColor:'var(--border-color)' }} />
          <h3>💳 Procesar Pago con Tarjeta</h3>
          <div style={{ backgroundColor:'#fff3cd', color:'#856404', padding:'14px', borderRadius:'8px', border:'1px solid #ffc107', margin:'15px 0', fontWeight:'bold', fontSize:'0.9rem' }}>
            ⚠️ Proyecto escolar — NO uses datos reales de tarjeta.
          </div>
          <div className="flex-row">
            <input placeholder="Número de Tarjeta (Inventado)" value={datosPago.Numero} onChange={e => setDatosPago({...datosPago, Numero:e.target.value})} />
            <input placeholder="Titular (Inventado)" value={datosPago.Titular} onChange={e => setDatosPago({...datosPago, Titular:e.target.value})} />
          </div>
          <div className="flex-row">
            <input placeholder="MM/AA (Ej. 12/28)" value={datosPago.Vencimiento} onChange={e => setDatosPago({...datosPago, Vencimiento:e.target.value})} />
            <input placeholder="CVV (Ej. 123)" value={datosPago.CVV} onChange={e => setDatosPago({...datosPago, CVV:e.target.value})} />
          </div>

          {/* Resumen de la orden */}
          <div style={{ margin:'20px 0', background:'var(--bg-primary)', borderRadius:'10px', padding:'16px' }}>
            <h4 style={{ marginBottom:'10px' }}>📋 Resumen de tu orden</h4>
            {carrito.map(item => {
              const precio = item.Descuento > 0 ? item.Precio * (1 - item.Descuento / 100) : item.Precio;
              return (
                <div key={item.Id} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem', padding:'4px 0', borderBottom:'1px solid var(--border-color)' }}>
                  <span>{item.Nombre} × {item.Cantidad}</span>
                  <span>${(precio * item.Cantidad).toFixed(2)}</span>
                </div>
              );
            })}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'10px', fontSize:'0.9rem', color:'var(--text-muted)' }}>
              <span>Subtotal</span><span>${totalCarrito.toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'var(--text-muted)' }}>
              <span>IVA (16%)</span><span>${(totalCarrito * 0.16).toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'1.1rem', marginTop:'8px', paddingTop:'8px', borderTop:'1px solid var(--border-color)' }}>
              <span>Total</span><span>${(totalCarrito * 1.16).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex-row" style={{ marginTop:'10px' }}>
            <button className="btn-danger" style={{ flex:1 }} onClick={() => setCheckoutMode(false)}>Cancelar</button>
            <button className="btn" style={{ flex:2, background:'#28a745' }} onClick={enviarPedido}>Pagar y Confirmar Pedido</button>
          </div>
        </div>
      )}

      {/* ── OVERLAY ── */}
      <div style={styles.overlay} onClick={() => setCarritoAbierto(false)} />

      {/* ── PANEL DESLIZABLE DEL CARRITO ── */}
      <div ref={panelRef} style={styles.panel}>
        <div style={styles.panelHeader}>
          <h3 style={{ margin:0 }}>🛒 Tu Carrito {totalItems > 0 && <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:'0.9rem' }}>({totalItems} items)</span>}</h3>
          <button onClick={() => setCarritoAbierto(false)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.4rem', color:'var(--text-muted)', lineHeight:1 }}>×</button>
        </div>

        <div style={styles.panelBody}>
          {carrito.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom:'12px', opacity:0.4 }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p style={{ fontWeight:600, marginBottom:'4px' }}>El carrito está vacío</p>
              <p style={{ fontSize:'0.85rem' }}>Agrega productos para comenzar.</p>
            </div>
          ) : (
            carrito.map(item => {
              const precio = item.Descuento > 0 ? item.Precio * (1 - item.Descuento / 100) : item.Precio;
              return (
                <div key={item.Id} style={styles.itemRow}>
                  <img src={item.Imagen} alt={item.Nombre} style={styles.itemImg} onError={e => e.target.style.display='none'} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:'4px' }}>{item.Nombre}</p>
                    {item.Descuento > 0 && <span style={{ fontSize:'0.75rem', color:'#e03131', fontWeight:600 }}>{item.Descuento}% OFF · </span>}
                    <span style={{ fontSize:'0.9rem', fontWeight:700 }}>${precio.toFixed(2)}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <button style={styles.qtyBtn} onClick={() => cambiarCantidad(item.Id, item.Cantidad - 1)}>−</button>
                    <span style={{ minWidth:'20px', textAlign:'center', fontWeight:600 }}>{item.Cantidad}</span>
                    <button style={styles.qtyBtn} onClick={() => cambiarCantidad(item.Id, item.Cantidad + 1)}>+</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {carrito.length > 0 && (
          <div style={styles.panelFooter}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'4px' }}>
              <span>Subtotal (sin IVA)</span><span>${totalCarrito.toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'1.1rem', marginBottom:'16px' }}>
              <span>Total estimado</span><span>${(totalCarrito * 1.16).toFixed(2)}</span>
            </div>
            <button className="btn" style={{ width:'100%', padding:'14px', fontSize:'1rem', background:'#28a745' }} onClick={procesarCheckout}>
              Finalizar Compra →
            </button>
          </div>
        )}
      </div>

      {/* ── BOTÓN FLOTANTE (FAB) ── */}
      <button className="carrito-fab"
        onClick={() => setCarritoAbierto(v => !v)}
        style={styles.fab}
        onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        aria-label="Abrir carrito"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {totalItems > 0 && <span style={styles.badge}>{totalItems > 99 ? '99+' : totalItems}</span>}
      </button>
    </div>
  );
}