import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Ventas() {
  const [ventas,    setVentas]    = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [carrito,   setCarrito]   = useState([]);
  const [selId,     setSelId]     = useState('');
  const [cantidad,  setCantidad]  = useState(1);
  const [msg,       setMsg]       = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    axios.get('http://localhost:3001/api/ventas').then(r => setVentas(r.data));
    axios.get('http://localhost:3001/api/articulos').then(r => setArticulos(r.data));
  }, []);

  const agregarCarrito = () => {
    const art = articulos.find(a => a.Id === Number(selId));
    if (!art) return;
    const exist = carrito.find(c => c.Id === art.Id);
    if (exist) setCarrito(carrito.map(c => c.Id === art.Id ? { ...c, Cantidad: c.Cantidad + Number(cantidad) } : c));
    else       setCarrito([...carrito, { ...art, Cantidad: Number(cantidad) }]);
    setSelId(''); setCantidad(1);
  };

  const subtotal = carrito.reduce((s, c) => s + c.Precio * c.Cantidad, 0);
  const iva      = subtotal * 0.16;
  const total    = subtotal + iva;

  const registrarVenta = async () => {
    if (!carrito.length) return;
    await axios.post('http://localhost:3001/api/ventas', {
      UsuarioId: usuario.Id,
      Subtotal:  subtotal.toFixed(2),
      IVA:       iva.toFixed(2),
      Total:     total.toFixed(2),
      detalle:   carrito.map(c => ({ ProductoId: c.Id, Cantidad: c.Cantidad, PrecioUnitario: c.Precio, Subtotal: (c.Precio * c.Cantidad).toFixed(2) }))
    });
    setCarrito([]);
    setMsg('✅ Venta registrada');
    axios.get('http://localhost:3001/api/ventas').then(r => setVentas(r.data));
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      <h2 className="section-title">Registro de Ventas</h2>
      {msg && <p className="msg">{msg}</p>}

      <div className="form-card">
        <h3>Nueva Venta</h3>
        <div className="form-grid">
          <select value={selId} onChange={e => setSelId(e.target.value)}>
            <option value="">-- Selecciona artículo --</option>
            {articulos.map(a => <option key={a.Id} value={a.Id}>{a.Nombre} — ${Number(a.Precio).toFixed(2)}</option>)}
          </select>
          <input type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cantidad" />
        </div>
        <div className="form-actions">
          <button className="btn-primary" onClick={agregarCarrito}>+ Agregar al carrito</button>
        </div>

        {carrito.length > 0 && (
          <>
            <table className="tabla" style={{ marginTop:'1rem' }}>
              <thead><tr><th>Artículo</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead>
              <tbody>
                {carrito.map(c => (
                  <tr key={c.Id}>
                    <td>{c.Nombre}</td>
                    <td>{c.Cantidad}</td>
                    <td>${Number(c.Precio).toFixed(2)}</td>
                    <td>${(c.Precio * c.Cantidad).toFixed(2)}</td>
                    <td><button className="btn-delete" onClick={() => setCarrito(carrito.filter(x => x.Id !== c.Id))}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign:'right', marginTop:'.75rem', lineHeight:'1.8' }}>
              <p>Subtotal: <strong>${subtotal.toFixed(2)}</strong></p>
              <p>IVA (16%): <strong>${iva.toFixed(2)}</strong></p>
              <p style={{ fontSize:'1.1rem' }}>Total: <strong>${total.toFixed(2)}</strong></p>
              <button className="btn-primary" style={{ marginTop:'.75rem' }} onClick={registrarVenta}>Registrar Venta ✅</button>
            </div>
          </>
        )}
      </div>

      <h3 style={{ margin:'1rem 0 .5rem', color:'#2d6a4f' }}>Historial de Ventas</h3>
      <table className="tabla">
        <thead><tr><th>ID</th><th>Vendedor</th><th>Subtotal</th><th>IVA</th><th>Total</th><th>Fecha</th></tr></thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.Id}>
              <td>{v.Id}</td>
              <td>{v.Vendedor}</td>
              <td>${Number(v.Subtotal).toFixed(2)}</td>
              <td>${Number(v.IVA).toFixed(2)}</td>
              <td><strong>${Number(v.Total).toFixed(2)}</strong></td>
              <td>{new Date(v.Fecha).toLocaleString('es-MX')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}