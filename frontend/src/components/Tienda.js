import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Tienda({ usuario, setUsuario, openLogin }) {
  const [articulos, setArticulos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  // Estados de Envío y Pago
  const [fechaEntrega, setFechaEntrega] = useState(''); // Nuevo estado para el Día
  const [horario, setHorario] = useState('');
  const [direccionEnvio, setDireccionEnvio] = useState({ Calle: '', Numero: '', Colonia: '', Municipio: '', CodigoPostal: '' });
  const [datosPago, setDatosPago] = useState({ Numero: '', Titular: '', Vencimiento: '', CVV: '' });

  const rangosHorarios = ["11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM"];

  useEffect(() => { cargarArticulos(); }, []);

  useEffect(() => {
    if (usuario) {
      setDireccionEnvio({
        Calle: usuario.Calle || '',
        Numero: usuario.Numero || '',
        Colonia: usuario.Colonia || '',
        Municipio: usuario.Municipio || '',
        CodigoPostal: usuario.CodigoPostal || ''
      });
    }
  }, [usuario]);
  useEffect(() => {
  console.log("Carrito:", carrito);
}, [carrito]);

console.log(
  "TOTAL:",
  carrito.reduce(
    (a, b) => a + (b.Precio * b.Cantidad),
    0
  )
);

  const cargarArticulos = async () => {
  try {
    const resArt = await axios.get('/api/articulos');
    const resCat = await axios.get('/api/categorias');

    setArticulos(Array.isArray(resArt.data) ? resArt.data : []);
    setCategorias(Array.isArray(resCat.data) ? resCat.data : []);
  } catch (err) {
    console.error("Error al cargar datos:", err);
  }
};
const articulosFiltrados = articulos.filter(a => {
  const coincideNombre =
    a.Nombre.toLowerCase().includes(
      busquedaProducto.toLowerCase()
    );

  const coincideCategoria =
    categoriaSeleccionada === '' ||
    a.CategoriaId === parseInt(categoriaSeleccionada);

  return coincideNombre && coincideCategoria;
});

const productosDestacados = articulos.filter(
  a => a.Destacado === true || a.Destacado === 1
);

const productosOferta = articulos.filter(
  a => a.Descuento > 0
);
const agregarAlCarrito = (prod) => {
  setCarrito(prev => {
    const ext = prev.find(i => i.Id === prod.Id);

    if (ext) {
      return prev.map(i =>
        i.Id === prod.Id
          ? { ...i, Cantidad: i.Cantidad + 1 }
          : i
      );
    }

    return [...prev, { ...prod, Cantidad: 1 }];
  });
};


  const cambiarCantidad = (id, cant) => {
    const prod = articulos.find(a => a.Id === id);
    if (cant > prod.Stock) return alert('No puedes exceder existencias.');
    if (cant <= 0) return setCarrito(carrito.filter(i => i.Id !== id));
    setCarrito(carrito.map(i => i.Id === id ? { ...i, Cantidad: cant } : i));
  };
  

  const procesarCheckout = () => {
    if (carrito.length === 0) return alert('El carrito está vacío.');
    if (!usuario) { openLogin(); } else { setCheckoutMode(true); }
  };

  const enviarPedido = async () => {
    if (!fechaEntrega) return alert('Selecciona el día de entrega.');
    if (!horario) return alert('Selecciona una hora de entrega.');
    if (!datosPago.Numero || !datosPago.CVV) return alert('Ingresa los datos de la tarjeta (simulados).');

    const sub = carrito.reduce((total, item) => {
  const precioFinal = item.Descuento > 0 ? item.Precio - (item.Precio * item.Descuento / 100): item.Precio;
   return total + (precioFinal * item.Cantidad);}, 0);
    const iva = sub * 0.16;
    const tot = sub + iva;

    // Unimos el día y la hora en un solo texto para el backend
    const horarioFinal = `${fechaEntrega} | ${horario}`;

    const payload = {
      ClienteId: usuario.Id,
      HorarioEntrega: horarioFinal,
      ...direccionEnvio,
      Subtotal: sub,
      IVA: iva,
      Total: tot,
      detalle: carrito.map(i => ({ ProductoId: i.Id, Cantidad: i.Cantidad, PrecioUnitario: i.Precio, Subtotal: i.Precio * i.Cantidad }))
    };

    try {
      await axios.post('/api/pedidos', payload);
      alert('🚀 ¡Pago Aprobado y Pedido recibido!');
      setCarrito([]);
      setCheckoutMode(false);
      cargarArticulos();
    } catch (err) { alert('Error procesando el pedido'); }
  };
  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      
      <div style={{ flex: 3, minWidth: '320px' }}>
        {!checkoutMode ? (
          <>
<h2 style={{ marginBottom: '15px', color: '#f59f00' }}>
  ⭐ Productos Destacados del Día
</h2>

<div className="grid">
  {productosDestacados.map(a => (
    <div key={a.Id} className="card tienda-card">
      <div
        style={{
          background: '#ffd43b',
          color: '#000',
          padding: '5px',
          borderRadius: '6px',
          fontWeight: 'bold',
          marginBottom: '10px',
          textAlign: 'center'
        }}
      >
        ⭐ Destacado
      </div>

      <div className="img-wrap">
        <img src={a.Imagen} alt={a.Nombre} />
      </div>

      <h3>{a.Nombre}</h3>

      <p style={{
        fontSize: '1.3rem',
        fontWeight: 'bold'
      }}>
        ${a.Precio.toFixed(2)}
      </p>

      <button
        className="btn"
        onClick={() => agregarAlCarrito(a)}
      >
        Agregar al Carrito
      </button>
    </div>
  ))}
</div>

<h2
  style={{
    marginTop: '40px',
    marginBottom: '15px',
    color: '#e03131'
  }}
>
  🔥 Productos en Oferta
</h2>

<div className="grid">
  {productosOferta.map(a => {
    const precioFinal =
      a.Precio - (a.Precio * a.Descuento / 100);
        console.log(
  "Productos visibles:",
  carrito.map(x => x.Nombre)
);

    return (
      <div key={a.Id} className="card tienda-card">

        <div
          style={{
            background: '#fa5252',
            color: 'white',
            padding: '6px',
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}
        >
          🔥 {a.Descuento}% OFF
        </div>

        <div className="img-wrap">
          <img src={a.Imagen} alt={a.Nombre} />
        </div>

        <h3>{a.Nombre}</h3>

        <p
          style={{
            textDecoration: 'line-through',
            color: '#999'
          }}
        >
          ${a.Precio.toFixed(2)}
        </p>

        <p
          style={{
            color: '#e03131',
            fontWeight: 'bold',
            fontSize: '1.4rem'
          }}
        >
          ${precioFinal.toFixed(2)}
        </p>

        <button
          className="btn"
          onClick={() => agregarAlCarrito(a)}
        >
          Agregar al Carrito
        </button>

      </div>
    );
  })}
</div>

 <h2 style={{ marginBottom: '20px' }}>
  Productos para entrega hoy
</h2>

<div
  style={{
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  }}
>
  <input
    type="text"
    placeholder="🔍 Buscar producto..."
    value={busquedaProducto}
    onChange={(e) => setBusquedaProducto(e.target.value)}
    style={{
      flex: 2,
      minWidth: '250px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ccc'
    }}
  />
   <select
    value={categoriaSeleccionada}
    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
    style={{
      flex: 1,
      minWidth: '200px',
      padding: '12px',
      borderRadius: '8px'
    }}
  >
    <option value="">Todas las categorías</option>

    {categorias.map(cat => (
      <option key={cat.Id} value={cat.Id}>
        {cat.Nombre}
      </option>
    ))}
  </select>
</div>

{articulosFiltrados.length === 0 && (
  <div
    style={{
      textAlign: 'center',
      padding: '20px',
      color: '#666'
    }}
  >
    No se encontraron productos.
  </div>
)}
            <div className="grid">
              {articulosFiltrados?.map(a => (
                <div key={a.Id} className="card tienda-card">
                  <div className="img-wrap"><img src={a.Imagen} alt={a.Nombre} /></div>
                  <h3>{a.Nombre}</h3>
                  <p style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '5px 0' }}>${a.Precio.toFixed(2)}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(precio sin considerar IVA y envío)</p>
                  <button className="btn" style={{ marginTop: '10px' }} onClick={() => agregarAlCarrito(a)} disabled={a.Stock === 0}>
                    {a.Stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card">
            <h2>🏠 Detalles Completos de Envío</h2>
            <div className="flex-row" style={{ marginTop: '15px' }}>
              <input placeholder="Calle" value={direccionEnvio.Calle} onChange={e => setDireccionEnvio({...direccionEnvio, Calle: e.target.value})} required />
              <input placeholder="Número Int/Ext" value={direccionEnvio.Numero} onChange={e => setDireccionEnvio({...direccionEnvio, Numero: e.target.value})} required />
            </div>
            <div className="flex-row" style={{ marginTop: '15px' }}>
              <input placeholder="Colonia" value={direccionEnvio.Colonia} onChange={e => setDireccionEnvio({...direccionEnvio, Colonia: e.target.value})} required />
              <input placeholder="Municipio/Delegación" value={direccionEnvio.Municipio} onChange={e => setDireccionEnvio({...direccionEnvio, Municipio: e.target.value})} required />
              <input placeholder="Código Postal" value={direccionEnvio.CodigoPostal} onChange={e => setDireccionEnvio({...direccionEnvio, CodigoPostal: e.target.value})} required />
            </div>
            
            <h3 style={{ margin: '20px 0 10px 0' }}>📅 Día y Horario Deseado</h3>
            <div className="flex-row" style={{ marginBottom: '25px' }}>
              {/* Calendario añadido */}
              <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} required style={{ flex: 1 }}/>
              
              <select value={horario} onChange={e => setHorario(e.target.value)} required style={{ flex: 2 }}>
                <option value="">Selecciona una franja horaria...</option>
                {rangosHorarios.map((r, idx) => <option key={idx} value={r}>{r}</option>)}
              </select>
            </div>

            <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
            
            <h3>💳 Procesar Pago con Tarjeta</h3>
            <div style={{ backgroundColor: '#ffeeba', color: '#856404', padding: '15px', borderRadius: '8px', border: '1px solid #ffeeba', margin: '15px 0', fontWeight: 'bold' }}>
              ⚠️ Recuerda que esto es un proyecto escolar. POR FAVOR NO COLOQUES DATOS REALES DE TARJETAS DE CRÉDITO O DÉBITO.
            </div>
            
            <div className="flex-row">
              <input placeholder="Número de Tarjeta (Inventado)" value={datosPago.Numero} onChange={e => setDatosPago({...datosPago, Numero: e.target.value})} />
              <input placeholder="Titular (Inventado)" value={datosPago.Titular} onChange={e => setDatosPago({...datosPago, Titular: e.target.value})} />
            </div>
            <div className="flex-row">
              <input placeholder="MM/AA (Ej. 12/28)" value={datosPago.Vencimiento} onChange={e => setDatosPago({...datosPago, Vencimiento: e.target.value})} />
              <input placeholder="CVV (Ej. 123)" value={datosPago.CVV} onChange={e => setDatosPago({...datosPago, CVV: e.target.value})} />
            </div>

            <div className="flex-row" style={{ marginTop: '25px' }}>
              <button className="btn-danger" style={{ flex: 1 }} onClick={() => setCheckoutMode(false)}>Cancelar</button>
              <button className="btn" style={{ flex: 2, background: '#28a745' }} onClick={enviarPedido}>Pagar y Confirmar Pedido</button>
            </div>
          </div>
        )}
      </div>

      <div style={{flex: 1,minWidth: '280px',alignSelf: 'flex-start',border: '3px solid red',padding: '20px',background: 'white',
      overflow: 'visible',maxHeight: 'none',height: 'auto'}}>
        <h3>🛒 Carrito</h3>
        <p>Items: {carrito.length}</p>
        <hr style={{ margin: '12px 0', borderColor: 'var(--border-color)' }} />
        <div style={{
  border: '2px solid red',
  padding: '10px',
  background: '#fff'
}}>
  <h4>DEBUG CARRITO</h4>

  {carrito.map(item => (
    <div
      key={item.Id}
      style={{
        border: '1px solid blue',
        margin: '10px',
        padding: '10px'
      }}
    >
      <p>ID: {item.Id}</p>
      <p>Nombre: {item.Nombre}</p>
      <p>Cantidad: {item.Cantidad}</p>
    </div>
  ))}
</div>
        {carrito?.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: 'gray', fontSize: '0.85rem', marginBottom: '10px' }}>(precio sin considerar IVA y envío)</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>
              <span>Total Estimado:</span>
              <span> ${carrito.reduce((total, item) => {const precioFinal = item.Descuento > 0 ? item.Precio - (item.Precio * item.Descuento / 100): item.Precio;
                     return total + (precioFinal * item.Cantidad);}, 0).toFixed(2) }
              </span>
            </div>
            <button className="btn" onClick={procesarCheckout}>Finalizar Compra</button>
          </div>
        )}
      </div>

    </div>
  );
}