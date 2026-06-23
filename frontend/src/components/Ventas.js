import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Ventas({ usuarioId }) {
  const [articulos, setArticulos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [clienteId, setClienteId] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    axios.get('http://localhost:3001/api/articulos').then(res => setArticulos(res.data));
    axios.get('http://localhost:3001/api/clientes').then(res => setClientes(res.data));
  };

  const agregarAlCarrito = (producto) => {
    if (producto.Stock <= 0) return alert('No hay stock disponible para este producto.');
    
    const itemExistente = carrito.find(item => item.ProductoId === producto.Id);
    
    if (itemExistente) {
      if (itemExistente.Cantidad >= producto.Stock) return alert('No puedes exceder el stock disponible.');
      setCarrito(carrito.map(item => 
        item.ProductoId === producto.Id 
          ? { ...item, Cantidad: item.Cantidad + 1, Subtotal: (item.Cantidad + 1) * item.PrecioUnitario } 
          : item
      ));
    } else {
      setCarrito([...carrito, { 
        ProductoId: producto.Id, 
        Nombre: producto.Nombre, 
        Cantidad: 1, 
        PrecioUnitario: producto.Precio, 
        Subtotal: producto.Precio 
      }]);
    }
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.ProductoId !== id));
  };

  const registrarVenta = async () => {
    if (carrito.length === 0) return alert('Añade al menos un producto al carrito.');
    
    const Subtotal = carrito.reduce((acc, item) => acc + item.Subtotal, 0);
    const IVA = Subtotal * 0.16; // Calculando el 16% de IVA
    const Total = Subtotal + IVA;

    try {
      await axios.post('http://localhost:3001/api/ventas', {
        ClienteId: clienteId || null,
        UsuarioId: usuarioId,
        Subtotal,
        IVA,
        Total,
        detalle: carrito
      });
      alert('✅ Venta registrada exitosamente');
      setCarrito([]);
      setClienteId('');
      cargarDatos(); // Actualiza el stock visualmente
    } catch (error) {
      alert('Error al registrar la venta. Revisa la consola.');
    }
  };

  return (
    <div className="card">
      <div className="flex-row">
        
        {/* Lado izquierdo: Lista de productos */}
        <div style={{ flex: 2 }}>
          <h2>🏷️ Productos Disponibles</h2>
          <div className="grid">
            {articulos.map(a => (
              <div key={a.Id} className="item-card">
                <h4 style={{ fontSize: '1.1rem' }}>{a.Nombre}</h4>
                <p><strong>${a.Precio}</strong></p>
                <p style={{ color: a.Stock > 0 ? 'green' : 'red' }}>Stock: {a.Stock}</p>
                <button 
                  className="btn" 
                  style={{ marginTop: '10px' }} 
                  onClick={() => agregarAlCarrito(a)} 
                  disabled={a.Stock === 0}
                >
                  {a.Stock === 0 ? "Agotado" : "Agregar"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lado derecho: Carrito de Compras */}
        <div style={{ flex: 1, background: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
          <h2>🧾 Detalle de Venta</h2>
          
          <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={{ margin: '15px 0' }}>
            <option value="">Cliente: Público General</option>
            {clientes.map(c => <option key={c.Id} value={c.Id}>{c.Nombre}</option>)}
          </select>

          <div style={{ minHeight: '150px', borderBottom: '2px solid #ccc', marginBottom: '15px' }}>
            {carrito.length === 0 ? <p style={{ color: 'gray' }}>El carrito está vacío...</p> : null}
            
            {carrito.map(c => (
              <div key={c.ProductoId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', background: 'white', padding: '8px', borderRadius: '4px' }}>
                <span><strong>{c.Cantidad}x</strong> {c.Nombre}</span>
                <span>
                  ${c.Subtotal.toFixed(2)} 
                  <button onClick={() => quitarDelCarrito(c.ProductoId)} className="btn-danger" style={{ padding: '2px 8px', marginLeft: '10px', width: 'auto' }}>X</button>
                </span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right', fontSize: '1.1rem' }}>
            <p>Subtotal: <strong>${carrito.reduce((acc, item) => acc + item.Subtotal, 0).toFixed(2)}</strong></p>
            <p>IVA (16%): <strong>${(carrito.reduce((acc, item) => acc + item.Subtotal, 0) * 0.16).toFixed(2)}</strong></p>
            <h2 style={{ color: '#2d6a4f', marginTop: '10px' }}>
              Total: ${(carrito.reduce((acc, item) => acc + item.Subtotal, 0) * 1.16).toFixed(2)}
            </h2>
          </div>

          <button className="btn" style={{ marginTop: '20px', width: '100%', fontSize: '1.1rem', padding: '15px' }} onClick={registrarVenta}>
            💰 Cobrar Venta
          </button>
        </div>

      </div>
    </div>
  );
}