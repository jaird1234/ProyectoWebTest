import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardCliente({ usuario }) {
  const [misPedidos, setMisPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    axios.get(`/api/pedidos/cliente/${usuario.Id}`)
      .then(res => setMisPedidos(res.data))
      .catch(err => console.error('Error al cargar pedidos:', err));
  }, [usuario.Id]);

  const pedidosFiltrados = misPedidos.filter(p =>
    p.Id.toString().includes(busqueda.trim()) ||
    p.Estado.toLowerCase().includes(busqueda.toLowerCase().trim())
  );

  return (
    <div className="dashboard-layout" style={{ display: 'block' }}>
      
      {/* PERFIL DEL CLIENTE */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>👤 Mi Perfil</h2>

        <p>
          <strong>Nombre:</strong> {usuario.NombreCompleto}
        </p>

        <p>
          <strong>Usuario:</strong> {usuario.Usuario}
        </p>

        <p>
          <strong>Dirección Principal:</strong>
          {' '}
          {usuario.Calle} #{usuario.Numero},
          {' '}
          {usuario.Colonia},
          {' '}
          {usuario.Municipio},
          {' '}
          CP {usuario.CodigoPostal}
        </p>

        <p>
          <strong>Teléfono:</strong>
          {' '}
          {usuario.Telefono || 'No registrado'}
        </p>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <input
        type="text"
        placeholder="🔍 Buscar por folio o estado..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          fontSize: '16px',
          boxSizing: 'border-box'
        }}
      />

      {/* PEDIDOS */}
      <div className="card">
        <h3>🛍️ Mis Pedidos Anteriores</h3>

        {misPedidos.length === 0 ? (
          <p>Aún no has realizado pedidos.</p>
        ) : (
          <>
            {pedidosFiltrados.length === 0 && (
              <p style={{ color: 'gray', marginTop: '10px' }}>
                No se encontraron pedidos.
              </p>
            )}

            {pedidosFiltrados.length > 0 && (
              <table
                style={{
                  width: '100%',
                  marginTop: '15px',
                  textAlign: 'left',
                  borderCollapse: 'collapse'
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '10px' }}>Folio</th>
                    <th>Fecha</th>
                    <th>Horario Solicitado</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.map(p => (
                    <tr
                      key={p.Id}
                      style={{
                        borderBottom: '1px solid var(--border-color)'
                      }}
                    >
                      <td style={{ padding: '10px' }}>
                        #{p.Id}
                      </td>

                      <td>
                        {new Date(p.Fecha).toLocaleDateString()}
                      </td>

                      <td style={{ color: 'var(--primary-color)' }}>
                        {p.HorarioEntrega}
                      </td>

                      <td>
                        ${p.Total.toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={
                            p.Estado === 'Entregado'
                              ? 'badge badge-success'
                              : 'badge badge-progress'
                          }
                        >
                          {p.Estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}